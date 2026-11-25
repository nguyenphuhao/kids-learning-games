import { STORY_ART } from './art'
import type { StoryData } from './data'

/** Bìa truyện: cảnh mở đầu với lựa chọn mặc định. */
export function StoryCover({ story }: { story: StoryData }) {
  const { Scene } = STORY_ART[story.id]
  return (
    <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <g clipPath="url(#k-frame)">
        <Scene scene="start" flavor={story.defaultFlavor} />
      </g>
    </svg>
  )
}
