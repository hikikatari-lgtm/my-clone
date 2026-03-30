import { NextResponse } from "next/server";
import { fetchAllVideos } from "@/lib/youtube";

export async function GET() {
  try {
    const data = await fetchAllVideos();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600" },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
