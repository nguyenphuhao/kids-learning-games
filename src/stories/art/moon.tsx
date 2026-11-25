// Hình truyện "Chuyến tàu tìm ông Trăng". Lựa chọn đầu: màu tàu (green / purple).

import type { ReactNode } from 'react'
import { Anim, At, Cloud, Dad, GrassTufts, Henry, Hills, Moon, NightSky, Note, Sparkle, type Face } from './kit'

const TRAIN: Record<string, string> = { green: '#43a047', purple: '#8e24aa' }

/** Tàu nhỏ chạy sang phải: đầu tàu phía trước, toa chở ba và Henry phía sau. (x, y) là mặt ray. */
function Train({ x, y, s = 1, color, face = 'smile', arms = 'wave' }: { x: number; y: number; s?: number; color: string; face?: Face; arms?: 'wave' | 'up' | 'down' }) {
  const c = TRAIN[color] ?? color
  return (
    <At x={x} y={y} s={s}>
      {/* Khói */}
      <Anim cls="a-drift">
        <circle cx="54" cy="-58" r="6" fill="#cfd8dc" opacity="0.8" />
        <circle cx="44" cy="-68" r="8" fill="#cfd8dc" opacity="0.6" />
        <circle cx="30" cy="-76" r="10" fill="#cfd8dc" opacity="0.4" />
      </Anim>
      <Anim cls="a-bob">
        {/* Toa */}
        <Dad x={-46} y={-6} s={0.62} shirt="#26a69a" shadow={false} />
        <Henry x={-18} y={-10} s={0.78} shirt="#ffb74d" arms={arms} face={face} shadow={false} />
        <rect x="-68" y="-34" width="68" height="24" rx="5" fill={c} />
        <rect x="-68" y="-34" width="68" height="24" rx="5" fill="url(#k-gloss)" />
        <rect x="-68" y="-34" width="68" height="24" rx="5" fill="url(#k-shade)" />
        <rect x="-70" y="-37" width="72" height="5" rx="2.5" fill="#fdd835" />
        <circle cx="-34" cy="-22" r="4" fill="#fdd835" />
        {/* Đầu tàu */}
        <rect x="10" y="-56" width="24" height="44" rx="4" fill={c} />
        <rect x="14" y="-50" width="16" height="13" rx="3" fill="#fff59d" />
        <rect x="6" y="-60" width="32" height="6" rx="3" fill="#455a64" />
        <rect x="32" y="-36" width="32" height="24" rx="10" fill={c} />
        <rect x="46" y="-50" width="9" height="15" fill="#455a64" />
        <rect x="43" y="-53" width="15" height="5" rx="2" fill="#37474f" />
        <rect x="10" y="-56" width="54" height="44" fill="url(#k-shade)" opacity="0.6" />
        <rect x="32" y="-36" width="32" height="24" rx="10" fill="url(#k-gloss)" />
        <circle cx="64" cy="-26" r="12" fill="url(#k-glow)" />
        <circle cx="63" cy="-26" r="4" fill="#fffde7" />
        <path d="M64 -12 L74 -4 H58 Z" fill="#e53935" />
        <rect x="-2" y="-20" width="14" height="4" fill="#37474f" />
      </Anim>
      {[-56, -12, 20, 46].map((wx) => (
        <g key={wx}>
          <circle cx={wx} cy="-7" r="7.5" fill="#263238" />
          <circle cx={wx} cy="-7" r="4" fill="url(#k-metal)" />
          <circle cx={wx} cy="-7" r="1.4" fill="#e53935" />
        </g>
      ))}
    </At>
  )
}

/** Đường ray theo đường d. */
function Rails({ d }: { d: string }) {
  return (
    <g fill="none">
      <path d={d} stroke="#5d4037" strokeWidth="14" strokeDasharray="3 7" />
      <path d={d} stroke="#90a4ae" strokeWidth="9" opacity="0.9" />
      <path d={d} stroke="#3d2c5e" strokeWidth="5" />
    </g>
  )
}

function Firefly({ x, y, delay = 0, s = 1 }: { x: number; y: number; delay?: number; s?: number }) {
  return (
    <At x={x} y={y} s={s}>
      <Anim cls="a-twinkle" delay={delay}>
        <circle r="9" fill="url(#k-glow)" />
        <circle r="2.2" fill="#fff59d" />
      </Anim>
    </At>
  )
}

