// Truyện tương tác "Bố và Bin đi xe điện trong công viên".
// Mỗi đoạn: hình minh hoạ, lời đọc và chữ. Ở đoạn có lựa chọn, bé chạm vào một trong hai hình
// để quyết định diễn biến. Tới kết thúc: đọc đoạn kết, rồi "Hết truyện", rồi màn hình cúp.

import { useEffect, useState } from 'react'
import { playLine } from '../../audio/audio'
import { useLanguage } from '../../i18n/useLanguage'
import { FinishScreen } from '../shared/Rewards'
import { useSession, type GameProps } from '../shared/session'
import { ChoiceIcon, Scene, type CarColor } from './art'
import { addEnding, foundEndings } from './endings'
import { ENDINGS, OUTRO, STORY, type Choice, type NodeId } from './story'
import '../shared/game.css'
import './story.css'

export function StoryGame({ id, onExit }: GameProps) {
  const { lang, t } = useLanguage()
  const session = useSession(id)
  const [nodeId, setNodeId] = useState<NodeId>('start')
  const [car, setCar] = useState<CarColor>('red')
  const [outro, setOutro] = useState(false)
  const [found, setFound] = useState(() => foundEndings().length)
  const node = STORY[nodeId]

  // Đọc đoạn truyện. Nếu là kết thúc: đọc xong thì đọc "Hết truyện", rồi hiện màn hình cúp.
  const read = () => {
    playLine(lang, `story-${node.audio}`, () => {
      if (!node.ending) return
      setOutro(true)
      playLine(lang, 'story-outro', () => {
        addEnding(nodeId)
        setFound(foundEndings().length)
        session.finish()
      })
    })
  }

  // Sang đoạn mới (hoặc đổi ngôn ngữ) thì đọc đoạn đó.
  const audioKey = `${lang}/${node.audio}`
  const [readKey, setReadKey] = useState('')
  if (readKey !== audioKey) {
    setReadKey(audioKey)
    setOutro(false)
  }
  useEffect(() => {
    read()
  }, [audioKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const choose = (c: Choice) => {
    if (c.car) setCar(c.car)
    setNodeId(c.next)
  }

  const restart = () => {
    session.restart()
    setNodeId('start')
  }

  return (
    <div className="g-game story">
      <div className="story-scene">
        <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid meet" role="img" aria-label={node.text[lang]}>
          <Scene id={node.scene} color={car} />
        </svg>
      </div>

      <button type="button" className="story-text" onClick={() => {
          setOutro(false)
          read()
        }}
        aria-label={t.common.replay}>
        <span className="g-speaker" aria-hidden="true">🔊</span>
        <span>
          {node.text[lang]}
          {outro && <strong className="story-outro"> {OUTRO[lang]}</strong>}
        </span>
      </button>

      {node.choices && (
        <div className="story-choices">
          {node.choices.map((c) => (
            <button key={c.label.en} type="button" className="story-choice" onClick={() => choose(c)}>
              <ChoiceIcon id={c.icon} />
              <span>{c.label[lang]}</span>
            </button>
          ))}
        </div>
      )}

      {node.ending && (
        <p className="story-found">
          📖 {found}/{ENDINGS.length}
        </p>
      )}

      {session.finished && <FinishScreen onReplay={restart} onExit={onExit} />}
    </div>
  )
}
