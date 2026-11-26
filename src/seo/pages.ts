// Đường link và nội dung SEO cho từng trang (trang chủ, mỗi trò chơi, mỗi truyện).
// Dùng ở cả app (đổi URL, tiêu đề, nút chia sẻ) lẫn lúc build (vite.config.ts tạo sẵn
// file HTML cho từng trang để Google, Facebook, Zalo đọc được tiêu đề và mô tả).
// File này không được import component hay CSS, vì vite.config.ts cũng đọc nó.

import type { GameId } from '../games/registry'
import { strings, type Lang } from '../i18n/strings'
import { STORY_DATA } from '../stories/data'

/** Tên miền chính thức (Vercel). Đổi ở đây nếu gắn tên miền riêng. */
export const SITE_URL = 'https://kids-learning-games-ten.vercel.app'

export const SITE_NAME = 'Bé học vui · Little Learners'

export const SITE_DESCRIPTION = 'Game học tập và truyện tương tác miễn phí cho bé 2–5 tuổi, tiếng Việt và tiếng Anh.'

/** Ảnh hiện khi dán link lên mạng xã hội (1200×630). */
export const OG_IMAGE = '/og-image.png'

/** Mô tả ngắn từng trò (theo bảng trò chơi trong README). */
const GAME_DESCRIPTIONS: Record<GameId, Record<Lang, string>> = {
  flags: {
    vi: 'Bé lái xe theo đường tới đúng lá cờ, làm quen cờ của 100 nước.',
    en: 'Drive the car to the right flag and learn the flags of 100 countries.',
  },
  builder: {
    vi: 'Bé ghép các mảnh vào khung để hoàn thành quốc kỳ, như tranh xếp hình.',
    en: 'Put the pieces together to build a country flag, like a jigsaw puzzle.',
  },
  counting: {
    vi: 'Bé chạm từng quả táo để đếm, rồi chọn đúng số.',
    en: 'Tap each apple to count, then pick the right number.',
  },
  colors: {
    vi: 'Bé chạm vào quả bóng đúng màu để học tên các màu.',
    en: 'Tap the balloon with the right color and learn color names.',
  },
  shapes: {
    vi: 'Bé kéo hình tròn, vuông, tam giác, ngôi sao vào đúng chỗ.',
    en: 'Drag circles, squares, triangles and stars to their places.',
  },
  compare: {
    vi: 'Bé chọn giỏ có nhiều hơn hoặc ít hơn.',
    en: 'Pick the basket with more, or with fewer.',
  },
  tracing: {
    vi: 'Bé đưa ngón tay theo đường chấm, tập các nét thẳng, cong trước khi viết.',
    en: 'Follow the dotted path with a finger to practise straight and curved lines.',
  },
  letters: {
    vi: 'Bé xem cách viết từng nét rồi tô theo chữ cái, theo mẫu chữ lớp 1.',
    en: 'Watch each stroke, then trace the letters with a finger.',
  },
  numbers: {
    vi: 'Bé xem cách viết từng nét rồi tô theo các số từ 0 đến 9.',
    en: 'Watch each stroke, then trace the numbers 0 to 9.',
  },
}

/** Mọi trò chơi (Record<GameId> bắt buộc khai báo đủ mô tả cho trò mới). */
export const GAME_IDS = Object.keys(GAME_DESCRIPTIONS) as GameId[]

const SUFFIX: Record<Lang, string> = {
  vi: 'Miễn phí cho bé 2–5 tuổi, có giọng đọc tiếng Việt và tiếng Anh.',
  en: 'Free for kids aged 2–5, with Vietnamese and English voice.',
}

export type Page = { kind: 'game'; id: GameId } | { kind: 'story'; id: string } | null

export function pagePath(page: Page): string {
  if (!page) return '/'
  return page.kind === 'game' ? `/games/${page.id}` : `/stories/${page.id}`
}

/** Đọc trang từ đường dẫn; đường dẫn lạ thì về trang chủ. */
export function pageFromPath(path: string): Page {
  const m = /^\/(games|stories)\/([\w-]+)\/?$/.exec(path)
  if (!m) return null
  if (m[1] === 'games') {
    const id = GAME_IDS.find((g) => g === m[2])
    return id ? { kind: 'game', id } : null
  }
  const story = STORY_DATA.find((s) => s.id === m[2])
  return story ? { kind: 'story', id: story.id } : null
}

export function pageUrl(page: Page): string {
  return SITE_URL + pagePath(page)
}

export function pageMeta(page: Page, lang: Lang): { title: string; description: string } {
  if (!page) return { title: SITE_NAME, description: SITE_DESCRIPTION }
  const app = strings[lang].appTitle
  if (page.kind === 'game') {
    return {
      title: `${strings[lang].games[page.id]} · ${app}`,
      description: `${GAME_DESCRIPTIONS[page.id][lang]} ${SUFFIX[lang]}`,
    }
  }
  const story = STORY_DATA.find((s) => s.id === page.id)!
  const intro = lang === 'vi' ? 'Truyện tương tác, bé chọn hướng đi cho câu chuyện.' : 'An interactive story where kids choose what happens next.'
  return { title: `${story.title[lang]} · ${app}`, description: `${intro} ${SUFFIX[lang]}` }
}

/** Mọi trang có link riêng (dùng để tạo HTML và sitemap lúc build). */
export function allPages(): Page[] {
  return [null, ...GAME_IDS.map((id) => ({ kind: 'game' as const, id })), ...STORY_DATA.map((s) => ({ kind: 'story' as const, id: s.id }))]
}
