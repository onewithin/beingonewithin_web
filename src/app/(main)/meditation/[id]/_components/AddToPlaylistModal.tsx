'use client'
import React, { useState, useEffect } from 'react'
import { X, Plus, ListMusic } from 'lucide-react'
import { getUserPlaylists, addMeditationToPlaylist, type Playlist } from '@/lib/actions/playlist'
import dynamic from 'next/dynamic'

const CreateFolderModal = dynamic(() => import('./CreateFolderModal'), {
    ssr: false,
})

interface AddToPlaylistModalProps {
    isOpen: boolean
    onClose: () => void
    meditationId: string
    meditationTitle: string
}

function AddToPlaylistModal({ isOpen, onClose, meditationId, meditationTitle }: AddToPlaylistModalProps) {
    const [playlists, setPlaylists] = useState<Playlist[]>([])
    const [loading, setLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false)
    const [selectedPlaylistId, setSelectedPlaylistId] = useState('')
    const [feedbackMessage, setFeedbackMessage] = useState('')

    const refreshPlaylists = async (createdPlaylist?: Playlist) => {
        const result = await getUserPlaylists()

        if (result.success && result.playlists) {
            const fetched = result.playlists

            if (createdPlaylist) {
                const exists = fetched.some((item) => item.id === createdPlaylist.id)
                setPlaylists(exists ? fetched : [createdPlaylist, ...fetched])
            } else {
                setPlaylists(fetched)
            }

            return
        }

        if (createdPlaylist) {
            setPlaylists((prev) => {
                if (prev.some((item) => item.id === createdPlaylist.id)) {
                    return prev
                }
                return [createdPlaylist, ...prev]
            })
        }

        setFeedbackMessage(result.error || 'Failed to fetch playlists')
    }

    // Fetch playlists when modal opens
    useEffect(() => {
        if (isOpen) {
            setLoading(true)
            setSelectedPlaylistId('')
            setFeedbackMessage('')
            refreshPlaylists().finally(() => {
                setLoading(false)
            })
        }
    }, [isOpen])

    const handleFolderCreated = (playlist: Playlist) => {
        setSelectedPlaylistId(playlist.id)
        setFeedbackMessage('Folder created. Select Save to add this meditation.')

        setLoading(true)
        refreshPlaylists(playlist).finally(() => {
            setLoading(false)
        })
    }

    const handleSaveToPlaylist = async () => {
        if (!selectedPlaylistId) {
            setFeedbackMessage("You haven't selected any folder")
            return
        }

        setIsSaving(true)
        try {
            const result = await addMeditationToPlaylist(selectedPlaylistId, meditationId)
            if (result.success) {
                setFeedbackMessage('Saved to folder')
                setTimeout(() => {
                    onClose()
                }, 700)
            } else {
                setFeedbackMessage(result.error || 'Failed to save in selected folder')
            }
        } finally {
            setIsSaving(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-white rounded-2xl w-full max-w-md h-[560px] max-h-[80vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <div>
                        <h2 className="font-poppins-600 text-lg text-secondary">Choose Folder to Save</h2>
                        <p className="text-xs text-gray-500 truncate">{meditationTitle}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {feedbackMessage && (
                        <div className="mb-3 rounded-lg bg-[#EAF7F4] px-3 py-2 text-xs text-[#1F5D57]">
                            {feedbackMessage}
                        </div>
                    )}

                    <button
                        onClick={() => setIsCreateFolderOpen(true)}
                        disabled={isSaving}
                        className="inline-flex items-center gap-2 rounded-full border border-[#2B7272] bg-[#EAF7F4] px-3 py-1 text-[#2B7272] transition-colors hover:bg-[#DBF0EA]"
                    >
                        <span className="font-poppins-400 text-[11px]">Create New Folder</span>
                        <Plus className="h-3 w-3" />
                    </button>

                    <div className="mt-3 space-y-2">
                        {loading ? (
                            <div className="text-center py-8 text-gray-500">Loading playlists...</div>
                        ) : playlists.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 text-sm">
                                <ListMusic className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                <p>No folders yet</p>
                                <p className="text-sm">Create your first folder above</p>
                            </div>
                        ) : (
                            playlists.map((playlist) => {
                                const isSelected = selectedPlaylistId === playlist.id

                                return (
                                    <button
                                        key={playlist.id}
                                        onClick={() => setSelectedPlaylistId(playlist.id)}
                                        disabled={isSaving}
                                        className={`w-full flex items-center justify-between rounded-lg border p-2.5 text-left transition-colors ${isSelected
                                            ? 'border-primary border-2 bg-[#F7FCFA]'
                                            : 'border-[#D6DFDC] hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="min-w-0 pr-3">
                                            <p className="font-poppins-400 text-[13px] italic text-secondary truncate">{playlist.name}</p>
                                            {playlist.description && (
                                                <p className="text-[11px] text-gray-500 truncate mt-0.5">{playlist.description}</p>
                                            )}
                                        </div>
                                        <div className="rounded bg-[#EAF7F4] px-2 py-0.5 text-[10px] leading-4 text-primary text-center font-poppins-600">
                                            {playlist.meditationCount ?? 0}
                                        </div>
                                    </button>
                                )
                            })
                        )}
                    </div>
                </div>

                <div className="border-t p-4">
                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            disabled={isSaving}
                            className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-poppins-600 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveToPlaylist}
                            disabled={isSaving}
                            className="flex-1 rounded-lg bg-primary py-2 text-sm font-poppins-600 text-white hover:bg-primary/90 disabled:opacity-50"
                        >
                            {isSaving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>
            </div>

            {isCreateFolderOpen && (
                <CreateFolderModal
                    isOpen={isCreateFolderOpen}
                    onClose={() => setIsCreateFolderOpen(false)}
                    onCreated={handleFolderCreated}
                />
            )}
        </div>
    )
}

export default AddToPlaylistModal
