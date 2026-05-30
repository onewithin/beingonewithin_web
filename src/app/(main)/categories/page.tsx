import React from 'react'
import Header from './_components/header'
import BottomNav from '@/components/bottomNav'
import { getAllCategories } from '@/lib/server/home'
import { colorToPillClass } from '@/lib/utils'
import { CircleAlert } from 'lucide-react'
import Link from 'next/link'

async function CategoriesPage() {
    const categories = await getAllCategories()

    return (
        <div className='min-h-screen bg-mint-to-white font-poppins-400 p-4'>
            <div className='md:max-w-[600px] lg:max-w-[800px] xl:max-w-[1000px] mx-auto'>
                <div className='flex justify-between items-center mb-6'>
                    <Header />
                </div>

                <p className='font-sniglet-400 text-[1.5rem] text-secondary mb-6'>
                    Explore all meditation categories
                </p>

                {categories.length === 0 ? (
                    <p className='text-sm text-color mt-4'>No categories available right now.</p>
                ) : (
                    <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-28 '>
                        {categories.map((category) => (
                            <Link href={`/categories/${category.id}`} key={category.id}>
                                <div
                                    className='h-[7.6875rem] rounded-[1.875rem] px-5 flex flex-col items-center justify-center text-center'
                                    style={colorToPillClass(category.color)}
                                >
                                    {category.icon ? (
                                        <img
                                            src={category.icon}
                                            alt={category.name}
                                            className='mb-2 h-9 w-9 object-contain'
                                        />
                                    ) : (
                                        <CircleAlert height={32} width={32} className='mb-2' fill='black' stroke='white' />
                                    )}
                                    <p className='font-poppins-600 text-[0.875rem] leading-tight'>{category.name}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
            <BottomNav activeTab='home' />
        </div>
    )
}

export default CategoriesPage
