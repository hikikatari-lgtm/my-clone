"use client";

import { useEffect, useState, useCallback } from "react";
import { X, Music, Loader2, Disc3, ArrowLeft, ExternalLink } from "lucide-react";
import type { Artist, Album } from "@/lib/notion";
import type { Song } from "@/types/song";

function notionPageUrl(pageId: string): string {
  return `https://notion.so/${pageId.replace(/-/g, "")}`;
}

interface ArtistAlbumModalProps {
  artist: Artist;
  onClose: () => void;
}

export function ArtistAlbumModal({ artist, onClose }: ArtistAlbumModalProps) {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [songsLoading, setSongsLoading] = useState(false);
  const [songsError, setSongsError] = useState(false);

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

  const handleAlbumClick = useCallback((album: Album) => {
    setSelectedAlbum(album);
    setSongs([]);
    setSongsLoading(true);
    setSongsError(false);

    fetch(`/api/album-songs?albumId=${encodeURIComponent(album.id)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => setSongs(data.songs))
      .catch(() => setSongsError(true))
      .finally(() => setSongsLoading(false));
  }, []);

  const handleBack = useCallback(() => {
    setSelectedAlbum(null);
    setSongs([]);
    setSongsError(false);
  }, []);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (selectedAlbum) {
          handleBack();
        } else {
          onClose();
        }
      }
    }
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose, selectedAlbum, handleBack]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-2xl max-h-[80vh] rounded-2xl bg-zinc-900 border border-zinc-700/50 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-4 p-5 border-b border-zinc-700/50 shrink-0">
          {selectedAlbum ? (
            <>
              <button
                onClick={handleBack}
                className="shrink-0 rounded-lg p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <ArrowLeft className="size-5" />
              </button>
              <div className="size-14 rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                {selectedAlbum.coverUrl ? (
                  <img
                    src={selectedAlbum.coverUrl}
                    alt={selectedAlbum.name}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="size-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center">
                    <Disc3 className="size-6 text-zinc-600" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-bold text-white truncate">
                  {selectedAlbum.name}
                </h2>
                <p className="text-sm text-zinc-400">
                  {[
                    artist.name,
                    selectedAlbum.year,
                    songs.length > 0
                      ? `${songs.length} songs`
                      : songsLoading
                        ? "Loading..."
                        : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
            </>
          ) : (
            <>
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
            </>
          )}
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {selectedAlbum ? (
            /* Song list view */
            <>
              {songsLoading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="size-6 animate-spin text-zinc-400" />
                </div>
              )}

              {songsError && (
                <p className="text-center text-zinc-400 py-12">
                  Failed to load songs.
                </p>
              )}

              {!songsLoading && !songsError && songs.length === 0 && (
                <p className="text-center text-zinc-400 py-12">
                  No songs found.
                </p>
              )}

              {!songsLoading && !songsError && songs.length > 0 && (
                <div className="flex flex-col gap-1">
                  {songs.map((song, index) => (
                    <a
                      key={song.id}
                      href={notionPageUrl(song.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-800/60 transition-colors group"
                    >
                      <span className="w-6 text-right text-xs text-zinc-500 tabular-nums shrink-0">
                        {index + 1}
                      </span>
                      <div className="size-9 rounded overflow-hidden bg-zinc-800 shrink-0">
                        {song.artworkUrl ? (
                          <img
                            src={song.artworkUrl}
                            alt={song.title}
                            className="size-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="size-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center">
                            <Music className="size-4 text-zinc-600" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white truncate">
                          {song.title}
                        </p>
                        <p className="text-xs text-zinc-400 truncate">
                          {[song.genre, song.key, song.bpm ? `${song.bpm} BPM` : null]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </div>
                      <ExternalLink className="size-4 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </a>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* Album grid view */
            <>
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
                    <button
                      key={album.id}
                      onClick={() => handleAlbumClick(album)}
                      className="group flex flex-col gap-2 text-left cursor-pointer"
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
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
