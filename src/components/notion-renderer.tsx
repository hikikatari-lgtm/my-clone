"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
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

function TableBlock({ block }: { block: NotionBlock }) {
  const rows = block.children?.filter((c) => c.type === "table_row") ?? [];
  const hasColumnHeader = block.table?.has_column_header ?? false;

  return (
    <div className="my-4 overflow-x-auto rounded-lg border border-border">
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
                  isHeader && "bg-muted/50"
                )}
              >
                {cells.map((cell, cellIdx) => (
                  <Tag
                    key={cellIdx}
                    className={cn(
                      "px-3 py-2 text-left whitespace-nowrap",
                      isHeader && "font-semibold"
                    )}
                  >
                    <RichText texts={cell} />
                  </Tag>
                ))}
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

    case "heading_2":
      return (
        <h2 className="text-lg font-bold text-foreground mt-6 mb-2">
          <RichText texts={block.heading_2!.rich_text} />
        </h2>
      );

    case "heading_3":
      return (
        <h3 className="text-base font-semibold text-foreground mt-4 mb-1.5">
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
