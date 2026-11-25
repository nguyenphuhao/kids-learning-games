// Hình truyện "Vườn rau của bà". Lựa chọn đầu: nón lá (conical) hay mũ rơm (straw).

import type { ReactNode } from 'react'
import { Anim, At, Bush, Cloud, Dad, DaySky, FlowerBed, Grandma, Ground, Heart, Henry, Hills, Shadow, Sparkle, Sun, Tree, type HenryHat } from './kit'

const hatOf = (flavor: string): HenryHat => (flavor === 'straw' ? 'straw' : 'conical')

// ---------- Đồ vật ----------

function Carrot({ x, y, s = 1, rot = 0 }: { x: number; y: number; s?: number; rot?: number }) {
  return (
    <At x={x} y={y} s={s}>
      <g transform={`rotate(${rot})`}>
        <path d="M0 0 Q-8 -14 -4 -22 Q0 -14 0 0 Z M0 0 Q2 -16 8 -22 Q6 -10 0 0 Z M0 0 Q-2 -18 1 -26 Q3 -14 0 0 Z" fill="#43a047" />
        <path d="M-6 0 Q0 -3 6 0 L1 26 Q0 28 -1 26 Z" fill="#fb8c00" />
        <path d="M-6 0 Q0 -3 6 0 L1 26 Q0 28 -1 26 Z" fill="url(#k-ball)" />
        <path d="M-4 7 h3 M1 12 h3 M-3 17 h2.5" stroke="#e65100" strokeWidth="1" />
      </g>
    </At>
  )
}

/** Cà rốt mọc trong đất: chỉ thấy lá và đầu củ. */
function CarrotTop({ x, y }: { x: number; y: number }) {
  return (
    <At x={x} y={y}>
      <Anim cls="a-sway">
        <path d="M0 0 Q-8 -14 -4 -22 Q0 -14 0 0 Z M0 0 Q2 -16 8 -22 Q6 -10 0 0 Z M0 0 Q-2 -18 1 -26 Q3 -14 0 0 Z" fill="#43a047" />
      </Anim>
      <ellipse cx="0" cy="1" rx="5" ry="2.5" fill="#fb8c00" />
    </At>
  )
}

function Pumpkin({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <At x={x} y={y} s={s}>
      <Shadow rx={24} />
      <ellipse cx="-12" cy="-16" rx="12" ry="16" fill="#f57c00" />
      <ellipse cx="12" cy="-16" rx="12" ry="16" fill="#f57c00" />
      <ellipse cx="0" cy="-16" rx="12" ry="17" fill="#ff9800" />
      <ellipse cx="0" cy="-16" rx="24" ry="17" fill="url(#k-ball)" />
      <path d="M0 -32 Q2 -40 7 -42" stroke="#558b2f" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M4 -34 Q14 -40 18 -32 Q10 -30 4 -34 Z" fill="#7cb342" />
    </At>
  )
}

function Strawberry({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <At x={x} y={y} s={s}>
      <path d="M-6 -2 Q-7 6 0 10 Q7 6 6 -2 Q0 -5 -6 -2 Z" fill="#e53935" />
      <path d="M-6 -2 Q-7 6 0 10 Q7 6 6 -2 Q0 -5 -6 -2 Z" fill="url(#k-ball)" />
      <path d="M-5 -2 L-2 -6 L0 -3 L2 -6 L5 -2 Z" fill="#43a047" />
      {[[-2.5, 1], [2.5, 1], [0, 4], [-3, 5], [3, 5], [0, 0]].map(([sx, sy]) => (
        <circle key={`${sx}${sy}`} cx={sx} cy={sy} r="0.6" fill="#fff59d" />
      ))}
    </At>
  )
}

function Mango({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <At x={x} y={y} s={s}>
      <path d="M-5 -6 Q4 -10 7 -2 Q8 8 0 10 Q-8 8 -7 0 Q-7 -4 -5 -6 Z" fill="#ffb300" />
      <path d="M-5 -6 Q4 -10 7 -2 Q8 8 0 10 Q-8 8 -7 0 Q-7 -4 -5 -6 Z" fill="url(#k-ball)" />
      <path d="M-1 -8 Q2 -12 6 -12 Q4 -8 -1 -8 Z" fill="#43a047" />
    </At>
  )
}

