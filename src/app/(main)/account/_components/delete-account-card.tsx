'use client'

import React from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    generateDeleteAccountOtpAction,
    verifyOtpAndDeleteAccountAction,
} from '@/lib/actions/profile'
import { useRouter } from 'next/navigation'

export default function DeleteAccountCard() {
    const router = useRouter()
    const [otp, setOtp] = React.useState('')
    const [statusMessage, setStatusMessage] = React.useState('')
    const [otpSent, setOtpSent] = React.useState(false)
    const [isGenerating, setIsGenerating] = React.useState(false)
    const [isDeleting, setIsDeleting] = React.useState(false)

    const onGenerateOtp = async () => {
        setIsGenerating(true)
        const response = await generateDeleteAccountOtpAction()
        setIsGenerating(false)
        setStatusMessage(response.message)

        if (response.success) {
            setOtpSent(true)
        }
    }

    const onDeleteAccount = async () => {
        setIsDeleting(true)
        const response = await verifyOtpAndDeleteAccountAction(otp)
        setIsDeleting(false)
        setStatusMessage(response.message)

        if (response.success) {
            router.replace('/sign-in')
        }
    }

    return (
        <div id="danger-zone" className="bg-white border border-red-200 rounded-2xl shadow-sm p-5 mt-5 space-y-4">
            <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                    <p className="text-red-600 font-poppins-600">Danger Zone</p>
                    <p className="text-xs text-[#7A8A86] mt-1">
                        Delete account requires OTP verification and cannot be undone.
                    </p>
                </div>
            </div>

            <Button
                type="button"
                variant="outline"
                onClick={onGenerateOtp}
                disabled={isGenerating}
                className="w-full border-red-200 text-red-600 hover:text-red-700"
            >
                {isGenerating ? 'Sending OTP...' : 'Send OTP for Account Deletion'}
            </Button>

            {otpSent && (
                <div className="space-y-3">
                    <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={otp}
                        onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))}
                        placeholder="Enter 6-digit OTP"
                        className="w-full border border-[#E8F0EE] rounded-xl px-3 py-2 text-sm"
                    />

                    <Button
                        type="button"
                        onClick={onDeleteAccount}
                        disabled={isDeleting || otp.length !== 6}
                        className="w-full bg-red-600 hover:bg-red-700 text-white"
                    >
                        {isDeleting ? 'Deleting account...' : 'Verify OTP and Delete Account'}
                    </Button>
                </div>
            )}

            {statusMessage && (
                <p className="text-xs text-[#6D7A76]">{statusMessage}</p>
            )}
        </div>
    )
}
