// Chữ hiển thị trên giao diện (dành cho phụ huynh; bé nghe giọng nói là chính).

export type Lang = 'vi' | 'en'

export const LANGS: Lang[] = ['vi', 'en']

export const strings = {
  vi: {
    appTitle: 'Bé học vui',
    back: 'Quay lại',
    comingSoon: 'Trò chơi đang được làm',
    games: {
      counting: 'Đếm đồ vật',
      colors: 'Tìm màu',
      shapes: 'Xếp hình',
      compare: 'Nhiều hay ít',
    },
  },
  en: {
    appTitle: 'Little Learners',
    back: 'Back',
    comingSoon: 'This game is coming soon',
    games: {
      counting: 'Counting',
      colors: 'Find the color',
      shapes: 'Shape match',
      compare: 'More or less',
    },
  },
} as const

export type Strings = (typeof strings)[Lang]
