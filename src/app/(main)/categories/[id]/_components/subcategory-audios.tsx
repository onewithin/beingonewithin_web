'use client'

import { Badge } from '@/components/ui/badge'
import { Waves } from 'lucide-react'
import AudioCard from '@/components/audioCard'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { formatToMMSS, getDarkerColor } from '@/lib/utils'
import type { HomeMeditation, HomeSubcategory, PaginationData } from '@/lib/server/home'

type Props = {
    subcategories: HomeSubcategory[]
    meditations: HomeMeditation[]
    categoryColor: string
    categoryId: string
    selectedSubcategoryId: string
    pagination: PaginationData
    currentPage: number
    currentLimit: number
}

function SubcategoryAudios({
    subcategories,
    meditations,
    categoryColor,
    categoryId,
    selectedSubcategoryId,
    pagination,
    currentPage,
    currentLimit,
}: Props) {
    const router = useRouter()
    const loadMoreRef = useRef<HTMLDivElement | null>(null)
    const normalizeId = (value: string | number | null | undefined) =>
        value === null || value === undefined ? '' : String(value)
    const darkerTextColor = getDarkerColor(categoryColor, 140)
    const [isSwitching, setIsSwitching] = useState(false)
    const [isFetchingMore, setIsFetchingMore] = useState(false)
    const [loadedMeditations, setLoadedMeditations] = useState<HomeMeditation[]>(meditations)
    const [loadedPage, setLoadedPage] = useState(currentPage)
    const [hasMore, setHasMore] = useState(currentPage < pagination.totalPages)

    const filteredMeditations = useMemo(() => loadedMeditations, [loadedMeditations])

    const selectedSubcategoryName =
        subcategories.find((subcategory) => normalizeId(subcategory.id) === selectedSubcategoryId)?.name || 'this subcategory'

    const buildHref = (subcategoryId: string | number, page = 1) =>
        `/categories/${categoryId}?subcategoryId=${normalizeId(subcategoryId)}&page=${page}&limit=${currentLimit}`

    const handleSubcategoryChange = (subcategoryId: string) => {
        if (subcategoryId === selectedSubcategoryId) return
        setIsSwitching(true)
        router.push(buildHref(subcategoryId, 1))
    }

    const fetchNextPage = async () => {
        if (!hasMore || isFetchingMore || isSwitching) return

        const nextPage = loadedPage + 1
        setIsFetchingMore(true)

        try {
            const response = await fetch(
                `/api/subcategory-meditations?subcategoryId=${encodeURIComponent(selectedSubcategoryId)}&page=${nextPage}&limit=${currentLimit}`,
            )

            if (!response.ok) {
                setIsFetchingMore(false)
                return
            }

            const result = (await response.json()) as {
                data?: HomeMeditation[]
                pagination?: PaginationData
            }

            const nextItems = Array.isArray(result.data) ? result.data : []

            setLoadedMeditations((prev) => {
                const existingIds = new Set(prev.map((item) => item.id))
                const uniqueNext = nextItems.filter((item) => !existingIds.has(item.id))
                return [...prev, ...uniqueNext]
            })

            const totalPages = result.pagination?.totalPages || pagination.totalPages
            setLoadedPage(nextPage)
            setHasMore(nextPage < totalPages)
        } finally {
            setIsFetchingMore(false)
        }
    }

    useEffect(() => {
        // New props from server navigation arrived; stop showing local switching skeleton.
        setLoadedMeditations(meditations)
        setLoadedPage(currentPage)
        setHasMore(currentPage < pagination.totalPages)
        setIsFetchingMore(false)
        setIsSwitching(false)
    }, [selectedSubcategoryId, meditations, currentPage, pagination.totalPages])

    useEffect(() => {
        if (!loadMoreRef.current || !hasMore || isSwitching) return

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) {
                    fetchNextPage()
                }
            },
            { rootMargin: '180px 0px' },
        )

        observer.observe(loadMoreRef.current)
        return () => observer.disconnect()
    }, [hasMore, isSwitching, loadedPage, selectedSubcategoryId])

    const renderSkeletonCards = () =>
        Array.from({ length: 3 }).map((_, index) => (
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
        ))

    return (
        <div className='mt-6 '>
            {subcategories.length > 0 && (
                <div className='flex flex-wrap gap-2'>
                    {subcategories.map((subcategory) => {
                        const subcategoryId = normalizeId(subcategory.id)
                        const isActive = subcategoryId === selectedSubcategoryId
                        return (
                            <button key={subcategory.id} type='button' onClick={() => handleSubcategoryChange(subcategoryId)}>
                                <Badge
                                    className='cursor-pointer rounded-full px-3 py-1.5 text-[0.75rem] font-poppins-400 border'
                                    style={
                                        isActive
                                            ? {
                                                backgroundColor: categoryColor,
                                                color: darkerTextColor,
                                                borderColor: categoryColor,
                                            }
                                            : {
                                                color: darkerTextColor,
                                                borderColor: darkerTextColor,
                                                backgroundColor: 'white',
                                            }
                                    }
                                >
                                    {subcategory.name}
                                </Badge>
                            </button>
                        )
                    })}
                </div>
            )
            }

            <div className='mt-5 space-y-3 pb-10'>
                {isSwitching ? (
                    <>{renderSkeletonCards()}</>
                ) : filteredMeditations.length === 0 ? (
                    <div
                        className='relative overflow-hidden rounded-[1.25rem]  p-5  flex items-center justify-center'
                    // style={{
                    //     borderColor: `${darkerTextColor}2E`,
                    //     background: `linear-gradient(135deg, #ffffff 0%, ${categoryColor}1A 100%)`,
                    // }}
                    >
                        <div
                            className='pointer-events-none absolute -top-8 -right-8  rounded-full blur-2xl'
                        // style={{ backgroundColor: `${categoryColor}66` }}
                        />

                        <div className='relative flex flex-col items-center justify-center gap-3 text-center max-w-[24rem]'>
                            <div
                                className='h-11 w-11 rounded-2xl flex items-center justify-center'

                            >
                                <Waves className='h-5 w-5' style={{ color: darkerTextColor }} />
                            </div>
                            <div>
                                <p className='font-poppins-600 text-[0.95rem] tracking-[0.01em]' style={{ color: darkerTextColor }}>
                                    Nothing queued in {selectedSubcategoryName}
                                </p>
                                <p className='mt-1 font-poppins-400 text-[0.8rem] text-[#4C4C4C]'>
                                    Switch badges above to explore available sessions in other categories.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {filteredMeditations.map((meditation) => (
                            <Link href={`/meditation/${meditation.id}`} key={meditation.id}>
                                <AudioCard
                                    title={meditation.title}
                                    subtitle={`${meditation.duration} • ${selectedSubcategoryName}`}
                                    imageSrc={meditation.thumbnail || undefined}
                                    imageAlt={meditation.title}
                                />
                            </Link>
                        ))}
                        {hasMore && <div ref={loadMoreRef} className='h-4 w-full' />}
                        {isFetchingMore && <>{renderSkeletonCards()}</>}
                    </>
                )}
            </div>
        </div >
    )
}

export default SubcategoryAudios
