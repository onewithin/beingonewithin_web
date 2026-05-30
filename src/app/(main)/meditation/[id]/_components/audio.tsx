'use client'
import { Pause, Play, RotateCcw, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react'
import React, { useRef, useState, useEffect, useCallback } from 'react'
import { updateMeditationWatchTime } from '@/lib/actions/meditation'
import { useAudio } from '@/contexts/AudioContext'

function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
}

interface AudioProgressBarProps {
    audioSrc: string;
    meditationId: string;
    title: string;
    thumbnail: string;
    watchHistoryId: string | null;
    totalDuration: number;
    initialWatchedDuration?: number;
    contentType: 'meditation' | 'thought';
}

function AudioProgressBar({
    audioSrc,
    meditationId,
    title,
    thumbnail,
    watchHistoryId,
    totalDuration,
    initialWatchedDuration = 0,
    contentType
}: AudioProgressBarProps) {
    const saveIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const lastSavedTimeRef = useRef<number>(initialWatchedDuration)
    const {
        setNowPlaying,
        isPlaying,
        currentTime,
        duration,
        volume,
        setVolume,
        pauseAudio,
        playAudio,
        seekTo,
        audioRef,
        nowPlaying
    } = useAudio()

    const [progress, setProgress] = useState(0)
    const [isLoading, setIsLoading] = useState(true)

    // Set global audio context when component mounts
    useEffect(() => {
        setNowPlaying({
            id: meditationId,
            title,
            thumbnail,
            audioSrc,
            contentType,
            watchHistoryId,
        })

        return () => {
            // Don't clear nowPlaying on unmount - let it persist
        }
    }, [meditationId, title, thumbnail, audioSrc, contentType, watchHistoryId, setNowPlaying])

    // Update progress based on currentTime and duration
    useEffect(() => {
        if (duration > 0) {
            setProgress((currentTime / duration) * 100)
        }
    }, [currentTime, duration])

    // Set loading false once audio metadata is loaded
    useEffect(() => {
        if (duration > 0) {
            setIsLoading(false)
        }
    }, [duration])

    // Restore previous watch position when audio loads
    useEffect(() => {
        if (duration > 0 && initialWatchedDuration > 0 && initialWatchedDuration < duration) {
            // Only restore if we haven't already moved past this point
            if (currentTime < 1) {
                seekTo(initialWatchedDuration)
            }
        }
    }, [duration, initialWatchedDuration, seekTo, currentTime])

    // Save watch progress to backend
    const saveWatchProgress = useCallback(async (watchedSeconds: number, isCompleted: boolean = false) => {
        // Only save for meditation type
        if (contentType !== 'meditation' || !watchHistoryId) return

        // Only save if there's a significant change (>5 seconds or completed)
        const timeDiff = Math.abs(watchedSeconds - lastSavedTimeRef.current)
        if (!isCompleted && timeDiff < 5) return

        lastSavedTimeRef.current = watchedSeconds

        try {
            await updateMeditationWatchTime(watchHistoryId, Math.floor(watchedSeconds), isCompleted)
        } catch (error) {
            console.error('Failed to save watch progress:', error)
        }
    }, [watchHistoryId, contentType])

    // Auto-save progress every 10 seconds while playing
    useEffect(() => {
        if (isPlaying && contentType === 'meditation') {
            saveIntervalRef.current = setInterval(() => {
                saveWatchProgress(currentTime, false)
            }, 10000) // Save every 10 seconds
        } else {
            if (saveIntervalRef.current) {
                clearInterval(saveIntervalRef.current)
                saveIntervalRef.current = null
            }
        }

        return () => {
            if (saveIntervalRef.current) {
                clearInterval(saveIntervalRef.current)
            }
        }
    }, [isPlaying, contentType, currentTime, saveWatchProgress])

    // Track when audio ends to mark as completed
    useEffect(() => {
        const audio = audioRef.current
        if (!audio) return

        const handleEnded = () => {
            if (contentType === 'meditation' && watchHistoryId) {
                saveWatchProgress(duration, true)
            }
        }

        audio.addEventListener('ended', handleEnded)
        return () => {
            audio.removeEventListener('ended', handleEnded)
        }
    }, [audioRef, contentType, watchHistoryId, duration, saveWatchProgress])

    // Save on unmount/page leave
    useEffect(() => {
        return () => {
            if (contentType === 'meditation' && currentTime > 0) {
                saveWatchProgress(currentTime, false)
            }
        }
    }, [contentType, currentTime, saveWatchProgress])

    const togglePlayPause = () => {
        if (isPlaying) {
            pauseAudio()
            // Save progress on pause
            saveWatchProgress(currentTime, false)
        } else {
            playAudio()
        }
    }

    const handleRestart = () => {
        seekTo(0)
        if (!isPlaying) {
            playAudio()
        }
    }

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!duration) return

        const rect = e.currentTarget.getBoundingClientRect()
        const clickX = e.clientX - rect.left
        const percentage = clickX / rect.width
        const newTime = percentage * duration

        seekTo(newTime)

        // Save on seek
        saveWatchProgress(newTime, false)
    }

    const skipForward = () => {
        seekTo(Math.min(currentTime + 10, duration))
    }

    const skipBackward = () => {
        seekTo(Math.max(currentTime - 10, 0))
    }

    // Skeleton loader while audio is loading
    if (isLoading) {
        return (
            <div className="w-full max-w-[50rem] mx-auto">
                <div className="flex items-center gap-2 font-poppins-400 w-full mt-2 animate-pulse">
                    <div className="h-4 w-[2.5rem] bg-gray-300 rounded"></div>

                    {/* Progress bar skeleton */}
                    <div className="relative h-4 flex-1">
                        <div className="absolute top-1/2 -translate-y-1/2 w-full h-1 bg-gray-300 rounded"></div>
                    </div>

                    {/* Duration skeleton */}
                    <div className="h-4 w-[2.5rem] bg-gray-300 rounded"></div>

                    {/* Controls skeleton */}
                    <div className="ml-3 flex gap-2 items-center">
                        <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                        <div className="mx-3 flex gap-3">
                            <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                            <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                            <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                            <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
                            <div className="w-[5rem] h-1 bg-gray-300 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full max-w-[50rem] mx-auto">
            <div className="flex items-center gap-2 font-poppins-400 w-full mt-2">
                <p className="text-sm w-[2.5rem] text-right text-color">{formatTime(currentTime)}</p>

                {/* Progress bar */}
                <div
                    className="relative h-4 flex-1 cursor-pointer"
                    onClick={handleSeek}
                >
                    <div className="absolute top-1/2 -translate-y-1/2 w-full h-1 bg-gray-300 rounded"></div>

                    <div
                        className="absolute top-1/2 -translate-y-1/2 h-1 bg-primary rounded transition-all duration-200 ease-linear"
                        style={{ width: `${progress}%` }}
                    ></div>

                    <div
                        className="absolute top-1/2 w-3 h-3 bg-primary rounded-full shadow-md transition-all duration-200 ease-linear"
                        style={{
                            left: `${progress}%`,
                            transform: 'translate(-50%, -50%)',
                        }}
                    ></div>
                </div>

                {/* Duration */}
                <p className="text-sm w-[2.5rem] text-color">{formatTime(duration)}</p>

                {/* Controls */}
                <div className="ml-3 flex gap-2 items-center">
                    <button onClick={handleRestart} aria-label="Restart" className="hover:scale-110 transition-transform">
                        <RotateCcw className="w-6 h-6 text-secondary" />
                    </button>
                    <div className="mx-3 flex gap-3">
                        <button onClick={skipBackward} aria-label="Skip back 10 seconds" className="hover:scale-110 transition-transform">
                            <SkipBack className="w-6 h-6 text-secondary" />
                        </button>
                        <button
                            onClick={togglePlayPause}
                            disabled={isLoading}
                            className="mx-3 p-2 rounded-full bg-primary flex flex-row items-center justify-center hover:scale-110 transition-transform disabled:opacity-50"
                            aria-label={isPlaying ? 'Pause' : 'Play'}
                        >
                            {isPlaying ? (
                                <Pause className="w-6 h-6 text-white fill-white" />
                            ) : (
                                <Play className="w-6 h-6 text-white fill-white" />
                            )}
                        </button>
                        <button onClick={skipForward} aria-label="Skip forward 10 seconds" className="hover:scale-110 transition-transform">
                            <SkipForward className="w-6 h-6 text-secondary" />
                        </button>
                    </div>

                    {/* Volume control */}
                    <div className="flex items-center gap-2 ml-4">
                        <button
                            onClick={() => setVolume(volume > 0 ? 0 : 1)}
                            aria-label={volume > 0 ? 'Mute' : 'Unmute'}
                            className="hover:scale-110 transition-transform"
                        >
                            {volume > 0 ? (
                                <Volume2 className="w-5 h-5 text-secondary" />
                            ) : (
                                <VolumeX className="w-5 h-5 text-secondary" />
                            )}
                        </button>
                        <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.01}
                            value={volume}
                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                            className="w-[5rem] h-1 cursor-pointer accent-primary"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AudioProgressBar
