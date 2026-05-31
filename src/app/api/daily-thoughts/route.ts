import { NextResponse } from "next/server";
import { getDailyThoughtsData } from "@/lib/server/home";

export async function GET(request: Request) {
  const limit = Math.min(
    30,
    Math.max(
      1,
      Number.parseInt(request.nextUrl.searchParams.get("limit") || "10", 10),
    ),
  );
  const skip = Math.max(
    0,
    Number.parseInt(request.nextUrl.searchParams.get("skip") || "0", 10),
  );

  const data = await getDailyThoughtsData(limit, skip);

  return NextResponse.json({
    data,
    hasMore: data.length === limit,
  });
}
