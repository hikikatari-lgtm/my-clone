import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { episodes, getEpisodeByEp } from "@/lib/episodes";

export function generateStaticParams() {
  return episodes.map((ep) => ({ id: String(ep.ep) }));
}

export default async function HistoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ep = getEpisodeByEp(Number(id));

  if (!ep) notFound();

  const notionUrl = `https://www.notion.so/directline/${ep.pageId}`;

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 3rem)" }}>
      <div className="flex items-center gap-4 px-4 py-2 border-b border-border bg-background sm:px-6">
        <Link
          href="/history"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          戻る
        </Link>
        <span className="text-sm font-semibold text-foreground truncate">
          Ep.{ep.ep} {ep.title}
        </span>
        <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          {ep.genre}
        </span>
      </div>
      <iframe
        src={notionUrl}
        title={`Ep.${ep.ep} ${ep.title}`}
        className="flex-1 w-full border-0"
        allow="fullscreen"
      />
    </div>
  );
}
