import { NextRequest, NextResponse } from "next/server";

const API_BASE = "https://www.googleapis.com/youtube/v3";
const CHANNEL_ID = "UCBry-IGC_zBdmNkgMucqC7A";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "YOUTUBE_API_KEY is not configured", results: [] },
      { status: 500 }
    );
  }

  const q = request.nextUrl.searchParams.get("q");
  if (!q) {
    return NextResponse.json({ results: [] });
  }

  try {
    const params = new URLSearchParams({
      part: "snippet",
      type: "video",
      channelId: CHANNEL_ID,
      q,
      maxResults: "50",
      key,
    });

    const res = await fetch(`${API_BASE}/search?${params}`);
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`YouTube search error ${res.status}: ${err}`);
    }

    const data = await res.json();
    const results = (data.items ?? []).map(
      (item: {
        id: { videoId: string };
        snippet: {
          title: string;
          publishedAt: string;
          channelTitle: string;
          thumbnails: {
            high?: { url: string };
            medium?: { url: string };
            default?: { url: string };
          };
        };
      }) => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        thumbnailUrl:
          item.snippet.thumbnails.high?.url ??
          item.snippet.thumbnails.medium?.url ??
          item.snippet.thumbnails.default?.url ??
          "",
        publishedAt: item.snippet.publishedAt,
        channelTitle: item.snippet.channelTitle,
      })
    );

    return NextResponse.json({ results });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message, results: [] }, { status: 500 });
  }
}
