'use client'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { Heart, Play, Pause, X } from 'lucide-react'
import { useAudio } from '@/contexts/AudioContext'
import { usePathname, useRouter } from 'next/navigation'
import { likeMeditation } from '@/lib/actions/meditation'

type MeditationLikeChangedDetail = {
    meditationId: string
    liked: boolean
}

function MiniPlayer() {
    const { nowPlaying, isPlaying, pauseAudio, playAudio, closePlayer } = useAudio()
    const pathname = usePathname()
    const router = useRouter()
    const [isLiked, setIsLiked] = useState(false)

    useEffect(() => {
        if (!nowPlaying) {
            return
        }

        setIsLiked(false)

        router.prefetch(`/meditation/${nowPlaying.id}?type=${nowPlaying.contentType}`)
    }, [nowPlaying?.id])

    // Don't show mini player on the meditation details page itself
    if (!nowPlaying || pathname?.includes(`/meditation/${nowPlaying.id}`)) {
        return null
    }

    const handleClick = () => {
        router.push(`/meditation/${nowPlaying.id}?type=${nowPlaying.contentType}`)
    }

    const handleLike = () => {
        if (nowPlaying.contentType !== 'meditation' || isLiked) return

        setIsLiked(true)

        void (async () => {
            const result = await likeMeditation(nowPlaying.id)
            if (!result.success) {
                setIsLiked(false)
                return
            }

            window.dispatchEvent(
                new CustomEvent<MeditationLikeChangedDetail>('meditation:like-changed', {
                    detail: {
                        meditationId: nowPlaying.id,
                        liked: true,
                    },
                }),
            )
        })()
    }

    return (
        <div className="fixed bottom-[4.65rem] md:bottom-[6rem] left-1/2 z-40 w-[calc(100%-1.5rem)] md:max-w-[37.5rem] lg:max-w-[50rem] xl:max-w-[62.5rem] -translate-x-1/2">
            <div className="relative rounded-[1.35rem] border border-[#DDE9E3] bg-white/96 px-3 py-3 shadow-[0_14px_32px_rgba(31,93,87,0.16)] backdrop-blur-xl">
                <div className="flex items-center gap-3">
                    <div
                        onClick={handleClick}
                        className="relative h-12 w-12 flex-shrink-0 cursor-pointer overflow-hidden rounded-[0.9rem]"
                    >
                        <Image
                            src={nowPlaying.thumbnail}
                            fill
                            alt={nowPlaying.title}
                            className="object-cover"
                        />
                    </div>

                    <div
                        onClick={handleClick}
                        className="min-w-0 flex-1 cursor-pointer"
                    >
                        <p className="truncate text-sm font-poppins-600 text-secondary">
                            {nowPlaying.title}
                        </p>
                        <p className="mt-1 truncate text-xs capitalize text-[#6B7280]">
                            {nowPlaying.contentType}
                        </p>
                    </div>

                    {nowPlaying.contentType === 'meditation' && (
                        <button
                            onClick={handleLike}
                            className={`inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition-all ${isLiked
                                ? 'bg-[#FFE7E5] text-[#FF3B30]'
                                : 'bg-[#F4F4F5] text-[#7B8087] hover:bg-[#ECEDEF]'
                                }`}
                            aria-label="Like meditation"
                        >
                            <Heart className={`h-4 w-4 ${isLiked ? 'fill-[#FF3B30]' : ''}`} />
                        </button>
                    )}

                    <button
                        onClick={isPlaying ? pauseAudio : playAudio}
                        className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary shadow-[0_10px_20px_rgba(43,114,114,0.24)] transition-all hover:scale-105 hover:bg-primary/90"
                        aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                        {isPlaying ? (
                            <Pause className="w-5 h-5 text-white fill-white" />
                        ) : (
                            <Play className="w-5 h-5 text-white fill-white" />
                        )}
                    </button>

                    <button
                        onClick={() => {
                            closePlayer()
                        }}
                        className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#F4F4F5] text-[#5F6368] transition-all hover:bg-[#E8E8EA]"
                        aria-label="Close"
                    >
                        <X className="h-4 w-4" />
                    </button>


                </div>
            </div>
        </div>
    )
}

export default MiniPlayer
