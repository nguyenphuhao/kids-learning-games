// Nội dung của trò "Vào rừng tìm chữ": từ cần ghép (kèm hình minh hoạ) và dãy số cần xếp.
//
// Chữ trong từ phải là chữ có nét viết trong writing/glyphs.ts. Bộ nét chưa có dấu thanh
// (sắc, huyền, hỏi, ngã, nặng) nên từ tiếng Việt ở đây đều là từ không có dấu thanh.
// Hình minh hoạ tạm dùng emoji (hiện theo bộ emoji của máy).
// DANH SÁCH TẠM: chờ phụ huynh / người làm game duyệt lại.

import type { Lang } from '../../i18n/strings'

export type Word = { text: string; picture: string }

export const WORDS: Record<Lang, { easy: Word[]; hard: Word[] }> = {
  vi: {
    easy: [
      { text: 'ong', picture: '🐝' },
      { text: 'voi', picture: '🐘' },
      { text: 'cua', picture: '🦀' },
      { text: 'dê', picture: '🐐' },
      { text: 'heo', picture: '🐷' },
      { text: 'nho', picture: '🍇' },
      { text: 'hoa', picture: '🌸' },
      { text: 'sao', picture: '⭐' },
      { text: 'xe', picture: '🚗' },
      { text: 'mưa', picture: '🌧️' },
    ],
    hard: [
      { text: 'chim', picture: '🐦' },
      { text: 'trâu', picture: '🐃' },
      { text: 'hươu', picture: '🦌' },
      { text: 'trăng', picture: '🌙' },
      { text: 'khoai', picture: '🥔' },
    ],
  },
  en: {
    easy: [
      { text: 'cat', picture: '🐱' },
      { text: 'dog', picture: '🐶' },
      { text: 'sun', picture: '☀️' },
      { text: 'bee', picture: '🐝' },
      { text: 'cow', picture: '🐮' },
      { text: 'pig', picture: '🐷' },
      { text: 'hen', picture: '🐔' },
      { text: 'bus', picture: '🚌' },
    ],
    hard: [
      { text: 'fish', picture: '🐟' },
      { text: 'frog', picture: '🐸' },
      { text: 'duck', picture: '🦆' },
      { text: 'star', picture: '⭐' },
      { text: 'cake', picture: '🎂' },
      { text: 'bear', picture: '🐻' },
      { text: 'moon', picture: '🌙' },
    ],
  },
}

/** Dãy số liên tiếp: Dễ 3 số (bắt đầu 0–7), Khó 5 số (bắt đầu 0–5). */
export function numberRun(hard: boolean): string[] {
  const len = hard ? 5 : 3
  const start = Math.floor(Math.random() * (10 - len + 1))
  return Array.from({ length: len }, (_, i) => String(start + i))
}
