// Hình truyện "Bác sĩ thú y Henry". Lựa chọn đầu: màu túi thuốc (red / blue).

import type { ReactNode } from 'react'
import { Anim, At, Dad, Heart, Henry, Shadow, Sparkle, Zzz, type Arms, type Face } from './kit'

const BAG: Record<string, string> = { red: '#e53935', blue: '#1e88e5' }

function DoctorBag({ x, y, s = 1, color }: { x: number; y: number; s?: number; color: string }) {
  const c = BAG[color] ?? color
  return (
    <At x={x} y={y} s={s}>
      <path d="M-7 -16 Q-7 -24 0 -24 Q7 -24 7 -16" stroke="#455a64" strokeWidth="3" fill="none" />
      <rect x="-16" y="-17" width="32" height="20" rx="5" fill={c} />
      <rect x="-16" y="-17" width="32" height="20" rx="5" fill="url(#k-gloss)" />
      <rect x="-16" y="-17" width="32" height="20" rx="5" fill="url(#k-shade)" />
      <path d="M0 -13 v12 M-6 -7 h12" stroke="#fff" strokeWidth="3.4" />
      <rect x="-16" y="-11" width="32" height="2" fill="#000" opacity="0.12" />
    </At>
  )
}

/** Doctor Henry: áo blouse trắng. */
function DocHenry({ x, y, s = 1, arms = 'down', face = 'smile', flip = false, children }: { x: number; y: number; s?: number; arms?: Arms; face?: Face; flip?: boolean; children?: ReactNode }) {
  return (
    <Henry x={x} y={y} s={s} shirt="#81d4fa" outfit="coat" arms={arms} face={face} flip={flip}>
      {children}
    </Henry>
  )
}

/** Bạn Mèo (mèo mướp cam). paw: giơ chân trước bị đau. */
function Cat({ x, y, s = 1, mood = 'smile', paw, flip = false }: { x: number; y: number; s?: number; mood?: 'smile' | 'sad'; paw?: 'thorn' | 'bandage'; flip?: boolean }) {
  return (
    <At x={x} y={y} s={s} flip={flip}>
      <Shadow rx={18} />
      <Anim cls="a-sway">
        <path d="M-14 -6 Q-30 -10 -28 -30 Q-26 -36 -22 -32 Q-24 -16 -10 -12 Z" fill="#ffa040" />
      </Anim>
      <ellipse cx="0" cy="-14" rx="15" ry="14" fill="#ffa040" />
      <ellipse cx="2" cy="-11" rx="8" ry="9" fill="#fff3e0" />
      <ellipse cx="0" cy="-14" rx="15" ry="14" fill="url(#k-ball)" />
      <ellipse cx="-8" cy="-1" rx="5" ry="3" fill="#ffa040" />
      {paw ? (
        <g>
          <path d="M8 -16 Q20 -22 22 -32" stroke="#ffa040" strokeWidth="7" fill="none" strokeLinecap="round" />
          <circle cx="22" cy="-33" r="4.6" fill="#ffe0b2" />
          {paw === 'thorn' && <path d="M24 -36 l6 -6" stroke="#6d4c41" strokeWidth="1.8" strokeLinecap="round" />}
          {paw === 'bandage' && <path d="M22 -39 l1.6 3.4 3.7 0.5 -2.7 2.6 0.7 3.7 -3.3 -1.8 -3.3 1.8 0.7 -3.7 -2.7 -2.6 3.7 -0.5 Z" fill="#fdd835" stroke="#fff" strokeWidth="0.8" />}
        </g>
      ) : (
        <ellipse cx="8" cy="-1" rx="5" ry="3" fill="#ffa040" />
      )}
      {/* Đầu */}
      <path d="M-14 -36 L-12 -50 L-3 -42 Z M14 -36 L12 -50 L3 -42 Z" fill="#ffa040" />
      <path d="M-11 -40 L-11 -46 L-6 -42 Z M11 -40 L11 -46 L6 -42 Z" fill="#f8bbd0" />
      <ellipse cx="0" cy="-33" rx="15" ry="12" fill="#ffa040" />
      <path d="M-4 -44 l1 5 M0 -45 v5 M4 -44 l-1 5" stroke="#e67e22" strokeWidth="1.6" strokeLinecap="round" />
      <ellipse cx="0" cy="-33" rx="15" ry="12" fill="url(#k-ball)" />
      {mood === 'sad' ? (
        <g stroke="#3e2723" strokeWidth="1.4" fill="none" strokeLinecap="round">
          <path d="M-8 -35 q2.5 2 5 0 M3 -35 q2.5 2 5 0" />
          <path d="M-2.5 -26 q2.5 -2 5 0" />
        </g>
      ) : (
        <g>
          <ellipse cx="-5.5" cy="-35" rx="2" ry="2.6" fill="#3e2723" />
          <ellipse cx="5.5" cy="-35" rx="2" ry="2.6" fill="#3e2723" />
          <circle cx="-4.8" cy="-36" r="0.8" fill="#fff" />
          <circle cx="6.2" cy="-36" r="0.8" fill="#fff" />
          <path d="M-3.5 -28 q1.7 2 3.5 0 q1.7 2 3.5 0" stroke="#3e2723" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        </g>
      )}
      <path d="M-1.4 -31 h2.8 l-1.4 1.6 Z" fill="#f06292" />
      <path d="M-8 -30 h-9 M-8 -28 l-8 2 M8 -30 h9 M8 -28 l8 2" stroke="#5d4037" strokeWidth="0.8" />
      {mood === 'sad' && (
        <Anim cls="a-drip">
          <path d="M-6 -32 q-2 3.5 0 5.5 q2 -2 0 -5.5 Z" fill="#81d4fa" />
        </Anim>
      )}
    </At>
  )
}

