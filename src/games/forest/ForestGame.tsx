// Trò "Vào rừng tìm chữ" (và tìm số): 10 màn, xe đi từ sáng sớm tới tối, mỗi màn qua một cổng rừng.
// Mọi thử thách đều là viết (Writer của trò tập viết), không có kéo thả chữ:
//   - bạn thú cầm bóng có chữ: xem cách viết rồi viết chữ đó để nhận chữ;
//   - (có màn, chế độ chữ) bạn thú gặp nạn: viết lần lượt từng chữ của tên công cụ để cứu bạn;
//   - tới cổng rừng: viết lại cả từ (hoặc cả dãy số), từng chữ vào từng ô.
// Tiến độ (đang ở màn mấy) lưu trên máy, riêng cho chế độ chữ và số. Qua màn 10 thì được cúp.
//
// Mức chơi: Dễ (từ 2–3 chữ / 3 số, viết được lệch nhiều), Khó (từ 4–5 chữ / 5 số, viết phải sát nét hơn).
// Phaser chỉ được tải khi mở trò này.
//
// Âm thanh: dùng lại write-watch, write-trace, common-great, common-retry, common-finish.
// Các câu nhắc riêng của trò (lái xe, chạm bạn thú, cứu bạn, cổng rừng) chưa có file giọng đọc.

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { playLine } from '../../audio/audio'
import type { Lang } from '../../i18n/strings'
import { useLanguage } from '../../i18n/useLanguage'
import { loadValue, saveValue } from '../../lib/storage'
import { GameTop } from '../shared/GameTop'
import { FinishScreen } from '../shared/Rewards'
import { useSession, type GameProps } from '../shared/session'
import { useLevel, type Level } from '../shared/useLevel'
import { ALPHABET, lowerGlyph, NUMBERS, type Glyph } from '../writing/glyphs'
import { Writer, type Phase as WriterPhase } from '../writing/Writer'
import '../writing/writing.css'
import { glyphWidth, runFrame, type Frame } from './art'
import type { ForestConfig, ForestEvent, ForestGameHandle, ForestItem } from './ForestScene'
import { pickRescue, RESCUES, STAGE_COUNT, TIMES, type Rescue } from './stages'
import { numberRun, WORDS, type Word } from './words'
import './forest.css'

type Mode = 'letters' | 'numbers'
type Stage = 'drive' | 'meet' | 'rescue' | 'rescued' | 'gate' | 'atGate'
type Run = {
  stage: number
  mode: Mode
  level: Level
  lang: Lang
  items: ForestItem[]
  picture: string | null
  rescue: Rescue | null
  toolItems: ForestItem[]
}
type Target = 'letter' | 'rescue' | 'gate'
type Challenge = { target: Target; items: ForestItem[]; picture: string | null; watch: boolean }

const LEVELS: Level[] = ['easy', 'hard']

/** Nét viết của một chữ thường theo ngôn ngữ (tiếng Việt có cả chữ mang dấu thanh). */
function letterGlyph(ch: string, lang: Lang): Glyph | undefined {
  return lang === 'vi' ? lowerGlyph(ch) : ALPHABET.en.lower.find((g) => g.id === ch)
}

function toItems(text: string, lang: Lang): ForestItem[] {
  return [...text.normalize('NFC')].map((ch) => ({ char: ch, kind: 'lower' as const, glyph: letterGlyph(ch, lang)! }))
}

/** Từ đã ra trong lần chơi này, để 10 màn không lặp từ (hết từ thì dùng lại từ đầu). */
const usedWords = new Set<string>()

function pickWord(lang: Lang, hard: boolean): Word {
  const all = WORDS[lang][hard ? 'hard' : 'easy'].filter((w) => [...w.text.normalize('NFC')].every((ch) => letterGlyph(ch, lang)))
  let fresh = all.filter((w) => !usedWords.has(w.text))
  if (fresh.length === 0) {
    all.forEach((w) => usedWords.delete(w.text))
    fresh = all
  }
  const w = fresh[Math.floor(Math.random() * fresh.length)]
  usedWords.add(w.text)
  return w
}

function makeRun(mode: Mode, level: Level, lang: Lang, stage: number, last: Run | null): Run {
  const hard = level === 'hard'
  const base = { stage, mode, level, lang }
  if (mode === 'numbers') {
    const items = numberRun(hard).map((c) => ({ char: c, kind: 'number' as const, glyph: NUMBERS.find((g) => g.id === c)! }))
    return { ...base, items, picture: null, rescue: null, toolItems: [] }
  }
  const word = pickWord(lang, hard)
  const rescue = pickRescue(stage, last?.rescue?.kind ?? null)
  return { ...base, items: toItems(word.text, lang), picture: word.picture, rescue, toolItems: rescue ? toItems(rescue.tool[lang], lang) : [] }
}

