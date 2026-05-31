'use client'

import AudioCard from '@/components/audioCard'
import { unlikeMeditation } from '@/lib/actions/meditation'
import type { HomeMeditation } from '@/lib/server/home'
import { formatSecondsMMSS } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

type Props = {
    initialMeditations: HomeMeditation[]
    pageSize: number
}

function LikedInfiniteList({ initialMeditations, pageSize }: Props) {
    const loadMoreRef = useRef<HTMLDivElement | null>(null)
    const [items, setItems] = useState<HomeMeditation[]>(initialMeditations)
    const [isFetchingMore, setIsFetchingMore] = useState(false)
    const [hasMore, setHasMore] = useState(initialMeditations.length === pageSize)
    const [pendingRemove, setPendingRemove] = useState<HomeMeditation | null>(null)
    const [isRemoving, setIsRemoving] = useState(false)
    const [removeError, setRemoveError] = useState('')

    const fetchMore = async () => {
        if (!hasMore || isFetchingMore) return

        setIsFetchingMore(true)
        try {
            const response = await fetch(
                `/api/liked-meditations?limit=${pageSize}&skip=${items.length}`,
                { cache: 'no-store' },
            )

            if (!response.ok) {
                setIsFetchingMore(false)
                return
            }

            const result = (await response.json()) as {
                data?: HomeMeditation[]
                hasMore?: boolean
            }

            const nextItems = Array.isArray(result.data) ? result.data : []

            setItems((prev) => {
                const existingIds = new Set(prev.map((item) => item.id))
                const uniqueNext = nextItems.filter((item) => !existingIds.has(item.id))
                return [...prev, ...uniqueNext]
            })
            setHasMore(Boolean(result.hasMore))
        } finally {
            setIsFetchingMore(false)
        }
    }

    useEffect(() => {
        if (!loadMoreRef.current || !hasMore) return

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) {
                    fetchMore()
                }
            },
            { rootMargin: '180px 0px' },
        )

        observer.observe(loadMoreRef.current)
        return () => observer.disconnect()
    }, [hasMore, isFetchingMore, items.length])

    const handleConfirmRemove = async () => {
        if (!pendingRemove) return

        setIsRemoving(true)
        setRemoveError('')
        try {
            const result = await unlikeMeditation(pendingRemove.id)

            if (!result.success) {
                setRemoveError(result.error || 'Failed to remove')
                return
            }

            setItems((prev) => prev.filter((item) => item.id !== pendingRemove.id))
            setPendingRemove(null)
        } finally {
            setIsRemoving(false)
        }
    }

    if (items.length === 0) {
        return (
            <div className='flex min-h-[55vh] items-center justify-center px-4'>
                <div className='flex max-w-[22rem] flex-col items-center text-center'>
                    <div className='flex h-[5rem] w-[5rem] items-center justify-center rounded-full bg-[#FF3B30] shadow-[0_16px_36px_rgba(255,59,48,0.24)]'>
                        <Image
                            src='/icons/favourite.png'
                            alt='Favorites'
                            width={44}
                            height={44}
                            className='h-8 w-8 object-contain brightness-0 invert'
                        />
                    </div>
                    <h2 className='mt-5 font-sniglet-400 whitespace-pre-line  text-[1.6rem] leading-[2rem] text-secondary'>
                        {"You haven't liked\nanything yet"}
                    </h2>
                    <p className='mt-3 whitespace-pre-line text-[0.95rem] leading-6 text-[#6B7280]'>
                        {'Subscribe or explore meditations to\nbuild your favorites'}
                    </p>
                    <Link
                        href='/home'
                        className='mt-6 w-96 inline-flex min-h-11 items-center justify-center rounded-lg text-[#1F5D57] border-2 border-[#1F5D57] px-6 py-3 font-poppins-600 text-sm  shadow-[0_14px_30px_rgba(31,93,87,0.18)] transition-all '
                    >
                        Browse Meditations
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <>
            {items.map((meditation) => (
                <div key={meditation.id} className='md:flex gap-2 items-center'>
                    <Link
                        href={`/meditation/${meditation.id}?type=meditation`}
                        className='block flex-1'
                    >
                        <AudioCard
                            title={meditation.title}
                            subtitle={`${formatSecondsMMSS(meditation.duration)} • ${meditation.category?.name || 'Liked'}`}
                            imageSrc={meditation.thumbnail || undefined}
                            imageAlt={meditation.title}
                        />
                    </Link>
                    <button
                        type='button'
                        onClick={() => {
                            setPendingRemove(meditation)
                            setRemoveError('')
                        }}
                        className='font-poppins-600 cursor-pointer text-primary text-[14px] mx-3 md:mx-0 hover:underline'
                    >
                        Remove
                    </button>
                </div>
            ))}

            {hasMore && <div ref={loadMoreRef} className='h-4 w-full' />}

            {isFetchingMore && (
                <div className='space-y-2'>
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div
                            key={index}
                            className='bg-white w-full h-[80px] my-2 rounded-[30px] p-3 flex justify-between items-center border border-[#E7EFEA] shadow-[0_10px_30px_rgba(31,93,87,0.08)] animate-pulse'
                        >
                            <div className='flex gap-3 items-center flex-1'>
                                <div className='w-10 h-10 rounded-full bg-[#E8F2EE]' />
                                <div className='flex-1 space-y-2'>
                                    <div className='h-4 w-3/4 rounded bg-[#E8F2EE]' />
                                    <div className='h-3 w-1/2 rounded bg-[#E8F2EE]' />
                                </div>
                            </div>
                            <div className='bg-[#E8F2EE] h-[38px] w-[38px] rounded-full' />
                        </div>
                    ))}
                </div>
            )}

            {pendingRemove && (
                <div className='fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4'>
                    <div className='w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl'>
                        <h3 className='font-poppins-600 text-[1rem] text-secondary'>Remove From Liked?</h3>
                        <p className='mt-2 text-sm text-[#4C4C4C]'>
                            Do you want to remove "{pendingRemove.title}" from your liked meditations?
                        </p>

                        {removeError && (
                            <p className='mt-2 text-xs text-[#A33B32]'>{removeError}</p>
                        )}

                        <div className='mt-4 flex gap-2'>
                            <button
                                type='button'
                                onClick={() => setPendingRemove(null)}
                                disabled={isRemoving}
                                className='flex-1 rounded-lg border border-[#D6DFDC] py-2 text-sm font-poppins-600 text-secondary hover:bg-[#F7FAF9] disabled:opacity-50'
                            >
                                Cancel
                            </button>
                            <button
                                type='button'
                                onClick={handleConfirmRemove}
                                disabled={isRemoving}
                                className='flex-1 rounded-lg bg-primary py-2 text-sm font-poppins-600 text-white hover:bg-primary/90 disabled:opacity-50'
                            >
                                {isRemoving ? 'Removing...' : 'Remove'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default LikedInfiniteList
