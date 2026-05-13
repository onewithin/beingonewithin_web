import React from 'react'
import Link from 'next/link'
import IntroductionClient from './_components/IntroductionClient'
import {
    getOnboardingQuestionsAction,
} from '@/lib/actions/auth'

export default async function Introduction() {
    const response = await getOnboardingQuestionsAction()

    if (!response.success) {
        return (
            <div className="h-screen bg-mint-to-white flex items-center justify-center px-4">
                <div className="text-center">
                    <p className="font-poppins-500 text-red-500">{response.message}</p>
                    <Link
                        href="/introduction"
                        className="mt-4 inline-block text-[#1F5D57] underline font-poppins-600"
                    >
                        Try again
                    </Link>
                </div>
            </div>
        )
    }

    return <IntroductionClient questions={response.questions} />
}
