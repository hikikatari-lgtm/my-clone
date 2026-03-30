"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { SongCard } from "@/components/song-card";
import { GenreFilter } from "@/components/genre-filter";
import type { Song } from "@/types/song";

interface SongLibraryProps {
  songs: Song[];
}

export function SongLibrary({ songs }: SongLibraryProps) {
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const genres = useMemo(() => {
    const set = new Set(songs.map((s) => s.genre));
    return Array.from(set).sort();
  }, [songs]);

  const filtered = useMemo(() => {
    let result = songs;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.artist.toLowerCase().includes(q)
      );
    }
    if (selectedGenre) {
      result = result.filter((s) => s.genre === selectedGenre);
    }
    return result;
  }, [songs, query, selectedGenre]);

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="曲名・アーティスト名で検索..."
          className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
        />
      </div>

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
