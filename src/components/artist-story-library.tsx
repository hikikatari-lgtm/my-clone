"use client";
import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ArtistStory } from "@/lib/episodes";

export function ArtistStoryLibrary({ stories }: { stories: ArtistStory[] }) {
  const [query, setQuery] = useState("");

  const filtered = stories.filter(
    (s) =>
      s.title.toLowerCase().includes(query.toLowerCase()) ||
      s.artist.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="アーティスト名で検索..."
          className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
        />
      </div>
      <p className="text-sm text-muted-foreground">
        {filtered.length} / {stories.length} 本
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map((story) => (
          <Link
            key={story.id}
            href={`/story/${story.id}`}
            className="group block rounded-xl border border-border bg-card p-4 transition-all duration-200 ease-out hover:shadow-md hover:border-border/80"
          >
            <div className="flex items-center gap-3">
              <span className="shrink-0 mt-0.5 text-xs font-semibold text-muted-foreground bg-muted rounded-md px-2 py-1">
                #{String(story.id).padStart(2, "0")}
              </span>
              <div className="flex-1 min-w-0 space-y-0.5">
                <h3 className="text-sm font-semibold text-foreground group-hover:text-blue-500 transition-colors leading-snug truncate">
                  {story.title}
                </h3>
                <p className="text-xs text-muted-foreground">{story.artist}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
