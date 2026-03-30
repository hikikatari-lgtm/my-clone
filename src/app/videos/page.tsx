import { PlaylistGrid } from "@/components/playlist-grid";

export const metadata = {
  title: "Video Library",
};

export default function VideosPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Video Library</h1>
        <p className="text-sm text-muted-foreground mt-1">
          再生リストを選択してください
        </p>
      </div>
      <PlaylistGrid />
    </main>
  );
}
