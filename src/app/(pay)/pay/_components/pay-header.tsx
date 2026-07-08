'use client'

import { ChevronLeft } from 'lucide-react'
import { postToApp } from '../_lib/webview-bridge'

export default function PayHeader() {
    const handleBack = () => {
        postToApp({ type: 'close_webview' })
    }

    return (
        <div className="flex items-center gap-2 mb-6">
            <button
                onClick={handleBack}
                className="bg-white p-1 rounded-lg flex justify-center items-center cursor-pointer"
                aria-label="Go back to app"
            >
                <ChevronLeft />
            </button>
            <h1 className="text-[15px] sm:text-base font-poppins-600 text-[#121212]">
                Subscription
            </h1>
        </div>
    )
}
