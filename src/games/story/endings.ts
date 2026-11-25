// Các kết thúc bé đã khám phá (lưu trên máy).

import { loadValue, saveValue } from '../../lib/storage'
import { ENDINGS, type NodeId } from './story'

const KEY = 'story-park-endings'

export function foundEndings(): NodeId[] {
  return loadValue<NodeId[]>(KEY, []).filter((id) => ENDINGS.includes(id))
}

export function addEnding(id: NodeId): void {
  const found = foundEndings()
  if (!found.includes(id)) saveValue(KEY, [...found, id])
}

/** Chữ hiện trên ô truyện ở màn hình chính, ví dụ "📖 2/4". */
export function endingsBadge(): string | null {
  const n = foundEndings().length
  return n > 0 ? `📖 ${n}/${ENDINGS.length}` : null
}
