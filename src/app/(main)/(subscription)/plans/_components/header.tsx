'use client';

import { ChevronLeft } from 'lucide-react';
import React from 'react';
import { useRouter } from 'next/navigation';

function Header() {
    const router = useRouter();

    const handleBack = () => {
        if (typeof document !== 'undefined' && document.referrer.includes('checkout.stripe.com')) {
            router.replace('/profile');
            return;
        }

        router.back();
    };

    return (
        <div className='inline-flex py-2 w-full rounded-full gap-2 items-center'>
            <button
                onClick={handleBack}
                className='bg-white p-1 rounded-lg flex justify-center items-center cursor-pointer'
                aria-label="Go back"
            >
                <ChevronLeft />
            </button>
            <p className='font-poppins-600 text-[16px] mx-2 text-[#121212]'>Subscription Status</p>
        </div>
    );
}

export default Header;
