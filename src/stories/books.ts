// Truyện kể thẳng (không có lựa chọn): lật trang ← / →, mỗi trang một tranh và một đoạn lời đọc.
// Hiện chỉ có tiếng Việt, nên chỉ hiện ở tab Truyện khi bé chọn tiếng Việt.
// Lời đọc: public/audio/vi/story-<id>-p<số trang>.mp3 (trang 0 là bìa).
// File này không được import component hay CSS, vì src/seo/pages.ts (và vite.config.ts) cũng đọc nó.

export type BookParagraph = {
  text: string
  /** Lời nhân vật nói (in nghiêng, màu khác). */
  say?: true
}

export type BookPage = {
  /** Cảnh, do file vẽ của truyện xử lý. */
  scene: string
  /** Mô tả tranh cho trình đọc màn hình. */
  label: string
  /** `{car}` được thay bằng tên màu xe bé chọn ở nút 🎨. */
  paragraphs: BookParagraph[]
}

export type BookData = {
  id: string
  title: string
  color: string
  description: string
  pages: BookPage[]
}

const p = (text: string): BookParagraph => ({ text })
const say = (text: string): BookParagraph => ({ text, say: true })

export const HENRY_CAR: BookData = {
  id: 'henry-car',
  title: 'Chiếc xe đèn nhấp nháy của Henry',
  color: '#c5cae9',
  description: 'Truyện kể trước giờ đi ngủ: Henry và ba lái chiếc xe điện đèn nhấp nháy dưới bầu trời đêm. Có giọng đọc tiếng Việt, miễn phí cho bé 2–5 tuổi.',
  pages: [
    { scene: 'cover', label: 'Bìa truyện', paragraphs: [] },
    {
      scene: 'lot',
      label: 'Bãi đất sáng đèn ban đêm',
      paragraphs: [
        p('Ngày xửa ngày xưa, à không, mới tối hôm nọ thôi, có một cậu bé tên là Henry mặc chiếc áo in đầy hoa và trái cây nhỏ xíu.'),
        p('Tối hôm đó trời tối đen như mực, nhưng ở một bãi đất rộng ơi là rộng, đèn sáng trưng như mặt trăng rơi xuống đất. Ở đó có rất nhiều chiếc xe điện nhỏ, chiếc nào cũng nhấp nháy đèn xanh, đèn đỏ, đèn tím. Lấp la lấp lánh!'),
      ],
    },
    {
      scene: 'squeeze',
      label: 'Ba ngồi chật trên xe nhỏ',
      paragraphs: [
        p('Henry chọn một chiếc xe màu {car}. Ba Henry cũng muốn chơi, nên ba ngồi phía sau.'),
        p('Nhưng ba to quá, xe thì bé xíu, nên ba phải co chân lên cao, gối chạm tới tai luôn! Henry nhìn ba cười khúc khích.'),
      ],
    },
    {
      scene: 'zoom',
      label: 'Xe chạy brừm brừm',
      paragraphs: [
        p('Henry nắm chặt tay lái và nói:'),
        say('"Ba ơi, con lái nha! Ba ngồi yên nha!"'),
        p('Brừm brừm… xe chạy! Gió thổi tóc Henry dựng đứng như lông nhím. Henry cười to. Ba cũng cười to. Tiếng cười vang khắp bãi đất.'),
      ],
    },
    {
      scene: 'bus',
      label: 'Chú xe buýt đang ngủ',
      paragraphs: [
        p('Bỗng nhiên, phía trước có một chú xe buýt màu trắng to đùng đang ngủ. Henry la lên:'),
        say('"Ba ơi, xe buýt kìa!"'),
        p('Henry quẹo tay lái thật khéo, vòng qua chú xe buýt. Xe buýt vẫn ngủ ngon lành, không hề hay biết có một tay đua tí hon vừa chạy ngang qua.'),
      ],
    },
    {
      scene: 'wave',
      label: 'Henry vẫy tay chào các bạn',
      paragraphs: [
        p('Henry chạy một vòng, rồi hai vòng, rồi ba vòng. Có các bạn nhỏ khác cũng lái xe đèn nhấp nháy, và Henry vẫy tay chào các bạn.'),
        p('Những cái bóng của Henry và ba in trên mặt đất, chạy theo hai ba con, dài thật là dài.'),
      ],
    },
    {
      scene: 'slow',
      label: 'Xe chạy chậm lại, đèn chớp chậm dần',
      paragraphs: [
        p('Chạy một hồi, chiếc xe nhỏ bắt đầu chậm lại, đèn chớp từ từ, từ từ, giống như xe cũng buồn ngủ rồi.'),
        p('Ba ôm Henry và nói:'),
        say('"Tay lái giỏi nhất của ba ơi, mình về ngủ thôi."'),
      ],
    },
    {
      scene: 'sleep',
      label: 'Henry ngủ trong vòng tay ba',
      paragraphs: [
        p('Henry ngáp một cái thật to. Henry nghĩ về những ánh đèn lấp lánh, về chú xe buýt đang ngủ, về tiếng cười của ba.'),
        p('Và giờ đây, cũng như chiếc xe nhỏ kia, Henry cũng tắt đèn, nhắm mắt lại…'),
        say('Chúc Henry ngủ ngon nha. Mai mình lại đi chơi tiếp.'),
      ],
    },
  ],
}

export const BOOKS: BookData[] = [HENRY_CAR]

export const bookAudioKey = (b: BookData, page: number) => `story-${b.id}-p${page}`
