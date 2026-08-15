"use client";

import NextImage from "next/image";
import { Loader } from "@react-three/drei";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import {
  anhKhongMuonNoDeDangLyrics,
  camOnLyrics,
  chePhuLyrics,
  duaChuaLyrics,
  envyLyrics,
  ghetXogLaiThikLyrics,
  hutVaHutLyrics,
  idkLyrics,
  intepolLyrics,
  laGiCuaNhauLyrics,
  liemLyrics,
  nhinKeThuTaoLyrics,
  oanhMThuocLyrics,
  slipperyLyrics,
  tayThiLyrics,
  thitLonLyrics,
  wtfBbyImLitLyrics,
  xaXoiLyrics,
  yeuAnhGietAnhLyrics,
} from "./lyrics";
import type {
  DisplayMode,
  DisplayStyle,
  GalleryItem,
  RepeatMode,
  TrackPresentation,
} from "./hvl-types";
import { HVLTrackList } from "./HVLTrackList";
import { HVLCanvas } from "./HVLCanvas";
import { HVLTrackDetail } from "./HVLTrackDetail";
import { HVLDock } from "./HVLDock";

type GalleryItemSeed = Omit<GalleryItem, "pMobileBackground" | "bMobileBackground"> & Partial<Pick<GalleryItem, "pMobileBackground" | "bMobileBackground">>;


















const galleryItems: readonly GalleryItem[] = (
[
  {
    numberTrack: 0,
    durationSeconds: null,
    title: "'HVL'",
    subtitle: "RPT MCK",
    imageUrl: "/images/hvl-trailer.webp",
    bMobileBackground: 0.6,
    audioUrl: "/music/hvl.mp3",
    type: "stream",
  },
  {
    numberTrack: 1,
    durationSeconds: null,
    title: "Elegie",
    subtitle: "RPT MCK",
    imageUrl: "/images/elegie.png",
    pMobileBackground: "right",
    bMobileBackground: 0.6,
    audioUrl: "/music/elegie.mp3",
    type: "stream",
  },
  {
    numberTrack: 2,
    durationSeconds: 196.937143,
    title: "IDK",
    subtitle: "RPT MCK",
    imageUrl: "/images/idk.png",
    pMobileBackground: "left",
    bMobileBackground: 0.7,
    audioUrl: "/music/idk.mp3",
    videoUrl: "/videos/idk.mp4",
    type: "pulled",
    ...idkLyrics,
    songAnnotations: [
       {
        lyric: "Gió thu, déjà vu, tưởng thấy em ở gần nhà",
        seekLabels: ["déjà vu"],
        startTime: 68.09,
        explanation: "Déjà vu là một khoảnh khắc “đã từng thấy / đã từng trải qua” ở đâu đó mà người cảm nhận đã xảy ra trong quá khứ dù chỉ vừa mới xảy ra trong hiện thực. ",
      },
      {
        lyric: "Cào cào trắng trong màn đêm đen, FMF xé không gian lặng im",
        seekLabels: ["Cào cào trắng", "FMF"],
        startTime: 87.7,
        explanation: "FMF (viết tắt của Flying Machine Factory) là một thương hiệu nổi tiếng của Mỹ chuyên sản xuất ống xả (pô xe), cổ pô và các phụ tùng hiệu suất cao, đặc biệt dành cho xe cào cào (dirt bike), xe mô tô địa hình và xe phân khối lớn.",
      },
      {
        lyric: "Càng đi theo em, anh lại càng xa, tiếng chim lợn kêu báo điềm chẳng lành",
        seekLabels: ["tiếng chim lợn kêu"],
        startTime: 96.38,
        explanation: "Theo quan niệm dân gian, tiếng chim lợn kêu trong đêm thường được coi là điềm báo gở, gắn liền với bệnh tật, tai ương hoặc sự chết chóc.",
      },
      {
        lyric: "Anh mang mùa thu ngày hôm qua\nEm mang ngày mai",
        seekLabels: ["ngày hôm qua", "ngày mai"],
        startTime: 118.95,
        explanation: "Người con trai mắc kẹt trong quá khứ, còn cô gái thuộc về tương lai.",
      },
    ],
  },
  {
    numberTrack: 3,
    durationSeconds: 167.57551,
    title: "Wtf Bby I'm Lit",
    subtitle: "RPT MCK",
    imageUrl: "/images/wtf-bby-im-lit.png",
    bMobileBackground: 0.425,
    audioUrl: "/music/wtf-bby-im-lit.mp3",
    type: "pulled",
    ...wtfBbyImLitLyrics,
    songAnnotations: [
      {
        lyric: "In the game, baby, I'm lit",
        seekLabels: ["I'm lit"],
        startTime: 15.1,
        explanation: "Cảm giác đang rất “cháy” / phấn khích / high.",
      },
      {
        lyric: "On the beat, anh lead em phiêu",
        seekLabels: ["lead em phiêu"],
        startTime: 20.7,
        explanation: "Lead trong câu không chỉ đơn thuần là dẫn dắt, nó mang nghĩa người con trai là người chủ động dẫn nhịp, cầm nắm cảm xúc cô gái trong cuộc chơi.",
      },
      {
        lyric: "Chúng ngã vào nhau trong một tấm canvas",
        seekLabels: ["canvas"],
        startTime: 27.87,
        explanation: "Tấm Canvas trong bài vừa mang ý nghĩa là toan vẽ vừa biến con người / khung cảnh thành một “bức tranh” nhiều màu sắc trong lúc ánh sáng, cơ thể và chuyển động hòa vào nhau.",
      },
      {
        lyric: "Your aura, your vibe",
        seekLabels: ["aura", "vibe"],
        startTime: 122.23,
        explanation: "Aura mang nghĩa thần thái, sức hút. Vibe là năng lượng, cá tính hoặc cảm giác về tinh thần. Ở đây ý nói sự cuốn hút của cô gái."
      },
    ],
  },
  {
    numberTrack: 4,
    durationSeconds: 167.209796,
    title: "Anh Không Muốn Nó Dễ Dàng",
    subtitle: "RPT MCK",
    imageUrl: "/images/anh-khong-muon-no-de-dang.png",
    bMobileBackground: 0.55,
    audioUrl: "/music/anh-khong-muon-no-de-dang.mp3",
    type: "pulled",
    ...anhKhongMuonNoDeDangLyrics,
    songAnnotations: [
      {
        lyric: "Quit playin', I ain't get it",
        seekLabels: ["Quit playin'", "I ain't get it"],
        startTime: 54.61,
        explanation: "Là cách nói rút gọn của “Quit playing”: “đừng có đùa / đừng chơi trò này nữa”. Trong bài là yêu cầu đối phương nói rõ tình cảm. “I ain’t get it” thể hiện người con trai không hiểu, không biết cô gái muốn gì trong một mối quan hệ mập mờ.",
      },
      {
        lyric: "Ten out of ten, đấy là feedback cho bộ mông của em",
        seekLabels: ["Ten out of ten"],
        startTime: 99.66,
        explanation: "**10/10**, lời khen tuyệt đối.",
      },
      {
        lyric: "Baby, let me hit that",
        seekLabels: ["let me hit that"],
        startTime: 102.9,
        explanation: "Muốn được tiến tới với đối phương về mặt thể xác.",
      },
      {
        lyric: "Và vì anh biết, baby, you're my ride or die",
        seekLabels: ["ride or die"],
        startTime: 135.16,
        explanation: "Chỉ một người luôn ở bên và đồng hành với mình bất kể hoàn cảnh, kiểu “sống chết có nhau”.",
      },
    ],
  },
  {
    numberTrack: 5,
    durationSeconds: null,
    title: "Baby",
    subtitle: "RPT MCK, marzuz",
    imageUrl: "/images/baby.png",
    bMobileBackground: 0.6,
    pMobileBackground: "right",
    audioUrl: "/music/baby.mp3?v=0133-0148",
    type: "stream",
  },
  {
    numberTrack: 6,
    durationSeconds: 167.418776,
    title: "Yêu Anh Giết Anh",
    subtitle: "RPT MCK",
    imageUrl: "/images/yeu-anh-giet-anh.png",
    bMobileBackground: 0.6,
    audioUrl: "/music/yeu-anh-giet-anh.mp3",
    type: "pulled",
    ...yeuAnhGietAnhLyrics,
    songAnnotations: [
      {
        lyric: "Shawty wanna fuck, những lúc cô đơn",
        seekLabels: ["Shawty"],
        startTime: 29.39,
        explanation: "Chỉ một cô gái / người phụ nữ mà người nói thấy hấp dẫn. Ngang ngang nghĩa với từ Gu.",
      },
      {
        lyric: "I just wanna link, now she want love",
        seekLabels: ["wanna link"],
        startTime: 36.78,
        explanation: "Ở đây mang sắc thái là chỉ muốn gặp gỡ và trò chuyện nhưng chưa muốn xác định quan hệ tình cảm.",
      },
      {
        lyric: "Things got real nhưng mà em hơi bớp",
        seekLabels: ["Things got real", "hơi bớp"],
        startTime: 38.65,
        explanation: "**Mọi chuyện trở nên nghiêm túc/thật hơn dự định**. Ban đầu chỉ định gặp gỡ và vui vẻ, nhưng cảm xúc bắt đầu phát sinh một cách mạnh mẽ khiến cô gái trở nên “bớp” (chỉ trạng thái hơi hoảng sợ nhẹ, không biết phải xử sự như thế nào tiếp theo, tương đương với rất ngại ngùng).",
      },
      {
        lyric: "Voodo Voo như là Shaman",
        seekLabels: ["Voodo Voo", "Shaman"],
        startTime: 45.97,
        explanation: "**“Voodoo”** gợi đến hình ảnh bùa chú, nghi lễ và sự mê hoặc, còn **“Shaman”** là người thực hành các nghi lễ tâm linh trong một số truyền thống. Hai hình ảnh này để ví sự cuốn hút giữa hai người như một thứ **bùa mê**, khiến họ bị hấp dẫn và cuốn vào nhau một cách khó kiểm soát.",
      },
      {
        lyric: "Situationship này thật là quá toang",
        seekLabels: ["Situationship"],
        startTime: 49.66,
        explanation: "Mối quan hệ mập mờ.",
      },
      {
        lyric: "Keep it down, low, low, undercover",
        seekLabels: ["Keep it down", "undercover"],
        startTime: 106.81,
        explanation: "Hãy giữ mối quan hệ này kín đáo, hạ thấp sự chú ý và ngầm xác nhận rằng đây là một mối quan hệ không công khai.",
      },
      {
        lyric: "Thích đi cửa sau nên là chạy đường vòng",
        seekLabels: ["cửa sau", "đường vòng"],
        startTime: 110.59,
        explanation: "Có thể đọc theo nghĩa đen là đi đường vòng, nhưng trong context bài có hàm ý chơi chữ liên quan đến gần gũi thể xác.",
      },
    ],
  },
  {
    numberTrack: 7,
    durationSeconds: null,
    title: "Mắt Môi Tay Chân",
    subtitle: "RPT MCK, Tage",
    imageUrl: "/images/mat-moi-tay-chan.png",
    bMobileBackground: 0.6,
    audioUrl: "/music/mat-moi-tay-chan.mp3",
    type: "stream",
  },
  {
    numberTrack: 8,
    durationSeconds: null,
    title: "Đao Của Anh Vừa",
    subtitle: "RPT MCK",
    imageUrl: "/images/dao-cua-anh-vua.png",
    audioUrl: "/music/dao-cua-anh-vua.mp3?v=0013-8-0037-6",
    type: "stream",
  },
  {
    numberTrack: 9,
    durationSeconds: 141.583673,
    title: "Là Gì Của Nhau",
    subtitle: "RPT MCK",
    imageUrl: "/images/la-gi-cua-nhau.png",
    bMobileBackground: 0.6,
    audioUrl: "/music/la-gi-cua-nhau.mp3",
    type: "pulled",
    ...laGiCuaNhauLyrics,
    songAnnotations: [
      {
        lyric: "Mỗi đêm tôi cười, cười một mình tôi ...\n... và tôi chợt thấy thương tôi vô (cùng)",
        seekLabels: ["Mỗi đêm tôi cười"],
        startTime: 6.94,
        explanation: "Người hát đoạn Intro : Phạm Hoài Nam. Đoạn này trong bài gốc “Mỗi Đêm Tôi Về” của nhạc sĩ Đức Trí.",
      },
    ],
  },
  {
    numberTrack: 10,
    durationSeconds: null,
    title: "Night In Prague",
    subtitle: "RPT MCK",
    imageUrl: "/images/night-in-prague.png",
    bMobileBackground: 0.35,
    audioUrl: "/music/night-in-prague.mp3",
    type: "stream",
  },
  {
    numberTrack: 11,
    durationSeconds: null,
    title: "Một Cái Ôm",
    subtitle: "RPT MCK",
    imageUrl: "/images/mot-cai-om.png",
    bMobileBackground: 0.6,
    audioUrl: "/music/mot-cai-om.mp3?v=0100-0126-7",
    type: "stream",
  },
  {
    numberTrack: 12,
    durationSeconds: 234.13551,
    title: "Liệm",
    subtitle: "RPT MCK",
    imageUrl: "/images/liem.png",
    bMobileBackground: 0.6,
    audioUrl: "/music/liem.mp3",
    type: "pulled",
    ...liemLyrics,
  },
  {
    numberTrack: 13,
    durationSeconds: null,
    title: "Nếu Như Ta Chẳng Còn",
    subtitle: "RPT MCK, A$AP Ướt Mi",
    imageUrl: "/images/neu-nhu-ta-chang-con.png",
    pMobileBackground: "right",
    audioUrl: "/music/neu-nhu-ta-chang-con.mp3?v=0109-0130",
    type: "stream",
  },
  {
    numberTrack: 14,
    durationSeconds: null,
    title: "Ai Mới Là Kẻ Xấu Xa",
    subtitle: "RPT MCK",
    imageUrl: "/images/ai-moi-la-ke-xau-xa.png",
    bMobileBackground: 0.6,
    audioUrl: "/music/ai-moi-la-ke-xau-xa.mp3?v=0158-0225",
    type: "stream",
  },
  {
    numberTrack: 15,
    durationSeconds: 214.857143,
    title: "Slippery",
    subtitle: "RPT MCK, Tùng Dương",
    imageUrl: "/images/slippery.png",
    bMobileBackground: 0.6,
    audioUrl: "/music/slippery.mp3",
    videoUrl: "/videos/slippery.mp4",
    type: "pulled",
    artistHighlights: [
      { artist: "RPT MCK", startTime: 0, endTime: 157.17 },
      { artist: "Tùng Dương", startTime: 157.17, endTime: 182.93 },
      { artist: "RPT MCK", startTime: 182.93, endTime: 214.857143 },
    ],
    ...slipperyLyrics,
  },
  {
    numberTrack: 16,
    durationSeconds: 57.417143,
    title: "Intepol",
    subtitle: "RPT MCK",
    imageUrl: "/images/intepol.png",
    bMobileBackground: 0.6,
    audioUrl: "/music/intepol.mp3",
    type: "pulled",
    ...intepolLyrics,
  },
  {
    numberTrack: 17,
    durationSeconds: 107.833469,
    title: "Tây Thi",
    subtitle: "RPT MCK",
    imageUrl: "/images/tay-thi.png",
    pMobileBackground: "left",
    bMobileBackground: 0.6,
    audioUrl: "/music/tay-thi.mp3",
    type: "pulled",
    ...tayThiLyrics,
  },
  {
    numberTrack: 18,
    durationSeconds: 134.530612,
    title: "Hút Và Hút",
    subtitle: "RPT MCK",
    imageUrl: "/images/hut-va-hut.png",
    pMobileBackground: "right",
    bMobileBackground: 0.6,
    audioUrl: "/music/hut-va-hut.mp3",
    type: "pulled",
    ...hutVaHutLyrics,
  },
  {
    numberTrack: 19,
    durationSeconds: 187.167347,
    title: "Dưa Chua",
    subtitle: "RPT MCK",
    imageUrl: "/images/dua-chua.png",
    bMobileBackground: 0.55,
    audioUrl: "/music/dua-chua.mp3",
    type: "pulled",
    ...duaChuaLyrics,
  },
  {
    numberTrack: 20,
    durationSeconds: 218.148571,
    title: "Xa Xôi",
    subtitle: "RPT MCK, Obito",
    imageUrl: "/images/xa-xoi.png",
    bMobileBackground: 0.4,
    audioUrl: "/music/xa-xoi.mp3",
    videoUrl: "/videos/xa-xoi.mp4",
    type: "pulled",
    artistHighlights: [
      { artist: "RPT MCK", startTime: 0, endTime: 138.02 },
      { artist: "Obito", startTime: 138.02, endTime: 203.77 },
      { artist: "RPT MCK", startTime: 203.77, endTime: 218.148571 },
    ],
    ...xaXoiLyrics,
  },
  {
    numberTrack: 21,
    durationSeconds: 155.324082,
    title: "Che Phủ",
    subtitle: "RPT MCK",
    imageUrl: "/images/che-phu.png",
    bMobileBackground: 0.6,
    audioUrl: "/music/che-phu.mp3",
    type: "pulled",
    ...chePhuLyrics,
  },
  {
    numberTrack: 22,
    durationSeconds: 205.374694,
    title: "Oanh M = Thuoc",
    subtitle: "RPT MCK",
    imageUrl: "/images/oanh-m-=-thuoc.png",
    bMobileBackground: 0.6,
    audioUrl: "/music/oanh-m-=-thuoc.mp3",
    videoUrl: "/videos/oanh-m-=-thuoc.mp4",
    type: "pulled",
    ...oanhMThuocLyrics,
  },
  {
    numberTrack: 23,
    durationSeconds: 113.293061,
    title: "Ghet Xog Lai Thik",
    subtitle: "RPT MCK",
    imageUrl: "/images/ghet-xog-lai-thik.png",
    audioUrl: "/music/ghet-xog-lai-thik.mp3",
    type: "pulled",
    ...ghetXogLaiThikLyrics,
  },
  {
    numberTrack: 24,
    durationSeconds: 238.968163,
    title: "Nhìn Kẻ Thù Của Tao",
    subtitle: "RPT MCK",
    imageUrl: "/images/nhin-ke-thu-cua-tao.png",
    bMobileBackground: 0.6,
    audioUrl: "/music/nhin-ke-thu-cua-tao.mp3",
    videoUrl: "/videos/nhin-ke-thu-cua-tao.mp4",
    type: "pulled",
    ...nhinKeThuTaoLyrics,
  },
  {
    numberTrack: 25,
    durationSeconds: 235.467755,
    title: "Envy",
    subtitle: "RPT MCK, THANHDRAW",
    imageUrl: "/images/envy.png",
    audioUrl: "/music/envy.mp3",
    type: "pulled",
    artistHighlights: [
      { artist: "RPT MCK", startTime: 0, endTime: 133.15 },
      { artist: "THANHDRAW", startTime: 133.15, endTime: 175.11 },
      { artist: ["RPT MCK", "THANHDRAW"], startTime: 175.11, endTime: 235.467755 },
    ],
    ...envyLyrics,
  },
  {
    numberTrack: 26,
    durationSeconds: 159.764898,
    title: "Cảm Ơn",
    subtitle: "RPT MCK",
    imageUrl: "/images/cam-on.png",
    pMobileBackground: "right",
    bMobileBackground: 0.55,
    audioUrl: "/music/cam-on.mp3",
    type: "pulled",
    ...camOnLyrics,
  },
  {
    numberTrack: 27,
    durationSeconds: null,
    title: "Không Cần Lo Cho Tao",
    subtitle: "RPT MCK",
    imageUrl: "/images/khong-can-lo-cho-tao.png",
    bMobileBackground: 0.35,
    audioUrl: "/music/khong-can-lo-cho-tao.mp3?v=0113-0133-2",
    type: "stream",
  },
  {
    numberTrack: 28,
    durationSeconds: null,
    title: "Huh",
    subtitle: "RPT MCK, RPT Orijinn, THANHDRAW",
    imageUrl: "/images/huh.jpg",
    bMobileBackground: 0.35,
    audioUrl: "/music/huh.mp3?v=0321-0334",
    type: "stream",
  },
  {
    numberTrack: 29,
    durationSeconds: null,
    title: "Nguyễn Văn Mười",
    subtitle: "RPT MCK",
    imageUrl: "/images/nguyen-van-muoi.png",
    bMobileBackground: 0.6,
    audioUrl: "/music/nguyen-van-muoi.mp3",
    type: "stream",
  },
  {
    numberTrack: 30,
    durationSeconds: 228.440816,
    title: "Thịt Lợn",
    subtitle: "RPT MCK",
    imageUrl: "/images/thit-lon.png",
    audioUrl: "/music/thit-lon.mp3",
    type: "pulled",
    ...thitLonLyrics,
  },
  ] satisfies readonly GalleryItemSeed[]
).map((item: GalleryItemSeed) => ({
  ...item,
  pMobileBackground: item.pMobileBackground ?? "center",
  bMobileBackground: item.bMobileBackground ?? 0.48,
}));

