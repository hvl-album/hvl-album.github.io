"use client";

import NextImage from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import type { UIEventHandler } from "react";
import type { DisplayMode, GalleryItem } from "./hvl-types";

function AppleMusicIcon() {
  const gradientId = useId();

  return (
    <svg aria-hidden="true" viewBox="0 0 361 361" fill="none">
      <defs>
        <linearGradient id={gradientId} x1="180" y1="358.6047" x2="180" y2="7.7586" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fa233b" />
          <stop offset="1" stopColor="#fb5c74" />
        </linearGradient>
      </defs>
      <rect width="361" height="361" rx="78" fill={`url(#${gradientId})`} />
      <path d="M254.5 55c-.87.08-8.6 1.45-9.53 1.64l-107 21.59-.04.01c-2.79.59-4.98 1.58-6.67 3-2.04 1.71-3.17 4.13-3.6 6.95-.09.6-.24 1.82-.24 3.62v133.92c0 3.13-.25 6.17-2.37 8.76-2.12 2.59-4.74 3.37-7.81 3.99-2.33.47-4.66.94-6.99 1.41-8.84 1.78-14.59 2.99-19.8 5.01-4.98 1.93-8.71 4.39-11.68 7.51-5.89 6.17-8.28 14.54-7.46 22.38.7 6.69 3.71 13.09 8.88 17.82 3.49 3.2 7.85 5.63 12.99 6.66 5.33 1.07 11.01.7 19.31-.98 4.42-.89 8.56-2.28 12.5-4.61 3.9-2.3 7.24-5.37 9.85-9.11 2.62-3.75 4.31-7.92 5.24-12.35.96-4.57 1.19-8.7 1.19-13.26V147.2c0-6.22 1.76-7.86 6.78-9.08l93.09-18.75c5.79-1.11 8.52.54 8.52 6.61v79.29c0 3.14-.03 6.32-2.17 8.92-2.12 2.59-4.74 3.37-7.81 3.99-2.33.47-4.66.94-6.99 1.41-8.84 1.78-14.59 2.99-19.8 5.01-4.98 1.93-8.71 4.39-11.68 7.51-5.89 6.17-8.49 14.54-7.67 22.38.7 6.69 3.92 13.09 9.09 17.82 3.49 3.2 7.85 5.56 12.99 6.6 5.33 1.07 11.01.69 19.31-.98 4.42-.89 8.56-2.22 12.5-4.55 3.9-2.3 7.24-5.37 9.85-9.11 2.62-3.75 4.31-7.92 5.24-12.35.96-4.57 1-8.7 1-13.26V64.46c0-6.16-3.25-9.96-9.04-9.46Z" fill="#fff" />
    </svg>
  );
}

