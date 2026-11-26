// Trang xem trước nét chữ (chỉ có ở bản dev): mở /#glyphs.
// Mỗi nét một màu, số thứ tự ở điểm đặt bút, mũi tên nhỏ chỉ hướng viết.

import { ALPHABET, glyphBox, NUMBERS, type Glyph, type GlyphKind } from './glyphs'
import { RuledLines } from './GlyphArt'

const COLORS = ['#e53935', '#1e88e5', '#43a047', '#8e24aa']

function startOf(d: string) {
  const m = /M\s*(-?[\d.]+)[ ,](-?[\d.]+)/.exec(d)!
  return { x: Number(m[1]), y: Number(m[2]) }
}

function Card({ g, kind }: { g: Glyph; kind: GlyphKind }) {
  const b = glyphBox(g, kind)
  return (
    <figure style={{ margin: 0 }}>
      <svg viewBox={`${b.x} ${b.y} ${b.w} ${b.h}`} width={b.w * 2.2} height={b.h * 2.2} style={{ display: 'block' }}>
        <RuledLines {...b} kind={kind} />
        {g.strokes.map((d, i) => {
          const s = startOf(d)
          return (
            <g key={i}>
              <path d={d} fill="none" stroke={COLORS[i % 4]} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx={s.x} cy={s.y} r="2.6" fill={COLORS[i % 4]} />
              <text x={s.x} y={s.y + 1.4} fontSize="3.6" textAnchor="middle" fill="#fff" fontFamily="sans-serif">
                {i + 1}
              </text>
            </g>
          )
        })}
      </svg>
      <figcaption style={{ font: '12px sans-serif', textAlign: 'center' }}>{g.char}</figcaption>
    </figure>
  )
}

export function GlyphPreview() {
  const lower = [...ALPHABET.vi.lower, ...ALPHABET.en.lower.filter((g) => !ALPHABET.vi.lower.includes(g))]
  const upper = [...ALPHABET.vi.upper, ...ALPHABET.en.upper.filter((g) => !ALPHABET.vi.upper.includes(g))]
  const row = { display: 'flex', flexWrap: 'wrap' as const, gap: 6, padding: 6 }
  return (
    <div style={{ background: '#eee' }}>
      <div style={row}>{lower.map((g) => <Card key={g.id} g={g} kind="lower" />)}</div>
      <div style={row}>{upper.map((g) => <Card key={g.id} g={g} kind="upper" />)}</div>
      <div style={row}>{NUMBERS.map((g) => <Card key={g.id} g={g} kind="number" />)}</div>
    </div>
  )
}
