import { Button } from '@/components/ui/button'
import { BedDouble, LockKeyholeOpen, LockOpen, Mic } from 'lucide-react'
import React from 'react'

function Subscribe() {
    return (
        <div className='w-full bg-[#DDF3E5]  p-5 rounded-2xl my-16 mb-32 lg:mb-28'>
            <div>
                <LockOpen className='h-6 w-6' color={"#1F5D57"} />
                <p className='font-poppins-600 text-[#1F5D57] text-[18px]'> Unlock beingOnwith Premium</p>
                <p className='font-poppins-400 text-[#1F5D57] text-[12px]'>Experience deeper rest, healing, and clarity — anytime you need.</p>
            </div>
            <div className='font-poppins-600 text-[#1F5D57] text-[12px] my-4'>
                <p className='mb-4'>What You Get</p>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 xl:max-w-[1200px] xl:mx-auto">
                    <div className='flex items-center  gap-2'>
                        <LockKeyholeOpen className='h-5 w-5' color={"#1F5D57"} />
                        <p> Full Access to All Meditations</p>
                    </div>
                    <div className='flex items-center  gap-2'>
                        <BedDouble className='h-5 w-5' color={"#1F5D57"} />
                        <p>Exclusive Sleep & Rest Audios</p>
                    </div>
                    <div className='flex items-center  gap-2'>
                        <Mic className='h-5 w-5' color={"#1F5D57"} />
                        <p>New Weekly Content</p>
                    </div>
                    <div className='flex items-center  gap-2' >
                        <LockKeyholeOpen className='h-5 w-5' color={"#1F5D57"} />
                        <p>Download & Listen  Offline</p>
                    </div>
                </div>
            </div>
            <Button className='w-full font-poppins-600 text-[16px] p-5 mt-3 text-center'>Subscribe Now</Button>
            <p className='text-center text-[#1F5D57] text-[12px] mt-1'> 14 day trial end on <b>08/08/025</b></p>
        </div >
    )
}

export default Subscribe