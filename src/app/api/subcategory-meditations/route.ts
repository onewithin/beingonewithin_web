import { NextRequest, NextResponse } from "next/server";
import { getSubcategoryMeditationsPaginated } from "@/lib/server/home";

export async function GET(request: NextRequest) {
  const subcategoryId = request.nextUrl.searchParams.get("subcategoryId") || "";
  const page = Math.max(
    1,
    Number.parseInt(request.nextUrl.searchParams.get("page") || "1", 10),
  );
  const limit = Math.min(
    50,
    Math.max(
      1,
      Number.parseInt(request.nextUrl.searchParams.get("limit") || "10", 10),
    ),
  );

  if (!subcategoryId) {
    return NextResponse.json(
      { message: "subcategoryId is required" },
      {
        status: 400,
        headers: {
          "Cache-Control": "private, no-store",
        },
      },
    );
  }

  const result = await getSubcategoryMeditationsPaginated(
    subcategoryId,
    limit,
    page,
  );
  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "private, max-age=1800, stale-while-revalidate=60",
    },
  });
}
