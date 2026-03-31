import { NextRequest, NextResponse } from "next/server";
import { fetchSongsByAlbumId } from "@/lib/notion";

export async function GET(request: NextRequest) {
  const albumId = request.nextUrl.searchParams.get("albumId");

  if (!albumId) {
    return NextResponse.json({ songs: [] }, { status: 400 });
  }

  const songs = await fetchSongsByAlbumId(albumId);

  return NextResponse.json(
    { songs },
    {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=60",
      },
    }
  );
}
