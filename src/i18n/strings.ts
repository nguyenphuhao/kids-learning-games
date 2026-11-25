// Chữ hiển thị trên giao diện (dành cho phụ huynh; bé nghe giọng nói là chính).

export type Lang = 'vi' | 'en'

export const LANGS: Lang[] = ['vi', 'en']

export const strings = {
  vi: {
    appTitle: 'Bé học vui',
    back: 'Quay lại',
    music: 'Nhạc nền',
    comingSoon: 'Trò chơi đang được làm',
    games: {
      counting: 'Đếm đồ vật',
      colors: 'Tìm màu',
      shapes: 'Xếp hình',
      compare: 'Nhiều hay ít',
      flags: 'Lái xe tìm cờ',
    },
    flagDrive: {
      find: 'Lấy cờ {name}!',
      retry: 'Thử lại nhé!',
      great: 'Giỏi quá!',
      replay: 'Nghe lại',
      choices: 'Số lá cờ',
    },
  },
  en: {
    appTitle: 'Little Learners',
    back: 'Back',
    music: 'Background music',
    comingSoon: 'This game is coming soon',
    games: {
      counting: 'Counting',
      colors: 'Find the color',
      shapes: 'Shape match',
      compare: 'More or less',
      flags: 'Flag drive',
    },
    flagDrive: {
      find: 'Find the flag of {name}!',
      retry: 'Try again!',
      great: 'Great job!',
      replay: 'Listen again',
      choices: 'Number of flags',
    },
  },
} as const

export type Strings = (typeof strings)[Lang]
