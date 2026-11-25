// Chữ hiển thị trên giao diện (dành cho phụ huynh; bé nghe giọng nói là chính).

export type Lang = 'vi' | 'en'

export const LANGS: Lang[] = ['vi', 'en']

export const strings = {
  vi: {
    appTitle: 'Bé học vui',
    back: 'Quay lại',
    music: 'Nhạc nền',
    games: {
      counting: 'Đếm đồ vật',
      colors: 'Tìm màu',
      shapes: 'Xếp hình',
      compare: 'Nhiều hay ít',
      flags: 'Lái xe tìm cờ',
      builder: 'Ghép quốc kỳ',
      story: 'Truyện: Bố và Bin đi công viên',
    },
    flagDrive: {
      find: 'Lấy cờ {name}!',
      retry: 'Thử lại nhé!',
      great: 'Giỏi quá!',
    },
    common: {
      great: 'Giỏi quá!',
      retry: 'Thử lại nhé!',
      replay: 'Nghe lại',
      level: 'Mức chơi',
      easy: 'Dễ',
      medium: 'Vừa',
      hard: 'Khó',
      finish: 'Hoàn thành rồi! Bé giỏi quá!',
      playAgain: 'Chơi lại',
      home: 'Trang chủ',
      trophies: 'Số cúp',
    },
    flagBuilder: {
      build: 'Bé ghép cờ {name} nhé!',
      model: 'Mẫu',
    },
    counting: {
      intro: 'Bé chạm vào từng quả táo để đếm nhé!',
      ask: 'Có bao nhiêu quả táo?',
    },
    colors: {
      find: 'Chạm vào quả bóng màu {color}!',
      names: {
        red: 'đỏ',
        blue: 'xanh dương',
        yellow: 'vàng',
        green: 'xanh lá',
        orange: 'cam',
        purple: 'tím',
      },
    },
    shapes: {
      intro: 'Bé kéo các hình vào đúng chỗ nhé!',
      names: {
        circle: 'Hình tròn',
        square: 'Hình vuông',
        triangle: 'Hình tam giác',
        star: 'Ngôi sao',
      },
    },
    compare: {
      more: 'Giỏ nào có nhiều hơn?',
      less: 'Giỏ nào có ít hơn?',
    },
  },
  en: {
    appTitle: 'Little Learners',
    back: 'Back',
    music: 'Background music',
    games: {
      counting: 'Counting',
      colors: 'Find the color',
      shapes: 'Shape match',
      compare: 'More or less',
      flags: 'Flag drive',
      builder: 'Build a flag',
      story: 'Story: Park ride with Dad',
    },
    flagDrive: {
      find: 'Find the flag of {name}!',
      retry: 'Try again!',
      great: 'Great job!',
    },
    common: {
      great: 'Great job!',
      retry: 'Try again!',
      replay: 'Listen again',
      level: 'Level',
      easy: 'Easy',
      medium: 'Medium',
      hard: 'Hard',
      finish: 'All done! You did it!',
      playAgain: 'Play again',
      home: 'Home',
      trophies: 'Trophies',
    },
    flagBuilder: {
      build: "Let's build the flag of {name}!",
      model: 'Example',
    },
    counting: {
      intro: 'Tap each apple to count them!',
      ask: 'How many apples are there?',
    },
    colors: {
      find: 'Tap the {color} balloon!',
      names: {
        red: 'red',
        blue: 'blue',
        yellow: 'yellow',
        green: 'green',
        orange: 'orange',
        purple: 'purple',
      },
    },
    shapes: {
      intro: 'Drag each shape to its place!',
      names: {
        circle: 'Circle',
        square: 'Square',
        triangle: 'Triangle',
        star: 'Star',
      },
    },
    compare: {
      more: 'Which basket has more?',
      less: 'Which basket has fewer?',
    },
  },
} as const

export type Strings = (typeof strings)[Lang]
