"use client";

import NextImage from "next/image";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00";
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}

export function HVLDock(props: Record<string, unknown>) {
  const {
    selectedProject,
    isDetailMinimized,
    isDockVisible,
    isDockHidingForDetail,
    selectedTrack,
    isFloatingPlayerExpanded,
    isDockPinned,
    isMobile,
    isStreaming,
    handleFloatingPlayerMouseEnter,
    handleFloatingPlayerMouseLeave,
    repeatToastMessage,
    repeatToastPlacement,
    dockPlaybackProgress,
    handleRestoreProject,
    getTrackLabel,
    dockCurrentTime,
    dockDuration,
    isPlaying,
    repeatMode,
    isRepeatAnimating,
    handleRepeatModeToggle,
    RepeatIcon,
    repeatAnimationNonce,
    isDockPlaying,
    handleDockPlayPauseButtonClick,
    isAutoNextEnabled,
    autoNextRemaining,
    handlePlayPauseButtonClick,
    previousTrackResult,
    handlePreviousTrack,
    nextTrackResult,
    handleNextButtonClick,
    isSeeking,
    handleProgressPointerDown,
    handleProgressPointerMove,
    finishProgressSeek,
    cancelProgressSeek,
    StreamingPlatformLinks,
  } = props as any;
  const isStreamTrack = selectedTrack?.type === "stream";

  return (
    <>
{selectedProject && isDockVisible && selectedTrack && (
        <div
          className={`floating-player-dock ${isDockHidingForDetail || !(isFloatingPlayerExpanded || isDockPinned || (!isMobile && isStreaming)) ? "is-collapsed" : "is-expanded"}`}
          onMouseEnter={!isMobile ? handleFloatingPlayerMouseEnter : undefined}
          onMouseLeave={!isMobile ? handleFloatingPlayerMouseLeave : undefined}
        >
          <section
            className={`floating-player ${isStreaming ? "is-streaming" : ""} ${isStreamTrack ? "is-stream-track" : ""}`}
            aria-label={`Trình phát ${selectedTrack.title}`}
            onClick={handleRestoreProject}
          >
          {repeatToastMessage && repeatToastPlacement === "dock" && (
            <div className="floating-player__repeat-toast" role="status" aria-live="polite">
              {repeatToastMessage}
            </div>
          )}
          <span className={`floating-player__mobile-progress ${isStreaming ? "is-streaming" : ""}`} aria-hidden="true">
            <span style={{ width: `${dockPlaybackProgress}%` }} />
          </span>
          <div className="floating-player__layout">
            <div
              className="floating-player__track"
              onClick={(event) => {
                event.stopPropagation();
                handleRestoreProject();
              }}
            >
              <span className={`floating-player__art ${!isStreaming && isPlaying ? "is-playing" : ""}`}>
                <NextImage
                  src={selectedTrack.imageUrl}
                  alt=""
                  width={64}
                  height={64}
                  sizes="64px"
                  unoptimized
                />
              </span>
              <span className="floating-player__copy">
                <span className="floating-player__track-label">
                  {getTrackLabel(selectedTrack.numberTrack)}
                  {!isStreaming && (
                    <span className="floating-player__mobile-track-time">
                      {" / "}{formatTime(dockCurrentTime)} - {formatTime(dockDuration)}
                    </span>
                  )}
                </span>
                <span className="floating-player__next-copy">
                  <span className="floating-player__next-title">{selectedTrack.title}</span>
                  <span className="floating-player__next-artist">{selectedTrack.subtitle}</span>
                </span>
              </span>
            </div>

            <div
              key={isStreaming ? "streaming" : "pulled"}
              className={`floating-player__mobile-actions ${isStreaming ? "is-streaming" : ""} ${isStreamTrack ? "is-stream-track" : ""}`}
              onClick={(event) => event.stopPropagation()}
            >
              {!isStreamTrack && (
                <button
                  className={`floating-player__repeat is-${repeatMode} ${isRepeatAnimating ? "is-animating" : ""}`}
                  type="button"
                  onClick={() => handleRepeatModeToggle("dock")}
                  aria-label={
                    repeatMode === "off"
                      ? "Bật phát lại album"
                      : repeatMode === "all"
                        ? "Bật phát lại một bài"
                        : "Tắt phát lại"
                  }
                >
                  <RepeatIcon isAll={repeatMode === "one"} isOne={repeatMode === "all"} animationNonce={repeatAnimationNonce} />
                </button>
              )}
              {isStreamTrack && (
                <StreamingPlatformLinks
                  className="floating-player__platforms"
                  linkClassName="floating-player__platform-link"
                />
              )}
              {isStreaming ? (
                <button
                  className={`floating-player__play ${isDockPlaying ? "is-playing" : "is-paused"}`}
                  type="button"
                  onClick={handleDockPlayPauseButtonClick}
                  aria-label={isDockPlaying ? "Tạm dừng" : "Phát"}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    {isDockPlaying ? (
                      <>
                        <path d="M7 5.5h3.5v13H7z" />
                        <path d="M13.5 5.5H17v13h-3.5z" />
                      </>
                    ) : (
                      <path d="M7 4.75 18 12 7 19.25z" />
                    )}
                  </svg>
                </button>
              ) : isAutoNextEnabled ? (
                <time
                  className="floating-player__countdown"
                  aria-label={`Tự chuyển bài sau ${autoNextRemaining} giây`}
                >
                  {autoNextRemaining}s
                </time>
              ) : (
                <button
                  className={`floating-player__play ${isPlaying ? "is-playing" : "is-paused"}`}
                  type="button"
                  onClick={handlePlayPauseButtonClick}
                  disabled={!selectedTrack.audioUrl}
                  aria-label={isPlaying ? "Tạm dừng" : "Phát"}
                >
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    fill="currentColor"
                  >
                    {isPlaying ? (
                      <>
                        <path d="M7 5.5h3.5v13H7z" />
                        <path d="M13.5 5.5H17v13h-3.5z" />
                      </>
                    ) : (
                      <path d="M7 4.75 18 12 7 19.25z" />
                    )}
                  </svg>
                </button>
              )}
            </div>

            <div
              className="floating-player__controls"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="floating-player__transport">
                <button className="floating-player__navigation-button" type="button" onClick={() => handlePreviousTrack()} aria-label="Previous track">
                  {previousTrackResult && (
                    <span className="floating-player__navigation-preview" aria-hidden="true">
                      <span className="floating-player__navigation-preview-title">{previousTrackResult.track.title}</span>
                      <span className="floating-player__navigation-preview-artist">{previousTrackResult.track.subtitle}</span>
                    </span>
                  )}
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="m19 5.5-9.5 6.5 9.5 6.5z" />
                    <path d="M4.5 5.5H7v13H4.5z" />
                  </svg>
                </button>
                {isStreaming ? (
                  <button
                    className={`floating-player__play ${isDockPlaying ? "is-playing" : "is-paused"}`}
                    type="button"
                    onClick={handleDockPlayPauseButtonClick}
                    aria-label={isDockPlaying ? "Tạm dừng" : "Phát"}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      {isDockPlaying ? (
                        <>
                          <path d="M7 5.5h3.5v13H7z" />
                          <path d="M13.5 5.5H17v13h-3.5z" />
                        </>
                      ) : (
                        <path d="M7 4.75 18 12 7 19.25z" />
                      )}
                    </svg>
                  </button>
                ) : isAutoNextEnabled ? (
                  <time
                    className="floating-player__countdown"
                    aria-label={`Tự chuyển bài sau ${autoNextRemaining} giây`}
                  >
                    {autoNextRemaining}s
                  </time>
                ) : (
                  <button
                    className={`floating-player__play ${isPlaying ? "is-playing" : "is-paused"}`}
                    type="button"
                    onClick={handlePlayPauseButtonClick}
                    disabled={!selectedTrack.audioUrl}
                    aria-label={isPlaying ? "Tạm dừng" : "Phát"}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      {isPlaying ? (
                        <>
                          <path d="M7 5.5h3.5v13H7z" />
                          <path d="M13.5 5.5H17v13h-3.5z" />
                        </>
                      ) : (
                        <path d="M7 4.75 18 12 7 19.25z" />
                      )}
                    </svg>
                  </button>
                )}
                <button className="floating-player__navigation-button" type="button" onClick={() => handleNextButtonClick("minimized")} aria-label="Next track">
                  {nextTrackResult && (
                    <span className="floating-player__navigation-preview" aria-hidden="true">
                      <span className="floating-player__navigation-preview-title">{nextTrackResult.track.title}</span>
                      <span className="floating-player__navigation-preview-artist">{nextTrackResult.track.subtitle}</span>
                    </span>
                  )}
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="m5 5.5 9.5 6.5L5 18.5z" />
                    <path d="M16.5 5.5H19v13h-2.5z" />
                  </svg>
                </button>
              </div>

              <div className="floating-player__progress-row">
                  <time>{formatTime(dockCurrentTime)}</time>
                  <div
                    className={`floating-player__progress ${isSeeking && !isStreaming ? "is-seeking" : ""} ${isStreaming ? "is-streaming" : ""}`}
                    role="slider"
                    aria-label="Tiến trình bài hát"
                    aria-valuemin={0}
                    aria-valuemax={dockDuration}
                    aria-valuenow={dockCurrentTime}
                    aria-disabled={isStreaming || !selectedTrack.audioUrl}
                    onPointerDown={isStreaming ? undefined : handleProgressPointerDown}
                    onPointerMove={isStreaming ? undefined : handleProgressPointerMove}
                    onPointerUp={isStreaming ? undefined : finishProgressSeek}
                    onPointerCancel={isStreaming ? undefined : cancelProgressSeek}
                  >
                    <span style={{ width: `${dockPlaybackProgress}%` }} />
                  </div>
                  <time>{formatTime(dockDuration)}</time>
              </div>
            </div>

            <div
              className="floating-player__side-controls"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => event.stopPropagation()}
            >
              {isStreamTrack && (
                <StreamingPlatformLinks
                  className="floating-player__desktop-platforms"
                  linkClassName="floating-player__platform-link"
                />
              )}
              {!isStreamTrack && (
                <button
                  className={`floating-player__repeat is-${repeatMode} ${isRepeatAnimating ? "is-animating" : ""}`}
                  type="button"
                  onClick={() => handleRepeatModeToggle("dock")}
                  aria-label={
                    repeatMode === "off"
                      ? "Bật phát lại album"
                      : repeatMode === "all"
                        ? "Bật phát lại một bài"
                        : "Tắt phát lại"
                  }
                >
                  <RepeatIcon isAll={repeatMode === "one"} isOne={repeatMode === "all"} animationNonce={repeatAnimationNonce} />
                </button>
              )}
              <button
                className="floating-player__open-detail"
                type="button"
                onClick={handleRestoreProject}
                onPointerDown={(event) => event.stopPropagation()}
                aria-label="Mở chi tiết bài hát"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" fill="none">
                  <g transform="translate(24 0) scale(-1 1)">
                    <path d="M21 9V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10c0 1.1.9 2 2 2h4" />
                    <rect width="10" height="7" x="12" y="13" rx="2" />
                  </g>
                </svg>
              </button>
            </div>
          </div>
          </section>
        </div>
      )}
    </>
  );
}
