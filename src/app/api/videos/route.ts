import { NextRequest, NextResponse } from "next/server";
import { fetchVideosPage, fetchPlaylists } from "@/lib/youtube";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const hasKey = !!process.env.YOUTUBE_API_KEY;
  if (!hasKey) {
    return NextResponse.json(
      { error: "YOUTUBE_API_KEY is not configured", videos: [], playlists: [] },
      { status: 500 }
    );
  }

  const pageToken = request.nextUrl.searchParams.get("pageToken") ?? undefined;

  try {
    const page = await fetchVideosPage(pageToken, 20);

    // Only fetch playlists on initial load (no pageToken)
    if (!pageToken) {
      page.playlists = await fetchPlaylists();
    }

    return NextResponse.json(page, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600" },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: message, videos: [], playlists: [] },
      { status: 500 }
    );
  }
}
