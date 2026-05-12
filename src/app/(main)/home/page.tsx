import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import BottomNav from '@/components/bottomNav'
import { CloudSun, LockKeyholeOpen, LockOpen, Mic, MoveRight, Play, Sun } from 'lucide-react'
import Link from 'next/link'
import { getHomeData } from '@/lib/server/home'

function colorToPillClass(color?: string | null): string {
    if (!color) return 'bg-[#F1F9F4] text-[#2B7272]'

    const normalized = color.toLowerCase()
    if (normalized.includes('8e4692') || normalized.includes('9256')) return 'bg-[#FFF9FF] text-[#8E4692]'
    if (normalized.includes('545c90') || normalized.includes('4f46')) return 'bg-[#F8F9FF] text-[#545C90]'
    if (normalized.includes('a2605b') || normalized.includes('dc26')) return 'bg-[#FFF7F6] text-[#A2605B]'

    return 'bg-[#F1F9F4] text-[#2B7272]'
}

function formatMinutes(value?: string | number | null): string {
    if (value === null || value === undefined) return '10 min'
    if (typeof value === 'number') return `${value} min`
    return value
}

async function Home() {
    const homeData = await getHomeData()
    const madeForYou = homeData.madeForYou.slice(0, 10)
    const categories = homeData.categories.slice(0, 4)
    const topics = homeData.topics.slice(0, 12)
    const dailyThoughts = homeData.dailyThoughts.slice(0, 4)
    const todayThought = homeData.todayThought || dailyThoughts[0]

    return (
        <div className='min-h-screen bg-mint-to-white font-poppins-400 '>
            <div className='p-4 md:max-w-[600px] lg:max-w-[800px] xl:max-w-[1000px] 2xl:max-w-[1200px] mx-auto'>
                <div className='py-3 flex justify-between items-center'>
                    <div className='inline-flex px-4 py-2 rounded-full gap-2 items-center bg-[#FFFFFF40]'>
                        <CloudSun className='h-6 w-6 ' />
                        <p>{homeData.greeting}</p>
                    </div>
                    <div>
                        <Sun className='h-6 w-6 ' />
                    </div>
                </div>

                <div className='text-center my-16'>
                    <h6 className='font-poppins-400 text-[16px] text-[#000000]'>Today&apos;s Suggestion</h6>
                    <h1 className='font-sniglet-400 leading-[44px] my-4 text-[44px] text-[#2B7272]'>
                        {todayThought?.title || 'Inhale peace, exhale tension.'}
                    </h1>
                    <Badge className='bg-white rounded-full'>
                        <div className='flex gap-2 items-center rounded-full p-1'>
                            <Play className='h-4 w-4 text-[#484848] fill-[#484848]' />
                            <p className='font-poppins-400 text-[#484848] text-[16px]'>
                                {formatMinutes(todayThought?.duration)}
                            </p>
                        </div>
                    </Badge>
                </div>

                <hr
                    className="border-t border-dotted border-[#63AF95] w-full h-0.5 bg-transparent relative"
                    style={{
                        WebkitMaskImage: 'linear-gradient(to right, transparent, white 20%, white 80%, transparent)',
                        maskImage: 'linear-gradient(to right, transparent, white 20%, white 80%, transparent)',
                        WebkitMaskRepeat: 'no-repeat',
                        maskRepeat: 'no-repeat',
                    }}
                />
                <div className='space-y-6'>
                    <section className='bg-white w-full rounded-[30px] p-5 my-16 shadow-sm'>
                        <div className='flex items-center justify-between mb-4'>
                            <p className='text-[#484848] font-sniglet-400 text-lg'>Let&apos;s Begin With</p>
                            <Link href='/meditation' className='text-[#2B7272] text-xs underline'>View All</Link>
                        </div>

                        {categories.length === 0 ? (
                            <p className='text-sm text-[#484848]'>No categories available right now.</p>
                        ) : (
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                {categories.map((category) => (
                                    <div
                                        key={category.id}
                                        className={`h-[123px] rounded-[30px] flex flex-col items-center justify-center text-center px-3 ${colorToPillClass(category.color)}`}
                                    >
                                        <p className='font-poppins-600 text-[14px] leading-tight'>{category.name}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className='w-full max-w-screen overflow-hidden'>
                        <p className='text-[#484848] font-sniglet-400 text-lg mb-4'>Made for you</p>

                        {madeForYou.length === 0 ? (
                            <p className='text-sm text-[#484848]'>Complete onboarding to unlock personalized recommendations.</p>
                        ) : (
                            <div className='overflow-x-auto scrollbar-hide'>
                                <div className='flex gap-5 px-1 min-w-max'>
                                    {madeForYou.map((meditation) => (
                                        <Link href={`/meditation/${meditation.id}`} key={meditation.id}>
                                            <div className='p-2 w-[204px] rounded-[20px] bg-[#F5F5F5] inline-flex'>
                                                <div className='relative w-[200px] h-[202px] rounded-[20px] overflow-hidden bg-gradient-to-b from-[#DDF3E5] to-[#9BC8B6]'>
                                                    {meditation.isLiked && (
                                                        <div className='absolute top-3 right-3 w-[30px] h-[30px] bg-[#FF0000] rounded-full flex justify-center items-center text-white text-xs'>
                                                            ❤
                                                        </div>
                                                    )}

                                                    <div className='absolute bottom-0 w-full px-3 py-2 backdrop-blur-[2px] bg-black/10 text-white rounded-b-[20px]'>
                                                        <p className='font-poppins-700 text-[14px] leading-tight line-clamp-2'>
                                                            {meditation.title}
                                                        </p>
                                                        <p className='font-poppins-400 text-[10px] leading-tight mt-1'>
                                                            {formatMinutes(meditation.duration)} • {meditation.category?.name || 'Guided'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>

                    <section className='my-16'>
                        <div className='bg-[#DDF3E5] w-full rounded-[30px] p-5'>
                            <p className='text-center my-3 font-poppins-600 text-[#1F5D57]'>✨ Daily Thought</p>
                            {dailyThoughts.length === 0 ? (
                                <p className='text-center text-sm text-[#1F5D57]'>No thoughts available right now.</p>
                            ) : (
                                dailyThoughts.slice(0, 1).map((thought) => (
                                    <Link href='/daily-thoughts' key={thought.id}>
                                        <div className='bg-white w-full min-h-[80px] my-2 rounded-[30px] p-3 flex justify-between items-center'>
                                            <div className='flex gap-3 items-center'>
                                                <div className='w-10 h-10 rounded-full bg-[#F8F9FF] flex items-center justify-center text-[#1F5D57]'>
                                                    ✨
                                                </div>
                                                <div>
                                                    <p className='font-poppins-600 text-[#1F5D57] text-[16px] line-clamp-1'>
                                                        {thought.title}
                                                    </p>
                                                    <p className='text-[#484848] font-poppins-400 text-[12px]'>
                                                        {formatMinutes(thought.duration)} • Daily Thought
                                                    </p>
                                                </div>
                                            </div>
                                            <div className='bg-[#F8F9FF] h-[38px] w-[38px] rounded-full flex items-center justify-center'>
                                                <Play className='h-4 w-4 text-[#484848] fill-[#484848]' />
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                        {dailyThoughts.length > 1 && (
                            <Link href='/daily-thoughts'>
                                <p className='text-center my-3 font-poppins-600 text-[#1F5D57]'>View All</p>
                            </Link>
                        )}
                    </section>

                    <hr
                        className="border-t border-dotted border-[#63AF95] w-full h-0.5 bg-transparent relative"
                        style={{
                            WebkitMaskImage: 'linear-gradient(to right, transparent, white 20%, white 80%, transparent)',
                            maskImage: 'linear-gradient(to right, transparent, white 20%, white 80%, transparent)',
                            WebkitMaskRepeat: 'no-repeat',
                            maskRepeat: 'no-repeat',
                        }}
                    />

                    <section className='my-16'>
                        <p className='text-[#484848] font-sniglet-400 text-lg mb-4'>Explore by topic</p>
                        {topics.length === 0 ? (
                            <p className='text-sm text-[#484848]'>No topics available right now.</p>
                        ) : (
                            <div className='flex flex-wrap gap-3'>
                                {topics.map((topic) => (
                                    <Badge
                                        key={topic.id}
                                        className='border border-[#2B7272] bg-[#DDF3E5C7] text-[12px] text-[#2B7272] rounded-full font-poppins-400'
                                    >
                                        {topic.name}
                                    </Badge>
                                ))}
                            </div>
                        )}

                        <p className='text-[#484848] font-sniglet-400 text-lg my-4 mt-8'>Listen Again</p>
                        <div className='space-y-2'>
                            {madeForYou.slice(0, 3).map((meditation) => (
                                <Link href={`/meditation/${meditation.id}`} key={`listen-${meditation.id}`}>
                                    <div className='bg-white w-full min-h-[80px] rounded-[30px] p-3 flex justify-between items-center'>
                                        <div className='flex gap-3 items-center'>
                                            <div className='w-10 h-10 rounded-full bg-[#F8F9FF] flex items-center justify-center text-[#1F5D57]'>
                                                🎧
                                            </div>
                                            <div>
                                                <p className='font-poppins-600 text-[#1F5D57] text-[16px] line-clamp-1'>{meditation.title}</p>
                                                <p className='text-[#484848] font-poppins-400 text-[12px]'>
                                                    {formatMinutes(meditation.duration)} • {meditation.category?.name || 'Guided'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className='bg-[#F8F9FF] h-[38px] w-[38px] rounded-full flex items-center justify-center'>
                                            <Play className='h-4 w-4 text-[#484848] fill-[#484848]' />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>

                    <hr
                        className="border-t border-dotted border-[#63AF95] w-full h-0.5 bg-transparent relative"
                        style={{
                            WebkitMaskImage: 'linear-gradient(to right, transparent, white 20%, white 80%, transparent)',
                            maskImage: 'linear-gradient(to right, transparent, white 20%, white 80%, transparent)',
                            WebkitMaskRepeat: 'no-repeat',
                            maskRepeat: 'no-repeat',
                        }}
                    />

                    <section className='w-full bg-[#DDF3E5] p-5 rounded-2xl my-16 mb-32 lg:mb-28'>
                        <div>
                            <LockOpen className='h-6 w-6' color={'#1F5D57'} />
                            <p className='font-poppins-600 text-[#1F5D57] text-[18px]'>Unlock beingOnwith Premium</p>
                            <p className='font-poppins-400 text-[#1F5D57] text-[12px]'>Experience deeper rest, healing, and clarity anytime you need.</p>
                        </div>

                        <div className='font-poppins-600 text-[#1F5D57] text-[12px] my-4'>
                            <p className='mb-4'>What You Get</p>
                            <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 xl:max-w-[1200px] xl:mx-auto'>
                                <div className='flex items-center gap-2'>
                                    <LockKeyholeOpen className='h-5 w-5' color={'#1F5D57'} />
                                    <p>Full access to all meditations</p>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <LockKeyholeOpen className='h-5 w-5' color={'#1F5D57'} />
                                    <p>Exclusive sleep and rest audios</p>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <Mic className='h-5 w-5' color={'#1F5D57'} />
                                    <p>New weekly content</p>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <LockKeyholeOpen className='h-5 w-5' color={'#1F5D57'} />
                                    <p>Download and listen offline</p>
                                </div>
                            </div>
                        </div>

                        <Link href='/plans'>
                            <Button className='w-full font-poppins-600 text-[16px] p-5 mt-3 text-center'>
                                Subscribe Now <MoveRight className='!w-5 !h-5 ml-2' />
                            </Button>
                        </Link>
                    </section>
                </div>
            </div >
            <BottomNav activeTab='home' />
        </div >
    )
}

export default Home