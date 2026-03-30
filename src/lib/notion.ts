import { Client } from "@notionhq/client";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints/common";
import type { QueryDataSourceResponse } from "@notionhq/client/build/src/api-endpoints/data-sources";
import type { Song, SongDetail, NotionBlock } from "@/types/song";
import type { Playlist } from "@/types/video";

const DATA_SOURCE_ID = "917e0b71-8fda-474c-8fba-9d751866e5dd";
const PLAYLIST_DB_ID = "6ec1fb96-a440-4bca-a6f7-7b3a42bc7d83";

function getNotionClient() {
  const token = process.env.NOTION_API_KEY;
  if (!token) {
    throw new Error("NOTION_API_KEY environment variable is not set");
  }
  return new Client({ auth: token });
}

function getTextProperty(page: PageObjectResponse, name: string): string {
  const prop = page.properties[name];
  if (prop?.type === "rich_text") {
    return prop.rich_text.map((t) => t.plain_text).join("");
  }
  return "";
}

function getTitleProperty(page: PageObjectResponse): string {
  const prop = page.properties["Title"];
  if (prop?.type === "title") {
    return prop.title.map((t) => t.plain_text).join("");
  }
  return "";
}

function getSelectProperty(
  page: PageObjectResponse,
  name: string
): string | undefined {
  const prop = page.properties[name];
  if (prop?.type === "select" && prop.select) {
    return prop.select.name;
  }
  return undefined;
}

function getNumberProperty(
  page: PageObjectResponse,
  name: string
): number | undefined {
  const prop = page.properties[name];
  if (prop?.type === "number" && prop.number !== null) {
    return prop.number;
  }
  return undefined;
}

function getMultiSelectProperty(
  page: PageObjectResponse,
  name: string
): string[] {
  const prop = page.properties[name];
  if (prop?.type === "multi_select") {
    return prop.multi_select.map((o) => o.name);
  }
  return [];
}

function getCheckboxProperty(page: PageObjectResponse, name: string): boolean {
  const prop = page.properties[name];
  if (prop?.type === "checkbox") {
    return prop.checkbox;
  }
  return false;
}

function getRelationIds(page: PageObjectResponse, name: string): string[] {
  const prop = page.properties[name];
  if (prop?.type === "relation") {
    return prop.relation.map((r) => r.id);
  }
  return [];
}

function getUrlProperty(page: PageObjectResponse, name: string): string | undefined {
  const prop = page.properties[name];
  if (prop?.type === "url" && prop.url) {
    return prop.url;
  }
  return undefined;
}

function getCoverUrl(page: PageObjectResponse): string | undefined {
  const cover = page.cover;
  if (!cover) return undefined;
  if (cover.type === "external") return cover.external.url || undefined;
  if (cover.type === "file") return cover.file.url || undefined;
  return undefined;
}

function pageToSong(page: PageObjectResponse): Song {
  const genres = getMultiSelectProperty(page, "音楽ジャンル");
  return {
    id: page.id,
    title: getTitleProperty(page),
    artist: getTextProperty(page, "Artist (text)"),
    genre: genres[0] ?? "Unknown",
    key: getSelectProperty(page, "Key"),
    bpm: getNumberProperty(page, "bpm"),
    artworkUrl: getCoverUrl(page),
    era: getSelectProperty(page, "年代"),
    difficulty: getSelectProperty(page, "難易度"),
    chordProgression: getMultiSelectProperty(page, "コード進行"),
  };
}

export async function fetchSongById(id: string): Promise<Song | null> {
  const notion = getNotionClient();
  try {
    const page = await notion.pages.retrieve({ page_id: id });
    if ("properties" in page) {
      return pageToSong(page as PageObjectResponse);
    }
    return null;
  } catch {
    return null;
  }
}

async function resolveArtistName(
  notion: Client,
  pageId: string
): Promise<{ id: string; name: string } | undefined> {
  try {
    const page = await notion.pages.retrieve({ page_id: pageId });
    if (!("properties" in page)) return undefined;
    const p = page as PageObjectResponse;
    // Artist DB uses "Name" or title column
    for (const prop of Object.values(p.properties)) {
      if (prop.type === "title") {
        const name = prop.title.map((t) => t.plain_text).join("");
        if (name) return { id: pageId, name };
      }
    }
    return undefined;
  } catch {
    return undefined;
  }
}

export async function fetchSongDetailById(
  id: string
): Promise<SongDetail | null> {
  const notion = getNotionClient();
  try {
    const page = await notion.pages.retrieve({ page_id: id });
    if (!("properties" in page)) return null;
    const p = page as PageObjectResponse;
    const base = pageToSong(p);

    const confirmed = getCheckboxProperty(p, "✅ 確認済み");
    const chordProgression = getMultiSelectProperty(p, "コード進行");
    const romanNumeral = getTextProperty(p, "進行ローマ数字") || undefined;
    const era = getSelectProperty(p, "年代");
    const aiSummary = getTextProperty(p, "AI要約（短）") || undefined;
    const difficulty = getSelectProperty(p, "難易度");
    const tags = getMultiSelectProperty(p, "タグ");

    const artistIds = getRelationIds(p, "アーティスト");
    let artistRelation: SongDetail["artistRelation"];
    if (artistIds.length > 0) {
      artistRelation = await resolveArtistName(notion, artistIds[0]);
    }

    return {
      ...base,
      confirmed,
      chordProgression,
      romanNumeral,
      era,
      aiSummary,
      difficulty,
      tags,
      artistRelation,
    };
  } catch {
    return null;
  }
}