function Basket({ x, y, s = 1, fruit }: { x: number; y: number; s?: number; fruit?: 'strawberry' | 'mango' }) {
  return (
    <At x={x} y={y} s={s}>
      <path d="M-14 -10 Q0 -32 14 -10" stroke="#8d6e63" strokeWidth="2.5" fill="none" />
      {fruit === 'strawberry' &&
        [[-7, -12], [0, -14], [7, -12], [-3, -9], [4, -9]].map(([fx, fy]) => <Strawberry key={`${fx}${fy}`} x={fx} y={fy} s={0.7} />)}
      {fruit === 'mango' && [[-6, -12], [5, -12], [0, -16]].map(([fx, fy]) => <Mango key={`${fx}${fy}`} x={fx} y={fy} s={0.8} />)}
      <path d="M-16 -10 H16 L12 4 Q0 7 -12 4 Z" fill="#c68642" />
      <path d="M-14 -5 H14 M-13 0 H13 M-8 -10 L-7 5 M0 -10 V6 M8 -10 L7 5" stroke="#8d5524" strokeWidth="1" />
    </At>
  )
}

/** Nồi canh bốc khói (hoặc nồi chè). */
function Pot({ x, y, s = 1, soup = '#ffb74d' }: { x: number; y: number; s?: number; soup?: string }) {
  return (
    <At x={x} y={y} s={s}>
      <Anim cls="a-drift">
        <path d="M-6 -24 q-4 -6 0 -12 q4 -6 0 -12 M6 -24 q-4 -6 0 -12 q4 -6 0 -12" stroke="#fff" strokeWidth="2.4" fill="none" opacity="0.8" strokeLinecap="round" />
      </Anim>
      <ellipse cx="0" cy="-18" rx="18" ry="4" fill={soup} />
      <path d="M-18 -18 Q-18 0 0 0 Q18 0 18 -18 Z" fill="#78909c" />
      <path d="M-18 -18 Q-18 0 0 0 Q18 0 18 -18 Z" fill="url(#k-ball)" />
      <path d="M-22 -14 h4 M18 -14 h4" stroke="#546e7a" strokeWidth="3" strokeLinecap="round" />
    </At>
  )
}

function Bowl({ x, y, s = 1, fill = '#ffb74d' }: { x: number; y: number; s?: number; fill?: string }) {
  return (
    <At x={x} y={y} s={s}>
      <ellipse cx="0" cy="-8" rx="10" ry="2.5" fill={fill} />
      <path d="M-10 -8 Q-10 0 0 0 Q10 0 10 -8 Z" fill="#fff" />
      <path d="M-10 -8 Q-10 0 0 0 Q10 0 10 -8 Z" fill="url(#k-shade)" />
      <path d="M-8 -5 Q0 -2 8 -5" stroke="#42a5f5" strokeWidth="1" fill="none" />
    </At>
  )
}

function Chicken({ x, y, s = 1, flip = false }: { x: number; y: number; s?: number; flip?: boolean }) {
  return (
    <At x={x} y={y} s={s} flip={flip}>
      <Shadow rx={9} />
      <Anim cls="a-bob">
        <path d="M-10 -8 Q-14 -18 -8 -20 Q-4 -12 0 -10 Z" fill="#8d6e63" />
        <ellipse cx="0" cy="-9" rx="10" ry="8" fill="#fff3e0" />
        <ellipse cx="0" cy="-9" rx="10" ry="8" fill="url(#k-ball)" />
        <circle cx="8" cy="-18" r="5" fill="#fff3e0" />
        <path d="M6 -23 q1 -3 3 -1 q2 -2 3 1 Z" fill="#e53935" />
        <path d="M12 -18 l4 1 -4 1.5 Z" fill="#ffa726" />
        <circle cx="9" cy="-19" r="0.9" fill="#3e2723" />
        <path d="M-2 -1 v2 M2 -1 v2" stroke="#ffa726" strokeWidth="1.3" />
      </Anim>
    </At>
  )
}

