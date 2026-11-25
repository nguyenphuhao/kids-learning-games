// Hình truyện "Ba và Henry đi công viên". Lựa chọn đầu: màu xe (red / blue).

import type { ReactNode } from 'react'
import { Anim, At, Bush, Cloud, DaySky, Dad, FlowerBed, Ground, Heart, Henry, Hills, Rainbow, Shadow, Sparkle, Sun, Tree } from './kit'

const CAR: Record<string, string> = { red: '#e53935', blue: '#1e88e5' }

/** Xe điện mui trần, ba lái, Henry ngồi cạnh. (x, y) là mặt đất dưới giữa xe. */
export function ParkCar({ x, y, s = 1, color, hat = true, henryFace = 'smile', henryArms = 'wave' }: {
  x: number
  y: number
  s?: number
  color: string
  hat?: boolean
  henryFace?: 'smile' | 'open' | 'sad'
  henryArms?: 'wave' | 'down' | 'up'
}) {
  const body = 'M-52 -12 Q-56 -40 -34 -40 L30 -40 Q50 -40 54 -24 L56 -12 Q56 -6 50 -6 L-48 -6 Q-54 -6 -52 -12 Z'
  return (
    <At x={x} y={y} s={s}>
      <Shadow rx={56} />
      <Anim cls="a-bob">
        <Dad x={-18} y={-14} s={0.72} shirt="#26a69a" arms="hold" shadow={false} />
        <Henry x={20} y={-16} s={0.9} shirt="#ffb74d" hat={hat ? 'cap' : undefined} arms={henryArms} face={henryFace} shadow={false} />
        <path d="M30 -40 L38 -58" stroke="#b3e5fc" strokeWidth="5" strokeLinecap="round" opacity="0.85" />
        <circle cx="-7" cy="-44" r="5.5" fill="none" stroke="#37474f" strokeWidth="2.2" />
        <path d={body} fill={CAR[color] ?? color} />
        <path d={body} fill="url(#k-gloss)" />
        <path d={body} fill="url(#k-shade)" />
        <path d="M-44 -27 H44" stroke="#fff" strokeWidth="2.5" opacity="0.7" strokeLinecap="round" />
        <circle cx="51" cy="-25" r="7" fill="url(#k-glow)" />
        <circle cx="51" cy="-25" r="3.4" fill="#fff59d" />
        <path d="M-50 -30 L-58 -36" stroke="#90a4ae" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="-59" cy="-37" r="2.5" fill="#ff7043" />
      </Anim>
      {[-32, 34].map((wx) => (
        <g key={wx}>
          <circle cx={wx} cy="-8" r="10.5" fill="#263238" />
          <circle cx={wx} cy="-8" r="5" fill="url(#k-metal)" />
          <circle cx={wx} cy="-8" r="1.6" fill="#546e7a" />
        </g>
      ))}
    </At>
  )
}

/** Vịt. kind: 'baby' vịt con vàng, 'mom' vịt mẹ trắng. */
function Duck({ x, y, s = 1, kind = 'baby', tear = false, flip = false }: { x: number; y: number; s?: number; kind?: 'baby' | 'mom'; tear?: boolean; flip?: boolean }) {
  const c = kind === 'baby' ? '#ffe14d' : '#fafafa'
  const wing = kind === 'baby' ? '#fbc02d' : '#e0e0e0'
  return (
    <At x={x} y={y} s={s} flip={flip}>
      <ellipse cx="0" cy="2" rx="17" ry="3" fill="#fff" opacity="0.5" />
      <Anim cls="a-bob">
        <path d="M-16 -4 Q-18 -16 -6 -16 Q2 -16 6 -10 Q14 -12 14 -4 Q12 4 -2 4 Q-14 4 -16 -4 Z" fill={c} />
        <path d="M-16 -4 Q-18 -16 -6 -16 Q2 -16 6 -10 Q14 -12 14 -4 Q12 4 -2 4 Q-14 4 -16 -4 Z" fill="url(#k-shade)" />
        <path d="M-9 -8 Q-2 -12 4 -6 Q-2 -2 -9 -8 Z" fill={wing} />
        <circle cx="9" cy="-18" r="8" fill={c} />
        <circle cx="9" cy="-18" r="8" fill="url(#k-ball)" />
        <path d="M15 -18 Q23 -18 23 -15 Q19 -13 15 -14 Z" fill="#ff9800" />
        <circle cx="11" cy="-20" r="1.6" fill="#3e2723" />
        <circle cx="11.5" cy="-20.6" r="0.6" fill="#fff" />
        {kind === 'mom' && <path d="M6 -26 q2 -4 5 -2" stroke="#e0e0e0" strokeWidth="2" fill="none" />}
        {tear && (
          <Anim cls="a-drip">
            <path d="M11 -16 q-2.2 4 0 6 q2.2 -2 0 -6 Z" fill="#4fc3f7" />
          </Anim>
        )}
      </Anim>
    </At>
  )
}

