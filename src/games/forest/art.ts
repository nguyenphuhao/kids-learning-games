// Hình vẽ của trò "Vào rừng tìm chữ", viết bằng SVG rồi nạp vào Phaser làm texture.
// Kích thước trong viewBox = kích thước trong thế giới game (cảnh cao 900 đơn vị).
// Các bạn thú đang là hình vẽ tạm theo dáng tròn; khi có bộ hình thật (ví dụ Round animals, CC0)
// thì thay hình ở đây, giữ nguyên tên texture.

import { glyphBox, type Glyph, type GlyphKind } from '../writing/glyphs'

export type Art = { key: string; w: number; h: number; svg: string }

const svg = (w: number, h: number, body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${body}</svg>`

// ---------- Các bạn thú (khung 200 × 250, chân chạm đáy) ----------

type AnimalSpec = {
  fur: string
  belly: string
  dark: string
  /** Vẽ phía sau đầu (tai, đuôi). */
  back?: string
  /** Vẽ phía trên mặt (mõm, mảng lông, mỏ…). */
  front?: string
  nose?: string
}

function animal({ fur, belly, dark, back = '', front = '', nose = '#ff7b7b' }: AnimalSpec): string {
  const eye = (x: number) =>
    `<ellipse cx="${x}" cy="104" rx="11" ry="13" fill="#2b2d42"/><circle cx="${x + 4}" cy="99" r="4.5" fill="#fff"/><circle cx="${x - 3}" cy="109" r="2" fill="#fff"/>`
  return svg(
    200,
    250,
    `${back}
    <ellipse cx="78" cy="236" rx="22" ry="12" fill="${dark}"/>
    <ellipse cx="122" cy="236" rx="22" ry="12" fill="${dark}"/>
    <ellipse cx="100" cy="190" rx="50" ry="48" fill="${fur}"/>
    <ellipse cx="100" cy="200" rx="32" ry="32" fill="${belly}"/>
    <ellipse cx="50" cy="182" rx="14" ry="24" fill="${fur}" transform="rotate(25 50 182)"/>
    <ellipse cx="150" cy="182" rx="14" ry="24" fill="${fur}" transform="rotate(-25 150 182)"/>
    <circle cx="100" cy="100" r="64" fill="${fur}"/>
    ${front}
    ${eye(76)}${eye(124)}
    <ellipse cx="58" cy="128" rx="11" ry="7" fill="#ff9eb5" opacity=".7"/>
    <ellipse cx="142" cy="128" rx="11" ry="7" fill="#ff9eb5" opacity=".7"/>
    <ellipse cx="100" cy="124" rx="7" ry="5" fill="${nose}"/>
    <path d="M90 134 Q95 140 100 134 Q105 140 110 134" fill="none" stroke="#2b2d42" stroke-width="3" stroke-linecap="round"/>`,
  )
}

export const ANIMALS: Art[] = [
  {
    key: 'rabbit',
    w: 200,
    h: 250,
    svg: animal({
      fur: '#a9c1f0',
      belly: '#e3ebfb',
      dark: '#8ea7d8',
      back: `<ellipse cx="72" cy="40" rx="18" ry="46" fill="#a9c1f0" transform="rotate(-12 72 40)"/>
             <ellipse cx="72" cy="42" rx="9" ry="34" fill="#e3ebfb" transform="rotate(-12 72 42)"/>
             <ellipse cx="128" cy="40" rx="18" ry="46" fill="#a9c1f0" transform="rotate(12 128 40)"/>
             <ellipse cx="128" cy="42" rx="9" ry="34" fill="#e3ebfb" transform="rotate(12 128 42)"/>`,
      front: `<ellipse cx="100" cy="128" rx="30" ry="22" fill="#e3ebfb"/>`,
    }),
  },
  {
    key: 'bear',
    w: 200,
    h: 250,
    svg: animal({
      fur: '#c98a5a',
      belly: '#f1d3b3',
      dark: '#a66d43',
      back: `<circle cx="48" cy="50" r="24" fill="#c98a5a"/><circle cx="48" cy="50" r="12" fill="#f1d3b3"/>
             <circle cx="152" cy="50" r="24" fill="#c98a5a"/><circle cx="152" cy="50" r="12" fill="#f1d3b3"/>`,
      front: `<ellipse cx="100" cy="128" rx="28" ry="21" fill="#f1d3b3"/>`,
      nose: '#5b3a29',
    }),
  },
  {
    key: 'fox',
    w: 200,
    h: 250,
    svg: animal({
      fur: '#f39a4a',
      belly: '#fff3e6',
      dark: '#5b3a29',
      back: `<path d="M150 210 Q200 200 196 150 Q186 178 160 186 Z" fill="#f39a4a"/>
             <path d="M196 150 Q190 168 176 176 Q190 176 196 150 Z" fill="#fff3e6"/>
             <path d="M42 70 L50 10 L92 46 Z" fill="#f39a4a"/><path d="M52 58 L56 26 L80 46 Z" fill="#5b3a29"/>
             <path d="M158 70 L150 10 L108 46 Z" fill="#f39a4a"/><path d="M148 58 L144 26 L120 46 Z" fill="#5b3a29"/>`,
      front: `<path d="M40 112 Q70 100 100 150 Q130 100 160 112 Q150 160 100 164 Q50 160 40 112 Z" fill="#fff3e6"/>`,
      nose: '#2b2d42',
    }),
  },
  {
    key: 'frog',
    w: 200,
    h: 250,
    svg: animal({
      fur: '#7cc96b',
      belly: '#e3f5c8',
      dark: '#5aa64b',
      back: `<circle cx="62" cy="52" r="28" fill="#7cc96b"/><circle cx="138" cy="52" r="28" fill="#7cc96b"/>`,
      front: `<circle cx="62" cy="52" r="18" fill="#fff"/><circle cx="138" cy="52" r="18" fill="#fff"/>
              <circle cx="64" cy="54" r="9" fill="#2b2d42"/><circle cx="140" cy="54" r="9" fill="#2b2d42"/>`,
      nose: '#5aa64b',
    }),
  },
  {
    key: 'panda',
    w: 200,
    h: 250,
    svg: animal({
      fur: '#f7f7f7',
      belly: '#ffffff',
      dark: '#3a3a46',
      back: `<circle cx="48" cy="50" r="24" fill="#3a3a46"/><circle cx="152" cy="50" r="24" fill="#3a3a46"/>`,
      front: `<ellipse cx="74" cy="106" rx="20" ry="24" fill="#3a3a46" transform="rotate(20 74 106)"/>
              <ellipse cx="126" cy="106" rx="20" ry="24" fill="#3a3a46" transform="rotate(-20 126 106)"/>`,
      nose: '#3a3a46',
    }),
  },
  {
    key: 'cat',
    w: 200,
    h: 250,
    svg: animal({
      fur: '#f6c955',
      belly: '#fff5d6',
      dark: '#d9a832',
      back: `<path d="M38 74 L44 16 L90 44 Z" fill="#f6c955"/><path d="M50 60 L52 32 L76 46 Z" fill="#ff9eb5"/>
             <path d="M162 74 L156 16 L110 44 Z" fill="#f6c955"/><path d="M150 60 L148 32 L124 46 Z" fill="#ff9eb5"/>
             <path d="M148 224 Q196 220 188 170" fill="none" stroke="#f6c955" stroke-width="16" stroke-linecap="round"/>`,
      front: `<path d="M78 42 L84 62 M100 38 L100 60 M122 42 L116 62" stroke="#d9a832" stroke-width="6" stroke-linecap="round"/>`,
    }),
  },
]

// ---------- Xe của bé (nhìn ngang) ----------

export const CAR: Art = {
  key: 'car',
  w: 280,
  h: 170,
  svg: svg(
    280,
    170,
    `<path d="M60 72 Q72 18 140 18 Q196 18 214 72 Z" fill="#cdeffd" stroke="#e53935" stroke-width="12" stroke-linejoin="round"/>
     <line x1="140" y1="22" x2="140" y2="72" stroke="#e53935" stroke-width="10"/>
     <circle cx="104" cy="50" r="22" fill="#ffd9b8"/>
     <path d="M82 46 Q86 22 106 24 Q126 26 126 46 Q112 34 82 46 Z" fill="#5b3a29"/>
     <circle cx="98" cy="50" r="3.5" fill="#2b2d42"/><circle cx="112" cy="50" r="3.5" fill="#2b2d42"/>
     <path d="M98 59 Q105 65 112 59" fill="none" stroke="#2b2d42" stroke-width="2.5" stroke-linecap="round"/>
     <path d="M14 82 Q14 66 34 66 L240 66 Q270 66 272 96 L272 120 Q272 132 260 132 L22 132 Q10 132 10 120 Z" fill="#ef5350"/>
     <path d="M20 96 L264 96" stroke="#ffcdd2" stroke-width="5" stroke-linecap="round"/>
     <circle cx="258" cy="84" r="8" fill="#fff59d"/>
     <rect x="8" y="80" width="10" height="16" rx="4" fill="#ffab91"/>`,
  ),
}

export const WHEEL: Art = {
  key: 'wheel',
  w: 60,
  h: 60,
  svg: svg(
    60,
    60,
    `<circle cx="30" cy="30" r="28" fill="#37474f"/><circle cx="30" cy="30" r="14" fill="#cfd8dc"/>
     <path d="M30 18 L30 42 M18 30 L42 30" stroke="#90a4ae" stroke-width="4" stroke-linecap="round"/>`,
  ),
}

// ---------- Cảnh rừng ----------

export const SCENERY: Art[] = [
  {
    key: 'tree',
    w: 260,
    h: 380,
    svg: svg(
      260,
      380,
      `<path d="M112 380 L116 220 Q118 200 130 200 Q142 200 144 220 L148 380 Z" fill="#8d6e63"/>
       <circle cx="130" cy="120" r="92" fill="#3fae5a"/>
       <circle cx="66" cy="170" r="62" fill="#3fae5a"/><circle cx="194" cy="170" r="62" fill="#3fae5a"/>
       <circle cx="104" cy="96" r="40" fill="#5cc674" opacity=".7"/>`,
    ),
  },
  {
    key: 'apple',
    w: 40,
    h: 44,
    svg: svg(
      40,
      44,
      `<circle cx="20" cy="26" r="17" fill="#e53935"/><circle cx="14" cy="20" r="5" fill="#ff8a80"/>
       <path d="M20 10 Q22 2 28 2" stroke="#6d4c41" stroke-width="3" fill="none" stroke-linecap="round"/>
       <ellipse cx="28" cy="8" rx="6" ry="3" fill="#66bb6a"/>`,
    ),
  },
  {
    key: 'bush',
    w: 240,
    h: 130,
    svg: svg(
      240,
      130,
      `<circle cx="60" cy="80" r="50" fill="#2e9e4f"/><circle cx="120" cy="58" r="58" fill="#36ad59"/>
       <circle cx="182" cy="82" r="48" fill="#2e9e4f"/><rect x="20" y="80" width="200" height="50" rx="25" fill="#2e9e4f"/>
       <circle cx="100" cy="44" r="14" fill="#4cc06f" opacity=".7"/>
       <circle cx="70" cy="92" r="6" fill="#f06292"/><circle cx="150" cy="70" r="6" fill="#fff176"/><circle cx="186" cy="100" r="6" fill="#f06292"/>`,
    ),
  },
  {
    key: 'flower',
    w: 70,
    h: 110,
    svg: svg(
      70,
      110,
      `<path d="M35 50 Q30 80 35 110" stroke="#43a047" stroke-width="5" fill="none"/>
       <ellipse cx="22" cy="84" rx="12" ry="6" fill="#66bb6a" transform="rotate(-30 22 84)"/>
       ${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="35" cy="18" rx="12" ry="18" fill="#ff80ab" transform="rotate(${a} 35 36)"/>`).join('')}
       <circle cx="35" cy="36" r="11" fill="#ffd54f"/>`,
    ),
  },
  {
    key: 'mushroom',
    w: 90,
    h: 90,
    svg: svg(
      90,
      90,
      `<path d="M30 50 L28 86 Q45 92 62 86 L60 50 Z" fill="#fff3e0"/>
       <path d="M4 54 Q8 4 45 4 Q82 4 86 54 Z" fill="#e53935"/>
       <circle cx="28" cy="30" r="8" fill="#fff"/><circle cx="56" cy="20" r="6" fill="#fff"/><circle cx="66" cy="42" r="7" fill="#fff"/>`,
    ),
  },
  {
    key: 'cloud',
    w: 220,
    h: 110,
    svg: svg(
      220,
      110,
      `<circle cx="60" cy="64" r="36" fill="#fff"/><circle cx="110" cy="46" r="44" fill="#fff"/>
       <circle cx="164" cy="66" r="34" fill="#fff"/><rect x="40" y="60" width="140" height="40" rx="20" fill="#fff"/>`,
    ),
  },
  {
    key: 'butterfly',
    w: 50,
    h: 40,
    svg: svg(
      50,
      40,
      `<ellipse cx="14" cy="14" rx="13" ry="11" fill="#ffb74d"/><ellipse cx="36" cy="14" rx="13" ry="11" fill="#ffb74d"/>
       <ellipse cx="16" cy="30" rx="9" ry="8" fill="#ff8a65"/><ellipse cx="34" cy="30" rx="9" ry="8" fill="#ff8a65"/>
       <rect x="23" y="6" width="4" height="30" rx="2" fill="#5d4037"/>`,
    ),
  },
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
  {
    key: 'balloon',
    w: 110,
    h: 230,
    svg: svg(
      110,
      230,
      `<path d="M55 128 Q48 170 60 230" stroke="#90a4ae" stroke-width="3" fill="none"/>
       <ellipse cx="55" cy="66" rx="52" ry="62" fill="#fff"/>
       <path d="M48 126 L62 126 L55 136 Z" fill="#fff"/>
       <ellipse cx="34" cy="38" rx="10" ry="16" fill="#fff" opacity=".6" transform="rotate(25 34 38)"/>`,
    ),
  },
  {
    key: 'gate',
    w: 420,
    h: 420,
    svg: svg(
      420,
      420,
      `<rect x="40" y="60" width="34" height="360" rx="10" fill="#a1887f"/>
       <rect x="346" y="60" width="34" height="360" rx="10" fill="#a1887f"/>
       <path d="M20 70 Q210 -10 400 70 L400 120 Q210 40 20 120 Z" fill="#8d6e63"/>
       <circle cx="80" cy="96" r="10" fill="#ffd54f"/><circle cx="210" cy="56" r="10" fill="#ff8a80"/><circle cx="340" cy="96" r="10" fill="#81d4fa"/>`,
    ),
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
