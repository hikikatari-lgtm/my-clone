"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { NotionRenderer } from "@/components/notion-renderer";
import type { SongDetail, NotionBlock } from "@/types/song";

const tabs = [
  { key: "overview", label: "概要" },
  { key: "chords", label: "コード分析" },
  { key: "sheets", label: "楽譜" },
  { key: "videos", label: "動画" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

interface SongTabsProps {
  song: SongDetail;
  blocks: NotionBlock[];
}

export function SongTabs({ song, blocks }: SongTabsProps) {
  const [active, setActive] = useState<TabKey>("overview");

  const searchQuery = encodeURIComponent(`${song.artist} ${song.title}`);
  const youtubeUrl = `https://www.youtube.com/results?search_query=${searchQuery}`;
  const spotifyUrl = `https://open.spotify.com/search/${searchQuery}`;

  const hasImages = blocks.some((b) => b.type === "image");
  const hasVideos = blocks.some((b) => b.type === "video");

  return (
    <div>
      {/* Tab bar */}
      <div className="flex border-b border-border mb-6 overflow-x-auto scrollbar-none">
        {tabs.map(({ key, label }) => {
          if (key === "sheets" && !hasImages) return null;
          if (key === "videos" && !hasVideos) return null;
          return (
            <button
              key={key}
              onClick={() => setActive(key)}
              className={cn(
                "shrink-0 px-4 py-2.5 text-sm transition-colors border-b-2 -mb-px",
                active === key
                  ? "border-foreground text-foreground font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {active === "overview" && (
        <div className="space-y-4">
          {/* AI Summary */}
          {song.aiSummary && (
            <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
              <p className="text-xs text-amber-700 font-medium mb-1">Point</p>
              <p className="text-sm text-foreground leading-relaxed">
                {song.aiSummary}
              </p>
            </div>
          )}

          {/* Key / BPM / Era / Genre */}
          <div className="grid grid-cols-2 gap-3">
            {song.key && (
              <div className="rounded-lg bg-blue-500/10 p-3">
                <p className="text-xs text-muted-foreground mb-0.5">Key</p>
                <p className="text-lg font-semibold text-blue-600">
                  {song.key}
                </p>
              </div>
            )}
            {song.bpm != null && (
              <div className="rounded-lg bg-purple-500/10 p-3">
                <p className="text-xs text-muted-foreground mb-0.5">BPM</p>
                <p className="text-lg font-semibold text-purple-600">
                  {song.bpm}
                </p>
              </div>
            )}
            {song.era && (
              <div className="rounded-lg bg-cyan-500/10 p-3">
                <p className="text-xs text-muted-foreground mb-0.5">Era</p>
                <p className="text-lg font-semibold text-cyan-600">
                  {song.era}
                </p>
              </div>
            )}
            <div className="rounded-lg bg-orange-500/10 p-3">
              <p className="text-xs text-muted-foreground mb-0.5">Genre</p>
              <p className="text-lg font-semibold text-orange-600">
                {song.genre}
              </p>
            </div>
          </div>

          {/* Difficulty & Tags */}
          {(song.difficulty || song.tags.length > 0) && (
            <div className="flex flex-wrap items-center gap-1.5">
              {song.difficulty && (
                <span className="inline-block rounded-full bg-rose-500/15 text-rose-600 px-2.5 py-1 text-xs font-medium">
                  {song.difficulty}
                </span>
              )}
              {song.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block rounded-full bg-slate-500/15 text-slate-600 px-2.5 py-1 text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* External Links */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition-colors"
            >
              <ExternalLink className="size-4" />
              YouTube
            </a>
            <a
              href={spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 transition-colors"
            >
              <ExternalLink className="size-4" />
              Spotify
            </a>
          </div>
        </div>
      )}

      {active === "chords" && (
        <div className="space-y-4">
          {/* Chord Progression */}
          {song.confirmed && song.chordProgression.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">Chord Progression</p>
              <div className="flex flex-wrap gap-1.5">
                {song.chordProgression.map((chord) => (
                  <span
                    key={chord}
                    className="inline-block rounded-full bg-emerald-500/15 text-emerald-600 px-2.5 py-1 text-xs font-medium"
                  >
                    {chord}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Roman Numeral */}
          {song.confirmed && song.romanNumeral && (
            <div className="rounded-lg bg-muted/50 border border-border p-3">
              <p className="text-xs text-muted-foreground mb-1">
                Roman Numeral
              </p>
              <p className="text-sm font-mono font-medium text-foreground">
                {song.romanNumeral}
              </p>
            </div>
          )}

          {/* Notion content (excluding images, videos, audio) */}
          {blocks.length > 0 && (
            <NotionRenderer
              blocks={blocks}
              excludeTypes={["image", "video", "audio"]}
            />
          )}
        </div>
      )}

      {active === "sheets" && (
        <NotionRenderer blocks={blocks} onlyTypes={["image"]} />
      )}

      {active === "videos" && (
        <NotionRenderer blocks={blocks} onlyTypes={["video"]} />
      )}
    </div>
  );
}
