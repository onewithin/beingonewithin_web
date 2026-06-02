'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createPortal } from 'react-dom'

export default function PaymentResultPopup() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [result, setResult] = useState<'success' | 'cancel' | null>(null)

    useEffect(() => {
        const payment = searchParams.get('payment')
        if (payment === 'success' || payment === 'cancel') {
            setResult(payment)
            // Clean the URL without reloading the page
            const url = new URL(window.location.href)
            url.searchParams.delete('payment')
            url.searchParams.delete('session_id')
            window.history.replaceState({}, '', url.toString())
        }
    }, [searchParams])

    const onClose = () => setResult(null)

    if (!result) return null

    const isSuccess = result === 'success'

    const modal = (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
            <div className="relative w-[90%] max-w-sm rounded-[30px] bg-white p-6 shadow-2xl flex flex-col items-center">
                {/* Icon */}
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isSuccess ? 'bg-[#DDF3E5]' : 'bg-[#FFE8E6]'}`}>
                    <span className="text-3xl">{isSuccess ? '🎉' : '😕'}</span>
                </div>

                {/* Title */}
                <h2 className="font-sniglet-400 text-[1.25rem] text-[#1F5D57] text-center">
                    {isSuccess ? 'Payment Successful!' : 'Payment Cancelled'}
                </h2>

                {/* Message */}
                <p className="mt-3 font-poppins-400 text-[0.875rem] text-[#484848] text-center leading-relaxed">
                    {isSuccess
                        ? 'Your subscription is being activated. It may take a few moments to reflect. Enjoy your premium access!'
                        : 'Your payment was not completed. You can try again anytime.'}
                </p>

                {/* Button */}
                <button
                    type="button"
                    onClick={isSuccess ? () => router.push('/home') : onClose}
                    className="mt-6 w-full rounded-2xl bg-[#1F5D57] py-3 font-poppins-600 text-white text-[0.9375rem] hover:bg-[#174d48] transition-colors"
                >
                    {isSuccess ? 'Go to Home' : 'Try Again'}
                </button>

                {isSuccess && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="mt-3 font-poppins-400 text-[0.875rem] text-[#484848] hover:underline"
                    >
                        Stay on Plans
                    </button>
                )}
            </div>
        </div>
    )

    return createPortal(modal, document.body)
}
