"use client";

import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { VideoCard } from "@/components/video-card";
import type { Video } from "@/types/video";

type VideoType = "regular" | "short" | "all";

export function PlaylistVideos({ playlistId }: { playlistId: string }) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [videoType, setVideoType] = useState<VideoType>("regular");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();

  const fetchPage = useCallback(
    async (pageToken?: string) => {
      let url = `/api/videos/playlist?id=${playlistId}`;
      if (pageToken) url += `&pageToken=${pageToken}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      return data as { videos: Video[]; nextPageToken?: string };
    },
    [playlistId]
  );

  useEffect(() => {
    fetchPage()
      .then((data) => {
        setVideos(data.videos);
        setNextPageToken(data.nextPageToken);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [fetchPage]);

  const loadMore = async () => {
    if (!nextPageToken || loadingMore) return;
    setLoadingMore(true);
    try {
      const data = await fetchPage(nextPageToken);
      setVideos((prev) => [...prev, ...data.videos]);
      setNextPageToken(data.nextPageToken);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load more");
    } finally {
      setLoadingMore(false);
    }
  };

  let filtered = videos;
  if (videoType === "regular") {
    filtered = filtered.filter((v) => !v.isShort);
  } else if (videoType === "short") {
    filtered = filtered.filter((v) => v.isShort);
  }

  const typeButtons: { key: VideoType; label: string }[] = [
    { key: "regular", label: "本編" },
    { key: "short", label: "ショート" },
    { key: "all", label: "すべて" },
  ];

  return (
    <div className="space-y-4">
      {/* Video type toggle */}
      <div className="flex gap-2">
        {typeButtons.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setVideoType(key)}
            className={cn(
              "rounded-lg px-4 py-1.5 text-sm font-medium transition-colors border",
              videoType === key
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/50"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-600">
          API Error: {error}
        </div>
      )}

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
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>

          {nextPageToken && (
            <div className="flex justify-center pt-4">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
              >
                {loadingMore ? "読み込み中..." : "もっと見る"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
