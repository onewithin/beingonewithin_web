import React from 'react'
import Header from './_components/header'
import BadgeSelector from './_components/category'
import LibraryActions from './_components/LibraryActions'
import LibraryInfiniteList from './_components/library-infinite-list'
import LibraryListLoadingOverlay from './_components/list-loading-overlay'
import BottomNav from '@/components/bottomNav'
import { getLibraryBadgesData, getLibraryPlaylistMeditationsPaginated } from '@/lib/server/home'

type PageProps = {
    searchParams?: Promise<{
        playlistId?: string
    }>
}

async function MyLibrary({ searchParams }: PageProps) {
    const PAGE_SIZE = 12
    const resolvedSearchParams = (await searchParams) ?? {}
    const libraryBadges = await getLibraryBadgesData(50)
    const requestedPlaylistId = resolvedSearchParams.playlistId
    const selectedPlaylistId = libraryBadges.some((badge) => badge.id === requestedPlaylistId)
        ? requestedPlaylistId
        : libraryBadges[0]?.id

    const initialLibraryResult = selectedPlaylistId
        ? await getLibraryPlaylistMeditationsPaginated(selectedPlaylistId, PAGE_SIZE, 1)
        : { data: [], hasMore: false }

    return (
        <div className='min-h-screen bg-mint-to-white font-poppins-400 p-4'>
            <div className=' md:max-w-[600px] lg:max-w-[800px] xl:max-w-[1000px] mx-auto'>
                <div className=' flex justify-between items-center'>
                    <Header />
                    <LibraryActions />
                </div>
                <div>
                    <p className='font-sniglet-400 text-[24px] text-[#1F5D57]'>Organize your meditations.</p>
                    <div className='my-4'>
                        {/* <Badge className={'border border-[#2B7272] bg-[#DDF3E5C7] text-[12px] text-[#2B7272] rounded-full font-poppins-400'}>
                            <Volume2 className='fill-[#2B7272] h-[20px] w-[20px]' />
                            Audio
                        </Badge> */}
                        <BadgeSelector badges={libraryBadges} selectedBadgeId={selectedPlaylistId} />
                        <div className='relative'>
                            <LibraryListLoadingOverlay />
                            <LibraryInfiniteList
                                key={selectedPlaylistId || 'empty-playlist'}
                                playlistId={selectedPlaylistId}
                                initialMeditations={initialLibraryResult.data}
                                initialHasMore={initialLibraryResult.hasMore}
                                pageSize={PAGE_SIZE}
                            />
                        </div>

                    </div>
                </div>
            </div>
            <BottomNav activeTab='library' />
        </div >
    )
}

export default MyLibrary