const tubeCols = Math.min(7, galleryItems.length);
const tubeRows = Math.ceil(galleryItems.length / tubeCols);
const tubeRowSpacing = 1.85;
const tubeScrollLimit = ((tubeRows - 1) * tubeRowSpacing) / 2;
const tubeWheelScrollFactor = 0.00075;
const mobileMediaQuery = "(pointer: coarse), (max-width: 1199px)";
const ageConfirmationStorageKey = "hvl-age-confirmed";
const autoNextDelaySeconds = 15;
const displayModeStorageKey = "hvl-display-mode";
const displayStyleStorageKey = "hvl-display-style";
const dockPinnedStorageKey = "hvl-dock-pinned";
const mobileDockModeStorageKey = "hvl-mobile-dock-mode";
const desktopSidePanelTransitionDuration = 420;
const mobileSidePanelTransitionDuration = 500;

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00";

  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}

function formatFileSize(bytes: number | null) {
  if (bytes == null || !Number.isFinite(bytes) || bytes <= 0) return "Không xác định";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getAudioFileName(audioUrl: string) {
  return audioUrl.split("?")[0].split("/").pop()?.toLowerCase() ?? "audio.mp3";
}

function formatTrackNumber(numberTrack: number) {
  return numberTrack.toString().padStart(2, "0");
}

function getTrackLabel(numberTrack: number) {
  return numberTrack === 0 ? "TRAILER" : `TRACK ${formatTrackNumber(numberTrack)}`;
}

function getNextTrack(startIndex: number, displayMode: DisplayMode) {
  for (let offset = 1; offset <= galleryItems.length; offset += 1) {
    const index = (startIndex + offset) % galleryItems.length;
    const track = galleryItems[index];

    if (displayMode === "full" || track.type === "pulled") return { index, track };
  }

  return null;
}

function getPreviousTrack(startIndex: number, displayMode: DisplayMode) {
  for (let offset = 1; offset <= galleryItems.length; offset += 1) {
    const index = (startIndex - offset + galleryItems.length) % galleryItems.length;
    const track = galleryItems[index];

    if (displayMode === "full" || track.type === "pulled") return { index, track };
  }

  return null;
}

function playClickSound() {
  window.dispatchEvent(new Event("hvl-click"));
}

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

function YouTubeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path d="M21.58 7.19a2.98 2.98 0 0 0-2.1-2.1C17.63 4.58 12 4.58 12 4.58s-5.63 0-7.48.51a2.98 2.98 0 0 0-2.1 2.1C1.91 9.04 1.91 12 1.91 12s0 2.96.51 4.81a2.98 2.98 0 0 0 2.1 2.1c1.85.51 7.48.51 7.48.51s5.63 0 7.48-.51a2.98 2.98 0 0 0 2.1-2.1c.51-1.85.51-4.81.51-4.81s0-2.96-.51-4.81Z" fill="#ff0000" />
      <path d="m10 15.3 4.7-3.3L10 8.7v6.6Z" fill="#fff" />
    </svg>
  );
}

function SpotifyIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 236.05 225.25" fill="none">
      <path d="m122.37 3.31C61.99.91 11.1 47.91 8.71 108.29c-2.4 60.38 44.61 111.26 104.98 113.66 60.38 2.4 111.26-44.6 113.66-104.98C229.74 56.59 182.74 5.7 122.37 3.31Z" fill="#1ed760" />
      <path d="M168.55 163.59c-1.36 2.4-4.01 3.6-6.59 3.24-.79-.11-1.58-.37-2.32-.79-14.46-8.23-30.22-13.59-46.84-15.93-16.62-2.34-33.25-1.53-49.42 2.4-3.51.85-7.04-1.3-7.89-4.81-.85-3.51 1.3-7.04 4.81-7.89 17.78-4.32 36.06-5.21 54.32-2.64 18.26 2.57 35.58 8.46 51.49 17.51 3.13 1.79 4.23 5.77 2.45 8.91Z" fill="#080808" />
      <path d="M182.93 134.87c-2.23 4.12-7.39 5.66-11.51 3.43-16.92-9.15-35.24-15.16-54.45-17.86-19.21-2.7-38.47-1.97-57.26 2.16-1.02.22-2.03.26-3.01.12-3.41-.48-6.33-3.02-7.11-6.59-1.01-4.58 1.89-9.11 6.47-10.12 20.77-4.57 42.06-5.38 63.28-2.4 21.21 2.98 41.46 9.62 60.16 19.74 4.13 2.23 5.66 7.38 3.43 11.51Z" fill="#080808" />
      <path d="M198.87 102.49c-2.1 4.04-6.47 6.13-10.73 5.53-1.15-.16-2.28-.52-3.37-1.08-19.7-10.25-40.92-17.02-63.07-20.13-22.15-3.11-44.42-2.45-66.18 1.97-5.66 1.15-11.17-2.51-12.32-8.16-1.15-5.66 2.51-11.17 8.16-12.32 24.1-4.89 48.74-5.62 73.25-2.18 24.51 3.44 47.99 10.94 69.81 22.29 5.12 2.66 7.11 8.97 4.45 14.09Z" fill="#080808" />
    </svg>
  );
}

function RepeatIcon({
  isAll,
  isOne,
  animationNonce,
}: {
  isAll: boolean;
  isOne: boolean;
  animationNonce: number;
}) {
  return (
    <svg
      key={animationNonce}
      className="repeat-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path className="repeat-icon__top" d="M20 9V7a2 2 0 0 0-2-2h-6m3-3-3 3 3 3" />
      <path d="M20 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2" />
      {isAll && <circle className="repeat-icon__all-dot" cx="12" cy="12" r="1.35" />}
      {isOne && <path className="repeat-icon__one" d="M11 10h1v4" />}
    </svg>
  );
}

function ListMusicIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 5H3" />
      <path d="M11 12H3" />
      <path d="M11 19H3" />
      <path d="M21 16V5" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

function ListXIcon() {
  return (
    <svg
      className="detail-lyrics-icon--list-x"
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 5H3" />
      <path d="M11 12H3" />
      <path d="M16 19H3" />
      <path d="m15.5 9.5 5 5" />
      <path d="m20.5 9.5-5 5" />
    </svg>
  );
}

function RouteIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="19" r="3" />
      <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
      <circle cx="18" cy="5" r="3" />
    </svg>
  );
}

function RouteOffIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="19" r="3" />
      <path d="M9 19h8.5c.4 0 .9-.1 1.3-.2" />
      <path d="M5.2 5.2A3.5 3.5 0 0 0 6.5 12H12" />
      <path d="m2 2 20 20" />
      <path d="M21 15.3a3.5 3.5 0 0 0-3.3-3.3" />
      <path d="M15 5h-4.3" />
      <circle cx="18" cy="5" r="3" />
    </svg>
  );
}

function renderLyricsLine(line: string) {
  const parts: Array<string | React.ReactElement> = [];
  const linkPattern = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = linkPattern.exec(line)) !== null) {
    if (match.index > lastIndex) parts.push(line.slice(lastIndex, match.index));
    parts.push(
      <a key={`${match.index}-${match[1]}`} href={match[2]} target="_blank" rel="noreferrer">
        {match[1]}
      </a>,
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < line.length) parts.push(line.slice(lastIndex));
  return parts.length > 0 ? parts : "\u00a0";
}

function StreamingPlatformLinks({
  className,
  linkClassName,
}: {
  className: string;
  linkClassName: string;
}) {
  return (
    <div className={className} onClick={(event) => event.stopPropagation()}>
      <a
        className={linkClassName}
        href="https://www.youtube.com/playlist?list=PLG5bpInXG8Sc"
        target="_blank"
        rel="noreferrer"
        aria-label="Nghe trên YouTube"
      >
        <YouTubeIcon />
      </a>
      <a
        className={linkClassName}
        href="https://open.spotify.com/album/36e3pjcLAYabHjXlaSmWOe"
        target="_blank"
        rel="noreferrer"
        aria-label="Nghe trên Spotify"
      >
        <SpotifyIcon />
      </a>
      <a
        className={linkClassName}
        href="https://music.apple.com/vn/album/hvl/6796647839"
        target="_blank"
        rel="noreferrer"
        aria-label="Nghe trên Apple Music"
      >
        <AppleMusicIcon />
      </a>
    </div>
  );
}


