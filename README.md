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
  games/GamePlaceholder.tsx  Màn hình tạm cho trò chưa làm
  games/flag-drive/        Trò "Lái xe tìm cờ" (danh sách nước trong countries.ts)
  i18n/strings.ts          Chữ giao diện VI/EN
  i18n/                   Ngôn ngữ hiện tại (LanguageProvider, useLanguage)
  audio/audio.ts           Phát file public/audio/<vi|en>/<key>.mp3
  lib/storage.ts           Đọc/ghi localStorage an toàn
public/
  audio/vi, audio/en       File giọng nói từ ElevenLabs
  assets/kenney            Hình tải từ Kenney, mỗi bộ kèm License.txt (CC0)
    flag-pack/             14 lá cờ (SVG)
    racing-pack/           Xe ô tô
```

## Trò chơi (bản đầu tiên)

| Trò | Trạng thái |
|---|---|
| Đếm đồ vật / Counting | Chưa làm |
| Tìm màu / Find the color | Chưa làm |
| Xếp hình / Shape match | Chưa làm |
| Nhiều hay ít / More or less | Chưa làm |
| Lái xe tìm cờ / Flag drive | Chơi được, chưa có âm thanh |

### Lái xe tìm cờ

Xe chạy tới ngã rẽ, mỗi nhánh có một lá cờ. Game đọc và hiện chữ "Lấy cờ Việt Nam!", bé chạm vào nhánh có cờ đúng để xe rẽ vào lấy cờ. Chạm sai thì lá cờ lắc nhẹ và game nhắc "Thử lại nhé!". Phụ huynh chọn 2 hoặc 3 lá cờ mỗi lượt. Các cặp cờ dễ nhầm (Việt Nam / Trung Quốc, Anh / Úc) không xuất hiện cùng lượt.

File âm thanh cần tạo (đặt trong `public/audio/vi/` và `public/audio/en/`):

- `flags-find-<MÃ NƯỚC>.mp3` cho 14 nước: VN, US, GB, JP, KR, CN, FR, DE, IT, BR, CA, AU, TH, IN
- `flags-great.mp3`
- `flags-retry.mp3`
