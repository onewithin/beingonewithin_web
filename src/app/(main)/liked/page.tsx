import React from 'react'
import Header from './_components/header'
import BottomNav from '@/components/bottomNav'
import Image from 'next/image'
import { getLikedMeditationsData } from '@/lib/server/home'
import LikedInfiniteList from './_components/liked-infinite-list'

async function LikedPage() {
    const PAGE_SIZE = 12
    const likedMeditations = await getLikedMeditationsData(PAGE_SIZE, 0)

    return (
        <div className='h-screen bg-mint-to-white font-poppins-400 p-4'>
            <div className=' md:max-w-[600px] lg:max-w-[800px] xl:max-w-[1000px] mx-auto'>
                <div className=' flex justify-between items-center'>
                    <Header />
                    <div className='flex gap-4'>
                        <Image src="/icons/flower1.png" alt="Flower" width={26} height={26} className='w-[1.625rem] h-[1.625rem]' />
                    </div>
                </div>
                <div>
                    <p className='font-sniglet-400 text-[24px] text-[#1F5D57]'>
                        Your calm collection, ready anytime.
                    </p>
                    <div className='my-4'>
                        <div className="w-full my-5">
                            <LikedInfiniteList initialMeditations={likedMeditations} pageSize={PAGE_SIZE} />
                        </div>

                    </div>
                </div>
            </div>
            <BottomNav activeTab='liked' />
        </div >
    )
}

export default LikedPage