"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { classifyChord, type ChordFunction } from "@/lib/chord-analysis";
import { FUNCTION_STYLE } from "@/lib/chord-colors";
import type { NotionBlock, NotionRichText } from "@/types/song";

function RichText({ texts }: { texts: NotionRichText[] }) {
  return (
    <>
      {texts.map((t, i) => {
        let el: React.ReactNode = t.plain_text;

        if (t.annotations.code) {
          el = (
            <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">
              {el}
            </code>
          );
        }
        if (t.annotations.bold) el = <strong>{el}</strong>;
        if (t.annotations.italic) el = <em>{el}</em>;
        if (t.annotations.strikethrough) el = <s>{el}</s>;
        if (t.annotations.underline) el = <u>{el}</u>;

        if (t.href) {
          el = (
            <a
              href={t.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {el}
            </a>
          );
        }

        return <span key={i}>{el}</span>;
      })}
    </>
  );
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match?.[1] ?? null;
}

function NotionImage({ block }: { block: NotionBlock }) {
  const [errored, setErrored] = useState(false);
  const url =
    block.image?.type === "file"
      ? block.image.file?.url
      : block.image?.external?.url;

  if (!url || errored) return null;

  const caption = block.image?.caption;

  return (
    <figure className="my-4">
      <img
        src={url}
        alt={caption?.map((t) => t.plain_text).join("") ?? ""}
        className="rounded-lg max-w-full"
        loading="lazy"
        onError={() => setErrored(true)}
      />
      {caption && caption.length > 0 && (
        <figcaption className="text-xs text-muted-foreground mt-1.5 text-center">
          <RichText texts={caption} />
        </figcaption>
      )}
    </figure>
  );
}

/**
 * 「VIm - VIm/V」のようなローマ数字のセルを解析する。
 * ローマ数字として読めない（実コード名や説明文の）セルは null を返し、
 * 呼び出し側で通常表示にフォールバックさせる。
 *
 * ここをコンポーネントにすると、内部で null を返しても JSX 要素自体は
 * 真になってしまい ?? のフォールバックが効かない。必ず関数として使う。
 */
function parseChordCell(
  cell: NotionRichText[]
): { raw: string; fn: ChordFunction }[] | null {
  const text = cell.map((t) => t.plain_text).join("").trim();
  if (!text || text.length > 60) return null;

  const tokens = text.split(/\s*[-–—→]\s*/).map((t) => t.trim()).filter(Boolean);
  if (tokens.length === 0) return null;

  const chords = tokens.map((raw) => ({ raw, fn: classifyChord(raw) }));
  const known = chords.filter((c) => c.fn !== "other").length;
  // 過半数がローマ数字として読めたときだけ色を付ける
  if (known < Math.ceil(tokens.length * 0.6)) return null;

  return chords;
}

function TableBlock({ block }: { block: NotionBlock }) {
  const rows = block.children?.filter((c) => c.type === "table_row") ?? [];
  const hasColumnHeader = block.table?.has_column_header ?? false;

  return (
    <div className="my-4 overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <tbody>
          {rows.map((row, rowIdx) => {
            const cells = row.table_row?.cells ?? [];
            const isHeader = hasColumnHeader && rowIdx === 0;
            const Tag = isHeader ? "th" : "td";
            return (
              <tr
                key={row.id}
                className={cn(
                  rowIdx !== rows.length - 1 && "border-b border-border",
                  isHeader && "bg-muted/60"
                )}
              >
                {cells.map((cell, cellIdx) => {
                  const chords = isHeader ? null : parseChordCell(cell);
                  return (
                    <Tag
                      key={cellIdx}
                      className={cn(
                        "px-3 py-2 text-left align-top",
                        isHeader && "font-semibold",
                        !chords && "whitespace-nowrap"
                      )}
                    >
                      {chords ? (
                        <span className="inline-flex flex-wrap gap-1">
                          {chords.map((c, i) => (
                            <span
                              key={i}
                              className={cn(
                                "rounded px-1.5 py-0.5 font-mono text-[12.5px] font-semibold ring-1 ring-inset",
                                FUNCTION_STYLE[c.fn]
                              )}
                            >
                              {c.raw}
                            </span>
                          ))}
                        </span>
                      ) : (
                        <RichText texts={cell} />
                      )}
                    </Tag>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function BlockRenderer({ block }: { block: NotionBlock }) {
  switch (block.type) {
    case "paragraph":
      if (!block.paragraph?.rich_text.length) return <div className="h-4" />;
      return (
        <p className="text-sm leading-relaxed text-foreground">
          <RichText texts={block.paragraph.rich_text} />
        </p>
      );

    case "heading_1":
      return (
        <h2 className="mt-10 mb-4 border-b border-border pb-2 text-xl font-bold text-foreground">
          <RichText texts={block.heading_1!.rich_text} />
        </h2>
      );

    case "heading_2":
      return (
        <h2 className="mt-9 mb-3 border-b border-border pb-2 text-lg font-bold text-foreground">
          <RichText texts={block.heading_2!.rich_text} />
        </h2>
      );

    // 「【A1】1〜8小節目「Georgia, Georgia...」」のような小見出し。
    // 左に色帯を出して、本文と混ざらないようにする。
    case "heading_3":
      return (
        <h3 className="mt-6 mb-2 border-l-[3px] border-sky-500/60 pl-2.5 text-[0.95rem] font-bold text-foreground">
          <RichText texts={block.heading_3!.rich_text} />
        </h3>
      );

    case "bulleted_list_item":
      return (
        <li className="text-sm leading-relaxed text-foreground ml-4 list-disc">
          <RichText texts={block.bulleted_list_item!.rich_text} />
        </li>
      );

    case "numbered_list_item":
      return (
        <li className="text-sm leading-relaxed text-foreground ml-4 list-decimal">
          <RichText texts={block.numbered_list_item!.rich_text} />
        </li>
      );

    case "table":
      return <TableBlock block={block} />;

    case "image":
      return <NotionImage block={block} />;

    case "video": {
      const url = block.video?.external?.url;
      if (!url) return null;
      const ytId = extractYouTubeId(url);
      if (!ytId) return null;
      return (
        <div className="my-4 aspect-video rounded-lg overflow-hidden">
          <iframe
            src={`https://www.youtube.com/embed/${ytId}`}
            title="YouTube video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="size-full"
          />
        </div>
      );
    }

    case "divider":
      return <hr className="my-4 border-border" />;

    case "callout":
      return (
        <div className="my-3 rounded-lg bg-muted/50 border border-border p-3 flex gap-2">
          {block.callout?.icon?.emoji && (
            <span className="text-lg shrink-0">{block.callout.icon.emoji}</span>
          )}
          <div className="text-sm leading-relaxed">
            <RichText texts={block.callout!.rich_text} />
          </div>
        </div>
      );

    case "quote":
      return (
        <blockquote className="my-3 border-l-3 border-border pl-4 text-sm italic text-muted-foreground">
          <RichText texts={block.quote!.rich_text} />
        </blockquote>
      );

    case "toggle":
      return (
        <details className="my-2">
          <summary className="text-sm font-medium cursor-pointer text-foreground">
            <RichText texts={block.toggle!.rich_text} />
          </summary>
          {block.children && (
            <div className="pl-4 pt-1">
              <NotionRenderer blocks={block.children} />
            </div>
          )}
        </details>
      );

    case "audio": {
      const audioUrl =
        block.audio?.type === "file"
          ? block.audio.file?.url
          : block.audio?.external?.url;
      if (!audioUrl) return null;
      return (
        <audio
          controls
          className="w-full mt-4 mb-2"
          onError={(e) => (e.currentTarget.style.display = "none")}
        >
          <source src={audioUrl} />
        </audio>
      );
    }

    case "column_list": {
      const columns = block.children?.filter((c) => c.type === "column") ?? [];
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
          {columns.map((col) => (
            <div key={col.id}>
              {col.children && <NotionRenderer blocks={col.children} />}
            </div>
          ))}
        </div>
      );
    }

    // 理論解説の図（ベースの動きや構成音）が入っている。
    // これまで描画されず、22ブロックが丸ごと見えていなかった。
    case "code": {
      const text = block.code?.rich_text ?? [];
      if (text.length === 0) return null;
      return (
        <figure className="my-4">
          <pre className="overflow-x-auto rounded-lg border border-border bg-muted/60 px-4 py-3 font-mono text-[13px] leading-relaxed whitespace-pre-wrap text-foreground">
            {text.map((t) => t.plain_text).join("")}
          </pre>
          {block.code?.caption && block.code.caption.length > 0 && (
            <figcaption className="mt-1.5 text-xs text-muted-foreground">
              <RichText texts={block.code.caption} />
            </figcaption>
          )}
        </figure>
      );
    }

    case "bookmark":
    case "embed": {
      const url = block.bookmark?.url ?? block.embed?.url;
      if (!url) return null;
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="my-3 flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm text-foreground transition-colors hover:bg-muted"
        >
          <span className="truncate">{url}</span>
        </a>
      );
    }

    case "pdf": {
      const url =
        block.pdf?.type === "file" ? block.pdf.file?.url : block.pdf?.external?.url;
      if (!url) return null;
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="my-3 inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          PDF を開く
        </a>
      );
    }

    case "child_page":
      return (
        <p className="my-2 text-sm text-muted-foreground">
          {block.child_page?.title}
        </p>
      );

    default:
      return null;
  }
}

function wrapListItems(blocks: NotionBlock[]): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let i = 0;

  while (i < blocks.length) {
    const block = blocks[i];

    if (block.type === "bulleted_list_item") {
      const items: NotionBlock[] = [];
      while (i < blocks.length && blocks[i].type === "bulleted_list_item") {
        items.push(blocks[i]);
        i++;
      }
      nodes.push(
        <ul key={items[0].id} className="my-2 space-y-1">
          {items.map((b) => (
            <BlockRenderer key={b.id} block={b} />
          ))}
        </ul>
      );
    } else if (block.type === "numbered_list_item") {
      const items: NotionBlock[] = [];
      while (i < blocks.length && blocks[i].type === "numbered_list_item") {
        items.push(blocks[i]);
        i++;
      }
      nodes.push(
        <ol key={items[0].id} className="my-2 space-y-1">
          {items.map((b) => (
            <BlockRenderer key={b.id} block={b} />
          ))}
        </ol>
      );
    } else {
      nodes.push(<BlockRenderer key={block.id} block={block} />);
      i++;
    }
  }

  return nodes;
}

interface NotionRendererProps {
  blocks: NotionBlock[];
  onlyTypes?: string[];
  excludeTypes?: string[];
}

export function NotionRenderer({
  blocks,
  onlyTypes,
  excludeTypes,
}: NotionRendererProps) {
  let filtered = blocks;
  if (onlyTypes) {
    filtered = blocks.filter((b) => onlyTypes.includes(b.type));
  } else if (excludeTypes) {
    filtered = blocks.filter((b) => !excludeTypes.includes(b.type));
  }
  return <div className="space-y-2">{wrapListItems(filtered)}</div>;
}
