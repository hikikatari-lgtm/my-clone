import { Client } from "@notionhq/client";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints/common";
import type { QueryDataSourceResponse } from "@notionhq/client/build/src/api-endpoints/data-sources";
import type { Song, SongDetail } from "@/types/song";

const DATA_SOURCE_ID = "917e0b71-8fda-474c-8fba-9d751866e5dd";

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

function pageToSong(page: PageObjectResponse): Song {
  const genres = getMultiSelectProperty(page, "音楽ジャンル");
  return {
    id: page.id,
    title: getTitleProperty(page),
    artist: getTextProperty(page, "Artist (text)"),
    genre: genres[0] ?? "Unknown",
    key: getSelectProperty(page, "Key"),
    bpm: getNumberProperty(page, "bpm"),
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
