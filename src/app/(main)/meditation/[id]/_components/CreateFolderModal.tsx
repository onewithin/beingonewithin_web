'use client'
import React, { useState, useTransition } from 'react'
import { X } from 'lucide-react'
import { createPlaylist, getUserPlaylists, type Playlist } from '@/lib/actions/playlist'

interface CreateFolderModalProps {
    isOpen: boolean
    onClose: () => void
    onCreated: (playlist: Playlist) => void
}

function CreateFolderModal({ isOpen, onClose, onCreated }: CreateFolderModalProps) {
    const [name, setName] = useState('')
    const [errorMessage, setErrorMessage] = useState('')
    const [isPending, startTransition] = useTransition()

    const handleClose = () => {
        setName('')
        setErrorMessage('')
        onClose()
    }

    const handleCreate = () => {
        if (!name.trim()) {
            setErrorMessage('Folder name is required')
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
                    setErrorMessage('Folder already exists. Try a different name.')
                    return
                }
            }

            const result = await createPlaylist({
                name: name.trim(),
            })

            if (!result.success || !result.playlist) {
                setErrorMessage(result.error || 'Failed to create folder')
                return
            }

            onCreated(result.playlist)
            handleClose()
        })
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" onClick={handleClose}>
            <div
                className="w-full max-w-sm rounded-2xl bg-white shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b p-4">
                    <h3 className="font-poppins-600 text-lg text-secondary">New Folder</h3>
                    <button
                        onClick={handleClose}
                        className="rounded-full p-2 transition-colors hover:bg-gray-100"
                        aria-label="Close create folder modal"
                    >
                        <X className="h-5 w-5 text-gray-600" />
                    </button>
                </div>

                <div className="p-4">
                    <label className="mb-2 block text-sm font-poppins-600 text-secondary">Folder name</label>
                    <input
                        type="text"
                        placeholder="Enter folder name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={isPending}
                    />

                    {errorMessage && (
                        <p className="mt-3 text-xs text-red-600">{errorMessage}</p>
                    )}
                </div>

                <div className="flex gap-2 border-t p-4">
                    <button
                        onClick={handleClose}
                        disabled={isPending}
                        className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-poppins-600 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreate}
                        disabled={isPending}
                        className="flex-1 rounded-lg bg-primary py-2 text-sm font-poppins-600 text-white hover:bg-primary/90 disabled:opacity-50"
                    >
                        {isPending ? 'Creating...' : 'Create'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CreateFolderModal
