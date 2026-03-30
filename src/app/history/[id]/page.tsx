import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { episodes, getEpisodeByEp } from "@/lib/episodes";
import { fetchSongBlocks } from "@/lib/notion";
import { NotionRenderer } from "@/components/notion-renderer";

export const dynamic = "force-dynamic";

export default async function HistoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ep = getEpisodeByEp(Number(id));

  if (!ep) notFound();

  const blocks = await fetchSongBlocks(ep.pageId).catch(() => []);

  // Previous / Next navigation
  const prev = ep.ep > 1 ? getEpisodeByEp(ep.ep - 1) : undefined;
  const next = ep.ep < episodes.length ? getEpisodeByEp(ep.ep + 1) : undefined;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <Link
        href="/history"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="size-4" />
        Back to History
      </Link>

      {/* Header */}
      <div className="mb-8">
        <span className="text-sm text-muted-foreground">
          Episode {String(ep.ep).padStart(2, "0")}
        </span>
        <h1 className="text-2xl font-bold text-foreground mt-1">{ep.title}</h1>
        <span className="inline-block rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground mt-2">
          {ep.genre}
        </span>
      </div>

      {/* Content */}
      {blocks.length > 0 ? (
        <NotionRenderer
          blocks={blocks}
          excludeTypes={["image", "video", "audio", "file", "embed"]}
        />
      ) : (
        <p className="text-center text-muted-foreground py-12">
          コンテンツを読み込めませんでした
        </p>
      )}

      {/* Prev / Next */}
      <div className="flex justify-between items-center border-t border-border mt-10 pt-6">
        {prev ? (
          <Link
            href={`/history/${prev.ep}`}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            &larr; Ep.{prev.ep} {prev.title}
          </Link>
        ) : (
          <div />
        )}
        {next ? (
          <Link
            href={`/history/${next.ep}`}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors text-right"
          >
            Ep.{next.ep} {next.title} &rarr;
          </Link>
        ) : (
          <div />
        )}
      </div>
    </main>
  );
}
