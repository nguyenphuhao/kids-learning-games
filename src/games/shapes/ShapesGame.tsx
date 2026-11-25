// Trò "Xếp hình": kéo từng hình vào ô có cùng hình dạng.
// Mức dễ 2 hình, mức khó 4 hình (tròn, vuông, tam giác, ngôi sao).
//
// Âm thanh: shapes-intro, shape-<hình> (khi đặt đúng), common-great, common-retry.

import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { playLine } from '../../audio/audio'
import { useLanguage } from '../../i18n/useLanguage'
import { GameTop } from '../shared/GameTop'
import { useLevel, type Level } from '../shared/useLevel'
import { CELEBRATE_MS, shuffle, svgPoint } from '../shared/util'

type ShapeName = 'circle' | 'square' | 'triangle' | 'star'
type Point = { x: number; y: number }
type Round = { shapes: ShapeName[]; holes: Point[]; starts: Point[] }

const ALL: ShapeName[] = ['circle', 'square', 'triangle', 'star']
const FILL: Record<ShapeName, string> = {
  circle: '#e53935',
  square: '#1e88e5',
  triangle: '#43a047',
  star: '#fdd835',
}
const SIZE = 30 // nửa kích thước hình
const SNAP = 42 // thả trong khoảng này thì tính là vào ô

function makeRound(level: Level): Round {
  const shapes = shuffle(ALL).slice(0, level === 'easy' ? 2 : 4)
  const n = shapes.length
  const xs = shapes.map((_, i) => (300 / n) * (i + 0.5))
  const holeXs = shuffle(xs)
  const startXs = shuffle(xs)
  return {
    shapes,
    holes: holeXs.map((x) => ({ x, y: 80 })),
    starts: startXs.map((x) => ({ x, y: 230 })),
  }
}

function starPath(r: number): string {
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.45
    const a = (Math.PI / 5) * i - Math.PI / 2
    pts.push(`${(rad * Math.cos(a)).toFixed(1)},${(rad * Math.sin(a)).toFixed(1)}`)
  }
  return `M${pts.join(' L')} Z`
}

function Shape({ name, x, y, hole }: { name: ShapeName; x: number; y: number; hole?: boolean }) {
  const props = hole
    ? { fill: '#eceff1', stroke: '#90a4ae', strokeWidth: 3, strokeDasharray: '8 6' }
    : { fill: FILL[name], stroke: '#fff', strokeWidth: 3 }
  const r = SIZE
  return (
    <g transform={`translate(${x} ${y})`} data-hole={hole ? name : undefined}>
      {name === 'circle' && <circle r={r} {...props} />}
      {name === 'square' && <rect x={-r} y={-r} width={r * 2} height={r * 2} rx="6" {...props} />}
      {name === 'triangle' && <path d={`M0 ${-r} L${r} ${r * 0.8} L${-r} ${r * 0.8} Z`} {...props} />}
      {name === 'star' && <path d={starPath(r * 1.15)} {...props} />}
    </g>
  )
}

