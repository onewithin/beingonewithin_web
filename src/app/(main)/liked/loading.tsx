import Image from 'next/image'
import React from 'react'
import Header from './_components/header'

function LikedLoading() {
    return (
        <div className='h-screen bg-mint-to-white font-poppins-400 p-4'>
            <div className='md:max-w-[600px] lg:max-w-[800px] xl:max-w-[1000px] mx-auto'>
                <div className=' flex justify-between items-center'>
                    <Header />
                    <div className='flex gap-4'>
                        <Image src="/icons/flower1.png" alt="Flower" width={26} height={26} className='w-[1.625rem] h-[1.625rem]' />
                    </div>
                </div>

                <p className='font-sniglet-400 text-[24px] text-[#1F5D57]'>
                    Your calm collection, ready anytime.
                </p>

                <div className='my-5 space-y-3'>
                    {Array.from({ length: 5 }).map((_, index) => (
                        <div
                            key={index}
                            className='bg-white w-full h-[80px] rounded-[30px] p-3 flex justify-between items-center border border-[#E7EFEA]'
                        >
                            <div className='flex gap-3 items-center'>
                                <div className='h-10 w-10 rounded-full bg-[#EAF3EF] animate-pulse' />
                                <div className='space-y-2'>
                                    <div className='h-4 w-44 rounded bg-[#EAF3EF] animate-pulse' />
                                    <div className='h-3 w-28 rounded bg-[#EAF3EF] animate-pulse' />
                                </div>
                            </div>
                            <div className='h-9 w-9 rounded-full bg-[#EAF3EF] animate-pulse' />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default LikedLoading