function Turtle({ x, y, s = 1, flip = false }: { x: number; y: number; s?: number; flip?: boolean }) {
  return (
    <At x={x} y={y} s={s} flip={flip}>
      <Shadow rx={20} />
      <ellipse cx="-13" cy="-1" rx="5" ry="3" fill="#9ccc65" />
      <ellipse cx="11" cy="-1" rx="5" ry="3" fill="#9ccc65" />
      <path d="M17 -6 Q24 -14 28 -10 Q30 -4 22 -3 Z" fill="#9ccc65" />
      <circle cx="25" cy="-10" r="1.3" fill="#3e2723" />
      <path d="M23.5 -6.5 q2 1.5 4 0" stroke="#3e2723" strokeWidth="0.9" fill="none" />
      <path d="M-20 -3 A20 17 0 0 1 20 -3 Z" fill="#558b2f" />
      <path d="M-20 -3 A20 17 0 0 1 20 -3 Z" fill="url(#k-ball)" />
      <path d="M-8 -12 l8 -5 8 5 -3 7 h-10 Z M-17 -5 l5 -6 M17 -5 l-5 -6" stroke="#33691e" strokeWidth="1.3" fill="none" />
      <path d="M-21 -3 H21" stroke="#c5e1a5" strokeWidth="2.4" strokeLinecap="round" />
    </At>
  )
}

function Squirrel({ x, y, s = 1, flip = false, holding }: { x: number; y: number; s?: number; flip?: boolean; holding?: 'hat' | 'nut' }) {
  return (
    <At x={x} y={y} s={s} flip={flip}>
      <Shadow rx={12} />
      <Anim cls="a-sway">
        <path d="M-6 -4 C-30 -6 -30 -36 -14 -38 C-6 -38 -6 -30 -12 -28 C-20 -24 -16 -12 -4 -10 Z" fill="#bc8f6f" />
        <path d="M-6 -4 C-30 -6 -30 -36 -14 -38 C-6 -38 -6 -30 -12 -28 C-20 -24 -16 -12 -4 -10 Z" fill="url(#k-shade)" />
      </Anim>
      <ellipse cx="2" cy="-10" rx="9" ry="11" fill="#a1704e" />
      <ellipse cx="4" cy="-8" rx="5" ry="7" fill="#f3dcc4" />
      <circle cx="6" cy="-24" r="7.5" fill="#a1704e" />
      <path d="M2 -30 L3 -36 L7 -31 Z" fill="#a1704e" />
      <circle cx="9" cy="-25" r="1.6" fill="#3e2723" />
      <circle cx="9.5" cy="-25.6" r="0.6" fill="#fff" />
      <circle cx="13" cy="-22" r="1.2" fill="#5d4037" />
      {holding === 'hat' && (
        <g>
          <path d="M6 -16 Q14 -28 24 -18 Z" fill="#fdd835" />
          <path d="M18 -18 Q26 -19 30 -16 Q24 -15 18 -16 Z" fill="#f9a825" />
        </g>
      )}
      {holding === 'nut' && <Acorn x={10} y={-12} />}
    </At>
  )
}

function Acorn({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <At x={x} y={y} s={s}>
      <ellipse cx="0" cy="2" rx="4" ry="5" fill="#c68642" />
      <ellipse cx="0" cy="2" rx="4" ry="5" fill="url(#k-ball)" />
      <path d="M-5 -1 Q0 -6 5 -1 Z" fill="#6d4c41" />
      <path d="M0 -4 v-2" stroke="#6d4c41" strokeWidth="1.2" />
    </At>
  )
}

function Lake({ cx, cy, rx, ry }: { cx: number; cy: number; rx: number; ry: number }) {
  return (
    <g>
      <ellipse cx={cx} cy={cy + 2} rx={rx + 4} ry={ry + 3} fill="#8d6e63" opacity="0.35" />
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="url(#k-lake)" />
      <Anim cls="a-drift">
        <path d={`M${cx - rx * 0.6} ${cy - 2} q6 -3 12 0 t12 0 M${cx + rx * 0.1} ${cy + ry * 0.4} q6 -3 12 0 t12 0`} stroke="#fff" strokeWidth="1.8" fill="none" opacity="0.8" strokeLinecap="round" />
      </Anim>
    </g>
  )
}

