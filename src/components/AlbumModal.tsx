"use client";

import { useEffect, useState, useCallback } from "react";
import { X } from "lucide-react";
import type { Album } from "@/lib/notion";

interface AlbumModalProps {
  artistId: string;
  artistName: string;
  onClose: () => void;
}

function AlbumCover({
  album,
  artistName,
}: {
  album: Album;
  artistName: string;
}) {
  const [artworkUrl, setArtworkUrl] = useState<string | null>(
    album.coverImage || null
  );
  const [loaded, setLoaded] = useState(!!album.coverImage);

  useEffect(() => {
    if (album.coverImage) return; // already has Notion cover

    const params = new URLSearchParams({
      artist: artistName,
      album: album.title,
    });

    fetch(`/api/album-artwork?${params}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.artworkUrl) {
          setArtworkUrl(data.artworkUrl);
        }
        setLoaded(true);
      })
      .catch(() => {
        setLoaded(true);
      });
  }, [album.coverImage, album.title, artistName]);

  if (!loaded) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#333]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-[#E8621A]" />
      </div>
    );
  }

  if (artworkUrl) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={artworkUrl}
        alt={album.title}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-[#333] text-4xl text-[#555]">
      💿
    </div>
  );
}

function AlbumCard({
  album,
  artistName,
}: {
  album: Album;
  artistName: string;
}) {
  return (
    <a
      href={album.notionUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group overflow-hidden rounded-lg bg-[#2a2a2a] transition-shadow hover:shadow-lg"
    >
      {/* Cover */}
      <div className="aspect-square w-full overflow-hidden">
        <AlbumCover album={album} artistName={artistName} />
      </div>

      {/* Info */}
      <div className="p-3">
        <h4 className="truncate text-sm font-bold text-white group-hover:text-[#E8621A]">
          {album.title}
        </h4>
        <div className="mt-1 flex items-center justify-between text-xs text-white/50">
          {album.year && <span>{album.year}</span>}
          <span>{album.songCount} 曲</span>
        </div>
      </div>
    </a>
  );
}

export function AlbumModal({ artistId, artistName, onClose }: AlbumModalProps) {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/artists/${artistId}/albums`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      })
      .then((data) => {
        setAlbums(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [artistId]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4 animate-in fade-in duration-200"
      style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-[800px] max-h-[80vh] overflow-y-auto rounded-2xl bg-[#1A1A1A] p-6 shadow-2xl animate-in slide-in-from-bottom-5 duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="閉じる"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <h3 className="mb-6 text-2xl font-bold text-white">
          {artistName}
          <span className="ml-2 text-lg font-normal text-white/50">
            のアルバム
          </span>
        </h3>

        {/* Content */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-[#E8621A]" />
          </div>
        )}

        {error && (
          <p className="py-12 text-center text-white/50">
            アルバムの取得に失敗しました
          </p>
        )}

        {!loading && !error && albums.length === 0 && (
          <p className="py-12 text-center text-white/50">
            アルバムが登録されていません
          </p>
        )}

        {!loading && !error && albums.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {albums.map((album, index) => (
              <div key={album.id} style={{ animationDelay: `${index * 100}ms` }}>
                <AlbumCard album={album} artistName={artistName} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
