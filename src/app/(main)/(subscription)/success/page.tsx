import { Card, CardContent } from "@/components/ui/card";
import {
    AlertCircle,
    CheckCircle,
    Crown,
    Download,
    PlayCircle,
    Sparkles,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/bottomNav";
import SubscriptionSSEListener from "@/components/subscription-sse-listener";
import Image from "next/image";
import { getSubscriptionStatus } from "@/lib/actions/subscription";

export default async function SubscriptionSuccessPage() {
    const subscriptionResult = await getSubscriptionStatus();
    const subscription = subscriptionResult.ok ? subscriptionResult.data : null;
    const hasPremiumAccess =
        subscription?.status === "ACTIVE" || subscription?.status === "TRIALING";

    return (
        <div className="min-h-screen flex flex-col bg-mint-to-white font-poppins-400 relative overflow-hidden">
            <Image
                src="/icons/half-flower.png"
                height={520}
                width={520}
                alt="decorative flower"
                aria-hidden="true"
                className="pointer-events-none select-none absolute -top-24 left-1/2 -translate-x-1/2 opacity-20"
            />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(221,243,229,0.9),_transparent_45%),radial-gradient(circle_at_bottom_right,_rgba(95,127,119,0.10),_transparent_28%)]" />

            <div className="relative z-10 flex flex-1 items-center px-4 py-6 pb-24 sm:pb-28">
                <div className="mx-auto w-full max-w-[60rem]">
                    <div className="mb-4 flex items-center justify-between">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/60 px-4 py-2 shadow-sm backdrop-blur-sm">
                            <Image src="/icons/morning.png" alt="Morning" width={18} height={18} className="h-[18px] w-[18px]" />
                            <span className="text-sm font-poppins-600 text-[#1f5d57]">
                                {hasPremiumAccess ? "Subscription confirmed" : "Free plan detected"}
                            </span>
                        </div>
                        <Image src="/icons/flower1.png" alt="Flower" width={28} height={28} className="h-7 w-7 opacity-90" />
                    </div>

                    <Card className="overflow-hidden border border-white/70 bg-white/85 shadow-[0_28px_80px_rgba(31,93,87,0.12)] backdrop-blur-sm">
                        <CardContent className="p-0">
                            <div className="relative overflow-hidden bg-[#DDF3E5] px-5 py-8 sm:px-8 sm:py-10">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.55),_transparent_58%)]" />

                                <div className="relative grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
                                    <div className="max-w-[34rem] text-center lg:text-left">
                                        <div className="inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-[#1f5d57] shadow-sm">
                                            {hasPremiumAccess ? (
                                                <Sparkles className="h-4 w-4" />
                                            ) : (
                                                <AlertCircle className="h-4 w-4" />
                                            )}
                                            <span className="text-sm font-poppins-600">
                                                {hasPremiumAccess
                                                    ? "Premium access is now active"
                                                    : "Premium access is locked on your current plan"}
                                            </span>
                                        </div>

                                        <h1 className="mt-4 font-sniglet-400 text-[2.2rem] leading-tight text-[#1f5d57] sm:text-[3rem]">
                                            {hasPremiumAccess
                                                ? "Your account is ready."
                                                : "Upgrade to unlock premium."}
                                        </h1>
                                        <p className="mt-3 max-w-[34rem] text-sm leading-6 text-[#3F4F4A] sm:text-base sm:leading-7">
                                            {hasPremiumAccess
                                                ? "Your subscription has been activated successfully. You can now continue with premium meditations, offline listening, and exclusive content inside the app."
                                                : "Your account is currently on the Free plan. To continue with premium meditations, offline listening, and exclusive content, switch to a subscription plan."}
                                        </p>

                                        <div className="mt-5 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                                            {hasPremiumAccess ? (
                                                <>
                                                    <span className="rounded-full bg-white/75 px-3 py-2 text-xs font-poppins-600 text-[#1f5d57] shadow-sm">Unlimited access</span>
                                                    <span className="rounded-full bg-white/75 px-3 py-2 text-xs font-poppins-600 text-[#1f5d57] shadow-sm">Offline listening</span>
                                                    <span className="rounded-full bg-white/75 px-3 py-2 text-xs font-poppins-600 text-[#1f5d57] shadow-sm">Exclusive content</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="rounded-full bg-white/75 px-3 py-2 text-xs font-poppins-600 text-[#1f5d57] shadow-sm">Free plan</span>
                                                    <span className="rounded-full bg-white/75 px-3 py-2 text-xs font-poppins-600 text-[#1f5d57] shadow-sm">Premium locked</span>
                                                    <span className="rounded-full bg-white/75 px-3 py-2 text-xs font-poppins-600 text-[#1f5d57] shadow-sm">Upgrade required</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mx-auto w-full max-w-[18rem] rounded-[28px] border border-white/70 bg-white/80 p-5 text-center shadow-[0_20px_50px_rgba(31,93,87,0.12)] lg:mx-0 lg:justify-self-end">
                                        <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full shadow-[0_18px_36px_rgba(31,93,87,0.2)] ${hasPremiumAccess ? "bg-[#1f5d57]" : "bg-[#D98B56]"}`}>
                                            {hasPremiumAccess ? (
                                                <CheckCircle className="h-8 w-8 text-white" />
                                            ) : (
                                                <AlertCircle className="h-8 w-8 text-white" />
                                            )}
                                        </div>
                                        <p className="mt-4 text-[11px] uppercase tracking-[0.22em] text-[#1f5d57]/70">Status</p>
                                        <p className="mt-1 text-[1.35rem] font-sniglet-400 text-[#1f5d57]">
                                            {hasPremiumAccess ? "Premium active" : "Free plan"}
                                        </p>
                                        <p className="mt-2 text-sm leading-6 text-[#4A5A54]">
                                            {hasPremiumAccess
                                                ? "Your membership is synced and ready across the platform."
                                                : "Switch to a paid subscription to unlock premium content across the app."}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-3 px-5 py-5 sm:grid-cols-3 sm:px-8">
                                <div className="rounded-[22px] border border-[#D8E8DF] bg-[#F7FBF9] p-4 shadow-sm">
                                    <Crown className="h-5 w-5 text-[#1f5d57]" />
                                    <p className="mt-3 text-sm font-poppins-600 text-[#1f5d57]">Unlimited access</p>
                                    <p className="mt-1 text-sm leading-6 text-[#51615A]">Full access to premium meditations and extended sessions.</p>
                                </div>
                                <div className="rounded-[22px] border border-[#D8E8DF] bg-[#F7FBF9] p-4 shadow-sm">
                                    <Download className="h-5 w-5 text-[#1f5d57]" />
                                    <p className="mt-3 text-sm font-poppins-600 text-[#1f5d57]">Offline listening</p>
                                    <p className="mt-1 text-sm leading-6 text-[#51615A]">Download and listen anytime, even without a connection.</p>
                                </div>
                                <div className="rounded-[22px] border border-[#D8E8DF] bg-[#F7FBF9] p-4 shadow-sm">
                                    <PlayCircle className="h-5 w-5 text-[#1f5d57]" />
                                    <p className="mt-3 text-sm font-poppins-600 text-[#1f5d57]">Exclusive content</p>
                                    <p className="mt-1 text-sm leading-6 text-[#51615A]">Access premium-only releases and guided experiences.</p>
                                </div>
                            </div>

                            <div className="px-5 pb-5 sm:px-8 sm:pb-6">
                                <div className="rounded-[28px] bg-[#1f5d57] px-5 py-5 text-white shadow-[0_18px_40px_rgba(31,93,87,0.22)] sm:px-6">
                                    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                                        <div>
                                            <p className="text-sm uppercase tracking-[0.2em] text-white/65">Next steps</p>
                                            <p className="mt-2 font-sniglet-400 text-[1.45rem] leading-tight">
                                                {hasPremiumAccess
                                                    ? "Start from home or review your plan details."
                                                    : "Change to a subscription plan to continue."}
                                            </p>
                                            <p className="mt-2 max-w-[34rem] text-sm leading-6 text-white/78">
                                                {hasPremiumAccess
                                                    ? "We’ve updated your account. Your premium experience is available across the app immediately."
                                                    : "Premium features are not available on the Free plan. Choose a plan to unlock full access."}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/85 backdrop-blur-sm">
                                            <Sparkles className="h-4 w-4" />
                                            {hasPremiumAccess ? "Synced to your profile" : "Upgrade needed"}
                                        </div>
                                    </div>

                                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                        {hasPremiumAccess ? (
                                            <Link href="/subscription/status" className="block">
                                                <Button className="w-full bg-white text-[#1f5d57] hover:bg-[#f0f8f5] font-poppins-600 py-5 shadow-none">
                                                    View Subscription Details
                                                </Button>
                                            </Link>
                                        ) : (
                                            <Link href="/plans" className="block">
                                                <Button className="w-full bg-white text-[#1f5d57] hover:bg-[#f0f8f5] font-poppins-600 py-5 shadow-none">
                                                    Change to Subscription
                                                </Button>
                                            </Link>
                                        )}

                                        <Link href="/home" className="block">
                                            <Button variant="outline" className="w-full border-white/30 bg-white/10 text-white hover:bg-white/15 font-poppins-600 py-5">
                                                Continue to Home
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Real-time subscription updates via SSE */}
            <SubscriptionSSEListener />

            <BottomNav activeTab="home" />
        </div>
    )
}
