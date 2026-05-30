'use client'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import Image from 'next/image'
import React, { useState, useTransition } from 'react'
import { likeMeditation, unlikeMeditation } from '@/lib/actions/meditation'

interface AudioImageProps {
    thumbnail: string;
    meditationId: string;
    initialLiked?: boolean;
    contentType: 'meditation' | 'thought';
}

function AudioImage({ thumbnail, meditationId, initialLiked = false, contentType }: AudioImageProps) {
    const [liked, setLiked] = useState(initialLiked)
    const [isPending, startTransition] = useTransition()
    const [imageLoading, setImageLoading] = useState(true)

    const handleToggleLike = () => {
        // Only allow for meditations
        if (contentType !== 'meditation') return

        if (liked) {
            // Unlike
            setLiked(false)
            startTransition(async () => {
                const result = await unlikeMeditation(meditationId)
                if (!result.success) {
                    setLiked(true)
                    console.error('Failed to unlike:', result.error)
                }
            })
        } else {
            // Like
            setLiked(true)
            startTransition(async () => {
                const result = await likeMeditation(meditationId)
                if (!result.success) {
                    setLiked(false)
                    console.error('Failed to like:', result.error)
                }
            })
        }
    }

    return (
        <div className='flex justify-center'>
            <div className='w-full max-w-[50rem] h-[25rem] relative border-5 border-[#F5F5F5] rounded-[1.25rem] overflow-hidden'>
                {imageLoading && (
                    <div className='absolute inset-0 bg-gray-200 animate-pulse rounded-[1.25rem]' />
                )}
                <Image
                    src={thumbnail}
                    fill
                    alt="meditation thumbnail"
                    className='w-full h-full object-cover rounded-[1.25rem]'
                    priority
                    onLoadingComplete={() => setImageLoading(false)}
                />
                {contentType === 'meditation' && (
                    <button
                        onClick={handleToggleLike}
                        disabled={isPending}
                        className={`absolute bottom-4 right-4 ${liked
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-green-600 hover:bg-green-700'
                            } text-white rounded-full p-2 shadow-md transition-all ${isPending
                                ? 'opacity-50 cursor-not-allowed'
                                : 'hover:scale-110'
                            }`}
                        aria-label={liked ? "Unlike" : "Like"}
                    >
                        {liked ? (
                            <ThumbsDown className="h-6 w-6 fill-white" />
                        ) : (
                            <ThumbsUp className="h-6 w-6 fill-white" />
                        )}
                    </button>
                )}
            </div>
        </div>
    )
}

export default AudioImage