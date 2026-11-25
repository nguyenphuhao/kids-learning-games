// Một lượt chơi gồm ROUNDS câu. Mỗi câu đúng được một ngôi sao; đủ sao thì hiện màn hình
// hoàn thành (cúp, sao, pháo giấy, lời khen) và cộng một cúp cho trò đó (lưu trên máy).

import { useState } from 'react'
import { playLine } from '../../audio/audio'
import { useLanguage } from '../../i18n/useLanguage'
import { loadValue, saveValue } from '../../lib/storage'

export const ROUNDS = 5

export type GameProps = { id: string; onExit: () => void }

export function trophyCount(id: string): number {
  return loadValue<number>(`trophies-${id}`, 0)
}

export function useSession(id: string) {
  const { lang } = useLanguage()
  const [stars, setStars] = useState(0)
  const [finished, setFinished] = useState(false)

  /** Ghi nhận một câu đúng (thêm một sao). Trả về true nếu đây là câu cuối của lượt. */
  const win = (): boolean => {
    const next = stars + 1
    setStars(next)
    return next >= ROUNDS
  }

  /** Hiện màn hình hoàn thành, đọc lời khen và cộng một cúp. */
  const finish = () => {
    setFinished(true)
    saveValue(`trophies-${id}`, trophyCount(id) + 1)
    playLine(lang, 'common-finish')
  }

  const restart = () => {
    setStars(0)
    setFinished(false)
  }

  return { stars, finished, win, finish, restart }
}
