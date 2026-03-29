import { Client } from "@notionhq/client";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints/common";
import type { QueryDataSourceResponse } from "@notionhq/client/build/src/api-endpoints/data-sources";
import type { Song } from "@/types/song";

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
