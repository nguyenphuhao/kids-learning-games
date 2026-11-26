// Phần vẽ dùng chung: dòng kẻ ô li và khung nhìn của một chữ.

import type { GlyphKind } from './glyphs'

const LI = 10

/** Dòng kẻ như vở ô li: mỗi li một dòng mảnh, đường kẻ chân chữ và đầu chữ thường đậm hơn. */
export function RuledLines({ x, y, w, h, kind }: { x: number; y: number; w: number; h: number; kind: GlyphKind }) {
  const lines: number[] = []
  for (let v = Math.ceil(y / LI) * LI; v <= y + h; v += LI) lines.push(v)
  const cols: number[] = []
  for (let v = Math.ceil(x / (LI * 2)) * LI * 2; v <= x + w; v += LI * 2) cols.push(v)
  const strong = kind === 'lower' ? [0, -20] : kind === 'upper' ? [0, -50] : [0, -40]
  return (
    <g aria-hidden="true">
      <rect x={x} y={y} width={w} height={h} fill="#fff" />
      {cols.map((c) => (
        <line key={`c${c}`} x1={c} x2={c} y1={y} y2={y + h} stroke="#d7e3f4" strokeWidth="0.5" />
      ))}
      {lines.map((v) => (
        <line
          key={v}
          x1={x}
          x2={x + w}
          y1={v}
          y2={v}
          stroke={strong.includes(v) ? '#7fa7d9' : '#c5d6ee'}
          strokeWidth={strong.includes(v) ? 1 : 0.5}
        />
      ))}
    </g>
  )
}
