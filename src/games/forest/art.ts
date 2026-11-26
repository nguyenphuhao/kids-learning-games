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

/** Hình một chữ, viết bằng nét xanh có viền trắng, cao `h` đơn vị. */
export function glyphArt(key: string, g: Glyph, kind: GlyphKind, h: number, color = '#1e63c6'): Art {
  const b = glyphBox(g, kind, 0, true)
  const w = Math.round((b.w / b.h) * h)
  const paths = (stroke: string, width: number) =>
    g.strokes
      .map((d) => `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`)
      .join('')
  return {
    key,
    w,
    h,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${b.x} ${b.y} ${b.w} ${b.h}" width="${w}" height="${h}">${paths('#fff', 9)}${paths(color, 5)}</svg>`,
  }
}

export function dataUrl(a: Art): string {
  const bytes = new TextEncoder().encode(a.svg)
  let bin = ''
  bytes.forEach((b) => (bin += String.fromCharCode(b)))
  return `data:image/svg+xml;base64,${btoa(bin)}`
}
