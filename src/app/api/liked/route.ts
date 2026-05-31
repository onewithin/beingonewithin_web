import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/server/home";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NEXT_PUBLIC_BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

async function callLikedApi(
  request: NextRequest,
  method: "POST" | "DELETE",
  path: "/api/liked/like" | "/api/liked/dislike",
) {
  const { token, userId } = await getAuthContext();

  if (!token || !userId) {
    return NextResponse.json(
      { success: false, message: "Not authenticated" },
      { status: 401 },
    );
  }

  const body = (await request.json().catch(() => ({}))) as {
    meditationId?: string;
  };

  if (!body?.meditationId) {
    return NextResponse.json(
      { success: false, message: "meditationId is required" },
      { status: 400 },
    );
  }

  const response = await fetch(`${NEXT_PUBLIC_BACKEND_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      userId,
      meditationId: body.meditationId,
    }),
    cache: "no-store",
  });

  const payload = await response.json().catch(() => ({}));

  return NextResponse.json(
    {
      success: response.ok,
      ...payload,
    },
    {
      status: response.status,
      headers: {
        "Cache-Control": "private, no-store",
      },
    },
  );
}

export async function POST(request: NextRequest) {
  return callLikedApi(request, "POST", "/api/liked/like");
}

export async function DELETE(request: NextRequest) {
  return callLikedApi(request, "DELETE", "/api/liked/dislike");
}
