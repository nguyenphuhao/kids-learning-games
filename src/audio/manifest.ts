// Câu thoại của các trò chơi trong public/audio/<lang>/<key>.mp3, tải trước khi mở web.
// Câu thoại của truyện nằm trong src/stories/data.ts, chỉ tải khi mở truyện đó.
// Câu "Lấy cờ …" (flags-find-<MÃ>) và "Bé ghép cờ …" (build-<MÃ>) của 100 nước được tải khi mở
// trò Lái xe tìm cờ / Ghép quốc kỳ.

const COLORS = ['red', 'blue', 'yellow', 'green', 'orange', 'purple']
const SHAPES = ['circle', 'square', 'triangle', 'star']

export const AUDIO_KEYS: string[] = [
  'common-great',
  'common-retry',
  'common-finish',
  'flags-great',
  'flags-retry',
  'counting-intro',
  'counting-ask',
  ...Array.from({ length: 10 }, (_, i) => `number-${i + 1}`),
  ...COLORS.map((c) => `colors-find-${c}`),
  'shapes-intro',
  ...SHAPES.map((s) => `shape-${s}`),
  'compare-more',
  'compare-less',
  'write-pick-letter',
  'write-pick-number',
  'write-watch',
  'write-trace',
  'trace-intro',
  'trace-start',
]
