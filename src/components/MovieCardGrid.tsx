"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Clapperboard } from "lucide-react";
import type { Movie } from "@/lib/notion";

interface MovieCardGridProps {
  movies: Movie[];
}

const gradients = [
  "from-red-500 to-orange-600",
  "from-orange-500 to-amber-600",
  "from-rose-500 to-red-600",
  "from-amber-500 to-yellow-600",
  "from-red-600 to-rose-500",
  "from-orange-600 to-red-500",
];

function getGradient(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
}

const genreColors: Record<string, string> = {
  "ヒューマンドラマ": "bg-amber-500/15 text-amber-600",
  "サスペンス": "bg-slate-500/15 text-slate-600",
  "コメディ": "bg-yellow-500/15 text-yellow-600",
  "アクション": "bg-red-500/15 text-red-600",
  SF: "bg-cyan-500/15 text-cyan-600",
  "ロマンス": "bg-pink-500/15 text-pink-600",
  "ミステリー": "bg-indigo-500/15 text-indigo-600",
  "アニメ": "bg-purple-500/15 text-purple-600",
  "ドキュメンタリー": "bg-teal-500/15 text-teal-600",
  "その他": "bg-gray-500/15 text-gray-600",
};

const ratingColors: Record<string, string> = {
  "★": "bg-red-500/15 text-red-600",
  "★★": "bg-orange-500/15 text-orange-600",
  "★★★": "bg-yellow-500/15 text-yellow-600",
  "★★★★": "bg-lime-500/15 text-lime-600",
  "★★★★★": "bg-green-500/15 text-green-600",
};

function DetailModal({
  movie,
  onClose,
}: {
  movie: Movie;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="閉じる"
        >
          <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="pr-8 text-xl font-bold text-foreground">{movie.title}</h2>
        {movie.originalTitle && (
          <p className="mt-0.5 text-sm italic text-muted-foreground">{movie.originalTitle}</p>
        )}
        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          {movie.director && <span>{movie.director}</span>}
          {movie.year && <span>({movie.year})</span>}
          {movie.country && <span>/ {movie.country}</span>}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {movie.rating && (
            <span className={cn("inline-block rounded-full px-2 py-0.5 text-[10px] font-medium", ratingColors[movie.rating] || "bg-muted text-muted-foreground")}>
              {movie.rating}
            </span>
          )}
          {movie.watched && (
            <span className="inline-block rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] font-medium text-green-600">
              ✅ 鑑賞済み
            </span>
          )}
        </div>

        {movie.genres.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {movie.genres.map((g) => (
              <span key={g} className={cn("inline-block rounded-full px-2 py-0.5 text-[10px] font-medium", genreColors[g] || "bg-muted text-muted-foreground")}>
                {g}
              </span>
            ))}
          </div>
        )}

        {movie.cast && (
          <div className="mt-4">
            <h3 className="mb-1 text-sm font-semibold text-foreground">主要キャスト</h3>
            <p className="text-sm text-muted-foreground">{movie.cast}</p>
          </div>
        )}

        {movie.synopsis && (
          <div className="mt-4">
            <h3 className="mb-1 text-sm font-semibold text-foreground">あらすじ</h3>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{movie.synopsis}</p>
          </div>
        )}

        {movie.music && (
          <div className="mt-4">
            <h3 className="mb-1 text-sm font-semibold text-foreground">音楽</h3>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{movie.music}</p>
          </div>
        )}

        {movie.memo && (
          <div className="mt-4">
            <h3 className="mb-1 text-sm font-semibold text-foreground">個人メモ</h3>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{movie.memo}</p>
          </div>
        )}

        {movie.lessonUsage && (
          <div className="mt-4">
            <h3 className="mb-1 text-sm font-semibold text-foreground">レッスン活用</h3>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{movie.lessonUsage}</p>
          </div>
        )}

        <div className="mt-6 flex gap-3 border-t border-border pt-4">
          {movie.wikipediaUrl && (
            <a
              href={movie.wikipediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
            >
              Wikipedia
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
          <a
            href={movie.notionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Notionで開く
            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}

function MovieCard({ movie, onClick }: { movie: Movie; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group w-full rounded-xl overflow-hidden bg-card border border-border text-left",
        "transition-all duration-200 ease-out",
        "hover:shadow-lg hover:-translate-y-1"
      )}
    >
      <div className={cn("relative flex h-24 items-center justify-center bg-gradient-to-br", getGradient(movie.id))}>
        <Clapperboard className="size-10 text-white/60" />
        {movie.watched && (
          <span className="absolute right-2 top-2 text-lg">✅</span>
        )}
      </div>

      <div className="space-y-1.5 p-3">
        <p className="truncate text-sm font-semibold leading-tight text-foreground">
          {movie.title}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {movie.director}{movie.year ? ` (${movie.year})` : ""}
        </p>

        <div className="flex flex-wrap items-center gap-1.5">
          {movie.genres.slice(0, 2).map((g) => (
            <span key={g} className={cn("inline-block rounded-full px-2 py-0.5 text-[10px] font-medium", genreColors[g] || "bg-muted text-muted-foreground")}>
              {g}
            </span>
          ))}
          {movie.genres.length > 2 && (
            <span className="inline-block rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
              +{movie.genres.length - 2}
            </span>
          )}
        </div>

        {movie.rating && (
          <span className={cn("inline-block rounded-full px-2 py-0.5 text-[10px] font-medium", ratingColors[movie.rating] || "bg-muted text-muted-foreground")}>
            {movie.rating}
          </span>
        )}

        {movie.synopsis && (
          <p className="line-clamp-2 text-xs text-muted-foreground">{movie.synopsis}</p>
        )}
      </div>
    </button>
  );
}

export function MovieCardGrid({ movies }: MovieCardGridProps) {
  const [genreFilter, setGenreFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [watchedOnly, setWatchedOnly] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const genres = [...new Set(movies.flatMap((m) => m.genres))].sort();
  const ratings = [...new Set(movies.map((m) => m.rating).filter(Boolean))].sort((a, b) => a.length - b.length);

  const filtered = movies.filter((m) => {
    if (genreFilter && !m.genres.includes(genreFilter)) return false;
    if (ratingFilter && m.rating !== ratingFilter) return false;
    if (watchedOnly && !m.watched) return false;
    return true;
  });

  const resetFilters = useCallback(() => {
    setGenreFilter("");
    setRatingFilter("");
    setWatchedOnly(false);
  }, []);

  const hasActiveFilter = genreFilter || ratingFilter || watchedOnly;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">🎬 Movie Library</h1>
        <span className="text-sm text-muted-foreground">
          {filtered.length} / {movies.length} 本
        </span>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4">
        <select
          value={genreFilter}
          onChange={(e) => setGenreFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
        >
          <option value="">ジャンル</option>
          {genres.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>

        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
        >
          <option value="">評価</option>
          {ratings.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={watchedOnly}
            onChange={(e) => setWatchedOnly(e.target.checked)}
            className="size-4 rounded border-input accent-primary"
          />
          鑑賞済みのみ
        </label>

        {hasActiveFilter && (
          <button
            onClick={resetFilters}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            リセット
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map((movie) => (
          <MovieCard key={movie.id} movie={movie} onClick={() => setSelectedMovie(movie)} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-12 text-center text-muted-foreground">該当する映画がありません</p>
      )}

      {selectedMovie && (
        <DetailModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
      )}
    </div>
  );
}
