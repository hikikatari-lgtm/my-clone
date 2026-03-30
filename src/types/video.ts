export interface Video {
  id: string;
  title: string;
  thumbnailUrl: string;
  publishedAt: string;
  playlistName?: string;
  membersOnly: boolean;
  isShort: boolean;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoCount: number;
}

export interface VideosPage {
  videos: Video[];
  nextPageToken?: string;
  playlists: Playlist[];
}
