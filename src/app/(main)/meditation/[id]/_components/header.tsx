'use client';

import { ChevronLeft } from 'lucide-react';
import React from 'react';
import { useRouter } from 'next/navigation';

interface HeaderProps {
    categoryName?: string;
    textColor?: string;
}

function Header({ categoryName = 'Meditation', textColor = '#1f2937' }: HeaderProps) {
    const router = useRouter();

    const handleBack = () => {
        if (window.history.length > 1) {
            router.back();
            return;
        }

        router.push('/home');
    };

    return (
        <div className='inline-flex py-2 rounded-full gap-2 items-center'>
            <button
                onClick={handleBack}
                className='bg-white p-1 rounded-lg flex justify-center items-center cursor-pointer'
                aria-label="Go back"
            >
                <ChevronLeft style={{ color: textColor }} />
            </button>
            <p className='font-poppins-600 text-[1rem] mx-2' style={{ color: textColor }}>
                {categoryName}
            </p>
        </div>
    );
}

export default Header;
