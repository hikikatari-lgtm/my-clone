import { episodes } from "@/lib/episodes";
import { HistoryLibrary } from "@/components/history-library";

export const metadata = {
  title: "Rock Legends — History",
};

export default function HistoryPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Rock Legends</h1>
        <p className="text-sm text-muted-foreground mt-1">
          ロック歴史秘話 全27エピソード
        </p>
      </div>
      <HistoryLibrary episodes={episodes} />
    </main>
  );
}
