"use client";

import NextImage from "next/image";
import { Canvas, useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { Image as DreiImage, Loader, Text, useTexture } from "@react-three/drei";
import { Suspense, useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { AdditiveBlending, FrontSide, Mesh, Object3D, ShaderMaterial } from "three";

type GalleryItemType = "stream" | "pulled";
type DisplayMode = "full" | "pulled";
type DisplayStyle = "museum" | "list";
type RepeatMode = "off" | "one" | "all";
type TrackPresentation = "detail" | "minimized";
type StreamDisplayDelay = 5 | 10 | 15;
type GalleryItem = {
  numberTrack: number;
  durationSeconds: number | null;
  title: string;
  subtitle: string;
  imageUrl: string;
  pMobileBackground: string;
  audioUrl: string;
  type: GalleryItemType;
  lyrics?: string;
  lyricsTimestamps?: readonly number[];
};

type GalleryItemSeed = Omit<GalleryItem, "pMobileBackground"> & Partial<Pick<GalleryItem, "pMobileBackground">>;

const wtfBbyImLitLyrics = String.raw`
♬
In the game, baby, I'm lit
Không cần filter, anh ít khi điêu
Bôi nhiều son vào, hôn anh chi chít
On the beat, anh lead em phiêu
Đi quanh club, họ nhận ra anh nhiều quá
Rít một hơi, thổi làn khói tan ra
Xanh rồi đen, rồi lục, lam, chàm, tím
Chúng ngã vào nhau ở trong một tấm canvas


What the fuck? Baby, I'm still lit
Bóc đồ đi, xem outfit bao nhiêu
Second-hand tao vẫn bring the heat
Quá là fresh nên tao thích thì tao kiêu
Mấy thứ chúng mày coi là bình thường nhất
Lên người tao thành đồ rất cao siêu
Đừng săm soi chuyện đời tư của bố mày
Cuộc đời tao, yeah, tao thích thì tao yêu


Ah, ah-ah-ah-ah-ah, ah-ah-ah-ah-ah
Ah-ah-ah-ah-ah, ah, ah, ah, ah
Ah-ah-ah-ah-ah, ah-ah-ah-ah-ah
Ah-ah-ah-ah-ah, ah, ah, ah (Yeah)


Tim anh như đang nổ tung nhưng mà lại chẳng biết nói gì với em
Nhẹ nhàng, nhẹ nhàng dâng lên bao nhiêu cảm xúc này anh đang kìm nén (Ah)
Linh hồn mình đi tìm nhau, chìm vào cùng khoảnh khắc căn phòng tối đen
Nhẹ chạm vào bờ môi, đung đưa trôi khi hai ta say mèm
(Khẽ chạm vào bờ môi) Đung, đung đưa trôi khi hai ta say mèm
(Đến bên em người ơi) Đung đưa trôi khi mà hai ta say mèm
(Eh-eh-eh-eh) (Khẽ chạm vào bờ môi)
Eh-eh-eh-eh-eh-eh (Cho đến khi anh chơi vơi ... đến khi anh chơi vơi)


Okay, in the game, baby, I'm lit
Ít khi điêu
Hôn anh chi chít
Anh lead em phiêu
Nhận ra anh nhiều quá
Khói tan ra
Xanh rồi đen, rồi lục, lam, chàm, tím
Chúng ngã vào nhau ở trong một tấm canvas


(Khi mà em) Khi mà em đang say (Yeah)
Đung đưa, đung đưa khi mà em đang say (Chuck-chuck, chuck-chuck, club, chuck-chuck)
Khi mà em đang say
Đung đưa, đung đưa khi mà em đang
Ngã ra trong một tấm canvas
Lướt qua chạm vào làn da
Your aura, your vibe (your vibe, vibe-vibe-vibe-vibe)
Ngã ra trong một tấm canvas
Anh giờ quá phê, anh trông như là tảng đá
My aura, my vibe


In the game, baby, I'm lit
Không cần filter, anh ít khi điêu
Bôi nhiều son vào, hôn anh chi chít
On the beat, anh lead em phiêu
Đi quanh club họ nhận ra anh nhiều quá
Rít một hơi, thổi làn khói tan ra
Xanh rồi đen, rồi lục, lam, chàm, tím
Chúng ngã vào nhau ở trong một tấm canvas


In the game, I'm-I'm lit
Ít, anh ít khi, ít khi
Bôi nhiều son vào, hôn chi chít
Anh lead em ph...
Nhận, nhận, nhận ra anh nhiều quá
Rít một hơi, khói tan ra
Xanh rồi đen, rồi lục, lam, chàm, tím
Chúng nó ngã vào nhau ở trong một tấm canvas`;

const wtfBbyImLitLyricsTimestamps = [0,
  15.1, 17.1, 18.86, 20.7, 22.59, 24.46, 26.28, 27.87,
  30.02, 31.82, 33.57, 35.46, 37.34, 39.17, 40.91, 42.96,
  44.78, 49.36, 53.05, 56.73,
  60.1, 64.1, 67.78, 71.55, 74.39, 77.94, 81.32, 84.78,
  88.28, 91.81, 93.36, 95.35, 97.06, 99.12, 100.15, 101.63,
  105.12, 109.34, 113.9, 116.7, 118.51, 120.42, 122.23, 126.09, 127.58, 129.77,
  133.35, 135.11, 137.13, 138.95, 140.86, 142.59, 144.49, 146,
  148.09, 150.26, 151.84, 154.39, 155.49, 157.33, 159.11, 160.76,
] as const;

const nhinKeThuTaoLyrics = String.raw`
♬ ♬ ♬
Yeah, tao đang không đeo bịt mắt
Take off that cover để xem không gian tối đen lan rộng
Yeah, không đeo bịt mắt
Nhìn xuyên qua trò lừa gạt này giờ lại thấy như không
Vụn vỡ nhưng đã trao
Niềm tin như vết dao họ đâm vào lưng khi tao đã quay đi rồi
Từng câu chuyện bị họ hiên ngang đánh tráo
Như là cách tao đang đứng dậy nhìn kẻ thù của tao


Sao? Huh? Mày muốn thấy tao chết à?
Ngủ tiếp đi, cảnh đấy trong mơ thôi
Hạ tao xuống? Mày muốn hạ tao xuống?
Gọi thêm mười thằng, anh em tao cưa đôi
Bảo tao thay đổi chắc là nhà đéo có gương soi
Chúng mày phát triển chạy theo một đường lối
Bất quy tắc, tao mới là đương thời
Trồi lên từ sỏi để lại hương thơm
Phủi bụi, uhm, giày tao như mới
Đúng là lòng người đéo mẹ bạc như vôi
Đéo ai quan tâm khi mà tao chưa nổi
Sao bây giờ lại thay đổi hả mấy thằng ngu ơi?
Đặt điều về tao kiểu đấy quá xưa rồi
Đái vào mặt mày gọi là một ngày mưa rơi
Tao im lặng khi mà thông tin đưa tới
Tao im lặng cho chúng mày múa mép khua môi


Huh-huh-huh-huh
Huh-huh (Chúng nó đéo biết đấu với cái gì) Huh-huh-huh-huh-huh-huh
Chúng nó đéo biết đấu với cái gì
Huh-huh
Huh-huh
Huh-huh
Huh-huh
Huh-huh
Huh-huh
Huh-huh
Huh-huh
Huh-huh
Huh-huh
Huh-huh
Huh-huh
Huh-huh
Huh-huh
Huh-huh
Huh-huh (Kẻ thù của tao)


Sao? Huh? Mày muốn thấy tao chết à?
Ngủ tiếp đi, cảnh đấy trong mơ thôi
Hạ tao xuống? Mày muốn hạ tao xuống?
Gọi thêm mười thằng, anh em tao cưa đôi
Bảo tao thay đổi chắc là nhà đéo có gương soi
Chúng mày phát triển chạy theo một đường lối
Bất quy tắc, tao mới là đương thời
Trồi lên từ sỏi để lại hương thơm
Phủi bụi, uhm, giày tao như mới
Đúng là lòng người đéo mẹ bạc như vôi
Đéo ai quan tâm khi mà tao chưa nổi
Sao bây giờ lại thay đổi hả mấy thằng ngu ơi?
Đặt điều về tao kiểu đấy quá xưa rồi
Đái vào mặt mày gọi là một ngày mưa rơi
Tao im lặng khi mà thông tin đưa tới
Tao im lặng cho chúng mày múa mép khua môi



Bá hơn ai? Bá hơn tao?
Tao bắt đầu chán rồi tao ra khỏi đại lao
Bắt đầu thèm khát thứ sức mạnh chúng mày không thể
Kiểm soát được việc đó khiến cho chúng mày lại ngáo à? (Huh)
Sống lại để chết xong lại sống rồi lại chết để con người trong gương vẫn là của tao
Của tao là của tao
Chúng mày không thể đánh tráo
Định cho tao vai ác? Motherfuckers tao sẽ khiến chúng mày điên lên (Wuah, wuah trap, wuah)
Bozo đen keep rocking my fit
Vẫn đang nghe xem mấy anh công ty rap cái gì
Yeah, I be cold, I stay low like this
Đã quá lâu tao không post lên IG
Rằng bọn khổng lồ sẽ gục dưới chân thằng bé tí
Fuck it, get lit, I be swerve
Tao đi như này đứng như này rap như này
Okay, nếu mày gan thì mày cop đi này
Cổ tay tao Rolex, không phải Cartier
Fuck your bitch fuck your fame fuck your polymer
Tao đi như này đứng như này rap như này
Đừng cố để bằng tao chọn kiếp khác đi vậy
Tao đi qua nó biến nó thành spotlight
Để cho chúng mày biết đâu là trap
♬`;

const nhinKeThuTaoLyricsTimestamps = [0,
  51.12, 54.86, 60.18, 61.94, 65.86, 67.66, 72.28, 74.92,
  77.44, 79.04, 80.62, 82.14, 83.68, 85.42, 87.04, 88.72,
  90.14, 91.72, 93.42, 95, 96.56, 98.16, 99.82, 101.42,
  103, 105.4, 114.8,
  117, 118.6, 120.2, 121.8, 123.4, 125, 126.6, 128.2, 129.8, 131.4,
  133, 134.6, 136.2, 137.8, 139.4, 141.1,
  142.72, 144.32, 145.9, 147.42, 148.96, 150.7, 152.32, 154, 155.42,
  157, 158.7, 160.28, 161.84, 163.44, 165.1, 166.7,
  168.38, 169.7, 171.3, 172.5, 175.1, 177.5, 178.7, 179.7, 184.2, 186.3,
  187.6, 189.6, 191.5, 192.5, 194.2, 195.9, 197.4, 198.8, 200.6, 202.4, 204.1,
  205.6, 207.2
] as const;

const thitLonLyrics = String.raw`
♬
Tao đã nguyện không oán những cái chuyện không đáng
nhưng có những chuyện nó khó có thể tha thứ
Từng yêu, từng ghét, từng giận, từng quen,
dù không muốn thì cũng đã phải giã từ
Chưa bao giờ hối hận vì những thứ đã làm, trời cao độ cho linh hồn xa xứ
Chưa bao giờ có "nếu", hoặc là "đáng tiếc", hoặc là "thương hại", hay là hai từ "giá như"
Okay, tao đi ra phố, mấy em fan chạy lại hú hét
Bỏ hút cỏ mấy em cứ ép, hút cái này nhiều đầu anh lú đét
Mấy em gái chạy lại và hú hét, có em vú to, có em vú lép
Bảo là, "Nghe nhạc anh sao mà tai nghe cứ khét",
CapCut hai ảnh các em cứ ghép
Ayy, tiếng lành đồn xa
Chúng nó bảo anh là không làm được, đến cái lúc anh làm được mặt chúng nó đần ra
Anh đã không còn cảm thấy cô đơn trong lòng ở nơi phố thị phồn hoa
Anh đã thấy được giá trị của anh khi mà cuộc đời anh trải qua một phần ba

Và anh đã quen với cô đơn
Con tim anh đã an nhiên, đã thôi nhung nhớ, đã thôi thét gào lên từng cơn
Anh giữ niềm yêu thương, trao hy vọng, điệu nhạc này chớ buồn làm gì
Với những thứ không quan trọng, anh sẽ lấy tay gạt đi
Suy nghĩ làm gì cho tốn thời gian

Tâm anh sáng và cái dáng anh hiền
Baby, mắt anh phát sáng, va vào cái say liền
Ôm, lúc nào cũng ôm một đống ưu phiền
Em làm cho anh nhung nhớ tặng anh cái dây chuyền, okay
Chắc là em cũng quên rồi
Nhưng mà anh thì nhớ những lúc em phá lên cười
Đẹp như là show của anh, show của anh
Bình luận "hai chấm, ngoặc, ngoặc", "Quá ăn tiền"
Xong rồi anh nhận ra, không phải yêu, bởi vì anh chưa bao giờ là người được em quan tâm, quan tâm
Thật buồn, anh phải chỉnh lại bản thân và đi chơi với cả mấy em da nâu ngăm ngăm
Em nghĩ thế thôi mà đã hạ được anh? Baby, aight, get some, get some
Bao nhiêu thằng muốn cắn anh ngoài kia nhìn lại mông anh thì toàn là vết răng, vết răng
Anh mà đi ở đâu thì camera tự nhiên ra follow
Mấy thằng chưa gặp anh comment bảo, "Trông mày như thằng côn đồ"
Hỏi anh tại sao đỉnh cao, hình như là do đẹp zai? I don't know
Mày đang làm đau đầu tao, để yên cho tao về ôm bồ

Take care, baby, are you take care?
I just wanted you to take care
Hy vọng em vẫn đang đổi thay, yeah

Anh đã nguyện không oán (Anh là như thế), những cái chuyện không đáng (Không bao giờ)
Anh đã nguyện không bán (Anh là vô giá), thể diện trong sáng (Okay luôn)
Không thích chuyện công cán (Nghe chưa?), cả mấy chuyện ân oán (Nghe rõ chưa?)
Chỉ có em và nhạc (M-O-U), là anh nghiện không chán (Yêu luôn)
Anh muốn trèo lên cao nhất (Tít trên), chỉ để khoe với mẹ anh (Mẹ ơi)
Con mẹ đã lớn, vững vàng, chững chạc không còn là thằng trẻ ranh (Con mẹ đã lớn rồi)
Đối mặt với thử thách, thân trai hai lăm gặp hổ bẻ nanh
Nhỡ đâu con dâu lại là người nước ngoài, cúi đầu tạ lễ, biếu mẹ cái thẻ xanh
Long Nhật Bản đã từng ngủ ở hè phố,
Long Việt Nam giờ là báu vật của bố
Những người bạn vẫn luôn ở đó, chỉ cần nhìn thấy họ là nó đã được củng cố
Bước ra đường với đôi giày khủng bố, nhạc bật bung loa vang khắp cả phố
Racks on racks on racks on racks on racks on racks on racks, alo?
Long Tân Mai mãi là một thằng nhóc,
Long Ba Đình nhiều lần gục mặt khóc
Long Phố Vọng đã có nhiều bằng cấp,
Long Kim Mã, uhm, chẳng cao chẳng thấp
Long Thủ Thiêm tiêu tiền bằng xấp,
Long-Long Hồ Tây quá giàu chẳng chấp
Long đẹp zai represent Hoàng Mai,
Hà Nội, Ba Đình, đỉnh cao, đẳng cấp


Và anh đã quen với cô đơn
Con tim anh đã an nhiên, đã thôi nhung nhớ, thôi thét gào lên từng cơn
Gieo thêm hy vọng, điệu nhạc này chớ buồn làm gì
Với những thứ không quan trọng, anh sẽ lấy tay gạt đi
Suy nghĩ làm gì cho tốn thời gian
Con tim anh đã an nhiên, đã thôi nhung nhớ, thôi thét gào lên từng cơn
Gieo thêm hy vọng, điệu nhạc này chớ buồn làm gì
Với những thứ không quan trọng, anh sẽ lấy tay gạt đi
Suy nghĩ làm gì cho tốn thời gian
♬
`;

const thitLonLyricsTimestamps = [0,
  23.7, 25.4, 27.24, 28.84, 30.08, 33.26, 36.18, 39.04, 42.06, 44.94, 46.48, 48.98,
  50.06, 52.92, 55.98, 59.16, 60.76, 63.66, 66.74, 70.24, 71.8, 73.02, 74.58, 76.2,
  78.2, 79.02, 80.54, 81.92, 83.54, 87.22, 90.3, 93.16, 96.48, 99.36, 102.34, 105.4,
  109.3, 112.78, 115.86, 120.4, 123.16, 126.18, 129.16, 132.44, 135.66, 138.72, 140.96,
  144.1, 145.62, 147.1, 150.08, 153.12, 156.1, 157.56, 159, 160.42, 162.02, 163.44,
  165, 166.76, 167.64, 168.82, 171.82, 174.82, 178.16, 180.88, 183.86, 186.7, 190.22, 195.1
] as const;

const galleryItems: readonly GalleryItem[] = (
[
  {
    numberTrack: 0,
    durationSeconds: null,
    title: "'HVL'",
    subtitle: "RPT MCK",
    imageUrl: "/images/hvl-trailer.webp",
    audioUrl: "",
    type: "stream",
  },
  {
    numberTrack: 1,
    durationSeconds: null,
    title: "Elegie",
    subtitle: "RPT MCK",
    imageUrl: "/images/elegie.png",
    pMobileBackground: "right",
    audioUrl: "",
    type: "stream",
  },
  {
    numberTrack: 2,
    durationSeconds: 196.937143,
    title: "IDK",
    subtitle: "RPT MCK",
    imageUrl: "/images/idk.png",
    pMobileBackground: "left",
    audioUrl: "/music/idk.mp3",
    type: "pulled",
  },
  {
    numberTrack: 3,
    durationSeconds: 167.57551,
    title: "Wtf Bby I'm Lit",
    subtitle: "RPT MCK",
    imageUrl: "/images/wtf-bby-im-lit.png",
    audioUrl: "/music/wtf-bby-im-lit.mp3",
    type: "pulled",
    lyrics: wtfBbyImLitLyrics,
    lyricsTimestamps: wtfBbyImLitLyricsTimestamps,
  },
  {
    numberTrack: 4,
    durationSeconds: 167.209796,
    title: "Anh Không Muốn Nó Dễ Dàng",
    subtitle: "RPT MCK",
    imageUrl: "/images/anh-khong-muon-no-de-dang.png",
    audioUrl: "/music/anh-khong-muon-no-de-dang.mp3",
    type: "pulled",
  },
  {
    numberTrack: 5,
    durationSeconds: null,
    title: "Baby",
    subtitle: "RPT MCK, marzuz",
    imageUrl: "/images/baby.png",
    pMobileBackground: "right",
    audioUrl: "",
    type: "stream",
  },
  {
    numberTrack: 6,
    durationSeconds: 167.418776,
    title: "Yêu Anh Giết Anh",
    subtitle: "RPT MCK",
    imageUrl: "/images/yeu-anh-giet-anh.png",
    audioUrl: "/music/yeu-anh-giet-anh.mp3",
    type: "pulled",
  },
  {
    numberTrack: 7,
    durationSeconds: null,
    title: "Mắt Môi Tay Chân",
    subtitle: "RPT MCK ft. Tage",
    imageUrl: "/images/mat-moi-tay-chan.png",
    audioUrl: "",
    type: "stream",
  },
  {
    numberTrack: 8,
    durationSeconds: null,
    title: "Đao Của Anh Vừa",
    subtitle: "RPT MCK",
    imageUrl: "/images/dao-cua-anh-vua.png",
    audioUrl: "",
    type: "stream",
  },
  {
    numberTrack: 9,
    durationSeconds: 141.583673,
    title: "Là Gì Của Nhau",
    subtitle: "RPT MCK",
    imageUrl: "/images/la-gi-cua-nhau.png",
    audioUrl: "/music/la-gi-cua-nhau.mp3",
    type: "pulled",
  },
  {
    numberTrack: 10,
    durationSeconds: null,
    title: "Night In Prague",
    subtitle: "RPT MCK",
    imageUrl: "/images/night-in-prague.png",
    audioUrl: "",
    type: "stream",
  },
  {
    numberTrack: 11,
    durationSeconds: null,
    title: "Một Cái Ôm",
    subtitle: "RPT MCK",
    imageUrl: "/images/mot-cai-om.png",
    audioUrl: "",
    type: "stream",
  },
  {
    numberTrack: 12,
    durationSeconds: 234.13551,
    title: "Liệm",
    subtitle: "RPT MCK",
    imageUrl: "/images/liem.png",
    audioUrl: "/music/liem.mp3",
    type: "pulled",
  },
  {
    numberTrack: 13,
    durationSeconds: null,
    title: "Nếu Như Ta Chẳng Còn",
    subtitle: "RPT MCK, A$AP Ướt Mi",
    imageUrl: "/images/neu-nhu-ta-chang-con.png",
    pMobileBackground: "right",
    audioUrl: "",
    type: "stream",
  },
  {
    numberTrack: 14,
    durationSeconds: null,
    title: "Ai Mới Là Kẻ Xấu Xa",
    subtitle: "RPT MCK",
    imageUrl: "/images/ai-moi-la-ke-xau-xa.png",
    audioUrl: "",
    type: "stream",
  },
  {
    numberTrack: 15,
    durationSeconds: 214.857143,
    title: "Slippery",
    subtitle: "RPT MCK, Tùng Dương",
    imageUrl: "/images/slippery.png",
    audioUrl: "/music/slippery.mp3",
    type: "pulled",
  },
  {
    numberTrack: 16,
    durationSeconds: 57.417143,
    title: "Intepol",
    subtitle: "RPT MCK",
    imageUrl: "/images/intepol.png",
    audioUrl: "/music/intepol.mp3",
    type: "pulled",
  },
  {
    numberTrack: 17,
    durationSeconds: 107.833469,
    title: "Tây Thi",
    subtitle: "RPT MCK",
    imageUrl: "/images/tay-thi.png",
    pMobileBackground: "left",
    audioUrl: "/music/tay-thi.mp3",
    type: "pulled",
  },
  {
    numberTrack: 18,
    durationSeconds: 134.530612,
    title: "Hút Và Hút",
    subtitle: "RPT MCK",
    imageUrl: "/images/hut-va-hut.png",
    pMobileBackground: "right",
    audioUrl: "/music/hut-va-hut.mp3",
    type: "pulled",
  },
  {
    numberTrack: 19,
    durationSeconds: 187.167347,
    title: "Dưa Chua",
    subtitle: "RPT MCK",
    imageUrl: "/images/dua-chua.png",
    audioUrl: "/music/dua-chua.mp3",
    type: "pulled",
  },
  {
    numberTrack: 20,
    durationSeconds: 218.148571,
    title: "Xa Xôi",
    subtitle: "RPT MCK, Obito",
    imageUrl: "/images/xa-xoi.png",
    audioUrl: "/music/xa-xoi.mp3",
    type: "pulled",
  },
  {
    numberTrack: 21,
    durationSeconds: 155.324082,
    title: "Che Phủ",
    subtitle: "RPT MCK",
    imageUrl: "/images/che-phu.png",
    audioUrl: "/music/che-phu.mp3",
    type: "pulled",
  },
  {
    numberTrack: 22,
    durationSeconds: 205.374694,
    title: "Oanh M = Thuoc",
    subtitle: "RPT MCK",
    imageUrl: "/images/oanh-m-=-thuoc.png",
    audioUrl: "/music/oanh-m-=-thuoc.mp3",
    type: "pulled",
  },
  {
    numberTrack: 23,
    durationSeconds: 113.293061,
    title: "Ghet Xog Lai Thik",
    subtitle: "RPT MCK",
    imageUrl: "/images/ghet-xog-lai-thik.png",
    audioUrl: "/music/ghet-xog-lai-thik.mp3",
    type: "pulled",
  },
  {
    numberTrack: 24,
    durationSeconds: 238.968163,
    title: "Nhìn Kẻ Thù Tao",
    subtitle: "RPT MCK",
    imageUrl: "/images/nhin-ke-thu-tao.png",
    audioUrl: "/music/nhin-ke-thu-tao.mp3",
    type: "pulled",
    lyrics: nhinKeThuTaoLyrics,
    lyricsTimestamps: nhinKeThuTaoLyricsTimestamps,
  },
  {
    numberTrack: 25,
    durationSeconds: 235.467755,
    title: "Envy",
    subtitle: "RPT MCK, THANHDRAW",
    imageUrl: "/images/envy.png",
    audioUrl: "/music/envy.mp3",
    type: "pulled",
  },
  {
    numberTrack: 26,
    durationSeconds: 159.764898,
    title: "Cảm Ơn",
    subtitle: "RPT MCK",
    imageUrl: "/images/cam-on.png",
    pMobileBackground: "right",
    audioUrl: "/music/cam-on.mp3",
    type: "pulled",
  },
  {
    numberTrack: 27,
    durationSeconds: null,
    title: "Không Cần Lo Cho Tao",
    subtitle: "RPT MCK",
    imageUrl: "/images/khong-can-lo-cho-tao.png",
    audioUrl: "",
    type: "stream",
  },
  {
    numberTrack: 28,
    durationSeconds: null,
    title: "Huh",
    subtitle: "RPT MCK, RPT Orijinn, THANHDRAW",
    imageUrl: "/images/huh.jpg",
    audioUrl: "",
    type: "stream",
  },
  {
    numberTrack: 29,
    durationSeconds: null,
    title: "Nguyễn Văn Mười",
    subtitle: "RPT MCK",
    imageUrl: "/images/nguyen-van-muoi.png",
    audioUrl: "",
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
    lyrics: thitLonLyrics,
    lyricsTimestamps: thitLonLyricsTimestamps,
  },
  ] satisfies readonly GalleryItemSeed[]
).map((item) => ({
  ...item,
  pMobileBackground: item.pMobileBackground ?? "center",
}));

const tubeCols = Math.min(7, galleryItems.length);
const tubeRows = Math.ceil(galleryItems.length / tubeCols);
const tubeRowSpacing = 1.85;
const tubeScrollLimit = ((tubeRows - 1) * tubeRowSpacing) / 2;
const tubeWheelScrollFactor = 0.00075;
const mobileMediaQuery = "(pointer: coarse), (max-width: 1199px)";
const ageConfirmationStorageKey = "hvl-age-confirmed";
const autoNextDelaySeconds = 10;
const displayModeStorageKey = "hvl-display-mode";
const displayStyleStorageKey = "hvl-display-style";
const dockPinnedStorageKey = "hvl-dock-pinned";
const mobileDockModeStorageKey = "hvl-mobile-dock-mode";
const streamDisplayDelayStorageKey = "hvl-stream-display-delay";
const streamDisplayDelayOptions: readonly StreamDisplayDelay[] = [5, 10, 15];

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00";

  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}

function formatTrackNumber(numberTrack: number) {
  return numberTrack.toString().padStart(2, "0");
}

function getTrackLabel(numberTrack: number) {
  return numberTrack === 0 ? "TRAILER" : `TRACK ${formatTrackNumber(numberTrack)}`;
}

function isDarkTrackNumber(numberTrack: number) {
  return numberTrack === 8 || numberTrack === 27 || numberTrack === 28 || numberTrack === 29;
}

function setMaterialUniform(material: unknown, uniformName: string, value: number) {
  if (!material || typeof material !== "object" || !("uniforms" in material)) return;

  const uniforms = (material as { uniforms?: Record<string, { value: number }> }).uniforms;
  if (uniforms?.[uniformName]) uniforms[uniformName].value = value;
}

const imageVertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const imageFragmentShader = `
  uniform sampler2D uMap;
  uniform float uFlashProgress;
  uniform float uFlashIntensity;
  uniform float uOpacity;
  varying vec2 vUv;

  void main() {
    vec2 centeredUv = vUv - 0.5;
    float radius = length(centeredUv);
    float time = uFlashProgress * 6.28318;
    float pulse = uFlashIntensity;
    float waveA = sin(centeredUv.y * 24.0 + time * 2.1);
    float waveB = cos(centeredUv.x * 19.0 - time * 1.7);
    float waveC = sin((centeredUv.x + centeredUv.y) * 31.0 + time * 2.8);
    vec2 distortion = vec2(waveA + waveC * 0.45, waveB - waveC * 0.35);
    vec2 warpedUv = clamp(vUv + distortion * pulse * 0.008 * (1.0 - radius), 0.002, 0.998);
    vec4 imageColor = texture2D(uMap, warpedUv);

    float plasmaWave = 0.5 + 0.5 * sin(
      centeredUv.x * 15.0 - centeredUv.y * 18.0 + time * 2.6 + waveA * 1.4
    );
    float plasmaCore = pow(1.0 - smoothstep(0.03, 0.68, radius), 1.7);
    vec3 plasmaColor = mix(vec3(0.92, 0.97, 1.0), vec3(1.0, 0.91, 0.97), plasmaWave);
    imageColor.rgb += plasmaColor * plasmaCore * plasmaWave * pulse * 0.12;
    imageColor.rgb *= 1.0 + pulse * 0.22;

    gl_FragColor = vec4(imageColor.rgb, imageColor.a * uOpacity);
  }
`;

const flashVertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const flashFragmentShader = `
  uniform float uProgress;
  uniform float uIntensity;
  varying vec2 vUv;

  void main() {
    vec2 centeredUv = vUv - 0.5;
    float easedProgress = smoothstep(0.0, 1.0, uProgress);
    float radius = length(centeredUv);
    float time = easedProgress * 6.28318;
    float plasmaA = sin(centeredUv.x * 18.0 + sin(centeredUv.y * 9.0 + time) * 2.2 - time * 1.8);
    float plasmaB = cos(centeredUv.y * 22.0 + cos(centeredUv.x * 11.0 - time) * 1.8 + time * 2.1);
    float plasmaField = 0.5 + 0.5 * sin(plasmaA * 2.4 + plasmaB * 2.0 + time * 1.7);
    float radialAura = pow(1.0 - smoothstep(0.04, 0.78, radius), 1.8);
    float filament = smoothstep(0.58, 0.95, plasmaField) * (1.0 - smoothstep(0.45, 0.9, radius));
    float alpha = (radialAura * (0.28 + plasmaField * 0.28) + filament * 0.28) * uIntensity;
    vec3 glowColor = mix(vec3(0.94, 0.98, 1.0), vec3(1.0, 0.93, 0.98), plasmaField);

    gl_FragColor = vec4(glowColor, alpha * 0.56);
  }
`;

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

function MobileTrackList({
  onSelect,
  onScroll,
  displayMode,
  playingTrackIndex,
}: {
  onSelect: (projectName: string, imageUrl: string, textureIndex: number) => void;
  onScroll: React.UIEventHandler<HTMLDivElement>;
  displayMode: DisplayMode;
  playingTrackIndex: number | null;
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

  const handleSelect = (item: (typeof galleryItems)[number], index: number) => {
    if (activatingIndex != null) return;

    playClickSound();
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
      {galleryItems.map((item, index) => (
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

function ItemCaption({
  item,
  position,
  rotation,
  width,
}: {
  item: (typeof galleryItems)[number];
  position: [number, number, number];
  rotation?: [number, number, number];
  width: number;
}) {
  const hasSubtitle = item.subtitle.length > 0;
  const durationSeconds = item.durationSeconds;
  const trackNumberLabel = getTrackLabel(item.numberTrack);
  const trackNumberWidth = trackNumberLabel.length * 0.0264;
  const isTrackEight = isDarkTrackNumber(item.numberTrack);
  const trackNumberColor = isTrackEight ? "#080808" : "#ffffff";
  const captionColor = isTrackEight ? "#080808" : "#ffffff";
  const captionShadowOffsetX = "1.5%";
  const captionShadowOffsetY = "-2.5%";
  const captionShadowBlur = "3%";

  return (
    <group position={position} rotation={rotation}>
      <Text
        font="/fonts/GeistMono-Variable.ttf"
        position={[0, 0, 0]}
        raycast={() => {}}
        anchorX="left"
        anchorY="top"
        color={trackNumberColor}
        fontSize={0.04}
        lineHeight={1}
        maxWidth={width}
        letterSpacing={0.06}
        renderOrder={1}
        depthOffset={-4}
        material-side={FrontSide}
        material-toneMapped={false}
        outlineColor="#000000"
        outlineOpacity={0}
        outlineOffsetX={captionShadowOffsetX}
        outlineOffsetY={captionShadowOffsetY}
        outlineBlur={captionShadowBlur}
      >
        {trackNumberLabel}
      </Text>
      {durationSeconds != null && (
        <>
          <Text
            font="/fonts/GeistMono-Variable.ttf"
            position={[trackNumberWidth + 0.025, 0, 0]}
            raycast={() => {}}
            anchorX="left"
            anchorY="top"
            color={captionColor}
            fontSize={0.04}
            lineHeight={1}
            letterSpacing={0.06}
            renderOrder={1}
            depthOffset={-4}
            material-side={FrontSide}
            material-toneMapped={false}
            outlineColor="#000000"
            outlineOpacity={0}
            outlineOffsetX={captionShadowOffsetX}
            outlineOffsetY={captionShadowOffsetY}
            outlineBlur={captionShadowBlur}
          >
            /
          </Text>
          <Text
            font="/fonts/GeistMono-Variable.ttf"
            position={[trackNumberWidth + 0.075, 0, 0]}
            raycast={() => {}}
            anchorX="left"
            anchorY="top"
            color={captionColor}
            fontSize={0.04}
            lineHeight={1}
            letterSpacing={0.06}
            renderOrder={1}
            depthOffset={-4}
            material-side={FrontSide}
            material-toneMapped={false}
            outlineColor="#000000"
            outlineOpacity={0}
            outlineOffsetX={captionShadowOffsetX}
            outlineOffsetY={captionShadowOffsetY}
            outlineBlur={captionShadowBlur}
          >
            {formatTime(durationSeconds)}
          </Text>
        </>
      )}
      <Text
        font="/fonts/GeistMono-Bold.ttf"
        position={[0, -0.07, 0]}
        raycast={() => {}}
        anchorX="left"
        anchorY="top"
        color={captionColor}
        fontSize={0.075}
        maxWidth={width}
        letterSpacing={0.01}
        renderOrder={1}
        depthOffset={-4}
        material-side={FrontSide}
        material-toneMapped={false}
        outlineColor="#000000"
        outlineOpacity={0.64}
        outlineOffsetX={captionShadowOffsetX}
        outlineOffsetY={captionShadowOffsetY}
        outlineBlur={captionShadowBlur}
      >
        {item.title.toUpperCase()}
      </Text>
      {hasSubtitle && (
        <Text
          font="/fonts/GeistMono-Variable.ttf"
          position={[0, -0.16, 0]}
          raycast={() => {}}
          anchorX="left"
          anchorY="top"
          color={captionColor}
          fontSize={0.04}
          maxWidth={width - 0.2}
          letterSpacing={0.02}
          renderOrder={1}
          depthOffset={-4}
          material-side={FrontSide}
          material-toneMapped={false}
          outlineColor="#000000"
          outlineOpacity={0}
          outlineOffsetX={captionShadowOffsetX}
          outlineOffsetY={captionShadowOffsetY}
          outlineBlur={captionShadowBlur}
        >
          {item.subtitle.toUpperCase()}
        </Text>
      )}
    </group>
  );
}

function CanvasPlayingIndicator({
  active,
  position,
  color,
}: {
  active: boolean;
  position: [number, number, number];
  color: string;
}) {
  const barsRef = useRef<Object3D>(null);
  const barCount = 6;
  const barWidth = 0.009;
  const barGap = 0.009;
  const maxHeight = 0.06;

  useFrame(({ clock }) => {
    if (!active || !barsRef.current) return;

    const time = clock.elapsedTime;
    barsRef.current.children.forEach((bar, index) => {
      const wave = 0.5 + 0.5 * Math.sin(time * 7.2 + index * 1.15);
      bar.scale.y = 0.4 + wave * 0.6;
    });
  });

  if (!active) return null;

  return (
    <group ref={barsRef} position={position} raycast={() => {}} renderOrder={4}>
      {Array.from({ length: barCount }, (_, index) => (
        <mesh
          key={index}
          position={[(index - (barCount - 1) / 2) * (barWidth + barGap), 0, 0]}
          raycast={() => {}}
        >
          <planeGeometry args={[barWidth, maxHeight]} />
          <meshBasicMaterial color={color} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function HVLTitle() {
  return (
    <DreiImage url="/images/hvl-logo.svg" scale={[4.4, 0.76]} transparent toneMapped={false} />
  );
}

function ImageTube({
  scrollTargetRef,
  focusItemRef,
  isDraggingRef,
  spinVelocityRef,
  naturalDirRef,
  dragDeltaRef,
  suppressClickUntilRef,
  onImageClick,
  displayMode,
  playingTrackIndex,
}: {
  scrollTargetRef: React.MutableRefObject<number>;
  focusItemRef: React.MutableRefObject<number | null>;
  isDraggingRef: React.MutableRefObject<boolean>;
  spinVelocityRef: React.MutableRefObject<number>;
  naturalDirRef: React.MutableRefObject<number>;
  dragDeltaRef: React.MutableRefObject<number>;
  suppressClickUntilRef: React.MutableRefObject<number>;
  onImageClick: (projectName: string, imageUrl: string, textureIndex: number) => void;
  displayMode: DisplayMode;
  playingTrackIndex: number | null;
}) {
  const groupRef = useRef<Object3D>(null);
  const rowGroupRefs = useRef<Array<Object3D | null>>([]);
  const itemGroupRefs = useRef<Array<Object3D | null>>([]);
  const itemMeshRefs = useRef<Array<Mesh | null>>([]);
  const itemBackMeshRefs = useRef<Array<Mesh | null>>([]);
  const flashOverlayMeshRefs = useRef<Array<Mesh | null>>([]);
  const flashOverlayBackMeshRefs = useRef<Array<Mesh | null>>([]);
  const scrollCurrent = useRef(0);
  const angle = useRef(0);
  const focusAngleTarget = useRef<number | null>(null);
  const focusStartedAt = useRef(-1);
  const flashItemIndex = useRef(-1);
  const flashStartedAt = useRef(-1);
  const selectionSequence = useRef<{
    itemIndex: number;
    projectName: string;
    imageUrl: string;
    holdStartedAt: number;
    activatedAt: number;
    resumeAt: number;
  } | null>(null);
  const lastItemActivationAt = useRef(0);
  const itemVisibility = useRef(1);
  const displayTransition = useRef({ phase: "idle", start: -1, target: displayMode });
  const [tubeLayoutMode, setTubeLayoutMode] = useState<DisplayMode>(displayMode);

  const imageUrls = useMemo(() => [...new Set(galleryItems.map((item) => item.imageUrl))], []);

  const textures = useTexture(imageUrls);
  const texturesByUrl = useMemo(
    () => new Map(imageUrls.map((url, index) => [url, textures[index]])),
    [imageUrls, textures],
  );

  const activeItems = useMemo(
    () => galleryItems.map((item, index) => ({ item, index })).filter(({ item }) => tubeLayoutMode === "full" || item.type === "pulled"),
    [tubeLayoutMode],
  );
  const cols = Math.min(tubeCols, activeItems.length);
  const rows = Math.ceil(activeItems.length / cols);
  const radius = 3.2;
  const tileH = 1.5;
  const ySpacing = tubeRowSpacing;
  const totalRows = rows;

  const rowSpeed = useMemo(() => {
    const speeds: number[] = [];
    for (let r = 0; r < rows; r++) {
      const t = rows <= 1 ? 0 : r / (rows - 1);
      speeds.push(0.65 + t * 0.9);
    }
    return speeds;
  }, [rows]);

  const rowPositions = useMemo(() => {
    const out: Array<{
      rowIndex: number;
      y: number;
      baseRow: number;
      rowOffset: number;
      itemCount: number;
    }> = [];
    for (let rowIndex = 0; rowIndex < totalRows; rowIndex++) {
      const y = (rowIndex - (totalRows - 1) / 2) * ySpacing;
      const baseRow = rowIndex % rows;
      const rowOffset = baseRow % 2 === 0 ? 0 : 0.5;
      const itemCount = Math.min(cols, activeItems.length - baseRow * cols);
      out.push({ rowIndex, y, baseRow, rowOffset, itemCount });
    }
    return out.filter(({ itemCount }) => itemCount > 0);
  }, [activeItems.length, cols, rows, totalRows, ySpacing]);

  useEffect(() => {
    if (displayMode === tubeLayoutMode) {
      if (displayTransition.current.phase === "rebuild") return;
      if (displayTransition.current.phase !== "idle") {
        displayTransition.current = { phase: "idle", start: -1, target: displayMode };
        itemVisibility.current = 1;
      }
      return;
    }

    displayTransition.current = {
      phase: "spin",
      start: -1,
      target: displayMode,
    };
  }, [displayMode, tubeLayoutMode]);

  useEffect(() => {
    if (displayTransition.current.phase === "rebuild") {
      displayTransition.current.phase = "fade-in";
      displayTransition.current.start = -1;
    }
  }, [tubeLayoutMode]);

  useFrame((state, dt) => {
    const now = performance.now();
    const scrollLerp = isDraggingRef.current ? 0.42 : 0.12;
    scrollCurrent.current += (scrollTargetRef.current - scrollCurrent.current) * scrollLerp;

    const activeScrollLimit = ((rows - 1) * tubeRowSpacing) / 2;
    scrollCurrent.current = Math.max(-activeScrollLimit, Math.min(activeScrollLimit, scrollCurrent.current));
    scrollTargetRef.current = Math.max(-activeScrollLimit, Math.min(activeScrollLimit, scrollTargetRef.current));

    const requestedFocusIndex = focusItemRef.current;
    if (requestedFocusIndex != null) {
      focusItemRef.current = null;
      const activePosition = activeItems.findIndex(({ index }) => index === requestedFocusIndex);
      if (activePosition >= 0) {
        const targetRowIndex = Math.floor(activePosition / cols);
        const targetRow = rowPositions[targetRowIndex];
        const targetCol = activePosition % cols;
        if (targetRow) {
          const targetTheta =
            Math.PI - ((targetCol + targetRow.rowOffset + 0.5) / targetRow.itemCount) * Math.PI * 2;
          const targetRowRotation = targetTheta - Math.PI / 2;
          const targetAngle = targetRowRotation / rowSpeed[targetRow.baseRow];
          const rowAnglePeriod = (Math.PI * 2) / rowSpeed[targetRow.baseRow];
          const nearestTurn = Math.round((angle.current - targetAngle) / rowAnglePeriod);
          focusAngleTarget.current = targetAngle + nearestTurn * rowAnglePeriod;
          focusStartedAt.current = now;
          scrollTargetRef.current = targetRow.y;
        }
      }
    }

    const damping = 0.92;
    spinVelocityRef.current *= Math.pow(damping, dt * 60);
    spinVelocityRef.current = Math.max(-2.0, Math.min(2.0, spinVelocityRef.current));

    const transition = displayTransition.current;
    let displaySpinBoost = 0;
    if (transition.phase !== "idle") {
      if (transition.start < 0) transition.start = state.clock.elapsedTime;
      const elapsed = state.clock.elapsedTime - transition.start;

      if (transition.phase === "spin") {
        displaySpinBoost = 5.2 * (1 - Math.min(1, elapsed / 0.34));
        if (elapsed >= 0.34) {
          transition.phase = "fade-out";
          transition.start = -1;
        }
      } else if (transition.phase === "fade-out") {
        const progress = Math.min(1, elapsed / 0.32);
        itemVisibility.current = 1 - (1 - Math.pow(1 - progress, 3));
        displaySpinBoost = 2.2 * (1 - progress);

        if (progress >= 1) {
          itemVisibility.current = 0;
          transition.phase = "rebuild";
          transition.start = -1;
          setTubeLayoutMode(transition.target);
        }
      } else if (transition.phase === "fade-in") {
        const progress = Math.min(1, elapsed / 0.52);
        itemVisibility.current = 1 - Math.pow(1 - progress, 3);
        displaySpinBoost = 1.15 * (1 - progress);

        if (progress >= 1) {
          itemVisibility.current = 1;
          transition.phase = "idle";
          transition.start = -1;
        }
      }
    }

    const baseSpeed = naturalDirRef.current * (0.14 + displaySpinBoost);
    angle.current += dragDeltaRef.current;
    dragDeltaRef.current = 0;
    if (focusAngleTarget.current != null) {
      const remaining = focusAngleTarget.current - angle.current;
      angle.current += remaining * Math.min(1, dt * 7.5);
      if (Math.abs(remaining) < 0.003 || now - focusStartedAt.current >= 480) {
        angle.current = focusAngleTarget.current;
        scrollCurrent.current = scrollTargetRef.current;
        focusAngleTarget.current = null;
        focusStartedAt.current = -1;
        if (selectionSequence.current) {
          selectionSequence.current.holdStartedAt = now;
        }
      }
    } else if (
      !selectionSequence.current ||
      selectionSequence.current.holdStartedAt < 0 ||
      (selectionSequence.current.activatedAt > 0 && now >= selectionSequence.current.resumeAt)
    ) {
      angle.current += (baseSpeed + spinVelocityRef.current) * dt;
    }

    const activeSelection = selectionSequence.current;
    if (activeSelection && activeSelection.holdStartedAt >= 0) {
      const holdElapsed = now - activeSelection.holdStartedAt;

      if (activeSelection.activatedAt < 0 && holdElapsed >= 250 && flashItemIndex.current < 0) {
        flashItemIndex.current = activeSelection.itemIndex;
        flashStartedAt.current = now;
      }

      if (activeSelection.activatedAt < 0 && holdElapsed >= 500) {
        activeSelection.activatedAt = now;
        activeSelection.resumeAt = now + 250;
        onImageClick(activeSelection.projectName, activeSelection.imageUrl, activeSelection.itemIndex);
      }

      if (activeSelection.activatedAt > 0 && now >= activeSelection.resumeAt) {
        selectionSequence.current = null;
      }
    }
    const group = groupRef.current;
    if (!group) return;

    group.position.y = -scrollCurrent.current;

    for (let rowIndex = 0; rowIndex < totalRows; rowIndex++) {
      const rowObj = rowGroupRefs.current[rowIndex];
      if (!rowObj) continue;
      const baseRow = rowIndex % rows;
      rowObj.rotation.y = angle.current * rowSpeed[baseRow];
    }

    const visibility = itemVisibility.current;
    itemGroupRefs.current.forEach((itemGroup) => {
      if (!itemGroup) return;
      itemGroup.visible = visibility > 0.01;
      itemGroup.scale.setScalar(Math.max(0.001, visibility));
    });
    itemMeshRefs.current.forEach((mesh) => {
      if (!mesh) return;
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      materials.forEach((material) => {
        material.transparent = true;
        material.opacity = visibility;
        setMaterialUniform(material, "uOpacity", visibility);
      });
    });
    itemBackMeshRefs.current.forEach((mesh) => {
      if (!mesh) return;
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      materials.forEach((material) => {
        material.transparent = true;
        material.opacity = visibility;
        setMaterialUniform(material, "uOpacity", visibility);
      });
    });

    if (flashItemIndex.current >= 0) {
      const elapsed = now - flashStartedAt.current;
      const flashDuration = 500;
      const progress = Math.min(1, elapsed / flashDuration);
      const flashIntensity = Math.sin(progress * Math.PI);
      const flashIndex = flashItemIndex.current;
      [itemMeshRefs.current[flashIndex], itemBackMeshRefs.current[flashIndex]].forEach((mesh) => {
        if (!mesh) return;
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        materials.forEach((material) => {
          setMaterialUniform(material, "uFlashProgress", progress);
          setMaterialUniform(material, "uFlashIntensity", flashIntensity);
        });
      });
      [flashOverlayMeshRefs.current[flashIndex], flashOverlayBackMeshRefs.current[flashIndex]].forEach((mesh) => {
        if (!mesh) return;
        mesh.visible = true;
        const material = mesh.material as ShaderMaterial;
        material.uniforms.uProgress.value = progress;
        material.uniforms.uIntensity.value = flashIntensity;
        material.opacity = 1;
      });

      if (progress >= 1) {
        [itemMeshRefs.current[flashIndex], itemBackMeshRefs.current[flashIndex]].forEach((mesh) => {
          if (!mesh) return;
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          materials.forEach((material) => {
            setMaterialUniform(material, "uFlashProgress", 0);
            setMaterialUniform(material, "uFlashIntensity", 0);
          });
        });
        [flashOverlayMeshRefs.current[flashIndex], flashOverlayBackMeshRefs.current[flashIndex]].forEach((mesh) => {
          if (!mesh) return;
          mesh.visible = false;
          const material = mesh.material as ShaderMaterial;
          material.uniforms.uIntensity.value = 0;
        });
        flashItemIndex.current = -1;
        flashStartedAt.current = -1;
      }
    }
  });

  return (
    <group ref={groupRef}>
      {rowPositions.map(({ rowIndex, y, baseRow, rowOffset, itemCount }) => (
        <group
          key={rowIndex}
          position={[0, y, 0]}
          ref={(obj) => {
            rowGroupRefs.current[rowIndex] = obj;
          }}
        >
          {Array.from({ length: itemCount }).map((_, col) => {
            const theta = Math.PI - ((col + rowOffset + 0.5) / itemCount) * Math.PI * 2;
            const x = Math.cos(theta) * radius;
            const z = Math.sin(theta) * radius;
            const ry = -(theta + Math.PI / 2);
            const activeItem = activeItems[baseRow * cols + col];
            const { item, index: texIndex } = activeItem;
            const texture = texturesByUrl.get(item.imageUrl);
            const textureImage = texture?.image as { width?: number; height?: number } | undefined;
            const imageAspect =
              textureImage?.width && textureImage.height ? textureImage.width / textureImage.height : 1;
            const tileW = tileH * imageAspect;
            const captionPadding = 0.05;
            const captionWidth = Math.min(tileW - captionPadding * 2, 1.35);
            const openImageDetail = (event: ThreeEvent<PointerEvent>) => {
              event.stopPropagation();
              if (displayMode === "pulled" && item.type === "stream") return;
              const now = performance.now();
              if (now < suppressClickUntilRef.current || now - lastItemActivationAt.current < 100) return;
              lastItemActivationAt.current = now;
              // A positive Y rotation moves the card's position from theta to
              // theta - rowRotation. At rowRotation = theta - PI / 2, this
              // card is on the camera's center axis and its back face points
              // toward the camera.
              const targetRowRotation = theta - Math.PI / 2;
              const targetAngle = targetRowRotation / rowSpeed[baseRow];
              // Each row has its own angular speed, so its equivalent full
              // rotations in `angle.current` are 2π / rowSpeed, not 2π.
              const rowAnglePeriod = (Math.PI * 2) / rowSpeed[baseRow];
              const nearestTurn = Math.round((angle.current - targetAngle) / rowAnglePeriod);
              focusAngleTarget.current = targetAngle + nearestTurn * rowAnglePeriod;
              focusStartedAt.current = now;
              scrollTargetRef.current = y;
              selectionSequence.current = {
                itemIndex: texIndex,
                projectName: item.title,
                imageUrl: item.imageUrl,
                holdStartedAt: -1,
                activatedAt: -1,
                resumeAt: -1,
              };
              playClickSound();
            };

            return (
              <group
                key={texIndex}
                position={[x, 0, z]}
                rotation={[0, ry, 0]}
                ref={(obj) => {
                  itemGroupRefs.current[texIndex] = obj;
                }}
                visible={itemVisibility.current > 0.01}
                scale={Math.max(0.001, itemVisibility.current)}
              >
                <mesh
                  ref={(mesh) => {
                    itemMeshRefs.current[texIndex] = mesh;
                  }}
                  onPointerUp={openImageDetail}
                  onClick={openImageDetail}
                >
                  <planeGeometry args={[tileW, tileH]} />
                  <shaderMaterial
                    transparent
                    toneMapped={false}
                    vertexShader={imageVertexShader}
                    fragmentShader={imageFragmentShader}
                    uniforms={{
                      uMap: { value: texture },
                      uFlashProgress: { value: 0 },
                      uFlashIntensity: { value: 0 },
                      uOpacity: { value: itemVisibility.current },
                    }}
                  />
                  <ItemCaption
                    item={item}
                    position={[-tileW / 2 + captionPadding, tileH / 2 - captionPadding, 0.024]}
                    width={captionWidth}
                  />
                  <CanvasPlayingIndicator
                    active={playingTrackIndex === texIndex}
                    color={isDarkTrackNumber(item.numberTrack) ? "#080808" : "#ffffff"}
                    position={[tileW / 2 - 0.15, -tileH / 2 + 0.14, 0.035]}
                  />
                </mesh>
                <mesh
                  ref={(mesh) => {
                    flashOverlayMeshRefs.current[texIndex] = mesh;
                  }}
                  position={[0, 0, 0.03]}
                  renderOrder={3}
                  visible={false}
                >
                  <planeGeometry args={[tileW, tileH]} />
                  <shaderMaterial
                    transparent
                    depthTest={false}
                    depthWrite={false}
                    blending={AdditiveBlending}
                    vertexShader={flashVertexShader}
                    fragmentShader={flashFragmentShader}
                    uniforms={{
                      uProgress: { value: 0 },
                      uIntensity: { value: 0 },
                    }}
                  />
                </mesh>
                <mesh
                  ref={(mesh) => {
                    itemBackMeshRefs.current[texIndex] = mesh;
                  }}
                  rotation={[0, Math.PI, 0]}
                  onPointerUp={openImageDetail}
                  onClick={openImageDetail}
                >
                  <planeGeometry args={[tileW, tileH]} />
                  <shaderMaterial
                    transparent
                    toneMapped={false}
                    vertexShader={imageVertexShader}
                    fragmentShader={imageFragmentShader}
                    uniforms={{
                      uMap: { value: texture },
                      uFlashProgress: { value: 0 },
                      uFlashIntensity: { value: 0 },
                      uOpacity: { value: itemVisibility.current },
                    }}
                  />
                  <ItemCaption
                    item={item}
                    position={[-tileW / 2 + captionPadding, tileH / 2 - captionPadding, 0.024]}
                    width={captionWidth}
                  />
                  <CanvasPlayingIndicator
                    active={playingTrackIndex === texIndex}
                    color={isDarkTrackNumber(item.numberTrack) ? "#080808" : "#ffffff"}
                    position={[tileW / 2 - 0.15, -tileH / 2 + 0.14, 0.035]}
                  />
                </mesh>
                <mesh
                  ref={(mesh) => {
                    flashOverlayBackMeshRefs.current[texIndex] = mesh;
                  }}
                  position={[0, 0, 0.03]}
                  rotation={[0, Math.PI, 0]}
                  renderOrder={3}
                  visible={false}
                >
                  <planeGeometry args={[tileW, tileH]} />
                  <shaderMaterial
                    transparent
                    depthTest={false}
                    depthWrite={false}
                    blending={AdditiveBlending}
                    vertexShader={flashVertexShader}
                    fragmentShader={flashFragmentShader}
                    uniforms={{
                      uProgress: { value: 0 },
                      uIntensity: { value: 0 },
                    }}
                  />
                </mesh>
              </group>
            );
          })}
        </group>
      ))}
    </group>
  );
}

export function HVLScene() {
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [isLyricsAutoScrollPaused, setIsLyricsAutoScrollPaused] = useState(false);
  const lyricsBodyRef = useRef<HTMLDivElement>(null);
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
  const [streamDisplayDelay, setStreamDisplayDelay] = useState<StreamDisplayDelay>(autoNextDelaySeconds);
  const [pendingDisplayMode, setPendingDisplayMode] = useState<DisplayMode>("pulled");
  const [pendingDisplayStyle, setPendingDisplayStyle] = useState<DisplayStyle>("museum");
  const [pendingDockPinned, setPendingDockPinned] = useState(false);
  const [pendingStreamDisplayDelay, setPendingStreamDisplayDelay] = useState<StreamDisplayDelay>(autoNextDelaySeconds);
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
    if (isMobile) {
      detailButtonsTimeoutRef.current = null;
      return;
    }

    detailButtonsTimeoutRef.current = window.setTimeout(() => {
      setAreDetailButtonsVisible(false);
      setDetailNavigationPreview(null);
      detailButtonsTimeoutRef.current = null;
    }, 5_000);
  }, [isMobile]);

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
    setPendingStreamDisplayDelay(streamDisplayDelay);
    setIsSettingsOpen(true);
  }, [displayMode, displayStyle, isDockPinned, isMobile, streamDisplayDelay]);

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
    }, 2_500);
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
    setIsLyricsOpen(false);
  }, [resetLyricsAutoScrollPause]);

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

  const handleStreamDisplayDelayChange = useCallback((nextDelay: StreamDisplayDelay) => {
    playClickSound();
    setPendingStreamDisplayDelay(nextDelay);
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

    if (pendingStreamDisplayDelay !== streamDisplayDelay) {
      setStreamDisplayDelay(pendingStreamDisplayDelay);
      setAutoNextRemaining(pendingStreamDisplayDelay);
      setStreamElapsedTime(0);
      setStreamTimerRevision((revision) => revision + 1);
      setIsAutoNextPaused(false);
      autoNextDeadlineRef.current = null;
    }
    window.localStorage.setItem(streamDisplayDelayStorageKey, String(pendingStreamDisplayDelay));
    setIsSettingsOpen(false);
  }, [isDetailMinimized, isDockPinned, isMobile, pendingDisplayMode, pendingDisplayStyle, pendingDockPinned, pendingStreamDisplayDelay, scheduleFloatingPlayerHideAfterSettings, selectedProject, streamDisplayDelay]);

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

    tubeDragDelta.current += deltaX * 0.0025;
    tubeSpinVelocity.current = Math.max(-2, Math.min(2, tubeSpinVelocity.current + deltaX * 0.0025));
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
  }, []);

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
  const nextTrackResult = selectedProject ? getNextTrack(selectedProject.index, displayMode) : null;
  const previousTrackResult = selectedProject ? getPreviousTrack(selectedProject.index, displayMode) : null;
  const nextTrack = nextTrackResult?.track ?? null;
  const isStreaming = selectedTrack?.type === "stream";
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
    ) => {
      if (closeOverlayTimeoutRef.current != null) {
        window.clearTimeout(closeOverlayTimeoutRef.current);
        closeOverlayTimeoutRef.current = null;
      }
      const audio = audioRef.current;
      const track = galleryItems[textureIndex];
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
        audio.removeAttribute("src");

        if (track?.type === "pulled" && track.audioUrl) {
          audio.src = track.audioUrl;
          audio.load();
        } else {
          audio.load();
        }
      }
      setIsPlaying(false);
      setIsLyricsOpen(false);
      setCurrentTime(0);
      setDuration(0);
      setAutoNextRemaining(streamDisplayDelay);
      setStreamElapsedTime(0);
      setStreamTimerRevision((revision) => revision + 1);
      setIsAutoNextPaused(false);
      autoNextDeadlineRef.current = null;
      setDetailNavigationPreview(null);
      const nextPresentation = presentation ?? (isDetailMinimizedRef.current ? "minimized" : "detail");
      isDetailMinimizedRef.current = nextPresentation === "minimized";
      setIsDetailMinimized(isDetailMinimizedRef.current);
      setIsFloatingPlayerExpanded(true);
      if (track?.type === "stream") {
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
      if (!isMobile && nextPresentation === "minimized" && !isDockPinned && track?.type !== "stream") {
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
      if (track?.type === "pulled" && track.audioUrl && audio) {
        void audio.play().catch(() => setIsPlaying(false));
      }
      if (isMobile) {
        setAreDetailButtonsVisible(true);
      } else {
        resetDetailButtonsVisibility();
      }
    },
    [isDockPinned, isMobile, resetDetailButtonsVisibility, streamDisplayDelay],
  );

  const handleNextTrack = useCallback((presentation?: TrackPresentation) => {
    if (!nextTrackResult) return;

    handleImageClick(
      nextTrackResult.track.title,
      nextTrackResult.track.imageUrl,
      nextTrackResult.index,
      presentation ?? (isDetailMinimizedRef.current ? "minimized" : "detail"),
    );
  }, [handleImageClick, nextTrackResult]);

  const handlePreviousTrack = useCallback((presentation: TrackPresentation = "minimized") => {
    if (!previousTrackResult) return;

    handleImageClick(
      previousTrackResult.track.title,
      previousTrackResult.track.imageUrl,
      previousTrackResult.index,
      presentation,
    );
  }, [handleImageClick, previousTrackResult]);

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
    if (isAutoNextPaused) {
      autoNextDeadlineRef.current = performance.now() + Math.max(0, streamDisplayDelay - streamElapsedTime) * 1_000;
      setIsAutoNextPaused(false);
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
  }, [isAutoNextPaused, streamDisplayDelay, streamElapsedTime]);

  const handleMinimizeProject = useCallback(() => {
    isDetailMinimizedRef.current = true;
    setIsLyricsOpen(false);
    setIsDetailMinimized(true);
    setIsFloatingPlayerExpanded(true);
    if (!isMobile && !isDockPinned && selectedTrack?.type !== "stream") {
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
  }, [isDockPinned, isMobile, selectedTrack]);

  const handleRestoreProject = useCallback(() => {
    isDetailMinimizedRef.current = false;
    setIsDetailMinimized(false);
    setShowOverlay(true);
    resetDetailButtonsVisibility();
  }, [resetDetailButtonsVisibility]);

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
    if (!audio || selectedTrack?.type !== "pulled" || !selectedTrack.audioUrl) return;

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

  const snapToLyricsTimestamp = useCallback((nextTime: number) => {
    const timestamps = selectedTrack?.lyricsTimestamps;
    if (!timestamps?.length) return nextTime;

    return timestamps.reduce((nearestTimestamp, timestamp) => (
      Math.abs(timestamp - nextTime) < Math.abs(nearestTimestamp - nextTime)
        ? timestamp
        : nearestTimestamp
    ));
  }, [selectedTrack]);

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

      restorePlayback?.();
      restorePlayback = null;
      settleAtCurrentPosition();
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
      completeAudioSeek(audio, snapToLyricsTimestamp(startTime), true);
    },
    [completeAudioSeek, selectedTrack, snapToLyricsTimestamp],
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
      completeAudioSeek(audio, snapToLyricsTimestamp(nextTime), resumeAfterSeekRef.current);
    }
    resumeAfterSeekRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, [completeAudioSeek, getProgressSeekTime, snapToLyricsTimestamp]);

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
        setDisplayStyle(storedDisplayStyle === "list" ? "list" : "museum");
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

    const storedStreamDelay = Number(window.localStorage.getItem(streamDisplayDelayStorageKey));
    if (streamDisplayDelayOptions.includes(storedStreamDelay as StreamDisplayDelay)) {
      setStreamDisplayDelay(storedStreamDelay as StreamDisplayDelay);
      setAutoNextRemaining(storedStreamDelay);
      setStreamElapsedTime(0);
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
    if (!isLyricsOpen) return;

    const handleLyricsKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleLyricsClose();
    };

    window.addEventListener("keydown", handleLyricsKeyDown);
    return () => window.removeEventListener("keydown", handleLyricsKeyDown);
  }, [handleLyricsClose, isLyricsOpen]);

  useEffect(() => {
    if (!isLyricsOpen || !isDetailPlaying || isLyricsAutoScrollPaused || activeLyricsLineIndex < 0) return;

    const activeLine = lyricsBodyRef.current?.querySelector<HTMLElement>(
      `[data-lyrics-index="${activeLyricsLineIndex}"]`,
    );
    activeLine?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeLyricsLineIndex, isDetailPlaying, isLyricsAutoScrollPaused, isLyricsOpen]);

  useEffect(() => {
    if (!hasConfirmedAge || isAgeGateOpen || selectedProject || isMobile) {
      if (sceneControlsTimeoutRef.current != null) {
        window.clearTimeout(sceneControlsTimeoutRef.current);
        sceneControlsTimeoutRef.current = null;
      }
      setAreSceneControlsVisible(true);
      return;
    }

    resetSceneControlsVisibility();
  }, [hasConfirmedAge, isAgeGateOpen, isMobile, resetSceneControlsVisibility, selectedProject]);

  useEffect(() => {
    return () => {
      if (closeOverlayTimeoutRef.current != null) window.clearTimeout(closeOverlayTimeoutRef.current);
      if (detailButtonsTimeoutRef.current != null) window.clearTimeout(detailButtonsTimeoutRef.current);
      if (sceneControlsTimeoutRef.current != null) window.clearTimeout(sceneControlsTimeoutRef.current);
      if (displayModeStatusTimeoutRef.current != null) window.clearTimeout(displayModeStatusTimeoutRef.current);
      if (repeatAnimationTimeoutRef.current != null) window.clearTimeout(repeatAnimationTimeoutRef.current);
      if (repeatToastTimeoutRef.current != null) window.clearTimeout(repeatToastTimeoutRef.current);
      if (lyricsAutoScrollPauseTimeoutRef.current != null) window.clearTimeout(lyricsAutoScrollPauseTimeoutRef.current);
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
      className={`sceneRoot__content ${!isAgeGateStateReady || isAgeGateOpen ? "is-blurred" : ""}`}
      onPointerDown={isMobile || displayStyle === "list" || (selectedProject && !isDetailMinimized) ? undefined : onPointerDown}
      onPointerMove={isMobile || displayStyle === "list" || (selectedProject && !isDetailMinimized) ? undefined : handleScenePointerMove}
      onPointerUp={isMobile || displayStyle === "list" || (selectedProject && !isDetailMinimized) ? undefined : onPointerUp}
      onPointerCancel={isMobile || displayStyle === "list" || (selectedProject && !isDetailMinimized) ? undefined : onPointerCancel}
      onPointerLeave={isMobile || displayStyle === "list" || (selectedProject && !isDetailMinimized) ? undefined : onPointerLeave}
      onWheel={isMobile || displayStyle === "list" || (selectedProject && !isDetailMinimized) ? undefined : onWheel}
    >
      {isPresentationReady && (isMobile || displayStyle === "list") && (
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

      {!isPresentationReady ? null : isMobile || displayStyle === "list" ? (
        <MobileTrackList
          onSelect={handleImageClick}
          onScroll={handleMobileTrackListScroll}
          displayMode={displayMode}
          playingTrackIndex={showOverlay && isDetailPlaying && selectedProject ? selectedProject.index : null}
        />
      ) : (
        <Canvas
          camera={{ position: [0, 0, 6], fov: 50 }}
          gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
          dpr={[1, 2]}
          frameloop="always"
          onCreated={({ camera, gl }) => {
            camera.lookAt(0, 0, 0);
            gl.setClearColor(0x000000, 0);
          }}
        >
          <Suspense fallback={null}>
            <HVLTitle />
            <ImageTube
              scrollTargetRef={tubeScrollTarget}
              focusItemRef={tubeFocusItem}
              isDraggingRef={isDragging}
              spinVelocityRef={tubeSpinVelocity}
              naturalDirRef={tubeNaturalDir}
              dragDeltaRef={tubeDragDelta}
              suppressClickUntilRef={suppressImageClickUntil}
              onImageClick={handleImageClick}
              displayMode={displayMode}
              playingTrackIndex={showOverlay && isDetailPlaying && selectedProject ? selectedProject.index : null}
            />
          </Suspense>
        </Canvas>
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

      {isMobile && hasConfirmedAge && !isAgeGateOpen && (
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
      )}

      {selectedProject && (
        <div
          className={`project-single-view ${showOverlay ? "visible" : "hidden"} ${isDetailMinimized ? "is-minimized" : ""} ${isLyricsOpen && selectedTrack?.lyrics ? "is-lyrics-open" : ""} ${areDetailButtonsVisible ? "" : "is-buttons-hidden"} ${!isMobile && (selectedTrack?.numberTrack === 8 || selectedTrack?.numberTrack === 27 || selectedTrack?.numberTrack === 28) ? "is-dark-track" : ""}`}
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
          {!isDetailMinimized && selectedTrack?.lyrics && (!isMobile || !isLyricsOpen) && (
            <button
              className="detail-lyrics-button"
              type="button"
              onClick={() => {
                playClickSound();
                resetLyricsAutoScrollPause();
                setIsLyricsOpen((isOpen) => !isOpen);
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

      {selectedProject && showOverlay && !isDetailMinimized && selectedTrack?.lyrics && (
          <div className={`lyrics-panel__desktop-backdrop ${isLyricsOpen ? "is-open" : ""}`}>
          <aside
            className={`lyrics-panel ${isLyricsOpen ? "is-open" : ""}`}
            aria-label="Lời bài hát"
          >
            <div className="lyrics-panel__top-gradient" aria-hidden="true" />
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
            {lyricsEntries.map((entry, index) => (
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
            ))}
          </div>
          <div className="lyrics-panel__bottom-gradient" aria-hidden="true" />
          </aside>
          </div>
      )}

      {selectedProject && isDetailMinimized && selectedTrack && (
        <div
          className={`floating-player-dock ${isFloatingPlayerExpanded || isDockPinned || (!isMobile && isStreaming) ? "is-expanded" : "is-collapsed"}`}
          onMouseEnter={!isMobile ? handleFloatingPlayerMouseEnter : undefined}
          onMouseLeave={!isMobile ? handleFloatingPlayerMouseLeave : undefined}
        >
          <section
            className={`floating-player ${isStreaming ? "is-streaming" : ""}`}
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
              className={`floating-player__mobile-actions ${isStreaming ? "is-streaming" : ""}`}
              onClick={(event) => event.stopPropagation()}
            >
              {!isStreaming && (
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
              {isStreaming && (
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
              {isStreaming && (
                <StreamingPlatformLinks
                  className="floating-player__desktop-platforms"
                  linkClassName="floating-player__platform-link"
                />
              )}
              {!isStreaming && (
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
                className={`floating-player__display-mode ${isDisplayModeStatusVisible ? "is-status-visible" : ""}`}
                type="button"
                onClick={handleSettingsOpen}
                onPointerDown={(event) => event.stopPropagation()}
                aria-label="Cài Đặt"
              >
                <span className="floating-player__display-status" aria-hidden="true">
                  {displayMode === "full" ? "FULL ALBUM" : "PULLED TRACK"}
                </span>
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
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
              <h2 id="settings-modal-title">Cài Đặt</h2>
              <button className="settings-modal__close" type="button" onClick={handleSettingsClose} aria-label="Đóng Cài Đặt">
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
                    className={`settings-modal__choice ${pendingDisplayMode === "full" ? "is-selected" : ""}`}
                    type="button"
                    onClick={() => handleSettingsDisplayModeChange("full")}
                    aria-pressed={pendingDisplayMode === "full"}
                  >
                    <span>FULL ALBUM</span>
                  </button>
                  <button
                    className={`settings-modal__choice ${pendingDisplayMode === "pulled" ? "is-selected" : ""}`}
                    type="button"
                    onClick={() => handleSettingsDisplayModeChange("pulled")}
                    aria-pressed={pendingDisplayMode === "pulled"}
                  >
                    <span>TRACK BỊ GỠ</span>
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

              <div
                className={`settings-modal__row ${pendingDisplayMode === "pulled" ? "is-disabled" : ""}`}
                aria-disabled={pendingDisplayMode === "pulled"}
              >
                <span className="settings-modal__label">Bỏ Qua Bài Stream Sau</span>
                <div className="settings-modal__tabs" role="group" aria-label="Thời gian bỏ qua bài stream">
                  {streamDisplayDelayOptions.map((delay) => (
                    <button
                      className={`settings-modal__tab ${pendingStreamDisplayDelay === delay ? "is-selected" : ""}`}
                      key={delay}
                      type="button"
                      disabled={pendingDisplayMode === "pulled"}
                      onClick={() => handleStreamDisplayDelayChange(delay)}
                      aria-pressed={pendingStreamDisplayDelay === delay}
                    >
                      {delay}s
                    </button>
                  ))}
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
