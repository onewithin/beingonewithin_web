'use client'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'
import { likeMeditation, unlikeMeditation } from '@/lib/actions/meditation'

interface AudioImageProps {
    thumbnail: string;
    meditationId: string;
    initialLiked?: boolean;
    contentType: 'meditation' | 'thought';
}

function AudioImage({ thumbnail, meditationId, initialLiked = false, contentType }: AudioImageProps) {
    const [liked, setLiked] = useState(initialLiked)
    const [imageLoading, setImageLoading] = useState(true)
    const [imageSrc, setImageSrc] = useState(thumbnail || '/icons/audioImage.jpg')
    const [feedbackMessage, setFeedbackMessage] = useState('')
    const [feedbackTone, setFeedbackTone] = useState<'success' | 'error'>('success')
    const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const latestActionIdRef = useRef(0)

    const showFeedback = (message: string, tone: 'success' | 'error') => {
        setFeedbackMessage(message)
        setFeedbackTone(tone)

        if (feedbackTimerRef.current) {
            clearTimeout(feedbackTimerRef.current)
        }

        feedbackTimerRef.current = setTimeout(() => {
            setFeedbackMessage('')
        }, 1600)
    }

    useEffect(() => {
        setImageSrc(thumbnail || '/icons/audioImage.jpg')
    }, [thumbnail])

    useEffect(() => {
        return () => {
            if (feedbackTimerRef.current) {
                clearTimeout(feedbackTimerRef.current)
            }
        }
    }, [])

    const handleToggleLike = () => {
        // Only allow for meditations
        if (contentType !== 'meditation') return

        const nextLiked = !liked
        const actionId = latestActionIdRef.current + 1
        latestActionIdRef.current = actionId

        // React immediately in UI and show instant feedback.
        setLiked(nextLiked)
        showFeedback(nextLiked ? 'Added to favorites' : 'Removed from favorites', 'success')

        void (async () => {
            const result = nextLiked
                ? await likeMeditation(meditationId)
                : await unlikeMeditation(meditationId)

            if (!result.success) {
                // Only rollback if this is still the latest action.
                if (latestActionIdRef.current === actionId) {
                    setLiked(!nextLiked)
                    showFeedback(result.error || (nextLiked ? 'Failed to like' : 'Failed to remove from favorites'), 'error')
                }
                console.error(nextLiked ? 'Failed to like:' : 'Failed to unlike:', result.error)
            }
        })()
    }

    return (
        <div className='flex flex-col items-center'>
            <div className='w-full max-w-[50rem] h-[25rem] relative border-5 border-[#EEF1F3] rounded-[1.25rem] overflow-hidden'>
                <Image
                    src={imageSrc}
                    fill
                    alt=""
                    aria-hidden
                    className='absolute inset-0 h-full w-full object-cover blur-md opacity-45'
                    sizes='(max-width: 768px) 100vw, 800px'
                    quality={90}
                    priority
                />
                <div className='absolute inset-0 bg-black/5' />

                {imageLoading && (
                    <div className='absolute inset-0 animate-pulse bg-white/15 backdrop-blur-sm rounded-[1.25rem]' />
                )}
                <Image
                    src={imageSrc}
                    fill
                    alt="meditation thumbnail"
                    className='relative z-10 w-full h-full object-contain rounded-[1.25rem]'
                    sizes='(max-width: 768px) 100vw, 800px'
                    quality={100}
                    priority
                    onError={() => {
                        if (imageSrc !== '/icons/audioImage.jpg') {
                            setImageSrc('/icons/audioImage.jpg')
                        }
                    }}
                    onLoadingComplete={() => setImageLoading(false)}
                />
                {contentType === 'meditation' && (
                    <button
                        onClick={handleToggleLike}
                        className={`absolute z-20 bottom-4 right-4 ${liked
                            ? 'bg-[#FF3B30] hover:bg-[#FF2D20]'
                            : 'bg-[#8E8E93] hover:bg-[#7C7C82]'
                            } inline-flex h-11 w-11 items-center justify-center rounded-full text-white shadow-lg transition-all hover:scale-110`}
                        aria-label={liked ? "Unlike" : "Like"}
                    >
                        <span
                            aria-hidden
                            className='inline-block h-6 w-6 bg-white'
                            style={{
                                WebkitMaskImage: 'url(/icons/favourite.png)',
                                WebkitMaskRepeat: 'no-repeat',
                                WebkitMaskPosition: 'center',
                                WebkitMaskSize: 'contain',
                                maskImage: 'url(/icons/favourite.png)',
                                maskRepeat: 'no-repeat',
                                maskPosition: 'center',
                                maskSize: 'contain',
                            }}
                        />
                    </button>
                )}
            </div>

            {feedbackMessage && (
                <div
                    className={`mt-3 rounded-full px-4 py-2 text-xs font-poppins-600 shadow-lg backdrop-blur-sm bg-white/15 border border-white/35 ${feedbackTone === 'success' ? 'text-[#1F5D57]' : 'text-[#A33B32]'
                        }`}
                >
                    {feedbackMessage}
                </div>
            )}
        </div>
    )
}

export default AudioImage