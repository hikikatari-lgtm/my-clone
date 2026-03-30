import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const artist = request.nextUrl.searchParams.get("artist");
  const title = request.nextUrl.searchParams.get("title");

  if (!artist || !title) {
    return NextResponse.json({ url: null }, { status: 400 });
  }

  const query = encodeURIComponent(`${artist} ${title}`);
  const res = await fetch(
    `https://itunes.apple.com/search?term=${query}&media=music&limit=1`
  );

  if (!res.ok) {
    return NextResponse.json({ url: null });
  }

  const data = await res.json();
  const url: string | null =
    data.results?.[0]?.artworkUrl100?.replace("100x100", "300x300") ?? null;

  return NextResponse.json(
    { url },
    {
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    }
  );
}
