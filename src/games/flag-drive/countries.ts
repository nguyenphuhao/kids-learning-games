// Các nước trong trò "Lái xe tìm cờ". Hình cờ: Kenney Flag Pack (CC0),
// file public/assets/kenney/flag-pack/<code>.svg (hình cách điệu, không giống y hệt cờ thật).

import type { Lang } from '../../i18n/strings'
import type { Level } from '../shared/useLevel'

export type Country = { code: string; name: Record<Lang, string> }

export const COUNTRIES: Country[] = [
  { code: 'VN', name: { vi: 'Việt Nam', en: 'Vietnam' } },
  { code: 'US', name: { vi: 'Mỹ', en: 'the United States' } },
  { code: 'GB', name: { vi: 'Anh', en: 'the United Kingdom' } },
  { code: 'JP', name: { vi: 'Nhật Bản', en: 'Japan' } },
  { code: 'KR', name: { vi: 'Hàn Quốc', en: 'South Korea' } },
  { code: 'CN', name: { vi: 'Trung Quốc', en: 'China' } },
  { code: 'FR', name: { vi: 'Pháp', en: 'France' } },
  { code: 'DE', name: { vi: 'Đức', en: 'Germany' } },
  { code: 'IT', name: { vi: 'Ý', en: 'Italy' } },
  { code: 'BR', name: { vi: 'Brazil', en: 'Brazil' } },
  { code: 'CA', name: { vi: 'Canada', en: 'Canada' } },
  { code: 'AU', name: { vi: 'Úc', en: 'Australia' } },
  { code: 'TH', name: { vi: 'Thái Lan', en: 'Thailand' } },
  { code: 'IN', name: { vi: 'Ấn Độ', en: 'India' } },
]

// Cờ quen thuộc, khác nhau rõ ràng, dùng cho mức Dễ.
const EASY = ['VN', 'US', 'JP', 'KR', 'FR', 'BR']

// Cặp cờ dễ nhầm: mức Dễ/Vừa không cho xuất hiện cùng lượt; mức Khó cố ý đặt cạnh nhau.
const LOOKALIKES: [string, string][] = [
  ['VN', 'CN'],
  ['GB', 'AU'],
]

function clash(a: string, b: string): boolean {
  return LOOKALIKES.some(([x, y]) => (a === x && b === y) || (a === y && b === x))
}

function shuffle<T>(list: T[]): T[] {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export type Round = { options: Country[]; target: Country }

// Dễ: 2 cờ trong 6 nước quen thuộc. Vừa: 3 cờ trong 14 nước, không có cặp dễ nhầm.
// Khó: 3 cờ trong 14 nước; nếu đáp án có cờ dễ nhầm thì cờ đó luôn có mặt.
export function makeRound(level: Level, previousTarget?: string): Round {
  const pool = level === 'easy' ? COUNTRIES.filter((c) => EASY.includes(c.code)) : COUNTRIES
  const count = level === 'easy' ? 2 : 3
  const candidates = shuffle(pool.filter((c) => c.code !== previousTarget))
  const target = candidates[0]
  const options: Country[] = [target]
  if (level === 'hard') {
    const twin = COUNTRIES.find((c) => c.code !== target.code && clash(c.code, target.code))
    if (twin) options.push(twin)
  }
  for (const c of shuffle(pool)) {
    if (options.length === count) break
    if (options.includes(c)) continue
    if (level !== 'hard' && options.some((o) => clash(o.code, c.code))) continue
    options.push(c)
  }
  return { options: shuffle(options), target }
}

export const flagSrc = (code: string) => `/assets/kenney/flag-pack/${code}.svg`