/** Bạn Thỏ (trắng, tai hồng). nose: sổ mũi; scarf: quàng khăn; sleep: ngủ; mug: cầm cốc nước ấm. */
function Bunny({ x, y, s = 1, nose = false, sneeze = false, scarf = false, sleep = false, mug = false, hop = false }: {
  x: number
  y: number
  s?: number
  nose?: boolean
  sneeze?: boolean
  scarf?: boolean
  sleep?: boolean
  mug?: boolean
  hop?: boolean
}) {
  const body = (
    <g>
      <ellipse cx="0" cy="-14" rx="14" ry="14" fill="#fafafa" />
      <ellipse cx="0" cy="-14" rx="14" ry="14" fill="url(#k-ball)" />
      <circle cx="-14" cy="-8" r="5" fill="#fff" />
      <ellipse cx="-7" cy="-1" rx="6" ry="3" fill="#fafafa" />
      <ellipse cx="7" cy="-1" rx="6" ry="3" fill="#fafafa" />
      {/* Tai */}
      <g>
        <ellipse cx="-6" cy="-54" rx="5" ry="14" fill="#fafafa" transform="rotate(-10 -6 -54)" />
        <ellipse cx="-6" cy="-54" rx="2.4" ry="10" fill="#f8bbd0" transform="rotate(-10 -6 -54)" />
        <ellipse cx="7" cy="-54" rx="5" ry="14" fill="#fafafa" transform={sleep ? 'rotate(60 7 -42)' : 'rotate(12 7 -54)'} />
        <ellipse cx="7" cy="-54" rx="2.4" ry="10" fill="#f8bbd0" transform={sleep ? 'rotate(60 7 -42)' : 'rotate(12 7 -54)'} />
      </g>
      <circle cx="0" cy="-34" r="12.5" fill="#fafafa" />
      <circle cx="0" cy="-34" r="12.5" fill="url(#k-ball)" />
      {sleep || sneeze ? (
        <g stroke="#3e2723" strokeWidth="1.3" fill="none" strokeLinecap="round">
          <path d="M-7 -36 q2.5 2 5 0 M2 -36 q2.5 2 5 0" />
        </g>
      ) : (
        <g>
          <ellipse cx="-4.5" cy="-36" rx="1.9" ry="2.4" fill="#3e2723" />
          <ellipse cx="4.5" cy="-36" rx="1.9" ry="2.4" fill="#3e2723" />
          <circle cx="-3.9" cy="-37" r="0.7" fill="#fff" />
          <circle cx="5.1" cy="-37" r="0.7" fill="#fff" />
        </g>
      )}
      <ellipse cx="0" cy="-31" rx="2" ry="1.5" fill={nose ? '#e57373' : '#f48fb1'} />
      {sneeze ? (
        <ellipse cx="0" cy="-26.5" rx="2.2" ry="2.6" fill="#8d4a3b" />
      ) : (
        <path d="M-2.5 -28 q1.2 1.5 2.5 0 q1.2 1.5 2.5 0" stroke="#3e2723" strokeWidth="1" fill="none" />
      )}
      <ellipse cx="-8" cy="-30" rx="2.4" ry="1.5" fill="#f48fb1" opacity="0.7" />
      <ellipse cx="8" cy="-30" rx="2.4" ry="1.5" fill="#f48fb1" opacity="0.7" />
      {nose && <path d="M1.6 -30 q1 3 0 5" stroke="#81d4fa" strokeWidth="1.6" fill="none" strokeLinecap="round" />}
      {scarf && (
        <g>
          <path d="M-12 -24 Q0 -18 12 -24 L12 -19 Q0 -13 -12 -19 Z" fill="#e53935" />
          <path d="M6 -20 L10 -6 L4 -6 L2 -19 Z" fill="#c62828" />
          <path d="M-12 -24 Q0 -18 12 -24" stroke="#fff" strokeWidth="1" strokeDasharray="2 2" fill="none" />
        </g>
      )}
      {mug && (
        <g>
          <Anim cls="a-drift">
            <path d="M-2 -26 q-3 -5 0 -9 q3 -4 0 -8" stroke="#fff" strokeWidth="2" fill="none" opacity="0.85" strokeLinecap="round" />
          </Anim>
          <rect x="-7" y="-24" width="13" height="13" rx="3" fill="#ffb74d" />
          <path d="M6 -21 q5 0 5 3.5 q0 3.5 -5 3.5" stroke="#ffb74d" strokeWidth="2" fill="none" />
          <circle cx="-9" cy="-16" r="3" fill="#fafafa" />
          <circle cx="9" cy="-16" r="3" fill="#fafafa" />
        </g>
      )}
    </g>
  )
  return (
    <At x={x} y={y} s={s}>
      <Shadow rx={16} />
      {hop ? <Anim cls="a-hop">{body}</Anim> : body}
    </At>
  )
}

