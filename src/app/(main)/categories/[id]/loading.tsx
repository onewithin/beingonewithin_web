import BottomNav from '@/components/bottomNav'

function CategoryDetailsLoading() {
    return (
        <div className='min-h-screen bg-white font-poppins-400'>
            <section className='relative h-[38vh] min-h-[14rem] w-full overflow-hidden bg-[#DDF3E5]'>
                <div className='absolute inset-0 animate-pulse bg-gradient-to-b from-[#B8D9CB] via-[#DDF3E5] to-white' />

                <div className='absolute top-4 left-4 right-4 flex items-start justify-between'>
                    <div className='h-9 w-9 rounded-lg bg-white/80 animate-pulse' />
                    <div className='h-11 w-11 rounded-full bg-white/80 animate-pulse' />
                </div>
            </section>

            <section className='relative z-10 -mt-px bg-white px-5 pt-7 pb-28'>
                <div className='h-10 w-[90%] rounded-xl bg-[#E8F2EE] animate-pulse' />

                <div className='mt-6 flex flex-wrap gap-2'>
                    <div className='h-8 w-20 rounded-full bg-[#E8F2EE] animate-pulse' />
                    <div className='h-8 w-24 rounded-full bg-[#E8F2EE] animate-pulse' />
                    <div className='h-8 w-16 rounded-full bg-[#E8F2EE] animate-pulse' />
                </div>

                <div className='mt-5 space-y-3'>
                    <div className='w-full min-h-[5rem] rounded-[1.25rem] bg-[#F8F9FF] p-3 flex justify-between items-center'>
                        <div className='flex gap-3 items-center'>
                            <div className='w-10 h-10 rounded-full bg-white animate-pulse' />
                            <div className='space-y-2'>
                                <div className='h-4 w-36 rounded bg-white animate-pulse' />
                                <div className='h-3 w-20 rounded bg-white animate-pulse' />
                            </div>
                        </div>
                        <div className='bg-white h-[2.375rem] w-[2.375rem] rounded-full animate-pulse' />
                    </div>

                    <div className='w-full min-h-[5rem] rounded-[1.25rem] bg-[#F8F9FF] p-3 flex justify-between items-center'>
                        <div className='flex gap-3 items-center'>
                            <div className='w-10 h-10 rounded-full bg-white animate-pulse' />
                            <div className='space-y-2'>
                                <div className='h-4 w-32 rounded bg-white animate-pulse' />
                                <div className='h-3 w-24 rounded bg-white animate-pulse' />
                            </div>
                        </div>
                        <div className='bg-white h-[2.375rem] w-[2.375rem] rounded-full animate-pulse' />
                    </div>
                </div>
            </section>

            <BottomNav activeTab='home' />
        </div>
    )
}

export default CategoryDetailsLoading
