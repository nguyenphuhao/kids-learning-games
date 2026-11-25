// Mảnh ghép và thiết kế cờ cho trò "Ghép quốc kỳ".
// Cờ vẽ bằng SVG theo từng lớp (nền, sọc, biểu tượng); hình từng mảnh nằm trong PieceArt.tsx.

import type { Level } from '../shared/useLevel'
import { shuffle } from '../shared/util'

const COLORS = ['red', 'white', 'blue', 'green', 'yellow', 'black', 'gold']

/** Mọi mảnh ghép có trong game (phải khớp với hình vẽ trong PieceArt.tsx). */
export const PIECE_IDS = [
  'base:red',
  'base:white',
  'base:green',
  'base:blue',
  'base:yellow',
  'base:ca',
  'emblem:star-yellow',
  'emblem:star-white',
  'emblem:circle-red',
  'emblem:circle-blue',
  'emblem:leaf-red',
  'emblem:taegeuk',
  'emblem:diamond',
  // Không có sọc vàng: quá giống sọc vàng nghệ của cờ Đức.
  ...COLORS.filter((c) => c !== 'yellow').flatMap((c) => [`stripe-v:${c}`, `stripe-h:${c}`]),
]

export type PieceKind = 'base' | 'emblem' | 'stripe-v' | 'stripe-h'

export const kindOf = (id: string) => id.split(':')[0] as PieceKind

/** Kích thước mảnh khi nằm trong khay. */
export const TRAY_SIZE: Record<PieceKind, { w: number; h: number }> = {
  base: { w: 60, h: 40 },
  emblem: { w: 44, h: 44 },
  'stripe-v': { w: 20, h: 44 },
  'stripe-h': { w: 60, h: 15 },
}

// Khung cờ rộng 240 x cao 160.
export const FW = 240
export const FH = 160

export type Slot = { accepts: string; x: number; y: number; w: number; h: number }
export type FlagDesign = { code: string; slots: Slot[] }

const full = (accepts: string): Slot => ({ accepts, x: 0, y: 0, w: FW, h: FH })
const vStripes = (a: string, b: string, c: string): Slot[] =>
  [a, b, c].map((color, i) => ({ accepts: `stripe-v:${color}`, x: (FW / 3) * i, y: 0, w: FW / 3, h: FH }))
const hStripes = (a: string, b: string, c: string): Slot[] =>
  [a, b, c].map((color, i) => ({ accepts: `stripe-h:${color}`, x: 0, y: (FH / 3) * i, w: FW, h: FH / 3 }))

export const DESIGNS: Record<string, FlagDesign> = {
  VN: { code: 'VN', slots: [full('base:red'), { accepts: 'emblem:star-yellow', x: 82, y: 42, w: 76, h: 76 }] },
  CN: { code: 'CN', slots: [full('base:red'), { accepts: 'emblem:star-yellow', x: 16, y: 12, w: 56, h: 56 }] },
  JP: { code: 'JP', slots: [full('base:white'), { accepts: 'emblem:circle-red', x: 76, y: 36, w: 88, h: 88 }] },
  KR: { code: 'KR', slots: [full('base:white'), { accepts: 'emblem:taegeuk', x: 76, y: 36, w: 88, h: 88 }] },
  CA: { code: 'CA', slots: [full('base:ca'), { accepts: 'emblem:leaf-red', x: 80, y: 40, w: 80, h: 80 }] },
  BR: { code: 'BR', slots: [full('base:green'), { accepts: 'emblem:diamond', x: 20, y: 14, w: 200, h: 132 }] },
  FR: { code: 'FR', slots: vStripes('blue', 'white', 'red') },
  IT: { code: 'IT', slots: vStripes('green', 'white', 'red') },
  DE: { code: 'DE', slots: hStripes('black', 'red', 'gold') },
}

const POOLS: Record<Level, string[]> = {
  easy: ['VN', 'JP', 'FR', 'DE'],
  medium: ['VN', 'JP', 'FR', 'DE', 'IT', 'KR', 'CA'],
  hard: ['VN', 'JP', 'FR', 'DE', 'IT', 'KR', 'CA', 'CN', 'BR'],
}

const DISTRACTORS: Record<Level, number> = { easy: 2, medium: 4, hard: 5 }

export type BuildRound = { design: FlagDesign; pieces: string[] }

/** Chọn một lá cờ và trộn mảnh đúng với mảnh của cờ khác. */
export function makeBuildRound(level: Level, previous?: string): BuildRound {
  const code = shuffle(POOLS[level].filter((c) => c !== previous))[0]
  const design = DESIGNS[code]
  const needed = design.slots.map((s) => s.accepts)
  const striped = needed.some((id) => kindOf(id).startsWith('stripe'))
  const sameFamily = PIECE_IDS.filter((id) =>
    striped ? kindOf(id).startsWith('stripe') : !kindOf(id).startsWith('stripe'),
  )
  const others = shuffle(sameFamily.filter((id) => !needed.includes(id)))
  const pieces = shuffle([...needed, ...others.slice(0, DISTRACTORS[level])])
  return { design, pieces }
}

export const showModel = (level: Level) => level !== 'hard'
