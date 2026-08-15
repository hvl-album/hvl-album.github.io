export type GalleryItemType = "stream" | "pulled";
export type DisplayMode = "full" | "pulled";
export type DisplayStyle = "museum" | "list" | "art";
export type RepeatMode = "off" | "one" | "all";
export type TrackPresentation = "detail" | "minimized";
export type StreamDisplayDelay = 5 | 10 | 15;

export type SongAnnotation = {
  lyric: string;
  seekLabels: readonly string[];
  startTime: number;
  explanation: string;
};

export type ArtistHighlight = {
  artist: string | readonly string[];
  startTime: number;
  endTime: number;
};

export type GalleryItem = {
  numberTrack: number;
  durationSeconds: number | null;
  title: string;
  subtitle: string;
  imageUrl: string;
  pMobileBackground: string;
  bMobileBackground: number;
  audioUrl: string;
  videoUrl?: string;
  type: GalleryItemType;
  lyrics?: string;
  lyricsTimestamps?: readonly number[];
  songAnnotations?: readonly SongAnnotation[];
  artistHighlights?: readonly ArtistHighlight[];
};
