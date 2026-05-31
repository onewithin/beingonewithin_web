import { NextRequest, NextResponse } from "next/server";
import { getLibraryPlaylistMeditationsPaginated } from "@/lib/server/home";

export async function GET(request: NextRequest) {
  const playlistId = request.nextUrl.searchParams.get("playlistId") || "";
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

  if (!playlistId) {
    return NextResponse.json(
      { message: "playlistId is required" },
      {
        status: 400,
        headers: {
          "Cache-Control": "private, no-store",
        },
      },
    );
  }

  const page = Math.floor(skip / limit) + 1;
  const result = await getLibraryPlaylistMeditationsPaginated(
    playlistId,
    limit,
    page,
  );

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "private, no-store",
    },
  });
}
