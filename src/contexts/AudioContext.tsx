'use client'
import React, { createContext, useContext, useState, useRef, ReactNode, useEffect } from 'react'
import { usePathname } from 'next/navigation'

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
    bgMusicEnabled: boolean
    setNowPlaying: (data: NowPlaying | null) => void
    setVolume: (vol: number) => void
    pauseAudio: () => void
    playAudio: () => void
    seekTo: (time: number) => void
    closePlayer: () => void
    setBgMusicEnabled: (enabled: boolean) => void
    audioRef: React.RefObject<HTMLAudioElement | null>
}

const BG_MUSIC_ENABLED_STORAGE_KEY = 'bgMusicEnabled'

const AudioContext = createContext<AudioContextType | undefined>(undefined)

export function AudioProvider({ children }: { children: ReactNode }) {
    const pathname = usePathname()
    const audioRef = useRef<HTMLAudioElement>(null)
    const bgMusicRef = useRef<HTMLAudioElement>(null)
    const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [volume, setVolume] = useState(1)
    const [hasUserInteracted, setHasUserInteracted] = useState(false)
    const [bgMusicEnabled, setBgMusicEnabledState] = useState(true)
    const isMeditationDetailsRoute = pathname?.startsWith('/meditation/')

    const playWithAutoplayGuard = (
        audio: HTMLAudioElement | null,
        forceFromUserAction: boolean = false,
    ) => {
        if (!audio) return
        if (!forceFromUserAction && !hasUserInteracted) return

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

        const normalizeSrc = (value: string) => {
            try {
                return new URL(value, window.location.origin).href
            } catch {
                return value
            }
        }

        const currentSrc = audio.getAttribute('src') || audio.currentSrc || ''
        const normalizedCurrentSrc = currentSrc ? normalizeSrc(currentSrc) : ''
        const normalizedNowPlayingSrc = normalizeSrc(nowPlaying.audioSrc)

        if (normalizedCurrentSrc !== normalizedNowPlayingSrc) {
            // Reset visible player state while new metadata is loading.
            setIsPlaying(false)
            setCurrentTime(0)
            setDuration(0)
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

        const storedPreference = window.localStorage.getItem(BG_MUSIC_ENABLED_STORAGE_KEY)
        if (storedPreference !== null) {
            setBgMusicEnabledState(storedPreference === 'true')
        }
    }, [])

    // Keep background music running continuously once user interaction is available.
    useEffect(() => {
        const bgMusic = bgMusicRef.current
        if (!bgMusic) return

        if (isMeditationDetailsRoute || !bgMusicEnabled) {
            if (!bgMusic.paused) {
                bgMusic.pause()
            }
            bgMusic.currentTime = 0
            return
        }

        playWithAutoplayGuard(bgMusic)
    }, [hasUserInteracted, isMeditationDetailsRoute, bgMusicEnabled])

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
        // Explicit play button click should always attempt playback.
        playWithAutoplayGuard(audioRef.current, true)

        if (!isMeditationDetailsRoute && bgMusicEnabled && bgMusicRef.current) {
            playWithAutoplayGuard(bgMusicRef.current, true)
        }
    }

    const setBgMusicEnabled = (enabled: boolean) => {
        setBgMusicEnabledState(enabled)
        window.localStorage.setItem(BG_MUSIC_ENABLED_STORAGE_KEY, String(enabled))

        if (!enabled && bgMusicRef.current) {
            bgMusicRef.current.pause()
            bgMusicRef.current.currentTime = 0
        } else if (enabled && !isMeditationDetailsRoute) {
            playWithAutoplayGuard(bgMusicRef.current, true)
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
                bgMusicEnabled,
                audioRef,
                setNowPlaying,
                setVolume,
                pauseAudio,
                playAudio,
                seekTo,
                closePlayer,
                setBgMusicEnabled,
            }}
        >
            {/* Global audio element that persists across page navigation */}
            <audio ref={audioRef} preload="auto" />
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
