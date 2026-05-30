import Link from 'next/link'
import { Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
    return (
        <div className="min-h-screen bg-mint-to-white flex items-center justify-center p-4">
            <div className="text-center max-w-md">
                <div className="mb-8">
                    <h1 className="font-sniglet-400 text-[4rem] text-primary mb-4">404</h1>
                    <h2 className="font-poppins-600 text-[1.5rem] text-secondary mb-2">
                        Content Not Found
                    </h2>
                    <p className="font-poppins-400 text-color">
                        The meditation or thought you're looking for doesn't exist or has been removed.
                    </p>
                </div>

                <Link href="/home">
                    <Button className="font-poppins-600 bg-primary hover:bg-secondary transition-colors">
                        <Home className="w-5 h-5 mr-2" />
                        Back to Home
                    </Button>
                </Link>
            </div>
        </div>
    )
}
