import { Badge } from '@/components/ui/badge'
import { Play } from 'lucide-react'
import React from 'react'
import Header from './_components/header'
import BottomNav from '@/components/bottomNav'
import Link from 'next/link'
import { getDownloadedMeditationsData } from '@/lib/server/home'

function formatDuration(duration?: string | number | null): string {
    if (duration === null || duration === undefined) return '10 min'
    if (typeof duration === 'number') return `${duration} min`
    return duration
}

async function Downloads() {
    const downloads = await getDownloadedMeditationsData(50)

    return (
        <div className='min-h-screen bg-mint-to-white font-poppins-400 p-4'>
            <div className='max-w-[1000px] mx-auto'>
                <Header />
                <div>
                    <p className='font-sniglet-400 text-[24px] text-[#1F5D57]'>Access your saved meditations<br />
                        anytime, even offline.</p>
                    <div className='my-4'>
                        <Badge className={'border border-[#2B7272] bg-[#DDF3E5C7] text-[12px] text-[#2B7272] rounded-full font-poppins-400'}>
                            Audio
                        </Badge>

                        {downloads.length === 0 ? (
                            <p className='text-sm text-[#1F5D57] mt-5'>No downloaded meditations yet.</p>
                        ) : (
                            <div className='my-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 xl:max-w-[1200px] xl:mx-auto'>
                                {downloads.map((meditation) => (
                                    <Link key={meditation.id} href={`/meditation/${meditation.id}`}>
                                        <div className='bg-white w-full min-h-[80px] rounded-[30px] p-3 flex justify-between items-center'>
                                            <div className='flex gap-3 items-center'>
                                                <div className='w-10 h-10 rounded-full bg-[#F8F9FF] flex items-center justify-center text-[#1F5D57]'>
                                                    ⬇
                                                </div>
                                                <div>
                                                    <p className='font-poppins-600 text-[#1F5D57] text-[16px] line-clamp-1'>
                                                        {meditation.title}
                                                    </p>
                                                    <p className='text-[#484848] font-poppins-400 text-[12px]'>
                                                        {formatDuration(meditation.duration)} • Downloaded
                                                    </p>
                                                </div>
                                            </div>
                                            <div className='bg-[#F8F9FF] h-[38px] w-[38px] rounded-full flex items-center justify-center'>
                                                <Play className='h-4 w-4 text-[#484848] fill-[#484848]' />
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                    </div>
                </div>
            </div>
            <BottomNav activeTab='downloads' />
        </div >
    )
}

export default Downloads