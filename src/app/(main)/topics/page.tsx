import BottomNav from '@/components/bottomNav'
import Header from '../mylibrary/_components/header'
import { getTopicMeditationsData } from '@/lib/server/home'
import TopicsInfiniteList from './_components/topics-infinite-list'
import TopicBadgeSelector from './_components/topic-badge-selector'
import TopicsListLoadingOverlay from './_components/topics-list-loading-overlay'
import Image from 'next/image'
import Link from 'next/link'

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
                        <div className='flex min-h-[55vh] items-center justify-center px-4'>
                            <div className='flex max-w-[22rem] flex-col items-center text-center'>
                                <div className='flex h-[5rem] w-[5rem] items-center justify-center rounded-full bg-[#1F5D57] shadow-[0_16px_36px_rgba(31,93,87,0.24)]'>
                                    <Image
                                        src='/icons/meditation.png'
                                        alt='Topics'
                                        width={44}
                                        height={44}
                                        className='h-8 w-8 object-contain brightness-0 invert'
                                    />
                                </div>
                                <h2 className='mt-5 font-sniglet-400 whitespace-pre-line text-[1.6rem] leading-[2rem] text-secondary'>
                                    {'No topics\navailable right now'}
                                </h2>
                                <p className='mt-3 whitespace-pre-line text-[0.95rem] leading-6 text-[#6B7280]'>
                                    {'Please check back shortly or\nexplore all meditations'}
                                </p>
                                <Link
                                    href='/home'
                                    className='mt-6 w-96 inline-flex min-h-11 items-center justify-center rounded-lg text-[#1F5D57] border-2 border-[#1F5D57] px-6 py-3 font-poppins-600 text-sm shadow-[0_14px_30px_rgba(31,93,87,0.18)] transition-all'
                                >
                                    Browse Meditations
                                </Link>
                            </div>
                        </div>
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
                                    <div className='flex min-h-[55vh] items-center justify-center px-4'>
                                        <div className='flex max-w-[22rem] flex-col items-center text-center'>
                                            <div className='flex h-[5rem] w-[5rem] items-center justify-center rounded-full bg-[#1F5D57] shadow-[0_16px_36px_rgba(31,93,87,0.24)]'>
                                                <Image
                                                    src='/icons/meditation.png'
                                                    alt='Topics'
                                                    width={44}
                                                    height={44}
                                                    className='h-8 w-8 object-contain brightness-0 invert'
                                                />
                                            </div>
                                            <h2 className='mt-5 font-sniglet-400 whitespace-pre-line text-[1.6rem] leading-[2rem] text-secondary'>
                                                {'No meditations\nfor this topic yet'}
                                            </h2>
                                            <p className='mt-3 whitespace-pre-line text-[0.95rem] leading-6 text-[#6B7280]'>
                                                {'Try another topic or browse all\nmeditations from home'}
                                            </p>
                                            <Link
                                                href='/home'
                                                className='mt-6 w-96 inline-flex min-h-11 items-center justify-center rounded-lg text-[#1F5D57] border-2 border-[#1F5D57] px-6 py-3 font-poppins-600 text-sm shadow-[0_14px_30px_rgba(31,93,87,0.18)] transition-all'
                                            >
                                                Browse Meditations
                                            </Link>
                                        </div>
                                    </div>
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
