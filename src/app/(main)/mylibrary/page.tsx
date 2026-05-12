import { Badge } from '@/components/ui/badge'
import { FolderPlus, Play, Sun, Volume2 } from 'lucide-react'
import React from 'react'
import Header from './_components/header'
import BadgeSelector from './_components/category'
import BottomNav from '@/components/bottomNav'
import { getLikedMeditationsData } from '@/lib/server/home'
import Link from 'next/link'

function formatDuration(duration?: string | number | null): string {
    if (duration === null || duration === undefined) return '10 min'
    if (typeof duration === 'number') return `${duration} min`
    return duration
}

async function MyLibrary() {
    const likedMeditations = await getLikedMeditationsData(50)

    return (
        <div className='min-h-screen bg-mint-to-white font-poppins-400 p-4'>
            <div className=' md:max-w-[600px] lg:max-w-[800px] xl:max-w-[1000px] mx-auto'>
                <div className=' flex justify-between items-center'>
                    <Header />
                    <div className='flex gap-4'>
                        <FolderPlus className='h-6 w-6 ' color='#1F5D57' />
                        <Sun className='h-6 w-6 ' />
                    </div>
                </div>
                <div>
                    <p className='font-sniglet-400 text-[24px] text-[#1F5D57]'>Organize your meditations.</p>
                    <div className='my-4'>
                        <Badge className={'border border-[#2B7272] bg-[#DDF3E5C7] text-[12px] text-[#2B7272] rounded-full font-poppins-400'}>
                            <Volume2 className='fill-[#2B7272] h-[20px] w-[20px]' />
                            Audio
                        </Badge>


                        <BadgeSelector />
                        <div className="w-full my-5">
                            {likedMeditations.length === 0 ? (
                                <p className='text-sm text-[#1F5D57]'>No saved meditations yet.</p>
                            ) : (
                                likedMeditations.map((meditation) => (
                                    <div key={meditation.id} className='md:flex gap-2 items-center'>
                                        <Link href={`/meditation/${meditation.id}`} className='flex-1'>
                                            <div className='bg-white w-full min-h-[80px] my-2 rounded-[30px] p-3 flex justify-between items-center'>
                                                <div className='flex gap-3 items-center'>
                                                    <div className='w-10 h-10 rounded-full bg-[#F8F9FF] flex items-center justify-center text-[#1F5D57]'>
                                                        ❤
                                                    </div>
                                                    <div>
                                                        <p className='font-poppins-600 text-[#1F5D57] text-[16px] line-clamp-1'>
                                                            {meditation.title}
                                                        </p>
                                                        <p className='text-[#484848] font-poppins-400 text-[12px]'>
                                                            {formatDuration(meditation.duration)} • {meditation.category?.name || 'Saved'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className='bg-[#F8F9FF] h-[38px] w-[38px] rounded-full flex items-center justify-center'>
                                                    <Play className='h-4 w-4 text-[#484848] fill-[#484848]' />
                                                </div>
                                            </div>
                                        </Link>
                                        <p className='font-poppins-600 text-primary text-[14px] mx-3 md:mx-0'>Saved</p>
                                    </div>
                                ))
                            )}
                        </div>

                    </div>
                </div>
            </div>
            <BottomNav activeTab='library' />
        </div >
    )
}

export default MyLibrary