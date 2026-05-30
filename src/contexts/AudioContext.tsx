'use client'
import React, { createContext, useContext, useState, useRef, ReactNode, useEffect } from 'react'

export interface NowPlaying {
    id: string
    title: string
    thumbnail: string
    audioSrc: string
    contentType: 'meditation' | 'thought'
    watchHistoryId: string | null
}

interface AudioContextType {
    nowPlaying: NowPlaying | null
    isPlaying: boolean
    currentTime: number
    duration: number
    volume: number
    setNowPlaying: (data: NowPlaying | null) => void
    setVolume: (vol: number) => void
    pauseAudio: () => void
    playAudio: () => void
    seekTo: (time: number) => void
    closePlayer: () => void
    audioRef: React.RefObject<HTMLAudioElement>
}

const AudioContext = createContext<AudioContextType | undefined>(undefined)

export function AudioProvider({ children }: { children: ReactNode }) {
    const audioRef = useRef<HTMLAudioElement>(null)
    const bgMusicRef = useRef<HTMLAudioElement>(null)
    const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [volume, setVolume] = useState(1)

    // Update audio src when nowPlaying changes
    useEffect(() => {
        const audio = audioRef.current
        if (!audio || !nowPlaying) return

        if (audio.src !== nowPlaying.audioSrc) {
            audio.src = nowPlaying.audioSrc
            audio.load()
        }
    }, [nowPlaying])

    // Setup audio event listeners
    useEffect(() => {
        const audio = audioRef.current
        if (!audio) return

        const handleLoadedMetadata = () => {
            setDuration(audio.duration)
        }

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime)
        }

        const handlePlay = () => {
            setIsPlaying(true)
        }

        const handlePause = () => {
            setIsPlaying(false)
        }

        const handleEnded = () => {
            setIsPlaying(false)
        }

        audio.addEventListener('loadedmetadata', handleLoadedMetadata)
        audio.addEventListener('timeupdate', handleTimeUpdate)
        audio.addEventListener('play', handlePlay)
        audio.addEventListener('pause', handlePause)
        audio.addEventListener('ended', handleEnded)

        return () => {
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
            audio.removeEventListener('timeupdate', handleTimeUpdate)
            audio.removeEventListener('play', handlePlay)
            audio.removeEventListener('pause', handlePause)
            audio.removeEventListener('ended', handleEnded)
        }
    }, [])

    // Update audio volume
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume
        }
    }, [volume])

    // Initialize background music on mount
    useEffect(() => {
        const bgMusic = bgMusicRef.current
        if (!bgMusic) return

        // Set background music volume to 30%
        bgMusic.volume = 0.3

        // Preload the background music
        bgMusic.load()

        console.log('Background music initialized:', bgMusic.src)
    }, [])

    // Control background music based on meditation play state
    useEffect(() => {
        const bgMusic = bgMusicRef.current
        if (!bgMusic) return

        if (isPlaying && nowPlaying) {
            console.log('Attempting to play background music...')
            // Ensure audio is loaded before playing
            const playPromise = bgMusic.play()
            if (playPromise !== undefined) {
                playPromise
                    .then(() => console.log('Background music playing'))
                    .catch((error) => {
                        console.error('Background music play error:', error)
                        // If autoplay is blocked, try again after a small delay
                        setTimeout(() => {
                            bgMusic.play()
                                .then(() => console.log('Background music playing after retry'))
                                .catch(err => console.error('Retry failed:', err))
                        }, 100)
                    })
            }
        } else {
            console.log('Pausing background music')
            bgMusic.pause()
        }
    }, [isPlaying, nowPlaying])

    const pauseAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause()
        }
    }

    const playAudio = () => {
        if (audioRef.current) {
            audioRef.current.play()
                .catch((error) => console.error('Play error:', error))
        }
        // Also trigger background music when user clicks play
        if (bgMusicRef.current && nowPlaying) {
            bgMusicRef.current.play()
                .catch((error) => console.error('Background music play error:', error))
        }
    }

    const seekTo = (time: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time
        }
    }

    const closePlayer = () => {
        if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current.currentTime = 0
        }
        if (bgMusicRef.current) {
            bgMusicRef.current.pause()
            bgMusicRef.current.currentTime = 0
        }
        setNowPlaying(null)
        setIsPlaying(false)
    }

    return (
        <AudioContext.Provider
            value={{
                nowPlaying,
                isPlaying,
                currentTime,
                duration,
                volume,
                audioRef,
                setNowPlaying,
                setVolume,
                pauseAudio,
                playAudio,
                seekTo,
                closePlayer,
            }}
        >
            {/* Global audio element that persists across page navigation */}
            <audio ref={audioRef} preload="metadata" />
            {/* Background music that plays during meditation */}
            <audio
                ref={bgMusicRef}
                src="/audios/audio_bg.mp3"
                loop
                preload="auto"

            />
            {children}
        </AudioContext.Provider>
    )
}

export function useAudio() {
    const context = useContext(AudioContext)
    if (context === undefined) {
        throw new Error('useAudio must be used within an AudioProvider')
    }
    return context
}
