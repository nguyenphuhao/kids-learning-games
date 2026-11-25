// Hình truyện "Đi chợ hoa ngày Tết". Lựa chọn đầu: màu áo dài (red / yellow).

import type { ReactNode } from 'react'
import { Anim, At, Cloud, Dad, DaySky, Heart, Henry, Shadow, Sparkle, type Arms, type Face } from './kit'

const AO: Record<string, string> = { red: '#e53935', yellow: '#fbc02d' }

function AoDaiHenry({ x, y, s = 1, color, arms = 'down', face = 'smile', flip = false, children }: { x: number; y: number; s?: number; color: string; arms?: Arms; face?: Face; flip?: boolean; children?: ReactNode }) {
  return (
    <Henry x={x} y={y} s={s} shirt={AO[color] ?? color} outfit="aodai" arms={arms} face={face} flip={flip}>
      {children}
    </Henry>
  )
}

// ---------- Hoa, đồ Tết ----------

/** Cành hoa: c là màu cánh (mai vàng, đào hồng). (x, y) là gốc cành. */
function Branch({ x, y, s = 1, c, deco }: { x: number; y: number; s?: number; c: string; deco?: 'envelope' | 'lantern' }) {
  const twigs = 'M0 0 Q-2 -30 -18 -52 M-6 -24 Q10 -40 16 -62 M-12 -42 Q-30 -50 -38 -64 M10 -46 Q24 -52 34 -58 M-3 -12 Q-20 -18 -30 -28'
  const blooms: [number, number][] = [
    [-18, -52], [16, -62], [-38, -64], [34, -58], [-30, -28], [-8, -36], [6, -50], [-26, -58], [24, -54], [-14, -22], [2, -28], [-24, -44], [12, -38],
  ]
  return (
    <At x={x} y={y} s={s}>
      <path d={twigs} stroke="#5d4037" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      {blooms.map(([bx, by], i) => (
        <g key={`${bx}${by}`}>
          {[0, 72, 144, 216, 288].map((a) => (
            <circle key={a} cx={bx + 3 * Math.cos(((a + i * 20) * Math.PI) / 180)} cy={by + 3 * Math.sin(((a + i * 20) * Math.PI) / 180)} r="2.6" fill={c} />
          ))}
          <circle cx={bx} cy={by} r="1.4" fill={c === '#ffd54f' ? '#ef6c00' : '#ad1457'} />
        </g>
      ))}
      {deco === 'envelope' &&
        [[-22, -40], [8, -44], [-34, -56], [26, -52], [-8, -24]].map(([ex, ey]) => <Envelope key={`${ex}${ey}`} x={ex} y={ey} s={0.45} hang />)}
      {deco === 'lantern' &&
        [[-22, -40], [8, -44], [-34, -56], [26, -52], [-8, -24]].map(([ex, ey], i) => <Lantern key={`${ex}${ey}`} x={ex} y={ey} s={0.32} glow delay={i * 0.3} />)}
    </At>
  )
}

/** Chậu/bình cắm cành hoa. */
function Vase({ x, y, s = 1, children }: { x: number; y: number; s?: number; children?: ReactNode }) {
  return (
    <At x={x} y={y} s={s}>
      <Shadow rx={20} />
      {children}
      <path d="M-14 -40 Q-22 -20 -14 0 H14 Q22 -20 14 -40 Z" fill="#1565c0" />
      <path d="M-10 -28 Q0 -22 10 -28 M-12 -14 Q0 -8 12 -14" stroke="#fff" strokeWidth="1.6" fill="none" opacity="0.8" />
      <path d="M-14 -40 Q-22 -20 -14 0 H14 Q22 -20 14 -40 Z" fill="url(#k-ball)" />
      <rect x="-15" y="-44" width="30" height="5" rx="2" fill="#0d47a1" />
    </At>
  )
}

function Envelope({ x, y, s = 1, hang = false }: { x: number; y: number; s?: number; hang?: boolean }) {
  return (
    <At x={x} y={y} s={s}>
      {hang && <path d="M0 0 v-8" stroke="#fdd835" strokeWidth="1.6" />}
      <rect x="-8" y="0" width="16" height="22" rx="2" fill="#e53935" />
      <rect x="-8" y="0" width="16" height="22" rx="2" fill="url(#k-gloss)" />
      <path d="M-8 4 L0 10 L8 4" stroke="#fdd835" strokeWidth="1.4" fill="none" />
      <circle cx="0" cy="14" r="3.4" fill="#fdd835" />
    </At>
  )
}

