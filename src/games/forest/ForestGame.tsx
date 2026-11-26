// Trò "Vào rừng tìm chữ" (và tìm số).
// Bé kéo xe chạy vào rừng (cảnh Phaser, xem ForestScene.ts). Mỗi bạn thú cầm một quả bóng có chữ;
// bé chạm bạn thú thì nhận thử thách: xem cách viết rồi viết theo chữ đó (Writer của trò tập viết).
// Viết xong thì nhận được chữ. Đủ chữ thì lái qua cổng rừng, kéo các chữ vào đúng ô để ghép thành từ
// (có hình minh hoạ), hoặc xếp các số theo thứ tự.
//
// Mức chơi: Dễ (từ 2–3 chữ / 3 số, ô trống có chữ mờ gợi ý, viết được lệch nhiều),
// Khó (từ 4–5 chữ / 5 số, ô trống không có gợi ý, viết phải sát nét hơn).
// Phaser chỉ được tải khi mở trò này.
//
// Âm thanh: dùng lại write-watch, write-trace, common-great, common-retry, common-finish.
// Các câu nhắc riêng của trò (lái xe, chạm bạn thú, xếp chữ) chưa có file giọng đọc.

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { playLine } from '../../audio/audio'
import type { Lang } from '../../i18n/strings'
import { useLanguage } from '../../i18n/useLanguage'
import { loadValue, saveValue } from '../../lib/storage'
import { GameTop } from '../shared/GameTop'
import { FinishScreen } from '../shared/Rewards'
import { useSession, type GameProps } from '../shared/session'
import { useLevel, type Level } from '../shared/useLevel'
import { pick } from '../shared/util'
import { ALPHABET, glyphBox, NUMBERS, type Glyph } from '../writing/glyphs'
import { Writer, type Phase as WriterPhase } from '../writing/Writer'
import '../writing/writing.css'
import type { ForestConfig, ForestEvent, ForestGameHandle, ForestItem } from './ForestScene'
import { numberRun, WORDS } from './words'
import './forest.css'

type Mode = 'letters' | 'numbers'
type Stage = 'drive' | 'meet' | 'gate' | 'build' | 'done'
type Run = { items: ForestItem[]; picture: string | null; hints: boolean; level: Level; lang: Lang }

const LEVELS: Level[] = ['easy', 'hard']

function makeRun(mode: Mode, level: Level, lang: Lang): Run {
  const hard = level === 'hard'
  if (mode === 'numbers') {
    const items = numberRun(hard).map((c) => ({ char: c, kind: 'number' as const, glyph: NUMBERS.find((g) => g.id === c)! }))
    return { items, picture: null, hints: !hard, level, lang }
  }
  const lower: readonly Glyph[] = ALPHABET[lang].lower
  const find = (ch: string) => lower.find((g) => g.id === ch)
  // Chỉ lấy từ mà mọi chữ đều có nét viết.
  const words = WORDS[lang][hard ? 'hard' : 'easy'].filter((w) => [...w.text.normalize('NFC')].every((ch) => find(ch)))
  const word = pick(words)
  const items = [...word.text.normalize('NFC')].map((ch) => ({ char: ch, kind: 'lower' as const, glyph: find(ch)! }))
  return { items, picture: word.picture, hints: !hard, level, lang }
}

