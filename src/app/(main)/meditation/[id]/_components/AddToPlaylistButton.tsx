'use client'
import React, { useState } from 'react'
import { ListPlus } from 'lucide-react'
import AddToPlaylistModal from './AddToPlaylistModal'

interface AddToPlaylistButtonProps {
    meditationId: string
    meditationTitle: string
    contentType: 'meditation' | 'thought'
}

function AddToPlaylistButton({ meditationId, meditationTitle, contentType }: AddToPlaylistButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)

    // Only show for meditations, not thoughts
    if (contentType !== 'meditation') return null

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-primary text-primary rounded-full font-poppins-600 hover:bg-primary hover:text-white transition-colors shadow-sm"
            >
                <ListPlus className="w-5 h-5" />
                <span>Add to Playlist</span>
            </button>

            <AddToPlaylistModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                meditationId={meditationId}
                meditationTitle={meditationTitle}
            />
        </>
    )
}

export default AddToPlaylistButton
