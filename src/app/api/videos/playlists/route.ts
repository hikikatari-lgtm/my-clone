import { NextResponse } from "next/server";
import { fetchPlaylists } from "@/lib/youtube";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!process.env.YOUTUBE_API_KEY) {
    return NextResponse.json({ error: "YOUTUBE_API_KEY is not configured", playlists: [] }, { status: 500 });
  }

  try {
    const playlists = await fetchPlaylists();
    return NextResponse.json(
      { playlists },
      { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600" } }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message, playlists: [] }, { status: 500 });
  }
}
