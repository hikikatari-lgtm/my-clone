"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { PlaylistCard } from "@/components/playlist-card";
import type { Playlist } from "@/types/video";

export function PlaylistSearch({ playlists }: { playlists: Playlist[] }) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = useMemo(() => {
    const set = new Set(
      playlists.map((p) => p.category).filter(Boolean) as string[]
    );
    return Array.from(set).sort();
  }, [playlists]);

  const filtered = useMemo(() => {
    let result = playlists;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter((p) => p.title.toLowerCase().includes(q));
    }
    if (selectedCategory) {
      result = result.filter((p) => p.category === selectedCategory);
    }
    return result;
  }, [playlists, query, selectedCategory]);

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="再生リストを検索..."
          className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
        />
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory(null)}
          className={cn(
            "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
            selectedCategory === null
              ? "bg-foreground text-background"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() =>
              setSelectedCategory(cat === selectedCategory ? null : cat)
            }
            className={cn(
              "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              cat === selectedCategory
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          No playlists found.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((pl) => (
            <PlaylistCard key={pl.id} playlist={pl} />
          ))}
        </div>
      )}
    </div>
  );
}
