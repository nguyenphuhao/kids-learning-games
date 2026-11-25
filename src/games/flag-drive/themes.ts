// Cảnh nền của trò "Lái xe tìm cờ": mỗi vòng (5 lá cờ) một cảnh, lặp lại sau 7 vòng.

import type { Lang } from '../../i18n/strings'

export type ThemeId = 'meadow' | 'beach' | 'snow' | 'desert' | 'city' | 'autumn' | 'night'

export type Theme = {
  id: ThemeId
  name: Record<Lang, string>
  ground: string
  road: string
  roadEdge: string
  dash: string
}

export const THEMES: Theme[] = [
  { id: 'meadow', name: { vi: 'Đồng cỏ', en: 'Meadow' }, ground: '#9ccc65', road: '#616161', roadEdge: '#4e4e4e', dash: '#fff' },
  { id: 'beach', name: { vi: 'Bãi biển', en: 'Beach' }, ground: '#ffe0a3', road: '#8d8d8d', roadEdge: '#d7b77a', dash: '#fff' },
  { id: 'snow', name: { vi: 'Xứ tuyết', en: 'Snowland' }, ground: '#eef6fc', road: '#78909c', roadEdge: '#b0c4d0', dash: '#fff' },
  { id: 'desert', name: { vi: 'Sa mạc', en: 'Desert' }, ground: '#f2cf86', road: '#a1887f', roadEdge: '#c9a36b', dash: '#fff3e0' },
  { id: 'city', name: { vi: 'Thành phố', en: 'City' }, ground: '#cfd8dc', road: '#455a64', roadEdge: '#90a4ae', dash: '#ffeb3b' },
  { id: 'autumn', name: { vi: 'Rừng thu', en: 'Autumn forest' }, ground: '#c5b358', road: '#6d5f55', roadEdge: '#8d7b4a', dash: '#fff' },
  { id: 'night', name: { vi: 'Đêm trăng', en: 'Moonlit night' }, ground: '#2c4a52', road: '#263238', roadEdge: '#1c2a30', dash: '#fff59d' },
]

/** Cảnh của vòng thứ `round` (bắt đầu từ 1), lặp lại sau 7 vòng. */
export const themeOf = (round: number): Theme => THEMES[(round - 1) % THEMES.length]
