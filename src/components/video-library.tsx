"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { VideoCard } from "@/components/video-card";
import type { Video, Playlist } from "@/types/video";

export function VideoLibrary() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/videos")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        if (data.videos) setVideos(data.videos);
        if (data.playlists) setPlaylists(data.playlists);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = selectedPlaylist
    ? videos.filter((v) => v.playlistName === selectedPlaylist)
    : videos;

  // Only show playlists that have videos
  const playlistNames = [
    ...new Set(videos.map((v) => v.playlistName).filter(Boolean)),
  ] as string[];

  return (
    <div className="space-y-6">
      {/* Playlist Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedPlaylist(null)}
          className={cn(
            "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
            selectedPlaylist === null
              ? "bg-foreground text-background"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          All
        </button>
        {playlistNames.map((name) => (
          <button
            key={name}
            onClick={() =>
              setSelectedPlaylist(name === selectedPlaylist ? null : name)
            }
            className={cn(
              "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              name === selectedPlaylist
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-600">
          API Error: {error}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-muted animate-pulse">
              <div className="aspect-video" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-muted-foreground/10 rounded w-3/4" />
                <div className="h-3 bg-muted-foreground/10 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          No videos found.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}
