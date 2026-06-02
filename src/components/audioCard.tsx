"use client"

import { Heart, Play } from 'lucide-react'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const PremiumModal = dynamic(() => import('./premium-content-modal'), {
    ssr: false,
})

type MeditationLikeChangedDetail = {
    meditationId: string
    liked: boolean
}

const likedStateOverrides = new Map<string, boolean>()

function resolveLikedState(meditationId?: string, initialLiked?: boolean) {
    if (meditationId && likedStateOverrides.has(meditationId)) {
        return Boolean(likedStateOverrides.get(meditationId))
    }

    return Boolean(initialLiked)
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

function AudioCard({
    title = 'Peace begins with a smile',
    subtitle = '10:00 • Sleep & Rest',
    imageSrc,
    imageAlt = 'audio thumbnail',
    meditationId,
    initialLiked = false,
    isPremium = false,
}: AudioCardProps) {
    const router = useRouter()
    const [liked, setLiked] = useState(() => resolveLikedState(meditationId, initialLiked))
    const [isLikeLoading, setIsLikeLoading] = useState(false)
    const [isCheckingPremium, setIsCheckingPremium] = useState(false)
    const [showPremiumModal, setShowPremiumModal] = useState(false)

    useEffect(() => {
        setLiked(resolveLikedState(meditationId, initialLiked))
    }, [initialLiked, meditationId])

    useEffect(() => {
        if (!meditationId) return

        const onLikeChanged = (event: Event) => {
            const customEvent = event as CustomEvent<MeditationLikeChangedDetail>
            if (customEvent.detail?.meditationId !== meditationId) return
            const nextLiked = Boolean(customEvent.detail.liked)
            likedStateOverrides.set(meditationId, nextLiked)
            setLiked(nextLiked)
        }

        window.addEventListener('meditation:like-changed', onLikeChanged as EventListener)
        return () => window.removeEventListener('meditation:like-changed', onLikeChanged as EventListener)
    }, [meditationId])

    const handleToggleLike = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault()
        event.stopPropagation()

        if (!meditationId || isLikeLoading) return

        const nextLiked = !liked
        likedStateOverrides.set(meditationId, nextLiked)
        setLiked(nextLiked)
        window.dispatchEvent(
            new CustomEvent<MeditationLikeChangedDetail>('meditation:like-changed', {
                detail: {
                    meditationId,
                    liked: nextLiked,
                },
            }),
        )
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
                likedStateOverrides.set(meditationId, !nextLiked)
                setLiked(!nextLiked)
                window.dispatchEvent(
                    new CustomEvent<MeditationLikeChangedDetail>('meditation:like-changed', {
                        detail: {
                            meditationId,
                            liked: !nextLiked,
                        },
                    }),
                )
                return
            }
        } catch {
            likedStateOverrides.set(meditationId, !nextLiked)
            setLiked(!nextLiked)
            window.dispatchEvent(
                new CustomEvent<MeditationLikeChangedDetail>('meditation:like-changed', {
                    detail: {
                        meditationId,
                        liked: !nextLiked,
                    },
                }),
            )
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
                router.push(`/meditation/${meditationId}`)
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
                    onSubscribe={() => router.push('/plans')}
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
