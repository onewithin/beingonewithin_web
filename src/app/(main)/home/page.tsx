import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import BottomNav from '@/components/bottomNav'
import { CircleAlert, LockKeyholeOpen, LockOpen, Mic, MoveRight, Play, Sun } from 'lucide-react'
import Link from 'next/link'
import { getHomeData, getProfileData } from '@/lib/server/home'
import { colorToPillClass, formatToMMSS, getDarkerColor } from '@/lib/utils'
import LocalGreeting from './_components/local-greeting'
import Image from 'next/image'

async function Home() {
    const [homeData, profile] = await Promise.all([getHomeData(), getProfileData()])
    const madeForYou = homeData.madeForYou.slice(0, 10)
    const categories = homeData.categories.slice(0, 4)
    const topics = homeData.topics.slice(0, 12)
    const dailyThoughts = homeData.dailyThoughts.slice(0, 4)
    // Fix: Convert todayThought object to array and pick the first valid item
    const todayThoughtArray = Object.values(homeData?.todayThought || {}).filter(
        (item: any) => item && typeof item === 'object' && 'id' in item
    )
    const todayThought: any = todayThoughtArray[0] || dailyThoughts[0]

    return (
        <div className='min-h-screen bg-mint-to-white font-poppins-400 '>
            <Image
                src="/icons/half-flower.png"
                height={516}
                width={516}
                alt="spiritual"
                className="absolute top-0 left-1/2 opacity-30 -translate-x-1/2 z-0 pointer-events-none select-none "
                aria-hidden="true"
            />
            <div className='relative z-0 p-4 md:max-w-[37.5rem] lg:max-w-[50rem] xl:max-w-[62.5rem] 2xl:max-w-[75rem] mx-auto '>
                {/* Background image absolutely positioned with z-0 */}
                <div className='py-3 flex justify-between items-center z-10 relative'>
                    <div className='inline-flex px-[0.625rem] py-[0.3125rem] rounded-full gap-2 items-center bg-white/25'>
                        <Image src="/icons/morning.png" alt="Morning" width={20} height={20} className='w-[1.25rem] h-[1.25rem]' />
                        <LocalGreeting name={profile?.name} />
                    </div>
                    <div>
                        <Image src="/icons/flower1.png" alt="Flower" width={26} height={26} className='w-[1.625rem] h-[1.625rem]' />
                    </div>
                </div>

                <div className='text-center my-8'>
                    <h6 className='font-poppins-400 text-[1rem] text-black'>Today&apos;s Suggestion</h6>
                    <h1 className='font-sniglet-400 leading-[2.75rem] my-2 text-[2.75rem] text-primary'>
                        {todayThought?.title || 'Inhale peace, exhale tension.'}
                    </h1>
                    {todayThought?.id && (
                        <Link href={`/meditation/${todayThought.id}?type=thought`}>
                            <Badge className='bg-white rounded-full mt-6 mb-8 cursor-pointer hover:shadow-lg transition-shadow'>
                                <div className='flex gap-2 items-center rounded-full p-1'>
                                    <Play className='h-4 w-4 text-color fill-[#484848]' />
                                    <p className='font-poppins-400 text-color text-[1rem]'>
                                        {formatToMMSS(todayThought?.duration)}
                                    </p>
                                </div>
                            </Badge>
                        </Link>
                    )}
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
                    <section className='bg-white w-full rounded-[1.875rem] p-5 my-16 shadow-sm'>
                        <div className='flex items-center justify-between mb-4'>
                            <p className='text-color font-sniglet-400 text-lg'>Let&apos;s Begin With</p>
                            <Link href='/categories' className='text-primary text-xs underline'>View All</Link>
                        </div>

                        {categories.length === 0 ? (
                            <p className='text-sm text-color'>No categories available right now.</p>
                        ) : (
                            <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                                {categories.map((category) => (
                                    <Link href={`/categories/${category.id}`} key={category.id}>
                                        <div
                                            className='h-[7.6875rem] rounded-[1.875rem] px-5 flex flex-col items-center justify-center text-center cursor-pointer'
                                            style={colorToPillClass(category.color)}
                                        >
                                            {category.icon ?
                                                <img src={category.icon || '/default-icon.png'} alt={category.name} className='mb-3 h-9 w-9' /> :
                                                <CircleAlert height={32} width={32} className='mb-2' fill='black' stroke='white' />}
                                            <p
                                                className='font-poppins-600 text-[0.875rem] mx-11 leading-tight'
                                                style={{ color: getDarkerColor(category.color || '#DDF3E5', 140) }}
                                            >
                                                {category.name}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
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

                    {/* <section className='w-full max-w-screen overflow-hidden'>
                        <p className='text-color font-sniglet-400 text-lg mb-4'>Made for you</p>

                        {madeForYou.length === 0 ? (
                            <p className='text-sm text-color'>Complete onboarding to unlock personalized recommendations.</p>
                        ) : (
                            <div className='overflow-x-auto scrollbar-hide'>
                                <div className='flex gap-5 px-1 min-w-max'>
                                    {madeForYou.map((meditation) => (
                                        <Link href={`/meditation/${meditation.id}`} key={meditation.id}>
                                            <div className='p-2 w-[12.75rem] rounded-[1.25rem] bg-[#F5F5F5] inline-flex'>
                                                <div className='relative w-[12.5rem] h-[12.625rem] rounded-[1.25rem] overflow-hidden bg-gradient-to-b from-[#DDF3E5] to-[#9BC8B6]'>
                                                    {meditation.isLiked && (
                                                        <div className='absolute top-3 right-3 w-[1.875rem] h-[1.875rem] bg-red-600 rounded-full flex justify-center items-center text-white text-xs'>
                                                            ❤
                                                        </div>
                                                    )}

                                                    <div className='absolute bottom-0 w-full px-3 py-2 backdrop-blur-[0.125rem] bg-black/10 text-white rounded-b-[1.25rem]'>
                                                        <p className='font-poppins-700 text-[0.875rem] leading-tight line-clamp-2'>
                                                            {meditation.title}
                                                        </p>
                                                        <p className='font-poppins-400 text-[0.625rem] leading-tight mt-1'>
                                                            {formatToMMSS(meditation.duration)} • {meditation.category?.name || 'Guided'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section> */}

                    <section className='my-16'>
                        <div className='bg-[#DDF3E5] w-full rounded-[1.875rem] p-5'>
                            <p className='text-center my-3 font-poppins-600 text-secondary'>✨ Daily Thought</p>
                            {dailyThoughts.length === 0 ? (
                                <p className='text-center text-sm text-secondary'>No thoughts available right now.</p>
                            ) : (
                                dailyThoughts.slice(0, 1).map((thought) => (
                                    <Link href={`/meditation/${thought.id}?type=thought`} key={thought.id}>
                                        <div className='bg-white w-full min-h-[5rem] my-2 rounded-[1.875rem] p-3 flex justify-between items-center'>
                                            <div className='flex gap-3 items-center'>
                                                <div className='w-10 h-10 rounded-full bg-[#F8F9FF] flex items-center justify-center text-secondary'>
                                                    ✨
                                                </div>
                                                <div>
                                                    <p className='font-poppins-600 text-secondary text-[1rem] line-clamp-1'>
                                                        {thought.title}
                                                    </p>
                                                    <p className='text-color font-poppins-400 text-[0.75rem]'>
                                                        {formatToMMSS(thought.duration)} • Daily Thought
                                                    </p>
                                                </div>
                                            </div>
                                            <div className='bg-[#F8F9FF] h-[2.375rem] w-[2.375rem] rounded-full flex items-center justify-center'>
                                                <Play className='h-4 w-4 text-color fill-[#484848]' />
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                        {dailyThoughts.length > 1 && (
                            <Link href='/daily-thoughts'>
                                <p className='text-center my-3 font-poppins-600 text-secondary'>View All</p>
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
                        <p className='text-color font-sniglet-400 text-lg mb-4'>Explore by topic</p>
                        {topics.length === 0 ? (
                            <p className='text-sm text-color'>No topics available right now.</p>
                        ) : (
                            <div className='flex flex-wrap gap-3'>
                                {topics.map((topic) => (
                                    <Badge
                                        key={topic.id}
                                        className='border border-primary bg-[#DDF3E5C7] text-[0.75rem] text-primary rounded-full font-poppins-400'
                                    >
                                        {topic.name}
                                    </Badge>
                                ))}
                            </div>
                        )}

                        <p className='text-color font-sniglet-400 text-lg my-4 mt-8'>Listen Again</p>
                        <div className='space-y-2'>
                            {madeForYou.slice(0, 3).map((meditation) => (
                                <Link href={`/meditation/${meditation.id}`} key={`listen-${meditation.id}`}>
                                    <div className='bg-white w-full min-h-[5rem] rounded-[1.875rem] p-3 flex justify-between items-center'>
                                        <div className='flex gap-3 items-center'>
                                            <div className='w-10 h-10 rounded-full bg-[#F8F9FF] flex items-center justify-center text-secondary'>
                                                🎧
                                            </div>
                                            <div>
                                                <p className='font-poppins-600 text-secondary text-[1rem] line-clamp-1'>{meditation.title}</p>
                                                <p className='text-color font-poppins-400 text-[0.75rem]'>
                                                    {formatToMMSS(meditation.duration)} • {meditation.category?.name || 'Guided'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className='bg-[#F8F9FF] h-[2.375rem] w-[2.375rem] rounded-full flex items-center justify-center'>
                                            <Play className='h-4 w-4 text-color fill-[#484848]' />
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
                            <LockOpen className='h-6 w-6 text-secondary' />
                            <p className='font-poppins-600 text-secondary text-[1.125rem]'>Unlock beingOnwith Premium</p>
                            <p className='font-poppins-400 text-secondary text-[0.75rem]'>Experience deeper rest, healing, and clarity anytime you need.</p>
                        </div>

                        <div className='font-poppins-600 text-secondary text-[0.75rem] my-4'>
                            <p className='mb-4'>What You Get</p>
                            <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 xl:max-w-[75rem] xl:mx-auto'>
                                <div className='flex items-center gap-2'>
                                    <LockKeyholeOpen className='h-5 w-5 text-secondary' />
                                    <p>Full access to all meditations</p>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <LockKeyholeOpen className='h-5 w-5 text-secondary' />
                                    <p>Exclusive sleep and rest audios</p>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <Mic className='h-5 w-5 text-secondary' />
                                    <p>New weekly content</p>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <LockKeyholeOpen className='h-5 w-5 text-secondary' />
                                    <p>Download and listen offline</p>
                                </div>
                            </div>
                        </div>

                        <Link href='/plans'>
                            <Button className='w-full font-poppins-600 text-[1rem] p-5 mt-3 text-center'>
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