"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SongCard } from "@/components/song-card";
import type { Song } from "@/types/song";

function FilterPills({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: string[];
  selected: string | null;
  onSelect: (v: string | null) => void;
}) {
  if (options.length === 0) return null;
  return (
    <div className="space-y-1.5">
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      <div className="flex gap-1.5 flex-wrap">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onSelect(opt === selected ? null : opt)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              opt === selected
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export function SongLibrary({ songs }: { songs: Song[] }) {
  const [query, setQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedEra, setSelectedEra] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [selectedChord, setSelectedChord] = useState<string | null>(null);

  const genres = useMemo(
    () => [...new Set(songs.map((s) => s.genre))].sort(),
    [songs]
  );
  const eras = useMemo(
    () => [...new Set(songs.map((s) => s.era).filter(Boolean) as string[])].sort(),
    [songs]
  );
  const difficulties = useMemo(
    () => [...new Set(songs.map((s) => s.difficulty).filter(Boolean) as string[])].sort(),
    [songs]
  );
  const chords = useMemo(
    () => [...new Set(songs.flatMap((s) => s.chordProgression))].sort(),
    [songs]
  );

  const hasActiveFilter =
    !!query || !!selectedGenre || !!selectedEra || !!selectedDifficulty || !!selectedChord;

  const resetAll = () => {
    setQuery("");
    setSelectedGenre(null);
    setSelectedEra(null);
    setSelectedDifficulty(null);
    setSelectedChord(null);
  };

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
    if (selectedGenre) result = result.filter((s) => s.genre === selectedGenre);
    if (selectedEra) result = result.filter((s) => s.era === selectedEra);
    if (selectedDifficulty) result = result.filter((s) => s.difficulty === selectedDifficulty);
    if (selectedChord) result = result.filter((s) => s.chordProgression.includes(selectedChord));
    return result;
  }, [songs, query, selectedGenre, selectedEra, selectedDifficulty, selectedChord]);

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="曲名・アーティスト名で検索..."
          className="w-full rounded-lg border border-border bg-background pl-10 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <FilterPills label="Genre" options={genres} selected={selectedGenre} onSelect={setSelectedGenre} />
        <FilterPills label="Era" options={eras} selected={selectedEra} onSelect={setSelectedEra} />
        <FilterPills label="Difficulty" options={difficulties} selected={selectedDifficulty} onSelect={setSelectedDifficulty} />
        <FilterPills label="Chord" options={chords} selected={selectedChord} onSelect={setSelectedChord} />
      </div>

      {/* Reset */}
      {hasActiveFilter && (
        <button
          onClick={resetAll}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          フィルターをリセット
        </button>
      )}

      {/* Results count */}
      <p className="text-xs text-muted-foreground">
        {filtered.length} / {songs.length} 曲
      </p>

      {/* Grid */}
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