function Reeds({ x, y }: { x: number; y: number }) {
  return (
    <g>
      {[-6, 0, 6].map((dx, i) => (
        <g key={dx}>
          <path d={`M${x + dx} ${y} Q${x + dx - 2} ${y - 14} ${x + dx + 1} ${y - 24 + i * 3}`} stroke="#689f38" strokeWidth="2" fill="none" />
          <ellipse cx={x + dx + 1} cy={y - 24 + i * 3} rx="2" ry="5" fill="#8d6e63" />
        </g>
      ))}
    </g>
  )
}

function Base({ children }: { children?: ReactNode }) {
  return (
    <>
      <DaySky />
      <Sun x={286} y={30} r={15} />
      <Cloud x={60} y={30} />
      <Cloud x={190} y={22} s={0.7} />
      <Hills y={122} />
      <Ground y={138} />
      {children}
    </>
  )
}

function Path({ d }: { d: string }) {
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke="#d7ccc8" strokeWidth="30" />
      <path d={d} stroke="#efebe9" strokeWidth="24" />
    </g>
  )
}

export function Scene({ scene, flavor }: { scene: string; flavor: string }) {
  switch (scene) {
    case 'start':
      return (
        <Base>
          <Tree x={40} y={146} s={1.1} />
          <Tree x={284} y={148} s={1} />
          {/* Cổng công viên */}
          <rect x="102" y="70" width="10" height="76" rx="3" fill="url(#k-wood)" />
          <rect x="208" y="70" width="10" height="76" rx="3" fill="url(#k-wood)" />
          <path d="M96 76 Q160 40 224 76 L224 86 Q160 52 96 86 Z" fill="#ff7043" />
          <path d="M96 76 Q160 40 224 76 L224 86 Q160 52 96 86 Z" fill="url(#k-gloss)" />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => {
            const fx = 110 + i * 16.7
            const fy = 82 - Math.sin((i / 6) * Math.PI) * 22
            return <path key={i} d={`M${fx - 5} ${fy} L${fx + 5} ${fy} L${fx} ${fy + 9} Z`} fill={['#fdd835', '#42a5f5', '#ec407a', '#66bb6a'][i % 4]} />
          })}
          <circle cx="107" cy="66" r="6" fill="#fdd835" />
          <circle cx="213" cy="66" r="6" fill="#fdd835" />
          <Bush x={86} y={150} />
          <Bush x={236} y={152} s={0.9} />
          <FlowerBed xs={[18, 34, 64, 254, 270, 300]} y={170} />
          <ParkCar x={160} y={186} s={1.05} color={flavor} />
        </Base>
      )
    case 'fork':
      return (
        <Base>
          <Lake cx={64} cy={140} rx={58} ry={14} />
          <Reeds x={18} y={146} />
          <FlowerBed xs={[214, 230, 246, 262, 278, 294, 306]} y={140} />
          <Bush x={300} y={128} s={0.8} />
          <Path d="M160 210 L160 168 Q160 160 150 156 L104 140 M160 168 Q160 160 170 156 L222 140" />
          {/* Biển chỉ đường */}
          <rect x="157" y="100" width="6" height="46" fill="url(#k-wood)" />
          <path d="M156 106 H128 L120 113 L128 120 H156 Z" fill="#4fc3f7" stroke="#fff" strokeWidth="2" />
          <path d="M164 110 H192 L200 117 L192 124 H164 Z" fill="#f06292" stroke="#fff" strokeWidth="2" />
          <path d="M135 116 q4 -6 8 0 q-4 3 -8 0 Z" fill="#fff" />
          <circle cx="182" cy="117" r="3.5" fill="#fff" />
          <ParkCar x={160} y={198} s={0.62} color={flavor} />
        </Base>
      )
    case 'lake':
      return (
        <Base>
          <Lake cx={214} cy={158} rx={104} ry={30} />
          <Reeds x={298} y={160} />
          <ellipse cx="282" cy="176" rx="20" ry="7" fill="#9e9e9e" />
          <ellipse cx="282" cy="174" rx="18" ry="5" fill="#bdbdbd" />
          <Turtle x={282} y={172} s={0.8} flip />
          <Duck x={210} y={154} s={1.2} tear />
          <ParkCar x={76} y={188} s={0.92} color={flavor} henryFace="open" henryArms="down" />
        </Base>
      )
    case 'garden':
      return (
        <Base>
          <Tree x={240} y={158} s={1.6} />
          <At x={246} y={66}>
            <Anim cls="a-sway">
              <path d="M-12 0 Q-10 -14 2 -14 Q13 -13 12 0 Z" fill="#fdd835" />
              <path d="M-12 0 Q-10 -14 2 -14 Q13 -13 12 0 Z" fill="url(#k-ball)" />
              <path d="M4 -1 Q15 -3 22 1 Q13 3 4 1 Z" fill="#f9a825" />
            </Anim>
          </At>
          <Squirrel x={208} y={176} s={0.95} />
          <FlowerBed xs={[24, 46, 128, 150, 294, 310]} y={168} />
          <ParkCar x={92} y={190} s={0.9} color={flavor} hat={false} henryFace="open" henryArms="up" />
        </Base>
      )
    case 'end-duck':
      return (
        <Base>
          <Lake cx={210} cy={158} rx={106} ry={30} />
          <Duck x={196} y={156} s={1.6} kind="mom" />
          <Duck x={244} y={160} s={1} />
          <Heart x={222} y={112} s={1.2} />
          <Heart x={250} y={124} s={0.8} c="#ef5350" />
          <Reeds x={300} y={162} />
          <ParkCar x={76} y={188} s={0.92} color={flavor} />
        </Base>
      )
    case 'end-turtle':
      return (
        <Base>
          <Lake cx={200} cy={158} rx={116} ry={32} />
          <ellipse cx="236" cy="150" rx="46" ry="12" fill="#aed581" />
          <ellipse cx="236" cy="148" rx="40" ry="8" fill="#c5e1a5" />
          <Bush x={268} y={148} s={0.6} />
          <Duck x={222} y={146} s={1.35} kind="mom" />
          <Duck x={252} y={148} s={0.85} />
          <Duck x={198} y={150} s={0.85} flip />
          <Heart x={236} y={110} />
          <Turtle x={148} y={172} s={1.05} />
          <ParkCar x={60} y={192} s={0.82} color={flavor} />
        </Base>
      )
    case 'end-squirrel':
      return (
        <Base>
          <Tree x={252} y={160} s={1.5} />
          <FlowerBed xs={[150, 170, 300, 312]} y={176} />
          <ParkCar x={70} y={186} s={0.75} color={flavor} hat={false} />
          <Squirrel x={214} y={182} s={1.25} holding="hat" flip />
          <Henry x={164} y={186} s={1.1} shirt="#ffb74d" arms="hold">
            <Acorn x={0} y={-26} s={1.1} />
          </Henry>
          <Sparkle x={190} y={130} />
        </Base>
      )
    case 'end-lift':
      return (
        <Base>
          <Rainbow cx={170} y={140} r={120} />
          <Tree x={276} y={160} s={1.3} />
          <FlowerBed xs={[30, 50, 220, 236, 306]} y={172} />
          <ParkCar x={58} y={190} s={0.62} color={flavor} hat={false} />
          <Dad x={160} y={190} s={1.05} shirt="#26a69a" arms="up" />
          <Henry x={160} y={86} s={0.95} shirt="#ffb74d" hat="cap" arms="up" face="open" shadow={false} />
          <Sparkle x={196} y={30} />
          <Sparkle x={124} y={40} delay={0.6} />
        </Base>
      )
    default:
      return <Base />
  }
}

