import Link from 'next/link'
import { ChevronLeft, FileText, ShieldCheck } from 'lucide-react'
import { PolicySection, EmptySection } from '@/app/(main)/terms/_components/PolicySection'

const NEXT_PUBLIC_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'

type PolicyDocument = {
    id: string
    type: number
    content: string
    active: boolean
    updatedAt: string
}

async function fetchPolicy(type: number): Promise<{ success: boolean; data: PolicyDocument | null; message: string }> {
    try {
        const response = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/api/privacy-policy/${type}`, {
            method: 'GET',
            cache: 'no-store',
            headers: { 'Content-Type': 'application/json' },
        })

        const json = (await response.json().catch(() => null)) as {
            message?: string
            data?: PolicyDocument
        } | null

        if (!response.ok || !json?.data) {
            return { success: false, data: null, message: json?.message || 'Content is currently unavailable.' }
        }

        return { success: true, data: json.data, message: 'Loaded.' }
    } catch {
        return { success: false, data: null, message: 'Unable to load content right now.' }
    }
}

export default async function PublicTermsPage() {
    const [privacyResult, termsResult] = await Promise.all([
        fetchPolicy(1),
        fetchPolicy(2),
    ])

    return (
        <div className="min-h-screen bg-mint-to-white px-4 py-5">
            <div className="w-full md:max-w-[600px] lg:max-w-[800px] xl:max-w-[1000px] 2xl:max-w-[1200px] mx-auto space-y-5">
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

                <div id="terms">
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
                </div>

                <div id="privacy">
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
        </div>
    )
}
