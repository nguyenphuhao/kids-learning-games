// Danh sách mọi câu thoại có trong public/audio/<lang>/<key>.mp3, để tải trước.

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
  ...['start', 'fork', 'lake', 'garden', 'end-duck', 'end-turtle', 'end-squirrel', 'end-lift', 'outro'].map(
    (k) => `story-${k}`,
  ),
]
