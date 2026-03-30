"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PlaylistCard } from "@/components/playlist-card";
import type { Playlist } from "@/types/video";

interface SearchResult {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  publishedAt: string;
  channelTitle: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function PlaylistSearch({ playlists }: { playlists: Playlist[] }) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(
    null
  );
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const categories = useMemo(() => {
    const set = new Set(
      playlists.map((p) => p.category).filter(Boolean) as string[]
    );
    return Array.from(set).sort();
  }, [playlists]);

  const filtered = useMemo(() => {
    let result = playlists;
    if (query.trim() && !searchResults) {
      const q = query.trim().toLowerCase();
      result = result.filter((p) => p.title.toLowerCase().includes(q));
    }
    if (selectedCategory) {
      result = result.filter((p) => p.category === selectedCategory);
    }
    return result;
  }, [playlists, query, selectedCategory, searchResults]);

  const abortRef = useRef<AbortController | null>(null);

  const doSearch = useCallback(async (q: string) => {
    abortRef.current?.abort();
    if (!q.trim()) {
      setSearchResults(null);
      setSearching(false);
      return;
    }
    const controller = new AbortController();
    abortRef.current = controller;
    setSearching(true);
    setSearchError(null);
    try {
      const res = await fetch(
        `/api/videos/search?q=${encodeURIComponent(q.trim())}`,
        { signal: controller.signal }
      );
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSearchResults(data.results);
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setSearchError(e instanceof Error ? e.message : "Search failed");
      setSearchResults(null);
    } finally {
      setSearching(false);
    }
  }, []);

  // Debounced auto-search
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }
    const timer = setTimeout(() => doSearch(query), 300);
    return () => clearTimeout(timer);
  }, [query, doSearch]);

  const clearSearch = () => {
    setQuery("");
    setSearchResults(null);
    setSearchError(null);
    abortRef.current?.abort();
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="動画・再生リストを検索..."
          className="w-full rounded-lg border border-border bg-background pl-10 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Error */}
      {searchError && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-600">
          {searchError}
        </div>
      )}

      {/* Search results */}
      {searching && (
        <p className="text-center text-muted-foreground py-8">検索中...</p>
      )}
      {!searching && searchResults ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            「{query}」の検索結果: {searchResults.length}件
          </p>
          {searchResults.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              動画が見つかりませんでした
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((r) => (
                <a
                  key={r.videoId}
                  href={`https://www.youtube.com/watch?v=${r.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block rounded-xl overflow-hidden bg-card border border-border transition-all duration-200 ease-out hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="aspect-video bg-muted">
                    <img
                      src={r.thumbnailUrl}
                      alt={r.title}
                      className="size-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-3 space-y-1">
                    <h3 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-blue-500 transition-colors">
                      {r.title}
                    </h3>
                    <time className="text-xs text-muted-foreground">
                      {formatDate(r.publishedAt)}
                    </time>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
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

          {/* Playlist grid */}
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
        </>
      )}
    </div>
  );
}
