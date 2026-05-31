import { NextRequest, NextResponse } from "next/server";
import { getLikedMeditationsData } from "@/lib/server/home";

export async function GET(request: NextRequest) {
  const limit = Math.min(
    50,
    Math.max(
      1,
      Number.parseInt(request.nextUrl.searchParams.get("limit") || "10", 10),
    ),
  );
  const skip = Math.max(
    0,
    Number.parseInt(request.nextUrl.searchParams.get("skip") || "0", 10),
  );

  const data = await getLikedMeditationsData(limit, skip);

  return NextResponse.json(
    {
      data,
      hasMore: data.length === limit,
    },
    {
      headers: {
        "Cache-Control": "private, no-store",
      },
    },
  );
}
