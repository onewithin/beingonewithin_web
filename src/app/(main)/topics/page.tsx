import BottomNav from '@/components/bottomNav'
import Header from '../mylibrary/_components/header'
import { getTopicMeditationsData } from '@/lib/server/home'
import TopicsInfiniteList from './_components/topics-infinite-list'
import TopicBadgeSelector from './_components/topic-badge-selector'
import TopicsListLoadingOverlay from './_components/topics-list-loading-overlay'

type PageProps = {
    searchParams?: Promise<{
        topicId?: string
    }>
}

async function TopicsPage({ searchParams }: PageProps) {
    const PAGE_SIZE = 12
    const resolvedSearchParams = (await searchParams) ?? {}
    const { topics, activeTopicId, meditations } = await getTopicMeditationsData(resolvedSearchParams.topicId)
    const initialMeditations = meditations.slice(0, PAGE_SIZE)
    const initialHasMore = meditations.length > PAGE_SIZE

    return (
        <div className='min-h-screen bg-mint-to-white font-poppins-400 p-4'>
            <div className='md:max-w-[600px] lg:max-w-[800px] xl:max-w-[1000px] mx-auto'>
                <Header title='Topics' />

                <div className='mt-2'>
                    <p className='font-sniglet-400 text-[24px] text-[#1F5D57]'>Explore meditations by topic.</p>

                    {topics.length === 0 ? (
                        <p className='mt-6 text-sm text-color'>No topics available right now.</p>
                    ) : (
                        <>
                            <TopicBadgeSelector
                                badges={topics.map((topic) => ({ id: topic.id, label: topic.name }))}
                                selectedBadgeId={activeTopicId}
                            />

                            <div className='relative'>
                                <TopicsListLoadingOverlay />
                                {activeTopicId ? (
                                    <TopicsInfiniteList
                                        key={activeTopicId}
                                        topicId={activeTopicId}
                                        initialMeditations={initialMeditations}
                                        initialHasMore={initialHasMore}
                                        pageSize={PAGE_SIZE}
                                    />
                                ) : (
                                    <p className='text-sm text-color'>No meditations found for this topic.</p>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <BottomNav activeTab='home' />
        </div>
    )
}

export default TopicsPage
