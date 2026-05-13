'use client'

import React, { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Question from './question'
import QuestionCard from './questionCard'
import { setPendingOnboardingTagsAction, type OnboardingQuestion } from '@/lib/actions/auth'

const ONBOARDING_CARDS = [
    {
        title: 'Soulful Soundscapes, Not Lessons',
        description: 'We give you calming, immersive sounds to help you relax instantly.',
        image: '/icons/group.png',
    },
    {
        title: 'Breathe With Intention',
        description: 'Try guided breathing to feel more grounded in minutes.',
        image: '/icons/meditation.png',
    },
    {
        title: 'Calm Voices That Truly Soothe',
        description: 'Our audio is crafted with therapeutic voices and tones designed to emotionally ease your mind.',
        image: '/icons/meditation-2.png',
    },
]

type IntroductionClientProps = {
    questions: OnboardingQuestion[]
}

export default function IntroductionClient({ questions }: IntroductionClientProps) {
    const router = useRouter()
    const [step, setStep] = useState(0)
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({})
    const [stepError, setStepError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const isFinalStep = step >= questions.length
    const currentQuestion = questions[step]

    const buildSelectedTagIds = (): string[] => {
        const selectedTagIds = questions.flatMap((question) => {
            const selectedOptionIds = selectedOptions[question.id] || []
            const matchingOptions = question.options.filter((option) => selectedOptionIds.includes(option.id))
            return matchingOptions.flatMap((option) => (option.tags || []).map((tag) => tag.tagId))
        })

        return Array.from(new Set(selectedTagIds.filter(Boolean)))
    }

    const handleNext = async () => {
        if (!isFinalStep) {
            if (!currentQuestion) {
                setStepError('Question data is unavailable. Please refresh and try again.')
                return
            }

            const selectedForQuestion = selectedOptions[currentQuestion.id] || []
            if (selectedForQuestion.length === 0) {
                setStepError('Please choose at least one option to continue, or skip this question.')
                return
            }

            setStepError('')
            setStep((prev) => prev + 1)
            return
        }

        setIsLoading(true)
        setStepError('')

        try {
            await setPendingOnboardingTagsAction(buildSelectedTagIds())
            router.push('/register')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSkipCurrentQuestion = () => {
        if (isFinalStep || !currentQuestion) return

        setSelectedOptions((previous) => ({
            ...previous,
            [currentQuestion.id]: [],
        }))
        setStepError('')
        setStep((prev) => prev + 1)
    }

    const currentCard = ONBOARDING_CARDS[step % ONBOARDING_CARDS.length]

    return (
        <div className="min-h-screen bg-mint-to-white relative overflow-y-auto">
            <Image
                src="/icons/boatstreeing.png"
                height={400}
                width={500}
                alt="spiritual"
                className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
            />
            <div className="z-10 p-4 pt-16 md:pt-6 md:max-w-[600px] lg:max-w-[800px] xl:max-w-[1000px] 2xl:max-w-[1200px] w-full mx-auto flex flex-col relative">
                <div className="w-full flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 lg:gap-10">
                    {!isFinalStep ? (
                        <Question
                            greeting="A few quick questions"
                            question={currentQuestion?.question || ''}
                            options={(currentQuestion?.options || []).map((option) => ({
                                id: option.id,
                                text: option.option,
                            }))}
                            values={currentQuestion ? selectedOptions[currentQuestion.id] || [] : []}
                            onToggle={(value: string) => {
                                if (!currentQuestion) return

                                setSelectedOptions((previous) => ({
                                    ...previous,
                                    [currentQuestion.id]: previous[currentQuestion.id]?.includes(value)
                                        ? (previous[currentQuestion.id] || []).filter((item) => item !== value)
                                        : [...(previous[currentQuestion.id] || []), value],
                                }))
                                setStepError('')
                            }}
                        />
                    ) : (
                        <div className="w-full lg:max-w-[480px] p-7 lg:p-0">
                            <h1 className="text-[28px] sm:text-[32px] leading-[34px] sm:leading-[38px] max-w-[400px] text-primary tracking-normal text-center lg:text-left font-poppins-600">
                                You&apos;re all set
                            </h1>
                            <p className="text-[#000000] my-2 text-[15px] sm:text-[16px] text-center lg:text-left font-poppins-400">
                                Great choices. Let&apos;s create your account to start your journey.
                            </p>
                            {stepError && (
                                <p className="text-red-500 mt-2 text-[12px] text-center lg:text-left font-poppins-400">
                                    {stepError}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="hidden lg:block">
                        <QuestionCard
                            title={currentCard.title}
                            description={currentCard.description}
                            buttonText={isFinalStep ? 'Continue to Register' : 'Next'}
                            onButtonClick={handleNext}
                            skipOption={false}
                            loading={isLoading}
                            image={<Image src={currentCard.image} height={100} width={100} alt="icon" />}
                        />
                    </div>
                </div>

                <div className="mt-4 lg:hidden">
                    <QuestionCard
                        title={currentCard.title}
                        description={currentCard.description}
                        buttonText={isFinalStep ? 'Continue to Register' : 'Next'}
                        onButtonClick={handleNext}
                        skipOption={false}
                        loading={isLoading}
                        image={<Image src={currentCard.image} height={100} width={100} alt="icon" />}
                    />
                </div>

                {!isFinalStep && (
                    <button
                        type="button"
                        className="absolute top-4 right-4 md:static md:mt-8 md:self-end flex items-center gap-2 cursor-pointer"
                        onClick={handleSkipCurrentQuestion}
                    >
                        <p className="font-poppins-600 text-[#1F5D57]">Skip</p>
                        <ChevronRight className="h-6 w-6 text-[#1F5D57]" />
                    </button>
                )}
            </div>
        </div>
    )
}
