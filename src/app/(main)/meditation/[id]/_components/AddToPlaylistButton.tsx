'use client'
import React, { useState } from 'react'
import dynamic from 'next/dynamic'

const AddToPlaylistModal = dynamic(() => import('./AddToPlaylistModal'), {
    ssr: false,
})

interface AddToPlaylistButtonProps {
    meditationId: string
    meditationTitle: string
    contentType: 'meditation' | 'thought'
    accentColor?: string
}

function AddToPlaylistButton({ meditationId, meditationTitle, contentType, accentColor = '#1f2937' }: AddToPlaylistButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)

    // Only show for meditations, not thoughts
    if (contentType !== 'meditation') return null

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                style={{ borderColor: accentColor, color: accentColor }}
                className="inline-flex items-center justify-center rounded-full p-2 hover:bg-gray-100 transition-colors"
                aria-label="Add to playlist"
            >
                <span
                    aria-hidden
                    className="inline-block h-8 w-8"
                    style={{
                        backgroundColor: '#2b7272',
                        WebkitMaskImage: 'url(/icons/add_to_library.png)',
                        WebkitMaskRepeat: 'no-repeat',
                        WebkitMaskPosition: 'center',
                        WebkitMaskSize: 'contain',
                        maskImage: 'url(/icons/add_to_library.png)',
                        maskRepeat: 'no-repeat',
                        maskPosition: 'center',
                        maskSize: 'contain',
                    }}
                />
            </button>

            {isModalOpen && (
                <AddToPlaylistModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    meditationId={meditationId}
                    meditationTitle={meditationTitle}
                />
            )}
        </>
    )
}

export default AddToPlaylistButton
