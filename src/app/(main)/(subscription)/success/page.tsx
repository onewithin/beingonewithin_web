import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/bottomNav";
import SubscriptionSSEListener from "@/components/subscription-sse-listener";

export default function SubscriptionSuccessPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <div className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="md:max-w-[600px] w-full">
                    <Card className="border-2 border-green-200">
                        <CardContent className="p-8 text-center">
                            <div className="flex justify-center mb-6">
                                <div className="bg-green-100 p-4 rounded-full">
                                    <CheckCircle className="w-12 h-12 text-green-600" />
                                </div>
                            </div>

                            <h1 className="text-2xl font-bold text-[#1f5d57] mb-4 font-sniglet-400">
                                Welcome to Premium!
                            </h1>

                            <p className="text-[#484848] font-poppins-400 mb-6 leading-relaxed">
                                Your subscription has been activated successfully. You now have access to all premium features including unlimited meditations, offline downloads, and exclusive content.
                            </p>

                            <div className="space-y-3">
                                <Link href="/subscription/status">
                                    <Button className="w-full bg-[#1f5d57] hover:bg-[#174a45] text-white font-poppins-600 py-6">
                                        View Subscription Details
                                    </Button>
                                </Link>

                                <Link href="/">
                                    <Button variant="outline" className="w-full font-poppins-600 py-6">
                                        Start Exploring
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
    
    {/* Real-time subscription updates via SSE */}
    <SubscriptionSSEListener />
    
