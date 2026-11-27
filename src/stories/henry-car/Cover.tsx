import type { CSSProperties } from 'react'
import { Scene, VIEW_H, VIEW_W } from './art'
import './henryCar.css'

// Màu mặc định (xe đỏ, đêm sao) cho bìa ở trang chủ.
const DEFAULT_VARS = {
  '--hc-car': '#E24B4A',
  '--hc-car2': '#F09595',
  '--hc-sky1': '#0d1030',
  '--hc-sky2': '#2a2f66',
  '--hc-ground': '#D9D4C7',
} as CSSProperties

/** Bìa truyện ở trang chủ. */
export function HenryCarCover() {
  return (
    <svg className="hc-book hc-sky-night" style={DEFAULT_VARS} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <Scene scene="cover" />
    </svg>
  )
}
