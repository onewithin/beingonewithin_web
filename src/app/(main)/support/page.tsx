'use client'

import Link from 'next/link'
import { ChevronLeft, Mail, MessageCircleQuestion, ShieldCheck } from 'lucide-react'
import React from 'react'
import { requestAccessHistoryAction } from '@/lib/actions/profile'
import { Button } from '@/components/ui/button'

const LAST_SAR_REQUEST_KEY = 'prana_last_sar_request_time'

function canRequestSarInBrowser(): { allowed: boolean; message?: string } {
    const lastRequestedAt = window.localStorage.getItem(LAST_SAR_REQUEST_KEY)
    if (!lastRequestedAt) return { allowed: true }

    const lastDate = new Date(lastRequestedAt)
    if (Number.isNaN(lastDate.getTime())) return { allowed: true }

    const hoursDiff = (Date.now() - lastDate.getTime()) / (1000 * 60 * 60)
    if (hoursDiff < 24) {
        return {
            allowed: false,
            message: 'You already requested access history. Please try again after 24 hours.',
        }
    }

    return { allowed: true }
}

export default function SupportPage() {
    const [statusMessage, setStatusMessage] = React.useState('')
    const [isRequestingSar, setIsRequestingSar] = React.useState(false)

    const onRequestAccessHistory = async () => {
        const check = canRequestSarInBrowser()
        if (!check.allowed) {
            setStatusMessage(check.message || 'Please try again later.')
            return
        }

        setIsRequestingSar(true)
        const response = await requestAccessHistoryAction()
        setIsRequestingSar(false)
        setStatusMessage(response.message)

        if (response.success) {
            window.localStorage.setItem(LAST_SAR_REQUEST_KEY, new Date().toISOString())
        }
    }

    return (
        <div className="min-h-screen bg-[#F8FBFA] px-4 py-5">
            <div className="w-full md:max-w-[640px] mx-auto">
                <div className="flex items-center gap-2 mb-5">
                    <Link
                        href="/profile"
                        className="bg-white p-1 rounded-lg border border-[#EDEDED]"
                        aria-label="Back to profile"
                    >
                        <ChevronLeft className="h-5 w-5 text-[#1F5D57]" />
                    </Link>
                    <h1 className="text-[#113C38] text-xl font-poppins-600">Contact Support</h1>
                </div>

                <div className="bg-white border border-[#E8F0EE] rounded-2xl shadow-sm p-5 space-y-4">
                    <div className="flex items-start gap-3">
                        <MessageCircleQuestion className="h-5 w-5 text-[#1F5D57] mt-1" />
                        <p className="text-[#1E2B28] font-poppins-500">
                            Need help with account changes, access history, or subscription support?
                        </p>
                    </div>

                    <a
                        href="mailto:support@prana.app"
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#1F5D57] text-white py-3 font-poppins-500"
                    >
                        <Mail className="h-4 w-4" />
                        Email support@prana.app
                    </a>

                    <div className="rounded-xl border border-[#E8F0EE] p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <ShieldCheck className="h-4 w-4 text-[#1F5D57]" />
                            <p className="font-poppins-600 text-[#1E2B28] text-sm">Request Access History (SAR)</p>
                        </div>
                        <p className="text-xs text-[#6D7A76] mb-3">
                            Submit a subject access request and we will prepare your report.
                        </p>
                        <Button onClick={onRequestAccessHistory} disabled={isRequestingSar} className="w-full">
                            {isRequestingSar ? 'Submitting request...' : 'Request Access History'}
                        </Button>
                    </div>

                    {statusMessage && (
                        <p className="text-xs text-[#1F5D57]">{statusMessage}</p>
                    )}

                    <p className="text-xs text-[#6D7A76]">
                        Include your registered email and a short description so our team can help quickly.
                    </p>
                </div>
            </div>
        </div>
    )
}
