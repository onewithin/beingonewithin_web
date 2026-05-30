import { Card, CardContent } from "@/components/ui/card";
import { getSubscriptionStatus } from "@/lib/actions/subscription";
import { redirect } from "next/navigation";
import StatusHeader from "./_components/header";
import BottomNav from "@/components/bottomNav";
import CancelButton from "./_components/cancel-button";
import { CheckCircle, Calendar, CreditCard, Crown } from "lucide-react";
import Link from "next/link";
import SubscriptionSSEListener from "@/components/subscription-sse-listener";

export default async function SubscriptionStatusPage() {
    const result = await getSubscriptionStatus();

    if (!result.ok || !result.data) {
        // No subscription found, redirect to plans
        redirect("/plans");
    }

    const subscription = result.data;
    const plan = subscription.plan;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatPrice = (price: number, currency: string) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency.toUpperCase(),
        }).format(price);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "ACTIVE":
                return "text-green-600 bg-green-50";
            case "TRIALING":
                return "text-blue-600 bg-blue-50";
            case "CANCELED":
                return "text-red-600 bg-red-50";
            case "PAST_DUE":
                return "text-orange-600 bg-orange-50";
            default:
                return "text-gray-600 bg-gray-50";
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "ACTIVE":
                return "Active";
            case "TRIALING":
                return "Trial";
            case "CANCELED":
                return "Canceled";
            case "PAST_DUE":
                return "Past Due";
            default:
                return status;
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <div className="bg-[#DDF3E5] p-4 rounded-b-[50px] pb-8">
                <div className="md:max-w-[600px] lg:max-w-[800px] xl:max-w-[1000px] mx-auto w-full">
                    <StatusHeader />

                    {/* Status Badge */}
                    <div className="flex justify-center mt-6 mb-4">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${getStatusColor(subscription.status)}`}>
                            <CheckCircle className="w-4 h-4" />
                            <span className="font-poppins-600 text-sm">
                                {getStatusText(subscription.status)}
                            </span>
                        </div>
                    </div>

                    {/* Plan Name */}
                    <div className="text-center mb-6">
                        <div className="flex justify-center items-center gap-2 mb-2">
                            <Crown className="w-6 h-6 text-[#1f5d57]" />
                            <h2 className="text-2xl font-bold text-[#1f5d57] font-sniglet-400">
                                {plan.name}
                            </h2>
                        </div>
                        <p className="text-[#484848] font-poppins-400">
                            {formatPrice(plan.price, plan.currency)} / {plan.interval}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-1 px-4 py-6">
                <div className="md:max-w-[600px] lg:max-w-[800px] xl:max-w-[1000px] mx-auto w-full space-y-4">
                    {/* Subscription Details */}
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-start gap-3">
                                <Calendar className="w-5 h-5 text-[#1f5d57] mt-0.5" />
                                <div className="flex-1">
                                    <p className="font-poppins-600 text-sm text-[#121212]">
                                        Current Period
                                    </p>
                                    <p className="font-poppins-400 text-sm text-[#484848]">
                                        {formatDate(subscription.currentPeriodStart)} -{" "}
                                        {formatDate(subscription.currentPeriodEnd)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <CreditCard className="w-5 h-5 text-[#1f5d57] mt-0.5" />
                                <div className="flex-1">
                                    <p className="font-poppins-600 text-sm text-[#121212]">
                                        Next Billing Date
                                    </p>
                                    <p className="font-poppins-400 text-sm text-[#484848]">
                                        {subscription.cancelAtPeriodEnd
                                            ? "Subscription will end on "
                                            : ""}
                                        {formatDate(subscription.currentPeriodEnd)}
                                    </p>
                                    {!subscription.cancelAtPeriodEnd && (
                                        <p className="font-poppins-400 text-xs text-[#484848] mt-1">
                                            Amount: {formatPrice(plan.price, plan.currency)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Transaction History Link */}
                    <Card>
                        <CardContent className="p-4">
                            <Link
                                href="/subscription/transactions"
                                className="flex items-center justify-between w-full"
                            >
                                <span className="font-poppins-600 text-sm text-[#121212]">
                                    View Transaction History
                                </span>
                                <span className="text-[#1f5d57]">→</span>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Cancel Subscription */}
                    {subscription.status === "ACTIVE" && (
                        <CancelButton
                            subscriptionId={subscription.id}
                            cancelAtPeriodEnd={subscription.cancelAtPeriodEnd}
                        />
                    )}

                    {/* Manage Billing */}
                    <Card className="bg-[#f5f5f5] border-0">
                        <CardContent className="p-4">
                            <p className="font-poppins-400 text-xs text-[#484848] text-center leading-relaxed">
                                Billing is managed through Stripe. For payment method updates or invoices,
                                please contact support.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Real-time subscription updates via SSE */}
            <SubscriptionSSEListener />

            <BottomNav activeTab="home" />
        </div>
    );
}
