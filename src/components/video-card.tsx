"use client";

import { Lock } from "lucide-react";
import type { Video } from "@/types/video";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function VideoCard({ video }: { video: Video }) {
  return (
    <a
      href={`https://www.youtube.com/watch?v=${video.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-xl overflow-hidden bg-card border border-border transition-all duration-200 ease-out hover:shadow-lg hover:-translate-y-1"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-muted">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="size-full object-cover"
          loading="lazy"
        />
        {video.membersOnly && (
          <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded bg-yellow-500/90 px-1.5 py-0.5 text-[10px] font-bold text-black">
            <Lock className="size-3" />
            Members
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3 space-y-1">
        <h3 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-blue-500 transition-colors">
          {video.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <time dateTime={video.publishedAt}>{formatDate(video.publishedAt)}</time>
          {video.playlistName && (
            <>
              <span className="text-border">|</span>
              <span className="truncate">{video.playlistName}</span>
            </>
          )}
        </div>
      </div>
    </a>
  );
}
