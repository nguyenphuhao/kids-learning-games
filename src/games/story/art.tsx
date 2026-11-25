// Hình minh hoạ cho truyện "Ba và Henry đi xe điện trong công viên". Vẽ bằng SVG, khung 320x200.

import type { ReactNode } from 'react'

export type CarColor = 'red' | 'blue'
export type SceneId = 'start' | 'fork' | 'lake' | 'garden' | 'duck' | 'turtle' | 'squirrel' | 'lift'
export type IconId = 'car-red' | 'car-blue' | 'lake' | 'garden' | 'duckling' | 'turtle' | 'squirrel' | 'lift'

const CAR_FILL: Record<CarColor, string> = { red: '#e53935', blue: '#1e88e5' }
const SKIN = '#ffcc99'

function Sky({ children }: { children?: ReactNode }) {
  return (
    <>
      <rect width="320" height="200" fill="#b3e5fc" />
      <circle cx="285" cy="32" r="18" fill="#ffd54f" />
      <ellipse cx="60" cy="34" rx="26" ry="9" fill="#fff" />
      <ellipse cx="190" cy="24" rx="20" ry="7" fill="#fff" />
      <rect y="130" width="320" height="70" fill="#9ccc65" />
      {children}
    </>
  )
}

function Tree({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-5" y="-10" width="10" height="40" fill="#8d6e63" />
      <circle cx="0" cy="-24" r="24" fill="#66bb6a" />
      <circle cx="-16" cy="-12" r="14" fill="#66bb6a" />
      <circle cx="16" cy="-12" r="14" fill="#66bb6a" />
    </g>
  )
}

function Flower({ x, y, c }: { x: number; y: number; c: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-1" y="0" width="2" height="12" fill="#558b2f" />
      {[0, 72, 144, 216, 288].map((a) => (
        <circle key={a} cx={5 * Math.cos((a * Math.PI) / 180)} cy={5 * Math.sin((a * Math.PI) / 180)} r="4" fill={c} />
      ))}
      <circle r="3" fill="#ffeb3b" />
    </g>
  )
}

function Head({ x, y, r, hair }: { x: number; y: number; r: number; hair: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={SKIN} />
      <path d={`M${x - r} ${y - 2} A${r} ${r} 0 0 1 ${x + r} ${y - 2} Q${x} ${y - r * 0.4} ${x - r} ${y - 2} Z`} fill={hair} />
      <circle cx={x - r * 0.35} cy={y + 1} r={r * 0.12} fill="#3e2723" />
      <circle cx={x + r * 0.35} cy={y + 1} r={r * 0.12} fill="#3e2723" />
      <path d={`M${x - r * 0.3} ${y + r * 0.4} Q${x} ${y + r * 0.65} ${x + r * 0.3} ${y + r * 0.4}`} stroke="#3e2723" strokeWidth="1.5" fill="none" />
    </g>
  )
}

/** Xe điện nhỏ, ba ngồi lái, Henry ngồi bên cạnh. (x, y) là điểm giữa đáy xe. */
export function Car({ x, y, color, s = 1, hat = true }: { x: number; y: number; color: CarColor; s?: number; hat?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <Head x={-14} y={-46} r={12} hair="#4e342e" />
      <Head x={14} y={-38} r={9} hair="#6d4c41" />
      {hat && <path d="M4 -44 Q14 -56 24 -44 Z" fill="#ffb300" />}
      <rect x="-44" y="-30" width="88" height="22" rx="10" fill={CAR_FILL[color]} />
      <rect x="-30" y="-36" width="4" height="10" fill="#90a4ae" />
      <circle cx="-26" cy="-6" r="9" fill="#37474f" />
      <circle cx="26" cy="-6" r="9" fill="#37474f" />
      <circle cx="-26" cy="-6" r="3" fill="#cfd8dc" />
      <circle cx="26" cy="-6" r="3" fill="#cfd8dc" />
      <circle cx="40" cy="-22" r="3" fill="#fff59d" />
    </g>
  )
}

function Duck({ x, y, s = 1, tear = false }: { x: number; y: number; s?: number; tear?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="0" rx="14" ry="10" fill="#ffeb3b" />
      <circle cx="10" cy="-10" r="7" fill="#ffeb3b" />
      <path d="M16 -11 L23 -9 L16 -7 Z" fill="#fb8c00" />
      <circle cx="11" cy="-12" r="1.4" fill="#3e2723" />
      {tear && <path d="M10 -8 q-2 4 0 6 q2 -2 0 -6 Z" fill="#4fc3f7" />}
    </g>
  )
}

