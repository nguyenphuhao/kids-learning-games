import { useState } from 'react'
import { loadValue, saveValue } from '../../lib/storage'

export type Level = 'easy' | 'hard'

/** Mức dễ/khó của một trò, lưu trên máy theo `key`. */
export function useLevel(key: string): [Level, (level: Level) => void] {
  const [level, setLevel] = useState<Level>(() => loadValue<Level>(`level-${key}`, 'easy'))
  const update = (next: Level) => {
    setLevel(next)
    saveValue(`level-${key}`, next)
  }
  return [level, update]
}
