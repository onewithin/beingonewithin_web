import BottomNav from '@/components/bottomNav'
import Header from '../mylibrary/_components/header'

function TopicsLoading() {
    return (
        <div className='min-h-screen bg-mint-to-white font-poppins-400 p-4'>
            <div className='md:max-w-[600px] lg:max-w-[800px] xl:max-w-[1000px] mx-auto'>
                <Header title='Topics' />

                <div className='mt-2'>
                    <div className='h-8 w-72 rounded bg-[#E8F2EE] animate-pulse' />

                    <div className='my-4 flex flex-wrap gap-3'>
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div key={index} className='h-8 w-24 rounded-full bg-[#E8F2EE] animate-pulse' />
                        ))}
                    </div>

                    <div className='space-y-2'>
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div
                                key={index}
                                className='bg-white w-full h-[80px] rounded-[30px] p-3 flex justify-between items-center border border-[#E7EFEA] shadow-[0_10px_30px_rgba(31,93,87,0.08)] animate-pulse'
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

            <BottomNav activeTab='home' />
        </div>
    )
}

export default TopicsLoading
