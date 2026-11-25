import type { ReactElement } from 'react'

/** Hình vẽ của một truyện: cảnh (khung 320x200) và hình nhỏ trên nút lựa chọn (khung 100x70). */
export type StoryArt = {
  Scene: (props: { scene: string; flavor: string }) => ReactElement
  Icon: (props: { icon: string }) => ReactElement
}
