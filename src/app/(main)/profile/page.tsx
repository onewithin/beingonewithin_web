import {
    Camera,
} from "lucide-react"
import Image from "next/image"
import { redirect } from "next/navigation"
import Header from "./_components/header"
import MenuItem from "./_components/menuItem"
import BottomNav from "@/components/bottomNav"
import { getProfileData } from "@/lib/server/home"
import { logoutAction } from "@/lib/actions/auth"

async function signOutProfileAction(formData: FormData) {
    'use server'
    void formData
    await logoutAction()
    redirect('/sign-in')
}

export default async function ProfilePage() {
    const profile = await getProfileData()
    const profileName = profile?.name || 'User'
    const profileEmail = profile?.email || 'No email found'
    const profileImage = profile?.image
    const profileInitial = profileName.charAt(0).toUpperCase() || 'U'
    const planLabel = profile?.planLabel || 'Free Plan'

    return (
        <div className="min-h-screen  flex flex-col ">
            <div className="relative  p-4  h-[300px] bg-[#2B7272] rounded-b-[50px]">
                <div className="absolute bottom-0 left-0 w-full h-[150px] bg-gradient-to-t from-white/30 to-transparent pointer-events-none"></div>

                <div className="md:max-w-[600px] lg:max-w-[800px] xl:max-w-[1000px] mx-auto w-full">
                    <Image
                        src="/icons/spiritual.png"
                        height={442}
                        width={442}
                        alt="spiritual"
                        className="absolute top-0 left-1/2 -translate-x-1/2 z-0"
                    />

                    <Header />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2  flex flex-col items-center  mt-6 ">
                        <div className="relative">
                            <div className="w-[150px] h-[150px] rounded-[25px] overflow-hidden border-5 border-[#F5F5F5] shadow-lg bg-white flex items-center justify-center">
                                {profileImage ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={profileImage}
                                        alt={`${profileName} profile`}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-[#1f5d57] text-white flex items-center justify-center font-poppins-600 text-5xl">
                                        {profileInitial}
                                    </div>
                                )}
                            </div>
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-[#1f5d57] rounded-md p-1 border-2 border-white" title="Profile photo editing coming soon">
                                <Camera className="h-5 w-4 text-white" />
                            </div>
                        </div>
                        <h2 className="text-[#484848] text-2xl font-sniglet-400 mt-8 text-[24px] ">{profileName}</h2>
                        <p className="text-[#7E7E7E] mt-1 text-sm font-poppins-400">{profileEmail}</p>
                    </div>
                </div>
            </div>
            <div className="bg-white w-full flex-grow px-6 py-10">
                <MenuItem planLabel={planLabel} signOutAction={signOutProfileAction} />
                <p className="text-center text-[#2B7272] text-[11px] mt-2 mb-20 md:mb-24 font-poppins-400">
                    Prana App v1.0.0
                </p>
            </div>
            <BottomNav activeTab="profile" />
        </div >
    )
}
