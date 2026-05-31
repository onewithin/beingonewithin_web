'use client'

import AudioCard from '@/components/audioCard'
import type { HomeThought } from '@/lib/server/home'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

type Props = {
    initialThoughts: HomeThought[]
    pageSize: number
}

function formatDuration(duration?: string | number | null): string {
    if (duration === null || duration === undefined) return '10 min'
    if (typeof duration === 'number') return `${duration} min`
    return duration
}

function DailyThoughtsInfiniteList({ initialThoughts, pageSize }: Props) {
    const loadMoreRef = useRef<HTMLDivElement | null>(null)
    const [items, setItems] = useState<HomeThought[]>(initialThoughts)
    const [isFetchingMore, setIsFetchingMore] = useState(false)
    const [hasMore, setHasMore] = useState(initialThoughts.length === pageSize)

    const fetchMore = async () => {
        if (!hasMore || isFetchingMore) return

        setIsFetchingMore(true)
        try {
            const response = await fetch(
                `/api/daily-thoughts?limit=${pageSize}&skip=${items.length}`,
                { cache: 'no-store' },
            )

            if (!response.ok) {
                setIsFetchingMore(false)
                return
            }

            const result = (await response.json()) as {
                data?: HomeThought[]
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

    if (items.length === 0) {
        return <p className='text-sm text-[#1F5D57] mt-4'>No daily thoughts available right now.</p>
    }

    return (
        <>
            {items.map((thought) => (
                <Link href={`/meditation/${thought.id}?type=thought`} key={thought.id}>
                    <AudioCard
                        title={thought.title}
                        subtitle={`${formatDuration(thought.duration)} • Daily Thought`}
                        imageSrc={thought.thumbnail || undefined}
                        imageAlt={thought.title}
                    />
                </Link>
            ))}

            {hasMore && <div ref={loadMoreRef} className='h-4 w-full' />}

            {isFetchingMore && (
                <div className='space-y-2'>
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div
                            key={index}
                            className='bg-white w-full h-[80px] my-2 rounded-[30px] p-3 flex justify-between items-center border border-[#E7EFEA] shadow-[0_14px_34px_rgba(31,93,87,0.14)] animate-pulse'
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
        </>
    )
}

export default DailyThoughtsInfiniteList
