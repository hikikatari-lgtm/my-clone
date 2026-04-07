"use client";

import { useState } from "react";
import type { Song } from "@/lib/notion";

interface SongCardGridProps {
  title: string;
  songs: Song[];
}

const GENRE_FILTERS = ["すべて", "Jazz", "Pop", "Rock", "Gospel", "R&B"] as const;

const PROGRESSION_FILTERS = [
  { label: "すべて", search: "" },
  { label: "I-V-VIm-IV（カノン系）", search: "I-V-VIm-IV" },
  { label: "I-IV-V（3コード）", search: "I-IV-V" },
  { label: "Im-♭VII-♭VI（マイナー系）", search: "Im-♭VII-♭VI" },
  { label: "II-V-I（ジャズ）", search: "II-V-I" },
  { label: "I-VIm-IV-V（50's）", search: "I-VIm-IV-V" },
] as const;

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const colorMap: Record<string, string> = {
    "初級": "bg-green-100 text-green-800",
    "中級": "bg-yellow-100 text-yellow-800",
    "上級": "bg-red-100 text-red-800",
    "初心者": "bg-green-100 text-green-800",
    "中上級": "bg-orange-100 text-orange-800",
  };
  const colors = colorMap[difficulty] || "bg-gray-100 text-gray-800";
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${colors}`}>
      {difficulty}
    </span>
  );
}

function SongCard({ song }: { song: Song }) {
  return (
    <a
      href={song.notionUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      {/* Color bar based on genre */}
      <div className="h-2 bg-gradient-to-r from-[#E8621A] to-[#f09a5a]" />
      <div className="p-4">
        <h3 className="truncate text-[16px] font-bold text-[#222] group-hover:text-[#E8621A]">
          {song.title}
        </h3>
        <p className="mt-1 text-[14px] italic text-[#666]">{song.artist}</p>

        {/* Meta info row */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {song.difficulty && <DifficultyBadge difficulty={song.difficulty} />}
          {song.key && (
            <span className="inline-block rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
              Key: {song.key}
            </span>
          )}
          {song.bpm && (
            <span className="inline-block rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">
              {song.bpm} BPM
            </span>
          )}
        </div>

        {/* Genre tags */}
        {song.genre.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {song.genre.map((g) => (
              <span
                key={g}
                className="inline-block rounded bg-[#fef3ec] px-2 py-0.5 text-xs text-[#E8621A]"
              >
                {g}
              </span>
            ))}
          </div>
        )}

        {/* Summary */}
        {song.summary && (
          <p className="mt-2 line-clamp-2 text-xs text-[#999]">
            {song.summary}
          </p>
        )}
      </div>
    </a>
  );
}

export function SongCardGrid({ title, songs }: SongCardGridProps) {
  const [activeGenre, setActiveGenre] = useState<string>("すべて");
  const [activeProgression, setActiveProgression] = useState<string>("");

  const filtered = songs.filter((song) => {
    const genreMatch = activeGenre === "すべて" || song.genre.includes(activeGenre);
    const progressionMatch = activeProgression === "" || song.progressionRoman.includes(activeProgression);
    return genreMatch && progressionMatch;
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[28px] font-bold text-[#222]">{title}</h2>
        <span className="text-sm text-[#666]">{filtered.length} 曲</span>
      </div>

      {/* Genre filter buttons */}
      <div className="mb-3">
        <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-[#999]">ジャンル</p>
        <div className="flex flex-wrap gap-2">
          {GENRE_FILTERS.map((genre) => (
            <button
              key={genre}
              onClick={() => setActiveGenre(genre)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeGenre === genre
                  ? "bg-[#E8621A] text-white"
                  : "border border-[#ddd] bg-white text-[#666] hover:border-[#E8621A] hover:text-[#E8621A]"
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Chord progression filter buttons */}
      <div className="mb-6">
        <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-[#999]">コード進行</p>
        <div className="flex flex-wrap gap-2">
          {PROGRESSION_FILTERS.map((prog) => (
            <button
              key={prog.label}
              onClick={() => setActiveProgression(prog.search)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeProgression === prog.search
                  ? "bg-[#E8621A] text-white"
                  : "border border-[#ddd] bg-white text-[#666] hover:border-[#E8621A] hover:text-[#E8621A]"
              }`}
            >
              {prog.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((song) => (
          <SongCard key={song.id} song={song} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-12 text-center text-[#999]">
          該当する曲がありません
        </p>
      )}
    </div>
  );
}