export function HVLTrackList({
  items,
  onSelect,
  onScroll,
  displayMode,
  playingTrackIndex,
  onPlayClick,
  formatTime,
  getTrackLabel,
}: {
  items: readonly GalleryItem[];
  onSelect: (projectName: string, imageUrl: string, textureIndex: number) => void;
  onScroll: UIEventHandler<HTMLDivElement>;
  displayMode: DisplayMode;
  playingTrackIndex: number | null;
  onPlayClick: () => void;
  formatTime: (seconds: number) => string;
  getTrackLabel: (numberTrack: number) => string;
}) {
  const [activatingIndex, setActivatingIndex] = useState<number | null>(null);
  const activationTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (activationTimeoutRef.current != null) {
        window.clearTimeout(activationTimeoutRef.current);
      }
    };
  }, []);

  const handleSelect = (item: GalleryItem, index: number) => {
    if (activatingIndex != null) return;

    onPlayClick();
    setActivatingIndex(index);
    onSelect(item.title, item.imageUrl, index);
    activationTimeoutRef.current = window.setTimeout(() => {
      activationTimeoutRef.current = null;
      setActivatingIndex(null);
    }, 750);
  };

  return (
    <div
      className={`mobile-track-list ${displayMode === "pulled" ? "is-pulled-only" : ""}`}
      onScroll={onScroll}
    >
      {items.map((item, index) => (
        <button
          className={`mobile-track-list__item ${item.type === "stream" ? "has-platforms is-stream" : ""} ${activatingIndex === index ? "is-activating" : ""} ${playingTrackIndex === index ? "is-playing" : ""}`}
          key={`${item.title}-${index}`}
          type="button"
          disabled={displayMode === "pulled" && item.type === "stream"}
          onClick={() => {
            handleSelect(item, index);
          }}
        >
          <span className="mobile-track-list__cover-frame">
            <NextImage
              className="mobile-track-list__cover"
              src={item.imageUrl}
              alt=""
              width={80}
              height={80}
              sizes="80px"
            />
          </span>
          <span className="mobile-track-list__copy">
            <span className="mobile-track-list__meta">
              {getTrackLabel(item.numberTrack)}
              {item.type === "stream" ? (
                <>
                  <span>/</span>
                  <span className="mobile-track-list__stream-label">STREAM ON</span>
                  <span className="mobile-track-list__platforms" aria-hidden="true">
                    <span className="mobile-track-list__platform">
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M21.58 7.19a2.98 2.98 0 0 0-2.1-2.1C17.63 4.58 12 4.58 12 4.58s-5.63 0-7.48.51a2.98 2.98 0 0 0-2.1 2.1C1.91 9.04 1.91 12 1.91 12s0 2.96.51 4.81a2.98 2.98 0 0 0 2.1 2.1c1.85.51 7.48.51 7.48.51s5.63 0 7.48-.51a2.98 2.98 0 0 0 2.1-2.1c.51-1.85.51-4.81.51-4.81s0-2.96-.51-4.81Z" fill="#ff0000" />
                        <path d="m10 15.3 4.7-3.3L10 8.7v6.6Z" fill="#fff" />
                      </svg>
                    </span>
                    <span className="mobile-track-list__platform">
                      <svg viewBox="0 0 236.05 225.25" fill="none">
                        <path d="m122.37 3.31C61.99.91 11.1 47.91 8.71 108.29c-2.4 60.38 44.61 111.26 104.98 113.66 60.38 2.4 111.26-44.6 113.66-104.98C229.74 56.59 182.74 5.7 122.37 3.31Z" fill="#1ed760" />
                        <path d="M168.55 163.59c-1.36 2.4-4.01 3.6-6.59 3.24-.79-.11-1.58-.37-2.32-.79-14.46-8.23-30.22-13.59-46.84-15.93-16.62-2.34-33.25-1.53-49.42 2.4-3.51.85-7.04-1.3-7.89-4.81-.85-3.51 1.3-7.04 4.81-7.89 17.78-4.32 36.06-5.21 54.32-2.64 18.26 2.57 35.58 8.46 51.49 17.51 3.13 1.79 4.23 5.77 2.45 8.91Z" fill="#080808" />
                        <path d="M182.93 134.87c-2.23 4.12-7.39 5.66-11.51 3.43-16.92-9.15-35.24-15.16-54.45-17.86-19.21-2.7-38.47-1.97-57.26 2.16-1.02.22-2.03.26-3.01.12-3.41-.48-6.33-3.02-7.11-6.59-1.01-4.58 1.89-9.11 6.47-10.12 20.77-4.57 42.06-5.38 63.28-2.4 21.21 2.98 41.46 9.62 60.16 19.74 4.13 2.23 5.66 7.38 3.43 11.51Z" fill="#080808" />
                        <path d="M198.87 102.49c-2.1 4.04-6.47 6.13-10.73 5.53-1.15-.16-2.28-.52-3.37-1.08-19.7-10.25-40.92-17.02-63.07-20.13-22.15-3.11-44.42-2.45-66.18 1.97-5.66 1.15-11.17-2.51-12.32-8.16-1.15-5.66 2.51-11.17 8.16-12.32 24.1-4.89 48.74-5.62 73.25-2.18 24.51 3.44 47.99 10.94 69.81 22.29 5.12 2.66 7.11 8.97 4.45 14.09Z" fill="#080808" />
                      </svg>
                    </span>
                    <span className="mobile-track-list__platform">
                      <AppleMusicIcon />
                    </span>
                  </span>
                </>
              ) : item.durationSeconds != null ? (
                ` / ${formatTime(item.durationSeconds)}`
              ) : null}
            </span>
            <span className="mobile-track-list__title">{item.title}</span>
            <span className="mobile-track-list__artist">{item.subtitle}</span>
          </span>
          {playingTrackIndex === index && (
            <span className="mobile-track-list__playing-indicator" aria-label="Đang phát">
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