export async function fetchSongs(): Promise<Song[]> {
  const notion = getNotionClient();
  const songs: Song[] = [];
  let cursor: string | undefined;

  do {
    const response: QueryDataSourceResponse = await notion.dataSources.query({
      data_source_id: DATA_SOURCE_ID,
      filter: {
        property: "✅ 確認済み",
        checkbox: { equals: true },
      },
      start_cursor: cursor,
      page_size: 100,
    });

    for (const page of response.results) {
      if ("properties" in page) {
        songs.push(pageToSong(page as PageObjectResponse));
      }
    }

    cursor = response.has_more
      ? (response.next_cursor ?? undefined)
      : undefined;
  } while (cursor);

  return songs;
}

export async function fetchSongBlocks(pageId: string): Promise<NotionBlock[]> {
  const notion = getNotionClient();
  const blocks: NotionBlock[] = [];
  let cursor: string | undefined;

  do {
    const response = await notion.blocks.children.list({
      block_id: pageId,
      start_cursor: cursor,
      page_size: 100,
    });

    for (const block of response.results) {
      if (!("type" in block)) continue;
      const b = block as unknown as NotionBlock;

      // Fetch table rows for table blocks
      if (b.type === "table" && b.has_children) {
        const children = await fetchSongBlocks(b.id);
        b.children = children;
      }

      // Fetch children for toggle blocks
      if (b.type === "toggle" && b.has_children) {
        const children = await fetchSongBlocks(b.id);
        b.children = children;
      }

      // Fetch columns for column_list blocks
      if (b.type === "column_list" && b.has_children) {
        const columns = await fetchSongBlocks(b.id);
        // Each column also has children
        for (const col of columns) {
          if (col.type === "column" && col.has_children) {
            col.children = await fetchSongBlocks(col.id);
          }
        }
        b.children = columns;
      }

      blocks.push(b);
    }

    cursor = response.has_more
      ? (response.next_cursor ?? undefined)
      : undefined;
  } while (cursor);

  return blocks;
}

async function notionPost(path: string, body: Record<string, unknown>) {
  const token = process.env.NOTION_API_KEY;
  if (!token) throw new Error("NOTION_API_KEY is not set");
  const res = await fetch(`https://api.notion.com/v1/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Notion API error ${res.status}`);
  return res.json();
}

export async function fetchPlaylistsFromNotion(): Promise<Playlist[]> {
  const items: Array<{
    playlistId: string;
    title: string;
    videoCount: number;
    category?: string;
    isRecommended: boolean;
    description: string;
    sortOrder: number;
    thumbnailUrl: string;
  }> = [];
  let cursor: string | undefined;

  do {
    const body: Record<string, unknown> = {
      filter: {
        property: "公開設定",
        select: { equals: "表示" },
      },
      page_size: 100,
    };
    if (cursor) body.start_cursor = cursor;

    const response = await notionPost(
      `databases/${PLAYLIST_DB_ID}/query`,
      body
    );

    for (const page of response.results ?? []) {
      if (!page.properties) continue;
      const p = page as PageObjectResponse;

      const titleProp = p.properties["タイトル"];
      const title =
        titleProp?.type === "title"
          ? titleProp.title.map((t) => t.plain_text).join("")
          : "";

      const pidProp = p.properties["playlist_id"];
      const playlistId =
        pidProp?.type === "rich_text"
          ? pidProp.rich_text.map((t) => t.plain_text).join("")
          : "";

      const countProp = p.properties["動画数"];
      const videoCount =
        countProp?.type === "number" && countProp.number !== null
          ? countProp.number
          : 0;

      const catProp = p.properties["カテゴリ"];
      const category =
        catProp?.type === "select" && catProp.select
          ? catProp.select.name
          : undefined;

      const recProp = p.properties["おすすめ"];
      const isRecommended =
        recProp?.type === "checkbox" ? recProp.checkbox : false;

      const descProp = p.properties["説明文"];
      const description =
        descProp?.type === "rich_text"
          ? descProp.rich_text.map((t) => t.plain_text).join("")
          : "";

      const orderProp = p.properties["表示順"];
      const sortOrder =
        orderProp?.type === "number" && orderProp.number !== null
          ? orderProp.number
          : 999;

      const thumbProp = p.properties["thumbnail_url"];
      const thumbnailUrl =
        thumbProp?.type === "rich_text"
          ? thumbProp.rich_text.map((t) => t.plain_text).join("")
          : "";

      if (playlistId) {
        items.push({
          playlistId,
          title,
          videoCount,
          category,
          isRecommended,
          description,
          sortOrder,
          thumbnailUrl,
        });
      }
    }

    cursor = response.has_more
      ? (response.next_cursor ?? undefined)
      : undefined;
  } while (cursor);

  // Sort by sortOrder asc, then videoCount desc
  items.sort((a, b) => a.sortOrder - b.sortOrder || b.videoCount - a.videoCount);

  return items.map((item) => ({
    id: item.playlistId,
    title: item.title,
    description: item.description,
    thumbnailUrl: item.thumbnailUrl,
    videoCount: item.videoCount,
    category: item.category,
    isRecommended: item.isRecommended,
  }));
}
