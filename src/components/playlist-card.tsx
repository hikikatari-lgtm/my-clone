"use client";

import Link from "next/link";
import { PlayCircle, Star } from "lucide-react";
import type { Playlist } from "@/types/video";

const categoryColors: Record<string, string> = {
  "ピアノ弾き語り": "bg-blue-500/80",
  "作曲理論": "bg-purple-500/80",
  "ギター": "bg-amber-500/80",
  "English": "bg-emerald-500/80",
  "ブルース": "bg-indigo-500/80",
  "その他": "bg-slate-500/80",
};

export function PlaylistCard({ playlist }: { playlist: Playlist }) {
  const catColor = playlist.category
    ? categoryColors[playlist.category] ?? "bg-slate-500/80"
    : null;

  return (
    <Link
      href={`/videos/${playlist.id}`}
      className="group block rounded-xl overflow-hidden bg-card border border-border transition-all duration-200 ease-out hover:shadow-lg hover:-translate-y-1"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-muted">
        {playlist.thumbnailUrl ? (
          <img
            src={playlist.thumbnailUrl}
            alt={playlist.title}
            className="size-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="size-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
            <PlayCircle className="size-12 text-white/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <PlayCircle className="size-12 text-white" />
        </div>
        <span className="absolute bottom-2 right-2 rounded bg-black/75 px-2 py-0.5 text-xs font-medium text-white">
          {playlist.videoCount} videos
        </span>
        {playlist.isRecommended && (
          <span className="absolute top-2 left-2 inline-flex items-center gap-0.5 rounded bg-yellow-400/90 px-1.5 py-0.5 text-[10px] font-bold text-black">
            <Star className="size-3 fill-current" />
            おすすめ
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3 space-y-1.5">
        <h3 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-blue-500 transition-colors">
          {playlist.title}
        </h3>
        {playlist.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {playlist.description}
          </p>
        )}
        {catColor && playlist.category && (
          <span className={`inline-block rounded-full ${catColor} text-white px-2 py-0.5 text-[10px] font-medium`}>
            {playlist.category}
          </span>
        )}
      </div>
    </Link>
  );
}
