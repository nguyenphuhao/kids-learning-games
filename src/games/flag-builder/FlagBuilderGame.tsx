// Trò "Ghép quốc kỳ": game đọc "Bé ghép cờ Việt Nam nhé!". Khay bên dưới có các mảnh lộn xộn
// (nền, sọc, ngôi sao, vòng tròn…) của nhiều nước. Bé kéo đúng mảnh vào khung cờ.
// Dễ/Vừa có cờ mẫu nhỏ để nhìn; Khó không có mẫu. Xem designs.tsx cho từng mức.
//
// Âm thanh: build-<CODE>, common-great, common-retry, common-finish.

import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { playLine } from '../../audio/audio'
import { useLanguage } from '../../i18n/useLanguage'
import { COUNTRIES } from '../flag-drive/countries'
import { GameTop } from '../shared/GameTop'
import { FinishScreen, StarBar } from '../shared/Rewards'
import { useSession, type GameProps } from '../shared/session'
import { useLevel, type Level } from '../shared/useLevel'
import { CELEBRATE_MS, svgPoint } from '../shared/util'
import { FH, FW, kindOf, traySize, makeBuildRound, showModel, type BuildRound } from './designs'
import { PieceArt } from './PieceArt'

type Point = { x: number; y: number }

const FX = 30 // vị trí khung cờ trong khung cảnh 300x400
const FY = 58
const MODEL = { x: 236, y: 6, w: 54, h: 36 }
const CELL_X = [45, 115, 185, 255]
const CELL_Y = [290, 358]

const home = (i: number): Point => ({ x: CELL_X[i % 4], y: CELL_Y[Math.floor(i / 4)] })

export function FlagBuilderGame({ id, onExit }: GameProps) {
  const { lang, t } = useLanguage()
  const session = useSession(id)
  const [level, setLevel] = useLevel('builder')
  const [round, setRound] = useState<BuildRound>(() => makeBuildRound(level))
  const [filled, setFilled] = useState<boolean[]>(() => round.design.slots.map(() => false))
  const [used, setUsed] = useState<boolean[]>(() => round.pieces.map(() => false))
  const [pos, setPos] = useState<Point[]>(() => round.pieces.map((_, i) => home(i)))
  const [dragging, setDragging] = useState<number | null>(null)
  const [message, setMessage] = useState<'build' | 'retry' | 'great'>('build')
  const svgRef = useRef<SVGSVGElement>(null)
  const grab = useRef<Point>({ x: 0, y: 0 })
  const pointer = useRef<Point>({ x: 0, y: 0 })

  const code = round.design.code
  useEffect(() => {
    playLine(lang, `build-${code}`)
  }, [round, code, lang])

  const done = filled.every(Boolean)

  const newRound = (lv: Level) => {
    const next = makeBuildRound(lv, round.design.code)
    setRound(next)
    setFilled(next.design.slots.map(() => false))
    setUsed(next.pieces.map(() => false))
    setPos(next.pieces.map((_, i) => home(i)))
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

  const backHome = (i: number) => setPos((list) => list.map((q, k) => (k === i ? home(i) : q)))

  const up = (i: number) => {
    if (dragging !== i) return
    setDragging(null)
    const p = { x: pointer.current.x - FX, y: pointer.current.y - FY }
    const inFrame = p.x >= 0 && p.x <= FW && p.y >= 0 && p.y <= FH
    if (!inFrame) {
      backHome(i)
      return
    }
    const piece = round.pieces[i]
    const striped = kindOf(piece).startsWith('stripe')
    const slot = round.design.slots.findIndex(
      (s, k) =>
        !filled[k] &&
        s.accepts === piece &&
        (!striped || (p.x >= s.x && p.x <= s.x + s.w && p.y >= s.y && p.y <= s.y + s.h)),
    )
    if (slot < 0) {
      setMessage('retry')
      playLine(lang, 'common-retry')
      backHome(i)
      return
    }
    const nextFilled = filled.map((v, k) => (k === slot ? true : v))
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

  const name = COUNTRIES.find((c) => c.code === code)!.name[lang]
  const build = t.flagBuilder.build.replace('{name}', name)
  const text = message === 'build' ? build : message === 'retry' ? `${t.common.retry} ${build}` : t.common.great
  const model = showModel(level)

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
            <text x={MODEL.x - 6} y={MODEL.y + 24} textAnchor="end" fontSize="13" fontWeight="700" fill="#6d4c41">
              {t.flagBuilder.model}
            </text>
            <rect x={MODEL.x - 2} y={MODEL.y - 2} width={MODEL.w + 4} height={MODEL.h + 4} rx="4" fill="#fff" />
            <svg x={MODEL.x} y={MODEL.y} width={MODEL.w} height={MODEL.h} viewBox={`0 0 ${FW} ${FH}`}>
              {round.design.slots.map((s, k) => (
                <PieceArt key={k} id={s.accepts} x={s.x} y={s.y} w={s.w} h={s.h} />
              ))}
            </svg>
          </g>
        )}

        {/* Khung cờ */}
        <g className={done ? 'g-bounce' : ''}>
          <rect x={FX - 6} y={FY - 6} width={FW + 12} height={FH + 12} rx="10" fill="#fff" />
          <rect x={FX} y={FY} width={FW} height={FH} fill="#eceff1" />
          <svg x={FX} y={FY} width={FW} height={FH} viewBox={`0 0 ${FW} ${FH}`} overflow="visible">
            {round.design.slots.map((s, k) =>
              filled[k] ? (
                <PieceArt key={k} id={s.accepts} x={s.x} y={s.y} w={s.w} h={s.h} />
              ) : kindOf(s.accepts).startsWith('stripe') || (model && kindOf(s.accepts) === 'emblem') ? (
                <rect
                  key={k}
                  x={s.x + 3}
                  y={s.y + 3}
                  width={s.w - 6}
                  height={s.h - 6}
                  rx="6"
                  fill="none"
                  stroke="#90a4ae"
                  strokeWidth="2"
                  strokeDasharray="7 6"
                />
              ) : null,
            )}
          </svg>
          <rect x={FX} y={FY} width={FW} height={FH} fill="none" stroke="#90a4ae" strokeWidth="2" strokeDasharray="8 6" />
        </g>

        {/* Khay mảnh ghép */}
        <rect x="8" y="250" width="284" height="142" rx="18" fill="#ffe0b2" />
        {round.pieces.map((piece, i) => {
          if (used[i]) return null
          const size = traySize(piece)
          const at = home(i)
          return (
            <g
              key={`${piece}-${i}`}
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
              aria-label={piece}
            >
              <rect x={at.x - 32} y={at.y - 30} width="64" height="60" fill="transparent" />
              <PieceArt id={piece} x={at.x - size.w / 2} y={at.y - size.h / 2} w={size.w} h={size.h} />
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
