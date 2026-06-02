'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SubscriptionPlan, createWebCheckout } from "@/lib/actions/subscription";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";

function TrialPopup({
    trialDays,
    onConfirm,
    onCancel,
    loading,
}: {
    trialDays: number;
    onConfirm: () => void;
    onCancel: () => void;
    loading: boolean;
}) {
    const modal = (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
            onClick={(e) => { if (e.target === e.currentTarget) onCancel() }}
        >
            <div className="relative w-[90%] max-w-sm rounded-[30px] bg-white p-6 shadow-2xl flex flex-col items-center gap-0">
                {/* Icon */}


                {/* Title */}
                <h2 className="font-sniglet-400 text-[1.25rem] text-[#1F5D57] text-center">
                    Try {trialDays}-day trial
                </h2>

                {/* Subtitle */}
                <p className="mt-3 font-poppins-400 text-[0.875rem] text-[#484848] text-center leading-relaxed">
                    A <span className="font-poppins-600">small refundable</span> verification charge is required to start your trial. The amount will be credited back to you instantly.
                </p>

                {/* Confirm button */}
                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={loading}
                    className="mt-6 w-full rounded-2xl bg-[#1F5D57] py-3 font-poppins-600 text-white text-[0.9375rem] hover:bg-[#174d48] transition-colors disabled:opacity-70"
                >
                    {loading ? "Loading..." : "Start your free trial"}
                </button>

                {/* Cancel */}
                <button
                    type="button"
                    onClick={onCancel}
                    className="mt-3 font-poppins-400 text-[0.875rem] text-[#484848] hover:underline"
                >
                    Cancel
                </button>
            </div>
        </div>
    );

    return createPortal(modal, document.body);
}

type PlanCardProps = {
    plan: SubscriptionPlan;
    isMonthly: boolean;
    disableSubscribe?: boolean;
};

const planColors = {
    monthly: {
        bg: "bg-[#fef9c4]",
        border: "border-[#ff780b]",
        price: "text-[#ff780b]",
        button: "bg-[#ff780b] hover:bg-[#e6690a]",
    },
    yearly: {
        bg: "bg-[#d8f6e0]",
        border: "border-[#04c03a]",
        price: "text-[#04c03a]",
        button: "bg-[#04c03a] hover:bg-[#039933]",
    },
};

export default function PlanCard({ plan, isMonthly, disableSubscribe = false }: PlanCardProps) {
    const [loading, setLoading] = useState(false);
    const [showTrialPopup, setShowTrialPopup] = useState(false);
    const router = useRouter();
    const colors = isMonthly ? planColors.monthly : planColors.yearly;

    const proceedToCheckout = async () => {
        setLoading(true);
        setShowTrialPopup(false);
        try {
            const origin = window.location.origin;
            const result = await createWebCheckout(plan.id, {
                successUrl: `${origin}/plans?payment=success&session_id={CHECKOUT_SESSION_ID}`,
                cancelUrl: `${origin}/plans?payment=cancel`,
            });
            const checkoutUrl = result.data?.paymentUrl || result.data?.url;

            if (result.ok && checkoutUrl) {
                window.location.href = checkoutUrl;
            } else {
                alert(result.message || "Failed to create checkout session");
                setLoading(false);
            }
        } catch (error) {
            alert("An error occurred. Please try again.");
            setLoading(false);
        }
    };

    const handleSubscribe = () => {
        if (disableSubscribe) return;

        if (plan.trialDays && plan.trialDays > 0) {
            setShowTrialPopup(true);
        } else {
            proceedToCheckout();
        }
    };

    const formatPrice = (price: number) => {
        return `$${price.toFixed(2)}`;
    };

    const getIntervalText = () => {
        if (plan.intervalCount === 1) {
            return `/ ${plan.interval}`;
        }
        return `/ ${plan.intervalCount} ${plan.interval}s`;
    };

    const getButtonText = () => {
        if (disableSubscribe) return "Already subscribed";
        if (loading) return "Loading...";
        if (plan.trialDays && plan.trialDays > 0) return `Try ${plan.trialDays}-day trial`;
        if (isMonthly) return "Subscribe Monthly";
        return `Go ${plan.interval === "year" ? "Yearly" : "Long-term"} - Save`;
    };

    return (
        <>
            {showTrialPopup && (
                <TrialPopup
                    trialDays={plan.trialDays!}
                    onConfirm={proceedToCheckout}
                    onCancel={() => setShowTrialPopup(false)}
                    loading={loading}
                />
            )}
            <Card className={`${colors.bg} border-2 ${colors.border} rounded-2xl overflow-hidden`}>
                <CardContent className="p-6">
                    <div className="text-center mb-6">
                        <h3 className="text-[#121212] text-lg mb-4 font-poppins-600">
                            {plan.name}
                        </h3>
                        <div className="mb-2 font-sniglet-400">
                            <span className={`text-4xl ${colors.price}`}>
                                {formatPrice(plan.price)}
                            </span>
                            <span className="text-[#484848] text-lg ml-1">
                                {getIntervalText()}
                            </span>
                        </div>
                        {!isMonthly && (
                            <p className="text-[#484848] text-sm font-poppins-400">
                                ⭐ Best Value ⭐
                            </p>
                        )}
                        {isMonthly && (
                            <p className="text-[#484848] text-sm font-poppins-400">
                                Most flexible
                            </p>
                        )}
                        {plan.trialDays && plan.trialDays > 0 && (
                            <p className="text-[#121212] text-sm font-poppins-600 mt-2">
                                {plan.trialDays}-day free trial
                            </p>
                        )}
                    </div>
                    <Button
                        onClick={handleSubscribe}
                        disabled={loading || disableSubscribe}
                        className={`w-full font-poppins-600 px-6 py-5 ${colors.button} text-white font-semibold rounded-xl mb-4`}
                    >
                        {getButtonText()}
                    </Button>
                    <p className="text-[#484848] font-poppins-400 text-xs text-center leading-relaxed">
                        Cancel anytime. Billed via
                        <br />
                        Stripe secure checkout.
                    </p>
                </CardContent>
            </Card>
        </>
    );
}
