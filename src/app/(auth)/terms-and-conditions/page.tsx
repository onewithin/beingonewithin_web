import Link from 'next/link'
import { ChevronLeft, FileText } from 'lucide-react'
import { PolicySection, EmptySection } from '@/app/(main)/terms/_components/PolicySection'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'

type PolicyDocument = {
    id: string
    type: number
    content: string
    active: boolean
    updatedAt: string
}

async function getTermsPolicy(): Promise<{ success: boolean; data: PolicyDocument | null; message: string }> {
    try {
        const response = await fetch(`${BACKEND_URL}/api/privacy-policy/2`, {
            method: 'GET',
            cache: 'no-store',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        const json = (await response.json().catch(() => null)) as {
            message?: string
            data?: PolicyDocument
        } | null

        if (!response.ok || !json?.data) {
            return {
                success: false,
                data: null,
                message: json?.message || 'Terms are currently unavailable.',
            }
        }

        return { success: true, data: json.data, message: 'Loaded.' }
    } catch {
        return { success: false, data: null, message: 'Unable to load terms right now.' }
    }
}

export default async function PublicTermsPage() {
    const termsResult = await getTermsPolicy()

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
                    <h1 className="text-heading text-[1rem] font-poppins-600">Terms &amp; Conditions</h1>
                </div>

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
        </div>
    )
}
