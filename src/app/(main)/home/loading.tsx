import React from 'react'
import Image from 'next/image'

export default function HomeLoading() {
    return (
        <div className='min-h-screen bg-mint-to-white font-poppins-400 animate-pulse'>
            <Image
                src="/icons/half-flower.png"
                height={516}
                width={516}
                alt="spiritual"
                className="absolute top-0 left-1/2 opacity-30 -translate-x-1/2 z-0 pointer-events-none select-none"
                aria-hidden="true"
            />
            <div className='relative z-0 p-4 md:max-w-[37.5rem] lg:max-w-[50rem] xl:max-w-[62.5rem] 2xl:max-w-[75rem] mx-auto'>
                {/* Header Skeleton */}
                <div className='py-3 flex justify-between items-center z-10 relative'>
                    <div className='h-9 w-40 bg-white/30 rounded-full'></div>
                    <div className='h-7 w-7 bg-white/30 rounded-full'></div>
                </div>

                {/* Today's Suggestion Skeleton */}
                <div className='text-center my-8 space-y-4'>
                    <div className='h-6 w-48 bg-gray-100 rounded-lg mx-auto'></div>
                    <div className='h-11 w-full max-w-md bg-gray-100 rounded-lg mx-auto'></div>
                    <div className='h-10 w-40 bg-white/60 rounded-full mx-auto mt-6'></div>
                </div>

                {/* Divider */}
                <hr className="border-t border-dotted border-[#63AF95] w-full h-0.5 bg-transparent relative opacity-30" />

                <div className='space-y-6'>
                    {/* Let's Begin With Section */}
                    <section className='bg-white w-full rounded-[1.875rem] p-5 my-16 shadow-sm'>
                        <div className='flex items-center justify-between mb-4'>
                            <div className='h-7 w-40 bg-gray-100 rounded-lg'></div>
                            <div className='h-4 w-16 bg-gray-100 rounded'></div>
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                            {[1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className='h-[7.6875rem] rounded-[1.875rem] bg-gray-50 flex flex-col items-center justify-center'
                                >
                                    <div className='w-10 h-10 bg-gray-100 rounded-full mb-2'></div>
                                    <div className='h-4 w-24 bg-gray-100 rounded'></div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Divider */}
                    <hr className="border-t border-dotted border-[#63AF95] w-full h-0.5 bg-transparent relative opacity-30" />

                    {/* Explore by Topic Section */}
                    <section className='my-16'>
                        <div className='h-7 w-40 bg-gray-100 rounded-lg mb-4'></div>
                        <div className='flex flex-wrap gap-3'>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                <div key={i} className='h-8 w-24 bg-gray-50 rounded-full'></div>
                            ))}
                        </div>

                        <div className='h-7 w-32 bg-gray-100 rounded-lg my-4 mt-8'></div>
                        <div className='space-y-2'>
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className='bg-white w-full min-h-[5rem] rounded-[1.875rem] p-3 flex justify-between items-center'
                                >
                                    <div className='flex gap-3 items-center flex-1'>
                                        <div className='w-10 h-10 rounded-full bg-gray-50'></div>
                                        <div className='flex-1 space-y-2'>
                                            <div className='h-5 w-3/4 bg-gray-100 rounded'></div>
                                            <div className='h-4 w-1/2 bg-gray-50 rounded'></div>
                                        </div>
                                    </div>
                                    <div className='w-[2.375rem] h-[2.375rem] rounded-full bg-gray-50'></div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Divider */}
                    <hr className="border-t border-dotted border-[#63AF95] w-full h-0.5 bg-transparent relative opacity-30" />

                    {/* Premium Section */}
                    <section className='w-full bg-[#DDF3E5] p-5 rounded-2xl my-16 mb-32 lg:mb-28'>
                        <div className='space-y-3'>
                            <div className='h-6 w-6 bg-white/60 rounded'></div>
                            <div className='h-6 w-64 bg-white/60 rounded'></div>
                            <div className='h-4 w-full max-w-sm bg-white/50 rounded'></div>
                        </div>

                        <div className='my-4 space-y-3'>
                            <div className='h-5 w-32 bg-white/60 rounded'></div>
                            {[1, 2, 3].map((i) => (
                                <div key={i} className='flex gap-2 items-start'>
                                    <div className='w-5 h-5 bg-white/50 rounded'></div>
                                    <div className='h-4 w-48 bg-white/50 rounded'></div>
                                </div>
                            ))}
                        </div>

                        <div className='h-12 w-full bg-white/60 rounded-full mt-4'></div>
                    </section>
                </div>
            </div>
        </div>
    )
}
