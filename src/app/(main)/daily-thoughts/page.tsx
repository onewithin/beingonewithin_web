import Header from './_components/header'
import BottomNav from '@/components/bottomNav'
import { getDailyThoughtsData } from '@/lib/server/home'
import Image from 'next/image'
import DailyThoughtsInfiniteList from './_components/daily-thoughts-infinite-list'

const PAGE_SIZE = 12

async function DailyThoughts() {
    const thoughts = await getDailyThoughtsData(PAGE_SIZE, 0)

    return (
        <div className='min-h-screen bg-mint-to-white font-poppins-400 p-4'>
            <div className=' md:max-w-[600px] lg:max-w-[800px] xl:max-w-[1000px] mx-auto'>
                <div className=' flex justify-between items-center'>
                    <Header />
                    <div className='flex gap-4'>
                        <Image src='/icons/flower1.png' alt='Flower' width={24} height={24} className='h-6 w-6 object-contain' />
                    </div>
                </div>
                <div>
                    <p className='font-sniglet-400 text-[24px] text-[#1F5D57]'>Each day leaves a whisper — revisit them here.</p>
                    <div className='my-4'>
                        <div className="w-full my-5">
                            <DailyThoughtsInfiniteList initialThoughts={thoughts} pageSize={PAGE_SIZE} />
                        </div>

                    </div>
                </div>
            </div>
            <BottomNav activeTab='home' />
        </div >
    )
}

export default DailyThoughts