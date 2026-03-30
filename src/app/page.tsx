import { SongLibrary } from "@/components/song-library";
import { fetchSongs } from "@/lib/notion";

export const dynamic = "force-dynamic";

export default async function Home() {
  let songs;
  try {
    songs = await fetchSongs();
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("[Home] Failed to fetch songs:", message);
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-6">Song Library</h1>
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-600">
          Failed to load songs: {message}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold mb-6">Song Library</h1>
      <SongLibrary songs={songs} />
    </main>
  );
}