export function Icon({ icon }: { icon: string }) {
  switch (icon) {
    case 'car-red':
    case 'car-blue':
      return <ParkCar x={50} y={66} s={0.55} color={icon === 'car-red' ? 'red' : 'blue'} />
    case 'lake':
      return (
        <>
          <Lake cx={50} cy={46} rx={42} ry={16} />
          <Reeds x={14} y={50} />
          <Duck x={56} y={44} s={0.7} />
        </>
      )
    case 'garden':
      return (
        <>
          <ellipse cx="50" cy="60" rx="46" ry="8" fill="url(#k-grass)" />
          <FlowerBed xs={[14, 30, 46, 62, 78, 92]} y={56} />
          <Bush x={50} y={36} s={0.7} />
        </>
      )
    case 'duckling':
      return (
        <>
          <ParkCar x={34} y={68} s={0.36} color="red" />
          <Duck x={78} y={52} s={0.95} />
        </>
      )
    case 'turtle':
      return <Turtle x={44} y={56} s={1.35} />
    case 'squirrel':
      return <Squirrel x={52} y={66} s={1.35} />
    case 'lift':
      return (
        <>
          <Dad x={50} y={70} s={0.42} shirt="#26a69a" arms="up" />
          <Henry x={50} y={31} s={0.4} shirt="#ffb74d" hat="cap" arms="up" face="open" shadow={false} />
        </>
      )
    default:
      return <></>
  }
}


