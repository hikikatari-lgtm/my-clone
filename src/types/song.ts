export interface Song {
  id: string;
  title: string;
  artist: string;
  genre: string;
  key?: string;
  bpm?: number;
  artworkUrl?: string;
}

export interface SongDetail extends Song {
  chordProgression: string[];
  romanNumeral?: string;
  era?: string;
  confirmed: boolean;
  aiSummary?: string;
  difficulty?: string;
  tags: string[];
  artistRelation?: {
    id: string;
    name: string;
  };
}

// Notion block types for rendering
export interface NotionRichText {
  plain_text: string;
  href: string | null;
  annotations: {
    bold: boolean;
    italic: boolean;
    strikethrough: boolean;
    underline: boolean;
    code: boolean;
    color: string;
  };
}

export interface NotionBlock {
  id: string;
  type: string;
  has_children: boolean;
  paragraph?: { rich_text: NotionRichText[]; color: string };
  heading_2?: { rich_text: NotionRichText[]; color: string };
  heading_3?: { rich_text: NotionRichText[]; color: string };
  bulleted_list_item?: { rich_text: NotionRichText[]; color: string };
  numbered_list_item?: { rich_text: NotionRichText[]; color: string };
  table?: { has_column_header: boolean; has_row_header: boolean; table_width: number };
  table_row?: { cells: NotionRichText[][] };
  image?: {
    type: string;
    file?: { url: string; expiry_time: string };
    external?: { url: string };
    caption: NotionRichText[];
  };
  video?: {
    type: string;
    external?: { url: string };
  };
  audio?: {
    type: string;
    file?: { url: string; expiry_time: string };
    external?: { url: string };
  };
  column_list?: Record<string, never>;
  column?: Record<string, never>;
  divider?: Record<string, never>;
  callout?: { rich_text: NotionRichText[]; icon?: { emoji?: string }; color: string };
  quote?: { rich_text: NotionRichText[]; color: string };
  toggle?: { rich_text: NotionRichText[]; color: string };
  children?: NotionBlock[];
}
