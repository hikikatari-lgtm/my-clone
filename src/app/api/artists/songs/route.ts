import { NextRequest, NextResponse } from "next/server";
import { fetchSongsByArtistName } from "@/lib/notion";

export async function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get("name");

  if (!name) {
    return NextResponse.json({ songs: [] }, { status: 400 });
  }

  const songs = await fetchSongsByArtistName(name);

  return NextResponse.json(
    { songs },
    {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    }
  );
}
