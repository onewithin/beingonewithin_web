'use client';

import { useSubscriptionSSE } from "@/hooks/useSubscriptionSSE";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";

export default function SubscriptionSSEListener() {
  const router = useRouter();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  
  const { isConnected, lastEvent } = useSubscriptionSSE(true);

  useEffect(() => {
    if (lastEvent?.type === "payment_success") {
      const { message, amount, currency } = lastEvent.data;
      
      // Show toast notification
      setToastMessage(message || "Payment successful!");
      setShowToast(true);
      
      // Refresh the page to show updated subscription
      setTimeout(() => {
        router.refresh();
      }, 2000);
      
      // Hide toast after 5 seconds
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
    }
  }, [lastEvent, router]);

  if (!showToast) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className="bg-green-50 border-2 border-green-500 rounded-xl shadow-lg p-4 flex items-center gap-3 min-w-[300px]">
        <div className="bg-green-500 p-2 rounded-full">
          <CheckCircle className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="font-poppins-600 text-sm text-green-900">
            {toastMessage}
          </p>
          <p className="font-poppins-400 text-xs text-green-700 mt-1">
            Your subscription is now active
          </p>
        </div>
      </div>
    </div>
  );
}