function Turtle({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx="20" cy="-4" r="6" fill="#8bc34a" />
      <circle cx="22" cy="-6" r="1.2" fill="#3e2723" />
      <ellipse cx="-12" cy="3" rx="5" ry="3" fill="#8bc34a" />
      <ellipse cx="10" cy="3" rx="5" ry="3" fill="#8bc34a" />
      <path d="M-18 0 A16 12 0 0 1 16 0 Z" fill="#558b2f" />
      <path d="M-8 -4 L0 -9 L8 -4" stroke="#33691e" strokeWidth="1.5" fill="none" />
    </g>
  )
}

function Squirrel({ x, y, s = 1, hat = false }: { x: number; y: number; s?: number; hat?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-6 6 C-26 0 -24 -26 -8 -22 C-14 -14 -12 -4 -2 0 Z" fill="#a1887f" />
      <ellipse cx="2" cy="2" rx="8" ry="10" fill="#8d6e63" />
      <circle cx="6" cy="-10" r="6" fill="#8d6e63" />
      <path d="M3 -15 L5 -20 L8 -15 Z" fill="#8d6e63" />
      <circle cx="8" cy="-11" r="1.2" fill="#3e2723" />
      {hat && <path d="M-2 4 Q8 -8 18 4 Z" fill="#ffb300" />}
    </g>
  )
}

function Rainbow() {
  const colors = ['#e53935', '#fb8c00', '#fdd835', '#43a047', '#1e88e5', '#8e24aa']
  return (
    <g opacity="0.85">
      {colors.map((c, i) => (
        <path key={c} d={`M${40 + i * 6} 130 A${120 - i * 6} ${100 - i * 6} 0 0 1 ${280 - i * 6} 130`} stroke={c} strokeWidth="6" fill="none" />
      ))}
    </g>
  )
}

const Lake = () => <ellipse cx="200" cy="155" rx="110" ry="30" fill="#4fc3f7" />

