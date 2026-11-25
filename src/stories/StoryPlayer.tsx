// Trình đọc truyện tương tác, dùng chung cho mọi truyện trong data.ts.
// Mỗi đoạn: hình minh hoạ, lời đọc và chữ. Ở đoạn có lựa chọn, bé chạm vào một trong hai hình
// để quyết định diễn biến. Tới kết thúc: đọc đoạn kết, rồi "Hết truyện", rồi màn hình cúp.

import { useEffect, useState } from 'react'
import { playLine } from '../audio/audio'
import { FinishScreen } from '../games/shared/Rewards'
import { useSession } from '../games/shared/session'
import { useLanguage } from '../i18n/useLanguage'
import { STORY_ART } from './art'
import { endingIds, type Choice, type StoryData } from './data'
import { addEnding, foundEndings } from './endings'
import '../games/shared/game.css'
import './story.css'

export function StoryPlayer({ story, onExit }: { story: StoryData; onExit: () => void }) {
  const { lang, t } = useLanguage()
  const session = useSession(`story-${story.id}`)
  const art = STORY_ART[story.id]
  const [nodeId, setNodeId] = useState('start')
  const [flavor, setFlavor] = useState(story.defaultFlavor)
  const [outro, setOutro] = useState(false)
  const [found, setFound] = useState(() => foundEndings(story).length)
  const node = story.nodes[nodeId]
  const total = endingIds(story).length

  // Đọc đoạn truyện. Nếu là kết thúc: đọc xong thì đọc đoạn kết chung, rồi hiện màn hình cúp.
  const read = () => {
    playLine(lang, `story-${story.id}-${node.audio}`, () => {
      if (!node.ending) return
      setOutro(true)
      playLine(lang, `story-${story.id}-outro`, () => {
        addEnding(story, nodeId)
        setFound(foundEndings(story).length)
        session.finish()
      })
    })
  }

  // Sang đoạn mới (hoặc đổi ngôn ngữ) thì đọc đoạn đó.
  const audioKey = `${lang}/${story.id}/${node.audio}`
  const [readKey, setReadKey] = useState('')
  if (readKey !== audioKey) {
    setReadKey(audioKey)
    setOutro(false)
  }
  useEffect(() => {
    read()
  }, [audioKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const choose = (c: Choice) => {
    if (c.flavor) setFlavor(c.flavor)
    setNodeId(c.next)
  }

  const restart = () => {
    session.restart()
    setNodeId('start')
  }

  return (
    <div className="g-game story">
      <div className="story-scene" key={nodeId} style={{ background: story.color }}>
        <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid meet" role="img" aria-label={node.text[lang]}>
          <g clipPath="url(#k-frame)">
            <art.Scene scene={node.scene} flavor={flavor} />
          </g>
        </svg>
      </div>

      <button
        type="button"
        className="story-text"
        onClick={() => {
          setOutro(false)
          read()
        }}
        aria-label={t.common.replay}
      >
        <span className="g-speaker" aria-hidden="true">🔊</span>
        <span>
          {node.text[lang]}
          {outro && <strong className="story-outro"> {story.outro[lang]}</strong>}
        </span>
      </button>

      {node.choices && (
        <div className="story-choices">
          {node.choices.map((c) => (
            <button key={c.label.en} type="button" className="story-choice" onClick={() => choose(c)}>
              <svg viewBox="0 0 100 70" aria-hidden="true">
                <art.Icon icon={c.icon} />
              </svg>
              <span>{c.label[lang]}</span>
            </button>
          ))}
        </div>
      )}

      {node.ending && (
        <p className="story-found">
          📖 {found}/{total}
        </p>
      )}

      {session.finished && <FinishScreen onReplay={restart} onExit={onExit} />}
    </div>
  )
}
