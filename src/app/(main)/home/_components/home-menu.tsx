'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Bell, Music } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import { useAudio } from '@/contexts/AudioContext'

export default function HomeMenu() {
    const { bgMusicEnabled, setBgMusicEnabled } = useAudio()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button type="button" aria-label="Open menu">
                    <Image src="/icons/flower1.png" alt="Flower" width={26} height={26} className="w-[1.625rem] h-[1.625rem]" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                    <Link href="/notifications" className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-[#1F5D57]" />
                        <span>Notifications</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onSelect={(event) => event.preventDefault()}
                    className="flex items-center justify-between gap-2"
                >
                    <span className="flex items-center gap-2">
                        <Music className="h-4 w-4 text-[#1F5D57]" />
                        Background Music
                    </span>
                    <Switch
                        checked={bgMusicEnabled}
                        onCheckedChange={setBgMusicEnabled}
                        aria-label="Toggle background music"
                    />
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
