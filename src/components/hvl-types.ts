export type GalleryItemType = "stream" | "pulled";
export type DisplayMode = "full" | "pulled";
export type DisplayStyle = "museum" | "list";
export type RepeatMode = "off" | "one" | "all";
export type TrackPresentation = "detail" | "minimized";
export type StreamDisplayDelay = 5 | 10 | 15;

export type GalleryItem = {
  numberTrack: number;
  durationSeconds: number | null;
  title: string;
  subtitle: string;
  imageUrl: string;
  pMobileBackground: string;
  bMobileBackground: number;
  audioUrl: string;
  type: GalleryItemType;
  lyrics?: string;
  lyricsTimestamps?: readonly number[];
};
