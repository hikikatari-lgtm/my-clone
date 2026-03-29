import { SongLibrary } from "@/components/song-library";
import { fetchSongs } from "@/lib/notion";

export const dynamic = "force-dynamic";

export default async function Home() {
  const songs = await fetchSongs();

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold mb-6">Song Library</h1>
      <SongLibrary songs={songs} />
    </main>
  );
}
