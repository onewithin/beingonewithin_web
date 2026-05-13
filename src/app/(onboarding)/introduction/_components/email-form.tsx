import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import React from 'react'
import { MoveRight } from 'lucide-react'

interface EmailFormProps {
    email: string
    onChange: (value: string) => void
    error?: string
    onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void
    isLoading?: boolean
    submitDisabled?: boolean
    submitLabel?: string
    showSocialAuth?: boolean
    onGoogleClick?: () => void
    onAppleClick?: () => void
    footer?: React.ReactNode
    showSubmitArrow?: boolean
}

function GoogleIcon() {
    return (
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
    )
}

function AppleIcon() {
    return (
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.4.07 2.38.74 3.2.8 1.2-.24 2.36-.93 3.64-.84 1.56.12 2.73.72 3.5 1.84-3.2 1.92-2.44 5.98.56 7.13-.57 1.38-1.3 2.74-2.9 3.95zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
        </svg>
    )
}

function EmailForm({
    email,
    onChange,
    error,
    onSubmit,
    isLoading = false,
    submitDisabled = false,
    submitLabel = 'Log in',
    showSocialAuth = false,
    onGoogleClick,
    onAppleClick,
    footer,
    showSubmitArrow = true,
}: EmailFormProps) {
    const errorTextClass = 'text-red-500 mt-1 text-[10px] text-center lg:text-left font-poppins-400'

    return (
        <div className="font-poppins-400 font-normal p-7 lg:p-0 flex w-full flex-col justify-center items-center lg:block">
            <h1 className="text-[28px] sm:text-[32px] leading-[34px] sm:leading-[38px] max-w-[400px] text-primary tracking-normal text-center lg:text-left">
                {submitLabel === "Register" ? "Let us know where to send your calm" : "Let's get you set up"}
            </h1>
            <p className='text-[#000000] my-2 text-[15px] sm:text-[16px] text-center lg:text-left'>
                Sign in to your account using Google, Apple, or verify your email to get started.
            </p>

            <div className='my-5  w-full mx-auto lg:mx-start'>
                {onSubmit ? (
                    <form className='flex flex-col items-center lg:items-start' onSubmit={onSubmit}>
                        <Input
                            type="email"
                            placeholder='Enter your email id'
                            value={email}
                            onChange={(e) => onChange(e.target.value)}
                            className='h-12 w-full md:w-[335px] text-[16px] bg-white border text-center border-[#F5F5F5] font-poppins-500'
                            autoComplete="email"
                            disabled={isLoading}
                        />
                        {error && (
                            <p className={errorTextClass}>{error}</p>
                        )}

                        <Button
                            type='submit'
                            className='h-12 mt-4 bg-[#1f5d57] hover:bg-[#184945] text-white font-poppins-600 text-[15px] rounded-xl w-full md:w-[335px]'
                            disabled={isLoading || submitDisabled}
                        >
                            {isLoading ? 'Sending code…' : submitLabel}
                            {!isLoading && showSubmitArrow && <MoveRight className='ml-2 !w-4 !h-4' />}
                        </Button>
                    </form>
                ) : (
                    <>
                        <Input
                            type="email"
                            placeholder='Enter your email id'
                            value={email}
                            onChange={(e) => onChange(e.target.value)}
                            className='w-full md:w-[335px] text-[16px] bg-white border text-center border-[#F5F5F5] font-poppins-500'
                            autoComplete="email"
                        />
                        {error && (
                            <p className={errorTextClass}>{error}</p>
                        )}

                    </>
                )}

                {showSocialAuth && (
                    <>
                        <div className="flex w-full items-center gap-3 my-4 lg:w-[335px]">
                            <div className="flex-1 h-px bg-[#c8dfd9]" />
                            <span className="font-poppins-400 text-[13px] text-[#7a9e97]">or continue with</span>
                            <div className="flex-1 h-px bg-[#c8dfd9]" />
                        </div>

                        <div className="flex w-full flex-col gap-3 lg:w-[335px]">
                            <button
                                type="button"
                                className="flex items-center justify-center gap-3 h-12 w-full rounded-xl border border-[#d0e8de] bg-white hover:bg-[#f3faf6] font-poppins-600 text-[15px] text-[#1e2b28] transition-colors"
                                onClick={onGoogleClick}
                            >
                                <GoogleIcon />
                                Continue with Google
                            </button>

                            <button
                                type="button"
                                className="flex items-center justify-center gap-3 h-12 w-full rounded-xl border border-[#d0e8de] bg-white hover:bg-[#f3faf6] font-poppins-600 text-[15px] text-[#1e2b28] transition-colors"
                                onClick={onAppleClick}
                            >
                                <AppleIcon />
                                Continue with Apple
                            </button>
                        </div>
                    </>
                )}

                {footer ? (
                    <div className='mt-3 text-center lg:text-left'>{footer}</div>
                ) : (
                    <p className='text-[#484848] mt-3 text-[12px] text-center lg:text-left font-poppins-400'>
                        Already have an account?{' '}
                        <Link href="/sign-in" className='font-poppins-600 text-[#1F5D57] underline'>
                            Sign in
                        </Link>
                    </p>
                )}
            </div>
        </div>
    )
}

export default EmailForm
