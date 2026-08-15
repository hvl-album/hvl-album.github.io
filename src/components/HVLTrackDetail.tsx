"use client";

import NextImage from "next/image";

type LyricsEntry = { text: string; startTime: number | null };
type SongAnnotationEntry = {
  lyric: string;
  seekLabels: readonly string[];
  startTime: number;
  explanation: string;
};

function escapeRegularExpression(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function renderSongAnnotationLyric(entry: SongAnnotationEntry, onSeek: (startTime: number) => void) {
  const seekLabels = [...entry.seekLabels].sort((left, right) => right.length - left.length);
  const seekLabelExpression = new RegExp(`(${seekLabels.map(escapeRegularExpression).join("|")})`, "g");
  const remainingSeekLabels = new Set(seekLabels);

  return entry.lyric.split(seekLabelExpression).map((part, index) => {
    const isSeekLabel = remainingSeekLabels.has(part);
    if (isSeekLabel) remainingSeekLabels.delete(part);

    return isSeekLabel ? (
      <button
        className="song-annotation-panel__seek"
        type="button"
        key={`${index}-${part}`}
        onClick={() => onSeek(entry.startTime)}
        aria-label={`Tua đến lời ${part}`}
      >
        {part}
      </button>
    ) : part;
  });
}

function renderSongAnnotationExplanation(explanation: string) {
  return explanation.split(/(\*\*[^*]+\*\*)/g).map((part, index) => (
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={`${index}-${part}`}>{part.slice(2, -2)}</strong>
    ) : part
  ));
}

function renderArtistNames(subtitle: string, activeArtists: readonly string[]) {
  if (activeArtists.length === 0) return subtitle;

  const artistExpression = activeArtists.map(escapeRegularExpression).join("|");
  return subtitle.split(new RegExp(`(${artistExpression})`, "g")).map((part, index) => (
    activeArtists.includes(part) ? (
      <span className="project-player__artist-name is-performing" key={`${part}-${index}`}>
        {part}
      </span>
    ) : part
  ));
}

