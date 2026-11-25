// Trò "Lái xe tìm cờ": xe chạy tới ngã rẽ, mỗi nhánh có một lá cờ.
// Game đọc (và hiện chữ) tên nước, bé chạm vào nhánh có cờ đúng để xe rẽ vào lấy cờ.
//
// Âm thanh (tạo bằng ElevenLabs, đặt trong public/audio/<vi|en>/):
//   flags-find-<CODE>.mp3   "Lấy cờ Việt Nam!" / "Find the flag of Vietnam!"
//   flags-great.mp3         "Giỏi quá!" / "Great job!"
//   flags-retry.mp3         "Thử lại nhé!" / "Try again!"
// Chưa có file thì chỉ hiện chữ.

import { useCallback, useEffect, useRef, useState } from 'react'
import { playLine } from '../../audio/audio'
import { useLanguage } from '../../i18n/useLanguage'
import { loadValue, saveValue } from '../../lib/storage'
import { flagSrc, makeRound, type Country, type Round } from './countries'
import './flagDrive.css'

type Phase = 'arrive' | 'choose' | 'drive' | 'celebrate'
type Point = { x: number; y: number }
type CarPose = Point & { angle: number }

// Khung cảnh: viewBox 0 0 300 400, xe chạy từ dưới lên.
const START: Point = { x: 150, y: 390 }
const FORK: Point = { x: 150, y: 270 }
const CONTROL_Y = 150
const BRANCH_END_Y = 112
const FLAG_SIZE = 64
const CAR_W = 34
const CAR_H = 63

const ARRIVE_MS = 1100
const DRIVE_MS = 1400
const CELEBRATE_MS = 1600

function branchXs(count: number): number[] {
  return count === 2 ? [80, 220] : [50, 150, 250]
}

function bezier(p0: Point, p1: Point, p2: Point, t: number): CarPose {
  const u = 1 - t
  const x = u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x
  const y = u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y
  const dx = 2 * u * (p1.x - p0.x) + 2 * t * (p2.x - p1.x)
  const dy = 2 * u * (p1.y - p0.y) + 2 * t * (p2.y - p1.y)
  return { x, y, angle: (Math.atan2(dy, dx) * 180) / Math.PI + 90 }
}

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2)

const fill = (template: string, name: string) => template.replace('{name}', name)

