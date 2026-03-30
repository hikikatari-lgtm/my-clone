"use client";

import Link from "next/link";
import { PlayCircle } from "lucide-react";
import type { Playlist } from "@/types/video";

export function PlaylistCard({ playlist }: { playlist: Playlist }) {
  return (
    <Link
      href={`/videos/${playlist.id}`}
      className="group block rounded-xl overflow-hidden bg-card border border-border transition-all duration-200 ease-out hover:shadow-lg hover:-translate-y-1"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-muted">
        <img
          src={playlist.thumbnailUrl}
          alt={playlist.title}
          className="size-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <PlayCircle className="size-12 text-white" />
        </div>
        <span className="absolute bottom-2 right-2 rounded bg-black/75 px-2 py-0.5 text-xs font-medium text-white">
          {playlist.videoCount} videos
        </span>
      </div>

      {/* Info */}
      <div className="p-3 space-y-1">
        <h3 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-blue-500 transition-colors">
          {playlist.title}
        </h3>
        {playlist.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {playlist.description}
          </p>
        )}
      </div>
    </Link>
  );
}
