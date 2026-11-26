// Trò "Tập viết chữ" và "Tập viết số".
// Bé chọn một chữ trong bảng (chữ thường / chữ hoa, hoặc số 0–9), xem hoạt ảnh viết từng nét
// theo thứ tự, rồi tự viết theo bằng ngón tay / bút; từng nét được chấm, sai thì viết lại (Writer.tsx).
// Chữ đã viết xong có dấu sao trên bảng (lưu trên máy).
// Mức chơi: chỉ Dễ và Khó, cả hai đều có chữ mẫu nét đứt; Dễ cho lệch nhiều, Khó cho lệch ít.
// Mỗi chữ viết xong được một sao; đủ 5 sao thì được một cúp.
//
// Âm thanh: write-pick-letter / write-pick-number, write-watch, write-trace, common-great, common-retry.

import { useEffect, useRef, useState } from 'react'
import { playLine } from '../../audio/audio'
import { useLanguage } from '../../i18n/useLanguage'
import { loadValue, saveValue } from '../../lib/storage'
import { GameTop } from '../shared/GameTop'
import { FinishScreen, StarBar } from '../shared/Rewards'
import { useSession, type GameProps } from '../shared/session'
import { useLevel, type Level } from '../shared/useLevel'
import { CELEBRATE_MS } from '../shared/util'
import { ALPHABET, glyphBox, NUMBERS, type Glyph, type GlyphKind } from './glyphs'
import { Writer, type Phase } from './Writer'
import './writing.css'

type Mode = 'letters' | 'numbers'

const WRITING_LEVELS: Level[] = ['easy', 'hard']

function useDone(key: string): [Set<string>, (id: string) => void] {
  const [done, setDone] = useState(() => new Set(loadValue<string[]>(key, [])))
  const add = (id: string) => {
    const next = new Set(done).add(id)
    setDone(next)
    saveValue(key, [...next])
  }
  return [done, add]
}

