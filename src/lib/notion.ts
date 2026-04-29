import { Client } from "@notionhq/client";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints/common";
import type { QueryDataSourceResponse } from "@notionhq/client/build/src/api-endpoints/data-sources";
import type { Song, SongDetail, NotionBlock } from "@/types/song";
import type { Playlist } from "@/types/video";
import type { BlogPost } from "@/types/blog";

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

const ARTIST_DB_ID = "2bd08b31-57db-49e4-b9b9-815199e93c20";

export interface Artist {
  id: string;
  name: string;
  country?: string;
  songCount: number;
  imageUrl?: string;
}

export async function fetchArtists(): Promise<Artist[]> {
  const artists: Artist[] = [];
  let cursor: string | undefined;

  do {
    const body: Record<string, unknown> = { page_size: 100 };
    if (cursor) body.start_cursor = cursor;

    const response = await notionPost(
      `databases/${ARTIST_DB_ID}/query`,
      body
    );

    for (const page of response.results ?? []) {
      if (!page.properties) continue;
      const props = page.properties;

      const nameProp = props["Name"];
      const name =
        nameProp?.type === "title"
          ? nameProp.title.map((t: { plain_text: string }) => t.plain_text).join("")
          : "";

      const countryProp = props["Country"];
      const country =
        countryProp?.type === "select" && countryProp.select
          ? countryProp.select.name
          : undefined;

      const songCountProp = props["曲数"];
      const songCount =
        songCountProp?.type === "rollup" && songCountProp.rollup?.number != null
          ? songCountProp.rollup.number
          : 0;

      // Cover image
      const cover = page.cover;
      let imageUrl: string | undefined;
      if (cover?.type === "external") imageUrl = cover.external.url;
      else if (cover?.type === "file") imageUrl = cover.file.url;

      if (name) {
        artists.push({
          id: page.id,
          name,
          country,
          songCount,
          imageUrl,
        });
      }
    }

    cursor = response.has_more && response.next_cursor
      ? response.next_cursor
      : undefined;
  } while (cursor);

  // Sort by song count desc, then name asc
  artists.sort((a, b) => b.songCount - a.songCount || a.name.localeCompare(b.name));

  return artists;
}

const ALBUM_DB_ID = "471aa704-6aa1-47cb-9d74-bcdfe8a15efc";

export interface Album {
  id: string;
  name: string;
  year?: number;
  songCount: number;
  coverUrl?: string;
}

export async function fetchAlbumsByArtistId(artistId: string): Promise<Album[]> {
  const albums: Album[] = [];
  let cursor: string | undefined;

  do {
    const body: Record<string, unknown> = {
      filter: {
        property: "Artist",
        relation: { contains: artistId },
      },
      page_size: 100,
    };
    if (cursor) body.start_cursor = cursor;

    const response = await notionPost(
      `databases/${ALBUM_DB_ID}/query`,
      body
    );

    for (const page of response.results ?? []) {
      if (!page.properties) continue;
      const props = page.properties;

      const nameProp = props["Album"];
      const name =
        nameProp?.type === "title"
          ? nameProp.title.map((t: { plain_text: string }) => t.plain_text).join("")
          : "";

      const yearProp = props["Year"];
      const year =
        yearProp?.type === "number" && yearProp.number !== null
          ? yearProp.number
          : undefined;

      const songsProp = props["Songs"];
      const songCount =
        songsProp?.type === "relation" ? songsProp.relation.length : 0;

      const cover = page.cover;
      let coverUrl: string | undefined;
      if (cover?.type === "external") coverUrl = cover.external.url;
      else if (cover?.type === "file") coverUrl = cover.file.url;

      if (name) {
        albums.push({ id: page.id, name, year, songCount, coverUrl });
      }
    }

    cursor = response.has_more && response.next_cursor
      ? response.next_cursor
      : undefined;
  } while (cursor);

  // Sort by year desc, then name asc
  albums.sort((a, b) => (b.year ?? 0) - (a.year ?? 0) || a.name.localeCompare(b.name));

  return albums;
}

export async function fetchSongsByAlbumId(albumId: string): Promise<Song[]> {
  const notion = getNotionClient();

  // Get song relation IDs from the album page
  const albumPage = await notion.pages.retrieve({ page_id: albumId });
  if (!("properties" in albumPage)) return [];
  const p = albumPage as PageObjectResponse;
  const songsProp = p.properties["Songs"];
  if (songsProp?.type !== "relation") return [];
  const songIds = songsProp.relation.map((r) => r.id);
  if (songIds.length === 0) return [];

  // Fetch each song page in parallel
  const songs = await Promise.all(
    songIds.map(async (id) => {
      try {
        const page = await notion.pages.retrieve({ page_id: id });
        if ("properties" in page) {
          return pageToSong(page as PageObjectResponse);
        }
        return null;
      } catch {
        return null;
      }
    })
  );

  return songs.filter((s): s is Song => s !== null);
}

