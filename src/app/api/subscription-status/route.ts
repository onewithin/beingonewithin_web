import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const NEXT_PUBLIC_BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value

  if (!token) {
    return NextResponse.json({ hasPremiumAccess: false }, { status: 200 })
  }

  try {
    const response = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/api/subscriptions/status`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      return NextResponse.json({ hasPremiumAccess: false }, { status: 200 })
    }

    const payload = (await response.json().catch(() => null)) as {
      data?: { status?: string }
      status?: string
    } | null

    const status = payload?.data?.status || payload?.status
    const hasPremiumAccess = status === 'ACTIVE' || status === 'TRIALING'

    return NextResponse.json({ hasPremiumAccess }, { status: 200 })
  } catch {
    return NextResponse.json({ hasPremiumAccess: false }, { status: 200 })
  }
}