/** Hình chữ nhỏ trên ô của bảng chữ. */
function Mini({ g, kind }: { g: Glyph; kind: GlyphKind }) {
  const b = glyphBox(g, kind, kind === 'upper' ? 0 : 50)
  return (
    <svg viewBox={`${b.x} ${b.y} ${b.w} ${b.h}`} aria-hidden="true">
      <line x1={b.x} x2={b.x + b.w} y1="0" y2="0" stroke="#c5d6ee" strokeWidth="1" />
      {g.strokes.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="#37474f" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </svg>
  )
}

export function WritingGame({ id, onExit, mode }: GameProps & { mode: Mode }) {
  const session = useSession(id)
  const { lang, t } = useLanguage()
  // Trò tập viết chỉ có Dễ và Khó; ai đã lưu mức Vừa (bản cũ) thì tính là Dễ.
  const [savedLevel, setLevel] = useLevel(id)
  const level: Level = savedLevel === 'medium' ? 'easy' : savedLevel
  const [tab, setTab] = useState<'lower' | 'upper'>(() => loadValue(`write-tab-${id}`, 'lower'))
  const kind: GlyphKind = mode === 'numbers' ? 'number' : tab
  const list = mode === 'numbers' ? NUMBERS : ALPHABET[lang][tab]
  const [done, addDone] = useDone(`write-done-${id}`)
  // Chữ đang viết, kèm ngôn ngữ lúc chọn: đổi ngôn ngữ thì bảng chữ đổi theo nên quay về bảng.
  const [picked, setPicked] = useState<{ lang: string; i: number } | null>(null)
  const index = picked && picked.lang === lang ? picked.i : null
  const setIndex = (i: number | null) => setPicked(i === null ? null : { lang, i })
  const [phase, setPhase] = useState<Phase>('watch')
  const [watchKey, setWatchKey] = useState(0)
  const [retry, setRetry] = useState(false)
  const lastRetry = useRef(0)
  const glyph = index === null ? null : list[index]
  const pickKey = mode === 'numbers' ? 'write-pick-number' : 'write-pick-letter'

  useEffect(() => {
    if (index === null) playLine(lang, pickKey)
  }, [index, lang, pickKey])

  const open = (i: number) => {
    setIndex(i)
    setPhase('watch')
    setRetry(false)
    setWatchKey((k) => k + 1)
    playLine(lang, 'write-watch')
  }

  const watchAgain = () => {
    setPhase('watch')
    setRetry(false)
    setWatchKey((k) => k + 1)
    playLine(lang, 'write-watch')
  }

  const onWatched = () => {
    setPhase('trace')
    playLine(lang, 'write-trace')
  }

  const onDone = () => {
    if (!glyph) return
    setPhase('done')
    setRetry(false)
    addDone(`${kind}:${glyph.id}`)
    playLine(lang, 'common-great')
    if (session.win()) window.setTimeout(() => session.finish(), CELEBRATE_MS)
  }

  const onMiss = () => {
    const now = Date.now()
    if (now - lastRetry.current < 2500) return
    lastRetry.current = now
    setRetry(true)
    playLine(lang, 'common-retry')
  }

  const changeTab = (next: 'lower' | 'upper') => {
    setTab(next)
    saveValue(`write-tab-${id}`, next)
  }

  const changeLevel = (lv: Level) => {
    if (lv === level) return
    setLevel(lv)
    if (glyph && phase !== 'watch') {
      setPhase('trace')
      setWatchKey((k) => k + 1)
    }
  }

  const pickText = mode === 'numbers' ? t.writing.pickNumber : t.writing.pickLetter
  const text =
    glyph === null
      ? pickText
      : phase === 'watch'
        ? t.writing.watch
        : phase === 'done'
          ? t.common.great
          : retry
            ? `${t.common.retry} ${t.writing.trace}`
            : t.writing.trace

  const replay = () => {
    if (glyph === null) playLine(lang, pickKey)
    else if (phase === 'watch') playLine(lang, 'write-watch')
    else if (phase === 'trace') playLine(lang, 'write-trace')
    else playLine(lang, 'common-great')
  }

  return (
    <div className="g-game w-game">
      <GameTop text={text} onReplay={replay} level={level} onLevel={changeLevel} levels={WRITING_LEVELS} />
      {/* Điện thoại xoay ngang: nội dung bên trái, sao và nút xếp dọc bên phải (xem writing.css). */}
      <div className="w-main">
        <div className="w-starbar">
          <StarBar stars={session.stars} />
        </div>

        {glyph === null ? (
          <>
            {mode === 'letters' && (
              <div className="w-tabs" role="tablist">
                {(['lower', 'upper'] as const).map((k) => (
                  <button key={k} type="button" role="tab" aria-selected={tab === k} className={tab === k ? 'active' : ''} onClick={() => changeTab(k)}>
                    {k === 'lower' ? 'a b c' : 'A B C'} <small>{t.writing[k]}</small>
                  </button>
                ))}
              </div>
            )}
            <div className={`w-board${mode === 'numbers' ? ' numbers' : ''}`}>
              {list.map((g, i) => (
                <button key={g.id} type="button" className="w-tile" onClick={() => open(i)} aria-label={g.char}>
                  <Mini g={g} kind={kind} />
                  {done.has(`${kind}:${g.id}`) && <span className="w-star" aria-hidden="true">★</span>}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <Writer
              key={`${kind}:${glyph.id}:${watchKey}`}
              glyph={glyph}
              kind={kind}
              level={level}
              phase={phase}
              onWatched={onWatched}
              onDone={onDone}
              onMiss={onMiss}
            />
            <div className="w-actions">
              <button type="button" onClick={() => setIndex(null)} aria-label={t.writing.board}>
                <span aria-hidden="true">▦</span>
              </button>
              <button type="button" onClick={watchAgain} aria-label={t.writing.watchAgain} disabled={phase === 'watch'}>
                <span aria-hidden="true">👀</span>
              </button>
              <button
                type="button"
                className={phase === 'done' ? 'w-next' : ''}
                onClick={() => open((index! + 1) % list.length)}
                aria-label={t.writing.next}
              >
                <span aria-hidden="true">▶</span>
              </button>
            </div>
          </>
        )}
      </div>

      {session.finished && (
        <FinishScreen
          onReplay={() => {
            session.restart()
            setIndex(null)
          }}
          onExit={onExit}
        />
      )}
    </div>
  )
}

export const LettersGame = (p: GameProps) => <WritingGame {...p} mode="letters" />
export const NumbersGame = (p: GameProps) => <WritingGame {...p} mode="numbers" />
