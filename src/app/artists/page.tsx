import { fetchArtists } from "@/lib/notion";
import { ArtistGrid } from "@/components/artist-grid";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Artists",
};

export default async function ArtistsPage() {
  const artists = await fetchArtists();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Artists</h1>
        <p className="text-sm text-muted-foreground mt-1">
          アーティスト一覧
        </p>
      </div>
      <ArtistGrid artists={artists} />
    </main>
  );
}
