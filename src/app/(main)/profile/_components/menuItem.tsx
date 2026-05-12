'use client'

import React from 'react'
import Link from 'next/link'
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
                    <Badge className="border-[#f58e05] border-2 text-[#f58e05] font-poppins-600 bg-transparent rounded-full">
                        {badgeText}
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

function ConfirmModal({
    open,
    title,
    description,
    cancelLabel,
    confirmLabel,
    onClose,
    action,
    destructive = false,
}: {
    open: boolean
    title: string
    description: string
    cancelLabel: string
    confirmLabel: string
    onClose: () => void
    action: (formData: FormData) => void | Promise<void>
    destructive?: boolean
}) {
    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
                <h3 className="text-lg font-poppins-600 text-[#0E0E0E]">{title}</h3>
                <p className="mt-2 text-sm text-[#5A5A5A]">{description}</p>
                <div className="mt-5 flex items-center justify-end gap-3">
                    <Button type="button" variant="outline" onClick={onClose}>
                        {cancelLabel}
                    </Button>
                    <form action={action}>
                        <Button
                            type="submit"
                            className={destructive ? 'bg-red-600 hover:bg-red-700 text-white' : ''}
                        >
                            {confirmLabel}
                        </Button>
                    </form>
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
    const [signOutOpen, setSignOutOpen] = React.useState(false)
    const [deleteOpen, setDeleteOpen] = React.useState(false)
    const [historyOpen, setHistoryOpen] = React.useState(false)

    return (
        <div className="flex-1 text-[14px] font-poppins-400 px-6 py-6 mt-20 relative md:max-w-[600px] lg:max-w-[800px] xl:max-w-[1000px] mx-auto">
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
                title="Delete Account"
                description="For your security, account deletion requires OTP verification in Account Info."
                cancelLabel="Not now"
                confirmLabel="Go to Account Info"
                onClose={() => setDeleteOpen(false)}
                action={async () => {
                    window.location.href = '/account#danger-zone'
                }}
                destructive
            />

            <ConfirmModal
                open={historyOpen}
                title="Request Access History"
                description="You can now submit SAR requests from the Support screen."
                cancelLabel="Close"
                confirmLabel="Go to Support"
                onClose={() => setHistoryOpen(false)}
                action={async () => {
                    window.location.href = '/support'
                }}
            />
        </div>
    )
}

export default MenuItem
