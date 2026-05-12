import Link from 'next/link'
import { ChevronLeft, FileText, ShieldCheck } from 'lucide-react'
import { getPolicyAction } from '@/lib/actions/profile'
import { PolicySection, EmptySection } from './_components/PolicySection'

export default async function TermsPage() {
    const [privacyResult, termsResult] = await Promise.all([
        getPolicyAction(1),
        getPolicyAction(2),
    ])

    return (
        <div className="min-h-screen bg-mint-to-white px-4 py-5">
            <div className=" w-full md:max-w-[600px] lg:max-w-[800px] xl:max-w-[1000px] 2xl:max-w-[1200px] mx-auto space-y-5">

                {/* Header */}
                <div className="flex items-center gap-2">
                    <Link
                        href="/profile"
                        className="bg-white p-1 rounded-lg border border-subtle"
                        aria-label="Back to profile"
                    >
                        <ChevronLeft className="h-5 w-5 text-secondary" />
                    </Link>
                    <h1 className="text-heading text-[1rem] font-poppins-600">Terms &amp; Privacy</h1>
                </div>

                {/* Terms & Conditions */}
                {termsResult.success && termsResult.data ? (
                    <PolicySection
                        icon={<FileText className="h-5 w-5" />}
                        title="Terms &amp; Conditions"
                        content={termsResult.data.content}
                    />
                ) : (
                    <EmptySection
                        title="Terms &amp; Conditions"
                        message={termsResult.message}
                    />
                )}


                {/* Privacy Policy */}
                {privacyResult.success && privacyResult.data ? (
                    <PolicySection
                        icon={<ShieldCheck className="h-5 w-5" />}
                        title="Privacy Policy"
                        content={privacyResult.data.content}
                    />
                ) : (
                    <EmptySection
                        title="Privacy Policy"
                        message={privacyResult.message}
                    />
                )}

            </div>
        </div>
    )
}

