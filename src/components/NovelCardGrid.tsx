"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { BookOpen } from "lucide-react";
import type { Novel } from "@/lib/notion";

interface NovelCardGridProps {
  novels: Novel[];
}

const gradients = [
  "from-indigo-500 to-purple-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
  "from-emerald-500 to-teal-600",
  "from-sky-500 to-blue-600",
  "from-fuchsia-500 to-violet-600",
];

function getGradient(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
}

const difficultyColors: Record<string, string> = {
  "やさしい": "bg-green-500/15 text-green-600",
  "標準": "bg-yellow-500/15 text-yellow-600",
  "難しい": "bg-red-500/15 text-red-600",
};

const genreColors: Record<string, string> = {
  "文学": "bg-indigo-500/15 text-indigo-600",
  "SF": "bg-cyan-500/15 text-cyan-600",
  "ミステリー": "bg-amber-500/15 text-amber-600",
  "ファンタジー": "bg-purple-500/15 text-purple-600",
  "エッセイ": "bg-teal-500/15 text-teal-600",
  "歴史": "bg-orange-500/15 text-orange-600",
  "ホラー": "bg-red-500/15 text-red-600",
  "恋愛": "bg-pink-500/15 text-pink-600",
};

function NovelDetailModal({
  novel,
  onClose,
}: {
  novel: Novel;
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

        <h2 className="pr-8 text-xl font-bold text-foreground">{novel.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{novel.author}</p>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {novel.genre && (
            <span className={cn("inline-block rounded-full px-2 py-0.5 text-[10px] font-medium", genreColors[novel.genre] || "bg-blue-500/15 text-blue-600")}>
              {novel.genre}
            </span>
          )}
          {novel.difficulty && (
            <span className={cn("inline-block rounded-full px-2 py-0.5 text-[10px] font-medium", difficultyColors[novel.difficulty] || "bg-muted text-muted-foreground")}>
              {novel.difficulty}
            </span>
          )}
          {novel.completed && (
            <span className="inline-block rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] font-medium text-green-600">
              ✅ 読了
            </span>
          )}
        </div>

        {novel.themes.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {novel.themes.map((theme) => (
              <span key={theme} className="inline-block rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {theme}
              </span>
            ))}
          </div>
        )}

        {novel.synopsis && (
          <div className="mt-5">
            <h3 className="mb-1 text-sm font-semibold text-foreground">あらすじ</h3>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{novel.synopsis}</p>
          </div>
        )}

        {novel.creativeMemo && (
          <div className="mt-4">
            <h3 className="mb-1 text-sm font-semibold text-foreground">歌詞・創作メモ</h3>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{novel.creativeMemo}</p>
          </div>
        )}

        {novel.lessonUsage && (
          <div className="mt-4">
            <h3 className="mb-1 text-sm font-semibold text-foreground">レッスン活用</h3>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{novel.lessonUsage}</p>
          </div>
        )}

        <div className="mt-6 border-t border-border pt-4">
          <a
            href={novel.notionUrl}
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

function NovelCard({ novel, onClick }: { novel: Novel; onClick: () => void }) {
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
      {/* Gradient header */}
      <div className={cn("relative flex h-24 items-center justify-center bg-gradient-to-br", getGradient(novel.id))}>
        <BookOpen className="size-10 text-white/60" />
        {novel.completed && (
          <span className="absolute right-2 top-2 text-lg">✅</span>
        )}
      </div>

      <div className="space-y-1.5 p-3">
        <p className="truncate text-sm font-semibold leading-tight text-foreground">
          {novel.title}
        </p>
        <p className="truncate text-xs text-muted-foreground">{novel.author}</p>

        <div className="flex flex-wrap items-center gap-1.5">
          {novel.genre && (
            <span className={cn("inline-block rounded-full px-2 py-0.5 text-[10px] font-medium", genreColors[novel.genre] || "bg-blue-500/15 text-blue-600")}>
              {novel.genre}
            </span>
          )}
          {novel.difficulty && (
            <span className={cn("inline-block rounded-full px-2 py-0.5 text-[10px] font-medium", difficultyColors[novel.difficulty] || "bg-muted text-muted-foreground")}>
              {novel.difficulty}
            </span>
          )}
        </div>

        {novel.themes.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {novel.themes.slice(0, 3).map((theme) => (
              <span key={theme} className="inline-block rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                {theme}
              </span>
            ))}
            {novel.themes.length > 3 && (
              <span className="inline-block rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                +{novel.themes.length - 3}
              </span>
            )}
          </div>
        )}

        {novel.synopsis && (
          <p className="line-clamp-2 text-xs text-muted-foreground">{novel.synopsis}</p>
        )}
      </div>
    </button>
  );
}

export function NovelCardGrid({ novels }: NovelCardGridProps) {
  const [authorFilter, setAuthorFilter] = useState("");
  const [genreFilter, setGenreFilter] = useState("");
  const [themeFilter, setThemeFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [completedOnly, setCompletedOnly] = useState(false);
  const [selectedNovel, setSelectedNovel] = useState<Novel | null>(null);

  const authors = [...new Set(novels.map((n) => n.author).filter(Boolean))].sort();
  const genres = [...new Set(novels.map((n) => n.genre).filter(Boolean))].sort();
  const themes = [...new Set(novels.flatMap((n) => n.themes))].sort();
  const difficulties = [...new Set(novels.map((n) => n.difficulty).filter(Boolean))];

  const filtered = novels.filter((novel) => {
    if (authorFilter && novel.author !== authorFilter) return false;
    if (genreFilter && novel.genre !== genreFilter) return false;
    if (themeFilter && !novel.themes.includes(themeFilter)) return false;
    if (difficultyFilter && novel.difficulty !== difficultyFilter) return false;
    if (completedOnly && !novel.completed) return false;
    return true;
  });

  const resetFilters = useCallback(() => {
    setAuthorFilter("");
    setGenreFilter("");
    setThemeFilter("");
    setDifficultyFilter("");
    setCompletedOnly(false);
  }, []);

  const hasActiveFilter = authorFilter || genreFilter || themeFilter || difficultyFilter || completedOnly;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">📖 Novel Library</h1>
        <span className="text-sm text-muted-foreground">
          {filtered.length} / {novels.length} 冊
        </span>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4">
        <select
          value={authorFilter}
          onChange={(e) => setAuthorFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
        >
          <option value="">著者</option>
          {authors.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>

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
          value={themeFilter}
          onChange={(e) => setThemeFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
        >
          <option value="">テーマ</option>
          {themes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
        >
          <option value="">難易度</option>
          {difficulties.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={completedOnly}
            onChange={(e) => setCompletedOnly(e.target.checked)}
            className="size-4 rounded border-input accent-primary"
          />
          読了のみ
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
        {filtered.map((novel) => (
          <NovelCard key={novel.id} novel={novel} onClick={() => setSelectedNovel(novel)} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-12 text-center text-muted-foreground">該当する小説がありません</p>
      )}

      {selectedNovel && (
        <NovelDetailModal novel={selectedNovel} onClose={() => setSelectedNovel(null)} />
      )}
    </div>
  );
}
