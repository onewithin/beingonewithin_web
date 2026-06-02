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
    audioRef: React.RefObject<HTMLAudioElement | null>
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
    const [hasUserInteracted, setHasUserInteracted] = useState(false)

    const playWithAutoplayGuard = (audio: HTMLAudioElement | null) => {
        if (!audio || !hasUserInteracted) return

        const playPromise = audio.play()
        if (playPromise !== undefined) {
            playPromise.catch((error: unknown) => {
                if (error instanceof DOMException && error.name === 'NotAllowedError') {
                    return
                }

                console.error('Audio play error:', error)
            })
        }
    }

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

    // Browser autoplay policies require a user gesture before programmatic playback.
    useEffect(() => {
        const markInteraction = () => {
            setHasUserInteracted(true)
        }

        document.addEventListener('pointerdown', markInteraction)
        document.addEventListener('keydown', markInteraction)
        document.addEventListener('touchstart', markInteraction)

        return () => {
            document.removeEventListener('pointerdown', markInteraction)
            document.removeEventListener('keydown', markInteraction)
            document.removeEventListener('touchstart', markInteraction)
        }
    }, [])

    // Initialize background music on mount
    useEffect(() => {
        const bgMusic = bgMusicRef.current
        if (!bgMusic) return

        // Set background music volume to 30%
        bgMusic.volume = 0.3

        // Ensure background music loops continuously
        bgMusic.loop = true

        // Preload the background music
        bgMusic.load()

    }, [])

    // Keep background music running continuously once user interaction is available.
    useEffect(() => {
        const bgMusic = bgMusicRef.current
        if (!bgMusic) return

        playWithAutoplayGuard(bgMusic)
    }, [hasUserInteracted])

    // Stop all audio when the browser tab is not active.
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden) return

            if (audioRef.current && !audioRef.current.paused) {
                audioRef.current.pause()
            }

        }

        document.addEventListener('visibilitychange', handleVisibilityChange)

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange)
        }
    }, [])

    const pauseAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause()
        }
    }

    const playAudio = () => {
        playWithAutoplayGuard(audioRef.current)

        if (bgMusicRef.current) {
            playWithAutoplayGuard(bgMusicRef.current)
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
