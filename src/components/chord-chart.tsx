"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  FUNCTION_LABEL,
  usedFunctions,
  type ChordFunction,
  type ParsedProgression,
} from "@/lib/chord-analysis";

/** 機能ごとの色。数字そのものより「色の並び」で構造が見えることを狙う */
const FUNCTION_STYLE: Record<ChordFunction, string> = {
  tonic: "bg-sky-500/12 text-sky-700 ring-sky-500/20",
  subdominant: "bg-emerald-500/12 text-emerald-700 ring-emerald-500/20",
  dominant: "bg-rose-500/12 text-rose-700 ring-rose-500/20",
  secondary: "bg-amber-500/15 text-amber-700 ring-amber-500/25",
  "subdominant-minor": "bg-violet-500/12 text-violet-700 ring-violet-500/20",
  diminished: "bg-slate-500/12 text-slate-600 ring-slate-500/20",
  repeat: "bg-transparent text-muted-foreground ring-transparent",
  other: "bg-muted text-foreground ring-border",
};

const LEGEND_DOT: Record<ChordFunction, string> = {
  tonic: "bg-sky-500",
  subdominant: "bg-emerald-500",
  dominant: "bg-rose-500",
  secondary: "bg-amber-500",
  "subdominant-minor": "bg-violet-500",
  diminished: "bg-slate-500",
  repeat: "bg-muted-foreground",
  other: "bg-muted-foreground",
};

export function ChordChart({ progression }: { progression: ParsedProgression }) {
  const { sections, fallback } = progression;
  const [active, setActive] = useState(0);

  if (sections.length === 0) {
    return fallback ? <RawProgression text={fallback} /> : null;
  }

  const named = sections.filter((s) => s.name).length;
  const showTabs = sections.length > 1 && named > 0;
  const visible = showTabs ? [sections[active]] : sections;
  const legend = usedFunctions(visible);

  return (
    <div className="space-y-4">
      {showTabs && (
        <div className="flex gap-1.5 flex-wrap">
          {sections.map((s, i) => (
            <button
              key={`${s.name ?? "section"}-${i}`}
              onClick={() => setActive(i)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                i === active
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {s.name ?? `Part ${i + 1}`}
            </button>
          ))}
        </div>
      )}

      {visible.map((section, si) => (
        <div key={`${section.name ?? "s"}-${si}`} className="space-y-2">
          {!showTabs && section.name && (
            <p className="text-xs font-semibold tracking-wide text-muted-foreground">
              {section.name}
            </p>
          )}
          {section.rows.map((row, ri) => (
            <div key={ri} className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              {row.map((bar, bi) => (
                <div
                  key={bi}
                  className="min-h-[3.25rem] rounded-lg border border-border bg-card p-1.5 flex flex-wrap items-center justify-center gap-1"
                >
                  {bar.chords.map((c, ci) => (
                    <span
                      key={ci}
                      title={FUNCTION_LABEL[c.fn]}
                      className={cn(
                        "rounded px-1.5 py-0.5 font-mono text-[13px] font-semibold leading-tight ring-1 ring-inset",
                        FUNCTION_STYLE[c.fn]
                      )}
                    >
                      {c.raw}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}

      {legend.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1">
          {legend.map((fn) => (
            <span
              key={fn}
              className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground"
            >
              <span className={cn("size-2 rounded-full", LEGEND_DOT[fn])} />
              {FUNCTION_LABEL[fn]}
            </span>
          ))}
        </div>
      )}

      {fallback && <RawProgression text={fallback} />}
    </div>
  );
}

/** 図にできなかった部分。改行を保ったまま出す（1行に潰さない） */
function RawProgression({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 p-3">
      <p className="mb-1.5 text-[11px] text-muted-foreground">
        そのままの表記
      </p>
      <pre className="overflow-x-auto font-mono text-[13px] leading-relaxed whitespace-pre-wrap text-foreground">
        {text}
      </pre>
    </div>
  );
}
