"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Episode } from "@/lib/episodes";

const genreColors: Record<string, string> = {
  "ブルース": "from-blue-600 to-blue-800",
  "ロカビリー": "from-amber-500 to-orange-700",
  "ポップ": "from-pink-500 to-rose-600",
  "ソウルR&B": "from-purple-600 to-violet-800",
  "フォーク": "from-emerald-600 to-teal-800",
  "サイケプログレ": "from-indigo-500 to-purple-700",
  "メタルハード": "from-slate-700 to-zinc-900",
  "グラムパンク": "from-fuchsia-500 to-pink-700",
  "AORポップロック": "from-sky-500 to-cyan-700",
  "ニューウェーヴ": "from-lime-500 to-green-700",
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
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedGenre(null)}
          className={cn(
            "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
            selectedGenre === null
              ? "bg-foreground text-background"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          All
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

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((ep) => {
          const gradient = genreColors[ep.genre] ?? "from-slate-600 to-slate-800";
          return (
            <Link
              key={ep.ep}
              href={`/history/${ep.ep}`}
              className="group block rounded-xl overflow-hidden bg-card border border-border transition-all duration-200 ease-out hover:shadow-lg hover:-translate-y-1"
            >
              <div
                className={cn(
                  "aspect-video bg-gradient-to-br flex flex-col items-center justify-center p-6 text-white relative",
                  gradient
                )}
              >
                <span className="text-xs font-medium opacity-70 mb-1">
                  Episode
                </span>
                <span className="text-5xl font-black">
                  {String(ep.ep).padStart(2, "0")}
                </span>
              </div>
              <div className="p-3 space-y-1.5">
                <h3 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-blue-500 transition-colors">
                  {ep.title}
                </h3>
                <span
                  className={cn(
                    "inline-block rounded-full px-2 py-0.5 text-[10px] font-medium text-white bg-gradient-to-r",
                    gradient
                  )}
                >
                  {ep.genre}
                </span>
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
