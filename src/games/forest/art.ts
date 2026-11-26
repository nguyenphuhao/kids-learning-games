// Hình của trò "Vào rừng tìm chữ".
// - Bạn thú, xe, bánh xe, cây cối, mây, bóng bay, cổng rừng, đồi nền: ảnh WebP trong public/assets/forest/
//   (tạo bằng ChatGPT theo prompt của dự án, cắt sát viền và thu nhỏ). Ảnh vẽ gấp đôi kích thước
//   trong thế giới game (RES = 2 trong ForestScene), riêng đồi nền thì co giãn theo cảnh.
// - Tia sáng, trái tim và chữ / số: vẽ bằng SVG ở đây rồi nạp làm texture.
// Kích thước trong viewBox của SVG = kích thước trong thế giới game (cảnh cao 900 đơn vị).

import { glyphBox, type Glyph, type GlyphKind } from '../writing/glyphs'

export type Art = { key: string; w: number; h: number; svg: string }

const svg = (w: number, h: number, body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${body}</svg>`

/** Các bạn thú (ảnh đứng, chân chạm đáy ảnh). Thỏ tự cầm sẵn bóng đỏ. */
export const ANIMAL_KEYS = ['rabbit', 'bear', 'fox', 'frog', 'panda', 'cat'] as const

/** Ảnh nạp từ public/assets/forest/<key>.webp. */
export const IMAGE_KEYS = [
  ...ANIMAL_KEYS,
  'car',
  'wheel',
  'tree',
  'apple',
  'bush',
  'flower',
  'mushroom',
  'cloud',
  'butterfly',
  'balloon',
  'hills',
  'gate',
] as const

export const imageUrl = (key: string) => `/assets/forest/${key}.webp`

// ---------- Hình vẽ bằng SVG ----------

export const SVG_ART: Art[] = [
  {
    key: 'spark',
    w: 30,
    h: 30,
    svg: svg(30, 30, `<path d="M15 0 L19 11 L30 15 L19 19 L15 30 L11 19 L0 15 L11 11 Z" fill="#fff59d"/>`),
  },
  {
    key: 'heart',
    w: 34,
    h: 30,
    svg: svg(34, 30, `<path d="M17 29 C-6 14 2 -4 17 7 C32 -4 40 14 17 29 Z" fill="#ff6b8b"/>`),
  },

]

// ---------- Chữ / số (dùng nét viết của trò tập viết) ----------

/** Khung dọc chung cho mọi chữ của một lượt (đơn vị nét chữ, 1 li = 10). */
export type Frame = { top: number; bottom: number }

/**
 * Khung chung của các chữ trong lượt: mọi chữ vẽ cùng tỉ lệ và cùng đường chân chữ,
 * nên chữ cao (h, l) cao hơn chữ thấp (o, a) đúng như trong vở và nét đậm bằng nhau.
 */
export function runFrame(items: { glyph: Glyph; kind: GlyphKind }[]): Frame {
  let top = 0
  let bottom = 0
  for (const it of items) {
    const b = glyphBox(it.glyph, it.kind, 0, true)
    top = Math.min(top, b.y)
    bottom = Math.max(bottom, b.y + b.h)
  }
  return { top, bottom }
}

/** Bề rộng (đơn vị nét chữ) dành cho một chữ, kể cả lề. */
export const glyphWidth = (g: Glyph) => g.w + 12

/**
 * Hình một chữ trong khung chung `frame`, cao `h` đơn vị thế giới.
 * `solid`: nét xanh viền trắng. `dashed`: nét đứt mờ màu xám như chữ mẫu trong khung viết, để bé đặt theo.
 */
export function glyphArt(key: string, g: Glyph, frame: Frame, h: number, style: 'solid' | 'dashed'): Art {
  const fh = frame.bottom - frame.top
  const vw = glyphWidth(g)
  const w = Math.round((vw / fh) * h)
  const paths = (attrs: string) =>
    g.strokes.map((d) => `<path d="${d}" fill="none" stroke-linecap="round" stroke-linejoin="round" ${attrs}/>`).join('')
  const body =
    style === 'solid'
      ? paths('stroke="#fff" stroke-width="9"') + paths('stroke="#1e63c6" stroke-width="5"')
      : paths('stroke="#78909c" stroke-width="3" stroke-dasharray="5 4"')
  return {
    key,
    w,
    h,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-6 ${frame.top} ${vw} ${fh}" width="${w}" height="${h}">${body}</svg>`,
  }
}

export function dataUrl(a: Art): string {
  const bytes = new TextEncoder().encode(a.svg)
  let bin = ''
  bytes.forEach((b) => (bin += String.fromCharCode(b)))
  return `data:image/svg+xml;base64,${btoa(bin)}`
}
