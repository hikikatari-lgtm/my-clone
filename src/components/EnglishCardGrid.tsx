"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { GraduationCap } from "lucide-react";
import type { EnglishMaterial } from "@/lib/notion";

interface EnglishCardGridProps {
  materials: EnglishMaterial[];
}

const gradients = [
  "from-emerald-500 to-teal-600",
  "from-teal-500 to-cyan-600",
  "from-cyan-500 to-blue-600",
  "from-blue-500 to-indigo-600",
  "from-sky-500 to-blue-600",
  "from-green-500 to-emerald-600",
];

function getGradient(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
}

const levelColors: Record<string, string> = {
  Elementary: "bg-green-500/15 text-green-600",
  "Pre-Intermediate": "bg-lime-500/15 text-lime-600",
  Intermediate: "bg-yellow-500/15 text-yellow-600",
  "Upper-Intermediate": "bg-orange-500/15 text-orange-600",
  Advanced: "bg-red-500/15 text-red-600",
};

const categoryColors: Record<string, string> = {
  Grammar: "bg-blue-500/15 text-blue-600",
  Vocabulary: "bg-purple-500/15 text-purple-600",
  Listening: "bg-cyan-500/15 text-cyan-600",
  Speaking: "bg-emerald-500/15 text-emerald-600",
  Writing: "bg-amber-500/15 text-amber-600",
  Reading: "bg-indigo-500/15 text-indigo-600",
  Pronunciation: "bg-pink-500/15 text-pink-600",
  Business: "bg-slate-500/15 text-slate-600",
  "ESL Textbook": "bg-teal-500/15 text-teal-600",
  "Song Music": "bg-rose-500/15 text-rose-600",
};

function DetailModal({
  material,
  onClose,
}: {
  material: EnglishMaterial;
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

        <h2 className="pr-8 text-xl font-bold text-foreground">{material.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{material.publisher}</p>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {material.level && (
            <span className={cn("inline-block rounded-full px-2 py-0.5 text-[10px] font-medium", levelColors[material.level] || "bg-muted text-muted-foreground")}>
              {material.level}
            </span>
          )}
          {material.language && (
            <span className="inline-block rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] font-medium text-sky-600">
              {material.language}
            </span>
          )}
          {material.inUse && (
            <span className="inline-block rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] font-medium text-green-600">
              ✅ レッスン使用中
            </span>
          )}
        </div>

        {material.categories.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {material.categories.map((cat) => (
              <span key={cat} className={cn("inline-block rounded-full px-2 py-0.5 text-[10px] font-medium", categoryColors[cat] || "bg-muted text-muted-foreground")}>
                {cat}
              </span>
            ))}
          </div>
        )}

        {material.formats.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {material.formats.map((f) => (
              <span key={f} className="inline-block rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {f}
              </span>
            ))}
          </div>
        )}

        {material.summary && (
          <div className="mt-5">
            <h3 className="mb-1 text-sm font-semibold text-foreground">Gemini要約</h3>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{material.summary}</p>
          </div>
        )}

        {material.memo && (
          <div className="mt-4">
            <h3 className="mb-1 text-sm font-semibold text-foreground">メモ</h3>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{material.memo}</p>
          </div>
        )}

        <div className="mt-6 flex gap-3 border-t border-border pt-4">
          {material.driveUrl && (
            <a
              href={material.driveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
            >
              Google Driveで開く
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
          <a
            href={material.notionUrl}
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

function MaterialCard({ material, onClick }: { material: EnglishMaterial; onClick: () => void }) {
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
      <div className={cn("relative flex h-24 items-center justify-center bg-gradient-to-br", getGradient(material.id))}>
        <GraduationCap className="size-10 text-white/60" />
        {material.inUse && (
          <span className="absolute right-2 top-2 text-lg">✅</span>
        )}
      </div>

      <div className="space-y-1.5 p-3">
        <p className="truncate text-sm font-semibold leading-tight text-foreground">
          {material.title}
        </p>
        <p className="truncate text-xs text-muted-foreground">{material.publisher}</p>

        <div className="flex flex-wrap items-center gap-1.5">
          {material.categories.slice(0, 2).map((cat) => (
            <span key={cat} className={cn("inline-block rounded-full px-2 py-0.5 text-[10px] font-medium", categoryColors[cat] || "bg-muted text-muted-foreground")}>
              {cat}
            </span>
          ))}
          {material.categories.length > 2 && (
            <span className="inline-block rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
              +{material.categories.length - 2}
            </span>
          )}
        </div>

        {material.level && (
          <span className={cn("inline-block rounded-full px-2 py-0.5 text-[10px] font-medium", levelColors[material.level] || "bg-muted text-muted-foreground")}>
            {material.level}
          </span>
        )}

        {material.summary && (
          <p className="line-clamp-2 text-xs text-muted-foreground">{material.summary}</p>
        )}
      </div>
    </button>
  );
}

export function EnglishCardGrid({ materials }: EnglishCardGridProps) {
  const [categoryFilter, setCategoryFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [publisherFilter, setPublisherFilter] = useState("");
  const [inUseOnly, setInUseOnly] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<EnglishMaterial | null>(null);

  const categories = [...new Set(materials.flatMap((m) => m.categories))].sort();
  const levels = [...new Set(materials.map((m) => m.level).filter(Boolean))];
  const publishers = [...new Set(materials.map((m) => m.publisher).filter(Boolean))].sort();

  const filtered = materials.filter((m) => {
    if (categoryFilter && !m.categories.includes(categoryFilter)) return false;
    if (levelFilter && m.level !== levelFilter) return false;
    if (publisherFilter && m.publisher !== publisherFilter) return false;
    if (inUseOnly && !m.inUse) return false;
    return true;
  });

  const resetFilters = useCallback(() => {
    setCategoryFilter("");
    setLevelFilter("");
    setPublisherFilter("");
    setInUseOnly(false);
  }, []);

  const hasActiveFilter = categoryFilter || levelFilter || publisherFilter || inUseOnly;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">📚 English Library</h1>
        <span className="text-sm text-muted-foreground">
          {filtered.length} / {materials.length} 冊
        </span>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
        >
          <option value="">カテゴリ</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
        >
          <option value="">レベル</option>
          {levels.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>

        <select
          value={publisherFilter}
          onChange={(e) => setPublisherFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
        >
          <option value="">出版社</option>
          {publishers.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={inUseOnly}
            onChange={(e) => setInUseOnly(e.target.checked)}
            className="size-4 rounded border-input accent-primary"
          />
          レッスン使用中のみ
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
        {filtered.map((material) => (
          <MaterialCard key={material.id} material={material} onClick={() => setSelectedMaterial(material)} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-12 text-center text-muted-foreground">該当する教材がありません</p>
      )}

      {selectedMaterial && (
        <DetailModal material={selectedMaterial} onClose={() => setSelectedMaterial(null)} />
      )}
    </div>
  );
}
