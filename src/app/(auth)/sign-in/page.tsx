'use client'

import React, { useEffect, useState } from 'react'
import { useRef } from 'react'
import { useRouter } from 'next/navigation'
import { checkEmailAction, loginAction, oauthAuthenticateAction, resendOtpAction, verifyOtpAction } from '@/lib/actions/auth'
import { authenticateWithApple, authenticateWithGoogle, SocialProvider } from '@/lib/client/social-auth'
import EmailForm from '@/app/(onboarding)/introduction/_components/email-form'
import Link from 'next/link'
import QuestionCard from '@/app/(onboarding)/introduction/_components/questionCard'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

function MeditationIcon() {
    return (
        <svg viewBox="0 0 80 80" width="80" height="80" fill="none" aria-hidden="true">
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

// ── Main sign-in page ─────────────────────────────────────────────────────────

export default function SignIn() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isOtpStep, setIsOtpStep] = useState(false)
    const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', ''])
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)
    const [isResendingOtp, setIsResendingOtp] = useState(false)
    const [socialAuthLoadingProvider, setSocialAuthLoadingProvider] = useState<SocialProvider | null>(null)
    const [otpMessage, setOtpMessage] = useState('')
    const [error, setError] = useState('')
    const otpInputs = useRef<(HTMLInputElement | null)[]>([])

    useEffect(() => {
        let isMounted = true

        const redirectIfAuthenticated = async () => {
            try {
                const response = await fetch('/api/subscription-status', {
                    method: 'GET',
                    cache: 'no-store',
                })

                if (!isMounted) return
                if (response.ok) {
                    router.replace('/home')
                }
            } catch {
                // If this fails, user remains on sign-in and can continue auth flow.
            }
        }

        redirectIfAuthenticated()

        return () => {
            isMounted = false
        }
    }, [router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!email.trim()) {
            setError('This field is required')
            return
        }

        setIsLoading(true)

        const { exists, error: checkError } = await checkEmailAction(email)
        if (checkError) {
            setError(checkError)
            setIsLoading(false)
            return
        }

        if (!exists) {
            setError('No account found. New here? Begin your journey below.')
            setIsLoading(false)
            return
        }

        const result = await loginAction(email)
        setIsLoading(false)

        if (!result.success) {
            setError(result.message)
            return
        }

        setIsOtpStep(true)
        setOtpMessage('A 6-digit code has been sent to your email.')
        setOtpDigits(['', '', '', '', '', ''])
    }

    const handleGoogleClick = async () => {
        if (socialAuthLoadingProvider) return

        setError('')
        setSocialAuthLoadingProvider('google')

        try {
            const identity = await authenticateWithGoogle()
            const result = await oauthAuthenticateAction({
                provider: 'google',
                idToken: identity.idToken,
                email: identity.email,
                name: identity.name,
                image: identity.image,
                isLogin: true,
            })

            if (!result.success) {
                setError(result.message)
                return
            }

            router.replace('/home')
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Google sign-in failed. Please try again.'
            setError(message)
        } finally {
            setSocialAuthLoadingProvider(null)
        }
    }

    const handleAppleClick = async () => {
        if (socialAuthLoadingProvider) return

        setError('')
        setSocialAuthLoadingProvider('apple')

        try {
            const identity = await authenticateWithApple()
            const result = await oauthAuthenticateAction({
                provider: 'apple',
                idToken: identity.idToken,
                email: identity.email,
                name: identity.name,
                image: identity.image,
                isLogin: true,
            })

            if (!result.success) {
                setError(result.message)
                return
            }

            router.replace('/home')
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Apple sign-in failed. Please try again.'
            setError(message)
        } finally {
            setSocialAuthLoadingProvider(null)
        }
    }

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return
        const next = [...otpDigits]
        next[index] = value.slice(-1)
        setOtpDigits(next)
        setError('')
        setOtpMessage('')
        if (value && index < 5) {
            otpInputs.current[index + 1]?.focus()
        }
    }

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
            otpInputs.current[index - 1]?.focus()
        }
    }

    const handleOtpPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
        e.preventDefault()
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
        if (pasted.length === 6) {
            setOtpDigits(pasted.split(''))
            otpInputs.current[5]?.focus()
        }
    }

    const handleVerifyOtp = async () => {
        const otp = otpDigits.join('')
        if (otp.length !== 6) {
            setError('Please enter all 6 digits.')
            return
        }

        setIsVerifyingOtp(true)
        setError('')

        const result = await verifyOtpAction(otp)
        setIsVerifyingOtp(false)

        if (!result.success) {
            setError(result.message)
            return
        }

        if (result.isNewUser) {
            router.replace('/onboarding-setup')
            return
        }

        router.replace('/home')
    }

    const handleResendOtp = async () => {
        setIsResendingOtp(true)
        setError('')
        setOtpMessage('')

        const result = await resendOtpAction()
        setIsResendingOtp(false)

        if (!result.success) {
            setError(result.message)
            return
        }

        setOtpDigits(['', '', '', '', '', ''])
        otpInputs.current[0]?.focus()
        setOtpMessage('A new code has been sent to your email.')
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center px-4 sm:px-6 py-6 sm:py-10"
            style={{ background: 'linear-gradient(135deg, #d8f0e3 0%, #edf7f0 40%, #f8fbfa 100%)' }}
        >
            <div className="w-full md:max-w-[600px] lg:max-w-[800px] xl:max-w-[1000px] 2xl:max-w-[1200px] flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-10 lg:gap-16">

                {/* ── Left: form ─────────────────────────────────────────── */}
                <div className="w-full max-w-[480px] mx-auto lg:mx-0 flex flex-col gap-6">
                    {!isOtpStep ? (
                        <EmailForm
                            email={email}
                            onChange={(value) => {
                                setEmail(value)
                                setError('')
                            }}
                            showSubmitArrow={false}
                            error={error}
                            onSubmit={handleSubmit}
                            isLoading={isLoading}
                            submitLabel="Log in"
                            showSocialAuth
                            socialAuthLoadingProvider={socialAuthLoadingProvider}
                            onGoogleClick={handleGoogleClick}
                            onAppleClick={handleAppleClick}
                            footer={(
                                <p className="font-poppins-400 text-[0.8125rem] text-center lg:text-left">
                                    Don't have an account?{' '}
                                    <Link href="/personal-info" className="font-poppins-600 text-secondary underline">
                                        Sign up
                                    </Link>
                                </p>
                            )}
                        />
                    ) : (
                        <div className="w-full flex flex-col items-center lg:items-start">
                            <h1 className="text-[1.75rem] sm:text-[2rem] leading-[2.125rem] sm:leading-[2.375rem] max-w-[25rem] text-primary tracking-normal text-center lg:text-left">
                                Confirm your email
                            </h1>
                            <p className="text-black my-2 text-[0.9375rem] sm:text-[1rem] text-center lg:text-left">
                                Please enter the code sent to your inbox at {email}.
                            </p>

                            <div className="flex gap-2 sm:gap-3 justify-center lg:justify-start mt-4" onPaste={handleOtpPaste}>
                                {otpDigits.map((digit, i) => (
                                    <input
                                        key={i}
                                        ref={(el) => { otpInputs.current[i] = el }}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(i, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                        className="w-11 h-12 sm:w-12 sm:h-14 text-center text-[1.25rem] sm:text-[1.375rem] font-poppins-600 text-secondary border-2 border-[#DDF3E5] rounded-xl focus:outline-none focus:border-[color:var(--secondary)] bg-white"
                                        disabled={isVerifyingOtp}
                                    />
                                ))}
                            </div>

                            {error && (
                                <p className="text-red-500 mt-2 text-[0.625rem] text-center lg:text-left font-poppins-400">{error}</p>
                            )}
                            {otpMessage && !error && (
                                <p className="text-green-600 mt-2 text-[0.625rem] text-center lg:text-left font-poppins-400">{otpMessage}</p>
                            )}

                            <Button
                                className="h-12 mt-4 bg-secondary hover:bg-landing-button-hover text-white font-poppins-600 text-[0.9375rem] rounded-xl w-full md:w-[20.9375rem]"
                                onClick={handleVerifyOtp}
                                disabled={isVerifyingOtp || otpDigits.join('').length < 6}
                            >
                                {isVerifyingOtp ? 'Verifying…' : 'Verify OTP'}
                            </Button>

                            <p className="font-poppins-400 text-[0.8125rem] mt-3 text-center lg:text-left">
                                Didn&apos;t receive a code?{' '}
                                <button
                                    onClick={handleResendOtp}
                                    disabled={isResendingOtp}
                                    className="font-poppins-600 text-secondary underline disabled:opacity-50">
                                    {isResendingOtp ? 'Sending…' : 'Resend OTP'}
                                </button>
                            </p>

                            <button
                                onClick={() => {
                                    setIsOtpStep(false)
                                    setOtpDigits(['', '', '', '', '', ''])
                                    setError('')
                                    setOtpMessage('')
                                }}
                                className="mt-2 text-[0.75rem] font-poppins-600 text-secondary underline"
                            >
                                Change email
                            </button>
                        </div>
                    )}
                </div>

                {/* ── Right: QuestionCard ─────────────────────────────────── */}
                <div className="hidden lg:flex justify-center">
                    <QuestionCard
                        title="Calm Voices That Truly Soothe"
                        showButton={false}
                        description="Our audio is crafted with therapeutic voices and tones designed to emotionally ease your mind."
                        image={<Image src={'/icons/meditation-2.png'} height={100} width={100} alt="icon" />}
                    />
                </div>
            </div>
        </div>
    )
}
