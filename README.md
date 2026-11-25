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
  App.tsx                  Chuyển giữa màn hình chính và màn hình trò chơi
  components/              HomeScreen, GameScreen, LanguageToggle
  games/registry.tsx       Danh sách 4 trò chơi (thêm trò mới ở đây)
  games/shared/            Thanh câu hỏi, mức Dễ/Khó, hàm dùng chung
  games/counting, colors, shapes, compare   4 trò học số, màu, hình
  games/flag-builder/      Trò "Ghép quốc kỳ" (thiết kế cờ trong designs.ts, hình mảnh trong PieceArt.tsx)
  games/flag-drive/        Trò "Lái xe tìm cờ" (danh sách nước trong countries.ts)
  i18n/strings.ts          Chữ giao diện VI/EN
  i18n/                   Ngôn ngữ hiện tại (LanguageProvider, useLanguage)
  audio/audio.ts           Phát file public/audio/<vi|en>/<key>.mp3
  lib/storage.ts           Đọc/ghi localStorage an toàn
public/
  audio/vi, audio/en       File giọng nói từ ElevenLabs
  audio/music              Nhạc nền phát lặp trong màn chơi (có nút bật/tắt)
  assets/kenney            Hình tải từ Kenney, mỗi bộ kèm License.txt (CC0)
    flag-pack/             14 lá cờ (SVG)
    racing-pack/           Xe ô tô
```

## Trò chơi

Mỗi trò có 3 mức Dễ / Vừa / Khó (lựa chọn lưu trên máy, đổi mức thì bắt đầu lượt mới), giọng nói VI/EN và nhạc nền. Bé làm sai thì được nhắc "Thử lại nhé!", không có âm báo sai.

Mỗi lượt chơi gồm 5 câu; mỗi câu đúng thêm một ngôi sao trên thanh tiến độ. Đủ 5 sao thì hiện màn hình hoàn thành (cúp, sao, pháo giấy, lời khen "Hoàn thành rồi! Bé giỏi quá!") với nút Chơi lại và Trang chủ. Mỗi lần hoàn thành được một cúp; số cúp hiện trên ô trò chơi ở màn hình chính (lưu trên máy).

| Trò | Cách chơi | Dễ | Vừa | Khó |
|---|---|---|---|---|
| Lái xe tìm cờ / Flag drive | Kéo xe theo đường tới lá cờ đúng, hoặc chạm thẳng vào lá cờ | 2 cờ, 6 nước quen thuộc | 3 cờ, 14 nước, không có cặp cờ dễ nhầm | 3 cờ, 14 nước, cờ dễ nhầm (Việt Nam/Trung Quốc, Anh/Úc) đặt cạnh nhau |
| Ghép quốc kỳ / Build a flag | Kéo mảnh (nền, sọc, ngôi sao, vòng tròn…) từ khay lộn xộn vào khung để ghép đúng cờ | Có cờ mẫu, 2 mảnh nhiễu; Việt Nam, Nhật, Pháp, Đức | Có cờ mẫu, 4 mảnh nhiễu; thêm Ý, Hàn, Canada | Không có mẫu, 5 mảnh nhiễu; thêm Trung Quốc, Brazil |
| Đếm đồ vật / Counting | Chạm từng quả táo (giọng đọc đếm theo), rồi chọn đúng số | 1–3 quả | 1–6 quả | 1–10 quả |
| Tìm màu / Find the color | Chạm quả bóng đúng màu, bóng bay lên | 2 bóng, đỏ/xanh dương/vàng | 3 bóng, 6 màu | 5 bóng, 6 màu |
| Xếp hình / Shape match | Kéo hình vào ô cùng hình dạng | 2 hình (tròn, vuông, tam giác) | 3 hình | 4 hình (thêm ngôi sao) |
| Nhiều hay ít / More or less | Chạm giỏ có nhiều hơn (hoặc ít hơn) | "Nhiều hơn", 1–5 quả, chênh ≥ 3 | "Nhiều hơn", 1–7 quả, chênh ≥ 2 | "Nhiều hơn" hoặc "ít hơn", 1–9 quả, chênh ≥ 1 |

Đồ hoạ của các trò học số, màu, hình và trò ghép cờ vẽ bằng SVG (cờ trong trò ghép được vẽ theo lớp, đơn giản hoá). Trò lái xe dùng hình cờ và xe của Kenney.

### Lái xe tìm cờ

Đường có ngã rẽ, mỗi nhánh có một lá cờ. Game đọc và hiện chữ "Lấy cờ Việt Nam!". Bé đặt ngón tay lên xe (có vòng sáng gợi ý) và kéo xe chạy theo đường; xe chỉ chạy trên đường. Kéo tới cờ sai thì lá cờ lắc nhẹ, game nhắc "Thử lại nhé!" và xe lùi về ngã rẽ. Bé cũng có thể chạm thẳng vào lá cờ đúng để xe tự chạy tới. Mức chơi quyết định số cờ và nhóm nước (xem bảng trên). Các cặp cờ dễ nhầm (Việt Nam / Trung Quốc, Anh / Úc) không xuất hiện cùng lượt.

File âm thanh (trong `public/audio/vi/` và `public/audio/en/`):

- `flags-find-<MÃ NƯỚC>.mp3` cho 14 nước: VN, US, GB, JP, KR, CN, FR, DE, IT, BR, CA, AU, TH, IN
- `flags-great.mp3`
- `flags-retry.mp3`

File âm thanh của các trò khác:

- Dùng chung: `common-great`, `common-retry`, `common-finish`
- Đếm đồ vật: `counting-intro`, `counting-ask`, `number-1` … `number-10`
- Tìm màu: `colors-find-<red|blue|yellow|green|orange|purple>`
- Xếp hình: `shapes-intro`, `shape-<circle|square|triangle|star>`
- Nhiều hay ít: `compare-more`, `compare-less`
- Ghép quốc kỳ: `build-<VN|CN|JP|KR|CA|BR|FR|IT|DE>`

## Âm thanh

Tạo bằng ElevenLabs, đưa vào repo dưới dạng mp3:

- Giọng tiếng Việt: "Han Nguyen - Warm Southern Storyteller", model `eleven_v4`
- Giọng tiếng Anh: "Lila – Upbeat Kids Learning Voice", model `eleven_v4`
- Nhạc nền: model `eleven_music_v2_5`, không lời, 60 giây, thêm fade 0,4 s / 0,6 s ở hai đầu để lặp lại êm hơn

Âm thanh phát bằng Web Audio API (`src/audio/audio.ts`): âm lượng chỉnh được trên mọi máy (Safari iOS bỏ qua âm lượng của thẻ `<audio>`), âm thanh được mở khoá ở lần chạm đầu tiên, và mọi câu thoại của ngôn ngữ đang chọn được tải trước, giải mã sẵn trong bộ nhớ (danh sách trong `src/audio/manifest.ts`). File âm thanh và hình Kenney được trình duyệt cache 7 ngày (`vercel.json`).

Mức âm lượng: file giọng nói đã được chuẩn hoá lên đỉnh −1 dB; file nhạc đã giảm sẵn 12 dB và phát ở mức 0,5, còn 0,15 khi đang có lời nói. Khi thêm câu thoại mới, nhớ chuẩn hoá tương tự và thêm vào `manifest.ts`. Lựa chọn bật/tắt nhạc được lưu trên máy.
