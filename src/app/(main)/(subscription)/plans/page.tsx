import { Headphones, Mic, Smartphone } from "lucide-react"
import Header from "./_components/header"
import BottomNav from "@/components/bottomNav"
import { getSubscriptionPlans, getSubscriptionStatus, SubscriptionPlan, Subscription } from "@/lib/actions/subscription"
import PlanCard from "./_components/plan-card"
import { redirect } from "next/navigation"
import Link from "next/link"
import SubscriptionSSEListener from "@/components/subscription-sse-listener"

export default async function SubscriptionPlansPage() {
    // Check if user already has an active subscription
    const statusResult = await getSubscriptionStatus();
    const currentSubscription = statusResult.ok ? statusResult.data : null;

    // If user has active subscription, redirect to status page
    if (currentSubscription && currentSubscription.status === "ACTIVE") {
        redirect("/subscription/status");
    }

    // Fetch available plans
    const plansResult = await getSubscriptionPlans();

    let plans: SubscriptionPlan[] = [];
    if (plansResult.ok && plansResult.data) {
        // Check if data is a Subscription object or array of plans
        if (Array.isArray(plansResult.data)) {
            plans = plansResult.data;
        }
    }

    // Sort plans: monthly first, then yearly
    const monthlyPlans = plans.filter(p => p.interval === "month");
    const yearlyPlans = plans.filter(p => p.interval === "year");
    const sortedPlans = [...monthlyPlans, ...yearlyPlans];

    return (
        <div className="min-h-screen  flex flex-col">
            <div className="bg-[#DDF3E5] p-4 rounded-b-[50px]">
                <div className="md:max-w-[600px] lg:max-w-[800px] xl:max-w-[1000px] mx-auto w-full">
                    <Header />
                    {/* Main Content */}
                    <div className="flex-1 px-4  mt-1">
                        {/* Hero Section */}
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-[#1f5d57] mb-4 leading-tight font-sniglet-400">Unlock Your Premium Experience</h2>
                            <p className="text-[#484848] text-base leading-relaxed font-poppins-400">
                                Go deeper into calm, connection, and
                                <br />
                                clarity with full access.
                            </p>
                        </div>

                        <div className="mb-8 bg-white rounded-[20px] p-4 font-poppins-600 text-[14px]">
                            <h3 className="text-[#121212] font-semibold text-md  mb-4">What You Get</h3>
                            <div className="grid grid-cols-4 gap-4">
                                <div className=" flex gap-3   items-center">
                                    <Headphones className="w-5 h-5 text-[#1f5d57]" />
                                    <p className="text-[#1b1414]  leading-tight">
                                        Full Access to All
                                        Meditations
                                    </p>
                                </div>
                                <div className=" flex gap-3   items-center ">
                                    <Headphones className="w-5 h-5 text-[#1f5d57]" />
                                    <p className="text-[#1b1414]  leading-tight">
                                        Exclusive Sleep & Rest
                                        Audios
                                    </p>
                                </div>
                                <div className=" flex gap-3   items-center ">
                                    <Mic className="w-5 h-5 text-[#1f5d57]" />
                                    <p className="text-[#1b1414]  leading-tight">
                                        New Weekly Content
                                    </p>
                                </div>
                                <div className=" flex gap-3   items-center">
                                    <Smartphone className="w-5 h-5 text-[#1f5d57]" />
                                    <p className="text-[#1b1414]  leading-tight">
                                        Download & Listen Offline
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <div className="md:max-w-[600px] lg:max-w-[800px] xl:max-w-[1000px] mx-auto w-full mt-12 mb-6 px-4">
                    {plans.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-[#484848] font-poppins-400">
                                No subscription plans available at the moment.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Pricing Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {sortedPlans.map((plan, index) => (
                                    <PlanCard
                                        key={plan.id}
                                        plan={plan}
                                        isMonthly={plan.interval === "month"}
                                    />
                                ))}
                            </div>

                            {currentSubscription && currentSubscription.status !== "ACTIVE" && (
                                <div className="mt-6 text-center">
                                    <Link
                                        href="/subscription/status"
                                        className="text-[#1f5d57] font-poppins-600 underline"
                                    >
                                        View your subscription status
                                    </Link>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
            
            {/* Real-time subscription updates via SSE */}
            <SubscriptionSSEListener />
            
            <BottomNav activeTab="home" />
        </div >
    )
}
