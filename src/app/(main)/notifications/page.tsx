'use client'

import Link from 'next/link'
import { BellRing, ChevronLeft } from 'lucide-react'
import React from 'react'
import {
    getNotificationPreferencesAction,
    updateNotificationPreferencesAction,
} from '@/lib/actions/profile'
import { Button } from '@/components/ui/button'

type Preferences = {
    push: boolean
    mindful: boolean
    newContent: boolean
    tips: boolean
}

const preferenceLabels: Array<{ key: keyof Preferences; title: string; description: string }> = [
    {
        key: 'push',
        title: 'Push Notifications',
        description: 'General important alerts from your account and subscription.',
    },
    {
        key: 'mindful',
        title: 'Mindful Reminders',
        description: 'Gentle reminders to breathe, pause, and re-center during your day.',
    },
    {
        key: 'newContent',
        title: 'New Content',
        description: 'Get notified when fresh meditations and audio sessions are published.',
    },
    {
        key: 'tips',
        title: 'Tips and Guidance',
        description: 'Product and practice tips to improve your mindfulness journey.',
    },
]

export default function NotificationsPage() {
    const [preferences, setPreferences] = React.useState<Preferences>({
        push: true,
        mindful: true,
        newContent: true,
        tips: true,
    })
    const [statusMessage, setStatusMessage] = React.useState('')
    const [isLoading, setIsLoading] = React.useState(true)
    const [isSaving, setIsSaving] = React.useState(false)

    React.useEffect(() => {
        const loadPreferences = async () => {
            setIsLoading(true)
            const response = await getNotificationPreferencesAction()
            setPreferences(response.preferences)
            if (!response.success) {
                setStatusMessage(response.message)
            }
            setIsLoading(false)
        }

        loadPreferences()
    }, [])

    const onToggle = (key: keyof Preferences) => {
        setPreferences((previous) => ({
            ...previous,
            [key]: !previous[key],
        }))
        setStatusMessage('')
    }

    const onSave = async () => {
        setIsSaving(true)
        const response = await updateNotificationPreferencesAction(preferences)
        setStatusMessage(response.message)
        setIsSaving(false)
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
                    <h1 className="text-[#113C38] text-xl font-poppins-600">Notifications</h1>
                </div>

                <div className="bg-white border border-[#E8F0EE] rounded-2xl shadow-sm p-5 space-y-5">
                    <div className="flex items-start gap-3">
                        <BellRing className="h-5 w-5 text-[#1F5D57] mt-1" />
                        <div>
                            <p className="text-[#1E2B28] font-poppins-500">Manage your notification preferences</p>
                            <p className="text-sm text-[#6D7A76] mt-1">
                                Choose what type of reminders and updates you want to receive.
                            </p>
                        </div>
                    </div>

                    {isLoading ? (
                        <p className="text-sm text-[#6D7A76]">Loading preferences...</p>
                    ) : (
                        <div className="space-y-4">
                            {preferenceLabels.map((item) => (
                                <label key={item.key} className="flex items-start justify-between gap-4 border border-[#EEF4F2] rounded-xl p-3 cursor-pointer">
                                    <div>
                                        <p className="text-[#1E2B28] font-poppins-500 text-sm">{item.title}</p>
                                        <p className="text-xs text-[#6D7A76] mt-1">{item.description}</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={preferences[item.key]}
                                        onChange={() => onToggle(item.key)}
                                        className="mt-1 h-4 w-4 accent-[#1F5D57]"
                                    />
                                </label>
                            ))}
                        </div>
                    )}

                    <Button onClick={onSave} disabled={isSaving || isLoading} className="w-full">
                        {isSaving ? 'Saving...' : 'Save Preferences'}
                    </Button>

                    {statusMessage && (
                        <p className="text-sm text-[#1F5D57]">{statusMessage}</p>
                    )}
                </div>
            </div>
        </div>
    )
}
