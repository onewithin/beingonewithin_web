import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const NEXT_PUBLIC_BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ color: null }, { status: 200 });
    }

    const response = await fetch(
      `${NEXT_PUBLIC_BACKEND_URL}/api/meditation/${id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return NextResponse.json({ color: null }, { status: 200 });
    }

    const data = await response.json();
    const meditation = data?.meditation ?? data;
    const color = meditation?.category?.color ?? null;

    return NextResponse.json({ color }, { status: 200 });
  } catch {
    return NextResponse.json({ color: null }, { status: 200 });
  }
}