export function HVLTrackDetail(props: Record<string, unknown>) {
  const {
    selectedProject,
    showOverlay,
    isDetailMinimized,
    isDetailMinimizing,
    isLyricsOpen,
    isLyricsClosing,
    isSongAnnotationOpen,
    isSongAnnotationClosing,
    areDetailButtonsVisible,
    isMobile,
    selectedTrack,
    isTrackVideoActive,
    handleTrackVideoToggle,
    resetDetailButtonsVisibility,
    repeatToastMessage,
    repeatToastPlacement,
    handleMinimizeProject,
    handleMobileDetailBlankPointerUp,
    handleSettingsOpen,
    handleLyricsToggle,
    handleSongAnnotationToggle,
    handleDownloadOpen,
    ListXIcon,
    ListMusicIcon,
    RouteIcon,
    RouteOffIcon,
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
    handleSongAnnotationClose,
    handleWebFullscreenToggle,
    isWebFullscreen,
    lyricsBodyRef,
    songAnnotationBodyRef,
    handleLyricsScroll,
    pauseLyricsAutoScroll,
    lyricsEntries,
    currentTime,
    activeLyricsLineIndex,
    handleLyricsLineClick,
    handleLyricsLineKeyDown,
    renderLyricsLine,
    songAnnotations,
    activeArtists,
  } = props as any;
  const isStreamTrack = selectedTrack?.type === "stream";
  const isLyricsPanelVisible = isLyricsOpen || isLyricsClosing;
  const isSongAnnotationPanelVisible = isSongAnnotationOpen || isSongAnnotationClosing;
  const shouldSplitSidePanels = isLyricsPanelVisible && isSongAnnotationPanelVisible;
  const isDetailClosing = isDetailMinimized || isDetailMinimizing;
  const shouldKeepDetailButtonsVisible =
    areDetailButtonsVisible ||
    isLyricsOpen ||
    isLyricsClosing ||
    isSongAnnotationOpen ||
    isSongAnnotationClosing;

  return (
    <>
{selectedProject && (
      <div className={`detail-lyrics-layout ${isMobile ? "is-mobile" : ""} ${isDetailClosing ? "is-minimized" : ""} ${isDetailMinimizing ? "is-minimizing" : ""}`}>
        <div
          className={`project-single-view ${showOverlay ? "visible" : "hidden"} ${isDetailClosing ? "is-minimized" : ""} ${isLyricsOpen || isSongAnnotationOpen ? "is-side-panel-open" : ""} ${shouldKeepDetailButtonsVisible ? "" : "is-buttons-hidden"} ${!isMobile && (selectedTrack?.numberTrack === 8 || selectedTrack?.numberTrack === 27 || selectedTrack?.numberTrack === 28) ? "is-dark-track" : ""}`}
          onMouseMove={isMobile ? undefined : resetDetailButtonsVisibility}
          onPointerUp={isMobile ? handleMobileDetailBlankPointerUp : undefined}
        >
          {repeatToastMessage && repeatToastPlacement === "detail" && (
            <div className="project-single-view__repeat-toast" role="status" aria-live="polite">
              {repeatToastMessage}
            </div>
          )}
          {!isDetailMinimized && selectedTrack?.videoUrl && (
            <div
              className={`detail-media-toggle ${isTrackVideoActive ? "is-video-active" : ""}`}
              role="group"
              aria-label="Chuyển đổi ảnh và video"
            >
              <button
                className={`detail-media-toggle__item ${isTrackVideoActive ? "is-active" : ""}`}
                type="button"
                onClick={() => handleTrackVideoToggle(true)}
                onPointerDown={(event) => event.stopPropagation()}
                aria-label="Phát video"
                aria-pressed={isTrackVideoActive}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M9 9.003a1 1 0 0 1 1.517-.859l4.997 2.997a1 1 0 0 1 0 1.718l-4.997 2.997A1 1 0 0 1 9 14.996z" />
                </svg>
              </button>
              <button
                className={`detail-media-toggle__item ${!isTrackVideoActive ? "is-active" : ""}`}
                type="button"
                onClick={() => handleTrackVideoToggle(false)}
                onPointerDown={(event) => event.stopPropagation()}
                aria-label="Hiển thị ảnh"
                aria-pressed={!isTrackVideoActive}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
              </button>
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
          {!isDetailMinimized && (
            <div className="detail-copyright" aria-label="Bản quyền">
              © COPYRIGHT BY N0l4b3l / RPT MCK / ANTIANTIART
            </div>
          )}
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
          {!isDetailMinimized && selectedTrack?.type === "pulled" && selectedTrack.songAnnotations?.length && (!isMobile || (!isLyricsOpen && !isSongAnnotationOpen)) && (
            <button
              className="detail-song-annotation-button"
              type="button"
              onClick={handleSongAnnotationToggle}
              aria-label={`${isSongAnnotationOpen ? "Đóng" : "Mở"} Song Annotation, ${selectedTrack.songAnnotations.length} mục`}
            >
              {isSongAnnotationOpen ? <RouteOffIcon /> : <RouteIcon />}
              {!isSongAnnotationOpen && (
                <span className="detail-song-annotation-button__badge" aria-hidden="true">
                  {selectedTrack.songAnnotations.length}
                </span>
              )}
            </button>
          )}
          {!isDetailMinimized && selectedTrack?.type === "pulled" && (!isMobile || (!isLyricsOpen && !isSongAnnotationOpen)) && (
            <button
              className="detail-lyrics-button"
              type="button"
              onClick={handleLyricsToggle}
              aria-label={isLyricsOpen ? "Đóng lời bài hát" : "Mở lời bài hát"}
            >
              {isLyricsOpen ? <ListXIcon /> : <ListMusicIcon />}
            </button>
          )}
          {!isDetailMinimized && selectedTrack?.type === "pulled" && (
            <button
              className="detail-lyrics-fullscreen-button"
              type="button"
              onClick={() => void handleWebFullscreenToggle()}
              aria-label={isWebFullscreen ? "Thu nhỏ màn hình" : "Mở toàn màn hình"}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                {isWebFullscreen ? (
                  <>
                    <path d="m15 15 6 6m-6-6v4.8m0-4.8h4.8" />
                    <path d="M9 19.8V15m0 0H4.2M9 15l-6 6" />
                    <path d="M15 4.2V9m0 0h4.8M15 9l6-6" />
                    <path d="M9 4.2V9m0 0H4.2M9 9 3 3" />
                  </>
                ) : (
                  <>
                    <path d="m15 15 6 6" />
                    <path d="m15 9 6-6" />
                    <path d="M21 16v5h-5" />
                    <path d="M21 8V3h-5" />
                    <path d="M3 16v5h5" />
                    <path d="m3 21 6-6" />
                    <path d="M3 8V3h5" />
                    <path d="M9 9 3 3" />
                  </>
                )}
              </svg>
            </button>
          )}
          {!isDetailMinimized && selectedTrack?.type === "pulled" && (
            <button
              className="detail-download-button"
              type="button"
              onClick={handleDownloadOpen}
              onPointerDown={(event) => event.stopPropagation()}
              aria-label="Tải audio"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 3v12" />
                <path d="m7 10 5 5 5-5" />
                <path d="M5 21h14" />
              </svg>
            </button>
          )}
          <div className="project-content">
            <NextImage
              className={selectedTrack?.videoUrl && isTrackVideoActive ? "project-content__image is-media-hidden" : "project-content__image"}
              src={selectedProject.imageUrl}
              alt={selectedProject.name}
              width={516}
              height={516}
              sizes="(max-width: 516px) calc(100vw - 48px), 516px"
              unoptimized
              style={{
                objectPosition: isMobile ? selectedTrack?.pMobileBackground ?? "center" : "center",
                filter: isMobile ? `brightness(${selectedTrack?.bMobileBackground ?? 0.48})` : undefined,
              }}
            />
            {selectedTrack?.videoUrl && (
              <video
                className={`project-content__video ${isTrackVideoActive ? "is-media-visible" : ""}`}
                src={selectedTrack.videoUrl}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                aria-label={selectedProject.name}
              />
            )}
          </div>
          <div
            className="project-single-view__lyrics-dim"
            style={{
              opacity: !isMobile && isLyricsOpen
                ? Math.min(0.32, Math.max(0.12, 1 - (selectedTrack?.bMobileBackground ?? 0.86)))
                : 0,
            }}
            aria-hidden="true"
          />
          {selectedTrack && !isDetailMinimized && (
            <section
              className={`project-player ${isStreaming ? "is-streaming" : ""} ${isStreamTrack ? "is-stream-track" : ""} ${areNextControlsVisible ? "is-next-controls-visible" : ""}`}
              aria-label={`Trình phát ${selectedTrack.title}`}
            >
              <div className="project-player__track">
                <span className="project-player__track-number">{getTrackLabel(selectedTrack.numberTrack)}</span>
                <span className="project-player__title">{selectedTrack.title}</span>
                <span className="project-player__artist">
                  {renderArtistNames(selectedTrack.subtitle, activeArtists)}
                </span>
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
                    {isStreamTrack ? (
                      <div className="detail-stream-platforms" aria-label="Nghe trên nền tảng khác">
                        <span className="detail-stream-platforms__label">NGHE BÀI HÁT ĐẦY ĐỦ TẠI</span>
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

      {showOverlay && !isDetailMinimized && (isLyricsPanelVisible || isSongAnnotationPanelVisible) && (
        <div
          className={`lyrics-panel__desktop-backdrop ${isLyricsOpen || isSongAnnotationOpen ? "is-open" : ""} ${!isLyricsOpen && !isSongAnnotationOpen && (isLyricsClosing || isSongAnnotationClosing) ? "is-closing" : ""}`}
        >
          {isLyricsPanelVisible && (
          <aside
            className={`lyrics-panel lyrics-panel--lyrics ${isLyricsOpen ? "is-open" : ""} ${shouldSplitSidePanels ? "is-split" : ""}`}
            aria-label="Lời bài hát"
          >
            <button className="lyrics-panel__close" type="button" onClick={handleLyricsClose} aria-label="Đóng Lời Bài Hát">
              <ListXIcon />
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
              <h2 className="lyrics-panel__title">LYRICS</h2>
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
          )}
          {isSongAnnotationPanelVisible && (
            <aside
              className={`lyrics-panel song-annotation-panel ${isSongAnnotationOpen ? "is-open" : ""} ${shouldSplitSidePanels ? "is-split" : ""}`}
              aria-label="Song Annotation"
            >
              <button className="lyrics-panel__close" type="button" onClick={handleSongAnnotationClose} aria-label="Đóng Song Annotation">
                <RouteOffIcon />
              </button>
              <div className="lyrics-panel__body song-annotation-panel__body" ref={songAnnotationBodyRef}>
                <h2 className="song-annotation-panel__title">
                  SONG ANNOTATION
                  <span className="song-annotation-panel__badge" aria-label={`${songAnnotations?.length ?? 0} mục`}>
                    {songAnnotations?.length ?? 0}
                  </span>
                </h2>
                {songAnnotations?.length ? songAnnotations.map((entry: SongAnnotationEntry) => (
                  <article className="song-annotation-panel__item" key={`${entry.startTime}-${entry.seekLabels.join("-")}`}>
                    <p className="song-annotation-panel__lyric">
                      {renderSongAnnotationLyric(entry, handleLyricsLineClick)}
                    </p>
                    <p className="song-annotation-panel__explanation">{renderSongAnnotationExplanation(entry.explanation)}</p>
                  </article>
                )) : (
                  <div className="lyrics-panel__empty">Song Annotation đang cập nhật ...</div>
                )}
              </div>
            </aside>
          )}
          </div>
      )}
      </div>
      )}
    </>
  );
}
