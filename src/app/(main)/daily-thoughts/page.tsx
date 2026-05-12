import { Badge } from '@/components/ui/badge'
import { Play, Sun, Volume2 } from 'lucide-react'
import React from 'react'
import Header from './_components/header'
import BottomNav from '@/components/bottomNav'
import { getDailyThoughtsData } from '@/lib/server/home'

function formatDuration(duration?: string | number | null): string {
    if (duration === null || duration === undefined) return '10 min'
    if (typeof duration === 'number') return `${duration} min`
    return duration
}

async function DailyThoughts() {
    const thoughts = await getDailyThoughtsData(50)

    return (
        <div className='min-h-screen bg-mint-to-white font-poppins-400 p-4'>
            <div className=' md:max-w-[600px] lg:max-w-[800px] xl:max-w-[1000px] mx-auto'>
                <div className=' flex justify-between items-center'>
                    <Header />
                    <div className='flex gap-4'>
                        <Sun className='h-6 w-6 ' />
                    </div>
                </div>
                <div>
                    <p className='font-sniglet-400 text-[24px] text-[#1F5D57]'>Each day leaves a whisper — revisit them here.</p>
                    <div className='my-4'>
                        <Badge className={'border border-[#2B7272] bg-[#DDF3E5C7] text-[12px] text-[#2B7272] rounded-full font-poppins-400'}>
                            <Volume2 className='fill-[#2B7272] h-[20px] w-[20px]' />
                            Audio
                        </Badge>
                        <div className="w-full my-5">
                            {thoughts.length === 0 ? (
                                <p className='text-sm text-[#1F5D57] mt-4'>No daily thoughts available right now.</p>
                            ) : (
                                thoughts.map((thought) => (
                                    <div key={thought.id} className='bg-white w-full min-h-[80px] my-2 rounded-[30px] p-3 flex justify-between items-center'>
                                        <div className='flex gap-3 items-center'>
                                            <div className='w-10 h-10 rounded-full bg-[#F8F9FF] flex items-center justify-center text-[#1F5D57]'>
                                                ✨
                                            </div>
                                            <div>
                                                <p className='font-poppins-600 text-[#1F5D57] text-[16px] line-clamp-1'>
                                                    {thought.title}
                                                </p>
                                                <p className='text-[#484848] font-poppins-400 text-[12px]'>
                                                    {formatDuration(thought.duration)} • Daily Thought
                                                </p>
                                            </div>
                                        </div>
                                        <div className='bg-[#F8F9FF] h-[38px] w-[38px] rounded-full flex items-center justify-center'>
                                            <Play className='h-4 w-4 text-[#484848] fill-[#484848]' />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                    </div>
                </div>
            </div>
            <BottomNav activeTab='home' />
        </div >
    )
}

export default DailyThoughts