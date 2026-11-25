// Các nước trong trò "Lái xe tìm cờ". Hình cờ: Kenney Flag Pack (CC0),
// file public/assets/kenney/flag-pack/<code>.svg (hình cách điệu, không giống y hệt cờ thật).

import type { Lang } from '../../i18n/strings'

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

// Cặp cờ dễ nhầm với bé nhỏ: không cho xuất hiện cùng một lượt.
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

// Chọn `count` lá cờ khác nhau và một đáp án, tránh lặp đáp án của lượt trước.
export function makeRound(count: number, previousTarget?: string): Round {
  const options: Country[] = []
  for (const c of shuffle(COUNTRIES)) {
    if (options.some((o) => clash(o.code, c.code))) continue
    options.push(c)
    if (options.length === count) break
  }
  const candidates = options.filter((o) => o.code !== previousTarget)
  const target = candidates[Math.floor(Math.random() * candidates.length)]
  return { options, target }
}

export const flagSrc = (code: string) => `/assets/kenney/flag-pack/${code}.svg`