/** Chữ nhỏ trên thanh "đã tìm được". */
function MiniGlyph({ item }: { item: ForestItem }) {
  const b = glyphBox(item.glyph, item.kind, 0, true)
  return (
    <svg viewBox={`${b.x} ${b.y} ${b.w} ${b.h}`} aria-label={item.char}>
      {item.glyph.strokes.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="#1e63c6" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </svg>
  )
}

export function ForestGame({ id, onExit }: GameProps) {
  const session = useSession(id)
  const { lang, t } = useLanguage()
  const [savedLevel, setLevel] = useLevel(id)
  const level: Level = savedLevel === 'medium' ? 'easy' : savedLevel
  const [mode, setMode] = useState<Mode>(() => loadValue<Mode>(`forest-mode-${id}`, 'letters'))
  const [run, setRun] = useState<Run>(() => makeRun(mode, level, lang))
  const [stage, setStage] = useState<Stage>('drive')
  const [collected, setCollected] = useState<number[]>([])
  const [challenge, setChallenge] = useState<number | null>(null)
  const [wPhase, setWPhase] = useState<WriterPhase>('watch')
  const [watchKey, setWatchKey] = useState(0)
  const [retry, setRetry] = useState(false)
  const lastRetry = useRef(0)
  const hostRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<ForestGameHandle | null>(null)

  const sayRetry = useCallback(() => {
    const now = Date.now()
    if (now - lastRetry.current < 2500) return
    lastRetry.current = now
    playLine(lang, 'common-retry')
  }, [lang])

  // Sự kiện từ cảnh Phaser. Giữ trong ref để cảnh luôn gọi bản mới nhất.
  const onEvent = useRef<(e: ForestEvent) => void>(() => {})
  const handleEvent = (e: ForestEvent) => {
    if (e.type === 'meet') setStage('meet')
    else if (e.type === 'challenge') {
      setChallenge(e.index)
      setWPhase('watch')
      setRetry(false)
      setWatchKey((k) => k + 1)
      playLine(lang, 'write-watch')
    } else if (e.type === 'collected') {
      const next = [...collected, e.index]
      setCollected(next)
      setStage(next.length >= run.items.length ? 'gate' : 'drive')
    } else if (e.type === 'arrive') setStage('build')
    else if (e.type === 'wrong') sayRetry()
    else if (e.type === 'complete') {
      setStage('done')
      playLine(lang, 'common-great')
      window.setTimeout(() => session.finish(), 1800)
    }
  }
  useLayoutEffect(() => {
    onEvent.current = handleEvent
  })

  const config = useCallback(
    (r: Run): ForestConfig => ({ items: r.items, picture: r.picture, hints: r.hints, onEvent: (e) => onEvent.current(e) }),
    [],
  )

  // Tạo game Phaser một lần (tải Phaser khi mở trò), huỷ khi rời trò.
  const firstRun = useRef(run)
  useEffect(() => {
    let cancelled = false
    let handle: ForestGameHandle | null = null
    import('./ForestScene').then(({ createForestGame }) => {
      if (cancelled || !hostRef.current) return
      handle = createForestGame(hostRef.current, config(firstRun.current))
      gameRef.current = handle
    })
    return () => {
      cancelled = true
      handle?.destroy()
      gameRef.current = null
    }
  }, [config])

  const startRun = (r: Run) => {
    setRun(r)
    setStage('drive')
    setCollected([])
    setChallenge(null)
  }

  // Đổi ngôn ngữ khi đang chơi chữ: từ cần ghép đổi theo, chơi lại từ đầu.
  if (mode === 'letters' && run.lang !== lang) startRun(makeRun(mode, level, lang))

  // Lượt mới thì dựng lại cảnh Phaser (lượt đầu đã dựng khi tạo game).
  useEffect(() => {
    if (run !== firstRun.current) gameRef.current?.restart(config(run))
  }, [run, config])

  const changeMode = (m: Mode) => {
    if (m === mode) return
    setMode(m)
    saveValue(`forest-mode-${id}`, m)
    startRun(makeRun(m, level, lang))
  }

  const changeLevel = (lv: Level) => {
    if (lv === level) return
    setLevel(lv)
    startRun(makeRun(mode, lv, lang))
  }

  // ---------- Thử thách viết chữ ----------

  const item = challenge === null ? null : run.items[challenge]

  const onWatched = () => {
    setWPhase('trace')
    playLine(lang, 'write-trace')
  }

  const onWritten = () => {
    setWPhase('done')
    setRetry(false)
    playLine(lang, 'common-great')
    window.setTimeout(() => {
      setChallenge(null)
      gameRef.current?.scene()?.solve()
    }, 1000)
  }

  const onMiss = () => {
    setRetry(true)
    sayRetry()
  }

  const watchAgain = () => {
    setWPhase('watch')
    setRetry(false)
    setWatchKey((k) => k + 1)
    playLine(lang, 'write-watch')
  }

  const closeChallenge = () => {
    setChallenge(null)
    gameRef.current?.scene()?.cancelChallenge()
  }

  // ---------- Câu nhắc ----------

  const numbers = mode === 'numbers'
  const text =
    item !== null
      ? wPhase === 'watch'
        ? t.writing.watch
        : wPhase === 'done'
          ? t.common.great
          : retry
            ? `${t.common.retry} ${t.writing.trace}`
            : t.writing.trace
      : stage === 'meet'
        ? t.forest.meet
        : stage === 'gate'
          ? t.forest.gate
          : stage === 'build'
            ? numbers
              ? t.forest.buildNumbers
              : t.forest.build
            : stage === 'done'
              ? t.common.great
              : numbers
                ? t.forest.driveNumbers
                : t.forest.drive

  const replay = () => {
    if (item === null) return
    playLine(lang, wPhase === 'watch' ? 'write-watch' : wPhase === 'trace' ? 'write-trace' : 'common-great')
  }

  return (
    <div className="g-game fr-game">
      <GameTop text={text} onReplay={replay} level={level} onLevel={changeLevel} levels={LEVELS} />
      <div className="w-tabs" role="tablist">
        {(['letters', 'numbers'] as const).map((m) => (
          <button key={m} type="button" role="tab" aria-selected={mode === m} className={mode === m ? 'active' : ''} onClick={() => changeMode(m)}>
            {m === 'letters' ? 'a b c' : '1 2 3'} <small>{t.forest[m]}</small>
          </button>
        ))}
      </div>

      <div className="g-scene fr-scene">
        <div ref={hostRef} className="fr-canvas" />

        <div className="fr-found" aria-label={t.forest.found}>
          {run.items.map((_, i) => {
            const got = collected[i]
            return <span key={i} className={got === undefined ? 'fr-slot' : 'fr-slot on'}>{got !== undefined && <MiniGlyph item={run.items[got]} />}</span>
          })}
        </div>

        {item && (
          <div className="fr-challenge" role="dialog" aria-label={item.char}>
            <div className="fr-card">
              <Writer
                key={`${item.kind}:${item.glyph.id}:${watchKey}`}
                glyph={item.glyph}
                kind={item.kind}
                level={run.level}
                phase={wPhase}
                onWatched={onWatched}
                onDone={onWritten}
                onMiss={onMiss}
              />
              <div className="w-actions">
                <button type="button" onClick={closeChallenge} aria-label={t.forest.close}>
                  <span aria-hidden="true">✕</span>
                </button>
                <button type="button" onClick={watchAgain} aria-label={t.writing.watchAgain} disabled={wPhase !== 'trace'}>
                  <span aria-hidden="true">👀</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {session.finished && (
        <FinishScreen
          onReplay={() => {
            session.restart()
            startRun(makeRun(mode, level, lang))
          }}
          onExit={onExit}
        />
      )}
    </div>
  )
}
