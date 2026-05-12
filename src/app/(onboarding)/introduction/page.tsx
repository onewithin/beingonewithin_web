'use client'
import React, { useState } from 'react'
import { useEffect } from 'react'
import Question from "./_components/question"
import QuestionCard from './_components/questionCard'
import { ChevronRight } from 'lucide-react'
import EmailForm from './_components/email-form'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
    checkEmailAction,
    getOnboardingQuestionsAction,
    loginAction,
    registerAction,
    setPendingOnboardingTagsAction,
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

function Introduction() {
    const router = useRouter()
    const [questions, setQuestions] = useState<OnboardingQuestion[]>([])
    const [step, setStep] = useState(0)
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
    const [email, setEmail] = useState('')
    const [emailError, setEmailError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingQuestions, setIsLoadingQuestions] = useState(true)
    const [questionError, setQuestionError] = useState('')

    useEffect(() => {
        const loadQuestions = async () => {
            setIsLoadingQuestions(true)
            const response = await getOnboardingQuestionsAction()

            if (!response.success) {
                setQuestionError(response.message)
                setQuestions([])
                setIsLoadingQuestions(false)
                return
            }

            setQuestions(response.questions)
            setQuestionError('')
            setIsLoadingQuestions(false)
        }

        loadQuestions()
    }, [])

    const isEmailStep = step >= questions.length
    const currentQuestion = questions[step]

    const buildSelectedTagIds = (): string[] => {
        const selectedTagIds = questions.flatMap((question) => {
            const selectedOptionId = selectedOptions[question.id]
            const selectedOption = question.options.find((option) => option.id === selectedOptionId)
            return (selectedOption?.tags || []).map((tag) => tag.tagId)
        })

        return Array.from(new Set(selectedTagIds.filter(Boolean)))
    }

    const handleNext = async () => {
        if (!isEmailStep) {
            if (!currentQuestion) {
                setEmailError('Question data is unavailable. Please refresh and try again.')
                return
            }

            if (!selectedOptions[currentQuestion.id]) {
                setEmailError('Please choose one option to continue.')
                return
            }

            setEmailError('')
            setStep(prev => prev + 1)
            return
        }

        if (!email.trim()) {
            setEmailError('Please enter your email address.')
            return
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setEmailError('Please enter a valid email address.')
            return
        }

        setIsLoading(true)
        setEmailError('')

        try {
            await setPendingOnboardingTagsAction(buildSelectedTagIds())

            const { exists, error: checkError } = await checkEmailAction(email)
            if (checkError) {
                setEmailError(checkError)
                return
            }

            let result: { success: boolean; message: string }

            if (exists) {
                // Returning user — send OTP via login
                result = await loginAction(email)
            } else {
                // New user — register and send OTP
                const name =
                    typeof window !== 'undefined'
                        ? sessionStorage.getItem('prana_name') || ''
                        : ''
                result = await registerAction(email, name)
            }

            if (!result.success) {
                setEmailError(result.message)
                return
            }

            router.push('/verify-otp')
        } finally {
            setIsLoading(false)
        }
    }

    const currentCard = ONBOARDING_CARDS[step % ONBOARDING_CARDS.length]

    if (isLoadingQuestions) {
        return (
            <div className="h-screen bg-mint-to-white flex items-center justify-center">
                <p className="font-poppins-500 text-[#1F5D57]">Loading your onboarding journey...</p>
            </div>
        )
    }

    if (questionError) {
        return (
            <div className="h-screen bg-mint-to-white flex items-center justify-center px-4">
                <div className="text-center">
                    <p className="font-poppins-500 text-red-500">{questionError}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 text-[#1F5D57] underline font-poppins-600"
                    >
                        Try again
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="h-screen bg-mint-to-white flex items-center justify-center">
            <div className=" p-4 md:max-w-[600px] lg:max-w-[800px] xl:max-w-[1000px] 2xl:max-w-[1200px] w-full flex flex-col">
                {/* Center Content */}
                <div className="w-full lg:flex justify-between items-center">
                    {
                        isEmailStep ?
                            <EmailForm
                                email={email}
                                onChange={(v) => { setEmail(v); setEmailError('') }}
                                error={emailError}
                            />
                            :
                            <Question
                                greeting="A few quick questions"
                                question={currentQuestion?.question || ''}
                                options={(currentQuestion?.options || []).map((option) => ({
                                    id: option.id,
                                    text: option.option,
                                }))}
                                value={currentQuestion ? selectedOptions[currentQuestion.id] : undefined}
                                onChange={(value) => {
                                    if (!currentQuestion) return

                                    setSelectedOptions((previous) => ({
                                        ...previous,
                                        [currentQuestion.id]: value,
                                    }))
                                    setEmailError('')
                                }}
                            />
                    }
                    <QuestionCard
                        title={currentCard.title}
                        description={currentCard.description}
                        buttonText={isEmailStep ? 'Start Free Trial' : 'Next'}
                        onButtonClick={handleNext}
                        skipOption={false}
                        loading={isLoading}
                        image={<Image src={currentCard.image} height={100} width={100} alt="icon" />}
                    />
                </div>

                {/* Skip Section */}
                {
                    !isEmailStep &&
                    <div className="flex justify-end mt-12 gap-3 cursor-pointer" onClick={() => setStep(questions.length)}>
                        <p className="font-poppins-600 text-[#1F5D57]">Skip</p>
                        <ChevronRight className="h-6 w-6 text-[#1F5D57]" />
                    </div>
                }

            </div>
        </div>
    )
}

export default Introduction
