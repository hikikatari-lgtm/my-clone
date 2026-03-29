import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { fetchSongById } from "@/lib/notion";
import { SongArtwork } from "./song-artwork";

export const dynamic = "force-dynamic";

export default async function SongDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const song = await fetchSongById(id);

  if (!song) notFound();

  const searchQuery = encodeURIComponent(`${song.artist} ${song.title}`);
  const youtubeUrl = `https://www.youtube.com/results?search_query=${searchQuery}`;
  const spotifyUrl = `https://open.spotify.com/search/${searchQuery}`;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="size-4" />
        Back to Library
      </Link>

      <div className="flex flex-col sm:flex-row gap-6">
        <div className="w-full sm:w-64 shrink-0">
          <SongArtwork song={song} />
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{song.title}</h1>
            <p className="text-lg text-muted-foreground">{song.artist}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {song.key && (
              <div className="rounded-lg bg-blue-500/10 p-3">
                <p className="text-xs text-muted-foreground mb-0.5">Key</p>
                <p className="text-lg font-semibold text-blue-600">{song.key}</p>
              </div>
            )}
            {song.bpm && (
              <div className="rounded-lg bg-purple-500/10 p-3">
                <p className="text-xs text-muted-foreground mb-0.5">BPM</p>
                <p className="text-lg font-semibold text-purple-600">{song.bpm}</p>
              </div>
            )}
            <div className="rounded-lg bg-orange-500/10 p-3 col-span-2">
              <p className="text-xs text-muted-foreground mb-0.5">Genre</p>
              <p className="text-lg font-semibold text-orange-600">{song.genre}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition-colors"
            >
              <ExternalLink className="size-4" />
              YouTube で検索
            </a>
            <a
              href={spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 transition-colors"
            >
              <ExternalLink className="size-4" />
              Spotify で検索
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
