// Trang xem trước hình vẽ (chỉ có ở bản dev): mở /#art=<storyId>.
// Hiện mọi cảnh (với mọi lựa chọn đầu) và mọi hình nút của truyện, để kiểm tra nét vẽ.

import { ArtDefs } from './art/kit'
import { STORY_ART } from './art'
import { STORY_DATA } from './data'
import './story.css'

export function ArtPreview({ id }: { id: string }) {
  const story = STORY_DATA.find((s) => s.id === id) ?? STORY_DATA[0]
  const art = STORY_ART[story.id]
  const flavors = story.nodes.start.choices!.map((c) => c.flavor!)
  const icons = Object.values(story.nodes).flatMap((n) => n.choices?.map((c) => c.icon) ?? [])
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 320px)', gap: 8, padding: 8 }}>
      <ArtDefs />
      {Object.values(story.nodes).map((n, i) => (
        <figure key={n.scene} style={{ margin: 0 }}>
          <svg viewBox="0 0 320 200" width="320" height="200" style={{ display: 'block', background: story.color }}>
            <art.Scene scene={n.scene} flavor={flavors[i % 2]} />
          </svg>
          <figcaption style={{ font: '12px sans-serif' }}>{n.scene} · {flavors[i % 2]}</figcaption>
        </figure>
      ))}
      <div style={{ gridColumn: '1 / -1', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {icons.map((ic) => (
          <figure key={ic} style={{ margin: 0, background: '#fff', borderRadius: 12 }}>
            <svg viewBox="0 0 100 70" width="150" height="105">
              <art.Icon icon={ic} />
            </svg>
            <figcaption style={{ font: '12px sans-serif', textAlign: 'center' }}>{ic}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  )
}
