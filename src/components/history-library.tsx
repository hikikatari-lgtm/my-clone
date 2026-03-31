"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Episode } from "@/lib/episodes";

const genreColors: Record<string, string> = {
  "ブルース": "bg-blue-100 text-blue-700",
  "ロカビリー": "bg-amber-100 text-amber-700",
  "ポップ": "bg-pink-100 text-pink-700",
  "ソウルR&B": "bg-purple-100 text-purple-700",
  "フォーク": "bg-emerald-100 text-emerald-700",
  "サイケプログレ": "bg-indigo-100 text-indigo-700",
  "メタルハード": "bg-slate-100 text-slate-700",
  "グラムパンク": "bg-fuchsia-100 text-fuchsia-700",
  "AORポップロック": "bg-sky-100 text-sky-700",
  "ニューウェーヴ": "bg-lime-100 text-lime-700",
};

export function HistoryLibrary({ episodes }: { episodes: Episode[] }) {
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  const genres = useMemo(
    () => [...new Set(episodes.map((e) => e.genre))],
    [episodes]
  );

  const filtered = useMemo(
    () =>
      selectedGenre
        ? episodes.filter((e) => e.genre === selectedGenre)
        : episodes,
    [episodes, selectedGenre]
  );

  return (
    <div className="space-y-4">
      {/* Genre filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none flex-wrap">
        <button
          onClick={() => setSelectedGenre(null)}
          className={cn(
            "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
            selectedGenre === null
              ? "bg-foreground text-background"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          すべて
        </button>
        {genres.map((g) => (
          <button
            key={g}
            onClick={() => setSelectedGenre(g === selectedGenre ? null : g)}
            className={cn(
              "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              g === selectedGenre
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="text-sm text-muted-foreground">
        {filtered.length} / {episodes.length} エピソード
      </p>

      {/* List grid - Loom style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map((ep) => {
          const tagColor = genreColors[ep.genre] ?? "bg-gray-100 text-gray-600";
          return (
            <Link
              key={ep.ep}
              href={`/history/${ep.ep}`}
              className="group block rounded-xl border border-border bg-card p-4 transition-all duration-200 ease-out hover:shadow-md hover:border-border/80"
            >
              <div className="flex items-start gap-3">
                <span className="shrink-0 mt-0.5 text-xs font-semibold text-muted-foreground bg-muted rounded-md px-2 py-1">
                  Ep{ep.ep}
                </span>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-blue-500 transition-colors leading-snug">
                    {ep.title}
                  </h3>
                  <span className={cn("inline-block rounded-full px-2.5 py-0.5 text-[10px] font-medium", tagColor)}>
                    {ep.genre}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-12">
          No episodes found.
        </p>
      )}
    </div>
  );
}
