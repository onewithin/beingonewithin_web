'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SubscriptionPlan, createWebCheckout } from "@/lib/actions/subscription";
import { useState } from "react";
import { useRouter } from "next/navigation";

type PlanCardProps = {
    plan: SubscriptionPlan;
    isMonthly: boolean;
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

export default function PlanCard({ plan, isMonthly }: PlanCardProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const colors = isMonthly ? planColors.monthly : planColors.yearly;

    const handleSubscribe = async () => {
        setLoading(true);
        try {
            const result = await createWebCheckout(plan.id);
            if (result.ok && result.data?.url) {
                // Redirect to Stripe checkout
                window.location.href = result.data.url;
            } else {
                alert(result.message || "Failed to create checkout session");
                setLoading(false);
            }
        } catch (error) {
            alert("An error occurred. Please try again.");
            setLoading(false);
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
        if (loading) return "Loading...";
        if (isMonthly) return "Subscribe Monthly";
        return `Go ${plan.interval === "year" ? "Yearly" : "Long-term"} - Save`;
    };

    return (
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
                    disabled={loading}
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
    );
}
