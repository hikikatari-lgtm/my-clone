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
  artistRelation?: {
    id: string;
    name: string;
  };
}
