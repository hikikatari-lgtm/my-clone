import { NovelCardGrid } from "@/components/NovelCardGrid";
import { fetchNovels } from "@/lib/notion";

export const revalidate = 60;

export default async function NovelsPage() {
  const novels = await fetchNovels().catch((e) => {
    console.error("Failed to fetch novels:", e);
    return [];
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <NovelCardGrid novels={novels} />
    </main>
  );
}
