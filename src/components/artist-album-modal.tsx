"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { X, Music, Loader2 } from "lucide-react";
import type { Artist } from "@/lib/notion";
import type { Song } from "@/types/song";

interface ArtistAlbumModalProps {
  artist: Artist;
  onClose: () => void;
}

export function ArtistAlbumModal({ artist, onClose }: ArtistAlbumModalProps) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const res = await fetch(
          `/api/artists/songs?name=${encodeURIComponent(artist.name)}`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setSongs(data.songs);
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          setError(true);
        }
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [artist.name]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  // Group songs by genre as a proxy for "album" grouping
  const grouped = songs.reduce<Record<string, Song[]>>((acc, song) => {
    const key = song.era ?? "Unknown";
    if (!acc[key]) acc[key] = [];
    acc[key].push(song);
    return acc;
  }, {});

  // Sort era groups (newest first)
  const sortedEras = Object.keys(grouped).sort((a, b) => {
    if (a === "Unknown") return 1;
    if (b === "Unknown") return -1;
    return b.localeCompare(a);
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-2xl max-h-[80vh] rounded-2xl bg-card border border-border shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-4 p-5 border-b border-border shrink-0">
          <div className="size-14 rounded-xl overflow-hidden bg-muted shrink-0">
            {artist.imageUrl ? (
              <img
                src={artist.imageUrl}
                alt={artist.name}
                className="size-full object-cover"
              />
            ) : (
              <div className="size-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
                <Music className="size-6 text-white/40" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-foreground truncate">
              {artist.name}
            </h2>
            <p className="text-sm text-muted-foreground">
              {artist.songCount} songs
            </p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {error && (
            <p className="text-center text-muted-foreground py-12">
              Failed to load songs.
            </p>
          )}

          {!loading && !error && songs.length === 0 && (
            <p className="text-center text-muted-foreground py-12">
              No songs found.
            </p>
          )}

          {!loading && !error && songs.length > 0 && (
            <div className="space-y-6">
              {sortedEras.map((era) => (
                <div key={era}>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    {era}
                  </h3>
                  <div className="space-y-1">
                    {grouped[era].map((song) => (
                      <Link
                        key={song.id}
                        href={`/songs/${song.id}`}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-muted transition-colors group"
                      >
                        <div className="size-10 rounded-md overflow-hidden bg-muted shrink-0">
                          {song.artworkUrl ? (
                            <img
                              src={song.artworkUrl}
                              alt={song.title}
                              className="size-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="size-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
                              <Music className="size-4 text-white/40" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate group-hover:text-blue-500 transition-colors">
                            {song.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {song.genre && <span>{song.genre}</span>}
                            {song.key && (
                              <>
                                <span>-</span>
                                <span>Key: {song.key}</span>
                              </>
                            )}
                            {song.bpm && (
                              <>
                                <span>-</span>
                                <span>{song.bpm} BPM</span>
                              </>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
