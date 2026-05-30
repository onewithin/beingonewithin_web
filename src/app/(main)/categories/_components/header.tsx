'use client';

import { ChevronLeft } from 'lucide-react';
import React from 'react';
import { useRouter } from 'next/navigation';

function Header() {
    const router = useRouter();

    return (
        <div className='inline-flex py-2 rounded-full gap-2 items-center'>
            <button
                onClick={() => router.back()}
                className='bg-white p-1 rounded-lg flex justify-center items-center cursor-pointer'
                aria-label="Go back"
            >
                <ChevronLeft />
            </button>
            <p className='font-poppins-600 text-[16px] mx-2'>All Categories</p>
        </div>
    );
}

export default Header;
