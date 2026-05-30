import React from 'react'
import { ChevronLeft } from 'lucide-react'

export default function MeditationLoading() {
    return (
        <div className="relative h-screen p-4 bg-gradient-to-b from-primary to-white overflow-hidden">
            <div className='md:max-w-[37.5rem] lg:max-w-[50rem] xl:max-w-[62.5rem] mx-auto'>
                {/* Header Skeleton */}
                <div className='inline-flex py-2 rounded-full gap-2 items-center animate-pulse'>
                    <div className='bg-white p-1 rounded-lg flex justify-center items-center'>
                        <ChevronLeft className='opacity-30' />
                    </div>
                    <div className='h-6 w-32 bg-white/30 rounded mx-2'></div>
                </div>

                <div className='my-6'>
                    {/* Image Skeleton */}
                    <div className='flex justify-center mb-6'>
                        <div className='w-full max-w-[50rem] h-[25rem] bg-gray-200 animate-pulse rounded-[1.25rem]'></div>
                    </div>

                    {/* Title Skeleton */}
                    <div className='flex flex-col items-center gap-3 my-5 animate-pulse'>
                        <div className='h-8 w-3/4 bg-white/20 rounded'></div>
                        <div className='h-8 w-1/2 bg-white/20 rounded'></div>
                    </div>

                    {/* Description Skeleton */}
                    <div className='flex flex-col items-center gap-2 mb-6 px-4 max-w-[37.5rem] mx-auto animate-pulse'>
                        <div className='h-4 w-full bg-white/10 rounded'></div>
                        <div className='h-4 w-5/6 bg-white/10 rounded'></div>
                        <div className='h-4 w-4/6 bg-white/10 rounded'></div>
                    </div>

                    {/* Audio Player Skeleton */}
                    <div className="w-full max-w-[50rem] mx-auto">
                        <div className="flex items-center gap-2 font-poppins-400 w-full mt-2 animate-pulse">
                            <div className="h-4 w-[2.5rem] bg-white/20 rounded"></div>

                            {/* Progress bar skeleton */}
                            <div className="relative h-4 flex-1">
                                <div className="absolute top-1/2 -translate-y-1/2 w-full h-1 bg-white/20 rounded"></div>
                            </div>

                            {/* Duration skeleton */}
                            <div className="h-4 w-[2.5rem] bg-white/20 rounded"></div>

                            {/* Controls skeleton */}
                            <div className="ml-3 flex gap-2 items-center">
                                <div className="w-6 h-6 bg-white/20 rounded-full"></div>
                                <div className="mx-3 flex gap-3">
                                    <div className="w-6 h-6 bg-white/20 rounded-full"></div>
                                    <div className="w-10 h-10 bg-white/30 rounded-full"></div>
                                    <div className="w-6 h-6 bg-white/20 rounded-full"></div>
                                </div>
                                <div className="flex items-center gap-2 ml-4">
                                    <div className="w-5 h-5 bg-white/20 rounded-full"></div>
                                    <div className="w-[5rem] h-1 bg-white/20 rounded"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