export function Scene({ id, color }: { id: SceneId; color: CarColor }) {
  switch (id) {
    case 'start':
      return (
        <Sky>
          <Tree x={45} y={120} />
          <Tree x={275} y={122} s={0.9} />
          <rect x="120" y="70" width="8" height="70" fill="#795548" />
          <rect x="192" y="70" width="8" height="70" fill="#795548" />
          <rect x="112" y="62" width="96" height="18" rx="6" fill="#ff7043" />
          <Car x={160} y={180} color={color} s={1.1} />
        </Sky>
      )
    case 'fork':
      return (
        <Sky>
          {/* Ngã ba: nhánh trái ra hồ, nhánh phải vào vườn hoa */}
          <ellipse cx="62" cy="132" rx="56" ry="16" fill="#4fc3f7" />
          <path d="M40 130 q7 -5 14 0 t14 0 t14 0" stroke="#fff" strokeWidth="2.5" fill="none" />
          {[220, 245, 270, 295, 232, 282].map((fx, i) => (
            <Flower key={fx} x={fx} y={i < 4 ? 124 : 140} c={['#ec407a', '#ab47bc', '#ff7043'][i % 3]} />
          ))}
          <path d="M160 205 L160 160 L95 136 M160 160 L230 136" stroke="#bdbdbd" strokeWidth="26" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M160 200 L160 162 M152 152 L105 136 M168 152 L220 136" stroke="#fff" strokeWidth="2.5" strokeDasharray="8 8" fill="none" />
          <Car x={160} y={198} color={color} s={0.8} />
        </Sky>
      )
    case 'lake':
      return (
        <Sky>
          <Lake />
          <Duck x={230} y={140} tear s={1.3} />
          <Turtle x={280} y={175} />
          <Car x={90} y={185} color={color} />
        </Sky>
      )
    case 'garden':
      return (
        <Sky>
          <Tree x={240} y={125} s={1.4} />
          <path d="M222 54 Q240 30 258 54 Z" fill="#ffb300" stroke="#fff" strokeWidth="3" />
          <path d="M218 54 L262 54" stroke="#ffb300" strokeWidth="5" strokeLinecap="round" />
          <Squirrel x={200} y={168} />
          {[30, 60, 95, 130, 290, 270].map((fx, i) => (
            <Flower key={fx} x={fx} y={150 + (i % 2) * 18} c={['#ec407a', '#ab47bc', '#ff7043'][i % 3]} />
          ))}
          <Car x={100} y={190} color={color} hat={false} />
        </Sky>
      )
    case 'duck':
      return (
        <Sky>
          <Lake />
          <Duck x={200} y={145} s={1.8} />
          <Duck x={245} y={150} s={1.1} />
          <text x="225" y="115" fontSize="20">💛</text>
          <Car x={90} y={185} color={color} />
        </Sky>
      )
    case 'turtle':
      return (
        <Sky>
          <Lake />
          <ellipse cx="230" cy="150" rx="42" ry="12" fill="#c5e1a5" />
          <Duck x={215} y={140} s={1.6} />
          <Duck x={250} y={143} s={1} />
          <Turtle x={150} y={168} s={1.2} />
          <Car x={65} y={190} color={color} s={0.9} />
        </Sky>
      )
    case 'squirrel':
      return (
        <Sky>
          <Tree x={240} y={125} s={1.4} />
          <Squirrel x={185} y={168} s={1.3} hat />
          <text x="165" y="135" fontSize="16">🌰</text>
          <Car x={95} y={190} color={color} hat={false} />
        </Sky>
      )
    case 'lift':
      return (
        <Sky>
          <Rainbow />
          <Tree x={250} y={125} s={1.3} />
          {/* Ba đứng nâng Henry lên cao */}
          <rect x="146" y="120" width="28" height="48" rx="10" fill="#5c6bc0" />
          <rect x="148" y="166" width="10" height="22" fill="#37474f" />
          <rect x="162" y="166" width="10" height="22" fill="#37474f" />
          <Head x={160} y={108} r={13} hair="#4e342e" />
          <path d="M150 124 L150 74 M170 124 L170 74" stroke={SKIN} strokeWidth="6" strokeLinecap="round" />
          <rect x="149" y="50" width="22" height="26" rx="8" fill="#ffb74d" />
          <Head x={160} y={40} r={10} hair="#6d4c41" />
          <path d="M150 34 Q160 22 170 34 Z" fill="#ffb300" />
          <Car x={70} y={190} color={color} s={0.7} hat={false} />
        </Sky>
      )
  }
}

/** Hình nhỏ trên nút lựa chọn (khung 100x70). */
export function ChoiceIcon({ id }: { id: IconId }) {
  const body = (() => {
    switch (id) {
      case 'car-red':
        return <Car x={50} y={66} color="red" s={0.8} />
      case 'car-blue':
        return <Car x={50} y={66} color="blue" s={0.8} />
      case 'lake':
        return (
          <>
            <ellipse cx="50" cy="45" rx="42" ry="20" fill="#4fc3f7" />
            <path d="M22 45 q7 -6 14 0 t14 0 t14 0 t14 0" stroke="#fff" strokeWidth="3" fill="none" />
          </>
        )
      case 'garden':
        return (
          <>
            <Flower x={30} y={36} c="#ec407a" />
            <Flower x={50} y={28} c="#ab47bc" />
            <Flower x={70} y={36} c="#ff7043" />
            <rect x="10" y="50" width="80" height="10" rx="5" fill="#9ccc65" />
          </>
        )
      case 'duckling':
        return (
          <>
            <Car x={38} y={66} color="red" s={0.55} />
            <Duck x={78} y={44} s={1.2} />
          </>
        )
      case 'turtle':
        return <Turtle x={46} y={46} s={1.6} />
      case 'squirrel':
        return <Squirrel x={50} y={46} s={1.6} />
      case 'lift':
        return (
          <>
            <path d="M50 64 L50 18 M38 30 L50 16 L62 30" stroke="#ff7043" strokeWidth="6" fill="none" strokeLinecap="round" />
            <circle cx="72" cy="22" r="9" fill={SKIN} />
            <path d="M63 18 Q72 8 81 18 Z" fill="#ffb300" />
          </>
        )
    }
  })()
  return (
    <svg viewBox="0 0 100 70" aria-hidden="true">
      {body}
    </svg>
  )
}
