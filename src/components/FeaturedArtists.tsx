"use client";

import { useState } from "react";
import type { Artist } from "@/lib/notion";
import { AlbumModal } from "@/components/AlbumModal";

interface FeaturedArtistsProps {
  artists: Artist[];
}

const countryFlag: Record<string, string> = {
  US: "🇺🇸",
  UK: "🇬🇧",
  Japan: "🇯🇵",
  Other: "🌍",
};

export function FeaturedArtists({ artists }: FeaturedArtistsProps) {
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);

  if (artists.length === 0) return null;

  return (
    <>
      <section className="bg-white py-20">
        <div className="mx-auto max-w-[1200px] px-4">
          <h2 className="mb-12 text-center text-4xl font-bold text-[#1A1A1A]">
            Featured Artists
          </h2>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {artists.map((artist) => (
              <button
                key={artist.id}
                type="button"
                onClick={() => setSelectedArtist(artist)}
                className="group flex cursor-pointer flex-col overflow-hidden rounded-xl bg-white text-left shadow-sm transition-shadow hover:shadow-md"
              >
                {/* Cover image */}
                <div className="aspect-square w-full overflow-hidden bg-[#f5f5f5]">
                  {artist.coverImage ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={artist.coverImage}
                      alt={artist.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-5xl text-[#ccc]">
                      🎵
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="truncate text-[15px] font-bold text-[#1A1A1A] group-hover:text-[#E8621A]">
                    {artist.name}
                  </h3>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-xs text-[#999]">
                      {artist.country && countryFlag[artist.country]}{" "}
                      {artist.country}
                    </span>
                    <span className="rounded-full bg-[#fef3ec] px-2 py-0.5 text-xs font-medium text-[#E8621A]">
                      {artist.songCount} 曲
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Album Modal */}
      {selectedArtist && (
        <AlbumModal
          artistId={selectedArtist.id}
          artistName={selectedArtist.name}
          onClose={() => setSelectedArtist(null)}
        />
      )}
    </>
  );
}