const FIELD_FLIES: [number, number][] = [
  [20, 150], [44, 132], [70, 156], [96, 138], [122, 160], [150, 128], [178, 152], [204, 134],
  [232, 158], [258, 140], [286, 154], [306, 132], [60, 118], [140, 112], [220, 116], [290, 110],
]

function Fireflies({ pts = FIELD_FLIES }: { pts?: [number, number][] }) {
  return (
    <g>
      {pts.map(([fx, fy], i) => (
        <Firefly key={`${fx}-${fy}`} x={fx} y={fy} delay={(i % 6) * 0.35} />
      ))}
    </g>
  )
}

function Owl({ x, y, s = 1, point = false }: { x: number; y: number; s?: number; point?: boolean }) {
  return (
    <At x={x} y={y} s={s}>
      <path d="M-30 2 Q0 -4 34 4" stroke="#5d4037" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M-14 -38 L-10 -48 L-4 -40 Z M14 -38 L10 -48 L4 -40 Z" fill="#8d6e63" />
      <ellipse cx="0" cy="-20" rx="15" ry="20" fill="#8d6e63" />
      <ellipse cx="0" cy="-14" rx="10" ry="12" fill="#d7ccc8" />
      <path d="M-5 -16 q2 2 4 0 M1 -10 q2 2 4 0 M-5 -6 q2 2 4 0" stroke="#a1887f" strokeWidth="1.2" fill="none" />
      <ellipse cx="0" cy="-20" rx="15" ry="20" fill="url(#k-ball)" />
      <circle cx="-6" cy="-30" r="6" fill="#fff8e1" />
      <circle cx="6" cy="-30" r="6" fill="#fff8e1" />
      <circle cx="-6" cy="-30" r="3.6" fill="#ffca28" />
      <circle cx="6" cy="-30" r="3.6" fill="#ffca28" />
      <circle cx="-6" cy="-30" r="2" fill="#263238" />
      <circle cx="6" cy="-30" r="2" fill="#263238" />
      <circle cx="-5.2" cy="-31" r="0.8" fill="#fff" />
      <circle cx="6.8" cy="-31" r="0.8" fill="#fff" />
      <path d="M-2 -25 L0 -21 L2 -25 Z" fill="#ff8f00" />
      <path d="M-14 -22 Q-20 -10 -12 0" fill="#6d4c41" />
      {point ? (
        <path d="M13 -24 Q26 -30 36 -40 Q28 -24 14 -14 Z" fill="#6d4c41" />
      ) : (
        <path d="M14 -22 Q20 -10 12 0" fill="#6d4c41" />
      )}
      <path d="M-5 0 v3 M-2 0 v3 M2 0 v3 M5 0 v3" stroke="#ff8f00" strokeWidth="1.4" />
    </At>
  )
}

function Pine({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <At x={x} y={y} s={s}>
      <rect x="-3" y="-10" width="6" height="12" fill="#4e342e" />
      <path d="M0 -50 L-14 -26 H-8 L-18 -8 H18 L8 -26 H14 Z" fill="#1b5e20" />
      <path d="M0 -50 L-14 -26 H-8 L-18 -8 H0 Z" fill="#2e7d32" />
    </At>
  )
}

function Mountain({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <At x={x} y={y} s={s}>
      <path d="M-90 0 L-20 -110 Q0 -126 20 -110 L90 0 Z" fill="url(#k-mountain)" />
      <path d="M-20 -110 Q0 -126 20 -110 L28 -96 Q14 -88 4 -98 Q-8 -86 -26 -100 Z" fill="#ede7f6" />
      <path d="M-20 -110 L-90 0 H-40 Z" fill="#fff" opacity="0.08" />
    </At>
  )
}

/** Vệt gió. */
function Wind({ x, y }: { x: number; y: number }) {
  return (
    <Anim cls="a-drift">
      <path d={`M${x} ${y} h28 q8 0 8 -6 q0 -5 -5 -5 M${x + 6} ${y + 8} h34 q7 0 7 5`} stroke="#c5cae9" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    </Anim>
  )
}

