'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function PolicySection({
    icon,
    title,
    content,
}: {
    icon: React.ReactNode
    title: string
    content: string
}) {
    const [expanded, setExpanded] = useState(false)

    return (
        <Card className="border-subtle shadow-sm rounded-2xl">
            <CardHeader className="pb-2 flex flex-row items-center gap-3 space-y-0">
                <span className="text-secondary">{icon}</span>
                <CardTitle className="text-[1rem] font-poppins-600 text-heading">{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="relative">
                    <div
                        className={`prose text-sm prose-sm max-w-none text-dark font-poppins-400 leading-relaxed
                            prose-headings:font-poppins-600 prose-headings:text-heading
                            prose-a:text-secondary prose-a:underline overflow-hidden transition-[max-height] duration-300 ease-in-out ${expanded ? 'max-h-[2000px]' : 'max-h-40'
                            }`}
                        dangerouslySetInnerHTML={{ __html: content }}
                    />
                    {!expanded && (
                        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                    )}
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpanded(prev => !prev)}
                    className="text-secondary font-poppins-500 hover:bg-surface-tint px-0 gap-1"
                >
                    {expanded ? (
                        <><ChevronUp className="h-4 w-4" /> Read Less</>
                    ) : (
                        <><ChevronDown className="h-4 w-4" /> Read More</>
                    )}
                </Button>
            </CardContent>
        </Card>
    )
}

export function EmptySection({ title, message }: { title: string; message: string }) {
    return (
        <Card className="border-subtle shadow-sm rounded-2xl">
            <CardHeader className="pb-2 flex flex-row items-center gap-3 space-y-0">
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-[1rem] font-poppins-600 text-heading">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground font-poppins-400">{message}</p>
            </CardContent>
        </Card>
    )
}
