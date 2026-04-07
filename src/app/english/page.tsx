import { EnglishCardGrid } from "@/components/EnglishCardGrid";
import { fetchEnglishMaterials } from "@/lib/notion";

export const revalidate = 60;

export default async function EnglishPage() {
  const materials = await fetchEnglishMaterials().catch((e) => {
    console.error("Failed to fetch english materials:", e);
    return [];
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <EnglishCardGrid materials={materials} />
    </main>
  );
}