export function HVLScreen() {
  const tubeScrollTarget = useRef(0);
  const tubeFocusItem = useRef<number | null>(null);
  const isDragging = useRef(false);
  const tubeSpinVelocity = useRef(0);
  const tubeNaturalDir = useRef(1);
  const tubeDragDelta = useRef(0);
  const suppressImageClickUntil = useRef(0);
  const lastDragSoundAt = useRef(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isPresentationReady, setIsPresentationReady] = useState(false);
  const [selectedProject, setSelectedProject] = useState<{
    name: string;
    imageUrl: string;
    index: number;
  } | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [isDetailMinimized, setIsDetailMinimized] = useState(false);
  const [isDetailMinimizing, setIsDetailMinimizing] = useState(false);
  const [isDockHidingForDetail, setIsDockHidingForDetail] = useState(false);
  const [isTrackVideoActive, setIsTrackVideoActive] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [isLyricsClosing, setIsLyricsClosing] = useState(false);
  const [isSongAnnotationOpen, setIsSongAnnotationOpen] = useState(false);
  const [isSongAnnotationClosing, setIsSongAnnotationClosing] = useState(false);
  const [isWebFullscreen, setIsWebFullscreen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isDownloadDisabled, setIsDownloadDisabled] = useState(false);
  const [downloadAudioSize, setDownloadAudioSize] = useState<number | null>(null);
  const [isDownloadSizeLoading, setIsDownloadSizeLoading] = useState(false);
  const [isLyricsAutoScrollPaused, setIsLyricsAutoScrollPaused] = useState(false);
  const sidePanelTransitionDuration = isMobile
    ? mobileSidePanelTransitionDuration
    : desktopSidePanelTransitionDuration;
  const lyricsBodyRef = useRef<HTMLDivElement>(null);
  const songAnnotationBodyRef = useRef<HTMLDivElement>(null);
  const lyricsShouldReopenRef = useRef(false);
  const lyricsHasBeenOpenedRef = useRef(false);
  const lyricsClosingTimeoutRef = useRef<number | null>(null);
  const suppressLyricsCloseEffectRef = useRef(false);
  const songAnnotationHasBeenOpenedRef = useRef(false);
  const songAnnotationClosingTimeoutRef = useRef<number | null>(null);
  const suppressSongAnnotationCloseEffectRef = useRef(false);
  const pendingLyricsOpenFrameRef = useRef<number | null>(null);
  const pendingSongAnnotationOpenFrameRef = useRef<number | null>(null);
  const downloadResetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [repeatAnimationNonce, setRepeatAnimationNonce] = useState(0);
  const [isRepeatAnimating, setIsRepeatAnimating] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isAgeGateOpen, setIsAgeGateOpen] = useState(false);
  const [isAgeGateStateReady, setIsAgeGateStateReady] = useState(false);
  const [hasConfirmedAge, setHasConfirmedAge] = useState(false);
  const [displayMode, setDisplayMode] = useState<DisplayMode>("pulled");
  const [displayStyle, setDisplayStyle] = useState<DisplayStyle>("museum");
  const [isDockPinned, setIsDockPinned] = useState(false);
  const streamDisplayDelay = autoNextDelaySeconds;
  const [pendingDisplayMode, setPendingDisplayMode] = useState<DisplayMode>("pulled");
  const [pendingDisplayStyle, setPendingDisplayStyle] = useState<DisplayStyle>("museum");
  const [pendingDockPinned, setPendingDockPinned] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDisplayModeStatusVisible, setIsDisplayModeStatusVisible] = useState(false);
  const [areDetailButtonsVisible, setAreDetailButtonsVisible] = useState(true);
  const [detailNavigationPreview, setDetailNavigationPreview] = useState<"previous" | "next" | null>(null);
  const [areSceneControlsVisible, setAreSceneControlsVisible] = useState(true);
  const [autoNextRemaining, setAutoNextRemaining] = useState(autoNextDelaySeconds);
  const [streamElapsedTime, setStreamElapsedTime] = useState(0);
  const [streamTimerRevision, setStreamTimerRevision] = useState(0);
  const [isAutoNextPaused, setIsAutoNextPaused] = useState(false);
  const [isFloatingPlayerExpanded, setIsFloatingPlayerExpanded] = useState(true);
  const [repeatToastMessage, setRepeatToastMessage] = useState<string | null>(null);
  const [repeatToastPlacement, setRepeatToastPlacement] = useState<"detail" | "dock">("dock");

  const closeOverlayTimeoutRef = useRef<number | null>(null);
  const detailMinimizeTimeoutRef = useRef<number | null>(null);
  const detailRestoreTimeoutRef = useRef<number | null>(null);
  const detailButtonsTimeoutRef = useRef<number | null>(null);
  const sceneControlsTimeoutRef = useRef<number | null>(null);
  const displayModeStatusTimeoutRef = useRef<number | null>(null);
  const repeatAnimationTimeoutRef = useRef<number | null>(null);
  const repeatToastTimeoutRef = useRef<number | null>(null);
  const lyricsAutoScrollPauseTimeoutRef = useRef<number | null>(null);
  const isLyricsUserScrollingRef = useRef(false);
  const floatingPlayerHideTimeoutRef = useRef<number | null>(null);
  const floatingPlayerHoldUntilRef = useRef(0);
  const autoNextDeadlineRef = useRef<number | null>(null);
  const mobileScrollTopRef = useRef(0);
  const isDetailMinimizedRef = useRef(false);
  const handleNextTrackRef = useRef<() => void>(() => {});
  const audioRef = useRef<HTMLAudioElement>(null);
  const isSeekingRef = useRef(false);
  const resumeAfterSeekRef = useRef(false);
  const audioSeekRequestRef = useRef(0);
  const pendingAudioSeekCleanupRef = useRef<(() => void) | null>(null);

  const dragState = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    lastX: number;
    lastY: number;
    hasDragged: boolean;
  } | null>(null);

  const resetDetailButtonsVisibility = useCallback(() => {
    setAreDetailButtonsVisible(true);
    if (detailButtonsTimeoutRef.current != null) window.clearTimeout(detailButtonsTimeoutRef.current);

    detailButtonsTimeoutRef.current = window.setTimeout(() => {
      setAreDetailButtonsVisible(false);
      setDetailNavigationPreview(null);
      detailButtonsTimeoutRef.current = null;
    }, 5_000);
  }, [isMobile]);

  const handleMobileDetailBlankPointerUp = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!isMobile || isLyricsOpen || isLyricsClosing || isSongAnnotationOpen) return;

    const target = event.target as HTMLElement;
    if (target.closest("button, input, [role='slider'], .project-player__track, .project-player__time, .project-player__progress, .project-player__transport")) {
      resetDetailButtonsVisibility();
      return;
    }

    const viewportHeight = window.innerHeight;
    const topControlBand = Math.max(96, window.innerWidth * 0.16);
    const bottomControlBand = 88;
    if (event.clientY <= topControlBand || event.clientY >= viewportHeight - bottomControlBand) {
      return;
    }

    if (areDetailButtonsVisible) {
      if (detailButtonsTimeoutRef.current != null) window.clearTimeout(detailButtonsTimeoutRef.current);
      detailButtonsTimeoutRef.current = null;
      setAreDetailButtonsVisible(false);
      return;
    }

    resetDetailButtonsVisibility();
  }, [areDetailButtonsVisible, isLyricsClosing, isLyricsOpen, isMobile, isSongAnnotationOpen, resetDetailButtonsVisibility]);

  const resetSceneControlsVisibility = useCallback(() => {
    if (isMobile) return;

    setAreSceneControlsVisible(true);
    if (sceneControlsTimeoutRef.current != null) {
      window.clearTimeout(sceneControlsTimeoutRef.current);
    }
    sceneControlsTimeoutRef.current = window.setTimeout(() => {
      setAreSceneControlsVisible(false);
    }, 3000);
  }, [isMobile]);

  const showDisplayModeStatus = useCallback(() => {
    setIsDisplayModeStatusVisible(true);
    if (displayModeStatusTimeoutRef.current != null) {
      window.clearTimeout(displayModeStatusTimeoutRef.current);
    }
    displayModeStatusTimeoutRef.current = window.setTimeout(() => {
      setIsDisplayModeStatusVisible(false);
      displayModeStatusTimeoutRef.current = null;
    }, 3000);
  }, []);

  const handleDisplayModeToggle = useCallback(() => {
    playClickSound();
    setDisplayMode((currentMode) => {
      const nextMode = currentMode === "full" ? "pulled" : "full";
      window.localStorage.setItem(displayModeStorageKey, nextMode);
      return nextMode;
    });
    showDisplayModeStatus();
    resetSceneControlsVisibility();
  }, [resetSceneControlsVisibility, showDisplayModeStatus]);

  const scheduleFloatingPlayerHideAfterSettings = useCallback((dockPinnedOverride?: boolean) => {
    const currentTrackIsStream = selectedProject ? galleryItems[selectedProject.index]?.type === "stream" : false;
    const shouldKeepDockVisible = isMobile || isDetailMinimized === false || dockPinnedOverride === true || currentTrackIsStream;

    if (shouldKeepDockVisible) return;

    if (floatingPlayerHideTimeoutRef.current != null) {
      window.clearTimeout(floatingPlayerHideTimeoutRef.current);
      floatingPlayerHideTimeoutRef.current = null;
    }
    floatingPlayerHoldUntilRef.current = Date.now() + 1_000;
    floatingPlayerHideTimeoutRef.current = window.setTimeout(() => {
      setIsFloatingPlayerExpanded(false);
      floatingPlayerHideTimeoutRef.current = null;
      floatingPlayerHoldUntilRef.current = 0;
    }, 1_000);
  }, [isDetailMinimized, isMobile, selectedProject]);

  const handleSettingsOpen = useCallback(() => {
    playClickSound();
    if (!isMobile) {
      if (floatingPlayerHideTimeoutRef.current != null) {
        window.clearTimeout(floatingPlayerHideTimeoutRef.current);
        floatingPlayerHideTimeoutRef.current = null;
      }
      floatingPlayerHoldUntilRef.current = 0;
      setIsFloatingPlayerExpanded(true);
    }
    setPendingDisplayStyle(isMobile ? "list" : displayStyle);
    setPendingDisplayMode(displayMode);
    setPendingDockPinned(isDockPinned);
    setIsSettingsOpen(true);
  }, [displayMode, displayStyle, isDockPinned, isMobile]);

  const handleSettingsClose = useCallback(() => {
    playClickSound();
    setIsSettingsOpen(false);
    scheduleFloatingPlayerHideAfterSettings();
  }, [scheduleFloatingPlayerHideAfterSettings]);

  const resetLyricsAutoScrollPause = useCallback(() => {
    if (lyricsAutoScrollPauseTimeoutRef.current != null) {
      window.clearTimeout(lyricsAutoScrollPauseTimeoutRef.current);
      lyricsAutoScrollPauseTimeoutRef.current = null;
    }
    isLyricsUserScrollingRef.current = false;
    setIsLyricsAutoScrollPaused(false);
  }, []);

  const scheduleLyricsAutoScrollResume = useCallback(() => {
    if (lyricsAutoScrollPauseTimeoutRef.current != null) {
      window.clearTimeout(lyricsAutoScrollPauseTimeoutRef.current);
    }
    lyricsAutoScrollPauseTimeoutRef.current = window.setTimeout(() => {
      isLyricsUserScrollingRef.current = false;
      setIsLyricsAutoScrollPaused(false);
      lyricsAutoScrollPauseTimeoutRef.current = null;
    }, 2_000);
  }, []);

  const pauseLyricsAutoScroll = useCallback(() => {
    isLyricsUserScrollingRef.current = true;
    setIsLyricsAutoScrollPaused(true);
    scheduleLyricsAutoScrollResume();
  }, [scheduleLyricsAutoScrollResume]);

  const handleLyricsScroll = useCallback(() => {
    if (isLyricsUserScrollingRef.current) {
      scheduleLyricsAutoScrollResume();
    }
  }, [scheduleLyricsAutoScrollResume]);

  const handleLyricsClose = useCallback(() => {
    playClickSound();
    resetLyricsAutoScrollPause();
    lyricsShouldReopenRef.current = false;
    setIsLyricsClosing(true);
    setIsLyricsOpen(false);
    if (isMobile) resetDetailButtonsVisibility();
  }, [isMobile, resetDetailButtonsVisibility, resetLyricsAutoScrollPause]);

  const handleSongAnnotationClose = useCallback(() => {
    playClickSound();
    setIsSongAnnotationClosing(true);
    setIsSongAnnotationOpen(false);
    if (isMobile) resetDetailButtonsVisibility();
  }, [isMobile, resetDetailButtonsVisibility]);

  const openLyricsFromClosedPosition = useCallback(() => {
    if (pendingLyricsOpenFrameRef.current != null) {
      window.cancelAnimationFrame(pendingLyricsOpenFrameRef.current);
    }
    if (isSongAnnotationOpen) suppressSongAnnotationCloseEffectRef.current = true;
    setIsSongAnnotationClosing(false);
    setIsSongAnnotationOpen(false);
    setIsLyricsClosing(true);
    setIsLyricsOpen(false);
    pendingLyricsOpenFrameRef.current = window.requestAnimationFrame(() => {
      pendingLyricsOpenFrameRef.current = window.requestAnimationFrame(() => {
        pendingLyricsOpenFrameRef.current = null;
        setIsLyricsClosing(false);
        setIsLyricsOpen(true);
      });
    });
  }, [isSongAnnotationOpen]);

  const openSongAnnotationFromClosedPosition = useCallback(() => {
    if (pendingSongAnnotationOpenFrameRef.current != null) {
      window.cancelAnimationFrame(pendingSongAnnotationOpenFrameRef.current);
    }
    resetLyricsAutoScrollPause();
    lyricsShouldReopenRef.current = false;
    if (isLyricsOpen) suppressLyricsCloseEffectRef.current = true;
    setIsLyricsClosing(false);
    setIsLyricsOpen(false);
    setIsSongAnnotationClosing(true);
    setIsSongAnnotationOpen(false);
    pendingSongAnnotationOpenFrameRef.current = window.requestAnimationFrame(() => {
      pendingSongAnnotationOpenFrameRef.current = window.requestAnimationFrame(() => {
        pendingSongAnnotationOpenFrameRef.current = null;
        setIsSongAnnotationClosing(false);
        setIsSongAnnotationOpen(true);
      });
    });
  }, [isLyricsOpen, resetLyricsAutoScrollPause]);

  const openSongAnnotationAlongsideLyrics = useCallback(() => {
    if (pendingSongAnnotationOpenFrameRef.current != null) {
      window.cancelAnimationFrame(pendingSongAnnotationOpenFrameRef.current);
    }
    setIsSongAnnotationClosing(true);
    setIsSongAnnotationOpen(false);
    pendingSongAnnotationOpenFrameRef.current = window.requestAnimationFrame(() => {
      pendingSongAnnotationOpenFrameRef.current = window.requestAnimationFrame(() => {
        pendingSongAnnotationOpenFrameRef.current = null;
        setIsSongAnnotationClosing(false);
        setIsSongAnnotationOpen(true);
      });
    });
  }, []);

  const handleWebFullscreenToggle = useCallback(async () => {
    const fullscreenTarget = document.documentElement;

    playClickSound();

    if (document.fullscreenElement === fullscreenTarget) {
      await document.exitFullscreen();
      return;
    }

    if (!fullscreenTarget.requestFullscreen) {
      setIsWebFullscreen(true);
      return;
    }

    try {
      await fullscreenTarget.requestFullscreen();
    } catch {
      setIsWebFullscreen(true);
    }
  }, []);

  const handleLyricsToggle = useCallback(() => {
    playClickSound();
    resetLyricsAutoScrollPause();
    if (isLyricsOpen) {
      lyricsShouldReopenRef.current = false;
      setIsLyricsClosing(isLyricsOpen);
      setIsLyricsOpen(false);
      return;
    }

    lyricsShouldReopenRef.current = true;
    if (isMobile) {
      openLyricsFromClosedPosition();
      return;
    }
    setIsLyricsClosing(false);
    setIsLyricsOpen(true);
  }, [isLyricsOpen, isMobile, openLyricsFromClosedPosition, resetLyricsAutoScrollPause]);

  const handleSongAnnotationToggle = useCallback(() => {
    playClickSound();
    if (isSongAnnotationOpen) {
      setIsSongAnnotationClosing(true);
      setIsSongAnnotationOpen(false);
      return;
    }

    if (isMobile) {
      openSongAnnotationFromClosedPosition();
      return;
    }

    resetLyricsAutoScrollPause();
    if (isLyricsOpen) {
      openSongAnnotationAlongsideLyrics();
      return;
    }
    setIsSongAnnotationClosing(false);
    setIsSongAnnotationOpen(true);
  }, [isLyricsOpen, isMobile, isSongAnnotationOpen, openSongAnnotationAlongsideLyrics, openSongAnnotationFromClosedPosition, resetLyricsAutoScrollPause]);

  useEffect(() => {
    if (lyricsClosingTimeoutRef.current != null) {
      window.clearTimeout(lyricsClosingTimeoutRef.current);
      lyricsClosingTimeoutRef.current = null;
    }

    if (isLyricsOpen) {
      lyricsHasBeenOpenedRef.current = true;
      setIsLyricsClosing(false);
      return;
    }

    if (suppressLyricsCloseEffectRef.current) {
      suppressLyricsCloseEffectRef.current = false;
      setIsLyricsClosing(false);
      return;
    }

    if (!lyricsHasBeenOpenedRef.current) return;

    setIsLyricsClosing(true);
    lyricsClosingTimeoutRef.current = window.setTimeout(() => {
      setIsLyricsClosing(false);
      lyricsClosingTimeoutRef.current = null;
    }, sidePanelTransitionDuration);
  }, [isLyricsOpen, sidePanelTransitionDuration]);

  useEffect(() => {
    if (songAnnotationClosingTimeoutRef.current != null) {
      window.clearTimeout(songAnnotationClosingTimeoutRef.current);
      songAnnotationClosingTimeoutRef.current = null;
    }

    if (isSongAnnotationOpen) {
      songAnnotationHasBeenOpenedRef.current = true;
      setIsSongAnnotationClosing(false);
      return;
    }

    if (suppressSongAnnotationCloseEffectRef.current) {
      suppressSongAnnotationCloseEffectRef.current = false;
      setIsSongAnnotationClosing(false);
      return;
    }

    if (!songAnnotationHasBeenOpenedRef.current) return;

    setIsSongAnnotationClosing(true);
    songAnnotationClosingTimeoutRef.current = window.setTimeout(() => {
      setIsSongAnnotationClosing(false);
      songAnnotationClosingTimeoutRef.current = null;
    }, sidePanelTransitionDuration);
  }, [isSongAnnotationOpen, sidePanelTransitionDuration]);

  const handleDownloadOpen = useCallback(() => {
    const track = selectedProject ? galleryItems[selectedProject.index] : null;
    if (!track || track.type !== "pulled" || !track.audioUrl) return;
    playClickSound();
    if (downloadResetTimeoutRef.current) clearTimeout(downloadResetTimeoutRef.current);
    setIsDownloadDisabled(false);
    setIsDownloadModalOpen(true);
  }, [selectedProject]);

  const handleDownloadClose = useCallback(() => {
    playClickSound();
    if (downloadResetTimeoutRef.current) clearTimeout(downloadResetTimeoutRef.current);
    setIsDownloadDisabled(false);
    setIsDownloadModalOpen(false);
  }, []);

  const handleDownloadAudio = useCallback((event: React.MouseEvent<HTMLAnchorElement>) => {
    const track = selectedProject ? galleryItems[selectedProject.index] : null;
    if (!track || track.type !== "pulled" || !track.audioUrl) return;
    if (isDownloadDisabled) {
      event.preventDefault();
      return;
    }
    playClickSound();
    if (downloadResetTimeoutRef.current) clearTimeout(downloadResetTimeoutRef.current);
    setIsDownloadDisabled(true);
    downloadResetTimeoutRef.current = setTimeout(() => {
      setIsDownloadDisabled(false);
      downloadResetTimeoutRef.current = null;
    }, 1000);
  }, [isDownloadDisabled, selectedProject]);

  const handleSettingsDisplayModeChange = useCallback((nextMode: DisplayMode) => {
    playClickSound();
    setPendingDisplayMode(nextMode);
  }, []);

  const handleSettingsDisplayStyleChange = useCallback((nextStyle: DisplayStyle) => {
    playClickSound();
    setPendingDisplayStyle(nextStyle);
  }, []);

  const handleDockPinnedChange = useCallback((nextPinned: boolean) => {
    playClickSound();
    setPendingDockPinned(nextPinned);
  }, []);

  const handleSettingsSave = useCallback(() => {
    playClickSound();
    if (!isMobile) {
      setDisplayStyle(pendingDisplayStyle);
      window.localStorage.setItem(displayStyleStorageKey, pendingDisplayStyle);
    }
    setDisplayMode(pendingDisplayMode);
    window.localStorage.setItem(displayModeStorageKey, pendingDisplayMode);

    const nextDockPinned = pendingDockPinned;
    const dockPinChanged = nextDockPinned !== isDockPinned;
    const currentTrackIsStream = selectedProject ? galleryItems[selectedProject.index]?.type === "stream" : false;
    setIsDockPinned(nextDockPinned);
    window.localStorage.setItem(dockPinnedStorageKey, String(nextDockPinned));
    if (isMobile) {
      window.localStorage.setItem(mobileDockModeStorageKey, nextDockPinned ? "pinned" : "scroll");
    }
    if (nextDockPinned) {
      if (floatingPlayerHideTimeoutRef.current != null) {
        window.clearTimeout(floatingPlayerHideTimeoutRef.current);
        floatingPlayerHideTimeoutRef.current = null;
      }
      floatingPlayerHoldUntilRef.current = 0;
      setIsFloatingPlayerExpanded(true);
    } else if (!isMobile && !currentTrackIsStream && (dockPinChanged || isDetailMinimized)) {
      scheduleFloatingPlayerHideAfterSettings(nextDockPinned);
    }

    setIsSettingsOpen(false);
  }, [isDetailMinimized, isDockPinned, isMobile, pendingDisplayMode, pendingDisplayStyle, pendingDockPinned, scheduleFloatingPlayerHideAfterSettings, selectedProject]);

  const handleAgeGateConfirm = useCallback(() => {
    playClickSound();
    window.dispatchEvent(new CustomEvent("hvl-drag-motion", { detail: 120 }));
    setIsAgeGateOpen(false);
    setHasConfirmedAge(true);
    window.localStorage.setItem(ageConfirmationStorageKey, "true");
  }, []);

  const onPointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragState.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - drag.lastX;
    const deltaY = event.clientY - drag.lastY;
    drag.lastX = event.clientX;
    drag.lastY = event.clientY;
    if (deltaX === 0 && deltaY === 0) return;

    const horizontalDragDelta = deltaX * (displayStyle === "art" ? -1 : 1);
    tubeDragDelta.current += horizontalDragDelta * 0.0025;
    tubeSpinVelocity.current = Math.max(
      -2,
      Math.min(2, tubeSpinVelocity.current + horizontalDragDelta * 0.0025),
    );
    tubeScrollTarget.current = Math.max(
      -tubeScrollLimit,
      Math.min(tubeScrollLimit, tubeScrollTarget.current + deltaY * 0.0033),
    );
    const now = performance.now();
    if (now - lastDragSoundAt.current >= 60) {
      lastDragSoundAt.current = now;
      window.dispatchEvent(new CustomEvent("hvl-drag-motion", { detail: Math.hypot(deltaX, deltaY) * 10 }));
    }

    if (Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > 8) {
      drag.hasDragged = true;
      suppressImageClickUntil.current = performance.now() + 250;
    }
  }, [displayStyle]);

  const handleScenePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      resetSceneControlsVisibility();
      onPointerMove(event);
    },
    [onPointerMove, resetSceneControlsVisibility],
  );

  const onPointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;

    resetSceneControlsVisibility();
    window.dispatchEvent(new Event("hvl-audio-unlock"));
    isDragging.current = true;

    dragState.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      lastY: event.clientY,
      hasDragged: false,
    };
  }, [resetSceneControlsVisibility]);

  const onPointerUp = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragState.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    if (drag.hasDragged) suppressImageClickUntil.current = performance.now() + 250;
    dragState.current = null;
    isDragging.current = false;
  }, []);

  const onPointerCancel = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (dragState.current?.pointerId !== event.pointerId) return;
    dragState.current = null;
    isDragging.current = false;
  }, []);

  const onPointerLeave = useCallback(() => {
    dragState.current = null;
    isDragging.current = false;
  }, []);

  const onWheel = useCallback((event: React.WheelEvent<HTMLDivElement>) => {
    resetSceneControlsVisibility();
    const scrollDelta = event.deltaY;
    tubeScrollTarget.current = Math.max(
      -tubeScrollLimit,
      Math.min(tubeScrollLimit, tubeScrollTarget.current - scrollDelta * tubeWheelScrollFactor),
    );
    tubeSpinVelocity.current = Math.max(
      -2,
      Math.min(2, tubeSpinVelocity.current - scrollDelta * 0.0035),
    );

    window.dispatchEvent(
      new CustomEvent("hvl-drag-motion", { detail: Math.hypot(event.deltaX, event.deltaY) }),
    );

    if (scrollDelta < 0) tubeNaturalDir.current = 1;
    else if (scrollDelta > 0) tubeNaturalDir.current = -1;
  }, [resetSceneControlsVisibility]);

  const handleMobileTrackListScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = event.currentTarget.scrollTop;
    const scrollDelta = scrollTop - mobileScrollTopRef.current;
    mobileScrollTopRef.current = scrollTop;

    if (!isMobile && Math.abs(scrollDelta) >= 1) {
      const now = performance.now();
      if (now - lastDragSoundAt.current >= 60) {
        lastDragSoundAt.current = now;
        window.dispatchEvent(new CustomEvent("hvl-drag-motion", { detail: Math.abs(scrollDelta) * 10 }));
      }
    }

    if (!isMobile || isDockPinned || !selectedProject || !isDetailMinimized || Math.abs(scrollDelta) < 2) {
      return;
    }

    setIsFloatingPlayerExpanded(scrollDelta < 0 || scrollTop <= 4);
  }, [isDetailMinimized, isDockPinned, isMobile, selectedProject]);

  const selectedTrack = selectedProject ? galleryItems[selectedProject.index] : null;
  const handleTrackVideoToggle = useCallback((showVideo: boolean) => {
    if (!selectedTrack?.videoUrl) return;
    playClickSound();
    setIsTrackVideoActive(showVideo);
  }, [selectedTrack?.numberTrack, selectedTrack?.videoUrl]);
  const normalizedLyricsLines = (selectedTrack?.lyrics?.split("\n") ?? []).reduce<string[]>((lines, line) => {
    const normalizedLine = line.trim().length > 0 ? line : "";
    if (normalizedLine === "" && lines[lines.length - 1] === "") return lines;
    lines.push(normalizedLine);
    return lines;
  }, []);
  const lyricsLines = normalizedLyricsLines[0] === "" ? normalizedLyricsLines.slice(1) : normalizedLyricsLines;
  let timedLyricsLineIndex = 0;
  const lyricsEntries = lyricsLines.map((text) => {
    const timestamp = text.length > 0
      ? selectedTrack?.lyricsTimestamps?.[timedLyricsLineIndex++] ?? null
      : null;
    const startTime = timestamp;
    return { text, startTime };
  });
  const activeLyricsLineIndex = lyricsEntries.reduce((activeIndex, entry, index) => (
    entry.startTime != null && currentTime >= entry.startTime ? index : activeIndex
  ), -1);
  const activeArtistHighlight = selectedTrack?.artistHighlights?.find(
    ({ startTime, endTime }) => currentTime >= startTime && currentTime < endTime,
  );
  const activeArtists = activeArtistHighlight
    ? (Array.isArray(activeArtistHighlight.artist) ? activeArtistHighlight.artist : [activeArtistHighlight.artist])
    : [];
  const nextTrackResult = selectedProject ? getNextTrack(selectedProject.index, displayMode) : null;
  const previousTrackResult = selectedProject ? getPreviousTrack(selectedProject.index, displayMode) : null;
  const nextTrack = nextTrackResult?.track ?? null;
  const isStreaming = selectedTrack?.type === "stream" && !selectedTrack.audioUrl;
  const playbackProgress = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;
  const isAutoNextEnabled =
    showOverlay && isStreaming && Boolean(selectedProject);
  const detailDuration = isStreaming
    ? streamDisplayDelay
    : duration > 0
      ? duration
      : selectedTrack?.durationSeconds ?? 0;
  const detailCurrentTime = isStreaming ? streamElapsedTime : currentTime;
  const streamPlaybackProgress = streamDisplayDelay > 0
    ? Math.min(Math.max((streamElapsedTime / streamDisplayDelay) * 100, 0), 100)
    : 0;
  const detailPlaybackProgress = detailDuration > 0
    ? isStreaming
      ? streamPlaybackProgress
      : Math.min((detailCurrentTime / detailDuration) * 100, 100)
    : playbackProgress;
  const isDetailPlaying = isStreaming ? !isAutoNextPaused : isPlaying;
  const dockDuration = isStreaming
    ? streamDisplayDelay
    : duration > 0
      ? duration
      : selectedTrack?.durationSeconds ?? 0;
  const dockCurrentTime = isStreaming
    ? streamElapsedTime
    : currentTime;
  const dockPlaybackProgress = isStreaming
    ? streamPlaybackProgress
    : dockDuration > 0
      ? Math.min((dockCurrentTime / dockDuration) * 100, 100)
    : playbackProgress;
  const isDockPlaying = isStreaming ? !isAutoNextPaused : isPlaying;
  const detailPreviewTrack = isMobile
    ? nextTrack
    : detailNavigationPreview === "previous"
      ? previousTrackResult?.track ?? null
      : detailNavigationPreview === "next"
        ? nextTrack
        : null;
  const areNextControlsVisible = Boolean(detailPreviewTrack) && (
    isMobile
      ? isAutoNextEnabled && autoNextRemaining <= streamDisplayDelay
      : true
  );

  const handleImageClick = useCallback(
    (
      projectName: string,
      imageUrl: string,
      textureIndex: number,
      presentation?: TrackPresentation,
      keepLyricsOpen = false,
    ) => {
      if (closeOverlayTimeoutRef.current != null) {
        window.clearTimeout(closeOverlayTimeoutRef.current);
        closeOverlayTimeoutRef.current = null;
      }
      const audio = audioRef.current;
      const track = galleryItems[textureIndex];
      const isTrackStreamPreview = track?.type === "stream" && !track.audioUrl;
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
        audio.removeAttribute("src");

        if (track?.audioUrl) {
          audio.src = track.audioUrl;
          audio.load();
        } else {
          audio.load();
        }
      }
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      setAutoNextRemaining(streamDisplayDelay);
      setStreamElapsedTime(0);
      setStreamTimerRevision((revision) => revision + 1);
      setIsAutoNextPaused(false);
      autoNextDeadlineRef.current = null;
      setDetailNavigationPreview(null);
      const nextPresentation = presentation ?? (isDetailMinimizedRef.current ? "minimized" : "detail");
      const shouldRestoreLyrics = keepLyricsOpen || lyricsShouldReopenRef.current;
      const shouldOpenLyrics = track?.type === "pulled"
        && nextPresentation === "detail"
        && shouldRestoreLyrics;
      lyricsShouldReopenRef.current = track?.type === "stream"
        ? keepLyricsOpen || lyricsShouldReopenRef.current
        : Boolean(shouldOpenLyrics);
      setIsLyricsClosing(false);
      setIsLyricsOpen(Boolean(shouldOpenLyrics));
      setIsSongAnnotationClosing(false);
      setIsSongAnnotationOpen(false);
      setIsDownloadModalOpen(false);
      setIsTrackVideoActive(Boolean(track?.videoUrl));
      isDetailMinimizedRef.current = nextPresentation === "minimized";
      setIsDetailMinimized(isDetailMinimizedRef.current);
      setIsFloatingPlayerExpanded(true);
      if (isTrackStreamPreview) {
        if (floatingPlayerHideTimeoutRef.current != null) {
          window.clearTimeout(floatingPlayerHideTimeoutRef.current);
          floatingPlayerHideTimeoutRef.current = null;
        }
        floatingPlayerHoldUntilRef.current = 0;
        if (!isMobile) {
          setIsDockPinned(true);
          window.localStorage.setItem(dockPinnedStorageKey, "true");
        }
      }
      if (!isMobile && nextPresentation === "minimized" && !isDockPinned && !isTrackStreamPreview) {
        if (floatingPlayerHideTimeoutRef.current != null) {
          window.clearTimeout(floatingPlayerHideTimeoutRef.current);
        }
        floatingPlayerHoldUntilRef.current = Date.now() + 2_000;
        floatingPlayerHideTimeoutRef.current = window.setTimeout(() => {
          setIsFloatingPlayerExpanded(false);
          floatingPlayerHideTimeoutRef.current = null;
          floatingPlayerHoldUntilRef.current = 0;
        }, 2_000);
      }
      setSelectedProject({ name: projectName, imageUrl, index: textureIndex });
      setShowOverlay(true);
      if (track?.audioUrl && audio) {
        void audio.play().catch(() => setIsPlaying(false));
      }
      if (isMobile) {
        resetDetailButtonsVisibility();
      } else {
        resetDetailButtonsVisibility();
      }
    },
    [isDockPinned, isMobile, resetDetailButtonsVisibility, streamDisplayDelay],
  );

  const handleNextTrack = useCallback((presentation?: TrackPresentation) => {
    if (!nextTrackResult) return;

    const nextPresentation = presentation ?? (isDetailMinimizedRef.current ? "minimized" : "detail");

    handleImageClick(
      nextTrackResult.track.title,
      nextTrackResult.track.imageUrl,
      nextTrackResult.index,
      nextPresentation,
      isLyricsOpen && nextPresentation === "detail",
    );
  }, [handleImageClick, isLyricsOpen, nextTrackResult]);

  const handlePreviousTrack = useCallback((presentation: TrackPresentation = "minimized") => {
    if (!previousTrackResult) return;

    handleImageClick(
      previousTrackResult.track.title,
      previousTrackResult.track.imageUrl,
      previousTrackResult.index,
      presentation,
      isLyricsOpen && presentation === "detail",
    );
  }, [handleImageClick, isLyricsOpen, previousTrackResult]);

  useEffect(() => {
    handleNextTrackRef.current = handleNextTrack;
  }, [handleNextTrack]);

  const handleNextButtonClick = useCallback((presentation?: TrackPresentation) => {
    playClickSound();
    handleNextTrack(presentation);
  }, [handleNextTrack]);

  const handleRepeatModeToggle = useCallback((toastPlacement?: "detail" | "dock") => {
    playClickSound();
    setRepeatAnimationNonce((currentNonce) => currentNonce + 1);
    setIsRepeatAnimating(true);
    if (repeatAnimationTimeoutRef.current != null) {
      window.clearTimeout(repeatAnimationTimeoutRef.current);
    }
    repeatAnimationTimeoutRef.current = window.setTimeout(() => {
      setIsRepeatAnimating(false);
      repeatAnimationTimeoutRef.current = null;
    }, 320);

    const nextMode = repeatMode === "off" ? "all" : repeatMode === "all" ? "one" : "off";
    setRepeatMode(nextMode);
    if (toastPlacement && selectedProject) {
      setRepeatToastPlacement(toastPlacement);
      setRepeatToastMessage(
        nextMode === "all"
          ? "Phát Lại Bài Hát 1 Lần"
          : nextMode === "one"
            ? "Chỉ Phát Lại Bài Hát Này"
            : "Không Phát Lại Bài Hát",
      );
      if (repeatToastTimeoutRef.current != null) {
        window.clearTimeout(repeatToastTimeoutRef.current);
      }
      repeatToastTimeoutRef.current = window.setTimeout(() => {
        setRepeatToastMessage(null);
        repeatToastTimeoutRef.current = null;
      }, 2_200);
    }
  }, [repeatMode, selectedProject]);

  const handleAutoNextPauseToggle = useCallback(() => {
    playClickSound();
    const audio = audioRef.current;
    if (isAutoNextPaused) {
      autoNextDeadlineRef.current = performance.now() + Math.max(0, streamDisplayDelay - streamElapsedTime) * 1_000;
      setIsAutoNextPaused(false);
      if (selectedTrack?.audioUrl && audio) {
        void audio.play().catch(() => setIsPlaying(false));
      }
      return;
    }

    if (autoNextDeadlineRef.current != null) {
      const remainingMilliseconds = Math.max(0, autoNextDeadlineRef.current - performance.now());
      setAutoNextRemaining(Math.ceil(remainingMilliseconds / 1_000));
      setStreamElapsedTime(
        Math.min(streamDisplayDelay, Math.max(0, streamDisplayDelay - remainingMilliseconds / 1_000)),
      );
    }
    autoNextDeadlineRef.current = null;
    setIsAutoNextPaused(true);
    if (selectedTrack?.audioUrl && audio) {
      audio.pause();
    }
  }, [isAutoNextPaused, selectedTrack?.audioUrl, streamDisplayDelay, streamElapsedTime]);

  const handleMinimizeProject = useCallback(() => {
    playClickSound();
    isDetailMinimizedRef.current = true;
    lyricsShouldReopenRef.current = false;
    setIsLyricsOpen(false);
    setIsSongAnnotationOpen(false);

    if (isMobile) {
      if (detailMinimizeTimeoutRef.current != null) {
        window.clearTimeout(detailMinimizeTimeoutRef.current);
      }
      setIsDockHidingForDetail(false);
      setIsDetailMinimizing(true);
      detailMinimizeTimeoutRef.current = window.setTimeout(() => {
        setIsDetailMinimized(true);
        setIsDetailMinimizing(false);
        detailMinimizeTimeoutRef.current = null;
      }, mobileSidePanelTransitionDuration);
    } else {
      setIsDetailMinimized(true);
    }
    setIsFloatingPlayerExpanded(true);
    if (!isMobile && !isDockPinned && !isStreaming) {
      if (floatingPlayerHideTimeoutRef.current != null) {
        window.clearTimeout(floatingPlayerHideTimeoutRef.current);
      }
      floatingPlayerHoldUntilRef.current = Date.now() + 2_000;
      floatingPlayerHideTimeoutRef.current = window.setTimeout(() => {
        setIsFloatingPlayerExpanded(false);
        floatingPlayerHideTimeoutRef.current = null;
        floatingPlayerHoldUntilRef.current = 0;
      }, 2_000);
    }
    setAreDetailButtonsVisible(true);
  }, [isDockPinned, isMobile, isStreaming]);

  const handleRestoreProject = useCallback(() => {
    playClickSound();
    if (detailMinimizeTimeoutRef.current != null) {
      window.clearTimeout(detailMinimizeTimeoutRef.current);
      detailMinimizeTimeoutRef.current = null;
    }
    if (isMobile && isDetailMinimized) {
      if (detailRestoreTimeoutRef.current != null) {
        window.clearTimeout(detailRestoreTimeoutRef.current);
      }
      setIsDockHidingForDetail(true);
      isDetailMinimizedRef.current = false;
      setIsDetailMinimizing(false);
      setIsDetailMinimized(false);
      setShowOverlay(true);
      resetDetailButtonsVisibility();
      detailRestoreTimeoutRef.current = window.setTimeout(() => {
        setIsDockHidingForDetail(false);
        detailRestoreTimeoutRef.current = null;
      }, 400);
      return;
    }
    isDetailMinimizedRef.current = false;
    setIsDetailMinimizing(false);
    setIsDetailMinimized(false);
    setIsDockHidingForDetail(false);
    setShowOverlay(true);
    resetDetailButtonsVisibility();
  }, [isDetailMinimized, isMobile, resetDetailButtonsVisibility]);

  const clearFloatingPlayerHideTimeout = useCallback(() => {
    if (floatingPlayerHideTimeoutRef.current != null) {
      window.clearTimeout(floatingPlayerHideTimeoutRef.current);
      floatingPlayerHideTimeoutRef.current = null;
    }
  }, []);

  const handleFloatingPlayerMouseEnter = useCallback(() => {
    clearFloatingPlayerHideTimeout();
    floatingPlayerHoldUntilRef.current = 0;
    setIsFloatingPlayerExpanded(true);
  }, [clearFloatingPlayerHideTimeout]);

  const handleFloatingPlayerMouseLeave = useCallback(() => {
    clearFloatingPlayerHideTimeout();
    if (isDockPinned || isStreaming) {
      setIsFloatingPlayerExpanded(true);
      return;
    }
    const hideDelay = Math.max(1000, floatingPlayerHoldUntilRef.current - Date.now());
    floatingPlayerHideTimeoutRef.current = window.setTimeout(() => {
      setIsFloatingPlayerExpanded(false);
      floatingPlayerHideTimeoutRef.current = null;
      floatingPlayerHoldUntilRef.current = 0;
    }, hideDelay);
  }, [clearFloatingPlayerHideTimeout, isDockPinned, isStreaming]);

  useEffect(() => {
    if (!isAutoNextEnabled) {
      setAutoNextRemaining(streamDisplayDelay);
      setStreamElapsedTime(0);
      setIsAutoNextPaused(false);
      autoNextDeadlineRef.current = null;
      return;
    }

    if (isAutoNextPaused) return;

    const deadline = autoNextDeadlineRef.current ?? performance.now() + streamDisplayDelay * 1_000;
    autoNextDeadlineRef.current = deadline;
    let hasAdvanced = false;
    let animationFrameId = 0;
    const updateCountdown = () => {
      const remainingMilliseconds = Math.max(0, deadline - performance.now());
      const remaining = Math.ceil(remainingMilliseconds / 1_000);
      setStreamElapsedTime(
        Math.min(streamDisplayDelay, Math.max(0, streamDisplayDelay - remainingMilliseconds / 1_000)),
      );
      setAutoNextRemaining(remaining);

      if (remaining === 0 && !hasAdvanced) {
        hasAdvanced = true;
        handleNextTrackRef.current();
        return;
      }

      animationFrameId = window.requestAnimationFrame(updateCountdown);
    };

    updateCountdown();
    return () => window.cancelAnimationFrame(animationFrameId);
  }, [isAutoNextEnabled, isAutoNextPaused, nextTrackResult?.index, selectedProject?.index, streamDisplayDelay, streamTimerRevision]);

  const handleTrackEnded = useCallback(() => {
    if (repeatMode === "all" || repeatMode === "one") {
      const audio = audioRef.current;
      if (!audio) return;

      // "all" is the UI's single-repeat mode: consume it after replaying once.
      if (repeatMode === "all") {
        setRepeatMode("off");
      }

      audio.currentTime = 0;
      void audio.play().catch(() => setIsPlaying(false));
      return;
    }

    setIsPlaying(false);
    handleNextTrack();
  }, [handleNextTrack, repeatMode]);

  const handlePlayPause = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !selectedTrack?.audioUrl) return;

    if (audio.paused) {
      try {
        await audio.play();
      } catch {
        setIsPlaying(false);
      }
      return;
    }

    audio.pause();
  }, [selectedTrack]);

  const handlePlayPauseButtonClick = useCallback(() => {
    playClickSound();
    void handlePlayPause();
  }, [handlePlayPause]);

  const handleDockPlayPauseButtonClick = useCallback(() => {
    if (isStreaming) {
      handleAutoNextPauseToggle();
      return;
    }

    playClickSound();
    void handlePlayPause();
  }, [handleAutoNextPauseToggle, handlePlayPause, isStreaming]);

  const handleDetailPlayPauseButtonClick = useCallback(() => {
    if (isStreaming) {
      handleAutoNextPauseToggle();
      return;
    }

    handlePlayPauseButtonClick();
  }, [handleAutoNextPauseToggle, handlePlayPauseButtonClick, isStreaming]);

  const getProgressSeekTime = useCallback(
    (element: HTMLDivElement, clientX: number) => {
      if (!duration) return null;

      const bounds = element.getBoundingClientRect();
      const progress = Math.min(Math.max((clientX - bounds.left) / bounds.width, 0), 1);
      return progress * duration;
    },
    [duration],
  );

  const previewAudioSeek = useCallback((nextTime: number) => {
    setCurrentTime(nextTime);
  }, []);

  const completeAudioSeek = useCallback((audio: HTMLAudioElement, nextTime: number, shouldResume: boolean) => {
    pendingAudioSeekCleanupRef.current?.();
    const requestId = audioSeekRequestRef.current + 1;
    audioSeekRequestRef.current = requestId;
    const targetTime = Math.min(Math.max(nextTime, 0), Number.isFinite(audio.duration) ? audio.duration : nextTime);
    const warmupDuration = 0.6;
    const shouldWarmUp = shouldResume && targetTime > warmupDuration;
    const seekStartTime = shouldWarmUp ? targetTime - warmupDuration : targetTime;
    let fallbackTimeout: number | null = null;
    let warmupAnimationFrame: number | null = null;
    let hasSettled = false;
    let isWarmingUp = false;
    let restorePlayback: (() => void) | null = null;

    const cleanUp = () => {
      audio.removeEventListener("seeked", handleSeeked);
      if (fallbackTimeout != null) {
        window.clearTimeout(fallbackTimeout);
      }
      if (warmupAnimationFrame != null) {
        window.cancelAnimationFrame(warmupAnimationFrame);
      }
      restorePlayback?.();
      restorePlayback = null;
      if (pendingAudioSeekCleanupRef.current === cleanUp) {
        pendingAudioSeekCleanupRef.current = null;
      }
    };

    const settleAtCurrentPosition = () => {
      hasSettled = true;
      cleanUp();
      setCurrentTime(audio.currentTime);
    };

    const finishWarmup = () => {
      if (audioSeekRequestRef.current !== requestId) {
        cleanUp();
        return;
      }

      if (audio.currentTime < targetTime - 0.02) {
        warmupAnimationFrame = window.requestAnimationFrame(finishWarmup);
        return;
      }

      audio.pause();
      audio.currentTime = targetTime;
      restorePlayback?.();
      restorePlayback = null;
      settleAtCurrentPosition();
      if (shouldResume) void audio.play().catch(() => setIsPlaying(false));
    };

    const startWarmup = () => {
      const mutedBeforeWarmup = audio.muted;
      const playbackRateBeforeWarmup = audio.playbackRate;
      restorePlayback = () => {
        audio.muted = mutedBeforeWarmup;
        audio.playbackRate = playbackRateBeforeWarmup;
      };
      audio.muted = true;
      audio.playbackRate = 4;
      void audio.play()
        .then(() => {
          warmupAnimationFrame = window.requestAnimationFrame(finishWarmup);
        })
        .catch(() => {
          restorePlayback?.();
          restorePlayback = null;
          hasSettled = true;
          cleanUp();
          setCurrentTime(audio.currentTime);
          setIsPlaying(false);
        });
    };

    const finishSeek = () => {
      if (hasSettled) return;
      if (audioSeekRequestRef.current !== requestId) {
        cleanUp();
        return;
      }
      if (audio.seeking) {
        fallbackTimeout = window.setTimeout(finishSeek, 40);
        return;
      }

      if (shouldWarmUp) {
        if (isWarmingUp) return;
        isWarmingUp = true;
        startWarmup();
        return;
      }

      settleAtCurrentPosition();
      if (shouldResume) void audio.play().catch(() => setIsPlaying(false));
    };

    const handleSeeked = () => finishSeek();
    audio.addEventListener("seeked", handleSeeked);
    pendingAudioSeekCleanupRef.current = cleanUp;
    audio.currentTime = seekStartTime;

    // Some engines do not emit `seeked` when the requested time equals the current frame.
    fallbackTimeout = window.setTimeout(finishSeek, 500);
  }, []);

  const handleLyricsLineClick = useCallback(
    (startTime: number | null) => {
      const audio = audioRef.current;
      if (!audio || startTime == null || selectedTrack?.type !== "pulled" || !selectedTrack.audioUrl) return;

      audio.pause();
      completeAudioSeek(audio, startTime, true);
    },
    [completeAudioSeek, selectedTrack],
  );

  const handleLyricsLineKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>, startTime: number | null) => {
      if (startTime == null || (event.key !== "Enter" && event.key !== " ")) return;

      event.preventDefault();
      handleLyricsLineClick(startTime);
    },
    [handleLyricsLineClick],
  );

  const handleProgressPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.stopPropagation();
      const audio = audioRef.current;
      if (!audio || !duration) return;

      audioSeekRequestRef.current += 1;
      isSeekingRef.current = true;
      resumeAfterSeekRef.current = !audio.paused && !audio.ended;
      audio.pause();
      setIsSeeking(true);
      event.currentTarget.setPointerCapture(event.pointerId);
      const nextTime = getProgressSeekTime(event.currentTarget, event.clientX);
      if (nextTime != null) previewAudioSeek(nextTime);
    },
    [duration, getProgressSeekTime, previewAudioSeek],
  );

  const handleProgressPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!isSeekingRef.current) return;
      event.stopPropagation();
      const nextTime = getProgressSeekTime(event.currentTarget, event.clientX);
      if (nextTime != null) previewAudioSeek(nextTime);
    },
    [getProgressSeekTime, previewAudioSeek],
  );

  const finishProgressSeek = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!isSeekingRef.current) return;
    event.stopPropagation();
    const nextTime = getProgressSeekTime(event.currentTarget, event.clientX);
    isSeekingRef.current = false;
    setIsSeeking(false);
    const audio = audioRef.current;
    if (audio && nextTime != null) {
      completeAudioSeek(audio, nextTime, resumeAfterSeekRef.current);
    }
    resumeAfterSeekRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, [completeAudioSeek, getProgressSeekTime]);

  const cancelProgressSeek = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    event.stopPropagation();
    isSeekingRef.current = false;
    setIsSeeking(false);
    const audio = audioRef.current;
    if (audio) {
      completeAudioSeek(audio, audio.currentTime, resumeAfterSeekRef.current);
    }
    resumeAfterSeekRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, [completeAudioSeek]);

  useEffect(() => {
    const media = window.matchMedia(mobileMediaQuery);
    const updateMobileMode = () => {
      const mobile = media.matches;
      setIsMobile(mobile);
      if (mobile) {
        setDisplayStyle("list");
      } else {
        const storedDisplayStyle = window.localStorage.getItem(displayStyleStorageKey);
        setDisplayStyle(storedDisplayStyle === "list" || storedDisplayStyle === "art" ? storedDisplayStyle : "museum");
      }
      setIsPresentationReady(true);
    };
    updateMobileMode();
    media.addEventListener("change", updateMobileMode);
    return () => media.removeEventListener("change", updateMobileMode);
  }, []);

  useEffect(() => {
    if (!isMobile) return;

    const storedMobileDockMode = window.localStorage.getItem(mobileDockModeStorageKey);
    const mobileDockPinned = storedMobileDockMode !== "scroll";
    setIsDockPinned(mobileDockPinned);
    setPendingDockPinned(mobileDockPinned);
    window.localStorage.setItem(dockPinnedStorageKey, String(mobileDockPinned));
    if (storedMobileDockMode !== "pinned" && storedMobileDockMode !== "scroll") {
      window.localStorage.setItem(mobileDockModeStorageKey, "pinned");
    }
  }, [isMobile]);

  useEffect(() => {
    const hasStoredConfirmation = window.localStorage.getItem(ageConfirmationStorageKey) === "true";

    setHasConfirmedAge(hasStoredConfirmation);
    setIsAgeGateOpen(!hasStoredConfirmation);
    setIsAgeGateStateReady(true);
  }, []);

  useEffect(() => {
    const storedDisplayMode = window.localStorage.getItem(displayModeStorageKey);
    if (storedDisplayMode === "full" || storedDisplayMode === "pulled") {
      setDisplayMode(storedDisplayMode);
    }

    const storedDockPinned = window.localStorage.getItem(dockPinnedStorageKey);
    if (storedDockPinned === "true" || storedDockPinned === "false") {
      setIsDockPinned(storedDockPinned === "true");
    }

  }, []);

  useEffect(() => {
    if (!isSettingsOpen) return;

    const handleSettingsKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsSettingsOpen(false);
    };

    window.addEventListener("keydown", handleSettingsKeyDown);
    return () => window.removeEventListener("keydown", handleSettingsKeyDown);
  }, [isSettingsOpen]);

  useEffect(() => {
    if (!isDownloadModalOpen) return;

    const handleDownloadModalKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleDownloadClose();
    };

    window.addEventListener("keydown", handleDownloadModalKeyDown);
    return () => window.removeEventListener("keydown", handleDownloadModalKeyDown);
  }, [handleDownloadClose, isDownloadModalOpen]);

  useEffect(() => {
    if (!isDownloadModalOpen || !selectedTrack?.audioUrl || selectedTrack.type !== "pulled") return;

    let isCurrent = true;
    setDownloadAudioSize(null);
    setIsDownloadSizeLoading(true);
    const audioUrl = new URL(selectedTrack.audioUrl, window.location.origin).href;

    fetch(audioUrl, { method: "HEAD", cache: "no-store" })
      .then((response) => {
        const contentLength = response.headers.get("content-length");
        const parsedSize = contentLength ? Number(contentLength) : null;
        if (isCurrent) setDownloadAudioSize(parsedSize && Number.isFinite(parsedSize) ? parsedSize : null);
      })
      .catch(() => {
        if (isCurrent) setDownloadAudioSize(null);
      })
      .finally(() => {
        if (isCurrent) setIsDownloadSizeLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [isDownloadModalOpen, selectedTrack?.audioUrl, selectedTrack?.type]);

  useEffect(() => {
    const handleEscapeKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (document.fullscreenElement === document.documentElement) return;
      if (isWebFullscreen) {
        setIsWebFullscreen(false);
        return;
      }
      if (isSongAnnotationOpen) {
        handleSongAnnotationClose();
        return;
      }
      if (!isLyricsOpen) return;
      handleLyricsClose();
    };

    window.addEventListener("keydown", handleEscapeKeyDown);
    return () => window.removeEventListener("keydown", handleEscapeKeyDown);
  }, [handleLyricsClose, handleSongAnnotationClose, isSongAnnotationOpen, isWebFullscreen, isLyricsOpen]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsWebFullscreen(document.fullscreenElement === document.documentElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (!isLyricsOpen || !isDetailPlaying || isLyricsAutoScrollPaused || activeLyricsLineIndex < 0) return;

    const activeLine = lyricsBodyRef.current?.querySelector<HTMLElement>(
      `[data-lyrics-index="${activeLyricsLineIndex}"]`,
    );
    activeLine?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeLyricsLineIndex, isDetailPlaying, isLyricsAutoScrollPaused, isLyricsOpen]);

  useEffect(() => {
    if (selectedProject?.index == null) return;

    const lyricsBody = lyricsBodyRef.current;
    if (!lyricsBody) return;

    lyricsBody.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [selectedProject?.index]);

  useEffect(() => {
    if (selectedProject?.index == null) return;

    songAnnotationBodyRef.current?.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [selectedProject?.index]);

  useEffect(() => {
    if (!hasConfirmedAge || isAgeGateOpen || (selectedProject && !isDetailMinimized) || isMobile) {
      if (sceneControlsTimeoutRef.current != null) {
        window.clearTimeout(sceneControlsTimeoutRef.current);
        sceneControlsTimeoutRef.current = null;
      }
      setAreSceneControlsVisible(true);
      return;
    }

    resetSceneControlsVisibility();
  }, [hasConfirmedAge, isAgeGateOpen, isDetailMinimized, isMobile, resetSceneControlsVisibility, selectedProject]);

  useEffect(() => {
    return () => {
      if (closeOverlayTimeoutRef.current != null) window.clearTimeout(closeOverlayTimeoutRef.current);
      if (detailButtonsTimeoutRef.current != null) window.clearTimeout(detailButtonsTimeoutRef.current);
      if (sceneControlsTimeoutRef.current != null) window.clearTimeout(sceneControlsTimeoutRef.current);
      if (displayModeStatusTimeoutRef.current != null) window.clearTimeout(displayModeStatusTimeoutRef.current);
      if (repeatAnimationTimeoutRef.current != null) window.clearTimeout(repeatAnimationTimeoutRef.current);
      if (repeatToastTimeoutRef.current != null) window.clearTimeout(repeatToastTimeoutRef.current);
      if (detailMinimizeTimeoutRef.current != null) window.clearTimeout(detailMinimizeTimeoutRef.current);
      if (detailRestoreTimeoutRef.current != null) window.clearTimeout(detailRestoreTimeoutRef.current);
      if (lyricsAutoScrollPauseTimeoutRef.current != null) window.clearTimeout(lyricsAutoScrollPauseTimeoutRef.current);
      if (songAnnotationClosingTimeoutRef.current != null) window.clearTimeout(songAnnotationClosingTimeoutRef.current);
      if (pendingLyricsOpenFrameRef.current != null) window.cancelAnimationFrame(pendingLyricsOpenFrameRef.current);
      if (pendingSongAnnotationOpenFrameRef.current != null) window.cancelAnimationFrame(pendingSongAnnotationOpenFrameRef.current);
      clearFloatingPlayerHideTimeout();
    };
  }, [clearFloatingPlayerHideTimeout]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    const mediaSession = navigator.mediaSession;
    const setAction = (action: MediaSessionAction, handler: MediaSessionActionHandler | null) => {
      try {
        mediaSession.setActionHandler(action, handler);
      } catch {
        // Older browsers may expose Media Session without every action handler.
      }
    };

    if (!selectedTrack) {
      mediaSession.metadata = null;
      mediaSession.playbackState = "none";
      return;
    }

    mediaSession.metadata = new MediaMetadata({
      title: selectedTrack.title,
      artist: selectedTrack.subtitle,
      album: "HVL",
      artwork: [
        {
          src: new URL(selectedTrack.imageUrl, window.location.origin).href,
          sizes: "1000x1000",
          type: "image/png",
        },
      ],
    });
    const canControlAudio = selectedTrack.type === "pulled";
    mediaSession.playbackState = canControlAudio ? (isPlaying ? "playing" : "paused") : "none";

    setAction("play", canControlAudio ? () => void audioRef.current?.play() : null);
    setAction("pause", canControlAudio ? () => audioRef.current?.pause() : null);
    setAction("nexttrack", () => handleNextTrack());
    setAction("seekbackward", canControlAudio ? (details) => {
      const audio = audioRef.current;
      if (!audio) return;
      const nextTime = Math.max(0, audio.currentTime - (details.seekOffset ?? 10));
      audio.currentTime = nextTime;
      setCurrentTime(nextTime);
    } : null);
    setAction("seekforward", canControlAudio ? (details) => {
      const audio = audioRef.current;
      if (!audio || !Number.isFinite(audio.duration)) return;
      const nextTime = Math.min(audio.duration, audio.currentTime + (details.seekOffset ?? 10));
      audio.currentTime = nextTime;
      setCurrentTime(nextTime);
    } : null);
    setAction("seekto", canControlAudio ? (details) => {
      const audio = audioRef.current;
      if (!audio || details.seekTime == null || !Number.isFinite(audio.duration)) return;
      const nextTime = Math.min(Math.max(details.seekTime, 0), audio.duration);
      audio.currentTime = nextTime;
      setCurrentTime(nextTime);
    } : null);

    return () => {
      setAction("play", null);
      setAction("pause", null);
      setAction("nexttrack", null);
      setAction("seekbackward", null);
      setAction("seekforward", null);
      setAction("seekto", null);
    };
  }, [handleNextTrack, isPlaying, selectedTrack]);

  useEffect(() => {
    if (!("mediaSession" in navigator) || !duration || !Number.isFinite(duration)) return;

    try {
      navigator.mediaSession.setPositionState({
        duration,
        position: Math.min(Math.max(currentTime, 0), duration),
        playbackRate: audioRef.current?.playbackRate ?? 1,
      });
    } catch {
      // Position state is optional on some browsers.
    }
  }, [currentTime, duration]);

  return (
    <div className="sceneRoot">
      <div
      className={`sceneRoot__content ${displayStyle === "art" ? "is-art-style" : ""} ${selectedProject && !isDetailMinimized ? "is-detail-open" : ""} ${!isAgeGateStateReady || isAgeGateOpen ? "is-blurred" : ""}`}
      onPointerDown={isMobile || displayStyle === "list" || (selectedProject && !isDetailMinimized) ? undefined : onPointerDown}
      onPointerMove={isMobile || (selectedProject && !isDetailMinimized) ? undefined : handleScenePointerMove}
      onPointerUp={isMobile || displayStyle === "list" || (selectedProject && !isDetailMinimized) ? undefined : onPointerUp}
      onPointerCancel={isMobile || displayStyle === "list" || (selectedProject && !isDetailMinimized) ? undefined : onPointerCancel}
      onPointerLeave={isMobile || displayStyle === "list" || (selectedProject && !isDetailMinimized) ? undefined : onPointerLeave}
      onWheel={isMobile || displayStyle === "list" || (selectedProject && !isDetailMinimized) ? undefined : onWheel}
    >
      {isPresentationReady && (!selectedProject || isDetailMinimized) && (isMobile || displayStyle === "list") && (
        <>
          <h1 className={`main-title ${!isMobile ? "list-view-header" : ""}`}>
            <NextImage
              src="/images/hvl-logo.svg"
              alt="HVL"
              width={3790}
              height={654}
              priority
            />
          </h1>
          <div className={isMobile ? "mobile-title-blur" : "list-view-header__blur"} aria-hidden="true">
            {Array.from({ length: 8 }, (_, index) => (
              <div key={index} />
            ))}
          </div>
        </>
      )}

      {isPresentationReady && (!selectedProject || isDetailMinimized) && !isMobile && displayStyle === "art" && (
        <h1 className="art-style-title">
          <NextImage
            src="/images/hvl-logo.svg"
            alt="HVL"
            width={3790}
            height={654}
            priority
          />
        </h1>
      )}

      {!isPresentationReady ? null : isMobile || displayStyle === "list" ? (
        <HVLTrackList
          items={galleryItems}
          onSelect={handleImageClick}
          onScroll={handleMobileTrackListScroll}
          displayMode={displayMode}
          playingTrackIndex={showOverlay && isDetailPlaying && selectedProject ? selectedProject.index : null}
          onPlayClick={playClickSound}
          formatTime={formatTime}
          getTrackLabel={getTrackLabel}
        />
      ) : (
        <HVLCanvas
          items={galleryItems}
          tubeCols={tubeCols}
          tubeRowSpacing={tubeRowSpacing}
          tubeScrollLimit={tubeScrollLimit}
          scrollTargetRef={tubeScrollTarget}
          focusItemRef={tubeFocusItem}
          isDraggingRef={isDragging}
          spinVelocityRef={tubeSpinVelocity}
          naturalDirRef={tubeNaturalDir}
          dragDeltaRef={tubeDragDelta}
          suppressClickUntilRef={suppressImageClickUntil}
          onImageClick={handleImageClick}
          displayMode={displayMode}
          displayStyle={displayStyle}
          playingTrackIndex={showOverlay && isDetailPlaying && selectedProject ? selectedProject.index : null}
        />
      )}

      {isMobile && (!selectedProject || isDetailMinimized) && (
        <div className="mobile-bottom-blur" aria-hidden="true">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} />
          ))}
        </div>
      )}

      <audio
        ref={audioRef}
        preload="metadata"
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onSeeked={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={handleTrackEnded}
      />
      {hasConfirmedAge && !isAgeGateOpen && !selectedProject && (
        <div className={`scene-utility-controls ${areSceneControlsVisible ? "" : "is-hidden"}`}>
          <button
            className={`display-mode-toggle ${isDisplayModeStatusVisible ? "is-status-visible" : ""}`}
            type="button"
            onClick={handleDisplayModeToggle}
            onPointerDown={(event) => {
              event.stopPropagation();
              resetSceneControlsVisibility();
            }}
            aria-label={displayMode === "full" ? "Chỉ hiển thị các bài có nhạc" : "Hiển thị toàn bộ album"}
            aria-pressed={displayMode === "pulled"}
            tabIndex={areSceneControlsVisible ? 0 : -1}
          >
            <span className="display-mode-toggle__status" aria-hidden="true">
              {displayMode === "full" ? "FULL ALBUM" : "PULLED TRACK"}
            </span>
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
              <path d="M11 12H3" />
              <path d="M16 6H3" />
              <path d="M16 18H3" />
              <path d="m19 10-4 4" />
              <path d="m15 10 4 4" />
            </svg>
          </button>
        </div>
      )}

      {isMobile && hasConfirmedAge && !isAgeGateOpen && (!selectedProject || isDetailMinimized) && (
        <button
          className={`mobile-header-display-mode ${isDisplayModeStatusVisible ? "is-status-visible" : ""}`}
          type="button"
          onClick={handleDisplayModeToggle}
          onPointerDown={(event) => event.stopPropagation()}
          aria-label={displayMode === "full" ? "Chỉ hiển thị các bài có nhạc" : "Hiển thị toàn bộ album"}
          aria-pressed={displayMode === "pulled"}
        >
          <span className="display-mode-toggle__status" aria-hidden="true">
            {displayMode === "full" ? "FULL ALBUM" : "PULLED TRACK"}
          </span>
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
            <path d="M11 12H3" />
            <path d="M16 6H3" />
            <path d="M16 18H3" />
            <path d="m19 10-4 4" />
            <path d="m15 10 4 4" />
            </svg>
          </button>
      )}

      {isMobile && hasConfirmedAge && !isAgeGateOpen && (
        <button
          className="mobile-header-settings"
          type="button"
          onClick={handleSettingsOpen}
          onPointerDown={(event) => event.stopPropagation()}
          aria-label="Cài Đặt"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" fill="none">
            <path d="M11 10.27 7 3.34" />
            <path d="m11 13.73-4 6.93" />
            <path d="M12 22v-2" />
            <path d="M12 2v2" />
            <path d="M14 12h8" />
            <path d="m17 20.66-1-1.73" />
            <path d="m17 3.34-1 1.73" />
            <path d="M2 12h2" />
            <path d="m20.66 17-1.73-1" />
            <path d="m20.66 7-1.73 1" />
            <path d="m3.34 17 1.73-1" />
            <path d="m3.34 7 1.73 1" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="12" cy="12" r="8" />
          </svg>
        </button>
      )}

      {!isMobile && hasConfirmedAge && !isAgeGateOpen && (!selectedProject || isDetailMinimized || selectedTrack?.type === "stream") && (
        <button
          className={`desktop-header-fullscreen ${selectedProject && !isDetailMinimized ? (areDetailButtonsVisible ? "" : "is-hidden") : (areSceneControlsVisible ? "" : "is-hidden")}`}
          type="button"
          onPointerDown={(event) => {
            event.stopPropagation();
            void handleWebFullscreenToggle();
          }}
          aria-label={isWebFullscreen ? "Thu nhỏ màn hình" : "Mở toàn màn hình"}
          tabIndex={selectedProject && !isDetailMinimized ? (areDetailButtonsVisible ? 0 : -1) : (areSceneControlsVisible ? 0 : -1)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            {isWebFullscreen ? (
              <>
                <path d="m15 15 6 6m-6-6v4.8m0-4.8h4.8" />
                <path d="M9 19.8V15M9 15H4.2M9 15l-6 6" />
                <path d="M15 4.2V9m0 0h4.8M15 9l6-6" />
                <path d="M9 4.2V9M9 9 3 3M9 9H4.2" />
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

      {!isMobile && hasConfirmedAge && !isAgeGateOpen && (!selectedProject || isDetailMinimized) && (
        <button
          className={`desktop-header-settings ${!areSceneControlsVisible ? "is-hidden" : ""}`}
          type="button"
          onClick={handleSettingsOpen}
          onPointerDown={(event) => event.stopPropagation()}
          aria-label="Cài Đặt"
          tabIndex={!areSceneControlsVisible ? -1 : 0}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" fill="none">
            <path d="M11 10.27 7 3.34" />
            <path d="m11 13.73-4 6.93" />
            <path d="M12 22v-2" />
            <path d="M12 2v2" />
            <path d="M14 12h8" />
            <path d="m17 20.66-1-1.73" />
            <path d="m17 3.34-1 1.73" />
            <path d="M2 12h2" />
            <path d="m20.66 17-1.73-1" />
            <path d="m20.66 7-1.73 1" />
            <path d="m3.34 17 1.73-1" />
            <path d="m3.34 7 1.73 1" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="12" cy="12" r="8" />
          </svg>
        </button>
      )}


      <HVLTrackDetail {...{
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
        songAnnotations: selectedTrack?.songAnnotations,
        activeArtists,
      }} />

      <HVLDock {...{
        selectedProject,
        isDetailMinimized,
        isDockVisible: isDetailMinimized || (isMobile && (isDetailMinimizing || isDockHidingForDetail)),
        isDockHidingForDetail: isDockHidingForDetail || isDetailMinimizing,
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
      }} />

      {isSettingsOpen && (
        <div
          className="settings-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="settings-modal-title"
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) handleSettingsClose();
          }}
        >
          <section className="settings-modal__panel" onPointerDown={(event) => event.stopPropagation()}>
            <header className="settings-modal__header">
              <h2 id="settings-modal-title">Thiết Lập</h2>
              <button className="settings-modal__close" type="button" onClick={handleSettingsClose} aria-label="Đóng Thiết Lập">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m6 6 12 12" />
                  <path d="m18 6-12 12" />
                </svg>
              </button>
            </header>

            <div className="settings-modal__list">
              {!isMobile && (
                <div className="settings-modal__row">
                  <span className="settings-modal__label">Phong Cách</span>
                  <div className="settings-modal__choices" role="group" aria-label="Phong cách hiển thị">
                    <button
                      className={`settings-modal__choice ${pendingDisplayStyle === "museum" ? "is-selected" : ""}`}
                      type="button"
                      onClick={() => handleSettingsDisplayStyleChange("museum")}
                      aria-pressed={pendingDisplayStyle === "museum"}
                    >
                      <span>ĐÀI QUAN SÁT</span>
                    </button>
                    <button
                      className={`settings-modal__choice ${pendingDisplayStyle === "art" ? "is-selected" : ""}`}
                      type="button"
                      onClick={() => handleSettingsDisplayStyleChange("art")}
                      aria-pressed={pendingDisplayStyle === "art"}
                    >
                      <span>BẢO TÀNG</span>
                    </button>
                    <button
                      className={`settings-modal__choice ${pendingDisplayStyle === "list" ? "is-selected" : ""}`}
                      type="button"
                      onClick={() => handleSettingsDisplayStyleChange("list")}
                      aria-pressed={pendingDisplayStyle === "list"}
                    >
                      <span>DANH SÁCH</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="settings-modal__row">
                <span className="settings-modal__label">Hiển Thị</span>
                <div className="settings-modal__choices" role="group" aria-label="Chế độ hiển thị">
                  <button
                    className={`settings-modal__choice ${pendingDisplayMode === "pulled" ? "is-selected" : ""}`}
                    type="button"
                    onClick={() => handleSettingsDisplayModeChange("pulled")}
                    aria-pressed={pendingDisplayMode === "pulled"}
                  >
                    <span>TRACK ĐÃ GỠ (19)</span>
                  </button>
                  <button
                    className={`settings-modal__choice ${pendingDisplayMode === "full" ? "is-selected" : ""}`}
                    type="button"
                    onClick={() => handleSettingsDisplayModeChange("full")}
                    aria-pressed={pendingDisplayMode === "full"}
                  >
                    <span>FULL ALBUM (30)</span>
                  </button>
                </div>
              </div>

              <div className="settings-modal__row settings-modal__row--dock-pin">
                <span className="settings-modal__label">Thanh Dock</span>
                <div className="settings-modal__choices" role="group" aria-label="Trạng thái thanh Dock">
                  <button
                    className={`settings-modal__choice ${!pendingDockPinned ? "is-selected" : ""}`}
                    type="button"
                    onClick={() => handleDockPinnedChange(false)}
                    aria-pressed={!pendingDockPinned}
                  >
                    <span className="settings-modal__choice-label--desktop">ẨN / HIỆN</span>
                    <span className="settings-modal__choice-label--mobile">CUỘN ẨN / HIỆN</span>
                  </button>
                  <button
                    className={`settings-modal__choice ${pendingDockPinned ? "is-selected" : ""}`}
                    type="button"
                    onClick={() => handleDockPinnedChange(true)}
                    aria-pressed={pendingDockPinned}
                  >
                    <span>LUÔN HIỆN</span>
                  </button>
                </div>
              </div>

            </div>
            <footer className="settings-modal__footer">
              <button className="settings-modal__save" type="button" onClick={handleSettingsSave}>
                LƯU
              </button>
            </footer>
          </section>
        </div>
      )}
      {isDownloadModalOpen && selectedTrack?.type === "pulled" && selectedTrack.audioUrl && (
        <div
          className="download-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="download-modal-title"
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) handleDownloadClose();
          }}
        >
          <section className="download-modal__panel" onPointerDown={(event) => event.stopPropagation()}>
            <header className="download-modal__header">
              <h2 id="download-modal-title">TẢI XUỐNG BÀI HÁT</h2>
              <button className="download-modal__close" type="button" onClick={handleDownloadClose} aria-label="Đóng tải audio">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m6 6 12 12" />
                  <path d="m18 6-12 12" />
                </svg>
              </button>
            </header>
            <div className="download-modal__content">
              <NextImage
                className="download-modal__image"
                src={selectedTrack.imageUrl}
                alt=""
                width={112}
                height={112}
                unoptimized
              />
              <div className="download-modal__details">
                <strong>{selectedTrack.title}</strong>
                <span className="download-modal__artist">{selectedTrack.subtitle}</span>
                <div className="download-modal__meta">
                  <div className="download-modal__meta-row">
                    <span>TÊN FILE</span>
                    <strong>{getAudioFileName(selectedTrack.audioUrl)}</strong>
                  </div>
                  <div className="download-modal__meta-row">
                    <span>THỜI GIAN</span>
                    <strong>{formatTime(selectedTrack.durationSeconds ?? duration)}</strong>
                  </div>
                  <div className="download-modal__meta-row">
                    <span>DUNG LƯỢNG</span>
                    <strong>{isDownloadSizeLoading ? "ĐANG KIỂM TRA..." : formatFileSize(downloadAudioSize)}</strong>
                  </div>
                </div>
              </div>
            </div>
            <div className="download-modal__footer">
              <a
                className={`download-modal__action ${isDownloadDisabled ? "is-disabled" : ""}`}
                href={selectedTrack.audioUrl}
                download
                aria-disabled={isDownloadDisabled}
                onClick={handleDownloadAudio}
              >
                <span className="download-modal__action-content">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 3v12" />
                    <path d="m7 10 5 5 5-5" />
                    <path d="M5 21h14" />
                  </svg>
                  DOWNLOAD
                </span>
              </a>
            </div>
          </section>
        </div>
      )}
      {!isMobile && isPresentationReady && <Loader />}
      </div>

      {!isAgeGateStateReady ? (
        <div className="age-gate age-gate--boot" aria-hidden="true" />
      ) : isAgeGateOpen ? (
        <div className="age-gate" role="dialog" aria-modal="true" aria-label="Xác nhận độ tuổi">
          <div className="age-gate__scroll">
            <section className="age-gate__panel">
              <div className="age-gate__content">
                <p className="age-gate__disclaimer">
                  Trang web này được xây dựng bởi một người hâm mộ yêu mến âm nhạc của <strong>MCK</strong> và <strong>HOÀN TOÀN</strong> không đại diện cho bất kỳ tổ chức truyền thông nào, cũng như không có bất kỳ mối liên hệ hay hợp tác nào với công ty chủ quản, đơn vị quản lý hoặc các bên liên quan đến nghệ sĩ <strong>MCK</strong>.
                  <span className="age-gate__disclaimer-divider" aria-hidden="true" />
                </p>
                <p className="age-gate__copyright-notice">
                  Trong trường hợp có yêu cầu từ <strong>CHỦ SỞ HỮU BẢN QUYỀN</strong> hoặc khi <strong>NGHỆ SĨ</strong> phát hành lại (re-upload) các bài hát trên các nền tảng chính thức, toàn bộ nội dung tương ứng trên trang web có thể sẽ được gỡ bỏ mà không cần thông báo trước.
                </p>
                <div className="age-gate__warning">
                  <p>
                    Các bài hát trên trang web có thể <strong>CHỨA NGÔN TỪ</strong> hoặc <strong>NỘI DUNG KHÔNG PHÙ HỢP</strong> với một số người nghe. Vui lòng cân nhắc trước khi nhấn <strong>XÁC NHẬN</strong> để tiếp tục. Nếu không, bạn có thể thưởng thức những bài hát khác trong album thông qua các nền tảng phát hành chính thức bằng các liên kết bên dưới.
                  </p>
                  <nav className="age-gate__platforms" aria-label="Nghe album trên các nền tảng khác">
                    <a
                      className="age-gate__platform-link"
                      href="https://www.youtube.com/playlist?list=PLG5bpInXG8Sc"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <YouTubeIcon />
                      <span>YOUTUBE</span>
                      <svg className="age-gate__external-icon" aria-hidden="true" viewBox="0 0 16 16" fill="none">
                        <path d="M5 3h8v8M13 3 3 13" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    </a>
                    <a
                      className="age-gate__platform-link"
                      href="https://open.spotify.com/album/36e3pjcLAYabHjXlaSmWOe"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <SpotifyIcon />
                      <span>SPOTIFY</span>
                      <svg className="age-gate__external-icon" aria-hidden="true" viewBox="0 0 16 16" fill="none">
                        <path d="M5 3h8v8M13 3 3 13" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    </a>
                    <a
                      className="age-gate__platform-link"
                      href="https://music.apple.com/vn/album/hvl/6796647839"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <AppleMusicIcon />
                      <span>APPLE MUSIC</span>
                      <svg className="age-gate__external-icon" aria-hidden="true" viewBox="0 0 16 16" fill="none">
                        <path d="M5 3h8v8M13 3 3 13" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    </a>
                  </nav>
                </div>
                <div className="age-gate__footer">
                  <button
                    className="age-gate__confirm"
                    type="button"
                    onClick={handleAgeGateConfirm}
                  >
                    Tôi xác nhận đã 18 tuổi và đủ nhận thức để nghe
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      ) : null}
    </div>
  );
}
