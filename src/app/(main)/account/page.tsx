import Link from 'next/link'
import { ChevronLeft, Mail, UserRound, ShieldCheck } from 'lucide-react'
import { getProfileData } from '@/lib/server/home'
import DeleteAccountCard from './_components/delete-account-card'

export default async function AccountPage() {
    const profile = await getProfileData()

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
                    <h1 className="text-[#113C38] text-xl font-poppins-600">Account Info</h1>
                </div>

                <div className="bg-white border border-[#E8F0EE] rounded-2xl shadow-sm p-5 space-y-4">
                    <div className="flex items-center gap-3">
                        <UserRound className="h-5 w-5 text-[#1F5D57]" />
                        <div>
                            <p className="text-xs text-[#7A8A86]">Full Name</p>
                            <p className="text-[#1E2B28] font-poppins-500">{profile?.name || 'User'}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-[#1F5D57]" />
                        <div>
                            <p className="text-xs text-[#7A8A86]">Email Address</p>
                            <p className="text-[#1E2B28] font-poppins-500">{profile?.email || 'No email found'}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <ShieldCheck className="h-5 w-5 text-[#1F5D57]" />
                        <div>
                            <p className="text-xs text-[#7A8A86]">Plan</p>
                            <p className="text-[#1E2B28] font-poppins-500">{profile?.planLabel || 'Free Plan'}</p>
                        </div>
                    </div>
                </div>

                <DeleteAccountCard />
            </div>
        </div>
    )
}
