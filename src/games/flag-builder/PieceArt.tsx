// Hình vẽ của từng mảnh ghép, mỗi mảnh trong ô 100x100 rồi co giãn vào khung cần vẽ.
// Cờ đơn giản hoá, không giống y hệt cờ thật.

import type { ReactNode } from 'react'

const C = {
  red: '#e53935',
  white: '#ffffff',
  blue: '#1e40af',
  green: '#2e7d32',
  yellow: '#fdd835',
  black: '#212121',
  gold: '#fbc02d',
}

const STAR = 'M50 6 L61 38 L95 38 L68 58 L78 92 L50 72 L22 92 L32 58 L5 38 L39 38 Z'
const LEAF =
  'M50 4 L58 24 L70 17 L66 44 L85 34 L80 50 L96 55 L76 66 L79 77 L55 71 L54 96 L46 96 L45 71 L21 77 L24 66 L4 55 L20 50 L15 34 L34 44 L30 17 L42 24 Z'

/** Ngôi sao 5 cánh tâm (cx, cy), bán kính r, một cánh hướng theo góc `deg` (độ). */
function star(cx: number, cy: number, r: number, deg: number): string {
  const pts: string[] = []
  for (let k = 0; k < 10; k++) {
    const a = ((deg + k * 36) * Math.PI) / 180
    const rr = k % 2 ? r * 0.382 : r
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(2)} ${(cy + rr * Math.sin(a)).toFixed(2)}`)
  }
  return `M${pts.join(' L')} Z`
}

// Cờ Trung Quốc (lưới 30x20, mỗi ô 8px trong khung 240x160): sao lớn tâm (40, 40);
// 4 sao nhỏ bán kính 8, mỗi sao có một cánh chĩa về tâm sao lớn.
const CN_SMALL = [
  [80, 16],
  [96, 32],
  [96, 56],
  [80, 72],
].map(([x, y]) => star(x, y, 8, (Math.atan2(40 - y, 40 - x) * 180) / Math.PI))

// Cờ Hàn Quốc, theo hình học của bộ flag-icons: đơn vị 1 = chiều cao cờ / 48.
const KR_BARS_PATH = 'M-6-26H6v2H-6Zm0 3H6v2H-6Zm0 3H6v2H-6Z'
const krTrigrams = (rot: number, cuts: string) => (
  <g transform={`translate(120 80) rotate(${rot}) scale(${160 / 48})`}>
    <path d={KR_BARS_PATH} fill={C.black} />
    <path d={KR_BARS_PATH} fill={C.black} transform="translate(0 44)" />
    <path d={cuts} stroke={C.white} strokeWidth="1" />
  </g>
)
const TAEGEUK = (
  <g transform={`translate(50 50) rotate(-56.3) scale(${46 / 12})`}>
    <path d="M0-12a12 12 0 0 1 0 24Z" fill={C.red} />
    <path d="M0-12a12 12 0 0 0 0 24A6 6 0 0 0 0 0Z" fill={C.blue} />
    <circle cy="-6" r="6" fill={C.red} />
  </g>
)

/** Mảnh không vẽ trong ô 100x100 mà vẽ thẳng theo toạ độ khung cờ 240x160. */
const VIEWBOX: Record<string, string> = {
  'emblem:cn-small': '70 6 36 76',
  'emblem:kr-bars': '0 0 240 160',
}

const rect = (fill: string) => <rect width="100" height="100" fill={fill} />
const outline = (
  <rect width="100" height="100" fill="none" stroke="#b0bec5" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
)

/** Hình của từng mảnh, vẽ trong ô 100x100. */
const ART: Record<string, ReactNode> = {
  'base:red': rect(C.red),
  'base:white': (
    <>
      {rect(C.white)}
      {outline}
    </>
  ),
  'base:green': rect(C.green),
  'base:blue': rect(C.blue),
  'base:yellow': rect(C.yellow),
  'base:ca': (
    <>
      <rect width="25" height="100" fill={C.red} />
      <rect x="25" width="50" height="100" fill={C.white} />
      <rect x="75" width="25" height="100" fill={C.red} />
    </>
  ),
  'emblem:star-yellow': <path d={STAR} fill={C.yellow} />,
  'emblem:star-white': <path d={STAR} fill={C.white} stroke="#b0bec5" strokeWidth="2" />,
  'emblem:circle-red': <circle cx="50" cy="50" r="46" fill={C.red} />,
  'emblem:circle-blue': <circle cx="50" cy="50" r="46" fill={C.blue} />,
  'emblem:leaf-red': <path d={LEAF} fill={C.red} />,
  'emblem:taegeuk': TAEGEUK,
  'emblem:cn-small': (
    <>
      {CN_SMALL.map((d) => (
        <path key={d} d={d} fill={C.yellow} />
      ))}
    </>
  ),
  'emblem:kr-bars': (
    <>
      {krTrigrams(-56.3, 'M0 17v10')}
      {krTrigrams(-123.7, 'M0-23.5v3M0 17v3.5m0 3v3')}
    </>
  ),
  'emblem:diamond': (
    <>
      <path d="M50 2 L98 50 L50 98 L2 50 Z" fill={C.yellow} />
      <circle cx="50" cy="50" r="24" fill={C.blue} />
    </>
  ),
}

for (const [name, color] of Object.entries(C)) {
  const art = name === 'white' ? (
    <>
      {rect(color)}
      {outline}
    </>
  ) : (
    rect(color)
  )
  ART[`stripe-v:${name}`] = art
  ART[`stripe-h:${name}`] = art
}

export function PieceArt({ id, x, y, w, h }: { id: string; x: number; y: number; w: number; h: number }) {
  return (
    <svg
      x={x}
      y={y}
      width={w}
      height={h}
      viewBox={VIEWBOX[id] ?? '0 0 100 100'}
      preserveAspectRatio={VIEWBOX[id] ? 'xMidYMid meet' : 'none'}
      overflow="visible"
    >
      {ART[id]}
    </svg>
  )
}
