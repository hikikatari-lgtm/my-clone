import { NextResponse } from "next/server";
import { fetchAllVideos } from "@/lib/youtube";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const hasKey = !!process.env.YOUTUBE_API_KEY;
    if (!hasKey) {
      return NextResponse.json(
        { error: "YOUTUBE_API_KEY is not configured", videos: [], playlists: [] },
        { status: 500 }
      );
    }
    const data = await fetchAllVideos();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600" },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message, videos: [], playlists: [] }, { status: 500 });
  }
}
