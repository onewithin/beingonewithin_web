"use client"

import { createPlaylist, getUserPlaylists } from '@/lib/actions/playlist'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { X } from 'lucide-react'

function LibraryActions() {
    const router = useRouter()
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [name, setName] = useState('')
    const [errorMessage, setErrorMessage] = useState('')
    const [isPending, startTransition] = useTransition()

    const handleClose = () => {
        setIsCreateOpen(false)
        setName('')
        setErrorMessage('')
    }

    const handleCreate = () => {
        if (!name.trim()) {
            setErrorMessage('Library name is required')
            return
        }

        setErrorMessage('')
        startTransition(async () => {
            const normalizedName = name.trim().toLowerCase()

            const listResult = await getUserPlaylists()
            if (listResult.success) {
                const alreadyExists = (listResult.playlists || []).some(
                    (playlist) => playlist.name.trim().toLowerCase() === normalizedName,
                )

                if (alreadyExists) {
                    setErrorMessage('Library already exists. Try a different name.')
                    return
                }
            }

            const result = await createPlaylist({
                name: name.trim(),
            })

            if (!result.success || !result.playlist) {
                setErrorMessage(result.error || 'Failed to create library')
                return
            }

            window.dispatchEvent(
                new CustomEvent('library:playlist-created', {
                    detail: {
                        id: result.playlist.id,
                        name: result.playlist.name,
                    },
                }),
            )
            window.dispatchEvent(new CustomEvent('library:playlist-switch-start', { detail: result.playlist.id }))

            handleClose()
            const target = `/mylibrary?playlistId=${encodeURIComponent(result.playlist.id)}`
            router.prefetch(target)
            router.push(target, { scroll: false })
        })
    }

    return (
        <>
            <div className='flex gap-4'>
                <button
                    type='button'
                    onClick={() => setIsCreateOpen(true)}
                    className='inline-flex items-center justify-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F5D57]/40'
                    aria-label='Create new library'
                >
                    <Image
                        src='/icons/add_to_library.png'
                        alt='Library'
                        width={24}
                        height={24}
                        className='h-6 w-6 object-contain'
                        style={{ filter: 'brightness(0) saturate(100%) invert(31%) sepia(22%) saturate(908%) hue-rotate(126deg) brightness(92%) contrast(90%)' }}
                    />
                </button>
                <Image src='/icons/flower1.png' alt='Flower' width={24} height={24} className='h-6 w-6 object-contain' />
            </div>

            {isCreateOpen && (
                <div className='fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4' onClick={handleClose}>
                    <div
                        className='w-full max-w-sm rounded-2xl bg-white shadow-xl'
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className='flex items-center justify-between border-b p-4'>
                            <h3 className='font-poppins-600 text-lg text-secondary'>New Library</h3>
                            <button
                                onClick={handleClose}
                                className='rounded-full p-2 transition-colors hover:bg-gray-100'
                                aria-label='Close create library modal'
                            >
                                <X className='h-5 w-5 text-gray-600' />
                            </button>
                        </div>

                        <div className='p-4'>
                            <label className='mb-2 block text-sm font-poppins-600 text-secondary'>Library name</label>
                            <input
                                type='text'
                                placeholder='Enter library name'
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
                                disabled={isPending}
                            />

                            {errorMessage && (
                                <p className='mt-3 text-xs text-red-600'>{errorMessage}</p>
                            )}
                        </div>

                        <div className='flex gap-2 border-t p-4'>
                            <button
                                onClick={handleClose}
                                disabled={isPending}
                                className='flex-1 rounded-lg border border-gray-300 py-2 text-sm font-poppins-600 hover:bg-gray-50'
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={isPending}
                                className='flex-1 rounded-lg bg-primary py-2 text-sm font-poppins-600 text-white hover:bg-primary/90 disabled:opacity-50'
                            >
                                {isPending ? 'Creating...' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default LibraryActions