export function ShapesGame() {
  const { lang, t } = useLanguage()
  const [level, setLevel] = useLevel('shapes')
  const [round, setRound] = useState(() => makeRound(level))
  const [pos, setPos] = useState<Point[]>(round.starts)
  const [placed, setPlaced] = useState<boolean[]>(() => round.shapes.map(() => false))
  const [dragging, setDragging] = useState<number | null>(null)
  const [message, setMessage] = useState<'intro' | 'retry' | 'great' | ShapeName>('intro')
  const svgRef = useRef<SVGSVGElement>(null)
  const offset = useRef<Point>({ x: 0, y: 0 })

  useEffect(() => {
    playLine(lang, 'shapes-intro')
  }, [round, lang])

  const done = placed.every(Boolean)

  const newRound = (lv: Level) => {
    const r = makeRound(lv)
    setRound(r)
    setPos(r.starts)
    setPlaced(r.shapes.map(() => false))
    setDragging(null)
    setMessage('intro')
  }

  const down = (i: number, e: PointerEvent<SVGGElement>) => {
    if (placed[i] || done || !svgRef.current) return
    e.currentTarget.setPointerCapture(e.pointerId)
    const p = svgPoint(svgRef.current, e.clientX, e.clientY)
    offset.current = { x: p.x - pos[i].x, y: p.y - pos[i].y }
    setDragging(i)
  }

  const move = (i: number, e: PointerEvent<SVGGElement>) => {
    if (dragging !== i || !svgRef.current) return
    const p = svgPoint(svgRef.current, e.clientX, e.clientY)
    const x = Math.max(SIZE, Math.min(300 - SIZE, p.x - offset.current.x))
    const y = Math.max(SIZE, Math.min(300 - SIZE, p.y - offset.current.y))
    setPos((list) => list.map((q, k) => (k === i ? { x, y } : q)))
  }

  const up = (i: number) => {
    if (dragging !== i) return
    setDragging(null)
    const here = pos[i]
    const near = round.holes.findIndex((h) => Math.hypot(h.x - here.x, h.y - here.y) < SNAP)
    if (near === i) {
      const nextPlaced = placed.map((v, k) => (k === i ? true : v))
      setPlaced(nextPlaced)
      setPos((list) => list.map((q, k) => (k === i ? round.holes[i] : q)))
      if (nextPlaced.every(Boolean)) {
        setMessage('great')
        playLine(lang, 'common-great')
        window.setTimeout(() => newRound(level), CELEBRATE_MS)
      } else {
        setMessage(round.shapes[i])
        playLine(lang, `shape-${round.shapes[i]}`)
      }
      return
    }
    // Sai ô hoặc thả giữa chừng: hình trở về chỗ cũ.
    if (near >= 0 && !placed[near]) {
      setMessage('retry')
      playLine(lang, 'common-retry')
    }
    setPos((list) => list.map((q, k) => (k === i ? round.starts[i] : q)))
  }

  const changeLevel = (lv: Level) => {
    if (lv === level || done) return
    setLevel(lv)
    newRound(lv)
  }

  const text =
    message === 'intro'
      ? t.shapes.intro
      : message === 'retry'
        ? `${t.common.retry} ${t.shapes.intro}`
        : message === 'great'
          ? t.common.great
          : `${t.shapes.names[message]}!`

  return (
    <div className="g-game">
      <GameTop
        text={text}
        onReplay={() => {
          setMessage('intro')
          playLine(lang, 'shapes-intro')
        }}
        level={level}
        onLevel={changeLevel}
      />
      <svg ref={svgRef} className="g-scene" viewBox="0 0 300 300" preserveAspectRatio="xMidYMid meet">
        <rect x="-200" y="-100" width="700" height="500" fill="#f3e5f5" />
        <rect x="10" y="30" width="280" height="100" rx="20" fill="#fff" opacity="0.6" />
        {round.shapes.map((s, i) => (
          <Shape key={`h-${s}`} name={s} x={round.holes[i].x} y={round.holes[i].y} hole />
        ))}
        {round.shapes.map((s, i) => (
          <g key={`p-${s}`} className={done ? 'g-bounce' : ''}>
            <g
              className={placed[i] ? '' : 'g-tap'}
              style={{
                transition: dragging === i ? 'none' : 'transform 0.25s ease',
                transform: `translate(${pos[i].x - round.starts[i].x}px, ${pos[i].y - round.starts[i].y}px)`,
              }}
              onPointerDown={(e) => down(i, e)}
              onPointerMove={(e) => move(i, e)}
              onPointerUp={() => up(i)}
              onPointerCancel={() => up(i)}
              role="button"
              aria-label={t.shapes.names[s]}
            >
              <circle cx={round.starts[i].x} cy={round.starts[i].y} r={SIZE + 14} fill="transparent" />
              <Shape name={s} x={round.starts[i].x} y={round.starts[i].y} />
            </g>
          </g>
        ))}
      </svg>
    </div>
  )
}
