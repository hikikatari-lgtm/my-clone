import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const artist = searchParams.get("artist");
  const album = searchParams.get("album");

  if (!artist || !album) {
    return NextResponse.json({ artworkUrl: null });
  }

  try {
    const term = encodeURIComponent(`${artist} ${album}`);
    const res = await fetch(
      `https://itunes.apple.com/search?term=${term}&entity=album&limit=1&country=US`,
      { next: { revalidate: 86400 } } // cache for 24h
    );

    if (!res.ok) {
      return NextResponse.json({ artworkUrl: null });
    }

    const data = await res.json();
    const result = data.results?.[0];

    if (!result?.artworkUrl100) {
      return NextResponse.json({ artworkUrl: null });
    }

    const artworkUrl = result.artworkUrl100.replace("100x100", "600x600");
    return NextResponse.json({ artworkUrl });
  } catch {
    return NextResponse.json({ artworkUrl: null });
  }
}