function Puppy({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <At x={x} y={y} s={s}>
      <Shadow rx={14} />
      <ellipse cx="0" cy="-12" rx="12" ry="11" fill="#d7a86e" />
      <circle cx="0" cy="-30" r="11" fill="#d7a86e" />
      <ellipse cx="-11" cy="-28" rx="4.5" ry="9" fill="#8d6e63" />
      <ellipse cx="11" cy="-28" rx="4.5" ry="9" fill="#8d6e63" />
      <circle cx="-4" cy="-32" r="1.8" fill="#3e2723" />
      <circle cx="4" cy="-32" r="1.8" fill="#3e2723" />
      <ellipse cx="0" cy="-27" rx="3" ry="2" fill="#3e2723" />
      <path d="M-2 -24 q2 2 4 0" stroke="#3e2723" strokeWidth="1" fill="none" />
    </At>
  )
}

/** Phòng khám: tường, sàn, cửa sổ, kệ thuốc, tranh dấu chân. */
function Clinic({ children }: { children?: ReactNode }) {
  return (
    <>
      <rect width="320" height="200" fill="url(#k-wall)" />
      <rect y="0" width="320" height="10" fill="#b3e5fc" />
      {/* Cửa sổ */}
      <rect x="208" y="26" width="84" height="60" rx="6" fill="url(#k-sky-day)" stroke="#fff" strokeWidth="5" />
      <path d="M250 26 v60 M208 56 h84" stroke="#fff" strokeWidth="4" />
      <circle cx="270" cy="44" r="7" fill="url(#k-sun)" />
      {/* Tranh dấu chân */}
      <rect x="30" y="28" width="46" height="40" rx="6" fill="#fff" stroke="#f8bbd0" strokeWidth="3" />
      <ellipse cx="53" cy="54" rx="8" ry="6.5" fill="#f06292" />
      {[[-9, -6], [-3, -11], [3, -11], [9, -6]].map(([px, py]) => (
        <ellipse key={`${px}${py}`} cx={53 + px} cy={50 + py} rx="3" ry="3.6" fill="#f06292" />
      ))}
      {/* Kệ */}
      <rect x="100" y="60" width="72" height="5" rx="2" fill="url(#k-wood)" />
      <rect x="106" y="44" width="10" height="16" rx="3" fill="#a5d6a7" />
      <rect x="120" y="40" width="10" height="20" rx="3" fill="#ffcc80" />
      <rect x="134" y="46" width="10" height="14" rx="3" fill="#90caf9" />
      <circle cx="158" cy="53" r="7" fill="#f48fb1" />
      <rect x="0" y="146" width="320" height="54" fill="url(#k-floor)" />
      <path d="M0 146 H320" stroke="#8d6e63" strokeWidth="2" />
      {[40, 100, 160, 220, 280].map((fx) => (
        <path key={fx} d={`M${fx} 146 L${fx - 20} 200`} stroke="#b08d64" strokeWidth="1" />
      ))}
      {children}
    </>
  )
}

