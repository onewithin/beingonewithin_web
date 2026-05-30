import React from 'react'
import Header from './_components/header'
import AudioImage from './_components/image'
import BottomNav from '@/components/bottomNav'
import AudioProgressBar from './_components/audio'
import AddToPlaylistButton from './_components/AddToPlaylistButton'
import { getMeditationOrThoughtDetail, formatDuration } from '@/lib/server/meditation'
import { notFound } from 'next/navigation'

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

    // Extract common properties
    const title = data.title || 'Untitled'
    const description = data.description || ''
    const thumbnail = data.thumbnail || '/icons/audioImage.jpg'
    const link = data.link || ''


    // Handle duration formatting
    let durationSeconds = 0
    if (contentType === 'meditation' && 'duration' in data && typeof data.duration === 'number') {
        durationSeconds = data.duration
    } else if (contentType === 'thought' && 'duration' in data && typeof data.duration === 'string') {
        // Parse duration string (e.g., "5:30" or "300")
        const parts = data.duration.split(':')
        if (parts.length === 2) {
            durationSeconds = parseInt(parts[0]) * 60 + parseInt(parts[1])
        } else {
            durationSeconds = parseInt(data.duration) || 0
        }
    }

    const formattedDuration = formatDuration(durationSeconds)

    // Check if liked (for meditation)
    const isLiked = contentType === 'meditation' && 'isLiked' in data ? data.isLiked : false

    // Get watch history data (for meditation)
    const watchHistoryId = watchHistory?.id || null
    const watchedDuration = watchHistory?.watchedSeconds || 0

    // Get category name for header
    const categoryName = contentType === 'meditation' && 'category' in data && data.category
        ? data.category.name
        : contentType === 'thought'
            ? '✨ Daily Thoughts'
            : 'Meditation'

    return (
        <div className="relative h-screen p-4 bg-gradient-to-b from-primary to-white overflow-hidden">
            <div className='md:max-w-[37.5rem] lg:max-w-[50rem] xl:max-w-[62.5rem] mx-auto'>
                <Header categoryName={categoryName} />

                <div className='my-6'>
                    <AudioImage
                        thumbnail={thumbnail}
                        meditationId={id}
                        initialLiked={isLiked}
                        contentType={contentType}
                    />
                    <h1 className='font-sniglet-400 text-[2rem] text-center my-5 text-secondary'>
                        {title}
                    </h1>

                    {description && (
                        <p className='text-center text-color text-sm mb-4 px-4 max-w-[37.5rem] mx-auto'>
                            {description}
                        </p>
                    )}

                    <div className='flex justify-center mb-4'>
                        <AddToPlaylistButton
                            meditationId={id}
                            meditationTitle={title}
                            contentType={contentType}
                        />
                    </div>

                    <AudioProgressBar
                        audioSrc={link}
                        meditationId={id}
                        title={title}
                        thumbnail={thumbnail}
                        watchHistoryId={watchHistoryId}
                        totalDuration={durationSeconds}
                        initialWatchedDuration={watchedDuration}
                        contentType={contentType}
                    />
                </div>
            </div>
        </div>
    )
}

export default MeditationDetails