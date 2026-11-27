// Trình đọc truyện kể thẳng "Chiếc xe đèn nhấp nháy của Henry" (chuyển từ bản HTML gốc).
// - Lật trang bằng nút ← / →, vuốt ngang trên tranh, hoặc phím mũi tên.
// - Mỗi trang tự đọc lời kể; chạm vào lời kể để nghe lại. Bật "Tự lật trang" thì đọc xong tự sang trang.
// - Nút 🎨: đổi màu xe (5 màu) và bầu trời (Đêm sao / Hoàng hôn / Cực quang), lưu trên máy.
// - Chạm màn hình rắc sao; đốm sáng bay lơ lửng. Máy bật "giảm chuyển động" thì tắt hết hiệu ứng.
// - Đọc xong trang cuối: màn hình cúp.

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { playLine } from '../../audio/audio'
import { FinishScreen } from '../../games/shared/Rewards'
import { useSession } from '../../games/shared/session'
import { loadValue, saveValue } from '../../lib/storage'
import { bookAudioKey, HENRY_CAR } from '../books'
import { Scene, VIEW_H, VIEW_W } from './art'
import { Sparkles } from './Sparkles'
import '../../games/shared/game.css'
import '../story.css'
import './henryCar.css'

const BOOK = HENRY_CAR

/** Tên màu (thay cho {car} trong lời kể), màu thân xe, màu sọc. */
const CARS: [string, string, string][] = [
  ['đỏ', '#E24B4A', '#F09595'],
  ['xanh dương', '#378ADD', '#85B7EB'],
  ['vàng', '#EF9F27', '#FAC775'],
  ['tím', '#7F77DD', '#CECBF6'],
  ['xanh lá', '#1D9E75', '#9FE1CB'],
]

type SkyId = 'night' | 'sunset' | 'aurora'
/** Tên, màu trời trên, màu trời dưới, màu mặt đất, màu nền. */
const SKIES: Record<SkyId, [string, string, string, string, string]> = {
  night: ['Đêm sao', '#0d1030', '#2a2f66', '#D9D4C7', '#0b0d22'],
  sunset: ['Hoàng hôn', '#2b1b4d', '#d0647c', '#EAD3C6', '#1a1030'],
  aurora: ['Cực quang', '#041226', '#0f4a55', '#CFDAD6', '#051020'],
}
const SKY_IDS = Object.keys(SKIES) as SkyId[]

/** Chờ sau khi đọc xong một trang rồi mới tự lật. */
const AUTO_DELAY = 1400