function House({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <At x={x} y={y} s={s}>
      <Shadow rx={56} />
      <rect x="-46" y="-50" width="92" height="50" fill="#fff59d" />
      <rect x="-46" y="-50" width="92" height="50" fill="url(#k-shade)" />
      <path d="M-58 -46 L-36 -80 H36 L58 -46 Z" fill="#e57348" />
      <path d="M-58 -46 L-36 -80 H36 L58 -46 Z" fill="url(#k-shade)" />
      <path d="M-50 -58 H50 M-44 -68 H44" stroke="#c75b37" strokeWidth="1.4" />
      <rect x="-12" y="-34" width="24" height="34" rx="2" fill="url(#k-wood)" />
      <circle cx="7" cy="-16" r="1.6" fill="#fdd835" />
      <rect x="-38" y="-38" width="18" height="16" rx="2" fill="#81d4fa" stroke="#8d6e63" strokeWidth="2" />
      <rect x="20" y="-38" width="18" height="16" rx="2" fill="#81d4fa" stroke="#8d6e63" strokeWidth="2" />
      <path d="M-29 -38 v16 M29 -38 v16" stroke="#8d6e63" strokeWidth="1.5" />
    </At>
  )
}

/** Luống đất có cà rốt. */
function VeggieBed({ x, y, w = 120, carrots = 4 }: { x: number; y: number; w?: number; carrots?: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height="20" rx="10" fill="#8d6e63" />
      <rect x={x} y={y} width={w} height="20" rx="10" fill="url(#k-gloss)" opacity="0.4" />
      {Array.from({ length: carrots }, (_, i) => (
        <CarrotTop key={i} x={x + 14 + i * ((w - 28) / Math.max(1, carrots - 1))} y={y + 8} />
      ))}
    </g>
  )
}

function Fence({ x1, x2, y }: { x1: number; x2: number; y: number }) {
  const posts = []
  for (let px = x1; px <= x2; px += 14) posts.push(px)
  return (
    <g>
      <path d={`M${x1 - 4} ${y - 18} H${x2 + 4} M${x1 - 4} ${y - 8} H${x2 + 4}`} stroke="#c8a165" strokeWidth="3" />
      {posts.map((px) => (
        <path key={px} d={`M${px} ${y} V${y - 24} l2 -3 2 3 V${y}`} fill="#d7b98e" />
      ))}
    </g>
  )
}

function Base({ children }: { children?: ReactNode }) {
  return (
    <>
      <DaySky />
      <Sun x={40} y={32} r={15} />
      <Cloud x={150} y={30} s={0.9} />
      <Cloud x={260} y={22} s={0.7} />
      <Hills y={118} />
      <Ground y={134} />
      {children}
    </>
  )
}

