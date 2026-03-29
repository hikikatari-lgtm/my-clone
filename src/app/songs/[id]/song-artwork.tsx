"use client";

import { useEffect, useState } from "react";
import { Music } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchArtwork } from "@/lib/itunes";
import type { Song } from "@/types/song";

const gradients = [
  "from-purple-500 to-indigo-600",
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

export function SongArtwork({ song }: { song: Song }) {
  const [artworkUrl, setArtworkUrl] = useState<string | null>(
    song.artworkUrl ?? null
  );
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (song.artworkUrl) return;
    let cancelled = false;
    fetchArtwork(song.artist, song.title).then((url) => {
      if (!cancelled) setArtworkUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [song.artist, song.title, song.artworkUrl]);

  return (
    <div className="aspect-square w-full rounded-xl overflow-hidden">
      {artworkUrl ? (
        <>
          {!loaded && (
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-br",
                getGradient(song.id),
                "flex items-center justify-center"
              )}
            >
              <Music className="size-12 text-white/60" />
            </div>
          )}
          <img
            src={artworkUrl}
            alt={`${song.title} by ${song.artist}`}
            className={cn(
              "size-full object-cover transition-opacity duration-300",
              loaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={() => setLoaded(true)}
          />
        </>
      ) : (
        <div
          className={cn(
            "size-full bg-gradient-to-br flex items-center justify-center",
            getGradient(song.id)
          )}
        >
          <Music className="size-12 text-white/60" />
        </div>
      )}
    </div>
  );
}
