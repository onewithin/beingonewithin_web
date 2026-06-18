'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import { generateQrAction, setQrAuthCookiesAction } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'

type QrState = 'idle' | 'loading' | 'ready' | 'scanned' | 'expired' | 'error'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'
const QR_LIFETIME_MS = 5 * 60 * 1000 // 5 minutes

function MeditationIcon() {
    return (
        <svg viewBox="0 0 80 80" width="64" height="64" fill="none" aria-hidden="true">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                <line key={deg} x1="40" y1="10" x2="40" y2="4" stroke="#1f5d57" strokeWidth="2.5" strokeLinecap="round" transform={`rotate(${deg} 40 40)`} />
            ))}
            <circle cx="40" cy="40" r="22" stroke="#1f5d57" strokeWidth="2.5" />
            <circle cx="40" cy="27" r="4.5" stroke="#1f5d57" strokeWidth="2.5" />
            <path d="M33 50 Q40 42 47 50" stroke="#1f5d57" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M27 50 Q33 46 40 48 Q47 46 53 50" stroke="#1f5d57" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </svg>
    )
}

function CountdownRing({ secondsLeft, total }: { secondsLeft: number; total: number }) {
    const radius = 54
    const circumference = 2 * Math.PI * radius
    const progress = secondsLeft / total
    const dashOffset = circumference * (1 - progress)
    const isLow = secondsLeft <= 60

    return (
        <svg width="124" height="124" className="absolute -top-[14px] -left-[14px]" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="62" cy="62" r={radius} fill="none" stroke="#DDF3E5" strokeWidth="4" />
            <circle
                cx="62" cy="62" r={radius}
                fill="none"
                stroke={isLow ? '#f59e0b' : '#1f5d57'}
                strokeWidth="4"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s' }}
            />
        </svg>
    )
}

