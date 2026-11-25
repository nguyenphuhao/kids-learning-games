// Danh sách trò chơi. Thêm trò mới: tạo component rồi khai báo ở đây.

import type { ComponentType, ReactNode } from 'react'
import { ColorsGame } from './colors/ColorsGame'
import { CompareGame } from './compare/CompareGame'
import { CountingGame } from './counting/CountingGame'
import { FlagBuilderGame } from './flag-builder/FlagBuilderGame'
import { FlagDriveGame } from './flag-drive/FlagDriveGame'
import type { GameProps } from './shared/session'
import { ShapesGame } from './shapes/ShapesGame'

export type GameId = 'counting' | 'colors' | 'shapes' | 'compare' | 'flags' | 'builder'

export type GameDef = {
  id: GameId
  color: string
  icon: ReactNode
  component: ComponentType<GameProps>
}

// Biểu tượng vẽ bằng SVG.
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

// Biểu tượng dùng hình Kenney (xe và cờ).
const flagsIcon = (
  <svg viewBox="0 0 100 100" aria-hidden="true">
    <image href="/assets/kenney/flag-pack/VN.svg" x="52" y="10" width="40" height="40" />
    <rect x="50" y="10" width="3" height="60" fill="#5d4037" />
    <image href="/assets/kenney/racing-pack/car_red_1.png" x="18" y="30" width="34" height="63" />
  </svg>
)

// Biểu tượng trò ghép cờ: khung cờ đỏ có ngôi sao đang được ghép vào.
const builderIcon = (
  <svg viewBox="0 0 100 100" aria-hidden="true">
    <rect x="10" y="22" width="66" height="44" fill="#e53935" />
    <rect x="10" y="22" width="66" height="44" fill="none" stroke="#fff" strokeWidth="3" strokeDasharray="6 5" />
    <path d="M74 52 L78 64 L91 64 L81 72 L85 85 L74 77 L63 85 L67 72 L57 64 L70 64 Z" fill="#fdd835" stroke="#fff" strokeWidth="2" />
    <rect x="16" y="74" width="10" height="20" fill="#1e40af" />
    <rect x="30" y="74" width="10" height="20" fill="#fff" stroke="#b0bec5" />
  </svg>
)

export const GAMES: GameDef[] = [
  { id: 'flags', color: '#d1c4e9', icon: flagsIcon, component: FlagDriveGame },
  { id: 'builder', color: '#ffe0b2', icon: builderIcon, component: FlagBuilderGame },
  { id: 'counting', color: '#ffcdd2', icon: countingIcon, component: CountingGame },
  { id: 'colors', color: '#fff9c4', icon: colorsIcon, component: ColorsGame },
  { id: 'shapes', color: '#c8e6c9', icon: shapesIcon, component: ShapesGame },
  { id: 'compare', color: '#bbdefb', icon: compareIcon, component: CompareGame },
]
