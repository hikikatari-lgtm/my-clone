"use client";

import { useEffect, useState, useCallback } from "react";
import { X, Music, Loader2, Disc3 } from "lucide-react";
import type { Artist, Album } from "@/lib/notion";

interface ArtistAlbumModalProps {
  artist: Artist;
  onClose: () => void;
}

export function ArtistAlbumModal({ artist, onClose }: ArtistAlbumModalProps) {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const res = await fetch(
          `/api/artist-albums?artistId=${encodeURIComponent(artist.id)}`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setAlbums(data.albums);
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
  }, [artist.id]);

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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-2xl max-h-[80vh] rounded-2xl bg-zinc-900 border border-zinc-700/50 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-4 p-5 border-b border-zinc-700/50 shrink-0">
          <div className="size-14 rounded-xl overflow-hidden bg-zinc-800 shrink-0">
            {artist.imageUrl ? (
              <img
                src={artist.imageUrl}
                alt={artist.name}
                className="size-full object-cover"
              />
            ) : (
              <div className="size-full bg-gradient-to-br from-zinc-600 to-zinc-800 flex items-center justify-center">
                <Music className="size-6 text-white/40" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-white truncate">
              {artist.name}
            </h2>
            <p className="text-sm text-zinc-400">
              {albums.length > 0
                ? `${albums.length} albums`
                : loading
                  ? "Loading..."
                  : `${artist.songCount} songs`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-zinc-400" />
            </div>
          )}

          {error && (
            <p className="text-center text-zinc-400 py-12">
              Failed to load albums.
            </p>
          )}

          {!loading && !error && albums.length === 0 && (
            <p className="text-center text-zinc-400 py-12">
              No albums found.
            </p>
          )}

          {!loading && !error && albums.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              {albums.map((album) => (
                <div
                  key={album.id}
                  className="group flex flex-col gap-2"
                >
                  <div className="aspect-square rounded-lg overflow-hidden bg-zinc-800">
                    {album.coverUrl ? (
                      <img
                        src={album.coverUrl}
                        alt={album.name}
                        className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="size-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center">
                        <Disc3 className="size-10 text-zinc-600" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {album.name}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {[
                        album.year,
                        album.songCount > 0 ? `${album.songCount} songs` : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
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
