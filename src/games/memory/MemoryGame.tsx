// Trò "Lật thẻ tìm cặp": các thẻ úp, bé lật hai thẻ một lần; hai thẻ cùng con vật thì giữ ngửa,
// khác nhau thì úp lại. Lật thẻ nào giọng đọc tên con vật đó. Tìm hết các cặp được một sao.
// Dễ: 3 cặp (6 thẻ). Vừa: 4 cặp (8 thẻ). Khó: 6 cặp (12 thẻ).
//
// Âm thanh: memory-intro, animal-<id>, common-great, common-finish.

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { playLine } from '../../audio/audio'
import { sfxChime, sfxPop } from '../../audio/sfx'
import { useLanguage } from '../../i18n/useLanguage'
import { GameTop } from '../shared/GameTop'
import { FinishScreen, StarBar } from '../shared/Rewards'
import { useSession, type GameProps } from '../shared/session'
import { useLevel, type Level } from '../shared/useLevel'
import { CELEBRATE_MS, shuffle } from '../shared/util'
import { ANIMALS, animalImage, type Animal } from './animals'
import './memory.css'

type Card = { id: number; animal: Animal }

const PAIRS: Record<Level, number> = { easy: 3, medium: 4, hard: 6 }

/** Số cột × số hàng khi vùng chơi nằm ngang / nằm dọc. */
const GRID: Record<Level, { land: [number, number]; port: [number, number] }> = {
  easy: { land: [3, 2], port: [2, 3] },
  medium: { land: [4, 2], port: [2, 4] },
  hard: { land: [4, 3], port: [3, 4] },
}

/** Thời gian hai thẻ khác nhau còn ngửa trước khi úp lại. */
const MISMATCH_MS = 1200

function makeBoard(level: Level, previous: Animal[] = []): Card[] {
  // Ưu tiên con vật chưa có ở bàn trước để mỗi bàn một khác.
  const fresh = shuffle(ANIMALS.filter((a) => !previous.includes(a)))
  const rest = shuffle(ANIMALS.filter((a) => previous.includes(a)))
  const animals = [...fresh, ...rest].slice(0, PAIRS[level])
  return shuffle([...animals, ...animals]).map((animal, id) => ({ id, animal }))
}

export function MemoryGame({ id, onExit }: GameProps) {
  const session = useSession(id)
  const { lang, t } = useLanguage()
  const [level, setLevel] = useLevel('memory')
  const [cards, setCards] = useState(() => makeBoard(level))
  const [open, setOpen] = useState<number[]>([]) // thẻ đang ngửa chờ so (tối đa 2)
  const [matched, setMatched] = useState<Set<number>>(() => new Set())
  const [justMatched, setJustMatched] = useState<number[]>([])
  const [won, setWon] = useState(false)
  const [board, setBoard] = useState(0) // đổi bàn thì dựng lại thẻ, không chạy hiệu ứng úp
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => {
    playLine(lang, 'memory-intro')
  }, [cards, lang])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const newBoard = (lv: Level) => {
    window.clearTimeout(timer.current)
    setCards((c) => makeBoard(lv, c.map((x) => x.animal)))
    setBoard((b) => b + 1)
    setOpen([])
    setMatched(new Set())
    setJustMatched([])
    setWon(false)
  }

  const flip = (card: Card) => {
    if (won || open.length >= 2 || open.includes(card.id) || matched.has(card.id)) return
    playLine(lang, `animal-${card.animal}`)
    if (open.length === 0) {
      sfxPop()
      setOpen([card.id])
      return
    }
    const first = cards.find((c) => c.id === open[0])!
    const pair = [first.id, card.id]
    if (first.animal !== card.animal) {
      // Khác nhau: để bé nhìn một lúc rồi úp lại.
      sfxPop()
      setOpen(pair)
      timer.current = window.setTimeout(() => setOpen([]), MISMATCH_MS)
      return
    }
    sfxChime()
    const next = new Set(matched)
    pair.forEach((i) => next.add(i))
    setMatched(next)
    setJustMatched(pair)
    setOpen([])
    if (next.size < cards.length) return
    // Tìm hết các cặp.
    setWon(true)
    timer.current = window.setTimeout(() => {
      playLine(lang, 'common-great')
      const done = session.win()
      timer.current = window.setTimeout(() => (done ? session.finish() : newBoard(level)), CELEBRATE_MS)
    }, 700)
  }

  const changeLevel = (lv: Level) => {
    if (lv === level || won) return
    setLevel(lv)
    session.restart()
    newBoard(lv)
  }

  const grid = GRID[level]
  const style = {
    '--cols-land': grid.land[0],
    '--rows-land': grid.land[1],
    '--cols-port': grid.port[0],
    '--rows-port': grid.port[1],
  } as CSSProperties

  return (
    <div className="g-game">
      <GameTop
        text={won ? t.common.great : t.memory.intro}
        onReplay={() => playLine(lang, won ? 'common-great' : 'memory-intro')}
        level={level}
        onLevel={changeLevel}
      />
      <StarBar stars={session.stars} />
      <div className="g-scene memory-scene">
        <div className="memory-grid" style={style}>
          {cards.map((card) => {
            const faceUp = open.includes(card.id) || matched.has(card.id)
            const cls = [
              'memory-card',
              faceUp ? 'up' : '',
              matched.has(card.id) ? 'matched' : '',
              justMatched.includes(card.id) ? 'g-bounce' : '',
            ].join(' ')
            return (
              <button
                key={`${board}-${card.id}`}
                type="button"
                className={cls}
                onClick={() => flip(card)}
                aria-label={faceUp ? t.memory.names[card.animal] : t.memory.card}
              >
                <span className="memory-inner">
                  <span className="memory-face memory-back" aria-hidden="true" />
                  <span className="memory-face memory-front" aria-hidden="true">
                    <img src={animalImage(card.animal)} alt="" draggable={false} />
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      </div>
      {session.finished && (
        <FinishScreen
          onReplay={() => {
            session.restart()
            newBoard(level)
          }}
          onExit={onExit}
        />
      )}
    </div>
  )
}
