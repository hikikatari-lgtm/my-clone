import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PlaylistVideos } from "@/components/playlist-videos";

export const dynamic = "force-dynamic";

export default async function PlaylistDetailPage({
  params,
}: {
  params: Promise<{ playlistId: string }>;
}) {
  const { playlistId } = await params;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <Link
        href="/videos"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="size-4" />
        再生リストに戻る
      </Link>
      <PlaylistVideos playlistId={playlistId} />
    </main>
  );
}
