"use client"

import { Heart, Play, Sparkles, X } from 'lucide-react'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

type MeditationLikeChangedDetail = {
    meditationId: string
    liked: boolean
}

export type AudioCardProps = {
    title?: string
    subtitle?: string
    imageSrc?: string | null
    imageAlt?: string
    meditationId?: string
    initialLiked?: boolean
    isPremium?: boolean
}

function PremiumModal({ onClose, onSubscribe }: { onClose: () => void; onSubscribe: () => void }) {
    const stopAll = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
    }

    const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
        stopAll(e)
        if (e.target === e.currentTarget) onClose()
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
                {/* Close */}
                <button
                    type="button"
                    onClick={(e) => { stopAll(e); onClose() }}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Close"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Title row — icon + text */}
                <div className="flex items-center gap-1.5 mt-1">
                    <Sparkles className="h-5 w-5 text-amber-400 fill-amber-400" />
                    <h2 className="font-sniglet-400 text-[1.25rem] text-[#1F5D57]">Premium Content</h2>
                </div>

                {/* Subtitle */}
                <p className="mt-4 font-poppins-400 text-[0.875rem] text-[#484848] text-center leading-relaxed">
                    Subscribe to unlock this and other exciting features
                </p>

                {/* What You Get */}
                <div className="mt-6 w-full">
                    <p className="font-poppins-600 text-[0.75rem] text-[#1F5D57] mb-4">What You Get</p>
                    <div className="grid grid-cols-2 gap-y-4 px-2">
                        {features.map((f) => (
                            <div key={f.label} className="flex items-center gap-2 text-[#1F5D57] font-poppins-600 ">
                                <Image src={f.icon} alt={f.label} width={20} height={20} className="h-5 w-5" />
                                <span className="font-poppins-600 text-[0.75rem] text-[#1F5D57] leading-tight max-w-[100px]">
                                    {f.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Subscribe button */}
                <button
                    type="button"
                    onClick={(e) => { stopAll(e); onSubscribe() }}
                    className="mt-6 w-full rounded-2xl bg-[#1F5D57] py-3 font-poppins-600 text-white text-[0.9375rem] hover:bg-[#174d48] transition-colors"
                >
                    Subscribe Now
                </button>
            </div>
        </div>
    )

    return createPortal(modal, document.body)
}

function AudioCard({
    title = 'Peace begins with a smile',
    subtitle = '10:00 • Sleep & Rest',
    imageSrc,
    imageAlt = 'audio thumbnail',
    meditationId,
    initialLiked = false,
    isPremium = false,
}: AudioCardProps) {
    const [liked, setLiked] = useState(Boolean(initialLiked))
    const [isLikeLoading, setIsLikeLoading] = useState(false)
    const [isCheckingPremium, setIsCheckingPremium] = useState(false)
    const [showPremiumModal, setShowPremiumModal] = useState(false)

    useEffect(() => {
        setLiked(Boolean(initialLiked))
    }, [initialLiked, meditationId])

    useEffect(() => {
        if (!meditationId) return

        const onLikeChanged = (event: Event) => {
            const customEvent = event as CustomEvent<MeditationLikeChangedDetail>
            if (customEvent.detail?.meditationId !== meditationId) return
            setLiked(Boolean(customEvent.detail.liked))
        }

        window.addEventListener('meditation:like-changed', onLikeChanged as EventListener)
        return () => window.removeEventListener('meditation:like-changed', onLikeChanged as EventListener)
    }, [meditationId])

    const handleToggleLike = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault()
        event.stopPropagation()

        if (!meditationId || isLikeLoading) return

        const nextLiked = !liked
        setLiked(nextLiked)
        setIsLikeLoading(true)

        try {
            const response = await fetch('/api/liked', {
                method: nextLiked ? 'POST' : 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ meditationId }),
                cache: 'no-store',
            })

            if (!response.ok) {
                setLiked(!nextLiked)
                return
            }

            window.dispatchEvent(
                new CustomEvent<MeditationLikeChangedDetail>('meditation:like-changed', {
                    detail: {
                        meditationId,
                        liked: nextLiked,
                    },
                }),
            )
        } catch {
            setLiked(!nextLiked)
        } finally {
            setIsLikeLoading(false)
        }
    }

    const handleCardClick = async (event: React.MouseEvent<HTMLDivElement>) => {
        if (!meditationId || isCheckingPremium) return

        if (!isPremium) return // Let the wrapping Link handle navigation

        event.preventDefault()
        event.stopPropagation()
        setIsCheckingPremium(true)

        try {
            const response = await fetch('/api/subscription-status', {
                method: 'GET',
                cache: 'no-store',
            })

            const payload = (await response.json().catch(() => null)) as { hasPremiumAccess?: boolean } | null
            const hasPremiumAccess = Boolean(payload?.hasPremiumAccess)

            if (hasPremiumAccess) {
                window.location.assign(`/meditation/${meditationId}`)
                return
            }

            setShowPremiumModal(true)
        } catch {
            setShowPremiumModal(true)
        } finally {
            setIsCheckingPremium(false)
        }
    }

    return (
        <>
            {showPremiumModal && (
                <PremiumModal
                    onClose={() => setShowPremiumModal(false)}
                    onSubscribe={() => window.location.assign('/plans')}
                />
            )}
            <div
                className='bg-white w-full h-[80px] my-2 rounded-[30px] p-3 flex justify-between items-center border border-[#E7EFEA]'
                style={{ boxShadow: '0 16px 36px rgba(31, 93, 87, 0.18)' }}
                onClick={handleCardClick}
            >
                <div className='flex gap-3 items-center'>
                    {imageSrc ? (
                        <img
                            src={imageSrc}
                            alt={imageAlt}
                            className='w-8 h-8 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full object-cover'
                        />
                    ) : (
                        <Image
                            src="/icons/flower-1.png"
                            alt="flower"
                            width={40}
                            height={40}
                            className="w-8 sm:w-8 md:w-10 h-8 sm:h-8 md:h-10"
                        />
                    )}
                    <div className='flex flex-col ml-2'>
                        <p className='font-poppins-600 text-[#1F5D57] text-[16px] line-clamp-1'>{title}</p>
                        <p className='text-[#484848] font-poppins-400 text-[12px] line-clamp-1'>{subtitle}</p>
                    </div>
                </div>
                <div className='flex items-center gap-2'>
                    {meditationId && (
                        <button
                            type='button'
                            onClick={handleToggleLike}
                            disabled={isLikeLoading}
                            aria-label={liked ? 'Unlike meditation' : 'Like meditation'}
                            className={`h-[38px] w-[38px] rounded-full flex items-center justify-center transition-colors ${liked
                                ? 'bg-[#FFE8E6] text-[#FF3B30]'
                                : 'bg-[#F8F9FF] text-[#484848]'
                                } ${isLikeLoading ? 'opacity-70' : ''}`}
                        >
                            <Heart className={`h-4 w-4 ${liked ? 'fill-[#FF3B30]' : ''}`} />
                        </button>
                    )}
                    <div className='bg-[#F8F9FF] h-[38px] w-[38px] rounded-full flex items-center justify-center'>
                        {isCheckingPremium ? (
                            <span className="h-4 w-4 rounded-full border-2 border-[#1F5D57] border-t-transparent animate-spin" />
                        ) : (
                            <Play className="h-4 w-4 text-[#484848] fill-[#484848]" />
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default AudioCard
