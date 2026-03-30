import { NextRequest, NextResponse } from "next/server";
import { fetchPlaylistVideosPage } from "@/lib/youtube";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!process.env.YOUTUBE_API_KEY) {
    return NextResponse.json({ error: "YOUTUBE_API_KEY is not configured", videos: [] }, { status: 500 });
  }

  const playlistId = request.nextUrl.searchParams.get("id");
  const pageToken = request.nextUrl.searchParams.get("pageToken") ?? undefined;

  if (!playlistId) {
    return NextResponse.json({ error: "Missing playlist id", videos: [] }, { status: 400 });
  }

  try {
    const data = await fetchPlaylistVideosPage(playlistId, pageToken, 20);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600" },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message, videos: [] }, { status: 500 });
  }
}
