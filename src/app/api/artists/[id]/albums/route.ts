import { NextResponse } from "next/server";
import { fetchAlbumsByArtistId } from "@/lib/notion";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const albums = await fetchAlbumsByArtistId(id);
    return NextResponse.json(albums);
  } catch (e) {
    console.error("Failed to fetch albums:", e);
    return NextResponse.json(
      { error: "Failed to fetch albums" },
      { status: 500 }
    );
  }
}
