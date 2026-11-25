// Nội dung truyện "Bố và Bin đi xe điện trong công viên" (sáng tác riêng cho app).
// Mỗi đoạn có lời đọc (public/audio/<lang>/story-<audio>.mp3) và chữ hiện trên màn hình.
// 3 lần chọn: màu xe → đường đi → cách giúp đỡ; 4 kết thúc, kết nào cũng có hậu.

import type { Lang } from '../../i18n/strings'
import type { CarColor, IconId, SceneId } from './art'

type Text = Record<Lang, string>

export type Choice = { label: Text; icon: IconId; next: NodeId; car?: CarColor }

export type StoryNode = {
  audio: string
  scene: SceneId
  text: Text
  choices?: [Choice, Choice]
  ending?: true
}

export type NodeId = 'start' | 'fork' | 'lake' | 'garden' | 'end-duck' | 'end-turtle' | 'end-squirrel' | 'end-lift'

export const STORY: Record<NodeId, StoryNode> = {
  start: {
    audio: 'start',
    scene: 'start',
    text: {
      vi: 'Sáng nay trời thật đẹp. Bố và bé Bin đi chơi công viên bằng xe điện. Bé chọn xe màu đỏ, hay xe màu xanh?',
      en: "It's a sunny morning. Dad and little Bin are going to the park in a tiny electric car. Which car do you pick, the red one or the blue one?",
    },
    choices: [
      { label: { vi: 'Xe đỏ', en: 'Red car' }, icon: 'car-red', next: 'fork', car: 'red' },
      { label: { vi: 'Xe xanh', en: 'Blue car' }, icon: 'car-blue', next: 'fork', car: 'blue' },
    ],
  },
  fork: {
    audio: 'fork',
    scene: 'fork',
    text: {
      vi: 'Xe chạy bon bon tới ngã ba. Đi đường bên hồ nước, hay đường qua vườn hoa?',
      en: 'Zoom, zoom! The car reaches a fork in the path. Should they drive by the lake, or through the flower garden?',
    },
    choices: [
      { label: { vi: 'Hồ nước', en: 'The lake' }, icon: 'lake', next: 'lake' },
      { label: { vi: 'Vườn hoa', en: 'The garden' }, icon: 'garden', next: 'garden' },
    ],
  },
  lake: {
    audio: 'lake',
    scene: 'lake',
    text: {
      vi: 'Bên hồ, một chú vịt con đang khóc vì lạc mẹ. Bố và Bin chở vịt con đi tìm mẹ, hay hỏi bác Rùa giúp đỡ?',
      en: 'By the lake, a little duckling is crying. It has lost its mommy! Should Dad and Bin drive the duckling around to look, or ask Grandpa Turtle for help?',
    },
    choices: [
      { label: { vi: 'Chở vịt con', en: 'Drive the duckling' }, icon: 'duckling', next: 'end-duck' },
      { label: { vi: 'Hỏi bác Rùa', en: 'Ask Grandpa Turtle' }, icon: 'turtle', next: 'end-turtle' },
    ],
  },
  garden: {
    audio: 'garden',
    scene: 'garden',
    text: {
      vi: 'Trong vườn hoa, gió thổi bay chiếc mũ của Bin lên cành cây cao! Nhờ bạn Sóc leo lên lấy, hay bố nâng Bin lên thật cao?',
      en: "In the flower garden, the wind blows Bin's hat up into a tall tree! Should they ask the squirrel to fetch it, or should Dad lift Bin up high?",
    },
    choices: [
      { label: { vi: 'Nhờ bạn Sóc', en: 'Ask the squirrel' }, icon: 'squirrel', next: 'end-squirrel' },
      { label: { vi: 'Bố nâng Bin', en: 'Dad lifts Bin' }, icon: 'lift', next: 'end-lift' },
    ],
  },
  'end-duck': {
    audio: 'end-duck',
    scene: 'duck',
    ending: true,
    text: {
      vi: 'Xe chạy một vòng quanh hồ. Kìa, vịt mẹ ở đằng kia! Vịt con vui quá, kêu cạp cạp cảm ơn bố và Bin.',
      en: "They drive all around the lake. Look, there's Mommy Duck! The duckling is so happy. Quack, quack! Thank you, Dad and Bin!",
    },
  },
  'end-turtle': {
    audio: 'end-turtle',
    scene: 'turtle',
    ending: true,
    text: {
      vi: 'Bác Rùa chậm rãi chỉ đường ra đảo nhỏ giữa hồ. Cả nhà vịt đang đợi ở đó, ôm vịt con thật chặt.',
      en: 'Grandpa Turtle slowly points to a little island in the lake. The whole duck family is waiting there, and they give the duckling a big hug.',
    },
  },
  'end-squirrel': {
    audio: 'end-squirrel',
    scene: 'squirrel',
    ending: true,
    text: {
      vi: 'Bạn Sóc nhanh nhẹn leo lên cây, mang mũ xuống cho Bin. Bin tặng Sóc một hạt dẻ để cảm ơn.',
      en: 'The quick little squirrel scurries up the tree and brings the hat back down. Bin gives the squirrel a nut to say thank you.',
    },
  },
  'end-lift': {
    audio: 'end-lift',
    scene: 'lift',
    ending: true,
    text: {
      vi: 'Bố nâng Bin lên thật cao. Bin lấy được mũ, lại còn nhìn thấy cầu vồng trên vườn hoa nữa!',
      en: "Dad lifts Bin up, up, up! Bin grabs the hat, and look, there's a rainbow over the garden!",
    },
  },
}

export const OUTRO: Text = {
  vi: 'Rồi bố và Bin lái xe điện về nhà, hẹn ngày mai lại đi chơi. Hết truyện!',
  en: 'Then Dad and Bin drive home in their little car. See you tomorrow, park! The end.',
}

export const ENDINGS = (Object.keys(STORY) as NodeId[]).filter((id) => STORY[id].ending)
