'use client'
import React from 'react'
import Image from 'next/image'
import { Play, Pause, X } from 'lucide-react'
import { useAudio } from '@/contexts/AudioContext'
import { usePathname, useRouter } from 'next/navigation'

function MiniPlayer() {
    const { nowPlaying, isPlaying, pauseAudio, playAudio, closePlayer } = useAudio()
    const pathname = usePathname()
    const router = useRouter()

    // Don't show mini player on the meditation details page itself
    if (!nowPlaying || pathname?.includes(`/meditation/${nowPlaying.id}`)) {
        return null
    }

    const handleClick = () => {
        router.push(`/meditation/${nowPlaying.id}?type=${nowPlaying.contentType}`)
    }

    return (
        <div className="fixed bottom-[4.5rem] md:bottom-[5.5rem] left-1/2 transform -translate-x-1/2 w-full md:w-[401px] bg-white shadow-lg border-t border-gray-200 z-40">
            <div className="flex items-center gap-3 p-3">
                {/* Thumbnail */}
                <div
                    onClick={handleClick}
                    className="relative w-12 h-12 rounded-lg overflow-hidden cursor-pointer flex-shrink-0"
                >
                    <Image
                        src={nowPlaying.thumbnail}
                        fill
                        alt={nowPlaying.title}
                        className="object-cover"
                    />
                </div>

                {/* Title */}
                <div
                    onClick={handleClick}
                    className="flex-1 min-w-0 cursor-pointer"
                >
                    <p className="text-sm font-poppins-600 text-secondary truncate">
                        {nowPlaying.title}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                        {nowPlaying.contentType}
                    </p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={isPlaying ? pauseAudio : playAudio}
                        className="p-2 rounded-full bg-primary hover:bg-primary/90 transition-colors"
                        aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                        {isPlaying ? (
                            <Pause className="w-5 h-5 text-white fill-white" />
                        ) : (
                            <Play className="w-5 h-5 text-white fill-white" />
                        )}
                    </button>

                    <button
                        onClick={closePlayer}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default MiniPlayer
