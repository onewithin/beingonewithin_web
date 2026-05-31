'use client'

import React, { lazy, Suspense } from 'react'
import type { AudioCardProps } from './audioCard'

const LazyAudioCardComponent = lazy(() => import('./audioCard'))

function AudioCardSkeleton() {
    return (
        <div className='bg-white w-full h-[80px] my-2 rounded-[30px] p-3 flex justify-between items-center border border-[#E7EFEA] shadow-[0_16px_36px_rgba(31,93,87,0.18)] animate-pulse'>
            <div className='flex gap-3 items-center flex-1'>
                <div className='w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#E8F2EE]' />
                <div className='flex-1 space-y-2'>
                    <div className='h-4 w-3/4 rounded bg-[#E8F2EE]' />
                    <div className='h-3 w-1/2 rounded bg-[#E8F2EE]' />
                </div>
            </div>
            <div className='bg-[#E8F2EE] h-[38px] w-[38px] rounded-full' />
        </div>
    )
}

export default function LazyAudioCard(props: AudioCardProps) {
    return (
        <Suspense fallback={<AudioCardSkeleton />}>
            <LazyAudioCardComponent {...props} />
        </Suspense>
    )
}
