"use client"

import React from 'react'
import Image from 'next/image'
import { Sparkles, X } from 'lucide-react'
import { createPortal } from 'react-dom'

type Props = {
    onClose: () => void
    onSubscribe: () => void
}

function PremiumContentModal({ onClose, onSubscribe }: Props) {
    const stopAll = (event: React.MouseEvent) => {
        event.preventDefault()
        event.stopPropagation()
    }

    const handleBackdrop = (event: React.MouseEvent<HTMLDivElement>) => {
        stopAll(event)
        if (event.target === event.currentTarget) onClose()
    }

    const features = [
        { icon: '/icons/access.png', label: 'Full Access to All Meditations' },
        { icon: '/icons/audios.png', label: 'Exclusive Sleep & Rest Audios' },
        { icon: '/icons/mic.png', label: 'New Weekly Content' },
        { icon: '/icons/download.png', label: 'Download & Listen Offline' },
    ]

    const modal = (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
            onClick={handleBackdrop}
        >
            <div className="relative w-[90%] max-w-sm rounded-[30px] bg-white p-5 shadow-2xl flex flex-col items-center gap-0" onClick={stopAll}>
                <button
                    type="button"
                    onClick={(event) => {
                        stopAll(event)
                        onClose()
                    }}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Close"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-1.5 mt-1">
                    <Sparkles className="h-5 w-5 text-amber-400 fill-amber-400" />
                    <h2 className="font-sniglet-400 text-[1.25rem] text-[#1F5D57]">Premium Content</h2>
                </div>

                <p className="mt-4 font-poppins-400 text-[0.875rem] text-[#484848] text-center leading-relaxed">
                    Subscribe to unlock this and other exciting features
                </p>

                <div className="mt-6 w-full">
                    <p className="font-poppins-600 text-[0.75rem] text-[#1F5D57] mb-4">What You Get</p>
                    <div className="grid grid-cols-2 gap-y-4 px-2">
                        {features.map((feature) => (
                            <div key={feature.label} className="flex items-center gap-2 text-[#1F5D57] font-poppins-600 ">
                                <Image src={feature.icon} alt={feature.label} width={20} height={20} className="h-5 w-5" />
                                <span className="font-poppins-600 text-[0.75rem] text-[#1F5D57] leading-tight max-w-[100px]">
                                    {feature.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    type="button"
                    onClick={(event) => {
                        stopAll(event)
                        onSubscribe()
                    }}
                    className="mt-6 w-full rounded-2xl bg-[#1F5D57] py-3 font-poppins-600 text-white text-[0.9375rem] hover:bg-[#174d48] transition-colors"
                >
                    Subscribe Now
                </button>
            </div>
        </div>
    )

    return createPortal(modal, document.body)
}

export default PremiumContentModal