export default function QrLoginPage() {
    const router = useRouter()
    const [qrState, setQrState] = useState<QrState>('idle')
    const [qrToken, setQrToken] = useState<string | null>(null)
    const [secondsLeft, setSecondsLeft] = useState(300)
    const [errorMessage, setErrorMessage] = useState('')
    const sseRef = useRef<EventSource | null>(null)
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const expireTimeRef = useRef<number>(0)

    const closeSse = () => {
        sseRef.current?.close()
        sseRef.current = null
    }

    const stopTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
        }
    }

    const startCountdown = (expiresAt: string) => {
        stopTimer()
        expireTimeRef.current = new Date(expiresAt).getTime()

        const tick = () => {
            const remaining = Math.max(0, Math.floor((expireTimeRef.current - Date.now()) / 1000))
            setSecondsLeft(remaining)
            if (remaining <= 0) {
                stopTimer()
                closeSse()
                setQrState('expired')
            }
        }

        tick()
        timerRef.current = setInterval(tick, 1000)
    }

    const connectSse = useCallback((token: string) => {
        closeSse()
        const es = new EventSource(`${BACKEND_URL}/api/user/qr/sse?token=${encodeURIComponent(token)}`)
        sseRef.current = es

        es.addEventListener('qr-scanned', async (e) => {
            try {
                const data = JSON.parse(e.data) as {
                    success: boolean
                    token?: string
                    refreshToken?: string
                }
                if (data.success && data.token && data.refreshToken) {
                    stopTimer()
                    closeSse()
                    setQrState('scanned')
                    await setQrAuthCookiesAction(data.token, data.refreshToken)
                    router.replace('/home')
                }
            } catch {
                // ignore parse errors
            }
        })

        es.onerror = () => {
            // SSE connection dropped — ignore if already scanned/expired
        }
    }, [router])

    const generateQr = useCallback(async () => {
        setQrState('loading')
        setErrorMessage('')
        closeSse()
        stopTimer()

        const result = await generateQrAction()

        if (!result.success || !result.qrToken || !result.expiresAt) {
            setQrState('error')
            setErrorMessage(result.message || 'Failed to generate QR code.')
            return
        }

        setQrToken(result.qrToken)
        setQrState('ready')
        startCountdown(result.expiresAt)
        connectSse(result.qrToken)
    }, [connectSse]) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        generateQr()
        return () => {
            closeSse()
            stopTimer()
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60)
        const s = secs % 60
        return `${m}:${s.toString().padStart(2, '0')}`
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center px-4 sm:px-6 py-10"
            style={{ background: 'linear-gradient(135deg, #d8f0e3 0%, #edf7f0 40%, #f8fbfa 100%)' }}
        >
            <div className="w-full max-w-[480px] mx-auto flex flex-col items-center gap-8">

                {/* Header */}
                <div className="flex flex-col items-center gap-3 text-center">
                    <MeditationIcon />
                    <h1 className="text-[1.75rem] leading-[2.125rem] text-primary font-poppins-600">
                        Sign in with QR
                    </h1>
                    <p className="text-[0.9375rem] text-[#484848] font-poppins-400 max-w-[20rem]">
                        Scan this code with the Prana mobile app to log in instantly.
                    </p>
                </div>

                {/* QR Card */}
                <div className="bg-white rounded-[1.875rem] shadow-md p-8 w-full flex flex-col items-center gap-6">
                    {qrState === 'loading' && (
                        <div className="w-[200px] h-[200px] flex items-center justify-center">
                            <span className="h-10 w-10 rounded-full border-4 border-secondary border-r-transparent animate-spin" />
                        </div>
                    )}

                    {qrState === 'ready' && qrToken && (
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative">
                                {/* QR code with padding + logo overlay */}
                                <div className="border-4 border-[#DDF3E5] rounded-2xl p-3 bg-white relative">
                                    <QRCodeSVG
                                        value={qrToken}
                                        size={196}
                                        bgColor="#ffffff"
                                        fgColor="#1f5d57"
                                        level="M"
                                        imageSettings={{
                                            src: '/icons/flower1.png',
                                            height: 28,
                                            width: 28,
                                            excavate: true,
                                        }}
                                    />
                                </div>

                                {/* Countdown ring around the card */}
                                <CountdownRing secondsLeft={secondsLeft} total={300} />
                            </div>

                            <p className={`font-poppins-600 text-[0.875rem] ${secondsLeft <= 60 ? 'text-amber-500' : 'text-secondary'}`}>
                                Expires in {formatTime(secondsLeft)}
                            </p>
                        </div>
                    )}

                    {qrState === 'scanned' && (
                        <div className="w-[200px] h-[200px] flex flex-col items-center justify-center gap-3">
                            <div className="w-16 h-16 rounded-full bg-[#DDF3E5] flex items-center justify-center">
                                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                                    <path d="M6 16L13 23L26 9" stroke="#1f5d57" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <p className="font-poppins-600 text-secondary text-center">QR scanned! Signing you in…</p>
                        </div>
                    )}

                    {(qrState === 'expired' || qrState === 'error') && (
                        <div className="w-[200px] h-[200px] flex flex-col items-center justify-center gap-3">
                            <div className="w-16 h-16 rounded-full bg-[#FEF3C7] flex items-center justify-center">
                                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                                    <path d="M16 10V17" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
                                    <circle cx="16" cy="22" r="1.5" fill="#f59e0b" />
                                    <circle cx="16" cy="16" r="12" stroke="#f59e0b" strokeWidth="2.5" />
                                </svg>
                            </div>
                            <p className="font-poppins-600 text-amber-600 text-center text-[0.875rem]">
                                {qrState === 'expired' ? 'QR code expired' : (errorMessage || 'Something went wrong')}
                            </p>
                        </div>
                    )}

                    {/* Instructions */}
                    {qrState === 'ready' && (
                        <ol className="text-[0.8125rem] font-poppins-400 text-[#484848] space-y-2 list-none w-full">
                            {[
                                'Open the Prana app on your phone',
                                'Go to Profile → Scan QR Code',
                                'Point your camera at this code',
                            ].map((step, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#DDF3E5] text-secondary font-poppins-600 text-[0.6875rem] flex items-center justify-center mt-0.5">
                                        {i + 1}
                                    </span>
                                    <span>{step}</span>
                                </li>
                            ))}
                        </ol>
                    )}

                    {/* Refresh button */}
                    {(qrState === 'expired' || qrState === 'error') && (
                        <Button
                            onClick={generateQr}
                            className="w-full h-12 bg-secondary hover:bg-[#174d48] text-white font-poppins-600 text-[0.9375rem] rounded-xl"
                        >
                            Generate New QR Code
                        </Button>
                    )}
                </div>

                {/* Footer nav */}
                <div className="flex flex-col items-center gap-2 text-[0.8125rem] font-poppins-400">
                    <Link href="/sign-in" className="text-secondary font-poppins-600 underline">
                        Sign in with email instead
                    </Link>
                    <p className="text-[#7E7E7E]">
                        Don&apos;t have an account?{' '}
                        <Link href="/personal-info" className="text-secondary font-poppins-600 underline">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
