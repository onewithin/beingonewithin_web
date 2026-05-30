import { Play } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

type AudioCardProps = {
    title?: string
    subtitle?: string
    imageSrc?: string | null
    imageAlt?: string
}

function AudioCard({
    title = 'Peace begins with a smile',
    subtitle = '10:00 • Sleep & Rest',
    imageSrc,
    imageAlt = 'audio thumbnail',
}: AudioCardProps) {
    return (
        <div className='bg-white w-full h-[80px] my-2 rounded-[30px] p-3 flex justify-between items-center border border-[#E7EFEA] shadow-[0_10px_30px_rgba(31,93,87,0.08)]'>
            <div className='flex gap-3 items-center'>
                {imageSrc ? (
                    <img
                        src={imageSrc}
                        alt={imageAlt}
                        className='w-8 h-8 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full object-cover'
                    />
                ) : (
                    <Image
                        src="/icons/flower-1.png"
                        alt="flower"
                        width={40}
                        height={40}
                        className="w-8 sm:w-8 md:w-10 h-8 sm:h-8 md:h-10"
                    />
                )}
                <div className='flex flex-col ml-2'>
                    <p className='font-poppins-600 text-[#1F5D57] text-[16px] line-clamp-1'>{title}</p>
                    <p className='text-[#484848] font-poppins-400 text-[12px] line-clamp-1'>{subtitle}</p>
                </div>
            </div>
            <div className='bg-[#F8F9FF] h-[38px] w-[38px] rounded-full flex items-center justify-center'>
                <Play className="h-4 w-4 text-[#484848] fill-[#484848]" />
            </div>
        </div>
    )
}

export default AudioCard