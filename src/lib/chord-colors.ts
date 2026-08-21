import type { ChordFunction } from "@/lib/chord-analysis";

/**
 * 和音の機能ごとの色。コードチャートと Notion 本文の表で同じ配色を使うため、
 * ここに一元化する。
 */
export const FUNCTION_STYLE: Record<ChordFunction, string> = {
  tonic: "bg-sky-500/12 text-sky-700 ring-sky-500/20",
  subdominant: "bg-emerald-500/12 text-emerald-700 ring-emerald-500/20",
  dominant: "bg-rose-500/12 text-rose-700 ring-rose-500/20",
  secondary: "bg-amber-500/15 text-amber-700 ring-amber-500/25",
  "subdominant-minor": "bg-violet-500/12 text-violet-700 ring-violet-500/20",
  diminished: "bg-slate-500/12 text-slate-600 ring-slate-500/20",
  repeat: "bg-transparent text-muted-foreground ring-transparent",
  other: "bg-muted text-foreground ring-border",
};

export const LEGEND_DOT: Record<ChordFunction, string> = {
  tonic: "bg-sky-500",
  subdominant: "bg-emerald-500",
  dominant: "bg-rose-500",
  secondary: "bg-amber-500",
  "subdominant-minor": "bg-violet-500",
  diminished: "bg-slate-500",
  repeat: "bg-muted-foreground",
  other: "bg-muted-foreground",
};
