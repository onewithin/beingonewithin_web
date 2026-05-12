'use client'

import React, { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { verifyOtpAction, resendOtpAction } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

export default function VerifyOtp() {
    const router = useRouter()
    const [digits, setDigits] = useState(['', '', '', '', '', ''])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [resendMsg, setResendMsg] = useState('')
    const [resendLoading, setResendLoading] = useState(false)
    const inputs = useRef<(HTMLInputElement | null)[]>([])

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return
        const newDigits = [...digits]
        newDigits[index] = value.slice(-1)
        setDigits(newDigits)
        setError('')
        setResendMsg('')
        if (value && index < 5) {
            inputs.current[index + 1]?.focus()
        }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !digits[index] && index > 0) {
            inputs.current[index - 1]?.focus()
        }
    }

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault()
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
        if (pasted.length === 6) {
            setDigits(pasted.split(''))
            inputs.current[5]?.focus()
        }
    }

    const handleVerify = async () => {
        const otp = digits.join('')
        if (otp.length < 6) {
            setError('Please enter all 6 digits.')
            return
        }

        setIsLoading(true)
        setError('')

        const result = await verifyOtpAction(otp)
        setIsLoading(false)

        if (!result.success) {
            setError(result.message)
            setDigits(['', '', '', '', '', ''])
            inputs.current[0]?.focus()
            return
        }

        if (result.isNewUser) {
            router.replace('/onboarding-setup')
            return
        }

        router.replace('/home')
    }

    const handleResend = async () => {
        setResendLoading(true)
        setError('')
        setResendMsg('')
        const result = await resendOtpAction()
        setResendLoading(false)
        if (result.success) {
            setResendMsg('A new code has been sent. Check your inbox.')
            setDigits(['', '', '', '', '', ''])
            inputs.current[0]?.focus()
        } else {
            setError(result.message)
        }
    }

    return (
        <div className="h-screen bg-gradient-to-b from-[#E5F2D6] to-[#FFFFFF] flex items-center justify-center">
            <div className="p-6 max-w-sm w-full flex flex-col items-center text-center space-y-6">
                <Image src="/icons/logo.png" height={72} width={72} alt="beingOnwith" />

                <div>
                    <h1 className="text-[28px] font-poppins-600 text-[#1F5D57]">
                        Check your email
                    </h1>
                    <p className="font-poppins-400 text-[14px] text-[#484848] mt-2">
                        We sent a 6-digit code to your email address.
                        <br />Enter it below to continue.
                    </p>
                </div>

                {/* OTP digit boxes */}
                <div className="flex gap-3 justify-center" onPaste={handlePaste}>
                    {digits.map((digit, i) => (
                        <input
                            key={i}
                            ref={(el) => { inputs.current[i] = el }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(i, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(i, e)}
                            className="w-12 h-14 text-center text-[22px] font-poppins-600 text-[#1F5D57] border-2 border-[#DDF3E5] rounded-xl focus:outline-none focus:border-[#1F5D57] bg-white transition-colors"
                            disabled={isLoading}
                        />
                    ))}
                </div>

                {error && (
                    <p className="text-red-500 text-sm font-poppins-400">{error}</p>
                )}
                {resendMsg && (
                    <p className="text-green-600 text-sm font-poppins-400">{resendMsg}</p>
                )}

                <Button
                    className="bg-[#1F5D57] w-full p-5 font-poppins-600 text-[16px]"
                    onClick={handleVerify}
                    disabled={isLoading || digits.join('').length < 6}
                >
                    {isLoading ? 'Verifying…' : 'Verify'}
                </Button>

                <p className="font-poppins-400 text-[14px] text-[#484848]">
                    Didn&apos;t receive a code?{' '}
                    <button
                        onClick={handleResend}
                        disabled={resendLoading}
                        className="font-poppins-600 text-[#1F5D57] underline disabled:opacity-50"
                    >
                        {resendLoading ? 'Sending…' : 'Resend OTP'}
                    </button>
                </p>
            </div>
        </div>
    )
}
