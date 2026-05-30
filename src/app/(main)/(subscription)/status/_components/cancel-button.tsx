'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cancelSubscription } from "@/lib/actions/subscription";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle } from "lucide-react";

type CancelButtonProps = {
    subscriptionId: string;
    cancelAtPeriodEnd: boolean;
};

export default function CancelButton({ subscriptionId, cancelAtPeriodEnd }: CancelButtonProps) {
    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const router = useRouter();

    const handleCancel = async () => {
        setLoading(true);
        try {
            const result = await cancelSubscription();
            if (result.ok) {
                alert("Your subscription will be canceled at the end of the current billing period.");
                router.refresh();
            } else {
                alert(result.message || "Failed to cancel subscription");
            }
        } catch (error) {
            alert("An error occurred. Please try again.");
        } finally {
            setLoading(false);
            setShowConfirm(false);
        }
    };

    if (cancelAtPeriodEnd) {
        return (
            <Card className="bg-orange-50 border-orange-200">
                <CardContent className="p-4 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    <div>
                        <p className="font-poppins-600 text-sm text-[#121212]">
                            Cancellation Scheduled
                        </p>
                        <p className="font-poppins-400 text-xs text-[#484848]">
                            Your subscription will end at the current period end.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (showConfirm) {
        return (
            <Card className="bg-red-50 border-red-200">
                <CardContent className="p-4">
                    <p className="font-poppins-600 text-sm text-[#121212] mb-3">
                        Are you sure you want to cancel your subscription?
                    </p>
                    <p className="font-poppins-400 text-xs text-[#484848] mb-4">
                        You'll continue to have access until the end of your current billing period.
                    </p>
                    <div className="flex gap-2">
                        <Button
                            onClick={handleCancel}
                            disabled={loading}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-poppins-600 text-sm"
                        >
                            {loading ? "Canceling..." : "Yes, Cancel"}
                        </Button>
                        <Button
                            onClick={() => setShowConfirm(false)}
                            disabled={loading}
                            variant="outline"
                            className="flex-1 font-poppins-600 text-sm"
                        >
                            Keep Subscription
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Button
            onClick={() => setShowConfirm(true)}
            variant="outline"
            className="w-full font-poppins-600 text-red-600 border-red-600 hover:bg-red-50"
        >
            Cancel Subscription
        </Button>
    );
}
