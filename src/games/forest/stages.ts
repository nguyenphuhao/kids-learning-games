// 10 màn của trò "Vào rừng tìm chữ": xe đi từ sáng sớm tới tối, mỗi màn qua một cổng rừng.
// Ở chế độ chữ, có màn ngẫu nhiên gặp một bạn thú gặp nạn; bé viết đúng tên công cụ thì cứu được bạn.

import type { Lang } from '../../i18n/strings'

export const STAGE_COUNT = 10

export type TimeOfDay = {
  /** Biểu tượng trên thanh màn chơi. */
  icon: string
  skyTop: number
  skyBottom: number
  /** Nhuộm màu tranh đồi xa. */
  hillsTint: number
  /** Lớp màu phủ lên cả cảnh (ánh nắng chiều, bóng tối…); alpha 0 là không phủ. */
  overlay: number
  overlayAlpha: number
  /** Trời tối: có trăng, sao, đom đóm, xe bật đèn. */
  night: boolean
}

/** Buổi trong ngày của từng màn (màn 1 → 10). */
export const TIMES: TimeOfDay[] = [
  { icon: '🌅', skyTop: 0xffc9a8, skyBottom: 0xfff1dc, hillsTint: 0xfff0e0, overlay: 0xffb36b, overlayAlpha: 0.08, night: false },
  { icon: '🌤️', skyTop: 0x8fd6ff, skyBottom: 0xdff6ff, hillsTint: 0xffffff, overlay: 0, overlayAlpha: 0, night: false },
  { icon: '🌤️', skyTop: 0x7fcfff, skyBottom: 0xd6f3ff, hillsTint: 0xffffff, overlay: 0, overlayAlpha: 0, night: false },
  { icon: '☀️', skyTop: 0x5cc3ff, skyBottom: 0xbfe9ff, hillsTint: 0xffffff, overlay: 0, overlayAlpha: 0, night: false },
  { icon: '☀️', skyTop: 0x5cc3ff, skyBottom: 0xbfe9ff, hillsTint: 0xffffff, overlay: 0xfff3c4, overlayAlpha: 0.05, night: false },
  { icon: '⛅', skyTop: 0x7cc4f0, skyBottom: 0xffe6b3, hillsTint: 0xfff3d6, overlay: 0xffc27a, overlayAlpha: 0.08, night: false },
  { icon: '🌇', skyTop: 0x8ab4e8, skyBottom: 0xffc98a, hillsTint: 0xffe2bf, overlay: 0xff9a4d, overlayAlpha: 0.12, night: false },
  { icon: '🌇', skyTop: 0x6d6fb8, skyBottom: 0xff9466, hillsTint: 0xffc7a8, overlay: 0xff7043, overlayAlpha: 0.18, night: false },
  { icon: '🌙', skyTop: 0x2d3570, skyBottom: 0x7a5a9e, hillsTint: 0x9aa3d6, overlay: 0x1a237e, overlayAlpha: 0.35, night: true },
  { icon: '🌙', skyTop: 0x0d1440, skyBottom: 0x2a3170, hillsTint: 0x7f88c4, overlay: 0x0d1440, overlayAlpha: 0.45, night: true },
]

export type RescueKind = 'tree' | 'hole' | 'fire' | 'log' | 'dark'

export type Rescue = {
  kind: RescueKind
  /** Bạn thú gặp nạn (tên ảnh trong art.ts). */
  animal: 'cat' | 'rabbit' | 'bear' | 'fox' | 'panda'
  /** Tên công cụ bé phải viết. */
  tool: Record<Lang, string>
  /** Hình công cụ (tạm dùng emoji). */
  emoji: string
  /** Câu kể tình huống. */
  text: Record<Lang, string>
  /** Chỉ gặp khi trời tối. */
  nightOnly?: boolean
}

export const RESCUES: Rescue[] = [
  {
    kind: 'tree',
    animal: 'cat',
    tool: { vi: 'thang', en: 'ladder' },
    emoji: '🪜',
    text: { vi: 'Bạn mèo bị kẹt trên cây! Bé viết chữ "thang" để cứu bạn nhé!', en: 'The kitten is stuck up the tree! Write "ladder" to help!' },
  },
  {
    kind: 'hole',
    animal: 'rabbit',
    tool: { vi: 'dây', en: 'rope' },
    emoji: '🪢',
    text: { vi: 'Bạn thỏ bị rơi xuống hố! Bé viết chữ "dây" để kéo bạn lên nhé!', en: 'The bunny fell into a hole! Write "rope" to pull it out!' },
  },
  {
    kind: 'fire',
    animal: 'bear',
    tool: { vi: 'xô', en: 'bucket' },
    emoji: '🪣',
    text: { vi: 'Đống lửa trại cháy to quá! Bé viết chữ "xô" để lấy nước dập lửa nhé!', en: 'The campfire is too big! Write "bucket" to put it out!' },
  },
  {
    kind: 'log',
    animal: 'fox',
    tool: { vi: 'cưa', en: 'saw' },
    emoji: '🪚',
    text: { vi: 'Cây đổ chắn đường bạn cáo! Bé viết chữ "cưa" để cưa khúc gỗ nhé!', en: 'A log is blocking the fox! Write "saw" to cut it!' },
  },
  {
    kind: 'dark',
    animal: 'panda',
    tool: { vi: 'đèn', en: 'lamp' },
    emoji: '🔦',
    text: { vi: 'Bạn gấu trúc bị lạc trong đêm! Bé viết chữ "đèn" để soi đường nhé!', en: 'The panda is lost in the dark! Write "lamp" to light the way!' },
    nightOnly: true,
  },
]

/** Tình huống cứu bạn ngẫu nhiên cho một màn (khoảng một nửa số màn có), hoặc null. */
export function pickRescue(stage: number, last: RescueKind | null): Rescue | null {
  if (stage === 0 || Math.random() < 0.5) return null
  const night = TIMES[stage].night
  const list = RESCUES.filter((r) => (!r.nightOnly || night) && r.kind !== last)
  return list[Math.floor(Math.random() * list.length)] ?? null
}
