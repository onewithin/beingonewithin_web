"use client"

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import AudioCard from '@/components/audioCard'
import type { HomeMeditation } from '@/lib/server/home'
import { formatToMMSS } from '@/lib/utils'

type Props = {
    topicId: string
    initialMeditations: HomeMeditation[]
    initialHasMore: boolean
    pageSize: number
}

function TopicsInfiniteList({ topicId, initialMeditations, initialHasMore, pageSize }: Props) {
    const loadMoreRef = useRef<HTMLDivElement | null>(null)
    const [items, setItems] = useState<HomeMeditation[]>(initialMeditations)
    const [hasMore, setHasMore] = useState(initialHasMore)
    const [isFetchingMore, setIsFetchingMore] = useState(false)

    useEffect(() => {
        setItems(initialMeditations)
        setHasMore(initialHasMore)
        setIsFetchingMore(false)
    }, [topicId, initialMeditations, initialHasMore])

    const fetchMore = async () => {
        if (!topicId || !hasMore || isFetchingMore) return

        setIsFetchingMore(true)
        try {
            const response = await fetch(
                `/api/topic-meditations?topicId=${encodeURIComponent(topicId)}&limit=${pageSize}&skip=${items.length}`,
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
    }, [hasMore, isFetchingMore, items.length, topicId])

    if (items.length === 0) {
        return <p className='text-sm text-color'>No meditations found for this topic.</p>
    }

    return (
        <div className='w-full my-5'>
            {items.map((meditation) => (
                <Link href={`/meditation/${meditation.id}`} key={meditation.id}>
                    <AudioCard
                        title={meditation.title}
                        subtitle={`${formatToMMSS(meditation.duration)} • ${meditation.category?.name || 'Guided'}`}
                        imageSrc={meditation.thumbnail || undefined}
                        imageAlt={meditation.title}
                        meditationId={meditation.id}
                        isPremium={Boolean(meditation.isPremium)}
                        initialLiked={Boolean(meditation.isLiked)}
                    />
                </Link>
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
        </div>
    )
}

export default TopicsInfiniteList
