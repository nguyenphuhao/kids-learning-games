// Danh sách trò chơi. Thêm trò mới: tạo component rồi khai báo ở đây.

import type { ComponentType, ReactNode } from 'react'
import { GamePlaceholder } from './GamePlaceholder'

export type GameId = 'counting' | 'colors' | 'shapes' | 'compare'

export type GameDef = {
  id: GameId
  color: string
  icon: ReactNode
  component: ComponentType
}

// Biểu tượng tạm vẽ bằng SVG; sẽ thay bằng hình Kenney nếu có hình phù hợp.
const countingIcon = (
  <svg viewBox="0 0 100 100" aria-hidden="true">
    <circle cx="30" cy="55" r="16" fill="#e53935" />
    <circle cx="70" cy="55" r="16" fill="#e53935" />
    <circle cx="50" cy="30" r="16" fill="#e53935" />
  </svg>
)

const colorsIcon = (
  <svg viewBox="0 0 100 100" aria-hidden="true">
    <circle cx="30" cy="35" r="15" fill="#e53935" />
    <circle cx="70" cy="35" r="15" fill="#1e88e5" />
    <circle cx="50" cy="70" r="15" fill="#fdd835" />
  </svg>
)

const shapesIcon = (
  <svg viewBox="0 0 100 100" aria-hidden="true">
    <rect x="12" y="55" width="30" height="30" rx="4" fill="#1e88e5" />
    <circle cx="72" cy="70" r="16" fill="#43a047" />
    <polygon points="50,12 68,44 32,44" fill="#fb8c00" />
  </svg>
)

const compareIcon = (
  <svg viewBox="0 0 100 100" aria-hidden="true">
    <rect x="8" y="60" width="38" height="28" rx="6" fill="#8d6e63" />
    <rect x="54" y="60" width="38" height="28" rx="6" fill="#8d6e63" />
    <circle cx="20" cy="52" r="7" fill="#fdd835" />
    <circle cx="34" cy="52" r="7" fill="#fdd835" />
    <circle cx="27" cy="40" r="7" fill="#fdd835" />
    <circle cx="73" cy="52" r="7" fill="#fdd835" />
  </svg>
)

export const GAMES: GameDef[] = [
  { id: 'counting', color: '#ffcdd2', icon: countingIcon, component: GamePlaceholder },
  { id: 'colors', color: '#fff9c4', icon: colorsIcon, component: GamePlaceholder },
  { id: 'shapes', color: '#c8e6c9', icon: shapesIcon, component: GamePlaceholder },
  { id: 'compare', color: '#bbdefb', icon: compareIcon, component: GamePlaceholder },
]