export function HenryCarBook({ onExit }: { onExit: () => void }) {
  const session = useSession(`story-${BOOK.id}`)
  const last = BOOK.pages.length - 1
  const [page, setPage] = useState(0)
  const [car, setCarState] = useState(() => {
    const i = loadValue<number>('henry-car-color', 0)
    return CARS[i] ? i : 0
  })
  const [sky, setSkyState] = useState<SkyId>(() => {
    const k = loadValue<string>('henry-car-sky', 'night')
    return SKY_IDS.includes(k as SkyId) ? (k as SkyId) : 'night'
  })
  const [auto, setAuto] = useState(false)
  // Bảng 🎨 nổi trên màn hình (không nằm trong khung tranh, vì tranh trên điện thoại thấp hơn bảng).
  const [panel, setPanel] = useState<{ top: number; right: number } | null>(null)

  // Giá trị mới nhất cho hàm gọi lại khi đọc xong (chạy sau một khoảng chờ); cập nhật cùng lúc với `auto`.
  const autoRef = useRef(false)
  const doneRef = useRef(false)
  const timer = useRef(0)

  const go = (i: number) => {
    window.clearTimeout(timer.current)
    setPage(Math.max(0, Math.min(last, i)))
  }

  const afterRead = (i: number) => {
    doneRef.current = true
    if (i === last) {
      session.finish()
      return
    }
    if (autoRef.current) timer.current = window.setTimeout(() => go(i + 1), AUTO_DELAY)
  }

  const read = (i: number) => {
    window.clearTimeout(timer.current)
    doneRef.current = false
    playLine('vi', bookAudioKey(BOOK, i), () => afterRead(i))
  }

  // Sang trang mới thì đọc trang đó.
  useEffect(() => {
    read(page)
  }, [page]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => window.clearTimeout(timer.current), [])

  // Phím mũi tên lật trang.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setPage((p) => Math.min(last, p + 1))
      if (e.key === 'ArrowLeft') setPage((p) => Math.max(0, p - 1))
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [last])

  const changeAuto = (on: boolean) => {
    setAuto(on)
    autoRef.current = on
    // Bật khi trang đang mở đã đọc xong: sang trang luôn.
    if (on && doneRef.current && page < last) go(page + 1)
  }

  const setCar = (i: number) => {
    setCarState(i)
    saveValue('henry-car-color', i)
  }
  const setSky = (k: SkyId) => {
    setSkyState(k)
    saveValue('henry-car-sky', k)
  }

  const restart = () => {
    session.restart()
    setAuto(false)
    autoRef.current = false
    if (page === 0) read(0)
    else go(0)
  }

  // Vuốt ngang trên tranh để lật trang.
  const swipeX = useRef<number | null>(null)

  const s = SKIES[sky]
  const vars = {
    '--hc-car': CARS[car][1],
    '--hc-car2': CARS[car][2],
    '--hc-sky1': s[1],
    '--hc-sky2': s[2],
    '--hc-ground': s[3],
    '--hc-bg': s[4],
  } as CSSProperties

  const current = BOOK.pages[page]

  return (
    <div className={`g-game story hc-book hc-sky-${sky}`} style={vars} onPointerDown={() => panel && setPanel(null)}>
      <div
        className="story-scene hc-scene"
        onTouchStart={(e) => (swipeX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (swipeX.current === null) return
          const dx = e.changedTouches[0].clientX - swipeX.current
          if (Math.abs(dx) > 50) go(page + (dx < 0 ? 1 : -1))
          swipeX.current = null
        }}
      >
        <svg key={page} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label={current.label}>
          <Scene scene={current.scene} />
        </svg>

        <button
          type="button"
          className="hc-gear"
          aria-label="Đổi màu xe và bầu trời"
          aria-expanded={!!panel}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect()
            setPanel(panel ? null : { top: r.bottom + 8, right: innerWidth - r.right })
          }}
        >
          🎨
        </button>
        {panel && (
          <div className="hc-panel" style={panel} onPointerDown={(e) => e.stopPropagation()}>
            <b>Màu xe của Henry</b>
            <div className="hc-row">
              {CARS.map((c, i) => (
                <button
                  key={c[0]}
                  type="button"
                  className={`hc-swatch${i === car ? ' on' : ''}`}
                  style={{ background: c[1] }}
                  aria-label={`Xe màu ${c[0]}`}
                  aria-pressed={i === car}
                  onClick={() => setCar(i)}
                />
              ))}
            </div>
            <b>Bầu trời</b>
            <div className="hc-row">
              {SKY_IDS.map((k) => (
                <button key={k} type="button" className={`hc-chip${k === sky ? ' on' : ''}`} aria-pressed={k === sky} onClick={() => setSky(k)}>
                  {SKIES[k][0]}
                </button>
              ))}
            </div>
            <label className="hc-auto">
              <input type="checkbox" checked={auto} onChange={(e) => changeAuto(e.target.checked)} /> Tự lật trang
            </label>
          </div>
        )}
      </div>

      {page === 0 ? (
        <div className="story-text hc-text hc-cover" key="cover">
          <h3>{BOOK.title}</h3>
          <small>
            Truyện kể trước giờ đi ngủ
            <br />
            Chạm 🎨 để đổi màu xe và bầu trời · chạm màn hình để rắc sao
          </small>
          <button type="button" className="hc-play" onClick={() => changeAuto(true)}>
            ▶ Nghe kể chuyện
          </button>
        </div>
      ) : (
        <button type="button" className="story-text hc-text" key={page} onClick={() => read(page)} aria-label="Nghe lại">
          <span className="g-speaker" aria-hidden="true">
            🔊
          </span>
          <span>
            {current.paragraphs.map((p, i) => (
              <span key={i} className={`hc-p${p.say ? ' hc-say' : ''}`} style={{ animationDelay: `${i * 0.5}s` }}>
                {p.text.replace('{car}', CARS[car][0])}
              </span>
            ))}
          </span>
        </button>
      )}

      <nav className="hc-nav">
        <button type="button" onClick={() => go(page - 1)} disabled={page === 0} aria-label="Trang trước">
          ←
        </button>
        <div className="hc-dots" aria-label={`Trang ${page + 1}/${BOOK.pages.length}`}>
          {BOOK.pages.map((_, i) => (
            <i key={i} className={i === page ? 'on' : ''} />
          ))}
        </div>
        <button type="button" onClick={() => go(page + 1)} disabled={page === last} aria-label="Trang sau">
          →
        </button>
      </nav>

      <Sparkles />

      {session.finished && <FinishScreen onReplay={restart} onExit={onExit} />}
    </div>
  )
}
