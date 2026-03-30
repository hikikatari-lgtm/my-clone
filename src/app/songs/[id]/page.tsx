import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, User } from "lucide-react";
import { fetchSongDetailById, fetchSongBlocks } from "@/lib/notion";
import { NotionRenderer } from "@/components/notion-renderer";
import { SongArtwork } from "./song-artwork";

export const dynamic = "force-dynamic";

export default async function SongDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [song, blocks] = await Promise.all([
    fetchSongDetailById(id),
    fetchSongBlocks(id).catch(() => []),
  ]);

  if (!song) notFound();

  const searchQuery = encodeURIComponent(`${song.artist} ${song.title}`);
  const youtubeUrl = `https://www.youtube.com/results?search_query=${searchQuery}`;
  const spotifyUrl = `https://open.spotify.com/search/${searchQuery}`;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <Link
        href="/songs"
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
          {/* Title & Artist */}
          <div>
            <h1 className="text-2xl font-bold text-foreground">{song.title}</h1>
            {song.artistRelation ? (
              <Link
                href={`/artists/${song.artistRelation.id}`}
                className="inline-flex items-center gap-1.5 text-lg text-muted-foreground hover:text-foreground transition-colors"
              >
                <User className="size-4" />
                {song.artistRelation.name}
              </Link>
            ) : (
              <p className="text-lg text-muted-foreground">{song.artist}</p>
            )}
          </div>

          {/* AI Summary */}
          {song.aiSummary && (
            <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
              <p className="text-xs text-amber-700 font-medium mb-1">Point</p>
              <p className="text-sm text-foreground leading-relaxed">
                {song.aiSummary}
              </p>
            </div>
          )}

          {/* Key / BPM / Era / Genre */}
          <div className="grid grid-cols-2 gap-3">
            {song.key && (
              <div className="rounded-lg bg-blue-500/10 p-3">
                <p className="text-xs text-muted-foreground mb-0.5">Key</p>
                <p className="text-lg font-semibold text-blue-600">{song.key}</p>
              </div>
            )}
            {song.bpm != null && (
              <div className="rounded-lg bg-purple-500/10 p-3">
                <p className="text-xs text-muted-foreground mb-0.5">BPM</p>
                <p className="text-lg font-semibold text-purple-600">{song.bpm}</p>
              </div>
            )}
            {song.era && (
              <div className="rounded-lg bg-cyan-500/10 p-3">
                <p className="text-xs text-muted-foreground mb-0.5">Era</p>
                <p className="text-lg font-semibold text-cyan-600">{song.era}</p>
              </div>
            )}
            <div className="rounded-lg bg-orange-500/10 p-3">
              <p className="text-xs text-muted-foreground mb-0.5">Genre</p>
              <p className="text-lg font-semibold text-orange-600">{song.genre}</p>
            </div>
          </div>

          {/* Difficulty & Tags */}
          {(song.difficulty || song.tags.length > 0) && (
            <div className="flex flex-wrap items-center gap-1.5">
              {song.difficulty && (
                <span className="inline-block rounded-full bg-rose-500/15 text-rose-600 px-2.5 py-1 text-xs font-medium">
                  {song.difficulty}
                </span>
              )}
              {song.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block rounded-full bg-slate-500/15 text-slate-600 px-2.5 py-1 text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Chord Progression (confirmed only) */}
          {song.confirmed && song.chordProgression.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">Chord Progression</p>
              <div className="flex flex-wrap gap-1.5">
                {song.chordProgression.map((chord) => (
                  <span
                    key={chord}
                    className="inline-block rounded-full bg-emerald-500/15 text-emerald-600 px-2.5 py-1 text-xs font-medium"
                  >
                    {chord}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Roman Numeral (confirmed only) */}
          {song.confirmed && song.romanNumeral && (
            <div className="rounded-lg bg-muted/50 border border-border p-3">
              <p className="text-xs text-muted-foreground mb-1">Roman Numeral</p>
              <p className="text-sm font-mono font-medium text-foreground">
                {song.romanNumeral}
              </p>
            </div>
          )}

          {/* External Links */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition-colors"
            >
              <ExternalLink className="size-4" />
              YouTube
            </a>
            <a
              href={spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 transition-colors"
            >
              <ExternalLink className="size-4" />
              Spotify
            </a>
          </div>
        </div>
      </div>

      {/* Page Content from Notion */}
      {blocks.length > 0 && (
        <section className="mt-10 border-t border-border pt-8">
          <NotionRenderer blocks={blocks} />
        </section>
      )}
    </main>
  );
}
