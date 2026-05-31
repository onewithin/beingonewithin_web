import BottomNav from '@/components/bottomNav'
import Header from './_components/header'
import Image from 'next/image'

function MyLibraryLoading() {
    return (
        <div className='min-h-screen bg-mint-to-white font-poppins-400 p-4'>
            <div className='md:max-w-[600px] lg:max-w-[800px] xl:max-w-[1000px] mx-auto'>
                <div className='flex justify-between items-center'>
                    <Header />
                    <div className='flex gap-4'>
                        <button
                            type='button'

                            className='inline-flex items-center justify-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F5D57]/40'
                            aria-label='Create new library'
                        >
                            <Image
                                src='/icons/add_to_library.png'
                                alt='Library'
                                width={24}
                                height={24}
                                className='h-6 w-6 object-contain'
                                style={{ filter: 'brightness(0) saturate(100%) invert(31%) sepia(22%) saturate(908%) hue-rotate(126deg) brightness(92%) contrast(90%)' }}
                            />
                        </button>
                        <Image src='/icons/flower1.png' alt='Flower' width={24} height={24} className='h-6 w-6 object-contain' />
                    </div>
                </div>

                <div>
                    <p className='font-sniglet-400 text-[24px] text-[#1F5D57]'>Organize your meditations.</p>

                    <div className='my-4'>
                        <div className='my-3 flex gap-3 overflow-x-auto whitespace-nowrap pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
                            {Array.from({ length: 4 }).map((_, index) => (
                                <div
                                    key={index}
                                    className='h-8 w-[9rem] flex-shrink-0 rounded-full bg-[#E8F2EE] animate-pulse'
                                />
                            ))}
                        </div>

                        <div className='w-full my-5 space-y-2'>
                            {Array.from({ length: 5 }).map((_, index) => (
                                <div
                                    key={index}
                                    className='bg-white w-full min-h-[80px] rounded-[30px] p-3 flex justify-between items-center border border-[#E7EFEA] shadow-[0_10px_30px_rgba(31,93,87,0.08)] animate-pulse'
                                >
                                    <div className='flex gap-3 items-center flex-1'>
                                        <div className='w-10 h-10 rounded-full bg-[#E8F2EE]' />
                                        <div className='flex-1 space-y-2'>
                                            <div className='h-4 w-3/4 rounded bg-[#E8F2EE]' />
                                            <div className='h-3 w-1/2 rounded bg-[#E8F2EE]' />
                                        </div>
                                    </div>
                                    <div className='bg-[#E8F2EE] h-[38px] w-[38px] rounded-full' />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <BottomNav activeTab='library' />
        </div>
    )
}

export default MyLibraryLoading
