"use client";

import Link from 'next/link';
import Image from 'next/image';
import React from 'react';
import dynamic from 'next/dynamic';

const MiniPlayer = dynamic(() => import('./MiniPlayer'), {
    ssr: false,
});

type Props = {
    activeTab: string
}

type NavItemProps = {
    iconSrc: string;
    label: string;
    active: boolean;
};


function BottomNav({ activeTab }: Props) {
    return (
        <>
            <MiniPlayer />
            <div className="fixed inset-x-0 bottom-0  z-50 w-full md:w-[401px] p-2 left-1/2 transform -translate-x-1/2 bg-[#1F5D57] text-white flex items-center justify-between md:justify-center gap-2 md:gap-7 md:rounded-2xl shadow-lg md:bottom-4">
                {/* Home */}
                <Link href={'/home'}>
                    <NavItem iconSrc="/nav_icons/home.png" label="Home" active={activeTab === 'home'} />
                </Link>

                {/* Downloads */}
                <Link href={'/downloads'}>
                    <NavItem iconSrc="/nav_icons/downloads.png" label="Downloads" active={activeTab === 'downloads'} />
                </Link>


                {/* My Library */}
                <Link href={'/mylibrary'}>
                    <NavItem iconSrc="/nav_icons/library.png" label="My Library" active={activeTab === 'library'} />
                </Link>

                {/* Liked */}
                <Link href={'/liked'}>
                    <NavItem iconSrc="/nav_icons/liked.png" label="Liked" active={activeTab === 'liked'} />
                </Link>

                {/* Profile */}
                <Link href={'/profile'}>
                    <NavItem iconSrc="/nav_icons/profile.png" label="Profile" active={activeTab === 'profile'} />
                </Link>
            </div>
        </>
    );
}

function NavItem({ iconSrc, label, active }: NavItemProps) {
    return (
        <div className="flex flex-col justify-center items-center ">
            <div
                className={`p-2 rounded-full ${active ? 'bg-white' : ''}`}
            >
                <Image
                    src={iconSrc}
                    alt={label}
                    width={24}
                    height={24}
                    className="h-6 w-6 object-contain"
                    style={{
                        filter: active
                            ? 'invert(29%) sepia(44%) saturate(600%) hue-rotate(133deg) brightness(92%) contrast(91%)'
                            : 'brightness(0) invert(1)',
                    }}
                />
            </div>
            <p className={`font-poppins-400 text-[10px] ${active ? 'text-white' : 'text-white/70'}`}>
                {label}
            </p>
        </div>
    );
}

export default BottomNav;