function Lantern({ x, y, s = 1, glow = false, delay = 0 }: { x: number; y: number; s?: number; glow?: boolean; delay?: number }) {
  return (
    <At x={x} y={y} s={s}>
      <path d="M0 0 v-10" stroke="#5d4037" strokeWidth="1.5" />
      <Anim cls="a-sway" delay={delay}>
        {glow && <circle cx="0" cy="16" r="26" fill="url(#k-glow-warm)" />}
        <rect x="-7" y="0" width="14" height="4" rx="1" fill="#fdd835" />
        <ellipse cx="0" cy="16" rx="15" ry="13" fill="#e53935" />
        <path d="M-7 5 Q-11 16 -7 27 M0 3 V29 M7 5 Q11 16 7 27" stroke="#c62828" strokeWidth="1.2" fill="none" />
        <ellipse cx="0" cy="16" rx="15" ry="13" fill="url(#k-ball)" />
        <rect x="-7" y="28" width="14" height="4" rx="1" fill="#fdd835" />
        <path d="M0 32 v10 M-2 34 v8 M2 34 v8" stroke="#fdd835" strokeWidth="1.2" />
      </Anim>
    </At>
  )
}

/** Dây đèn lồng giăng ngang. */
function LanternString({ y = 14 }: { y?: number }) {
  const xs = [26, 82, 138, 194, 250, 306]
  return (
    <g>
      <path d={`M0 ${y} Q80 ${y + 16} 160 ${y + 4} T320 ${y + 6}`} stroke="#5d4037" strokeWidth="1.2" fill="none" />
      {xs.map((lx, i) => (
        <Lantern key={lx} x={lx} y={y + 10 + (i % 2) * 4} s={0.5} delay={i * 0.25} />
      ))}
    </g>
  )
}

function BanhChung({ x, y, s = 1, open = false }: { x: number; y: number; s?: number; open?: boolean }) {
  return (
    <At x={x} y={y} s={s}>
      <Shadow rx={22} />
      {open && (
        <g>
          <path d="M-34 -2 Q-18 -14 0 -6 Q-16 4 -34 -2 Z" fill="#66bb6a" />
          <path d="M34 -2 Q18 -14 0 -6 Q16 4 34 -2 Z" fill="#43a047" />
        </g>
      )}
      <path d="M-20 -6 L-20 -32 L20 -32 L20 -6 Z" fill="#2e7d32" />
      <path d="M-20 -32 L-12 -40 H28 L20 -32 Z" fill="#43a047" />
      <path d="M20 -32 L28 -40 V-14 L20 -6 Z" fill="#1b5e20" />
      <path d="M-20 -6 L-20 -32 L20 -32 L20 -6 Z" fill="url(#k-gloss)" opacity="0.6" />
      <path d="M-8 -6 V-32 L0 -40 M8 -6 V-32 L16 -40 M-20 -19 H20 L28 -27 M-16 -36 H24" stroke="#d7ccc8" strokeWidth="1.8" fill="none" />
    </At>
  )
}

