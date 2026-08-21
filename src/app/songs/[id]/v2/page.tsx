import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight, CirclePlay, ExternalLink, FileText } from "lucide-react";

import { fetchSongDetailById } from "@/lib/notion";
import { parseProgression } from "@/lib/chord-analysis";
import { parseSummary, isPracticeBlock } from "@/lib/song-summary";
import { ChordChart } from "@/components/chord-chart";
import { SongArtwork } from "../song-artwork";

export const dynamic = "force-dynamic";

export default async function SongDetailV2({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const song = await fetchSongDetailById(id);
  if (!song) notFound();

  const progression = parseProgression(song.romanNumeral);
  const summary = parseSummary(song.summaryLong);
  const practice = summary.filter(isPracticeBlock);
  const analysis = summary.filter((b) => !isPracticeBlock(b));

  const q = encodeURIComponent(`${song.artistRelation?.name ?? song.artist} ${song.title}`);

  const stats: { label: string; value: string }[] = [
    song.key && { label: "Key", value: song.key },
    song.bpm != null && { label: "BPM", value: String(song.bpm) },
    song.era && { label: "年代", value: song.era },
    song.rhythm && { label: "リズム", value: song.rhythm },
    song.genres.length > 0 && { label: "ジャンル", value: song.genres.join(" / ") },
    song.instruments.length > 0 && { label: "楽器", value: song.instruments.join(" / ") },
    song.difficulty && { label: "難易度", value: song.difficulty },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <Link
        href="/songs"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Song Library
      </Link>

      {/* ヘッダー */}
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end">
        <div className="w-32 shrink-0 sm:w-40">
          <SongArtwork song={song} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
            Song Analysis
          </p>
          <h1 className="mt-1.5 text-2xl leading-tight font-bold text-foreground sm:text-3xl">
            {song.title}
          </h1>
          {song.artistRelation ? (
            <Link
              href={`/artists/${song.artistRelation.id}`}
              className="mt-1 inline-flex items-center gap-1 text-lg text-foreground underline decoration-muted-foreground/40 underline-offset-4 transition-colors hover:decoration-foreground"
            >
              {song.artistRelation.name}
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
          ) : song.artist ? (
            <p className="mt-1 text-lg text-muted-foreground">{song.artist}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_17rem]">
        {/* 本文 */}
        <div className="min-w-0 space-y-9">
          {(progression.sections.length > 0 || progression.fallback) && (
            <Section title="コード進行">
              <ChordChart progression={progression} />
            </Section>
          )}

          {analysis.length > 0 && (
            <Section title="この曲のポイント">
              <div className="space-y-4">
                {analysis.map((b, i) => (
                  <div key={i}>
                    {b.label && (
                      <p className="mb-1 text-xs font-bold tracking-wide text-foreground">
                        {b.label}
                      </p>
                    )}
                    {b.paragraphs.map((p, pi) => (
                      <p
                        key={pi}
                        className="text-sm leading-[1.9] text-muted-foreground"
                      >
                        {p}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {practice.length > 0 && (
            <Section title="練習ポイント">
              <ul className="space-y-2.5">
                {practice
                  .flatMap((b) => [...b.bullets, ...b.paragraphs])
                  .map((t, i) => (
                    <li
                      key={i}
                      className="flex gap-2.5 text-sm leading-[1.9] text-foreground"
                    >
                      <span className="mt-[0.55rem] size-1.5 shrink-0 rounded-full bg-amber-500" />
                      {t}
                    </li>
                  ))}
              </ul>
            </Section>
          )}

          <Section title="資料">
            <div className="flex flex-wrap gap-2.5">
              {song.sheetUrl && (
                <LinkButton href={song.sheetUrl} icon={<FileText className="size-4" />}>
                  楽譜を開く
                </LinkButton>
              )}
              {song.hasYoutube && (
                <LinkButton
                  href={`https://www.youtube.com/results?search_query=${q}`}
                  icon={<CirclePlay className="size-4" />}
                >
                  YouTube で聴く
                </LinkButton>
              )}
              <LinkButton
                href={`https://open.spotify.com/search/${q}`}
                icon={<ExternalLink className="size-4" />}
              >
                Spotify で聴く
              </LinkButton>
            </div>
          </Section>
        </div>

        {/* サイドバー */}
        <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="mb-3 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              Song Stats
            </p>
            <dl className="divide-y divide-border">
              {stats.map((s) => (
                <div key={s.label} className="flex items-baseline justify-between gap-3 py-2">
                  <dt className="text-xs text-muted-foreground">{s.label}</dt>
                  <dd className="text-right text-sm font-semibold text-foreground">
                    {s.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {song.chordProgression.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="mb-2.5 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                使われている技法
              </p>
              <div className="flex flex-wrap gap-1.5">
                {song.chordProgression.map((c) => (
                  <Link
                    key={c}
                    href={`/songs?chord=${encodeURIComponent(c)}`}
                    className="rounded-full bg-emerald-500/12 px-2.5 py-1 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-500/20"
                  >
                    {c}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {song.tags.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="mb-2.5 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                タグ
              </p>
              <div className="flex flex-wrap gap-1.5">
                {song.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 border-b border-border pb-2 text-sm font-bold text-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

function LinkButton({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
    >
      {icon}
      {children}
    </a>
  );
}
