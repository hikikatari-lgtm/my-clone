"use client";

import { useMemo, useState } from "react";
import { SongCard } from "@/components/song-card";
import { GenreFilter } from "@/components/genre-filter";
import type { Song } from "@/types/song";

interface SongLibraryProps {
  songs: Song[];
}

export function SongLibrary({ songs }: SongLibraryProps) {
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  const genres = useMemo(() => {
    const set = new Set(songs.map((s) => s.genre));
    return Array.from(set).sort();
  }, [songs]);

  const filtered = useMemo(
    () =>
      selectedGenre
        ? songs.filter((s) => s.genre === selectedGenre)
        : songs,
    [songs, selectedGenre]
  );

  return (
    <div className="space-y-6">
      <GenreFilter
        genres={genres}
        selected={selectedGenre}
        onSelect={setSelectedGenre}
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((song) => (
          <SongCard key={song.id} song={song} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-12">
          No songs found.
        </p>
      )}
    </div>
  );
}