/** Ông lân. bow: cúi chào. */
function Lion({ x, y, s = 1, bow = false }: { x: number; y: number; s?: number; bow?: boolean }) {
  return (
    <At x={x} y={y} s={s}>
      <Shadow rx={44} />
      {/* Thân (tấm vải) và chân người múa */}
      <path d="M-6 -36 Q-40 -50 -70 -30 Q-74 -14 -62 -12 L-8 -14 Z" fill="#fdd835" />
      <path d="M-14 -40 q-6 6 0 12 M-28 -42 q-6 6 0 12 M-42 -40 q-6 6 0 12 M-56 -34 q-5 5 0 10" stroke="#e53935" strokeWidth="2.4" fill="none" />
      <path d="M-70 -30 Q-74 -14 -62 -12" stroke="#fff" strokeWidth="3" fill="none" />
      <rect x="-60" y="-14" width="7" height="14" rx="3" fill="#e53935" />
      <rect x="-48" y="-14" width="7" height="14" rx="3" fill="#e53935" />
      <rect x="-20" y="-14" width="7" height="14" rx="3" fill="#e53935" />
      <rect x="-8" y="-14" width="7" height="14" rx="3" fill="#e53935" />
      <g transform={bow ? 'rotate(24 0 -20)' : undefined}>
        <Anim cls={bow ? 'a-bob' : 'a-sway'}>
          {/* Đầu lân */}
          <path d="M-16 -58 Q-6 -82 14 -80 Q34 -78 36 -56 Q38 -34 22 -28 L-10 -28 Q-22 -36 -16 -58 Z" fill="#e53935" />
          <path d="M-16 -58 Q-6 -82 14 -80 Q34 -78 36 -56 Q38 -34 22 -28 L-10 -28 Q-22 -36 -16 -58 Z" fill="url(#k-ball)" />
          <path d="M-18 -60 Q-8 -88 16 -84 Q38 -80 40 -56" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" strokeDasharray="3 3" />
          <path d="M8 -80 L12 -92 L16 -80 Z" fill="#fdd835" />
          <circle cx="12" cy="-94" r="3" fill="#43a047" />
          <path d="M-4 -70 Q14 -76 30 -68" stroke="#fdd835" strokeWidth="4" fill="none" strokeLinecap="round" />
          <circle cx="4" cy="-58" r="8" fill="#fff" />
          <circle cx="24" cy="-58" r="8" fill="#fff" />
          <circle cx="6" cy="-57" r="4" fill="#263238" />
          <circle cx="26" cy="-57" r="4" fill="#263238" />
          <circle cx="7" cy="-59" r="1.4" fill="#fff" />
          <circle cx="27" cy="-59" r="1.4" fill="#fff" />
          <ellipse cx="15" cy="-46" rx="5" ry="3.4" fill="#fdd835" />
          <path d="M-4 -38 Q15 -26 34 -38 Q30 -30 15 -28 Q0 -30 -4 -38 Z" fill="#880e4f" />
          <path d="M2 -36 v3 M8 -34 v3 M14 -33 v3 M20 -34 v3 M26 -36 v3" stroke="#fff" strokeWidth="2" />
          <path d="M-10 -30 Q12 -22 32 -30" stroke="#fff" strokeWidth="3" fill="none" strokeDasharray="2 3" />
        </Anim>
      </g>
    </At>
  )
}

function Drum({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <At x={x} y={y} s={s}>
      <Shadow rx={18} />
      <path d="M-16 -6 V-30 H16 V-6 Z" fill="#c62828" />
      <ellipse cx="0" cy="-30" rx="16" ry="5" fill="#ffe0b2" stroke="#8d6e63" strokeWidth="1.4" />
      <ellipse cx="0" cy="-6" rx="16" ry="5" fill="#b71c1c" />
      <path d="M-16 -18 H16" stroke="#fdd835" strokeWidth="2" />
      <path d="M-14 -40 L-4 -32 M14 -42 L4 -32" stroke="#8d6e63" strokeWidth="2.4" strokeLinecap="round" />
    </At>
  )
}

/** Mâm mứt Tết. */
function CandyTray({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <At x={x} y={y} s={s}>
      <ellipse cx="0" cy="0" rx="24" ry="7" fill="#c62828" />
      <ellipse cx="0" cy="-2" rx="22" ry="5.5" fill="#e53935" />
      {[[-12, -4, '#fdd835'], [-4, -6, '#ec407a'], [5, -5, '#66bb6a'], [13, -3, '#ff9800'], [0, -2, '#ab47bc']].map(([cx, cy, c]) => (
        <circle key={`${cx}${cy}`} cx={cx as number} cy={cy as number} r="3.6" fill={c as string} />
      ))}
    </At>
  )
}

/** Câu đối đỏ treo tường (chỉ hoa văn, không chữ). */
function Scroll({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x} y={y} width="12" height="58" rx="2" fill="#e53935" />
      {[8, 22, 36, 50].map((dy) => (
        <circle key={dy} cx={x + 6} cy={y + dy} r="3" fill="none" stroke="#fdd835" strokeWidth="1.4" />
      ))}
    </g>
  )
}

