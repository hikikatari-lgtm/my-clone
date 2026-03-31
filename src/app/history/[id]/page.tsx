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

  const blocks = await fetchSongBlocks(ep.pageId).catch((e) => {
    console.error(e);
    return [];
  });

  const currentIndex = episodes.findIndex((e) => e.ep === ep.ep);
  const prev = currentIndex > 0 ? episodes[currentIndex - 1] : null;
  const next = currentIndex < episodes.length - 1 ? episodes[currentIndex + 1] : null;

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      {/* 戻るボタン */}
      <Link
        href="/history"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="size-4" />
        Rock Legends
      </Link>

      {/* ヘッダー */}
      <div className="mb-6">
        <span className="text-sm text-muted-foreground">
          Episode {String(ep.ep).padStart(2, "0")}
        </span>
        <h1 className="text-2xl font-bold text-foreground mt-1">{ep.title}</h1>
        {ep.artists && (
          <p className="text-sm text-muted-foreground mt-1">{ep.artists}</p>
        )}
        <span className="inline-block rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground mt-2">
          {ep.genre}
        </span>
      </div>

      {/* Loom動画プレイヤー */}
      {ep.loomId ? (
        <div className="mb-8 rounded-xl overflow-hidden border border-border">
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            <iframe
              src={`https://www.loom.com/embed/${ep.loomId}`}
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
        </div>
      ) : (
        <div className="mb-8">
          
            href={`https://www.notion.so/directline/${ep.pageId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition-colors"
          >
            Notionで動画を見る
          </a>
        </div>
      )}

      {/* Notionコンテンツ */}
      {blocks.length > 0 && (
        <div className="prose prose-sm dark:prose-invert max-w-none mb-8">
          <NotionRenderer blocks={blocks} />
        </div>
      )}

      {/* 前後ナビゲーション */}
      <div className="flex justify-between pt-6 border-t border-border">
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