function Base({ children, stars = true }: { children?: ReactNode; stars?: boolean }) {
  return (
    <>
      <NightSky stars={stars} />
      {children}
    </>
  )
}

export function Scene({ scene, flavor }: { scene: string; flavor: string }) {
  switch (scene) {
    case 'start':
      return (
        <Base>
          <Moon x={232} y={48} r={22} mood="sleep" glow={false} />
          <Cloud x={232} y={52} s={1.7} night />
          <Cloud x={70} y={40} s={1} night />
          <Hills y={140} night />
          <Pine x={30} y={150} />
          <Pine x={290} y={152} s={0.9} />
          <Rails d="M-10 172 H330" />
          {/* Đèn ga tàu */}
          <rect x="270" y="110" width="4" height="58" fill="#455a64" />
          <circle cx="272" cy="108" r="14" fill="url(#k-glow-warm)" />
          <rect x="265" y="102" width="14" height="10" rx="3" fill="#ffe082" />
          <Train x={150} y={172} s={1.05} color={flavor} />
        </Base>
      )
    case 'fork':
      return (
        <Base>
          <Moon x={160} y={40} r={14} mood="sleep" glow={false} />
          <Cloud x={160} y={44} s={1.2} night />
          <Mountain x={60} y={150} s={0.7} />
          <Hills y={150} night />
          <path d="M190 150 Q250 138 330 146 V200 H190 Z" fill="#1b4332" />
          <Fireflies pts={[[220, 142], [246, 130], [270, 146], [296, 132], [310, 150], [236, 156], [284, 160]]} />
          <Rails d="M160 210 L160 176 Q160 166 148 160 L80 140" />
          <Rails d="M160 176 Q160 166 172 160 L250 142" />
          <Train x={160} y={196} s={0.62} color={flavor} arms="down" face="open" />
        </Base>
      )
    case 'mountain':
      return (
        <Base>
          <Moon x={250} y={44} r={20} mood="sleep" glow={false} />
          <Cloud x={250} y={48} s={1.6} night />
          <Cloud x={70} y={70} s={1.4} night />
          <Cloud x={180} y={96} s={1} night />
          <Wind x={110} y={50} />
          <path d="M0 200 L0 150 Q90 120 170 132 Q250 142 320 120 V200 Z" fill="url(#k-mountain)" />
          <Pine x={272} y={136} s={1.2} />
          <Owl x={262} y={106} s={0.85} />
          <Rails d="M-10 166 Q100 140 230 150" />
          <Train x={120} y={152} s={0.85} color={flavor} arms="down" face="open" />
        </Base>
      )
    case 'fireflies':
      return (
        <Base>
          <Moon x={250} y={44} r={18} mood="sleep" glow={false} />
          <Cloud x={250} y={48} s={1.5} night />
          <Hills y={120} night />
          <path d="M0 132 Q160 118 320 132 V200 H0 Z" fill="url(#k-grass-night)" />
          <GrassTufts night points={[[20, 180], [60, 192], [260, 184], [300, 194], [200, 196]]} />
          <Fireflies />
          <Rails d="M-10 186 H330" />
          <Train x={150} y={186} s={0.9} color={flavor} arms="up" face="open" />
        </Base>
      )
    case 'end-blow':
      return (
        <Base>
          <Moon x={232} y={58} r={30} />
          <At x={56} y={0}>
            <Cloud x={250} y={50} s={1.2} night />
          </At>
          <Cloud x={40} y={40} s={1} night />
          <Wind x={150} y={88} />
          <Wind x={160} y={112} />
          <Hills y={150} night />
          <Rails d="M-10 182 H330" />
          <Train x={78} y={182} s={0.72} color={flavor} />
          <Dad x={170} y={190} s={0.78} shirt="#26a69a" face="blow" arms="down" />
          <Henry x={204} y={190} s={0.95} shirt="#ffb74d" face="blow" arms="down" />
        </Base>
      )
    case 'end-owl':
      return (
        <Base>
          <Moon x={160} y={56} r={34} />
          <Cloud x={50} y={86} s={1.3} night />
          <Cloud x={290} y={80} s={1.1} night />
          <Hills y={150} night />
          <Pine x={276} y={168} s={1.4} />
          <Owl x={256} y={124} s={0.9} point />
          <Rails d="M-10 178 Q120 160 330 182" />
          <Train x={110} y={174} s={0.82} color={flavor} arms="up" face="open" />
          <Sparkle x={210} y={30} />
          <Sparkle x={110} y={24} delay={0.5} />
        </Base>
      )
    case 'end-song':
      return (
        <Base>
          <Moon x={262} y={42} r={24} />
          <Hills y={140} night />
          <path d="M0 150 Q160 136 320 150 V200 H0 Z" fill="url(#k-grass-night)" />
          {/* Đom đóm xếp thành con đường sáng lên tới ông Trăng */}
          <Fireflies pts={[[96, 150], [112, 134], [130, 120], [150, 106], [172, 94], [194, 82], [214, 70], [234, 58], [124, 158], [140, 142]]} />
          <Note x={70} y={110} c="#fff59d" />
          <Note x={90} y={90} c="#f8bbd0" delay={0.4} />
          <Note x={48} y={96} c="#b3e5fc" delay={0.8} />
          <Rails d="M-10 188 H330" />
          <Train x={110} y={188} s={0.72} color={flavor} arms="up" face="open" />
        </Base>
      )
    case 'end-shape':
      return (
        <Base>
          <Moon x={250} y={44} r={26} />
          <Hills y={140} night />
          <path d="M0 150 Q160 136 320 150 V200 H0 Z" fill="url(#k-grass-night)" />
          {/* Vòng tròn đom đóm hình ông Trăng */}
          <Fireflies
            pts={Array.from({ length: 12 }, (_, i) => {
              const a = (i / 12) * Math.PI * 2
              return [110 + Math.cos(a) * 34, 84 + Math.sin(a) * 34] as [number, number]
            })}
          />
          <Firefly x={100} y={78} />
          <Firefly x={120} y={78} delay={0.5} />
          <Firefly x={110} y={96} delay={1} />
          <Rails d="M-10 188 H330" />
          <Train x={190} y={188} s={0.72} color={flavor} arms="up" face="open" />
        </Base>
      )
    default:
      return <Base />
  }
}

