import { NextResponse } from "next/server";
import { getAlbumsByArtist } from "@/lib/notion";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const albums = await getAlbumsByArtist(id);
    return NextResponse.json(albums);
  } catch (e) {
    console.error("Failed to fetch albums:", e);
    return NextResponse.json(
      { error: "Failed to fetch albums" },
      { status: 500 }
    );
  }
}