/** Băng ghế chờ. */
function Bench({ x, y, w = 120 }: { x: number; y: number; w?: number }) {
  return (
    <g>
      <rect x={x} y={y - 10} width={w} height="10" rx="4" fill="#4db6ac" />
      <rect x={x} y={y - 10} width={w} height="10" rx="4" fill="url(#k-gloss)" />
      <rect x={x + 8} y={y} width="6" height="22" fill="#78909c" />
      <rect x={x + w - 14} y={y} width="6" height="22" fill="#78909c" />
    </g>
  )
}

/** Bàn khám. */
function Table({ x, y, w = 110 }: { x: number; y: number; w?: number }) {
  return (
    <g>
      <rect x={x} y={y - 8} width={w} height="10" rx="4" fill="#eceff1" />
      <rect x={x} y={y - 8} width={w} height="10" rx="4" fill="url(#k-shade)" />
      <rect x={x + 4} y={y - 12} width={w - 8} height="6" rx="3" fill="#80cbc4" />
      <rect x={x + 10} y={y + 2} width="6" height="40" fill="#90a4ae" />
      <rect x={x + w - 16} y={y + 2} width="6" height="40" fill="#90a4ae" />
    </g>
  )
}

export function Scene({ scene, flavor }: { scene: string; flavor: string }) {
  switch (scene) {
    case 'start':
      return (
        <Clinic>
          <Dad x={96} y={188} s={1} nurse arms="wave" />
          <DocHenry x={176} y={190} s={1.25} arms="hold">
            <DoctorBag x={0} y={-20} s={0.75} color={flavor} />
          </DocHenry>
          <Sparkle x={210} y={110} />
        </Clinic>
      )
    case 'fork':
      return (
        <Clinic>
          <Bench x={150} y={158} w={150} />
          <Cat x={192} y={150} s={1} mood="sad" paw="thorn" />
          <Bunny x={264} y={150} s={1} nose />
          <DocHenry x={84} y={192} s={1.15} face="open">
            <DoctorBag x={-16} y={-14} s={0.6} color={flavor} />
          </DocHenry>
        </Clinic>
      )
    case 'cat':
      return (
        <Clinic>
          <Table x={150} y={150} w={130} />
          <Cat x={214} y={138} s={1.45} mood="sad" paw="thorn" />
          <DocHenry x={104} y={192} s={1.2} face="open" arms="hold" />
          <DoctorBag x={60} y={192} s={1} color={flavor} />
        </Clinic>
      )
    case 'bunny':
      return (
        <Clinic>
          <Table x={150} y={150} w={130} />
          <Bunny x={214} y={138} s={1.35} nose sneeze />
          {/* Hắt xì */}
          <Anim cls="a-pulse">
            <g fill="#b3e5fc">
              <circle cx="190" cy="104" r="2.4" />
              <circle cx="182" cy="96" r="2" />
              <circle cx="194" cy="92" r="1.6" />
            </g>
          </Anim>
          <DocHenry x={104} y={192} s={1.2} face="open" arms="hold" />
          <DoctorBag x={60} y={192} s={1} color={flavor} />
        </Clinic>
      )
    case 'end-thorn':
      return (
        <Clinic>
          <Cat x={200} y={190} s={1.45} flip />
          <DocHenry x={138} y={192} s={1.2} arms="hug" />
          <Heart x={176} y={96} />
          <Heart x={204} y={80} s={0.7} c="#ef5350" />
          <DoctorBag x={60} y={192} s={1} color={flavor} />
        </Clinic>
      )
    case 'end-bandage':
      return (
        <Clinic>
          <Dad x={70} y={188} s={0.95} nurse arms="wave" />
          <DocHenry x={128} y={192} s={1.1} arms="wave" />
          <Cat x={204} y={190} s={1.3} paw="bandage" />
          <Puppy x={258} y={190} s={0.9} />
          <Sparkle x={236} y={124} />
          <DoctorBag x={30} y={194} s={0.8} color={flavor} />
        </Clinic>
      )
    case 'end-drink':
      return (
        <Clinic>
          <Bunny x={210} y={188} s={1.45} mug hop />
          <DocHenry x={128} y={192} s={1.2} arms="wave" />
          <Sparkle x={250} y={96} />
          <DoctorBag x={60} y={192} s={1} color={flavor} />
        </Clinic>
      )
    case 'end-scarf':
      return (
        <Clinic>
          {/* Giỏ ngủ */}
          <ellipse cx="210" cy="186" rx="52" ry="10" fill="#000" opacity="0.15" />
          <path d="M162 160 Q162 190 210 190 Q258 190 258 160 Z" fill="#c68642" />
          <path d="M166 168 H254 M170 178 H250" stroke="#8d5524" strokeWidth="1.4" />
          <ellipse cx="210" cy="160" rx="48" ry="8" fill="#f8bbd0" />
          <Bunny x={210} y={168} s={1.25} scarf sleep />
          <Zzz x={246} y={112} />
          <DocHenry x={104} y={192} s={1.15} face="sleepy" />
          <DoctorBag x={52} y={192} s={1} color={flavor} />
        </Clinic>
      )
    default:
      return <Clinic />
  }
}

