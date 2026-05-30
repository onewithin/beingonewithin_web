'use client'

import { useMemo } from 'react'

type LocalGreetingProps = {
    name?: string | null
}

function getLocalGreeting(): string {
    const hour = new Date().getHours()

    if (hour >= 5 && hour < 12) return 'Good morning'
    if (hour >= 12 && hour < 17) return 'Good afternoon'
    return 'Good evening'
}

export default function LocalGreeting({ name }: LocalGreetingProps) {
    const greeting = useMemo(() => getLocalGreeting(), [])
    const safeName = (name || '').trim() || 'there'

    return <p className="text-[12px]">{`${greeting}, ${safeName}`}</p>
}
