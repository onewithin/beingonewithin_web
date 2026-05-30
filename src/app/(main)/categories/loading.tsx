import BottomNav from '@/components/bottomNav'

function CategoriesLoading() {
    return (
        <div className='min-h-screen bg-mint-to-white font-poppins-400 p-4'>
            <div className='md:max-w-[600px] lg:max-w-[800px] xl:max-w-[1000px] mx-auto'>
                <div className='flex justify-between items-center mb-6'>
                    <div className='h-10 w-40 rounded-full bg-white/60 animate-pulse' />
                    <div className='h-10 w-10 rounded-lg bg-white/60 animate-pulse' />
                </div>

                <div className='h-8 w-72 rounded-full bg-white/60 animate-pulse mb-6' />

                <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-28'>
                    {Array.from({ length: 8 }).map((_, index) => (
                        <div
                            key={index}
                            className='h-[7.6875rem] rounded-[1.875rem] px-5 flex flex-col items-center justify-center text-center bg-white/60 animate-pulse'
                        >
                            <div className='mb-2 h-8 w-8 rounded-full bg-white/80' />
                            <div className='h-4 w-20 rounded bg-white/80' />
                        </div>
                    ))}
                </div>
            </div>
            <BottomNav activeTab='home' />
        </div>
    )
}

export default CategoriesLoading
