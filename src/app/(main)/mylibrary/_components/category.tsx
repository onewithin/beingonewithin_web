"use client"

import { deletePlaylist, updatePlaylist } from '@/lib/actions/playlist'
import { cn } from '@/lib/utils'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import { Pencil, Trash2, X } from 'lucide-react'
import Image from 'next/image'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type BadgeItem = {
    id: string
    label: string
    count: number
}

const defaultTextColor = 'text-[#2B7272]'
const defaultBgColor = 'bg-white'
const selectedTextColor = 'text-white'
const selectedBgColor = 'bg-[#2B7272]'

type Props = {
    badges: BadgeItem[]
    selectedBadgeId?: string
}

export default function BadgeSelector({ badges, selectedBadgeId }: Props) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const containerRef = useRef<HTMLDivElement | null>(null)
    const [badgeItems, setBadgeItems] = useState(badges)
    const [activeBadgeId, setActiveBadgeId] = useState(selectedBadgeId)
    const [renameBadge, setRenameBadge] = useState<BadgeItem | null>(null)
    const [deleteBadge, setDeleteBadge] = useState<BadgeItem | null>(null)
    const [renameValue, setRenameValue] = useState('')
    const [manageError, setManageError] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const playlistQuerySnapshot = searchParams.toString()

    useEffect(() => {
        setActiveBadgeId(selectedBadgeId)
    }, [selectedBadgeId])

    useEffect(() => {
        if (!pathname || badgeItems.length === 0) return

        // Prefetch first few library tabs for snappier switching.
        badgeItems.slice(0, 4).forEach((badge) => {
            const params = new URLSearchParams(playlistQuerySnapshot)
            params.set('playlistId', badge.id)
            router.prefetch(`${pathname}?${params.toString()}`)
        })
    }, [badgeItems, pathname, router, playlistQuerySnapshot])

    useEffect(() => {
        // Keep optimistic badges (e.g., just-created library) until server props include them.
        setBadgeItems((prev) => {
            const extras = prev.filter((item) => !badges.some((badge) => badge.id === item.id))
            return [...extras, ...badges]
        })
    }, [badges])

    useEffect(() => {
        if (!activeBadgeId || !containerRef.current) return

        const activeElement = containerRef.current.querySelector<HTMLButtonElement>(
            `[data-badge-id="${activeBadgeId}"]`,
        )

        activeElement?.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center',
        })
    }, [activeBadgeId, badgeItems])

    const openRenameModal = (badge: BadgeItem) => {
        setRenameBadge(badge)
        setRenameValue(badge.label)
        setManageError('')
    }

    const closeRenameModal = () => {
        setRenameBadge(null)
        setRenameValue('')
        setManageError('')
    }

    const openDeleteModal = (badge: BadgeItem) => {
        setDeleteBadge(badge)
        setManageError('')
    }

    const closeDeleteModal = () => {
        setDeleteBadge(null)
        setManageError('')
    }

    const handleRename = async () => {
        if (!renameBadge) return

        const nextName = renameValue.trim()
        if (!nextName) {
            setManageError('Library name is required')
            return
        }

        setIsSaving(true)
        setManageError('')

        try {
            const result = await updatePlaylist(renameBadge.id, { name: nextName })

            if (!result.success) {
                setManageError(result.error || 'Failed to rename library')
                return
            }

            setBadgeItems((prev) =>
                prev.map((badge) =>
                    badge.id === renameBadge.id ? { ...badge, label: nextName } : badge,
                ),
            )
            closeRenameModal()
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteBadge) return

        setIsSaving(true)
        setManageError('')

        try {
            const result = await deletePlaylist(deleteBadge.id)

            if (!result.success) {
                setManageError(result.error || 'Failed to delete library')
                return
            }

            const remaining = badgeItems.filter((badge) => badge.id !== deleteBadge.id)
            setBadgeItems(remaining)

            const fallbackId = remaining[0]?.id
            const params = new URLSearchParams(searchParams.toString())

            if (fallbackId) {
                setActiveBadgeId(fallbackId)
                window.dispatchEvent(new CustomEvent('library:playlist-switch-start', { detail: fallbackId }))
                params.set('playlistId', fallbackId)
            } else {
                setActiveBadgeId(undefined)
                params.delete('playlistId')
            }

            const target = params.toString() ? `${pathname}?${params.toString()}` : pathname
            router.push(target, { scroll: false })
            closeDeleteModal()
        } finally {
            setIsSaving(false)
        }
    }

    useEffect(() => {
        const onMeditationRemoved = (event: Event) => {
            const customEvent = event as CustomEvent<{ playlistId?: string }>
            const playlistId = customEvent.detail?.playlistId

            if (!playlistId) return

            setBadgeItems((prev) =>
                prev.map((badge) =>
                    badge.id === playlistId
                        ? { ...badge, count: Math.max(0, badge.count - 1) }
                        : badge,
                ),
            )
        }

        window.addEventListener('library:meditation-removed', onMeditationRemoved as EventListener)
        return () => window.removeEventListener('library:meditation-removed', onMeditationRemoved as EventListener)
    }, [])

    useEffect(() => {
        const onPlaylistCreated = (event: Event) => {
            const customEvent = event as CustomEvent<{ id?: string; name?: string }>
            const id = customEvent.detail?.id
            const name = customEvent.detail?.name

            if (!id || !name) return

            setBadgeItems((prev) => {
                if (prev.some((item) => item.id === id)) return prev
                return [{ id, label: name, count: 0 }, ...prev]
            })
            setActiveBadgeId(id)
        }

        window.addEventListener('library:playlist-created', onPlaylistCreated as EventListener)
        return () => window.removeEventListener('library:playlist-created', onPlaylistCreated as EventListener)
    }, [])

    if (badgeItems.length === 0) {
        return null
    }

    return (
        <div ref={containerRef} className="my-3 flex gap-3 overflow-x-auto whitespace-nowrap pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {badgeItems.map(({ id, label, count }) => {
                const isSelected = activeBadgeId === id

                return (
                    <div key={id} className='relative flex flex-shrink-0 items-center gap-1'>
                        <button
                            type='button'
                            data-badge-id={id}
                            onMouseEnter={() => {
                                const params = new URLSearchParams(playlistQuerySnapshot)
                                params.set('playlistId', id)
                                router.prefetch(`${pathname}?${params.toString()}`)
                            }}
                            onClick={() => {
                                setActiveBadgeId(id)
                                window.dispatchEvent(new CustomEvent('library:playlist-switch-start', { detail: id }))

                                const params = new URLSearchParams(playlistQuerySnapshot)
                                params.set('playlistId', id)
                                router.push(`${pathname}?${params.toString()}`, { scroll: false })
                            }}
                            className={cn(
                                'cursor-pointer rounded-full font-poppins-400 text-[12px] px-3 py-1 flex items-center gap-2',
                                isSelected ? `${selectedBgColor} ${selectedTextColor}` : `${defaultBgColor} ${defaultTextColor}`,
                            )}
                        >
                            {label}
                            <span
                                className={cn(
                                    'h-4 w-4 flex justify-center items-center rounded-sm font-poppins-600 text-[12px] px-2',
                                    isSelected ? `${defaultBgColor} ${defaultTextColor}` : 'bg-[#DEF4E6] text-[#2B7272]',
                                )}
                            >
                                {count}
                            </span>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        type='button'
                                        className={cn(
                                            'rounded-full p-1 transition-colors',
                                            isSelected ? 'text-white hover:bg-white/30' : 'text-[#2B7272] hover:bg-[#EAF7F4]',
                                        )}
                                        aria-label={`Manage ${label}`}
                                    >
                                        <Image
                                            src='/icons/settings.png'
                                            alt='Manage playlist'
                                            width={16}
                                            height={16}
                                            className={isSelected ? 'brightness-0 invert' : ''}
                                        />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align='end'>
                                    <DropdownMenuItem
                                        onSelect={() => openRenameModal({ id, label, count })}
                                        className='text-secondary'
                                    >
                                        <Pencil className='h-4 w-4' />
                                        Rename
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onSelect={() => openDeleteModal({ id, label, count })}
                                        className='text-[#B42318] focus:bg-[#FFF1F0]'
                                    >
                                        <Trash2 className='h-4 w-4' />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </button>


                    </div>
                )
            })}

            {renameBadge && (
                <div className='fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4' onClick={closeRenameModal}>
                    <div className='w-full max-w-sm rounded-2xl bg-white shadow-xl' onClick={(event) => event.stopPropagation()}>
                        <div className='flex items-center justify-between border-b p-4'>
                            <h3 className='font-poppins-600 text-lg text-secondary'>Rename Library</h3>
                            <button
                                onClick={closeRenameModal}
                                className='rounded-full p-2 transition-colors hover:bg-gray-100'
                                aria-label='Close rename library modal'
                            >
                                <X className='h-5 w-5 text-gray-600' />
                            </button>
                        </div>

                        <div className='p-4 space-y-3'>
                            <label className='block text-sm font-poppins-600 text-secondary'>Library name</label>
                            <input
                                type='text'
                                value={renameValue}
                                onChange={(event) => setRenameValue(event.target.value)}
                                className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                disabled={isSaving}
                            />

                            {manageError && (
                                <p className='text-xs text-red-600'>{manageError}</p>
                            )}
                        </div>

                        <div className='flex gap-2 border-t p-4'>
                            <button
                                onClick={closeRenameModal}
                                disabled={isSaving}
                                className='flex-1 rounded-lg border border-gray-300 py-2 text-sm font-poppins-600 hover:bg-gray-50'
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRename}
                                disabled={isSaving}
                                className='flex-1 rounded-lg bg-primary py-2 text-sm font-poppins-600 text-white hover:bg-primary/90 disabled:opacity-50'
                            >
                                {isSaving ? 'Renaming...' : 'Rename'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {deleteBadge && (
                <div className='fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4' onClick={closeDeleteModal}>
                    <div className='w-full max-w-sm rounded-2xl bg-white shadow-xl' onClick={(event) => event.stopPropagation()}>
                        <div className='flex items-center justify-between border-b p-4'>
                            <h3 className='font-poppins-600 text-lg text-secondary'>Delete Library?</h3>
                            <button
                                onClick={closeDeleteModal}
                                className='rounded-full p-2 transition-colors hover:bg-gray-100'
                                aria-label='Close delete library modal'
                            >
                                <X className='h-5 w-5 text-gray-600' />
                            </button>
                        </div>

                        <div className='p-4 space-y-2'>
                            <p className='text-sm text-[#4C4C4C]'>
                                Are you sure you want to delete "{deleteBadge.label}"?
                            </p>

                            {manageError && (
                                <p className='text-xs text-red-600'>{manageError}</p>
                            )}
                        </div>

                        <div className='flex gap-2 border-t p-4'>
                            <button
                                onClick={closeDeleteModal}
                                disabled={isSaving}
                                className='flex-1 rounded-lg border border-gray-300 py-2 text-sm font-poppins-600 hover:bg-gray-50'
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isSaving}
                                className='flex-1 rounded-lg bg-[#B42318] py-2 text-sm font-poppins-600 text-white hover:bg-[#992013] disabled:opacity-50'
                            >
                                {isSaving ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
