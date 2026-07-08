import { Download, Lock, Mic, Moon } from "lucide-react";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import {
    getSubscriptionPlansWithToken,
    getSubscriptionStatusWithToken,
    Subscription,
    SubscriptionPlan,
} from "@/lib/actions/subscription";
import PayPlanCard from "./_components/pay-plan-card";
import PayResultPopup from "./_components/pay-result-popup";
import PayHeader from "./_components/pay-header";

export default async function PublicPayPage({
    searchParams,
}: {
    searchParams: Promise<{ token?: string }>;
}) {
    const { token } = await searchParams;

    if (!token) {
        redirect("/sign-in");
    }

    const statusResult = await getSubscriptionStatusWithToken(token);

    // Invalid/expired/missing token — the backend rejects the bearer token with 401/403.
    if (!statusResult.ok) {
        redirect("/sign-in");
    }

    const currentSubscription = statusResult.data as (Subscription & {
        isPremium?: boolean;
        hasAccessToPremium?: boolean;
        activeSubscription?: { status?: string | null } | null;
    }) | null;

    const plansResult = await getSubscriptionPlansWithToken(token);
    let plans: SubscriptionPlan[] = [];
    if (plansResult.ok && plansResult.data && Array.isArray(plansResult.data)) {
        plans = plansResult.data;
    }

    const hasActiveSubscription =
        currentSubscription?.hasAccessToPremium === true ||
        currentSubscription?.isPremium === true ||
        currentSubscription?.activeSubscription?.status === "ACTIVE" ||
        currentSubscription?.activeSubscription?.status === "TRIALING" ||
        currentSubscription?.status === "ACTIVE" ||
        currentSubscription?.status === "TRIALING";

    const trialPlan = plans.find((p) => p.trialDays && p.trialDays > 0);
    let trialEndsLabel: string | null = null;
    if (trialPlan?.trialDays) {
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + trialPlan.trialDays);
        trialEndsLabel = endDate.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#DDF3E5]">
            <div className="max-w-[420px] mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
                <PayHeader />

                {/* Status heading */}
                {hasActiveSubscription ? (
                    <>
                        <h2 className="text-[26px] sm:text-3xl font-sniglet-400 text-[#1f5d57] mb-2 leading-tight">
                            You&apos;re Premium
                        </h2>
                        <p className="text-[13px] sm:text-sm text-[#484848] font-poppins-400 mb-6">
                            You already have full access to all meditations.
                        </p>
                    </>
                ) : (
                    <>
                        <h2 className="text-[26px] sm:text-3xl font-sniglet-400 text-[#1f5d57] mb-2 leading-tight">
                            You&apos;re on the Free Plan
                        </h2>
                        <p className="text-[13px] sm:text-sm text-[#484848] font-poppins-400 mb-6">
                            You currently have limited access to meditations.
                        </p>
                    </>
                )}

                <h3 className="text-[15px] sm:text-base font-sniglet-400 text-[#1f5d57] mb-3">
                    What you are missing
                </h3>

                {/* Feature card */}
                <div className="bg-[#c9ecd7] rounded-[24px] p-5 sm:p-6">
                    <Lock className="w-6 h-6 text-[#1f5d57] mb-3" strokeWidth={2} />
                    <h3 className="text-[17px] sm:text-lg font-poppins-600 text-[#1f5d57] mb-2 leading-snug">
                        Unlock Being One Within Premium
                    </h3>
                    <p className="text-[13px] sm:text-sm text-[#1f5d57]/80 font-poppins-400 leading-relaxed mb-5">
                        Experience deeper rest, healing, and clarity — anytime you need.
                    </p>

                    <h4 className="text-[13px] sm:text-sm font-poppins-600 text-[#1f5d57] mb-3">
                        What You Get
                    </h4>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-4">
                        <div className="flex gap-2 items-start">
                            <Mic className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-[#1f5d57] mt-0.5" />
                            <p className="text-[12px] sm:text-[13px] font-poppins-600 text-[#1f5d57] leading-tight">
                                Full Access to All Meditations
                            </p>
                        </div>
                        <div className="flex gap-2 items-start">
                            <Moon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-[#1f5d57] mt-0.5" />
                            <p className="text-[12px] sm:text-[13px] font-poppins-600 text-[#1f5d57] leading-tight">
                                Exclusive Sleep &amp; Rest Audios
                            </p>
                        </div>
                        <div className="flex gap-2 items-start">
                            <Mic className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-[#1f5d57] mt-0.5" />
                            <p className="text-[12px] sm:text-[13px] font-poppins-600 text-[#1f5d57] leading-tight">
                                New Weekly Content
                            </p>
                        </div>
                        <div className="flex gap-2 items-start">
                            <Download className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-[#1f5d57] mt-0.5" />
                            <p className="text-[12px] sm:text-[13px] font-poppins-600 text-[#1f5d57] leading-tight">
                                Download &amp; Listen Offline
                            </p>
                        </div>
                    </div>

                    {trialEndsLabel && (
                        <p className="text-center text-[11px] sm:text-xs font-poppins-400 text-[#1f5d57] mt-5">
                            *{trialPlan!.trialDays}-day free trial ends on{" "}
                            <span className="font-poppins-600">{trialEndsLabel}</span>
                        </p>
                    )}
                </div>

                {hasActiveSubscription && (
                    <div className="mt-6 rounded-[16px] border border-[#1f5d57]/20 bg-white px-4 py-3 text-center font-poppins-400 text-[13px] text-[#1f5d57]">
                        You already have an active subscription.
                    </div>
                )}

                {/* Plan cards */}
                {plans.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-[#484848] font-poppins-400 text-sm">
                            No subscription plans available at the moment.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3 mt-6">
                        {plans.map((plan) => (
                            <PayPlanCard
                                key={plan.id}
                                plan={plan}
                                isMonthly={plan.interval === "month"}
                                token={token}
                                disableSubscribe={hasActiveSubscription}
                            />
                        ))}
                    </div>
                )}
            </div>

            <Suspense>
                <PayResultPopup />
            </Suspense>
        </div>
    );
}