function Stall({ x, y, c1, c2 }: { x: number; y: number; c1: string; c2: string }) {
  return (
    <g>
      <rect x={x + 4} y={y} width="4" height="56" fill="#795548" />
      <rect x={x + 82} y={y} width="4" height="56" fill="#795548" />
      <path d={`M${x - 4} ${y + 6} L${x + 6} ${y - 14} H${x + 84} L${x + 94} ${y + 6} Z`} fill={c1} />
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={i} d={`M${x - 4 + i * 20} ${y + 6} l10 -20 h10 l-10 20 Z`} fill={c2} />
      ))}
      <path d={`M${x - 4} ${y + 6} q10 8 20 0 q10 8 20 0 q10 8 20 0 q10 8 20 0 q10 8 18 0`} fill={c1} />
      <rect x={x} y={y + 40} width="90" height="16" rx="3" fill="url(#k-wood)" />
    </g>
  )
}

function Street({ children }: { children?: ReactNode }) {
  return (
    <>
      <DaySky />
      <Cloud x={150} y={60} s={0.8} />
      <rect x="0" y="146" width="320" height="54" fill="#e0c9a6" />
      <path d="M0 146 H320" stroke="#bcaaa4" strokeWidth="2" />
      {[0, 40, 80, 120, 160, 200, 240, 280].map((tx) => (
        <path key={tx} d={`M${tx} 160 h30 M${tx + 18} 178 h30`} stroke="#cfb48d" strokeWidth="1.4" />
      ))}
      {children}
    </>
  )
}

function Home({ children, evening = false }: { children?: ReactNode; evening?: boolean }) {
  return (
    <>
      <rect width="320" height="200" fill="url(#k-wall-warm)" />
      {evening && <rect width="320" height="200" fill="#ff8f00" opacity="0.08" />}
      <rect x="226" y="28" width="70" height="56" rx="6" fill={evening ? 'url(#k-sky-night)' : 'url(#k-sky-day)'} stroke="#8d6e63" strokeWidth="5" />
      <path d="M261 28 v56" stroke="#8d6e63" strokeWidth="3" />
      <Scroll x={24} y={24} />
      <Scroll x={196} y={24} />
      <rect x="0" y="150" width="320" height="50" fill="url(#k-floor)" />
      <path d="M0 150 H320" stroke="#8d6e63" strokeWidth="2" />
      {children}
    </>
  )
}

