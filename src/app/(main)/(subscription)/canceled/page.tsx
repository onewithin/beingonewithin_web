import { Card, CardContent } from "@/components/ui/card";
import { XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/bottomNav";

export default function SubscriptionCanceledPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <div className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="md:max-w-[600px] w-full">
                    <Card className="border-2 border-orange-200">
                        <CardContent className="p-8 text-center">
                            <div className="flex justify-center mb-6">
                                <div className="bg-orange-100 p-4 rounded-full">
                                    <XCircle className="w-12 h-12 text-orange-600" />
                                </div>
                            </div>

                            <h1 className="text-2xl font-bold text-[#1f5d57] mb-4 font-sniglet-400">
                                Checkout Canceled
                            </h1>

                            <p className="text-[#484848] font-poppins-400 mb-6 leading-relaxed">
                                Your subscription checkout was canceled. No charges were made to your account. You can try again anytime to unlock premium features.
                            </p>

                            <div className="space-y-3">
                                <Link href="/plans">
                                    <Button className="w-full bg-[#1f5d57] hover:bg-[#174a45] text-white font-poppins-600 py-6">
                                        View Plans Again
                                    </Button>
                                </Link>

                                <Link href="/">
                                    <Button variant="outline" className="w-full font-poppins-600 py-6">
                                        Back to Home
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <BottomNav activeTab="home" />
        </div>
    );
}