export function Scene({ scene, flavor }: { scene: string; flavor: string }) {
  const hat = hatOf(flavor)
  switch (scene) {
    case 'start':
      return (
        <Base>
          <Tree x={296} y={142} s={1} />
          <House x={86} y={150} s={1.05} />
          <FlowerBed xs={[24, 36, 140, 152]} y={162} />
          <Grandma x={150} y={180} s={0.95} arms="wave" />
          <Dad x={204} y={190} s={0.9} shirt="#42a5f5" />
          <Henry x={248} y={192} s={1.1} shirt="#ef5350" hat={hat} arms="wave" />
          <Chicken x={300} y={186} s={0.9} flip />
        </Base>
      )
    case 'fork':
      return (
        <Base>
          <VeggieBed x={10} y={148} w={110} carrots={4} />
          <VeggieBed x={20} y={174} w={100} carrots={3} />
          <Pumpkin x={92} y={146} s={0.5} />
          <Tree x={236} y={152} s={1} fruit="#ffb300" />
          <Bush x={292} y={168} berries="#e53935" />
          <path d="M150 210 L156 138" stroke="#e8d5b7" strokeWidth="26" strokeLinecap="round" />
          <Henry x={160} y={190} s={1} shirt="#ef5350" hat={hat} arms="down" face="open" />
        </Base>
      )
    case 'veggies':
      return (
        <Base>
          <Fence x1={8} x2={312} y={140} />
          <VeggieBed x={10} y={150} w={170} carrots={6} />
          <Pumpkin x={250} y={168} s={1.2} />
          <Pumpkin x={292} y={160} s={0.6} />
          <Henry x={154} y={194} s={1.05} shirt="#ef5350" hat={hat} arms="down" face="open" />
        </Base>
      )
    case 'fruit':
      return (
        <Base>
          <Tree x={96} y={160} s={1.6} fruit="#ffb300" />
          <Bush x={248} y={176} s={1.5} berries="#e53935" />
          <Strawberry x={232} y={182} s={1.1} />
          <Henry x={168} y={194} s={1.05} shirt="#ef5350" hat={hat} arms="down" face="open" />
        </Base>
      )
    case 'end-carrot':
      return (
        <Base>
          <VeggieBed x={10} y={164} w={110} carrots={3} />
          <Henry x={110} y={192} s={1.15} shirt="#ef5350" hat={hat} arms="wave" face="open">
            <Carrot x={19} y={-46} s={1.1} />
          </Henry>
          <Sparkle x={86} y={60} s={1.2} />
          <Sparkle x={136} y={58} delay={0.4} />
          <Grandma x={214} y={190} s={0.95} />
          <Pot x={262} y={190} s={1} />
        </Base>
      )
    case 'end-pumpkin':
      return (
        <Base>
          <House x={274} y={146} s={0.7} />
          <Dad x={84} y={192} s={0.95} shirt="#42a5f5" arms="hold" />
          <Henry x={160} y={192} s={1.1} shirt="#ef5350" hat={hat} arms="hold" flip />
          <Pumpkin x={122} y={170} s={1.05} />
          <Grandma x={232} y={190} s={0.9} arms="hold" />
          <Bowl x={232} y={160} s={1.2} fill="#ffa726" />
        </Base>
      )
    case 'end-mango':
      return (
        <Base>
          <Tree x={160} y={150} s={1.9} fruit="#ffb300" />
          <rect x="80" y="170" width="160" height="16" rx="8" fill="#ce93d8" opacity="0.8" />
          <Grandma x={82} y={190} s={0.85} />
          <Dad x={232} y={192} s={0.85} shirt="#42a5f5" arms="hold" />
          <Henry x={160} y={192} s={1} shirt="#ef5350" hat={hat} arms="hold" face="open">
            <Mango x={0} y={-22} s={1.1} />
          </Henry>
          <Basket x={196} y={186} s={0.9} fruit="mango" />
        </Base>
      )
    case 'end-strawberry':
      return (
        <Base>
          <Bush x={50} y={170} s={1.3} berries="#e53935" />
          <Bush x={290} y={168} s={1.1} berries="#e53935" />
          <Henry x={128} y={192} s={1.15} shirt="#ef5350" hat={hat} arms="hold">
            <Strawberry x={10} y={-26} s={1.4} />
          </Henry>
          <Basket x={98} y={190} s={1.1} fruit="strawberry" />
          <Grandma x={196} y={190} s={1} arms="hug" />
          <Heart x={168} y={84} />
          <Heart x={196} y={70} s={0.7} c="#ef5350" />
        </Base>
      )
    default:
      return <Base />
  }
}

export function Icon({ icon }: { icon: string }) {
  switch (icon) {
    case 'hat-conical':
    case 'hat-straw':
      return <Henry x={50} y={70} s={0.82} shirt="#ef5350" hat={icon === 'hat-straw' ? 'straw' : 'conical'} arms="wave" />
    case 'veggies':
      return (
        <>
          <VeggieBed x={8} y={46} w={66} carrots={3} />
          <Pumpkin x={80} y={62} s={0.6} />
        </>
      )
    case 'fruit':
      return (
        <>
          <Tree x={34} y={66} s={0.62} fruit="#ffb300" />
          <Bush x={76} y={64} s={0.9} berries="#e53935" />
        </>
      )
    case 'carrot':
      return (
        <>
          <Carrot x={40} y={32} s={1.1} rot={-20} />
          <Carrot x={62} y={34} s={1} rot={15} />
        </>
      )
    case 'pumpkin':
      return <Pumpkin x={50} y={62} s={1.2} />
    case 'mango':
      return (
        <>
          <Mango x={36} y={36} s={2} />
          <Mango x={66} y={40} s={1.7} />
        </>
      )
    case 'strawberry':
      return (
        <>
          <Strawberry x={34} y={32} s={2.4} />
          <Strawberry x={66} y={38} s={2} />
        </>
      )
    default:
      return <></>
  }
}