export function Scene({ scene, flavor }: { scene: string; flavor: string }) {
  switch (scene) {
    case 'start':
      return (
        <Street>
          <Stall x={10} y={92} c1="#e53935" c2="#fdd835" />
          <Stall x={220} y={92} c1="#43a047" c2="#fff" />
          <Vase x={34} y={146} s={0.7}>
            <Branch x={0} y={-40} s={0.7} c="#ffd54f" />
          </Vase>
          <Vase x={256} y={146} s={0.7}>
            <Branch x={0} y={-40} s={0.7} c="#f48fb1" />
          </Vase>
          <LanternString />
          <Dad x={140} y={190} s={1} shirt="#1e88e5" arms="hold" />
          <AoDaiHenry x={184} y={192} s={1.15} color={flavor} arms="wave" />
          <Sparkle x={210} y={110} />
        </Street>
      )
    case 'fork':
      return (
        <Street>
          <LanternString />
          <Vase x={70} y={170} s={1.2}>
            <Branch x={0} y={-40} s={1.2} c="#ffd54f" />
          </Vase>
          <Vase x={250} y={170} s={1.2}>
            <Branch x={0} y={-40} s={1.2} c="#f48fb1" />
          </Vase>
          <AoDaiHenry x={160} y={192} s={1.15} color={flavor} face="open" />
        </Street>
      )
    case 'mai':
      return (
        <Home>
          <rect x="70" y="128" width="110" height="10" rx="3" fill="url(#k-wood)" />
          <rect x="80" y="138" width="6" height="22" fill="#6d4c41" />
          <rect x="164" y="138" width="6" height="22" fill="#6d4c41" />
          <Vase x={124} y={128} s={0.9}>
            <Branch x={0} y={-40} s={1.1} c="#ffd54f" />
          </Vase>
          <Envelope x={166} y={104} s={0.8} />
          <Lantern x={90} y={92} s={0.45} />
          <AoDaiHenry x={232} y={192} s={1.15} color={flavor} face="open" />
        </Home>
      )
    case 'dao':
      return (
        <Home>
          <Vase x={268} y={170} s={1}>
            <Branch x={0} y={-40} s={1.15} c="#f48fb1" />
          </Vase>
          {/* Lá dong và gạo nếp trên chiếu */}
          <ellipse cx="80" cy="176" rx="58" ry="12" fill="#ffe082" />
          <path d="M40 172 Q60 158 80 170 Q60 180 40 172 Z M80 172 Q100 158 120 170 Q100 180 80 172 Z" fill="#43a047" />
          <ellipse cx="78" cy="180" rx="12" ry="5" fill="#fff" />
          <Drum x={176} y={180} s={0.8} />
          <AoDaiHenry x={136} y={194} s={1.1} color={flavor} face="open" />
        </Home>
      )
    case 'end-envelope':
      return (
        <Home>
          <Vase x={84} y={168} s={1.1}>
            <Branch x={0} y={-40} s={1.2} c="#ffd54f" deco="envelope" />
          </Vase>
          <Dad x={196} y={192} s={1} shirt="#1e88e5" arms="hug" face="open" />
          <AoDaiHenry x={224} y={192} s={1.05} color={flavor} arms="hug" flip />
          <Heart x={210} y={60} />
          <Heart x={236} y={74} s={0.7} c="#ef5350" />
        </Home>
      )
    case 'end-lantern':
      return (
        <Home evening>
          <Vase x={84} y={168} s={1.1}>
            <Branch x={0} y={-40} s={1.2} c="#ffd54f" deco="lantern" />
          </Vase>
          <rect x="150" y="156" width="140" height="10" rx="5" fill="#e57373" opacity="0.6" />
          <CandyTray x={220} y={164} s={1.1} />
          <Dad x={176} y={192} s={0.9} shirt="#1e88e5" arms="hold" />
          <AoDaiHenry x={262} y={192} s={1} color={flavor} arms="hold" face="open" />
        </Home>
      )
    case 'end-banhchung':
      return (
        <Home>
          <Vase x={278} y={170} s={0.9}>
            <Branch x={0} y={-40} s={1} c="#f48fb1" />
          </Vase>
          <Dad x={86} y={192} s={1} shirt="#1e88e5" arms="hold" />
          <BanhChung x={146} y={176} s={1.3} open />
          <AoDaiHenry x={206} y={192} s={1.1} color={flavor} arms="up" face="open" />
          <Sparkle x={150} y={98} s={1.2} />
          <Sparkle x={124} y={112} delay={0.5} />
        </Home>
      )
    case 'end-lion':
      return (
        <Street>
          <LanternString />
          <Stall x={220} y={92} c1="#e53935" c2="#fdd835" />
          <Lion x={150} y={188} s={1.1} bow />
          <Drum x={286} y={190} s={0.9} />
          <AoDaiHenry x={232} y={192} s={1.05} color={flavor} arms="up" face="open" />
          <Sparkle x={60} y={80} />
          <Sparkle x={196} y={70} delay={0.6} />
        </Street>
      )
    default:
      return <Street />
  }
}

export function Icon({ icon }: { icon: string }) {
  switch (icon) {
    case 'aodai-red':
    case 'aodai-yellow':
      return <AoDaiHenry x={50} y={70} s={0.95} color={icon.slice(6)} arms="wave" />
    case 'mai':
    case 'dao':
      return (
        <Vase x={50} y={68} s={0.5}>
          <Branch x={0} y={-40} s={1.25} c={icon === 'mai' ? '#ffd54f' : '#f48fb1'} />
        </Vase>
      )
    case 'envelope':
      return (
        <>
          <At x={36} y={12}>
            <g transform="rotate(-12)">
              <Envelope x={0} y={0} s={1.9} />
            </g>
          </At>
          <At x={66} y={16}>
            <g transform="rotate(10)">
              <Envelope x={0} y={0} s={1.7} />
            </g>
          </At>
        </>
      )
    case 'lantern':
      return (
        <>
          <Lantern x={34} y={14} s={1.15} />
          <Lantern x={70} y={18} s={0.9} delay={0.5} />
        </>
      )
    case 'banhchung':
      return <BanhChung x={46} y={60} s={1.25} />
    case 'lion':
      return <Lion x={60} y={70} s={0.62} />
    default:
      return <></>
  }
}

