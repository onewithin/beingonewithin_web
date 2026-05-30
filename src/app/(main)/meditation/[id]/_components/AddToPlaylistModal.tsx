'use client'
import React, { useState, useEffect, useTransition } from 'react'
import { X, Plus, ListMusic, Check } from 'lucide-react'
import { getUserPlaylists, createPlaylist, addMeditationToPlaylist, type Playlist } from '@/lib/actions/playlist'

interface AddToPlaylistModalProps {
    isOpen: boolean
    onClose: () => void
    meditationId: string
    meditationTitle: string
}

function AddToPlaylistModal({ isOpen, onClose, meditationId, meditationTitle }: AddToPlaylistModalProps) {
    const [playlists, setPlaylists] = useState<Playlist[]>([])
    const [loading, setLoading] = useState(false)
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [newPlaylistName, setNewPlaylistName] = useState('')
    const [newPlaylistDescription, setNewPlaylistDescription] = useState('')
    const [isPending, startTransition] = useTransition()
    const [addedToPlaylist, setAddedToPlaylist] = useState<string | null>(null)

    // Fetch playlists when modal opens
    useEffect(() => {
        if (isOpen) {
            setLoading(true)
            startTransition(async () => {
                const result = await getUserPlaylists()
                if (result.success && result.playlists) {
                    setPlaylists(result.playlists)
                }
                setLoading(false)
            })
        }
    }, [isOpen])

    const handleCreatePlaylist = async () => {
        if (!newPlaylistName.trim()) return

        startTransition(async () => {
            const result = await createPlaylist({
                name: newPlaylistName,
                description: newPlaylistDescription || undefined,
            })

            if (result.success && result.playlist) {
                // Add to playlists list
                setPlaylists([result.playlist, ...playlists])
                // Add meditation to the new playlist
                await addMeditationToPlaylist(result.playlist.id, meditationId)
                setAddedToPlaylist(result.playlist.id)
                // Reset form
                setNewPlaylistName('')
                setNewPlaylistDescription('')
                setShowCreateForm(false)
                // Auto close after 1 second
                setTimeout(() => {
                    onClose()
                }, 1000)
            }
        })
    }

    const handleAddToPlaylist = async (playlistId: string) => {
        startTransition(async () => {
            const result = await addMeditationToPlaylist(playlistId, meditationId)
            if (result.success) {
                setAddedToPlaylist(playlistId)
                // Auto close after 1 second
                setTimeout(() => {
                    onClose()
                }, 1000)
            }
        })
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <div>
                        <h2 className="font-poppins-600 text-lg text-secondary">Add to Playlist</h2>
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
                    {/* Create New Playlist Button */}
                    {!showCreateForm && (
                        <button
                            onClick={() => setShowCreateForm(true)}
                            disabled={isPending}
                            className="w-full flex items-center gap-3 p-4 mb-4 border-2 border-dashed border-primary rounded-lg hover:bg-primary/5 transition-colors"
                        >
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Plus className="w-6 h-6 text-primary" />
                            </div>
                            <span className="font-poppins-600 text-primary">Create New Playlist</span>
                        </button>
                    )}

                    {/* Create Playlist Form */}
                    {showCreateForm && (
                        <div className="mb-4 p-4 border border-primary rounded-lg">
                            <h3 className="font-poppins-600 text-secondary mb-3">New Playlist</h3>
                            <input
                                type="text"
                                placeholder="Playlist name"
                                value={newPlaylistName}
                                onChange={(e) => setNewPlaylistName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                disabled={isPending}
                            />
                            <textarea
                                placeholder="Description (optional)"
                                value={newPlaylistDescription}
                                onChange={(e) => setNewPlaylistDescription(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                rows={2}
                                disabled={isPending}
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={handleCreatePlaylist}
                                    disabled={isPending || !newPlaylistName.trim()}
                                    className="flex-1 py-2 bg-primary text-white rounded-lg font-poppins-600 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Create & Add
                                </button>
                                <button
                                    onClick={() => {
                                        setShowCreateForm(false)
                                        setNewPlaylistName('')
                                        setNewPlaylistDescription('')
                                    }}
                                    disabled={isPending}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Existing Playlists */}
                    <div className="space-y-2">
                        {loading ? (
                            <div className="text-center py-8 text-gray-500">Loading playlists...</div>
                        ) : playlists.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <ListMusic className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                                <p>No playlists yet</p>
                                <p className="text-sm">Create your first playlist above</p>
                            </div>
                        ) : (
                            playlists.map((playlist) => (
                                <button
                                    key={playlist.id}
                                    onClick={() => handleAddToPlaylist(playlist.id)}
                                    disabled={isPending || addedToPlaylist === playlist.id}
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${addedToPlaylist === playlist.id
                                            ? 'bg-green-50 border border-green-300'
                                            : 'hover:bg-gray-50 border border-transparent'
                                        }`}
                                >
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        {playlist.icon ? (
                                            <span className="text-xl">{playlist.icon}</span>
                                        ) : (
                                            <ListMusic className="w-5 h-5 text-primary" />
                                        )}
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="font-poppins-600 text-secondary">{playlist.name}</p>
                                        {playlist.description && (
                                            <p className="text-xs text-gray-500 truncate">
                                                {playlist.description}
                                            </p>
                                        )}
                                    </div>
                                    {addedToPlaylist === playlist.id && (
                                        <Check className="w-5 h-5 text-green-600" />
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AddToPlaylistModal
