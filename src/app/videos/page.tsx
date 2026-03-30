import { fetchPlaylistsFromNotion } from "@/lib/notion";
import { fetchPlaylistThumbnails } from "@/lib/youtube";
import { PlaylistCard } from "@/components/playlist-card";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Video Library",
};

export default async function VideosPage() {
  let playlists = await fetchPlaylistsFromNotion();

  // Only fetch YouTube thumbnails for playlists missing them in Notion
  const missingIds = playlists
    .filter((p) => !p.thumbnailUrl)
    .map((p) => p.id);

  if (missingIds.length > 0) {
    const thumbnails = await fetchPlaylistThumbnails(missingIds).catch(
      () => new Map<string, string>()
    );
    playlists = playlists.map((p) =>
      p.thumbnailUrl ? p : { ...p, thumbnailUrl: thumbnails.get(p.id) ?? "" }
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Video Library</h1>
        <p className="text-sm text-muted-foreground mt-1">
          再生リストを選択してください
        </p>
      </div>

      {playlists.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          No playlists found.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {playlists.map((pl) => (
            <PlaylistCard key={pl.id} playlist={pl} />
          ))}
        </div>
      )}
    </main>
  );
}
