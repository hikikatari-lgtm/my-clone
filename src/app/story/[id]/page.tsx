import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { artistStories } from "@/lib/episodes";

export default async function StoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const story = artistStories.find((s) => s.id === Number(id));
  if (!story) notFound();

  const currentIndex = artistStories.findIndex((s) => s.id === story.id);
  const prev = currentIndex > 0 ? artistStories[currentIndex - 1] : null;
  const next = currentIndex < artistStories.length - 1 ? artistStories[currentIndex + 1] : null;

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <Link
        href="/history"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="size-4" />
        History
      </Link>
      <div className="mb-6">
        <span className="text-sm text-muted-foreground">Artist Story #{String(story.id).padStart(2, "0")}</span>
        <h1 className="text-2xl font-bold text-foreground mt-1">{story.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{story.artist}</p>
      </div>
      <div className="mb-8 rounded-xl overflow-hidden border border-border">
        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          <iframe
            src={`https://www.loom.com/embed/${story.loomId}`}
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>
      </div>
      {story.summary && (
        <div className="mb-8 prose prose-sm dark:prose-invert max-w-none">
          <h2 className="text-base font-semibold text-foreground mb-3">ドキュメンタリー概要</h2>
          <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            {story.summary.split("\n\n").map((para, i) => (
              <p key={i} dangerouslySetInnerHTML={{ __html: para.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") }} />
            ))}
          </div>
        </div>
      )}
      <div className="flex justify-between pt-6 border-t border-border">
        {prev ? (
          <Link href={`/story/${prev.id}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← #{prev.id} {prev.artist}
          </Link>
        ) : <div />}
        {next ? (
          <Link href={`/story/${next.id}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors text-right">
            #{next.id} {next.artist} →
          </Link>
        ) : <div />}
      </div>
    </main>
  );
}
