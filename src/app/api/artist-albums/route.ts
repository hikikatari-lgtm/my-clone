import { NextRequest, NextResponse } from "next/server";
import { fetchAlbumsByArtistId } from "@/lib/notion";

export async function GET(request: NextRequest) {
  const artistId = request.nextUrl.searchParams.get("artistId");
  if (!artistId) {
    return NextResponse.json({ error: "artistId is required" }, { status: 400 });
  }

  try {
    const albums = await fetchAlbumsByArtistId(artistId);
    return NextResponse.json(
      { albums },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" } }
    );
  } catch {
    return NextResponse.json({ error: "Failed to fetch albums" }, { status: 500 });
  }
}