export function Icon({ icon }: { icon: string }) {
  switch (icon) {
    case 'train-green':
    case 'train-purple':
      return <Train x={52} y={66} s={0.58} color={icon.slice(6)} />
    case 'mountain':
      return (
        <>
          <Mountain x={50} y={68} s={0.52} />
          <Cloud x={76} y={26} s={0.55} night />
        </>
      )
    case 'fireflies':
      return (
        <>
          <rect x="4" y="4" width="92" height="62" rx="12" fill="url(#k-sky-night)" />
          <path d="M4 50 Q50 42 96 50 V54 Q96 66 84 66 H16 Q4 66 4 54 Z" fill="#1b4332" />
          <Fireflies pts={[[22, 40], [40, 26], [58, 44], [76, 30], [86, 50], [30, 54], [64, 18]]} />
        </>
      )
    case 'blow':
      return (
        <>
          <Henry x={30} y={68} s={0.9} shirt="#ffb74d" face="blow" />
          <Wind x={44} y={30} />
          <Cloud x={84} y={22} s={0.5} night />
        </>
      )
    case 'owl':
      return <Owl x={50} y={64} s={1.2} />
    case 'song':
      return (
        <>
          <Henry x={34} y={68} s={0.9} shirt="#ffb74d" face="open" arms="up" />
          <Note x={64} y={30} c="#7e57c2" />
          <Note x={82} y={18} c="#ec407a" delay={0.4} />
          <Note x={78} y={46} c="#43a047" delay={0.8} />
        </>
      )
    case 'shape':
      return (
        <>
          <rect x="16" y="2" width="68" height="66" rx="14" fill="url(#k-sky-night)" />
          <Fireflies
            pts={Array.from({ length: 10 }, (_, i) => {
              const a = (i / 10) * Math.PI * 2
              return [50 + Math.cos(a) * 22, 35 + Math.sin(a) * 22] as [number, number]
            })}
          />
        </>
      )
    default:
      return <></>
  }
}

