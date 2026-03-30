import { NextResponse } from "next/server";
import { fetchAllVideos } from "@/lib/youtube";

export const dynamic = "force-dynamic";

export async function GET() {
  const hasKey = !!process.env.YOUTUBE_API_KEY;
  const keyPrefix = process.env.YOUTUBE_API_KEY?.slice(0, 8) ?? "(empty)";

  console.log("[api/videos] === START ===");
  console.log("[api/videos] YOUTUBE_API_KEY present:", hasKey, "prefix:", keyPrefix);

  if (!hasKey) {
    console.error("[api/videos] YOUTUBE_API_KEY is NOT set in env");
    return NextResponse.json(
      { error: "YOUTUBE_API_KEY is not configured", videos: [], playlists: [] },
      { status: 500 }
    );
  }

  try {
    const data = await fetchAllVideos();
    console.log("[api/videos] Success — videos:", data.videos.length, "playlists:", data.playlists.length);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600" },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    const stack = e instanceof Error ? e.stack : "";
    console.error("[api/videos] CAUGHT ERROR:", message);
    console.error("[api/videos] Stack:", stack);
    return NextResponse.json({ error: message, videos: [], playlists: [] }, { status: 500 });
  }
}
