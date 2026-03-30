import type { Video, Playlist, VideosPage } from "@/types/video";

const API_BASE = "https://www.googleapis.com/youtube/v3";
const CHANNEL_ID = "UCBry-IGC_zBdmNkgMucqC7A";

function getApiKey(): string {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw new Error("YOUTUBE_API_KEY is not set");
  return key;
}

/** Parse ISO 8601 duration (PT#H#M#S) to seconds */
function parseDuration(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const h = parseInt(match[1] ?? "0", 10);
  const m = parseInt(match[2] ?? "0", 10);
  const s = parseInt(match[3] ?? "0", 10);
  return h * 3600 + m * 60 + s;
}

/** Fetch all playlists for the channel with snippet + contentDetails */
export async function fetchPlaylists(): Promise<Playlist[]> {
  const key = getApiKey();
  const playlists: Playlist[] = [];
  let pageToken = "";

  do {
    const url = `${API_BASE}/playlists?part=snippet,contentDetails&channelId=${CHANNEL_ID}&maxResults=50&key=${key}${pageToken ? `&pageToken=${pageToken}` : ""}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) break;
    const data = await res.json();
    for (const item of data.items ?? []) {
      const thumb =
        item.snippet.thumbnails.high?.url ??
        item.snippet.thumbnails.medium?.url ??
        item.snippet.thumbnails.default?.url ??
        "";
      playlists.push({
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description ?? "",
        thumbnailUrl: thumb,
        videoCount: item.contentDetails?.itemCount ?? 0,
      });
    }
    pageToken = data.nextPageToken ?? "";
  } while (pageToken);

  return playlists;
}

/** Get the uploads playlist ID for the channel */
async function getUploadsPlaylistId(): Promise<string | null> {
  const key = getApiKey();
  const res = await fetch(
    `${API_BASE}/channels?part=contentDetails&id=${CHANNEL_ID}&key=${key}`,
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads ?? null;
}

/** Fetch videos from a playlist with duration info, paginated */
export async function fetchPlaylistVideosPage(
  playlistId: string,
  pageToken?: string,
  maxResults = 20
): Promise<{ videos: Video[]; nextPageToken?: string }> {
  const key = getApiKey();

  let url = `${API_BASE}/playlistItems?part=snippet,status&playlistId=${playlistId}&maxResults=${maxResults}&key=${key}`;
  if (pageToken) url += `&pageToken=${pageToken}`;

  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) {
    throw new Error(`playlistItems error ${res.status}`);
  }
  const data = await res.json();

  const videoIds: string[] = [];
  const rawItems: Array<{
    videoId: string;
    title: string;
    thumbnailUrl: string;
    publishedAt: string;
    privacyStatus: string;
  }> = [];

  for (const item of data.items ?? []) {
    const snippet = item.snippet;
    const videoId = snippet.resourceId.videoId;
    const thumb =
      snippet.thumbnails.high?.url ??
      snippet.thumbnails.medium?.url ??
      snippet.thumbnails.default?.url ??
      "";
    videoIds.push(videoId);
    rawItems.push({
      videoId,
      title: snippet.title,
      thumbnailUrl: thumb,
      publishedAt: snippet.publishedAt,
      privacyStatus: item.status?.privacyStatus ?? "public",
    });
  }

  // Fetch durations via videos.list
  const durationMap = new Map<string, number>();
  if (videoIds.length > 0) {
    const vidsUrl = `${API_BASE}/videos?part=contentDetails&id=${videoIds.join(",")}&key=${key}`;
    const vidsRes = await fetch(vidsUrl, { next: { revalidate: 3600 } });
    if (vidsRes.ok) {
      const vidsData = await vidsRes.json();
      for (const v of vidsData.items ?? []) {
        durationMap.set(v.id, parseDuration(v.contentDetails.duration));
      }
    }
  }

  const videos: Video[] = rawItems.map((raw) => {
    const durationSec = durationMap.get(raw.videoId) ?? 0;
    return {
      id: raw.videoId,
      title: raw.title,
      thumbnailUrl: raw.thumbnailUrl,
      publishedAt: raw.publishedAt,
      membersOnly:
        raw.privacyStatus === "unlisted" || raw.privacyStatus === "private",
      isShort: durationSec > 0 && durationSec <= 60,
    };
  });

  return {
    videos,
    nextPageToken: data.nextPageToken ?? undefined,
  };
}

/** Batch-fetch playlist thumbnails from YouTube API. Returns Map<playlistId, thumbnailUrl> */
export async function fetchPlaylistThumbnails(
  playlistIds: string[]
): Promise<Map<string, string>> {
  const key = getApiKey();
  const map = new Map<string, string>();

  // YouTube API allows up to 50 IDs per request
  for (let i = 0; i < playlistIds.length; i += 50) {
    const batch = playlistIds.slice(i, i + 50);
    const url = `${API_BASE}/playlists?part=snippet&id=${batch.join(",")}&key=${key}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) continue;
    const data = await res.json();
    for (const item of data.items ?? []) {
      const thumb =
        item.snippet.thumbnails.high?.url ??
        item.snippet.thumbnails.medium?.url ??
        item.snippet.thumbnails.default?.url ??
        "";
      if (thumb) map.set(item.id, thumb);
    }
  }

  return map;
}

/** Fetch a page of videos from the uploads playlist (all channel videos) */
export async function fetchVideosPage(
  pageToken?: string,
  maxResults = 20
): Promise<VideosPage> {
  const uploadsId = await getUploadsPlaylistId();
  if (!uploadsId) {
    return { videos: [], playlists: [] };
  }

  const page = await fetchPlaylistVideosPage(uploadsId, pageToken, maxResults);

  return {
    videos: page.videos,
    nextPageToken: page.nextPageToken,
    playlists: [],
  };
}
