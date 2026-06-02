import { Button } from '@/components/ui/button'
import { Crown, Download, Play } from 'lucide-react'
import React from 'react'
import Header from './_components/header'
import BottomNav from '@/components/bottomNav'
import Link from 'next/link'
import { getDownloadedMeditationsData } from '@/lib/server/home'
import { getSubscriptionStatus } from '@/lib/actions/subscription'
import Image from 'next/image'

function formatDuration(duration?: string | number | null): string {
    if (duration === null || duration === undefined) return '10 min'
    if (typeof duration === 'number') return `${duration} min`
    return duration
}

async function Downloads() {
    const subscriptionResult = await getSubscriptionStatus()
    const subscriptionData = subscriptionResult.ok ? subscriptionResult.data : null
    const hasAccessFlag = (subscriptionData as { hasAccessToPremium?: boolean; isPremium?: boolean } | null)?.hasAccessToPremium
        ?? (subscriptionData as { hasAccessToPremium?: boolean; isPremium?: boolean } | null)?.isPremium
    const activeStatus = (subscriptionData as { activeSubscription?: { status?: string | null } | null } | null)?.activeSubscription?.status
        ?? (subscriptionData as { status?: string | null } | null)?.status
        ?? null
    const hasPremiumAccess = typeof hasAccessFlag === 'boolean'
        ? hasAccessFlag
        : activeStatus === 'ACTIVE' || activeStatus === 'TRIALING'

    const downloads = await getDownloadedMeditationsData(50)
    const periodEnd = (subscriptionData as { currentPeriodEnd?: string | null } | null)?.currentPeriodEnd ?? null
    const formattedPeriodEnd = periodEnd
        ? new Date(periodEnd).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        })
        : null

    if (!hasPremiumAccess) {
        return (
            <div className='min-h-screen bg-mint-to-white font-poppins-400 p-4'>
                <div className='max-w-[1000px] mx-auto flex min-h-[calc(100vh-7rem)] flex-col'>
                    <Header />

                    <section className='flex min-h-[55vh] items-center justify-center px-4'>
                        <div className='flex max-w-[22rem] flex-col items-center text-center'>
                            <div className='flex h-[5rem] w-[5rem] items-center justify-center rounded-full bg-[#1F5D57] shadow-[0_16px_36px_rgba(31,93,87,0.24)]'>
                                <Crown className='h-9 w-9 text-white' />
                            </div>
                            <h2 className='mt-5 font-sniglet-400 whitespace-pre-line text-[1.6rem] leading-[2rem] text-secondary'>
                                {'Offline listening\nrequires Premium'}
                            </h2>
                            <p className='mt-3 whitespace-pre-line text-[0.95rem] leading-6 text-[#6B7280]'>
                                {'Upgrade to Premium to download\nand listen anytime offline'}
                            </p>

                            <Link
                                href='/plans'
                                className='mt-6 w-96 inline-flex min-h-11 items-center justify-center rounded-lg text-[#1F5D57] border-2 border-[#1F5D57] px-6 py-3 font-poppins-600 text-sm shadow-[0_14px_30px_rgba(31,93,87,0.18)] transition-all'
                            >
                                Upgrade your plan
                            </Link>

                            {formattedPeriodEnd && (
                                <p className='mt-3 text-[0.85rem] text-[#1F5D57]'>
                                    Trial ends on <span className='font-poppins-600'>{formattedPeriodEnd}</span>
                                </p>
                            )}

                            <div className='absolute right-0 bottom-0 z-0 w-full flex justify-end pointer-events-none'>
                                <Image
                                    src='/images/download.png'
                                    alt='No downloads illustration'
                                    width={700}
                                    height={600}
                                    className='w-full max-w-[40rem] h-auto object-contain'
                                />
                            </div>
                        </div>
                    </section>
                </div>
                <BottomNav activeTab='downloads' />
            </div>
        )
    }


    return (
        <div className='min-h-screen bg-mint-to-white font-poppins-400 p-4'>
            <div className='max-w-[1000px] mx-auto'>
                <Header />
                <div>
                    <p className='font-sniglet-400 text-[24px] text-[#1F5D57]'>Access your saved meditations
                        anytime, even offline.</p>
                    <div className='my-4'>
                        {downloads.length === 0 ? (
                            <section className='flex min-h-[55vh] items-center justify-center px-4'>
                                <div className='flex max-w-[22rem] flex-col items-center text-center'>
                                    <div className='flex h-[5rem] w-[5rem] items-center justify-center rounded-full bg-[#1F5D57] shadow-[0_16px_36px_rgba(31,93,87,0.24)]'>
                                        <Download className='h-9 w-9 text-white' />
                                    </div>
                                    <h2 className='mt-5 font-sniglet-400 whitespace-pre-line text-[1.6rem] leading-[2rem] text-secondary'>
                                        {'No downloads\nyet'}
                                    </h2>
                                    <p className='mt-3 whitespace-pre-line text-[0.95rem] leading-6 text-[#6B7280]'>
                                        {'Download meditations to listen\nwithout internet'}
                                    </p>
                                    <Link
                                        href='/home'
                                        className='mt-6 w-96 inline-flex min-h-11 items-center justify-center rounded-lg text-[#1F5D57] border-2 border-[#1F5D57] px-6 py-3 font-poppins-600 text-sm shadow-[0_14px_30px_rgba(31,93,87,0.18)] transition-all'
                                    >
                                        Browse Meditations
                                    </Link>

                                    <div className='absolute right-0 bottom-0 z-0 w-full flex justify-end pointer-events-none'>
                                        <Image
                                            src='/images/download.png'
                                            alt='No downloads illustration'
                                            width={700}
                                            height={600}
                                            className='w-full max-w-[40rem] h-auto object-contain'
                                        />
                                    </div>
                                </div>
                            </section>
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