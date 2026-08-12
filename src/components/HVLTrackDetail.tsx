"use client";

import NextImage from "next/image";

type LyricsEntry = { text: string; startTime: number | null };

export function HVLTrackDetail(props: Record<string, unknown>) {
  const {
    selectedProject,
    showOverlay,
    isDetailMinimized,
    isLyricsOpen,
    areDetailButtonsVisible,
    isMobile,
    selectedTrack,
    resetDetailButtonsVisibility,
    repeatToastMessage,
    repeatToastPlacement,
    handleMinimizeProject,
    handleSettingsOpen,
    playClickSound,
    resetLyricsAutoScrollPause,
    setIsLyricsOpen,
    ListXIcon,
    ListMusicIcon,
    detailPreviewTrack,
    areNextControlsVisible,
    detailNavigationPreview,
    getTrackLabel,
    formatTime,
    detailCurrentTime,
    detailDuration,
    isSeeking,
    isStreaming,
    handleProgressPointerDown,
    handleProgressPointerMove,
    finishProgressSeek,
    cancelProgressSeek,
    detailPlaybackProgress,
    StreamingPlatformLinks,
    repeatMode,
    isRepeatAnimating,
    handleRepeatModeToggle,
    RepeatIcon,
    repeatAnimationNonce,
    isDetailPlaying,
    handlePreviousTrack,
    setDetailNavigationPreview,
    handleDetailPlayPauseButtonClick,
    handleNextButtonClick,
    handleLyricsClose,
    lyricsBodyRef,
    handleLyricsScroll,
    pauseLyricsAutoScroll,
    lyricsEntries,
    currentTime,
    activeLyricsLineIndex,
    handleLyricsLineClick,
    handleLyricsLineKeyDown,
    renderLyricsLine,
  } = props as any;

  return (
    <>
{selectedProject && (
        <div
          className={`project-single-view ${showOverlay ? "visible" : "hidden"} ${isDetailMinimized ? "is-minimized" : ""} ${isLyricsOpen ? "is-lyrics-open" : ""} ${areDetailButtonsVisible ? "" : "is-buttons-hidden"} ${!isMobile && (selectedTrack?.numberTrack === 8 || selectedTrack?.numberTrack === 27 || selectedTrack?.numberTrack === 28) ? "is-dark-track" : ""}`}
          onMouseMove={isMobile ? undefined : resetDetailButtonsVisibility}
        >
          {repeatToastMessage && repeatToastPlacement === "detail" && (
            <div className="project-single-view__repeat-toast" role="status" aria-live="polite">
              {repeatToastMessage}
            </div>
          )}
          <div
            className="project-single-background"
            style={{
              backgroundImage: `url(${selectedProject.imageUrl})`,
              backgroundPosition: isMobile ? selectedTrack?.pMobileBackground ?? "center" : "center",
            }}
            aria-hidden="true"
          />
          <button
            className="collapse-button"
            type="button"
            onClick={handleMinimizeProject}
            aria-label="Thu nhỏ trình phát"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M21 9V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10c0 1.1.9 2 2 2h4" />
              <rect width="10" height="7" x="12" y="13" rx="2" />
            </svg>
          </button>
          <button
            className="detail-settings-button"
            type="button"
            onClick={handleSettingsOpen}
            onPointerDown={(event) => event.stopPropagation()}
            aria-label="Cài Đặt"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none">
              <path d="M21 4h-7" />
              <path d="M10 4H3" />
              <path d="M21 12h-9" />
              <path d="M8 12H3" />
              <path d="M21 20h-5" />
              <path d="M12 20H3" />
              <path d="M14 2v4" />
              <path d="M8 10v4" />
              <path d="M16 18v4" />
            </svg>
          </button>
          {!isDetailMinimized && (!isMobile || !isLyricsOpen) && (
            <button
              className="detail-lyrics-button"
              type="button"
              onClick={() => {
                playClickSound();
                resetLyricsAutoScrollPause();
                setIsLyricsOpen((isOpen: boolean) => !isOpen);
              }}
              aria-label={isLyricsOpen ? "Đóng lời bài hát" : "Mở lời bài hát"}
            >
              {isLyricsOpen ? <ListXIcon /> : <ListMusicIcon />}
            </button>
          )}
          <div className="project-content">
            <NextImage
              src={selectedProject.imageUrl}
              alt={selectedProject.name}
              width={516}
              height={516}
              sizes="(max-width: 516px) calc(100vw - 48px), 516px"
              unoptimized
              style={{
                objectPosition: isMobile ? selectedTrack?.pMobileBackground ?? "center" : "center",
              }}
            />
          </div>
          {selectedTrack && !isDetailMinimized && (
            <section
              className={`project-player ${isStreaming ? "is-streaming" : ""} ${areNextControlsVisible ? "is-next-controls-visible" : ""}`}
              aria-label={`Trình phát ${selectedTrack.title}`}
            >
              <div className="project-player__track">
                <span className="project-player__track-number">{getTrackLabel(selectedTrack.numberTrack)}</span>
                <span className="project-player__title">{selectedTrack.title}</span>
                <span className="project-player__artist">{selectedTrack.subtitle}</span>
              </div>
              {detailPreviewTrack && !isMobile && (
                <div
                  className={`project-player__up-next ${areNextControlsVisible ? "is-visible" : ""} ${detailNavigationPreview === "previous" ? "is-previous" : "is-next"}`}
                  aria-hidden={!areNextControlsVisible}
                >
                  <span className="project-player__up-next-title">{detailPreviewTrack.title}</span>
                  <span className="project-player__up-next-artist">{detailPreviewTrack.subtitle}</span>
                </div>
              )}
              <div className="project-player__controls">
                <div className="project-player__progress-line">
                  <time className="project-player__time">{formatTime(detailCurrentTime)}</time>
                  <div
                    className={`project-player__progress ${isSeeking && !isStreaming ? "is-seeking" : ""} ${isStreaming ? "is-streaming" : ""}`}
                    role="slider"
                    aria-label="Tiến trình bài hát"
                    aria-valuemin={0}
                    aria-valuemax={detailDuration}
                    aria-valuenow={detailCurrentTime}
                    aria-disabled={isStreaming || !selectedTrack.audioUrl}
                    onPointerDown={isStreaming ? undefined : handleProgressPointerDown}
                    onPointerMove={isStreaming ? undefined : handleProgressPointerMove}
                    onPointerUp={isStreaming ? undefined : finishProgressSeek}
                    onPointerCancel={isStreaming ? undefined : cancelProgressSeek}
                  >
                    <span style={{ width: `${detailPlaybackProgress}%` }} />
                  </div>
                  <div className="project-player__duration">
                    {isStreaming ? (
                      <div className="detail-stream-platforms" aria-label="Nghe trên nền tảng khác">
                        <span className="detail-stream-platforms__label">STREAM ON</span>
                        <StreamingPlatformLinks
                          className="detail-stream-platforms__items"
                          linkClassName="detail-stream-platform-link"
                        />
                      </div>
                    ) : (
                      <button
                        className={`project-player__repeat is-${repeatMode} ${isRepeatAnimating ? "is-animating" : ""}`}
                        type="button"
                        onClick={() => handleRepeatModeToggle("detail")}
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
                    <time className="project-player__time" aria-label="Tổng thời lượng">
                      {formatTime(detailDuration)}
                    </time>
                  </div>
                </div>

                <div className="project-player__transport">
                    <button
                      className="project-player__previous"
                      type="button"
                      onClick={() => handlePreviousTrack("detail")}
                      onMouseEnter={() => {
                        if (!isMobile) setDetailNavigationPreview("previous");
                      }}
                      onMouseLeave={() => {
                        if (!isMobile) setDetailNavigationPreview(null);
                      }}
                      aria-label="Bài trước"
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="m19 5.5-9.5 6.5 9.5 6.5z" />
                        <path d="M4.5 5.5H7v13H4.5z" />
                      </svg>
                    </button>
                    <button
                      className={`project-player__toggle ${isDetailPlaying ? "is-playing" : "is-paused"}`}
                      type="button"
                      onClick={handleDetailPlayPauseButtonClick}
                      disabled={!isStreaming && !selectedTrack.audioUrl}
                      aria-label={isDetailPlaying ? "Tạm dừng" : "Phát"}
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        {isDetailPlaying ? (
                          <>
                            <path d="M7 5.5h3.5v13H7z" />
                            <path d="M13.5 5.5H17v13h-3.5z" />
                          </>
                        ) : (
                          <path d="M7 4.75 18 12 7 19.25z" />
                        )}
                      </svg>
                    </button>
                    <div className="project-player__next-actions">
                      <button
                        className="project-player__next"
                        type="button"
                        onClick={() => handleNextButtonClick()}
                        onMouseEnter={() => {
                          if (!isMobile) setDetailNavigationPreview("next");
                        }}
                        onMouseLeave={() => {
                          if (!isMobile) setDetailNavigationPreview(null);
                        }}
                        aria-label="Next track"
                      >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="m5 5.5 9.5 6.5L5 18.5z" />
                          <path d="M16.5 5.5H19v13h-2.5z" />
                        </svg>
                      </button>
                    </div>
                </div>
              </div>
            </section>
          )}
        </div>
      )}

      {selectedProject && showOverlay && !isDetailMinimized && (
          <div className={`lyrics-panel__desktop-backdrop ${isLyricsOpen ? "is-open" : ""}`}>
          <aside
            className={`lyrics-panel ${isLyricsOpen ? "is-open" : ""}`}
            aria-label="Lời bài hát"
          >
            <button className="lyrics-panel__close" type="button" onClick={handleLyricsClose} aria-label="Đóng Lời Bài Hát">
              <svg className="lyrics-panel__close-chevron" viewBox="0 0 24 24" aria-hidden="true">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
          <div
            className="lyrics-panel__body"
            ref={lyricsBodyRef}
            onScroll={handleLyricsScroll}
            onWheel={pauseLyricsAutoScroll}
            onTouchStart={pauseLyricsAutoScroll}
            onTouchMove={pauseLyricsAutoScroll}
            onKeyDown={(event) => {
              if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) {
                pauseLyricsAutoScroll();
              }
            }}
          >
            {selectedTrack?.lyrics ? lyricsEntries.map((entry: LyricsEntry, index: number) => (
              entry.text === "" ? (
                <div className="lyrics-panel__separator" key={`${index}-${entry.text}`} aria-hidden="true" />
              ) : (
                <div
                  className={`lyrics-panel__line ${entry.startTime != null ? "is-seekable" : ""} ${entry.startTime != null && currentTime >= entry.startTime ? "is-passed" : ""} ${index === activeLyricsLineIndex ? "is-active" : ""}`}
                  key={`${index}-${entry.text}`}
                  data-lyrics-index={index}
                  onClick={() => handleLyricsLineClick(entry.startTime)}
                  onKeyDown={(event) => handleLyricsLineKeyDown(event, entry.startTime)}
                  role={entry.startTime != null ? "button" : undefined}
                  tabIndex={entry.startTime != null ? 0 : -1}
                >
                  {renderLyricsLine(entry.text)}
                </div>
              )
            )) : (
              <div className="lyrics-panel__empty">Lyrics đang cập nhật ...</div>
            )}
          </div>
          </aside>
          </div>
      )}
    </>
  );
}
