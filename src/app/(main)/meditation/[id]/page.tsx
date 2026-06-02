import React from 'react'
import Header from './_components/header'
import AudioImage from './_components/image'
import AudioProgressBar from './_components/audio'
import { getMeditationOrThoughtDetail } from '@/lib/server/meditation'
import { getSubscriptionStatus } from '@/lib/actions/subscription'
import { notFound, redirect } from 'next/navigation'
import { formatSecondsMMSS, formatMinutes, getDarkerColor } from '@/lib/utils'

interface PageProps {
    params: Promise<{ id: string }>
    searchParams?: Promise<{ type?: 'meditation' | 'thought' }>
}

async function MeditationDetails({ params, searchParams }: PageProps) {
    const { id } = await params
    const { type } = (await searchParams) || {}

    // Fetch meditation or thought details
    const result = await getMeditationOrThoughtDetail(id, type)

    // If content not found, show 404
    if (!result) {
        notFound()
    }

    const { data, type: contentType, watchHistory } = result

    const isPremiumMeditation =
        contentType === 'meditation' &&
        'isPremium' in data &&
        Boolean(data.isPremium)

    if (isPremiumMeditation) {
        const subscriptionResult = await getSubscriptionStatus()
        const data = subscriptionResult.ok ? subscriptionResult.data : null
        const hasAccessFlag = (data as { hasAccessToPremium?: boolean; isPremium?: boolean } | null)?.hasAccessToPremium
            ?? (data as { hasAccessToPremium?: boolean; isPremium?: boolean } | null)?.isPremium
        const activeStatus = (data as { activeSubscription?: { status?: string | null } | null } | null)?.activeSubscription?.status ?? null
        const hasPremiumAccess = typeof hasAccessFlag === 'boolean'
            ? hasAccessFlag
            : activeStatus === 'ACTIVE' || activeStatus === 'TRIALING'

        if (!hasPremiumAccess) {
            redirect('/plans')
        }
    }

    // Extract common properties
    const title = data.title || 'Untitled'
    const description = data.description || ''
    const thumbnail = data.thumbnail || '/icons/flower-1.png'
    const link = data.link || ''
    const category = contentType === 'meditation' && 'category' in data ? data.category : null
    const categoryBackgroundImage = category?.backgroundImage || null
    const hasBackgroundImage =
        typeof categoryBackgroundImage === 'string' && categoryBackgroundImage.trim().length > 0
    const fallbackColor = category?.color || '#DDF3E5'
    const accentTextColor = getDarkerColor(fallbackColor, 140)


    // Check if liked (for meditation)
    const isLiked = contentType === 'meditation' && 'isLiked' in data ? data.isLiked : false

    // Get watch history data (for meditation)
    const watchHistoryId = watchHistory?.id || null
    const watchedDuration = watchHistory?.watchedSeconds || 0
    const watchHistoryCompleted = watchHistory?.completed || false

    // Get category name for header
    const categoryName = contentType === 'meditation' && 'category' in data && data.category
        ? data.category.name
        : contentType === 'thought'
            ? '✨ Daily Thoughts'
            : 'Meditation'

    const formattedDuration = contentType === 'thought'
        ? formatMinutes(data.duration)
        : formatSecondsMMSS(data.duration ?? null)

    const metaLabel = contentType === 'thought'
        ? `${formattedDuration} • Daily Thought`
        : `${formattedDuration} • ${categoryName}`

    return (
        <div className='min-h-screen bg-white font-poppins-400'>
            <section
                className='absolute h-[42vh] min-h-[14rem] w-full overflow-hidden bg-white'
                style={
                    hasBackgroundImage
                        ? undefined
                        : {
                            background: `linear-gradient(180deg, ${fallbackColor} 0%, ${fallbackColor}CC 45%, #ffffff 100%)`,
                        }
                }
            >
                {hasBackgroundImage && (
                    <img
                        src={categoryBackgroundImage as string}
                        alt={category?.name || title}
                        className='absolute inset-0 h-full w-full object-cover object-center brightness-105 contrast-105 saturate-105'
                    />
                )}

                {hasBackgroundImage ? (
                    <div
                        className='pointer-events-none absolute bottom-0 left-0 right-0 h-[46%]'
                        style={{
                            background:
                                'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.42) 40%, rgba(255,255,255,0.75) 70%, #ffffff 100%)',
                        }}
                    />
                ) : (
                    <div className='pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-white/12 to-white/90' />
                )}

                <div className='absolute top-4 inset-x-0'>
                    <div className='mx-auto w-full max-w-[56rem] px-5'>
                        <Header categoryName={categoryName} />
                    </div>
                </div>
            </section>

            <section className='relative z-10 -mt-px mx-auto w-full max-w-[56rem] px-8 pb-40 pt-24'>
                <div className='my-2'>
                    <AudioImage
                        thumbnail={thumbnail}
                        meditationId={id}
                        initialLiked={isLiked}
                        contentType={contentType}
                    />

                    <h1
                        className='font-sniglet-400 text-[2rem] text-center mt-6'
                        style={{ color: accentTextColor }}
                    >
                        {title}
                    </h1>

                    <p
                        className='mt-2 text-center text-sm font-poppins-400'
                        style={{ color: accentTextColor }}
                    >
                        {metaLabel}
                    </p>

                    {description && (
                        <p
                            className='mt-4 text-center text-sm px-4 max-w-[45rem] mx-auto'
                            style={{ color: accentTextColor }}
                        >
                            {description}
                        </p>
                    )}

                </div>
            </section>

            <section className='fixed bottom-0 inset-x-0 z-40'>
                <div className='mx-auto w-full min-h-[7rem] bg-white'>
                    <div className='rounded-t-[1.5rem] border-x border-t border-[#E8EDEB] bg-white/96 px-4 py-3 shadow-[0_-14px_40px_rgba(31,93,87,0.12)]'>
                        <AudioProgressBar
                            audioSrc={link}
                            meditationId={id}
                            title={title}
                            thumbnail={thumbnail}
                            watchHistoryId={watchHistoryId}
                            totalDuration={data.duration as number}
                            initialWatchedDuration={watchedDuration}
                            initialHistoryCompleted={watchHistoryCompleted}
                            contentType={contentType}
                            accentColor={accentTextColor}
                        />
                    </div>
                </div>
            </section>
        </div>
    )
}

export default MeditationDetails