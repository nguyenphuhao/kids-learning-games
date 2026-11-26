// Trò "Ghép quốc kỳ": game đọc "Bé ghép cờ Na Uy nhé!". Hình cờ thật được cắt thành các mảnh
// như tranh xếp hình, trộn lẫn với vài mảnh của cờ nước khác trong khay. Bé kéo từng mảnh vào
// đúng ô trong khung. Dễ/Vừa có cờ mẫu nhỏ để nhìn; Khó không có mẫu. Xem puzzle.ts cho từng mức.
//
// Âm thanh: build-<CODE> (100 nước), common-great, common-retry, common-finish.

import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { playLine, preloadLines } from '../../audio/audio'
import { useLanguage } from '../../i18n/useLanguage'
import { COUNTRIES } from '../flag-drive/countries'
import { GameTop } from '../shared/GameTop'
import { FinishScreen, StarBar } from '../shared/Rewards'
import { useSession, type GameProps } from '../shared/session'
import { useLevel, type Level } from '../shared/useLevel'
import { CELEBRATE_MS, svgPoint } from '../shared/util'
import { FlagPiece, WholeFlag } from './FlagPiece'
import { FH, FW, lookalikeCells, makeBuildRound, pieceKey, showModel, type BuildRound } from './puzzle'

type Point = { x: number; y: number }
type Box = Point & { w: number; h: number }

const FX = 30 // vị trí khung cờ trong khung cảnh 300x400
const FY = 52
const MODEL = { x: 244, y: 2, w: 48, h: 36 }
const TRAY = { x: 8, y: 246, w: 284, h: 148 }

/** Ô của mảnh thứ i trong khay: tối đa 4 mảnh thì xếp một hàng, nhiều hơn thì hai hàng 4 ô. */
function trayCell(i: number, n: number): Box {
  const perRow = n <= 4 ? n : 4
  const rowsN = n <= 4 ? 1 : 2
  const w = TRAY.w / perRow
  const h = TRAY.h / rowsN
  return { x: TRAY.x + w * (i % perRow), y: TRAY.y + h * Math.floor(i / perRow), w, h }
}

/** Kích thước mảnh khi nằm trong khay: giữ đúng tỉ lệ mảnh, vừa trong ô. */
function traySize(cell: Box, cols: number, rows: number) {
  const pw = FW / cols
  const ph = FH / rows
  const k = Math.min((cell.w - 14) / pw, (cell.h - 14) / ph, 0.75)
  return { w: pw * k, h: ph * k }
}

const centre = (b: Box): Point => ({ x: b.x + b.w / 2, y: b.y + b.h / 2 })

