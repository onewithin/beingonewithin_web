'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ChevronRight } from 'lucide-react'
import Question from '@/app/(onboarding)/introduction/_components/question'
import QuestionCard from '@/app/(onboarding)/introduction/_components/questionCard'
import {
    getOnboardingQuestionsAction,
    saveOnboardingTagsAction,
    type OnboardingQuestion,
} from '@/lib/actions/auth'

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

export default function OnboardingSetup() {
    const router = useRouter()
    const [questions, setQuestions] = useState<OnboardingQuestion[]>([])
    const [step, setStep] = useState(0)
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingQuestions, setIsLoadingQuestions] = useState(true)
    const [error, setError] = useState('')
    const [questionError, setQuestionError] = useState('')

    useEffect(() => {
        getOnboardingQuestionsAction().then((res) => {
            if (!res.success) {
                setQuestionError(res.message)
            } else {
                setQuestions(res.questions)
            }
            setIsLoadingQuestions(false)
        })
    }, [])

    const buildSelectedTagIds = (): string[] => {
        const tagIds = questions.flatMap((q) => {
            const selectedOptionId = selectedOptions[q.id]
            const selectedOption = q.options.find((o) => o.id === selectedOptionId)
            return (selectedOption?.tags || []).map((t) => t.tagId)
        })
        return Array.from(new Set(tagIds.filter(Boolean)))
    }

    const finishOnboarding = async (tagIds: string[]) => {
        setIsLoading(true)
        await saveOnboardingTagsAction(tagIds)
        router.replace('/home')
    }

    const handleNext = async () => {
        const currentQuestion = questions[step]

        if (!currentQuestion) {
            await finishOnboarding(buildSelectedTagIds())
            return
        }

        if (!selectedOptions[currentQuestion.id]) {
            setError('Please choose one option to continue.')
            return
        }

        setError('')

        if (step + 1 >= questions.length) {
            await finishOnboarding(buildSelectedTagIds())
        } else {
            setStep((prev) => prev + 1)
        }
    }

    const handleSkip = async () => {
        await finishOnboarding(buildSelectedTagIds())
    }

    if (isLoadingQuestions) {
        return (
            <div className="h-screen bg-gradient-to-b from-[#E5F2D6] to-[#FFFFFF] flex items-center justify-center">
                <p className="font-poppins-500 text-[#1F5D57]">Personalizing your experience…</p>
            </div>
        )
    }

    if (questionError || questions.length === 0) {
        return (
            <div className="h-screen bg-gradient-to-b from-[#E5F2D6] to-[#FFFFFF] flex items-center justify-center px-4">
                <div className="text-center space-y-4">
                    <p className="font-poppins-500 text-[#484848]">
                        {questionError || 'No questions available right now.'}
                    </p>
                    <button
                        onClick={() => router.replace('/home')}
                        className="text-[#1F5D57] underline font-poppins-600"
                    >
                        Continue to home
                    </button>
                </div>
            </div>
        )
    }

    const currentQuestion = questions[step]
    const currentCard = ONBOARDING_CARDS[step % ONBOARDING_CARDS.length]

    return (
        <div className="h-screen bg-mint-to-white flex items-center justify-center">
            <div className="p-4 md:max-w-[600px] lg:max-w-[800px] xl:max-w-[1000px] 2xl:max-w-[1200px] w-full flex flex-col">
                <div className="w-full lg:flex justify-between items-center">
                    <Question
                        greeting="Help us personalize your journey"
                        question={currentQuestion.question}
                        options={currentQuestion.options.map((o) => ({
                            id: o.id,
                            text: o.option,
                        }))}
                        value={selectedOptions[currentQuestion.id]}
                        onChange={(value) => {
                            setSelectedOptions((prev) => ({
                                ...prev,
                                [currentQuestion.id]: value,
                            }))
                            setError('')
                        }}
                    />
                    <QuestionCard
                        title={currentCard.title}
                        description={currentCard.description}
                        buttonText="Next"
                        onButtonClick={handleNext}
                        skipOption={false}
                        loading={isLoading}
                        image={
                            <Image
                                src={currentCard.image}
                                height={100}
                                width={100}
                                alt="icon"
                            />
                        }
                    />
                </div>

                {error && (
                    <p className="text-red-500 font-poppins-400 text-sm mt-3 text-center">{error}</p>
                )}

                <div
                    className="flex justify-end mt-12 gap-3 cursor-pointer"
                    onClick={handleSkip}
                >
                    <p className="font-poppins-600 text-[#1F5D57]">Skip</p>
                    <ChevronRight className="h-6 w-6 text-[#1F5D57]" />
                </div>
            </div>
        </div>
    )
}
