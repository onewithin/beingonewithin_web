import Link from 'next/link'
import { ChevronLeft, FileText } from 'lucide-react'

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-[#F8FBFA] px-4 py-5">
            <div className="w-full md:max-w-[640px] mx-auto">
                <div className="flex items-center gap-2 mb-5">
                    <Link
                        href="/profile"
                        className="bg-white p-1 rounded-lg border border-[#EDEDED]"
                        aria-label="Back to profile"
                    >
                        <ChevronLeft className="h-5 w-5 text-[#1F5D57]" />
                    </Link>
                    <h1 className="text-[#113C38] text-xl font-poppins-600">Terms and Privacy</h1>
                </div>

                <div className="bg-white border border-[#E8F0EE] rounded-2xl shadow-sm p-5 space-y-4">
                    <div className="flex items-start gap-3">
                        <FileText className="h-5 w-5 text-[#1F5D57] mt-1" />
                        <p className="text-sm text-[#1E2B28]">
                            By using Prana, you agree to our product terms, content policy, and privacy practices.
                        </p>
                    </div>

                    <div className="rounded-xl border border-[#E8F0EE] p-4">
                        <p className="text-sm font-poppins-600 text-[#1E2B28]">Data and Privacy</p>
                        <p className="text-sm text-[#6D7A76] mt-1">
                            We process your profile and app activity to personalize meditations and recommendations.
                        </p>
                    </div>

                    <div className="rounded-xl border border-[#E8F0EE] p-4">
                        <p className="text-sm font-poppins-600 text-[#1E2B28]">Support and Requests</p>
                        <p className="text-sm text-[#6D7A76] mt-1">
                            For legal inquiries or data requests, contact support@prana.app.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
