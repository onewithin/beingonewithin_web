'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MoveRight } from 'lucide-react'
import Image from 'next/image'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

function Page() {
    const router = useRouter()
    const [name, setName] = useState('')
    const [error, setError] = useState('')

    const handleGetStarted = () => {
        const trimmed = name.trim()
        if (!trimmed) {
            setError('Please enter your name to continue.')
            return
        }

        if (typeof window !== 'undefined') {
            sessionStorage.setItem('prana_name', trimmed)
        }

        router.push('/introduction')
    }

    return (
        <div className="relative h-screen bg-gradient-to-b from-[#2B7272] to-[#FFFFFF] overflow-hidden">
            <Image
                src="/icons/spiritual.png"
                height={684}
                width={684}
                alt="spiritual"
                className="absolute top-0 left-1/2 -translate-x-1/2"
            />

            <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white">
                <h1 className="text-[30px] md:text-[36px] font-sniglet-400 leading-tight">
                    A moment for your mind,<br /> a path to your soul.
                </h1>
                <p className="font-poppins-400 text-[16px] mt-6">
                    Let <span className="font-poppins-600">beingOnwith</span> guide you toward peace,<br className='hidden md:block' /> clarity, and connection
                </p>
                <div className="mt-6 space-y-4">
                    <div className='my-12 md:my-24'>
                        <p className="font-poppins-400 text-[12px] md:text-[16px]">What should we call you?</p>
                        <Input
                            placeholder="Enter your name"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value)
                                setError('')
                            }}
                            className="w-[300px] md:w-[335px] text-[16px] mt-1 bg-white border py-5 text-center text-black  border-[#F5F5F5] font-poppins-500"
                        />
                        {error && (
                            <p className="text-red-100 mt-2 text-sm">{error}</p>
                        )}
                    </div>
                    <div className='flex justify-center'>
                        <Button
                            onClick={handleGetStarted}
                            className="bg-[#1F5D57] md:mt-9 px-6 py-5 font-poppins-600 text-[16px] flex items-center gap-2"
                        >
                            Let&apos;s Get Started
                            <MoveRight className="w-6 h-6" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Page
