import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function TermsLoading() {
    return (
        <div className="min-h-screen bg-mint-to-white px-4 py-5">
            <div className="w-full md:max-w-[600px] lg:max-w-[800px] xl:max-w-[1000px] 2xl:max-w-[1200px] mx-auto space-y-5">
                {/* Header skeleton */}
                <div className="flex items-center gap-2">
                    <Link
                        href="/register"
                        className="bg-white p-1 rounded-lg border border-subtle"
                        aria-label="Back to register"
                    >
                        <ChevronLeft className="h-5 w-5 text-secondary" />
                    </Link>
                    <h1 className="text-heading text-[1rem] font-poppins-600">Terms &amp; Privacy</h1>
                </div>

                {/* Terms card skeleton */}
                <div className="rounded-2xl border border-gray-100 bg-white p-5 space-y-3 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="h-5 w-5 rounded bg-gray-200 animate-pulse" />
                        <div className="h-4 w-44 rounded bg-gray-200 animate-pulse" />
                    </div>
                    <div className="space-y-2">
                        <div className="h-3 w-full rounded bg-gray-100 animate-pulse" />
                        <div className="h-3 w-5/6 rounded bg-gray-100 animate-pulse" />
                        <div className="h-3 w-4/6 rounded bg-gray-100 animate-pulse" />
                        <div className="h-3 w-full rounded bg-gray-100 animate-pulse" />
                        <div className="h-3 w-3/4 rounded bg-gray-100 animate-pulse" />
                    </div>
                </div>

                {/* Privacy card skeleton */}
                <div className="rounded-2xl border border-gray-100 bg-white p-5 space-y-3 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="h-5 w-5 rounded bg-gray-200 animate-pulse" />
                        <div className="h-4 w-36 rounded bg-gray-200 animate-pulse" />
                    </div>
                    <div className="space-y-2">
                        <div className="h-3 w-full rounded bg-gray-100 animate-pulse" />
                        <div className="h-3 w-5/6 rounded bg-gray-100 animate-pulse" />
                        <div className="h-3 w-4/6 rounded bg-gray-100 animate-pulse" />
                        <div className="h-3 w-full rounded bg-gray-100 animate-pulse" />
                        <div className="h-3 w-3/4 rounded bg-gray-100 animate-pulse" />
                    </div>
                </div>
            </div>
        </div>
    )
}