/** Chữ nhỏ (ô đã tìm được, ô đã viết): cùng khung chung với các chữ khác (cùng tỉ lệ, cùng chân chữ). */
function MiniGlyph({ item, frame }: { item: ForestItem; frame: Frame }) {
  return (
    <svg viewBox={`-6 ${frame.top} ${glyphWidth(item.glyph)} ${frame.bottom - frame.top}`} aria-label={item.char}>
      {item.glyph.strokes.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="#1e63c6" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </svg>
  )
}

const stageKey = (id: string, mode: Mode) => `forest-stage-${id}-${mode}`

export function ForestGame({ id, onExit }: GameProps) {
  const session = useSession(id)
  const { lang, t } = useLanguage()
  const [savedLevel, setLevel] = useLevel(id)
  const level: Level = savedLevel === 'medium' ? 'easy' : savedLevel
  const [mode, setMode] = useState<Mode>(() => loadValue<Mode>(`forest-mode-${id}`, 'letters'))
  const [run, setRun] = useState<Run>(() => makeRun(mode, level, lang, Math.min(loadValue<number>(stageKey(id, mode), 0), STAGE_COUNT - 1), null))
  const [stage, setStage] = useState<Stage>('drive')
  const [collected, setCollected] = useState<number[]>([])
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [pos, setPos] = useState(0)
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

  const startRun = (r: Run) => {
    setRun(r)
    setStage('drive')
    setCollected([])
    setChallenge(null)
  }

  // ---------- Khung viết ----------

  const openChallenge = (c: Challenge) => {
    setChallenge(c)
    setPos(0)
    setRetry(false)
    setWatchKey((k) => k + 1)
    setWPhase(c.watch ? 'watch' : 'trace')
    playLine(lang, c.watch ? 'write-watch' : 'write-trace')
  }

  const onWatched = () => {
    setWPhase('trace')
    playLine(lang, 'write-trace')
  }

  const onWritten = () => {
    if (!challenge) return
    setWPhase('done')
    setRetry(false)
    playLine(lang, 'common-great')
    const last = pos + 1 >= challenge.items.length
    window.setTimeout(
      () => {
        if (!last) {
          // Sang chữ tiếp theo của từ.
          setPos(pos + 1)
          setWatchKey((k) => k + 1)
          setWPhase(challenge.watch ? 'watch' : 'trace')
          if (challenge.watch) playLine(lang, 'write-watch')
          return
        }
        setChallenge(null)
        const scene = gameRef.current?.scene()
        if (challenge.target === 'letter') scene?.solveLetter()
        else if (challenge.target === 'rescue') scene?.rescue()
        else scene?.passGate()
      },
      last ? 1000 : 700,
    )
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

  // ---------- Sự kiện từ cảnh Phaser (giữ trong ref để cảnh luôn gọi bản mới nhất) ----------

  const onEvent = useRef<(e: ForestEvent) => void>(() => {})
  const handleEvent = (e: ForestEvent) => {
    switch (e.type) {
      case 'meet':
        setStage('meet')
        break
      case 'meetRescue':
        setStage('rescue')
        break
      case 'challenge':
        if (e.target === 'letter') openChallenge({ target: 'letter', items: [run.items[e.index]], picture: null, watch: true })
        else if (e.target === 'rescue') openChallenge({ target: 'rescue', items: run.toolItems, picture: run.rescue?.emoji ?? null, watch: true })
        else openChallenge({ target: 'gate', items: run.items, picture: run.picture, watch: false })
        break
      case 'collected': {
        const next = [...collected, e.index]
        setCollected(next)
        setStage(next.length >= run.items.length ? 'gate' : 'drive')
        break
      }
      case 'rescued':
        setStage('rescued')
        playLine(lang, 'common-great')
        break
      case 'atGate':
        setStage('atGate')
        break
      case 'stageDone': {
        const next = run.stage + 1
        if (next >= STAGE_COUNT) {
          saveValue(stageKey(id, run.mode), 0)
          session.finish()
        } else {
          saveValue(stageKey(id, run.mode), next)
          startRun(makeRun(run.mode, level, lang, next, run))
        }
        break
      }
    }
  }
  useLayoutEffect(() => {
    onEvent.current = handleEvent
  })

  const config = useCallback(
    (r: Run): ForestConfig => ({ items: r.items, rescue: r.rescue, time: TIMES[r.stage], onEvent: (e) => onEvent.current(e) }),
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

  // Đổi ngôn ngữ khi đang chơi chữ: từ cần viết đổi theo, chơi lại màn đang ở.
  if (mode === 'letters' && run.lang !== lang) startRun(makeRun(mode, level, lang, run.stage, null))

  // Bản dev: script kiểm thử mở thẳng một màn với tình huống cứu chỉ định: window.__forestRun(màn, 'tree').
  useEffect(() => {
    if (!import.meta.env.DEV) return
    ;(window as unknown as { __forestRun?: unknown }).__forestRun = (stage: number, kind: string) => {
      const r = makeRun('letters', level, lang, stage, null)
      const rescue = RESCUES.find((x) => x.kind === kind) ?? null
      startRun({ ...r, rescue, toolItems: rescue ? toItems(rescue.tool[lang], lang) : [] })
    }
  })

  // Màn mới thì dựng lại cảnh Phaser (màn đầu đã dựng khi tạo game).
  useEffect(() => {
    if (run !== firstRun.current) gameRef.current?.restart(config(run))
  }, [run, config])

  const changeMode = (m: Mode) => {
    if (m === mode) return
    setMode(m)
    saveValue(`forest-mode-${id}`, m)
    startRun(makeRun(m, level, lang, Math.min(loadValue<number>(stageKey(id, m), 0), STAGE_COUNT - 1), null))
  }

  const changeLevel = (lv: Level) => {
    if (lv === level) return
    setLevel(lv)
    startRun(makeRun(mode, lv, lang, run.stage, null))
  }

  // ---------- Câu nhắc ----------

  const numbers = mode === 'numbers'
  const item = challenge ? challenge.items[pos] : null
  const toolWord = run.rescue?.tool[lang] ?? ''
  const traceText =
    challenge?.target === 'gate'
      ? numbers
        ? t.forest.writeNumbers
        : t.forest.writeWord
      : challenge?.target === 'rescue'
        ? t.forest.writeTool.replace('{word}', toolWord)
        : t.writing.trace
  const text = challenge
    ? wPhase === 'watch'
      ? t.writing.watch
      : wPhase === 'done'
        ? t.common.great
        : retry
          ? `${t.common.retry} ${traceText}`
          : traceText
    : {
        drive: numbers ? t.forest.driveNumbers : t.forest.drive,
        meet: t.forest.meet,
        rescue: run.rescue?.text[lang] ?? t.forest.meet,
        rescued: t.forest.rescued,
        gate: t.forest.gate,
        atGate: t.forest.atGate,
      }[stage]

  const replay = () => {
    if (!challenge) return
    playLine(lang, wPhase === 'watch' ? 'write-watch' : wPhase === 'trace' ? 'write-trace' : 'common-great')
  }

  const time = TIMES[run.stage]
  const frame = runFrame(run.items)
  const cFrame = challenge ? runFrame(challenge.items) : frame

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

        <div className="fr-hud">
          <span className="fr-stage">
            <span aria-hidden="true">{time.icon}</span> {t.forest.stage.replace('{n}', String(run.stage + 1))}/{STAGE_COUNT}
          </span>
          <div className="fr-found" aria-label={t.forest.found}>
            {run.items.map((_, i) => {
              const got = collected[i]
              return (
                <span key={i} className={got === undefined ? 'fr-slot' : 'fr-slot on'}>
                  {got !== undefined && <MiniGlyph item={run.items[got]} frame={frame} />}
                </span>
              )
            })}
          </div>
        </div>

        {challenge && item && (
          <div className="fr-challenge" role="dialog" aria-label={challenge.items.map((i) => i.char).join('')}>
            <div className="fr-card">
              {(challenge.items.length > 1 || challenge.picture) && (
                <div className="fr-word">
                  {challenge.picture && (
                    <span className="fr-picture" aria-hidden="true">
                      {challenge.picture}
                    </span>
                  )}
                  {challenge.items.map((it, i) => (
                    <span key={i} className={`fr-slot big${i < pos || (i === pos && wPhase === 'done') ? ' on' : ''}${i === pos ? ' now' : ''}`}>
                      {(i < pos || (i === pos && wPhase === 'done')) && <MiniGlyph item={it} frame={cFrame} />}
                    </span>
                  ))}
                </div>
              )}
              <Writer
                key={`${challenge.target}:${pos}:${item.glyph.id}:${watchKey}`}
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
            startRun(makeRun(mode, level, lang, 0, null))
          }}
          onExit={onExit}
        />
      )}
    </div>
  )
}
