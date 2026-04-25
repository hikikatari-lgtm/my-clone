import { notFound } from "next/navigation";
import { NovelCardGrid } from "@/components/NovelCardGrid";
import { fetchNovels } from "@/lib/notion";
import { isPublicMode } from "@/lib/site-config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export const revalidate = 60;

export default async function NovelsPage() {
  if (isPublicMode) notFound();

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
