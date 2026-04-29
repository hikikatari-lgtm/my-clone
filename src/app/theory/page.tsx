import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Music Theory | Music Library",
  description: "Interactive music theory tools and references",
};

const tools = [
  {
    title: "Blues Progressions",
    subtitle: "ブルース進行リファレンス",
    description:
      "12小節ブルースの3つのバリエーション（Major / Minor / Jazz）を12キーで表示。機能ラベル付き。",
    href: "/theory/blues.html",
    tags: ["12-Bar", "Major", "Minor", "Jazz", "12 Keys"],
  },
  {
    title: "Chord Function Visualizer",
    subtitle: "コード機能ビジュアライザー",
    description:
      "ダイアトニックコードの機能（T / SD / D / 2D / SS / SDm）をインタラクティブに表示。",
    href: "/theory/chords.html",
    tags: ["Diatonic", "Functions", "Interactive"],
  },
  {
    title: "Minor Scale Matrix",
    subtitle: "マイナースケール・マトリクス",
    description:
      "Natural / Harmonic / Melodic / Dorian の4スケール × 7度数のダイアトニックを一望。スケール固有の差分コードを★で強調。",
    href: "/theory/minor-matrix.html",
    tags: ["4 Scales", "Diatonic", "Comparison"],
  },
];

export default function TheoryPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="mb-10">
        <p className="mb-1 font-mono text-xs tracking-widest text-muted-foreground uppercase">
          音楽理論 &middot; Interactive Tools
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Music Theory
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          インタラクティブな音楽理論ツール。各ページは独立したスタンドアロンアプリです。
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-foreground/20 hover:shadow-md"
          >
            <h2 className="text-lg font-semibold text-foreground group-hover:underline">
              {tool.title}
            </h2>
            <p className="mt-0.5 font-mono text-xs text-muted-foreground">
              {tool.subtitle}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {tool.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {tool.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
