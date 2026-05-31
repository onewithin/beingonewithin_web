import { NextRequest, NextResponse } from "next/server";
import { getTopicMeditationsPaginated } from "@/lib/server/home";

export async function GET(request: NextRequest) {
  const topicId = request.nextUrl.searchParams.get("topicId") || "";
  const limit = Math.min(
    50,
    Math.max(
      1,
      Number.parseInt(request.nextUrl.searchParams.get("limit") || "12", 10),
    ),
  );
  const skip = Math.max(
    0,
    Number.parseInt(request.nextUrl.searchParams.get("skip") || "0", 10),
  );

  if (!topicId) {
    return NextResponse.json(
      { message: "topicId is required" },
      {
        status: 400,
        headers: {
          "Cache-Control": "private, no-store",
        },
      },
    );
  }

  const page = Math.floor(skip / limit) + 1;
  const result = await getTopicMeditationsPaginated(topicId, limit, page);

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "private, no-store",
    },
  });
}
