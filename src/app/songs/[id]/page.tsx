import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, User } from "lucide-react";
import { fetchSongDetailById, fetchSongBlocks } from "@/lib/notion";
import { SongTabs } from "@/components/song-tabs";
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

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <Link
        href="/songs"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="size-4" />
        Back to Library
      </Link>

      {/* Header: Artwork + Title */}
      <div className="flex flex-col sm:flex-row gap-6 mb-8">
        <div className="w-full sm:w-64 shrink-0">
          <SongArtwork song={song} />
        </div>

        <div className="flex-1">
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
      </div>

      {/* Tabs */}
      <SongTabs song={song} blocks={blocks} />
    </main>
  );
}
