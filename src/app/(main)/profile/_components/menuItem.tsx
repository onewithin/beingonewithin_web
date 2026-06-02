'use client'

import React from 'react'
import Link from 'next/link'
import { useFormStatus } from 'react-dom'
import { useRouter } from 'next/navigation'
import {
    ArrowRight,
    Bell,
    CreditCard,
    Download,
    FileText,
    Heart,
    History,
    HelpCircle,
    LogOut,
    Trash2,
    User
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    generateDeleteAccountOtpAction,
    generateSarRequestOtpAction,
    verifyOtpAndDeleteAccountAction,
    verifySarRequestWithOtpAction,
} from '@/lib/actions/profile'

const MenuRow = ({
    icon: Icon,
    label,
    showBadge = false,
    badgeText,
    bordered = true,
    href = '#'
}: {
    icon: React.ElementType
    label: string
    showBadge?: boolean
    badgeText?: string
    bordered?: boolean
    href?: string
}) => (
    <Link href={href}>
        <div className={`flex items-center justify-between p-4 ${bordered ? 'border-b border-[#f5f5f5]' : ''} hover:bg-gray-50 cursor-pointer`}>
            <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-[#484848]" />
                <span className="text-[#000000] font-medium">{label}</span>
            </div>
            <div className="flex items-center gap-2">
                {showBadge && (
                    <Badge className="border-[#f58e05]  border-2 text-[#f58e05] font-poppins-600 bg-transparent rounded-full">
                        {badgeText
                            ? `${badgeText.charAt(0).toUpperCase()}${badgeText.slice(1).toLowerCase()}`
                            : ''}
                    </Badge>
                )}
                <div className="border border-[#F5F5F5] rounded-lg flex justify-center items-center h-[26px] w-[26px]">
                    <ArrowRight className="h-4 w-4 text-[#013913]" />
                </div>
            </div>
        </div>
    </Link>
)

const ActionRow = ({
    icon: Icon,
    label,
    onClick,
    bordered = true,
    danger = false,
}: {
    icon: React.ElementType
    label: string
    onClick: () => void
    bordered?: boolean
    danger?: boolean
}) => (
    <button
        type="button"
        onClick={onClick}
        className={`w-full flex items-center justify-between p-4 ${bordered ? 'border-b border-[#f5f5f5]' : ''} hover:bg-gray-50 cursor-pointer`}
    >
        <div className="flex items-center gap-3">
            <Icon className={`h-5 w-5 ${danger ? 'text-red-600' : 'text-[#484848]'}`} />
            <span className={`font-medium ${danger ? 'text-red-600' : 'text-[#000000]'}`}>{label}</span>
        </div>
        <div className="border border-[#F5F5F5] rounded-lg flex justify-center items-center h-[26px] w-[26px]">
            <ArrowRight className={`h-4 w-4 ${danger ? 'text-red-600' : 'text-[#013913]'}`} />
        </div>
    </button>
)

function ConfirmSubmitButton({
    confirmLabel,
    destructive,
    confirmDisabled,
    isLoading,
}: {
    confirmLabel: string
    destructive: boolean
    confirmDisabled: boolean
    isLoading: boolean
}) {
    const { pending } = useFormStatus()
    const showLoading = pending || isLoading

    return (
        <Button
            type="submit"
            disabled={confirmDisabled || showLoading}
            className={`min-w-[120px] ${destructive ? 'bg-red-600 hover:bg-red-700 text-white' : ''}`}
        >
            <span className="inline-flex items-center gap-2">
                {showLoading && (
                    <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-r-transparent animate-spin" />
                )}
                {pending ? 'Please wait...' : confirmLabel}
            </span>
        </Button>
    )
}

function ConfirmModal({
    open,
    title,
    description,
    cancelLabel,
    confirmLabel,
    onClose,
    action,
    onConfirm,
    destructive = false,
    isLoading = false,
    confirmDisabled = false,
    statusMessage,
}: {
    open: boolean
    title: string
    description: string
    cancelLabel: string
    confirmLabel: string
    onClose: () => void
    action?: (formData: FormData) => void | Promise<void>
    onConfirm?: () => void | Promise<void>
    destructive?: boolean
    isLoading?: boolean
    confirmDisabled?: boolean
    statusMessage?: string
}) {
    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
                <h3 className="text-lg font-poppins-600 text-[#0E0E0E]">{title}</h3>
                <p className="mt-2 text-sm text-[#5A5A5A]">{description}</p>
                {statusMessage && (
                    <p className="mt-2 text-xs text-[#6D7A76]">{statusMessage}</p>
                )}
                <div className="mt-5 flex items-center justify-end gap-3">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                        {cancelLabel}
                    </Button>
                    {onConfirm ? (
                        <Button
                            type="button"
                            onClick={onConfirm}
                            disabled={confirmDisabled || isLoading}
                            className={`min-w-[120px] ${destructive ? 'bg-red-600 hover:bg-red-700 text-white' : ''}`}
                        >
                            <span className="inline-flex items-center gap-2">
                                {isLoading && (
                                    <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-r-transparent animate-spin" />
                                )}
                                {confirmLabel}
                            </span>
                        </Button>
                    ) : (
                        <form action={action}>
                            <ConfirmSubmitButton
                                confirmLabel={confirmLabel}
                                destructive={destructive}
                                confirmDisabled={confirmDisabled}
                                isLoading={isLoading}
                            />
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}

function OtpVerifyModal({
    open,
    title = 'Verify OTP',
    description = 'Enter the 6-digit OTP sent to your registered email to continue.',
    verifyLabel = 'Verify OTP',
    otp,
    setOtp,
    statusMessage,
    onClose,
    onVerify,
    isLoading,
}: {
    open: boolean
    title?: string
    description?: string
    verifyLabel?: string
    otp: string
    setOtp: (value: string) => void
    statusMessage: string
    onClose: () => void
    onVerify: () => void
    isLoading: boolean
}) {
    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
                <h3 className="text-lg font-poppins-600 text-[#0E0E0E]">{title}</h3>
                <p className="mt-2 text-sm text-[#5A5A5A]">{description}</p>

                <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit OTP"
                    className="mt-4 w-full border border-[#E8F0EE] rounded-xl px-3 py-2 text-sm"
                />

                {statusMessage && (
                    <p className="mt-2 text-xs text-[#6D7A76]">{statusMessage}</p>
                )}

                <div className="mt-5 flex items-center justify-end gap-3">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={onVerify}
                        disabled={isLoading || otp.length !== 6}
                    >
                        {isLoading ? 'Verifying...' : verifyLabel}
                    </Button>
                </div>
            </div>
        </div>
    )
}

function MenuItem({
    planLabel,
    signOutAction,
}: {
    planLabel: string
    signOutAction: (formData: FormData) => Promise<void>
}) {
    const router = useRouter()
    const [signOutOpen, setSignOutOpen] = React.useState(false)
    const [deleteOpen, setDeleteOpen] = React.useState(false)
    const [historyOpen, setHistoryOpen] = React.useState(false)
    const [historyOtpOpen, setHistoryOtpOpen] = React.useState(false)
    const [historyOtp, setHistoryOtp] = React.useState('')
    const [historyStatusMessage, setHistoryStatusMessage] = React.useState('')
    const [isSendingHistoryOtp, setIsSendingHistoryOtp] = React.useState(false)
    const [isVerifyingHistoryOtp, setIsVerifyingHistoryOtp] = React.useState(false)
    const [deleteOtpOpen, setDeleteOtpOpen] = React.useState(false)
    const [deleteOtp, setDeleteOtp] = React.useState('')
    const [deleteStatusMessage, setDeleteStatusMessage] = React.useState('')
    const [isSendingDeleteOtp, setIsSendingDeleteOtp] = React.useState(false)
    const [isVerifyingDeleteOtp, setIsVerifyingDeleteOtp] = React.useState(false)
    const [requestHistorySuccessMessage, setRequestHistorySuccessMessage] = React.useState('')

    React.useEffect(() => {
        if (!requestHistorySuccessMessage) return

        const timeoutId = window.setTimeout(() => {
            setRequestHistorySuccessMessage('')
        }, 4000)

        return () => window.clearTimeout(timeoutId)
    }, [requestHistorySuccessMessage])

    const onStartHistoryRequest = async () => {
        if (isSendingHistoryOtp) return

        setIsSendingHistoryOtp(true)
        setHistoryStatusMessage('Sending OTP...')

        const response = await generateSarRequestOtpAction()
        setIsSendingHistoryOtp(false)
        setHistoryStatusMessage(response.message)

        if (!response.success) return

        setHistoryOpen(false)
        setHistoryOtp('')
        setHistoryOtpOpen(true)
    }

    const onVerifyHistoryOtp = async () => {
        if (isVerifyingHistoryOtp) return

        setIsVerifyingHistoryOtp(true)
        const response = await verifySarRequestWithOtpAction(historyOtp)
        setIsVerifyingHistoryOtp(false)
        setHistoryStatusMessage(response.message)

        if (!response.success) return

        setHistoryOtpOpen(false)
        setHistoryOtp('')
        setRequestHistorySuccessMessage('Your access history request has been sent successfully.')
    }

    const onStartDeleteRequest = async () => {
        if (isSendingDeleteOtp) return

        setIsSendingDeleteOtp(true)
        setDeleteStatusMessage('Sending OTP...')

        const response = await generateDeleteAccountOtpAction()
        setIsSendingDeleteOtp(false)
        setDeleteStatusMessage(response.message)

        if (!response.success) return

        setDeleteOpen(false)
        setDeleteOtp('')
        setDeleteOtpOpen(true)
    }

    const onVerifyDeleteOtp = async () => {
        if (isVerifyingDeleteOtp) return

        setIsVerifyingDeleteOtp(true)
        const response = await verifyOtpAndDeleteAccountAction(deleteOtp)
        setIsVerifyingDeleteOtp(false)
        setDeleteStatusMessage(response.message)

        if (!response.success) return

        setDeleteOtpOpen(false)
        setDeleteOtp('')
        router.replace('/sign-in')
    }

    return (
        <div className="flex-1 text-[14px] font-poppins-400 px-6 py-6 mt-20 relative md:max-w-[600px] lg:max-w-[800px] xl:max-w-[1000px] mx-auto">
            {requestHistorySuccessMessage && (
                <div className="mb-4 rounded-xl border border-[#D7EBDD] bg-[#F2FAF5] px-4 py-3 text-sm text-[#1F5D57]">
                    {requestHistorySuccessMessage}
                </div>
            )}

            <div className="overflow-hidden">

                {/* Subscription Section */}
                <div className="bg-white rounded-2xl shadow-md border border-[#F5F5F5]">
                    <MenuRow
                        icon={CreditCard}
                        label="Subscription Status"
                        showBadge
                        badgeText={planLabel}
                        href="/plans"
                    />
                    <MenuRow icon={User} label="Account Info" href="/account" />
                </div>

                {/* Downloads / Favorites / Notifications */}
                <div className="my-5 bg-white rounded-2xl shadow-md border border-[#F5F5F5]">
                    <MenuRow icon={Download} label="Downloads" href="/downloads" />
                    <MenuRow icon={Heart} label="Favorites" href="/liked" />
                    <MenuRow icon={Bell} label="Notifications" bordered={false} href="/notifications" />
                </div>

                {/* Support / Terms */}
                <div className="my-2 bg-white rounded-2xl shadow-md border border-[#F5F5F5]">
                    <MenuRow icon={HelpCircle} label="Contact Support" href="/support" />
                    <MenuRow icon={FileText} label="Terms & Privacy" href="/terms" />
                    <ActionRow icon={History} label="Request Access History" onClick={() => setHistoryOpen(true)} />
                    <ActionRow icon={Trash2} label="Delete Account" danger onClick={() => setDeleteOpen(true)} />
                    <ActionRow icon={LogOut} label="Sign Out" bordered={false} onClick={() => setSignOutOpen(true)} />
                </div>

            </div>

            <ConfirmModal
                open={signOutOpen}
                title="Sign out?"
                description="Do you really want to sign out from this device?"
                cancelLabel="Cancel"
                confirmLabel="Sign Out"
                onClose={() => setSignOutOpen(false)}
                action={signOutAction}
                destructive
            />

            <ConfirmModal
                open={deleteOpen}
                title="Delete Account?"
                description="Do you really want to delete your account?"
                cancelLabel="No"
                confirmLabel={isSendingDeleteOtp ? 'Sending OTP...' : 'Yes'}
                isLoading={isSendingDeleteOtp}
                confirmDisabled={isSendingDeleteOtp}
                statusMessage={deleteStatusMessage}
                onClose={() => setDeleteOpen(false)}
                onConfirm={async () => {
                    await onStartDeleteRequest()
                }}
                destructive
            />

            <ConfirmModal
                open={historyOpen}
                title="Request Access History"
                description={
                    'This will generate your access history for the past 30 days.\nYou can request it only once every 24 hours.'
                }
                cancelLabel="Cancel"
                confirmLabel={isSendingHistoryOtp ? 'Sending OTP...' : 'Request'}
                isLoading={isSendingHistoryOtp}
                confirmDisabled={isSendingHistoryOtp}
                statusMessage={historyStatusMessage}
                onClose={() => setHistoryOpen(false)}
                onConfirm={async () => {
                    await onStartHistoryRequest()
                }}
            />

            <OtpVerifyModal
                open={historyOtpOpen}
                otp={historyOtp}
                setOtp={setHistoryOtp}
                statusMessage={historyStatusMessage}
                onClose={() => setHistoryOtpOpen(false)}
                onVerify={onVerifyHistoryOtp}
                isLoading={isVerifyingHistoryOtp}
            />

            <OtpVerifyModal
                open={deleteOtpOpen}
                title="Verify OTP"
                description="Enter the 6-digit OTP sent to your registered email to confirm account deletion."
                verifyLabel="Delete Account"
                otp={deleteOtp}
                setOtp={setDeleteOtp}
                statusMessage={deleteStatusMessage}
                onClose={() => setDeleteOtpOpen(false)}
                onVerify={onVerifyDeleteOtp}
                isLoading={isVerifyingDeleteOtp}
            />
        </div>
    )
}

export default MenuItem
