import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { getProfileData } from '@/lib/server/home'
import DeleteAccountCard from './_components/delete-account-card'
import EditProfileCard from './_components/edit-profile-card'

export default async function AccountPage() {
    const profile = await getProfileData()

    return (
        <div className="min-h-screen bg-mint-to-white px-4 py-5">
            <div className="md:max-w-[600px] lg:max-w-[800px] xl:max-w-[1000px] mx-auto w-full">

                {/* Header */}
                <div className="flex items-center gap-2 mb-6">
                    <Link
                        href="/profile"
                        className="bg-white p-1 rounded-lg border "
                        aria-label="Back to profile"
                    >
                        <ChevronLeft className="h-5 w-5  " />
                    </Link>
                    <h1 className="text-heading text-[1rem] font-poppins-600">Account Info</h1>
                </div>

                {/* Edit profile card: photo + name + email + plan */}
                <EditProfileCard
                    currentImage={profile?.image ?? null}
                    currentName={profile?.name || 'User'}
                    email={profile?.email || ''}
                    planLabel={profile?.planLabel || 'Free Plan'}
                />

                {/* Danger zone */}
                {/* <DeleteAccountCard /> */}
            </div>
        </div>
    )
}

