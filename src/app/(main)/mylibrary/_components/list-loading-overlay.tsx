"use client"

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

function LibraryListLoadingOverlay() {
    const searchParams = useSearchParams()
    const [pendingPlaylistId, setPendingPlaylistId] = useState<string | null>(null)

    useEffect(() => {
        const onStart = (event: Event) => {
            const customEvent = event as CustomEvent<string>
            if (typeof customEvent.detail === 'string' && customEvent.detail.length > 0) {
                setPendingPlaylistId(customEvent.detail)
            }
        }

        window.addEventListener('library:playlist-switch-start', onStart as EventListener)
        return () => window.removeEventListener('library:playlist-switch-start', onStart as EventListener)
    }, [])

    useEffect(() => {
        if (!pendingPlaylistId) return

        const currentPlaylistId = searchParams.get('playlistId')
        if (currentPlaylistId === pendingPlaylistId) {
            setPendingPlaylistId(null)
        }
    }, [searchParams, pendingPlaylistId])

    if (!pendingPlaylistId) {
        return null
    }

    return (
        <div className='absolute inset-0 z-20 rounded-[20px] bg-[#F7FBF9] pointer-events-none'>
            <div className='w-full pt-5 space-y-2'>
                {Array.from({ length: 5 }).map((_, index) => (
                    <div
                        key={index}
                        className='bg-white w-full min-h-[80px] rounded-[30px] p-3 flex justify-between items-center border border-[#E7EFEA] shadow-[0_10px_30px_rgba(31,93,87,0.08)] animate-pulse'
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
        </div>
    )
}

export default LibraryListLoadingOverlay
