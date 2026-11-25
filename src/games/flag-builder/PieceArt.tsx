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
  'emblem:taegeuk': (
    <>
      <path d="M4 50 A46 46 0 0 1 96 50 A23 23 0 0 1 50 50 A23 23 0 0 0 4 50 Z" fill={C.red} />
      <path d="M4 50 A46 46 0 0 0 96 50 A23 23 0 0 0 50 50 A23 23 0 0 1 4 50 Z" fill={C.blue} />
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
    <svg x={x} y={y} width={w} height={h} viewBox="0 0 100 100" preserveAspectRatio="none" overflow="visible">
      {ART[id]}
    </svg>
  )
}
