import BottomNav from '@/components/bottomNav'
import {
    getCategoryDetailsData,
    getSubcategoryMeditationsPaginated,
} from '@/lib/server/home'
import Link from 'next/link'
import { ChevronLeft, CircleAlert } from 'lucide-react'
import { notFound } from 'next/navigation'
import { getDarkerColor } from '@/lib/utils'
import SubcategoryAudios from './_components/subcategory-audios'

interface PageProps {
    params: Promise<{ id: string }>
    searchParams?: Promise<{ subcategoryId?: string; page?: string; limit?: string }>
}

async function CategoryDetailsPage({ params, searchParams }: PageProps) {
    const { id } = await params
    const resolvedSearchParams = (await searchParams) || {}
    const { category, subcategories } = await getCategoryDetailsData(id)

    if (!category) {
        notFound()
    }

    const hasBackgroundImage =
        typeof category.backgroundImage === 'string' && category.backgroundImage.trim().length > 0
    const fallbackColor = category.color || '#DDF3E5'
    const accentTextColor = getDarkerColor(fallbackColor, 140)
    const selectedSubcategoryId =
        resolvedSearchParams.subcategoryId || subcategories[0]?.id?.toString() || ''
    const page = Number(resolvedSearchParams.page || 1)
    const limit = Number(resolvedSearchParams.limit || 10)

    const selectedSubcategory = subcategories.find(
        (subcategory) => subcategory.id.toString() === selectedSubcategoryId,
    )

    const meditationsResult = selectedSubcategoryId
        ? await getSubcategoryMeditationsPaginated(selectedSubcategoryId, limit, page)
        : { data: [], pagination: { total: 0, page: 1, limit, totalPages: 0 } }

    return (
        <div className='min-h-screen bg-white font-poppins-400'>
            <section
                className='relative h-[38vh] min-h-[14rem] w-full overflow-hidden bg-white'
                style={
                    hasBackgroundImage
                        ? undefined
                        : {
                            background: `linear-gradient(180deg, ${fallbackColor} 0%, ${fallbackColor}CC 45%, #ffffff 100%)`,
                        }
                }
            >
                {hasBackgroundImage && (
                    <img
                        src={category.backgroundImage as string}
                        alt={category.name}
                        className='absolute inset-0 h-full w-full object-center brightness-105 contrast-105 saturate-105'
                    />
                )}

                {hasBackgroundImage ? (
                    <div
                        className='pointer-events-none absolute bottom-0 left-0 right-0 h-[46%]'
                        style={{
                            background:
                                'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.42) 40%, rgba(255,255,255,0.75) 70%, #ffffff 100%)',
                        }}
                    />
                ) : (
                    <div className='pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-white/12 to-white/90' />
                )}

                <div className='absolute top-4 inset-x-0'>
                    <div className='mx-auto flex items-center justify-between px-5 md:max-w-[37.5rem] lg:max-w-[50rem] xl:max-w-[62.5rem] 2xl:max-w-[75rem]'>
                        <div className='flex items-center gap-4'>
                            <Link
                                href='/categories'
                                className='bg-white/90 p-2 rounded-lg flex justify-center items-center cursor-pointer'
                                aria-label='Back to categories'
                            >
                                <ChevronLeft className='h-5 w-5 text-secondary' />
                            </Link>
                            <p className='font-poppins-600 text-[16px] mx-2'>{category.name}</p>
                        </div>


                        {category.icon ? (
                            <img
                                src={category.icon}
                                alt={`${category.name} icon`}
                                className='h-11 w-11 rounded-full bg-white/90 p-2 object-contain'
                            />
                        ) : (
                            <div className='h-11 w-11 rounded-full bg-white/90 flex items-center justify-center'>
                                <CircleAlert className='h-5 w-5 text-secondary' />
                            </div>
                        )}
                    </div>
                </div>
            </section >

            <section className='relative z-10 -mt-px bg-white px-5 pt-7 md:max-w-[37.5rem] lg:max-w-[50rem] xl:max-w-[62.5rem] 2xl:max-w-[75rem] mx-auto'>
                <h1
                    className='font-sniglet-400 text-[2rem] leading-[2.4rem]'
                    style={{ color: accentTextColor }}
                >
                    Drift into rest with gentle sounds and soothing breath
                </h1>

                <SubcategoryAudios
                    subcategories={subcategories}
                    meditations={meditationsResult.data}
                    categoryColor={fallbackColor}
                    categoryId={id}
                    selectedSubcategoryId={selectedSubcategory?.id.toString() || selectedSubcategoryId}
                    pagination={meditationsResult.pagination}
                    currentPage={page}
                    currentLimit={limit}
                />

            </section>

            <BottomNav activeTab='home' />
        </div >
    )
}

export default CategoryDetailsPage
