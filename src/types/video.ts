export interface Video {
  id: string;
  title: string;
  thumbnailUrl: string;
  publishedAt: string;
  playlistName?: string;
  membersOnly: boolean;
}

export interface Playlist {
  id: string;
  title: string;
}
