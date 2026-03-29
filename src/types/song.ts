export interface Song {
  id: string;
  title: string;
  artist: string;
  genre: string;
  key?: string;
  bpm?: number;
  artworkUrl?: string;
}