export async function fetchSongsByArtistName(artistName: string): Promise<Song[]> {
  const notion = getNotionClient();
  const songs: Song[] = [];
  let cursor: string | undefined;

  do {
    const response: QueryDataSourceResponse = await notion.dataSources.query({
      data_source_id: DATA_SOURCE_ID,
      filter: {
        property: "Artist (text)",
        rich_text: { equals: artistName },
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

// ─── Novel Library DB ───

const NOVEL_LIBRARY_DB_ID = "ff0b12fd-a787-4160-a422-3a46cd4ec2b7";

export interface Novel {
  id: string;
  title: string;
  author: string;
  genre: string;
  themes: string[];
  difficulty: string;
  completed: boolean;
  synopsis: string;
  creativeMemo: string;
  lessonUsage: string;
  notionUrl: string;
}

function getNovelTitle(page: PageObjectResponse): string {
  const prop = page.properties["タイトル"];
  if (prop?.type === "title") {
    return prop.title.map((t) => t.plain_text).join("");
  }
  return "";
}

function pageToNovel(page: PageObjectResponse): Novel {
  return {
    id: page.id,
    title: getNovelTitle(page),
    author: getTextProperty(page, "著者"),
    genre: getSelectProperty(page, "ジャンル") ?? "",
    themes: getMultiSelectProperty(page, "テーマ"),
    difficulty: getSelectProperty(page, "文体・難易度") ?? "",
    completed: getCheckboxProperty(page, "✅ 読了"),
    synopsis: getTextProperty(page, "あらすじ"),
    creativeMemo: getTextProperty(page, "歌詞・創作メモ"),
    lessonUsage: getTextProperty(page, "レッスン活用"),
    notionUrl: page.url,
  };
}

export async function fetchNovels(): Promise<Novel[]> {
  const novels: Novel[] = [];
  let cursor: string | undefined;

  do {
    const body: Record<string, unknown> = { page_size: 100 };
    if (cursor) body.start_cursor = cursor;

    const response = await notionPost(
      `databases/${NOVEL_LIBRARY_DB_ID}/query`,
      body
    );

    for (const page of response.results ?? []) {
      if (!page.properties) continue;
      novels.push(pageToNovel(page as PageObjectResponse));
    }

    cursor = response.has_more && response.next_cursor
      ? response.next_cursor
      : undefined;
  } while (cursor);

  return novels;
}

// ─── English Library DB ───

const ENGLISH_LIBRARY_DB_ID = "1317277363c840ef9719944dafe4acd6";

export interface EnglishMaterial {
  id: string;
  title: string;
  categories: string[];
  level: string;
  formats: string[];
  language: string;
  publisher: string;
  inUse: boolean;
  summary: string;
  memo: string;
  driveUrl: string;
  notionUrl: string;
}

function getEnglishTitle(page: PageObjectResponse): string {
  const prop = page.properties["タイトル"];
  if (prop?.type === "title") {
    return prop.title.map((t) => t.plain_text).join("");
  }
  return "";
}

function pageToEnglishMaterial(page: PageObjectResponse): EnglishMaterial {
  return {
    id: page.id,
    title: getEnglishTitle(page),
    categories: getMultiSelectProperty(page, "カテゴリ"),
    level: getSelectProperty(page, "レベル") ?? "",
    formats: getMultiSelectProperty(page, "フォーマット"),
    language: getSelectProperty(page, "言語") ?? "",
    publisher: getSelectProperty(page, "出版社") ?? "",
    inUse: getCheckboxProperty(page, "✅ レッスン使用中"),
    summary: getTextProperty(page, "Gemini要約"),
    memo: getTextProperty(page, "メモ"),
    driveUrl: getUrlProperty(page, "Google Drive URL") ?? "",
    notionUrl: page.url,
  };
}

export async function fetchEnglishMaterials(): Promise<EnglishMaterial[]> {
  const materials: EnglishMaterial[] = [];
  let cursor: string | undefined;

  do {
    const body: Record<string, unknown> = { page_size: 100 };
    if (cursor) body.start_cursor = cursor;

    const response = await notionPost(
      `databases/${ENGLISH_LIBRARY_DB_ID}/query`,
      body
    );

    for (const page of response.results ?? []) {
      if (!page.properties) continue;
      materials.push(pageToEnglishMaterial(page as PageObjectResponse));
    }

    cursor = response.has_more && response.next_cursor
      ? response.next_cursor
      : undefined;
  } while (cursor);

  return materials;
}

// ─── Movie Library DB ───

const MOVIE_LIBRARY_DB_ID = "83041d3664f747bcb8ccc677da1ba20d";

export interface Movie {
  id: string;
  title: string;
  director: string;
  year: number | null;
  country: string;
  cast: string;
  genres: string[];
  rating: string;
  watched: boolean;
  originalTitle: string;
  synopsis: string;
  memo: string;
  lessonUsage: string;
  music: string;
  wikipediaUrl: string;
  notionUrl: string;
}

function getMovieTitle(page: PageObjectResponse): string {
  const prop = page.properties["タイトル"];
  if (prop?.type === "title") {
    return prop.title.map((t) => t.plain_text).join("");
  }
  return "";
}

function pageToMovie(page: PageObjectResponse): Movie {
  return {
    id: page.id,
    title: getMovieTitle(page),
    director: getTextProperty(page, "監督"),
    year: getNumberProperty(page, "公開年") ?? null,
    country: getTextProperty(page, "製作国"),
    cast: getTextProperty(page, "主要キャスト"),
    genres: getMultiSelectProperty(page, "ジャンル"),
    rating: getSelectProperty(page, "⭐ 評価") ?? "",
    watched: getCheckboxProperty(page, "✅ 鑑賞済み"),
    originalTitle: getTextProperty(page, "原題"),
    synopsis: getTextProperty(page, "あらすじ"),
    memo: getTextProperty(page, "個人メモ"),
    lessonUsage: getTextProperty(page, "レッスン活用"),
    music: getTextProperty(page, "音楽"),
    wikipediaUrl: getUrlProperty(page, "Wikipedia URL") ?? "",
    notionUrl: page.url,
  };
}

// ─── Blog DB ───

const BLOG_DATA_SOURCE_ID =
  process.env.NOTION_BLOG_DATA_SOURCE_ID ??
  "ed7ebb1a-e632-4985-b2ca-13ab5957125b";

function getDateProperty(
  page: PageObjectResponse,
  name: string
): string | undefined {
  const prop = page.properties[name];
  if (prop?.type === "date" && prop.date) {
    return prop.date.start;
  }
  return undefined;
}

function getFilesUrl(
  page: PageObjectResponse,
  name: string
): string | undefined {
  const prop = page.properties[name];
  if (prop?.type !== "files" || prop.files.length === 0) return undefined;
  const f = prop.files[0];
  if (f.type === "external") return f.external.url;
  if (f.type === "file") return f.file.url;
  return undefined;
}

function getBlogTitle(page: PageObjectResponse): string {
  const prop = page.properties["タイトル"];
  if (prop?.type === "title") {
    return prop.title.map((t) => t.plain_text).join("");
  }
  return "";
}

function pageToBlogPost(page: PageObjectResponse): BlogPost {
  return {
    id: page.id,
    title: getBlogTitle(page),
    slug: getTextProperty(page, "slug"),
    category: getSelectProperty(page, "カテゴリ"),
    series: getSelectProperty(page, "シリーズ"),
    publishedAt: getDateProperty(page, "公開日"),
    summary: getTextProperty(page, "要約") || undefined,
    charCount: getNumberProperty(page, "文字数"),
    coverImage: getFilesUrl(page, "アイキャッチ画像") ?? getCoverUrl(page),
    tags: getMultiSelectProperty(page, "タグ"),
  };
}

function buildBlogPublicFilter() {
  return {
    and: [
      {
        property: "ステータス",
        status: { equals: "完了" },
      },
      {
        or: [
          {
            property: "公開先",
            multi_select: { contains: "my-clone" },
          },
          {
            property: "公開先",
            multi_select: { contains: "両方" },
          },
        ],
      },
    ],
  };
}

export async function fetchBlogPosts(): Promise<BlogPost[]> {
  const notion = getNotionClient();
  const posts: BlogPost[] = [];
  let cursor: string | undefined;

  do {
    const response: QueryDataSourceResponse = await notion.dataSources.query({
      data_source_id: BLOG_DATA_SOURCE_ID,
      filter: buildBlogPublicFilter(),
      sorts: [{ property: "公開日", direction: "descending" }],
      start_cursor: cursor,
      page_size: 100,
    });

    for (const page of response.results) {
      if ("properties" in page) {
        const post = pageToBlogPost(page as PageObjectResponse);
        if (post.slug) posts.push(post);
      }
    }

    cursor = response.has_more
      ? (response.next_cursor ?? undefined)
      : undefined;
  } while (cursor);

  return posts;
}

export async function fetchBlogPostBySlug(
  slug: string
): Promise<BlogPost | null> {
  const notion = getNotionClient();
  const response: QueryDataSourceResponse = await notion.dataSources.query({
    data_source_id: BLOG_DATA_SOURCE_ID,
    filter: {
      and: [
        { property: "slug", rich_text: { equals: slug } },
        { property: "ステータス", status: { equals: "完了" } },
        {
          or: [
            { property: "公開先", multi_select: { contains: "my-clone" } },
            { property: "公開先", multi_select: { contains: "両方" } },
          ],
        },
      ],
    },
    page_size: 1,
  });

  const page = response.results[0];
  if (page && "properties" in page) {
    return pageToBlogPost(page as PageObjectResponse);
  }
  return null;
}

export const fetchBlogBlocks = fetchSongBlocks;

export async function fetchMovies(): Promise<Movie[]> {
  const movies: Movie[] = [];
  let cursor: string | undefined;

  do {
    const body: Record<string, unknown> = { page_size: 100 };
    if (cursor) body.start_cursor = cursor;

    const response = await notionPost(
      `databases/${MOVIE_LIBRARY_DB_ID}/query`,
      body
    );

    for (const page of response.results ?? []) {
      if (!page.properties) continue;
      movies.push(pageToMovie(page as PageObjectResponse));
    }

    cursor = response.has_more && response.next_cursor
      ? response.next_cursor
      : undefined;
  } while (cursor);

  return movies;
}
