// Các kết thúc bé đã khám phá trong từng truyện (lưu trên máy).

import { loadValue, saveValue } from '../lib/storage'
import { endingIds, type StoryData } from './data'

const key = (s: StoryData) => `story-${s.id}-endings`

export function foundEndings(s: StoryData): string[] {
  const all = endingIds(s)
  return loadValue<string[]>(key(s), []).filter((id) => all.includes(id))
}

export function addEnding(s: StoryData, id: string): void {
  const found = foundEndings(s)
  if (!found.includes(id)) saveValue(key(s), [...found, id])
}

/** Chữ hiện trên bìa truyện, ví dụ "📖 2/4". */
export function endingsBadge(s: StoryData): string | null {
  const n = foundEndings(s).length
  return n > 0 ? `📖 ${n}/${endingIds(s).length}` : null
}
