import type { Video, Playlist } from "@/types/video";

const API_BASE = "https://www.googleapis.com/youtube/v3";
const CHANNEL_ID = "UCBry3JqHOBOFTmDlByL5Rng";

function getApiKey(): string {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw new Error("YOUTUBE_API_KEY is not set");
  return key;
}

interface PlaylistItemSnippet {
  title: string;
  resourceId: { videoId: string };
  thumbnails: { high?: { url: string }; medium?: { url: string }; default?: { url: string } };
  publishedAt: string;
}

interface PlaylistItemStatus {
  privacyStatus: string;
}

export async function fetchPlaylists(): Promise<Playlist[]> {
  const key = getApiKey();
  const playlists: Playlist[] = [];
  let pageToken = "";

  do {
    const url = `${API_BASE}/playlists?part=snippet&channelId=${CHANNEL_ID}&maxResults=50&key=${key}${pageToken ? `&pageToken=${pageToken}` : ""}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) {
      const errBody = await res.text();
      console.error(`[YouTube] playlists error ${res.status}:`, errBody);
      break;
    }
    const data = await res.json();
    for (const item of data.items ?? []) {
      playlists.push({ id: item.id, title: item.snippet.title });
    }
    pageToken = data.nextPageToken ?? "";
  } while (pageToken);

  return playlists;
}

async function fetchPlaylistVideos(
  playlistId: string,
  playlistName: string
): Promise<Video[]> {
  const key = getApiKey();
  const videos: Video[] = [];
  let pageToken = "";

  do {
    const url = `${API_BASE}/playlistItems?part=snippet,status&playlistId=${playlistId}&maxResults=50&key=${key}${pageToken ? `&pageToken=${pageToken}` : ""}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) {
      const errBody = await res.text();
      console.error(`[YouTube] playlistItems error ${res.status} (${playlistId}):`, errBody);
      break;
    }
    const data = await res.json();
    for (const item of data.items ?? []) {
      const snippet: PlaylistItemSnippet = item.snippet;
      const status: PlaylistItemStatus = item.status;
      const thumb =
        snippet.thumbnails.high?.url ??
        snippet.thumbnails.medium?.url ??
        snippet.thumbnails.default?.url ??
        "";
      videos.push({
        id: snippet.resourceId.videoId,
        title: snippet.title,
        thumbnailUrl: thumb,
        publishedAt: snippet.publishedAt,
        playlistName,
        membersOnly: status.privacyStatus === "unlisted" || status.privacyStatus === "private",
      });
    }
    pageToken = data.nextPageToken ?? "";
  } while (pageToken);

  return videos;
}

export async function fetchAllVideos(): Promise<{
  videos: Video[];
  playlists: Playlist[];
}> {
  const key = getApiKey();

  // Fetch uploads playlist (all channel videos)
  const channelRes = await fetch(
    `${API_BASE}/channels?part=contentDetails&id=${CHANNEL_ID}&key=${key}`,
    { next: { revalidate: 3600 } }
  );

  let allVideos: Video[] = [];
  const playlists = await fetchPlaylists();

  if (!channelRes.ok) {
    const errBody = await channelRes.text();
    throw new Error(`YouTube channels API error ${channelRes.status}: ${errBody}`);
  }

  const channelData = await channelRes.json();
  const uploadsId =
    channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (uploadsId) {
    allVideos = await fetchPlaylistVideos(uploadsId, "All Uploads");
  }

  // Map video IDs to playlist names from actual playlists
  const playlistVideoMap = new Map<string, string>();
  const playlistFetches = playlists.map(async (pl) => {
    const vids = await fetchPlaylistVideos(pl.id, pl.title);
    for (const v of vids) {
      playlistVideoMap.set(v.id, pl.title);
    }
  });
  await Promise.all(playlistFetches);

  // Assign playlist names to videos
  for (const video of allVideos) {
    const plName = playlistVideoMap.get(video.id);
    if (plName) {
      video.playlistName = plName;
    } else {
      video.playlistName = undefined;
    }
  }

  // Sort by publishedAt descending
  allVideos.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return { videos: allVideos, playlists };
}
