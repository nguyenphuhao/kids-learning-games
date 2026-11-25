// Câu thoại của các trò chơi trong public/audio/<lang>/<key>.mp3, tải trước khi mở web.
// Câu thoại của truyện nằm trong src/stories/data.ts, chỉ tải khi mở truyện đó.
// Câu "Lấy cờ …" của 100 nước (flags-find-<MÃ>) được tải khi mở trò Lái xe tìm cờ.

const BUILD_CODES = ['VN', 'CN', 'JP', 'KR', 'CA', 'BR', 'FR', 'IT', 'DE']
const COLORS = ['red', 'blue', 'yellow', 'green', 'orange', 'purple']
const SHAPES = ['circle', 'square', 'triangle', 'star']

export const AUDIO_KEYS: string[] = [
  'common-great',
  'common-retry',
  'common-finish',
  'flags-great',
  'flags-retry',
  ...BUILD_CODES.map((c) => `build-${c}`),
  'counting-intro',
  'counting-ask',
  ...Array.from({ length: 10 }, (_, i) => `number-${i + 1}`),
  ...COLORS.map((c) => `colors-find-${c}`),
  'shapes-intro',
  ...SHAPES.map((s) => `shape-${s}`),
  'compare-more',
  'compare-less',
]
