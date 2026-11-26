# Bé học vui · Little Learners

Game học tập miễn phí cho bé 2–5 tuổi, song ngữ tiếng Việt và tiếng Anh. Bé làm quen với số, màu sắc và hình khối.

- Web tĩnh (Vite + React + TypeScript), không backend, không đăng nhập, không thu thập dữ liệu.
- Ngôn ngữ đã chọn được lưu trên máy (localStorage).
- Giọng nói tạo sẵn bằng ElevenLabs, lưu thành file mp3 trong repo. Web không gọi ElevenLabs khi bé chơi.
- Đồ hoạ: ưu tiên bộ hình CC0 của [Kenney](https://kenney.nl/assets), phần nào không có thì vẽ bằng SVG.

## Chạy thử

```bash
npm install
```

```bash
npm run dev
```

## Cấu trúc

```
src/
  App.tsx                  Chuyển giữa màn hình chính, màn chơi và màn đọc truyện
  components/              HomeScreen (2 tab), PlayScreen, GameScreen, LanguageToggle
  games/registry.tsx       Danh sách trò chơi (thêm trò mới ở đây)
  stories/                 Truyện tương tác: data.ts (nội dung), StoryPlayer, art/ (hình vẽ)
  games/shared/            Thanh câu hỏi, mức Dễ/Khó, hàm dùng chung
  games/counting, colors, shapes, compare   4 trò học số, màu, hình
  games/flag-builder/      Trò "Ghép quốc kỳ" (cắt mảnh và mức chơi trong puzzle.ts, vẽ mảnh trong FlagPiece.tsx)
  games/writing/           Trò "Tập viết chữ" và "Tập viết số" (nét chữ trong glyphs.ts, khung tô trong Writer.tsx)
  games/flag-drive/        Trò "Lái xe tìm cờ" (100 nước và các vòng trong countries.ts, cảnh nền trong themes.ts + Scenery.tsx)
  i18n/strings.ts          Chữ giao diện VI/EN
  i18n/                   Ngôn ngữ hiện tại (LanguageProvider, useLanguage)
  audio/audio.ts           Phát file public/audio/<vi|en>/<key>.mp3
  lib/storage.ts           Đọc/ghi localStorage an toàn
public/
  audio/vi, audio/en       File giọng nói từ ElevenLabs
  audio/music              Nhạc nền phát lặp trong màn chơi (có nút bật/tắt)
  assets/kenney            Hình tải từ Kenney, mỗi bộ kèm License.txt (CC0)
    flag-pack/             Cờ Việt Nam trên ô trò chơi (SVG)
  assets/flags             100 lá cờ cho trò lái xe, từ bộ flag-icons (MIT, kèm LICENSE.txt)
    racing-pack/           Xe ô tô
```

## Trò chơi

Mỗi trò có 3 mức Dễ / Vừa / Khó (lựa chọn lưu trên máy, đổi mức thì bắt đầu lượt mới), giọng nói VI/EN và nhạc nền. Bé làm sai thì được nhắc "Thử lại nhé!", không có âm báo sai.

Mỗi lượt chơi gồm 5 câu; mỗi câu đúng thêm một ngôi sao trên thanh tiến độ. Đủ 5 sao thì hiện màn hình hoàn thành (cúp, sao, pháo giấy, lời khen "Hoàn thành rồi! Bé giỏi quá!") với nút Chơi lại và Trang chủ. Mỗi lần hoàn thành được một cúp; số cúp hiện trên ô trò chơi ở màn hình chính (lưu trên máy).

| Trò | Cách chơi | Dễ | Vừa | Khó |
|---|---|---|---|---|
| Lái xe tìm cờ / Flag drive | Kéo xe theo đường tới lá cờ đúng, hoặc chạm thẳng vào lá cờ | Bắt đầu từ vòng 1 | Bắt đầu từ vòng 3 | Bắt đầu từ vòng 5 (xem mục bên dưới) |
| Ghép quốc kỳ / Build a flag | Hình cờ thật được cắt thành các mảnh như tranh xếp hình; kéo từng mảnh từ khay vào đúng ô trong khung | Có cờ mẫu; 2 mảnh (trái/phải) + 1 mảnh nhiễu; 20 nước quen thuộc | Có cờ mẫu; 4 mảnh (2×2) + 2 mảnh nhiễu; 50 nước | Không có mẫu; 6 mảnh (3×2) + 2 mảnh nhiễu; cả 100 nước |
| Đếm đồ vật / Counting | Chạm từng quả táo (giọng đọc đếm theo), rồi chọn đúng số | 1–3 quả | 1–6 quả | 1–10 quả |
| Tìm màu / Find the color | Chạm quả bóng đúng màu, bóng bay lên | 2 bóng, đỏ/xanh dương/vàng | 3 bóng, 6 màu | 5 bóng, 6 màu |
| Xếp hình / Shape match | Kéo hình vào ô cùng hình dạng | 2 hình (tròn, vuông, tam giác) | 3 hình | 4 hình (thêm ngôi sao) |
| Tập viết chữ / Write letters | Chọn chữ trên bảng (tab chữ thường / chữ hoa), xem hoạt ảnh viết từng nét theo thứ tự, rồi tô theo bằng ngón tay (xem mục bên dưới) | Chữ mờ đậm, vệt tô rộng | Chữ mờ nhạt | Chỉ có chấm đặt bút, vệt tô hẹp |
| Tập viết số / Write numbers | Như trên, với các số 0–9 | Như trên | Như trên | Như trên |
| Nhiều hay ít / More or less | Chạm giỏ có nhiều hơn (hoặc ít hơn) | "Nhiều hơn", 1–5 quả, chênh ≥ 3 | "Nhiều hơn", 1–7 quả, chênh ≥ 2 | "Nhiều hơn" hoặc "ít hơn", 1–9 quả, chênh ≥ 1 |

Đồ hoạ của các trò học số, màu, hình vẽ bằng SVG. Trò lái xe và trò ghép cờ dùng chung 100 hình cờ của flag-icons; trò lái xe dùng xe của Kenney.

Trong trò ghép cờ, mảnh nhiễu cắt từ cờ nước khác (cùng nhóm nước của mức chơi). Đặt sai ô hoặc đặt mảnh nhiễu thì mảnh quay về khay và game nhắc "Thử lại nhé!". Mảnh nào trông giống hệt một ô khác (ví dụ hai mảnh đỏ trơn của cờ Madagascar, hay mảnh trắng của cờ khác) thì đặt vào ô đó cũng được tính đúng; game so sánh điểm ảnh của mảnh lúc bắt đầu mỗi cờ.

### Tập viết chữ, tập viết số

- Kiểu chữ: dáng chữ viết tay đứng của mẫu chữ lớp 1 ở Việt Nam nhưng đơn giản hơn cho bé nhỏ: không có nét khuyết (b, h, k, l, g, y dùng nét thẳng), chữ hoa không có vòng xoắn, chỉ giữ móc nhỏ ở chân chữ (a, i, u…). Các nét còn lại (độ rộng, nét móc, vòng thắt nhỏ của b, k, r, s, v) đã đối chiếu với bảng mẫu chữ viết thường và chữ số lớp 1. Hình nét do app tự vẽ, không lấy từ font.
- Bảng chữ theo ngôn ngữ: tiếng Việt 29 chữ (có ă â đ ê ô ơ ư), tiếng Anh 26 chữ (f, j, w, z vẽ cùng kiểu). Chữ hoa và chữ thường ở hai tab.
- Chữ nằm trên dòng kẻ như vở ô li (1 li = 10 đơn vị): chữ thường cao 2 li; b, g, h, k, l, y cao 5 li; d, đ, p, q 4 li; t 3 li; chữ hoa 5 li; chữ số 4 li.
- Mở một chữ: hoạt ảnh vẽ từng nét theo thứ tự (chấm cam là đầu bút, số ở điểm đặt bút). Xong thì bé tô theo: đặt tay vào chấm có số, kéo theo hướng mũi tên; nét chỉ tiến lên khi ngón tay đi đúng đường và đúng chiều. Nhấc tay giữa chừng thì phần đã tô vẫn giữ. Đặt tay sai chỗ thì game nhắc "Thử lại nhé!".
- Nút dưới khung viết: ▦ về bảng chữ, 👀 xem lại cách viết, ▶ sang chữ tiếp theo.
- Dùng được trên điện thoại và iPad, dọc hoặc ngang. Điện thoại xoay ngang: khung viết bên trái, sao và các nút xếp dọc bên phải; iPad: ô chữ và nút to hơn.
- Chữ đã viết xong có dấu ★ trên bảng (lưu trên máy). Mỗi chữ viết xong được một sao, đủ 5 sao được một cúp.
- Bản dev có trang xem trước nét của mọi chữ và số: mở `/#glyphs` (mỗi nét một màu, số thứ tự ở điểm đặt bút).

### Lái xe tìm cờ

Đường có ngã rẽ, mỗi nhánh có một lá cờ. Game đọc và hiện chữ "Lấy cờ Việt Nam!". Bé đặt ngón tay lên xe (có vòng sáng gợi ý) và kéo xe chạy theo đường; xe chỉ chạy trên đường. Kéo tới cờ sai thì lá cờ lắc nhẹ, game nhắc "Thử lại nhé!" và xe lùi về ngã rẽ. Bé cũng có thể chạm thẳng vào lá cờ đúng để xe tự chạy tới. Trò có 100 nước (châu Á, Âu, Mỹ, Phi, Đại Dương). Chơi theo vòng, mỗi vòng tìm 5 lá cờ. Xong 5 lá thì hiện "Xong vòng N! Bé giỏi quá!" với nút **▶ Vòng tiếp**; sang vòng mới thì đổi cảnh nền và khó dần lên. Trong một vòng không hỏi lặp lại một nước.

Cảnh nền xoay vòng theo thứ tự: Đồng cỏ, Bãi biển, Xứ tuyết, Sa mạc, Thành phố, Rừng thu, Đêm trăng (vòng 8 quay lại Đồng cỏ).

| Vòng | Số cờ | Nhóm nước |
|---|---|---|
| 1 | 2 | 20 nước quen thuộc, cờ khác nhau rõ |
| 2 | 3 | 20 nước quen thuộc |
| 3 | 3 | 50 nước (thêm các nước gần gũi, cờ dễ nhận) |
| 4 | 3 | Cả 100 nước |
| 5 | 4 | Cả 100 nước |
| 6 trở đi | 4 | Cả 100 nước, cặp cờ dễ nhầm (Na Uy / Iceland, Việt Nam / Trung Quốc…) cố ý đặt cạnh nhau |

Ở vòng 1–5, các cặp cờ dễ nhầm không xuất hiện cùng lượt. Mức Dễ / Vừa / Khó chỉ chọn vòng bắt đầu (1 / 3 / 5).

File âm thanh (trong `public/audio/vi/` và `public/audio/en/`):

- `flags-find-<MÃ NƯỚC>.mp3` cho cả 100 nước (mã ISO 3166-1 hai chữ, như trong `countries.ts`)
- `flags-great.mp3`
- `flags-retry.mp3`

File âm thanh của các trò khác:

- Dùng chung: `common-great`, `common-retry`, `common-finish`
- Đếm đồ vật: `counting-intro`, `counting-ask`, `number-1` … `number-10`
- Tìm màu: `colors-find-<red|blue|yellow|green|orange|purple>`
- Xếp hình: `shapes-intro`, `shape-<circle|square|triangle|star>`
- Nhiều hay ít: `compare-more`, `compare-less`
- Tập viết: `write-pick-letter`, `write-pick-number`, `write-watch`, `write-trace`
- Ghép quốc kỳ: `build-<MÃ NƯỚC>` cho cả 100 nước (tải khi mở trò)

## Truyện tương tác

Trang chủ có hai tab: **📖 Truyện** và **🎮 Trò chơi** (tab đang chọn được lưu trên máy). Có 6 truyện sáng tác riêng cho app, nhân vật chính là Ba và bé Henry. Nội dung chữ VI/EN của mọi truyện nằm trong `src/stories/data.ts`.

| Truyện | Lựa chọn đầu (giữ suốt truyện) | Ngã rẽ | 4 kết thúc |
|---|---|---|---|
| Ba và Henry đi công viên / Park Ride with Dad | xe đỏ / xe xanh | hồ nước / vườn hoa | chở vịt con, hỏi bác Rùa, nhờ bạn Sóc, ba nâng Henry |
| Henry và cá voi con / Henry and the Baby Whale | áo phao vàng / cam | rạn san hô / đảo nhỏ | cá hề, rùa biển, đèn hải đăng, bầy hải âu |
| Chuyến tàu tìm ông Trăng / The Moon Train | tàu xanh lá / tím | núi cao / đồng đom đóm | thổi mây, bác Cú, hát cho đom đóm, xếp hình trăng |
| Vườn rau của bà / Grandma's Garden | nón lá / mũ rơm | luống rau / cây ăn trái | cà rốt, bí đỏ, xoài, dâu tây |
| Bác sĩ thú y Henry / Doctor Henry | túi thuốc đỏ / xanh | bạn Mèo / bạn Thỏ | gỡ gai, dán băng sao, nước ấm, khăn len |
| Đi chợ hoa ngày Tết / Flower Market at Tết | áo dài đỏ / vàng | mai vàng / đào hồng | bao lì xì, đèn lồng, bánh chưng, múa lân |

- Mỗi đoạn có hình minh hoạ, lời đọc và chữ; câu hỏi lựa chọn nằm ngay trong lời đọc nên bé chưa biết chữ vẫn chọn được bằng hình.
- Tới kết thúc: đọc đoạn kết, rồi đoạn "Hết truyện!", rồi màn hình cúp. Bìa truyện ở trang chủ hiện số kết thúc đã khám phá (ví dụ 📖 2/4, lưu trên máy).
- Thêm truyện mới: khai báo trong `data.ts`, vẽ `src/stories/art/<id>.tsx` (xuất `Scene` và `Icon`), thêm vào `art/index.ts`, tạo 9 file âm thanh mỗi thứ tiếng.
- Âm thanh: `story-<id>-<đoạn>.mp3` (đoạn: `start`, `fork`, hai nhánh, bốn `end-…`, `outro`), chỉ tải khi mở truyện đó.

Hình vẽ bằng SVG (`src/stories/art/`): `kit.tsx` chứa dải màu dùng chung (trời, biển, cỏ, lớp đổ bóng và độ bóng), nhân vật Henry, Ba, Bà và cảnh vật; mỗi truyện một file cảnh riêng. Một số chi tiết chuyển động nhẹ (lá cây, mây, đom đóm, sao); máy bật "giảm chuyển động" thì đứng yên. Bản dev (`npm run dev`) có trang xem trước mọi cảnh của một truyện: mở `/#art=<id>`, ví dụ `/#art=tet`.

## Logo

`public/logo.svg` (ngôi sao vàng mặt cười trên nền cam) dùng làm favicon, logo ở màn hình chính, và các icon PNG cho điện thoại (`apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, khai báo trong `manifest.webmanifest`).

## Âm thanh

Tạo bằng ElevenLabs, đưa vào repo dưới dạng mp3:

- Giọng tiếng Việt: "Han Nguyen - Warm Southern Storyteller" cho trò chơi, "Phú Hảo" cho truyện, model `eleven_v4`
- Giọng tiếng Anh: "Lila – Upbeat Kids Learning Voice", model `eleven_v4`
- Nhạc nền: model `eleven_music_v2_5`, không lời, 60 giây, thêm fade 0,4 s / 0,6 s ở hai đầu để lặp lại êm hơn

Âm thanh phát bằng Web Audio API (`src/audio/audio.ts`): âm lượng chỉnh được trên mọi máy (Safari iOS bỏ qua âm lượng của thẻ `<audio>`), âm thanh được mở khoá ở lần chạm đầu tiên, và câu thoại trò chơi của ngôn ngữ đang chọn được tải trước, giải mã sẵn trong bộ nhớ (danh sách trong `src/audio/manifest.ts`); câu thoại của một truyện được tải khi mở truyện đó. File âm thanh và hình Kenney được trình duyệt cache 7 ngày (`vercel.json`).

Mức âm lượng: file giọng nói đã được chuẩn hoá lên đỉnh −1 dB; file nhạc đã giảm sẵn 12 dB và phát ở mức 0,5, còn 0,15 khi đang có lời nói. Khi thêm câu thoại mới, nhớ chuẩn hoá tương tự và thêm vào `manifest.ts`. Lựa chọn bật/tắt nhạc được lưu trên máy.
