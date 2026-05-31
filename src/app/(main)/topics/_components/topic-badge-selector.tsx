"use client"

import { cn } from '@/lib/utils'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

type TopicBadge = {
    id: string
    label: string
}

type Props = {
    badges: TopicBadge[]
    selectedBadgeId?: string | null
}

const defaultTextColor = 'text-[#2B7272]'
const defaultBgColor = 'bg-white'
const selectedTextColor = 'text-white'
const selectedBgColor = 'bg-[#2B7272]'

function TopicBadgeSelector({ badges, selectedBadgeId }: Props) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const containerRef = useRef<HTMLDivElement | null>(null)
    const [activeBadgeId, setActiveBadgeId] = useState<string | null | undefined>(selectedBadgeId)

    useEffect(() => {
        setActiveBadgeId(selectedBadgeId)
    }, [selectedBadgeId])

    useEffect(() => {
        if (!activeBadgeId || !containerRef.current) return

        const activeElement = containerRef.current.querySelector<HTMLButtonElement>(
            `[data-badge-id="${activeBadgeId}"]`,
        )

        activeElement?.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center',
        })
    }, [activeBadgeId, badges])

    if (badges.length === 0) {
        return null
    }

    return (
        <div ref={containerRef} className='my-3 flex gap-3 overflow-x-auto whitespace-nowrap pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
            {badges.map(({ id, label }) => {
                const isSelected = activeBadgeId === id

                return (
                    <button
                        key={id}
                        type='button'
                        data-badge-id={id}
                        onClick={() => {
                            if (id === activeBadgeId) return

                            setActiveBadgeId(id)
                            window.dispatchEvent(new CustomEvent('topics:topic-switch-start', { detail: id }))

                            const params = new URLSearchParams(searchParams.toString())
                            params.set('topicId', id)
                            router.push(`${pathname}?${params.toString()}`, { scroll: false })
                        }}
                        className={cn(
                            'cursor-pointer rounded-full font-poppins-400 text-[12px] px-3 py-1 flex items-center gap-2 transition-colors duration-200',
                            isSelected
                                ? `${selectedBgColor} ${selectedTextColor}`
                                : `${defaultBgColor} ${defaultTextColor}`,
                        )}
                    >
                        {label}
                    </button>
                )
            })}
        </div>
    )
}

export default TopicBadgeSelector
