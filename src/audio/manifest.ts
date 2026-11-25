// Câu thoại của các trò chơi trong public/audio/<lang>/<key>.mp3, tải trước khi mở web.
// Câu thoại của truyện nằm trong src/stories/data.ts, chỉ tải khi mở truyện đó.

const FLAG_CODES = ['VN', 'US', 'GB', 'JP', 'KR', 'CN', 'FR', 'DE', 'IT', 'BR', 'CA', 'AU', 'TH', 'IN']
const BUILD_CODES = ['VN', 'CN', 'JP', 'KR', 'CA', 'BR', 'FR', 'IT', 'DE']
const COLORS = ['red', 'blue', 'yellow', 'green', 'orange', 'purple']
const SHAPES = ['circle', 'square', 'triangle', 'star']

export const AUDIO_KEYS: string[] = [
  'common-great',
  'common-retry',
  'common-finish',
  'flags-great',
  'flags-retry',
  ...FLAG_CODES.map((c) => `flags-find-${c}`),
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
