import { VideoLibrary } from "@/components/video-library";

export const metadata = {
  title: "Video Library",
};

export default function VideosPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Video Library</h1>
        <p className="text-sm text-muted-foreground mt-1">
          YouTube channel videos
        </p>
      </div>
      <VideoLibrary />
    </main>
  );
}
