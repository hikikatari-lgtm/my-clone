"use client";

import { useState } from "react";
import Link from "next/link";
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

export function ArtistCard({ artist }: { artist: Artist }) {
  const [imgError, setImgError] = useState(false);
  const flag = artist.country ? countryFlags[artist.country] ?? "" : "";

  return (
    <Link
      href={`/artists/${artist.id}`}
      className="group block rounded-xl overflow-hidden bg-card border border-border transition-all duration-200 ease-out hover:shadow-lg hover:-translate-y-1"
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
    </Link>
  );
}
