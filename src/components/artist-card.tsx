"use client";

import { useState } from "react";
import { User } from "lucide-react";
import type { Artist } from "@/lib/notion";

const countryFlags: Record<string, string> = {
  "USA": "🇺🇸",
  "UK": "🇬🇧",
  "Japan": "🇯🇵",
  "Canada": "🇨🇦",
  "Australia": "🇦🇺",
  "France": "🇫🇷",
  "Germany": "🇩🇪",
  "Italy": "🇮🇹",
  "Brazil": "🇧🇷",
  "Jamaica": "🇯🇲",
  "Ireland": "🇮🇪",
  "Sweden": "🇸🇪",
  "Norway": "🇳🇴",
  "New Zealand": "🇳🇿",
};

export function ArtistCard({
  artist,
  onClick,
}: {
  artist: Artist;
  onClick: () => void;
}) {
  const [imgError, setImgError] = useState(false);
  const flag = artist.country ? countryFlags[artist.country] ?? "" : "";

  return (
    <button
      type="button"
      onClick={onClick}
      className="group block w-full text-left rounded-xl overflow-hidden bg-card border border-border transition-all duration-200 ease-out hover:shadow-lg hover:-translate-y-1 cursor-pointer"
    >
      {/* Image */}
      <div className="aspect-square bg-muted relative">
        {artist.imageUrl && !imgError ? (
          <img
            src={artist.imageUrl}
            alt={artist.name}
            className="size-full object-cover"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="size-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
            <User className="size-12 text-white/40" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 space-y-1">
        <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-blue-500 transition-colors">
          {artist.name}
        </h3>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          {artist.country ? (
            <span>
              {flag} {artist.country}
            </span>
          ) : (
            <span />
          )}
          {artist.songCount > 0 && (
            <span>{artist.songCount} songs</span>
          )}
        </div>
      </div>
    </button>
  );
}