export function Icon({ icon }: { icon: string }) {
  switch (icon) {
    case 'bag-red':
    case 'bag-blue':
      return <DoctorBag x={50} y={56} s={1.7} color={icon.slice(4)} />
    case 'cat':
      return <Cat x={50} y={68} s={1.1} mood="sad" paw="thorn" />
    case 'bunny':
      return <Bunny x={50} y={68} s={1} nose />
    case 'thorn':
      return (
        <>
          <circle cx="44" cy="40" r="20" fill="#ffe0b2" />
          {[[-12, -18], [-2, -24], [9, -22], [17, -12]].map(([px, py]) => (
            <ellipse key={`${px}${py}`} cx={44 + px} cy={40 + py} rx="6" ry="7" fill="#ffe0b2" />
          ))}
          <path d="M50 36 L74 14" stroke="#6d4c41" strokeWidth="4" strokeLinecap="round" />
          <path d="M70 26 l8 -8 M74 30 l8 -8" stroke="#90a4ae" strokeWidth="2.5" strokeLinecap="round" />
        </>
      )
    case 'bandage':
      return (
        <At x={50} y={36} s={1}>
          <g transform="rotate(-20)">
            <rect x="-38" y="-11" width="76" height="22" rx="11" fill="#ffcc80" />
            <rect x="-14" y="-11" width="28" height="22" fill="#ffe0b2" />
            <path d="M0 -8 l2.6 5.4 6 0.8 -4.4 4.2 1 6 -5.2 -2.8 -5.2 2.8 1 -6 -4.4 -4.2 6 -0.8 Z" fill="#fdd835" stroke="#fff" strokeWidth="1" />
            {[-30, -24, 24, 30].map((dx) => (
              <circle key={dx} cx={dx} cy="0" r="1.4" fill="#e0a060" />
            ))}
          </g>
        </At>
      )
    case 'drink':
      return (
        <At x={46} y={64}>
          <Anim cls="a-drift">
            <path d="M-6 -36 q-5 -7 0 -12 q5 -6 0 -12 M6 -36 q-5 -7 0 -12 q5 -6 0 -12" stroke="#b0bec5" strokeWidth="2.6" fill="none" strokeLinecap="round" />
          </Anim>
          <rect x="-16" y="-32" width="32" height="32" rx="7" fill="#ffb74d" />
          <rect x="-16" y="-32" width="32" height="32" rx="7" fill="url(#k-ball)" />
          <path d="M16 -24 q12 0 12 9 q0 9 -12 9" stroke="#ffb74d" strokeWidth="5" fill="none" />
          <path d="M-4 -18 q4 -4 8 0 q-4 6 -8 0 Z" fill="#fff" />
        </At>
      )
    case 'scarf':
      return (
        <At x={50} y={32}>
          <path d="M-36 -10 Q0 6 36 -10 L36 4 Q0 20 -36 4 Z" fill="#e53935" />
          <path d="M14 6 L24 32 L10 32 L4 8 Z" fill="#c62828" />
          <path d="M-36 -4 Q0 12 36 -4" stroke="#fff" strokeWidth="1.6" strokeDasharray="3 3" fill="none" />
          <path d="M12 32 v5 M17 32 v5 M22 32 v5" stroke="#c62828" strokeWidth="2" />
        </At>
      )
    default:
      return <></>
  }
}