export function FlagBuilderGame({ id, onExit }: GameProps) {
  const { lang, t } = useLanguage()
  const session = useSession(id)
  const [level, setLevel] = useLevel('builder')
  const [round, setRound] = useState<BuildRound>(() => makeBuildRound(level))
  const cellsOf = (r: BuildRound) => r.cols * r.rows
  const homes = (r: BuildRound) => r.pieces.map((_, i) => centre(trayCell(i, r.pieces.length)))
  const [filled, setFilled] = useState<boolean[]>(() => Array(cellsOf(round)).fill(false))
  const [used, setUsed] = useState<boolean[]>(() => round.pieces.map(() => false))
  const [pos, setPos] = useState<Point[]>(() => homes(round))
  const [dragging, setDragging] = useState<number | null>(null)
  const [message, setMessage] = useState<'build' | 'retry' | 'great'>('build')
  // Các ô mà mỗi mảnh trông giống hệt (tính sau khi tải hình cờ; trước đó chỉ nhận đúng ô gốc).
  const [alike, setAlike] = useState<{ round: BuildRound; cells: Record<string, number[]> } | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const grab = useRef<Point>({ x: 0, y: 0 })
  const pointer = useRef<Point>({ x: 0, y: 0 })

  const code = round.target.code
  const cw = FW / round.cols
  const ch = FH / round.rows

  useEffect(() => {
    preloadLines(
      lang,
      COUNTRIES.map((c) => `build-${c.code}`),
    )
  }, [lang])

  useEffect(() => {
    let live = true
    lookalikeCells(round).then((cells) => live && setAlike({ round, cells }))
    return () => {
      live = false
    }
  }, [round])

  useEffect(() => {
    playLine(lang, `build-${code}`)
  }, [round, code, lang])

  const done = filled.every(Boolean)

  const newRound = (lv: Level) => {
    const next = makeBuildRound(lv, round.target.code)
    setRound(next)
    setFilled(Array(cellsOf(next)).fill(false))
    setUsed(next.pieces.map(() => false))
    setPos(homes(next))
    setDragging(null)
    setMessage('build')
  }

  const down = (i: number, e: PointerEvent<SVGGElement>) => {
    if (used[i] || done || !svgRef.current) return
    e.currentTarget.setPointerCapture(e.pointerId)
    const p = svgPoint(svgRef.current, e.clientX, e.clientY)
    grab.current = { x: p.x - pos[i].x, y: p.y - pos[i].y }
    pointer.current = p
    setDragging(i)
  }

  const move = (i: number, e: PointerEvent<SVGGElement>) => {
    if (dragging !== i || !svgRef.current) return
    const p = svgPoint(svgRef.current, e.clientX, e.clientY)
    pointer.current = p
    setPos((list) => list.map((q, k) => (k === i ? { x: p.x - grab.current.x, y: p.y - grab.current.y } : q)))
  }

  const backHome = (i: number) =>
    setPos((list) => list.map((q, k) => (k === i ? centre(trayCell(i, round.pieces.length)) : q)))

  const up = (i: number) => {
    if (dragging !== i) return
    setDragging(null)
    const p = { x: pointer.current.x - FX, y: pointer.current.y - FY }
    const inFrame = p.x >= 0 && p.x < FW && p.y >= 0 && p.y < FH
    if (!inFrame) {
      backHome(i)
      return
    }
    const piece = round.pieces[i]
    const col = Math.floor(p.x / cw)
    const row = Math.floor(p.y / ch)
    const cell = row * round.cols + col
    const own = piece.code === code && piece.col === col && piece.row === row
    const looksSame = alike?.round === round && (alike.cells[pieceKey(piece)] ?? []).includes(cell)
    const right = (own || looksSame) && !filled[cell]
    if (!right) {
      setMessage('retry')
      playLine(lang, 'common-retry')
      backHome(i)
      return
    }
    const nextFilled = filled.map((v, k) => (k === cell ? true : v))
    setFilled(nextFilled)
    setUsed((list) => list.map((v, k) => (k === i ? true : v)))
    if (nextFilled.every(Boolean)) {
      setMessage('great')
      playLine(lang, 'common-great')
      const finished = session.win()
      window.setTimeout(() => (finished ? session.finish() : newRound(level)), CELEBRATE_MS)
    }
  }

  const changeLevel = (lv: Level) => {
    if (lv === level || done) return
    setLevel(lv)
    session.restart()
    newRound(lv)
  }

  const name = round.target.name[lang]
  const build = t.flagBuilder.build.replace('{name}', name)
  const text = message === 'build' ? build : message === 'retry' ? `${t.common.retry} ${build}` : t.common.great
  const model = showModel(level)
  const cells = Array.from({ length: cellsOf(round) }, (_, k) => ({ col: k % round.cols, row: Math.floor(k / round.cols) }))

  return (
    <div className="g-game">
      <GameTop
        text={text}
        onReplay={() => {
          setMessage('build')
          playLine(lang, `build-${code}`)
        }}
        level={level}
        onLevel={changeLevel}
      />
      <StarBar stars={session.stars} />
      <svg ref={svgRef} className="g-scene" viewBox="0 0 300 400" preserveAspectRatio="xMidYMid meet">
        <rect x="-200" y="-100" width="700" height="600" fill="#fff3e0" />

        {/* Cờ mẫu (mức Dễ, Vừa) */}
        {model && (
          <g aria-label={t.flagBuilder.model}>
            <text x={MODEL.x - 6} y={MODEL.y + 25} textAnchor="end" fontSize="13" fontWeight="700" fill="#6d4c41">
              {t.flagBuilder.model}
            </text>
            <rect x={MODEL.x - 2} y={MODEL.y - 2} width={MODEL.w + 4} height={MODEL.h + 4} rx="4" fill="#fff" />
            <WholeFlag code={code} {...MODEL} />
          </g>
        )}

        {/* Khung cờ */}
        <g className={done ? 'g-bounce' : ''}>
          <rect x={FX - 6} y={FY - 6} width={FW + 12} height={FH + 12} rx="10" fill="#fff" />
          <rect x={FX} y={FY} width={FW} height={FH} fill="#eceff1" />
          {cells.map(({ col, row }, k) =>
            filled[k] ? (
              <FlagPiece
                key={k}
                piece={{ code, col, row }}
                cols={round.cols}
                rows={round.rows}
                x={FX + col * cw}
                y={FY + row * ch}
                w={cw}
                h={ch}
              />
            ) : (
              <rect
                key={k}
                x={FX + col * cw + 3}
                y={FY + row * ch + 3}
                width={cw - 6}
                height={ch - 6}
                rx="6"
                fill="none"
                stroke="#90a4ae"
                strokeWidth="2"
                strokeDasharray="7 6"
              />
            ),
          )}
          {done && <rect x={FX} y={FY} width={FW} height={FH} fill="none" stroke="#cfd8dc" strokeWidth="1" />}
        </g>

        {/* Khay mảnh ghép */}
        <rect {...TRAY} rx="18" fill="#ffe0b2" />
        {round.pieces.map((piece, i) => {
          if (used[i]) return null
          const cell = trayCell(i, round.pieces.length)
          const at = centre(cell)
          const size = traySize(cell, round.cols, round.rows)
          return (
            <g
              key={`${round.target.code}-${i}`}
              className="g-tap"
              style={{
                transition: dragging === i ? 'none' : 'transform 0.25s ease',
                transform: `translate(${pos[i].x - at.x}px, ${pos[i].y - at.y}px)`,
              }}
              onPointerDown={(e) => down(i, e)}
              onPointerMove={(e) => move(i, e)}
              onPointerUp={() => up(i)}
              onPointerCancel={() => up(i)}
              role="button"
              aria-label={`${piece.code} ${piece.col},${piece.row}`}
            >
              <rect x={cell.x + 2} y={cell.y + 2} width={cell.w - 4} height={cell.h - 4} fill="transparent" />
              <rect
                x={at.x - size.w / 2 - 1.5}
                y={at.y - size.h / 2 - 1.5}
                width={size.w + 3}
                height={size.h + 3}
                rx="2"
                fill="#fff"
                stroke="#b0bec5"
                strokeWidth="1"
                pointerEvents="none"
              />
              <FlagPiece
                piece={piece}
                cols={round.cols}
                rows={round.rows}
                x={at.x - size.w / 2}
                y={at.y - size.h / 2}
                w={size.w}
                h={size.h}
              />
            </g>
          )
        })}
      </svg>
      {session.finished && (
        <FinishScreen
          onReplay={() => {
            session.restart()
            newRound(level)
          }}
          onExit={onExit}
        />
      )}
    </div>
  )
}