export function FlagDriveGame() {
  const { lang, t } = useLanguage()
  const [choices, setChoices] = useState<2 | 3>(() => loadValue<2 | 3>('flags-choices', 2))
  const [round, setRound] = useState<Round>(() => makeRound(choices))
  const [phase, setPhase] = useState<Phase>('arrive')
  const [car, setCar] = useState<CarPose>({ ...START, angle: 0 })
  const [chosen, setChosen] = useState<number | null>(null)
  const [wrong, setWrong] = useState<number | null>(null)
  const [message, setMessage] = useState<'find' | 'retry' | 'great'>('find')
  const [collected, setCollected] = useState<Country[]>([])
  const frame = useRef<number | null>(null)

  const xs = branchXs(round.options.length)

  // Chạy một đoạn hoạt ảnh, rồi gọi `done`.
  const animate = useCallback((ms: number, step: (t: number) => void, done: () => void) => {
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / ms)
      step(ease(p))
      if (p < 1) frame.current = requestAnimationFrame(tick)
      else done()
    }
    frame.current = requestAnimationFrame(tick)
  }, [])

  useEffect(() => () => {
    if (frame.current) cancelAnimationFrame(frame.current)
  }, [])

  const sayFind = useCallback(() => {
    setMessage('find')
    playLine(lang, `flags-find-${round.target.code}`)
  }, [lang, round.target.code])

  // Mỗi lượt mới: đọc yêu cầu, xe chạy từ dưới lên ngã rẽ.
  const target = round.target.code
  useEffect(() => {
    if (phase !== 'arrive') return
    playLine(lang, `flags-find-${target}`)
    animate(
      ARRIVE_MS,
      (p) => setCar({ x: START.x, y: START.y + (FORK.y - START.y) * p, angle: 0 }),
      () => setPhase('choose'),
    )
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current)
    }
  }, [phase, target, lang, animate])

  const nextRound = useCallback((count: 2 | 3) => {
    setRound((prev) => makeRound(count, prev.target.code))
    setCar({ ...START, angle: 0 })
    setChosen(null)
    setWrong(null)
    setMessage('find')
    setPhase('arrive')
  }, [])

  const pick = (index: number) => {
    if (phase !== 'choose') return
    const option = round.options[index]
    if (option.code !== round.target.code) {
      setWrong(index)
      setMessage('retry')
      playLine(lang, 'flags-retry')
      window.setTimeout(() => setWrong(null), 600)
      return
    }
    setWrong(null)
    setChosen(index)
    setPhase('drive')
    const end = { x: xs[index], y: BRANCH_END_Y }
    const control = { x: FORK.x, y: CONTROL_Y }
    animate(
      DRIVE_MS,
      (p) => setCar(bezier(FORK, control, end, p)),
      () => {
        setPhase('celebrate')
        setMessage('great')
        playLine(lang, 'flags-great')
        setCollected((list) => [...list, option].slice(-12))
        window.setTimeout(() => nextRound(choices), CELEBRATE_MS)
      },
    )
  }

  const changeChoices = (count: 2 | 3) => {
    if (count === choices || phase === 'drive' || phase === 'celebrate') return
    setChoices(count)
    saveValue('flags-choices', count)
    if (frame.current) cancelAnimationFrame(frame.current)
    nextRound(count)
  }

  const prompt =
    message === 'find'
      ? fill(t.flagDrive.find, round.target.name[lang])
      : message === 'retry'
        ? `${t.flagDrive.retry} ${fill(t.flagDrive.find, round.target.name[lang])}`
        : t.flagDrive.great

  const roadPath = (x: number) =>
    `M ${FORK.x} ${FORK.y} Q ${FORK.x} ${CONTROL_Y} ${x} ${BRANCH_END_Y}`

  return (
    <div className="flag-drive">
      <div className="fd-top">
        <button
          type="button"
          className="fd-prompt"
          onClick={sayFind}
          aria-label={t.flagDrive.replay}
          aria-live="polite"
        >
          <span className="fd-speaker" aria-hidden="true">🔊</span>
          <span>{prompt}</span>
        </button>
        <div className="fd-choices" role="group" aria-label={t.flagDrive.choices}>
          {([2, 3] as const).map((n) => (
            <button
              key={n}
              type="button"
              className={n === choices ? 'active' : ''}
              aria-pressed={n === choices}
              onClick={() => changeChoices(n)}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <svg className="fd-scene" viewBox="0 0 300 400" preserveAspectRatio="xMidYMid meet">
        <rect x="-200" y="-100" width="700" height="600" fill="#9ccc65" />

        {/* Đường: thân chính + các nhánh */}
        <g fill="none" strokeLinecap="round">
          <path d={`M ${START.x} 460 L ${FORK.x} ${FORK.y}`} stroke="#616161" strokeWidth="46" />
          {xs.map((x) => (
            <path key={`r${x}`} d={roadPath(x)} stroke="#616161" strokeWidth="40" />
          ))}
          <path
            d={`M ${START.x} 460 L ${FORK.x} ${FORK.y}`}
            stroke="#fff"
            strokeWidth="3"
            strokeDasharray="12 12"
          />
          {xs.map((x) => (
            <path
              key={`d${x}`}
              d={roadPath(x)}
              stroke="#fff"
              strokeWidth="3"
              strokeDasharray="10 12"
            />
          ))}
        </g>

        {/* Lá cờ cuối mỗi nhánh; chạm vào cờ hoặc nhánh đường đều được */}
        {round.options.map((c, i) => {
          const x = xs[i]
          const cls = [
            'fd-flag',
            wrong === i ? 'shake' : '',
            chosen === i && phase === 'celebrate' ? 'won' : '',
          ].join(' ')
          return (
            <g key={c.code} className={cls} onClick={() => pick(i)} role="button" aria-label={c.name[lang]}>
              <path d={roadPath(x)} stroke="transparent" strokeWidth="60" fill="none" />
              <rect x={x - 45} y={10} width={90} height={110} fill="transparent" />
              <rect x={x - 2} y={40} width={4} height={BRANCH_END_Y - 40} fill="#5d4037" />
              <g className="fd-flag-art" style={{ transformOrigin: `${x}px 50px` }}>
                <rect
                  x={x - FLAG_SIZE / 2 - 4}
                  y={14}
                  width={FLAG_SIZE + 8}
                  height={FLAG_SIZE + 8}
                  rx={10}
                  fill="#fff"
                />
                <image href={flagSrc(c.code)} x={x - FLAG_SIZE / 2} y={18} width={FLAG_SIZE} height={FLAG_SIZE} />
              </g>
            </g>
          )
        })}

        <image
          href="/assets/kenney/racing-pack/car_red_1.png"
          x={-CAR_W / 2}
          y={-CAR_H / 2}
          width={CAR_W}
          height={CAR_H}
          transform={`translate(${car.x} ${car.y}) rotate(${car.angle})`}
          pointerEvents="none"
        />
      </svg>

      <div className="fd-collected" aria-hidden={collected.length === 0}>
        {collected.map((c, i) => (
          <img key={`${c.code}-${i}`} src={flagSrc(c.code)} alt={c.name[lang]} />
        ))}
      </div>
    </div>
  )
}
