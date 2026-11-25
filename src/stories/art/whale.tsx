// Hình truyện "Henry và cá voi con". Lựa chọn đầu: màu áo phao (yellow / orange).

import { Anim, At, Cloud, DaySky, Dad, Heart, Henry, Note, Sparkle, Sun } from './kit'

const VEST: Record<string, string> = { yellow: '#fdd835', orange: '#ff7043' }

// ---------- Biển ----------

/** Nước biển đục phía sau (từ mặt nước y xuống đáy). */
function SeaBack({ y }: { y: number }) {
  return <rect x="0" y={y} width="320" height={200 - y} fill="url(#k-deep)" />
}

/** Lớp nước trong phía trước: vật vẽ trước lớp này trông như chìm dưới nước. */
function SeaFront({ y, opacity = 0.5 }: { y: number; opacity?: number }) {
  return (
    <g>
      <path d={`M0 ${y} Q20 ${y - 4} 40 ${y} T80 ${y} T120 ${y} T160 ${y} T200 ${y} T240 ${y} T280 ${y} T320 ${y} V200 H0 Z`} fill="url(#k-sea)" opacity={opacity} />
      <Anim cls="a-drift">
        <path
          d={`M-10 ${y} Q10 ${y - 4} 30 ${y} T70 ${y} T110 ${y} T150 ${y} T190 ${y} T230 ${y} T270 ${y} T310 ${y} T350 ${y}`}
          stroke="#fff"
          strokeWidth="2.2"
          fill="none"
          opacity="0.85"
        />
      </Anim>
    </g>
  )
}

function Bubbles({ pts }: { pts: [number, number][] }) {
  return (
    <g>
      {pts.map(([x, y], i) => (
        <Anim key={`${x}-${y}`} cls="a-bob" delay={i * 0.3}>
          <circle cx={x} cy={y} r={2 + (i % 3)} fill="none" stroke="#e1f5fe" strokeWidth="1.2" opacity="0.8" />
        </Anim>
      ))}
    </g>
  )
}

/** Cá voi nhìn sang phải. kind: 'baby' nhỏ màu sáng, 'mom' to màu đậm. */
function Whale({ x, y, s = 1, kind = 'baby', tear = false, spout = false, flip = false, happy = false }: {
  x: number
  y: number
  s?: number
  kind?: 'baby' | 'mom'
  tear?: boolean
  spout?: boolean
  flip?: boolean
  happy?: boolean
}) {
  const c = kind === 'baby' ? '#64b5f6' : '#1e88e5'
  const body = 'M-40 0 C-40 -24 -10 -30 14 -26 C34 -22 46 -8 44 6 C42 18 22 22 0 22 C-22 22 -34 14 -40 0 Z'
  return (
    <At x={x} y={y} s={s} flip={flip}>
      <Anim cls="a-bob">
        {spout && (
          <Anim cls="a-pulse">
            <path d="M12 -27 Q8 -44 -4 -48 M12 -27 Q12 -48 12 -54 M12 -27 Q16 -44 28 -48" stroke="#b3e5fc" strokeWidth="4" fill="none" strokeLinecap="round" />
            <circle cx="-5" cy="-49" r="3" fill="#e1f5fe" />
            <circle cx="12" cy="-55" r="3" fill="#e1f5fe" />
            <circle cx="29" cy="-49" r="3" fill="#e1f5fe" />
          </Anim>
        )}
        <path d="M-36 2 L-58 -14 Q-60 -2 -52 4 Q-60 12 -58 20 Z" fill={c} />
        <path d={body} fill={c} />
        <path d="M-26 12 C-8 22 26 22 42 8 C40 18 22 22 0 22 C-14 22 -22 18 -26 12 Z" fill="#e3f2fd" />
        <path d="M-6 16 l2 5 M4 17 l1 5 M14 16 l0 5 M24 13 l-1 5" stroke="#90caf9" strokeWidth="1.2" />
        <path d={body} fill="url(#k-ball)" />
        <path d="M2 8 Q-6 20 -16 18 Q-8 10 2 8 Z" fill={kind === 'baby' ? '#42a5f5' : '#1565c0'} />
        <ellipse cx="26" cy="-6" rx="2.6" ry="3.2" fill="#263238" />
        <circle cx="27" cy="-7.2" r="1" fill="#fff" />
        <ellipse cx="32" cy="2" rx="3" ry="1.8" fill="#f48fb1" opacity="0.7" />
        {happy || !tear ? (
          <path d="M30 6 Q36 9 42 5" stroke="#263238" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        ) : (
          <path d="M31 8 Q36 5 41 8" stroke="#263238" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        )}
        {tear && (
          <Anim cls="a-drip">
            <path d="M25 -1 q-2.5 4.5 0 7 q2.5 -2.5 0 -7 Z" fill="#e1f5fe" />
          </Anim>
        )}
      </Anim>
    </At>
  )
}

/** Thuyền nhỏ, ba và Henry (mặc áo phao màu vest). (x, y) là mặt nước giữa thuyền. */
function Boat({ x, y, s = 1, vest, henryArms = 'wave', henryFace = 'smile' }: { x: number; y: number; s?: number; vest: string; henryArms?: 'wave' | 'up' | 'down' | 'hold'; henryFace?: 'smile' | 'open' }) {
  const hull = 'M-54 -16 L54 -16 Q52 0 40 8 L-40 8 Q-52 0 -54 -16 Z'
  return (
    <At x={x} y={y} s={s}>
      <Anim cls="a-bob">
        <rect x="-3" y="-66" width="3" height="50" fill="url(#k-wood)" />
        <path d="M0 -64 L22 -58 L0 -52 Z" fill="#ef5350" />
        <Dad x={-20} y={6} s={0.72} shirt="#26a69a" arms="hold" shadow={false} />
        <Henry x={22} y={4} s={0.88} shirt="#ffffff" vest={vest} arms={henryArms} face={henryFace} shadow={false} />
        <path d={hull} fill="#fafafa" />
        <path d="M-52 -9 L52 -9 L50 -4 L-50 -4 Z" fill="#e53935" />
        <path d={hull} fill="url(#k-shade)" />
        <rect x="-56" y="-19" width="112" height="5" rx="2.5" fill="url(#k-wood)" />
        <circle cx="34" cy="-2" r="2.4" fill="#90a4ae" />
        <circle cx="-34" cy="-2" r="2.4" fill="#90a4ae" />
      </Anim>
    </At>
  )
}

function Clownfish({ x, y, s = 1, flip = false }: { x: number; y: number; s?: number; flip?: boolean }) {
  return (
    <At x={x} y={y} s={s} flip={flip}>
      <Anim cls="a-bob">
        <path d="M-14 0 L-22 -7 L-21 7 Z" fill="#ff7043" stroke="#263238" strokeWidth="0.8" />
        <ellipse cx="0" cy="0" rx="15" ry="9" fill="#ff7043" stroke="#263238" strokeWidth="0.8" />
        <path d="M-6 -8.5 Q-3 0 -6 8.5 M4 -9 Q7 0 4 9" stroke="#fff" strokeWidth="3.4" fill="none" />
        <path d="M-6 -8.5 Q-3 0 -6 8.5 M4 -9 Q7 0 4 9" stroke="#263238" strokeWidth="0.6" fill="none" />
        <ellipse cx="0" cy="0" rx="15" ry="9" fill="url(#k-ball)" />
        <circle cx="9" cy="-2" r="2" fill="#263238" />
        <circle cx="9.6" cy="-2.6" r="0.7" fill="#fff" />
        <path d="M11 3 q2 1 3 -1" stroke="#263238" strokeWidth="0.8" fill="none" />
      </Anim>
    </At>
  )
}

function SeaTurtle({ x, y, s = 1, flip = false }: { x: number; y: number; s?: number; flip?: boolean }) {
  return (
    <At x={x} y={y} s={s} flip={flip}>
      <Anim cls="a-bob">
        <path d="M-6 6 Q-14 20 -26 18 Q-18 10 -12 4 Z M8 6 Q12 18 22 20 Q16 10 14 4 Z" fill="#81c784" />
        <path d="M-8 -6 Q-18 -18 -30 -16 Q-22 -8 -12 -2 Z M8 -6 Q16 -20 28 -20 Q22 -10 14 -2 Z" fill="#81c784" />
        <ellipse cx="24" cy="-1" rx="8" ry="6" fill="#81c784" />
        <circle cx="27" cy="-3" r="1.4" fill="#263238" />
        <path d="M27 1 q2 1 4 -0.5" stroke="#263238" strokeWidth="0.8" fill="none" />
        <ellipse cx="0" cy="0" rx="20" ry="13" fill="#2e7d32" />
        <path d="M-8 -7 l8 -4 8 4 0 8 -8 4 -8 -4 Z M-18 0 h10 M8 0 h10" stroke="#a5d6a7" strokeWidth="1.2" fill="none" />
        <ellipse cx="0" cy="0" rx="20" ry="13" fill="url(#k-ball)" />
      </Anim>
    </At>
  )
}

function Seagull({ x, y, s = 1, flying = true, delay = 0 }: { x: number; y: number; s?: number; flying?: boolean; delay?: number }) {
  return (
    <At x={x} y={y} s={s}>
      <Anim cls="a-bob" delay={delay}>
        {flying ? (
          <>
            <path d="M-16 -2 Q-8 -12 0 -2 Q8 -12 16 -2 Q8 -6 0 1 Q-8 -6 -16 -2 Z" fill="#eceff1" stroke="#90a4ae" strokeWidth="0.8" />
            <ellipse cx="0" cy="0" rx="5" ry="3.4" fill="#fff" />
            <path d="M4 0 l4 1 -4 1 Z" fill="#ffa726" />
          </>
        ) : (
          <>
            <ellipse cx="0" cy="-6" rx="9" ry="6" fill="#fff" />
            <path d="M-8 -6 Q-2 -12 6 -6 Q-2 -3 -8 -6 Z" fill="#b0bec5" />
            <circle cx="7" cy="-12" r="4.4" fill="#fff" />
            <circle cx="8.5" cy="-13" r="0.9" fill="#263238" />
            <path d="M11 -12 l5 1 -5 1.4 Z" fill="#ffa726" />
            <path d="M-1 0 v4 M3 0 v4" stroke="#ffa726" strokeWidth="1.3" />
          </>
        )}
      </Anim>
    </At>
  )
}

function Coral({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <At x={x} y={y} s={s}>
      <Anim cls="a-sway">
        <path d="M-30 0 Q-34 -20 -26 -34 M-28 -18 Q-20 -24 -18 -34 M-30 -10 Q-40 -16 -42 -24" stroke="#4db6ac" strokeWidth="4" fill="none" strokeLinecap="round" />
      </Anim>
      <path d="M-10 0 V-18 M-10 -12 Q-18 -18 -18 -28 M-10 -16 Q-4 -24 -6 -34 M-10 -6 Q0 -10 2 -18" stroke="#f06292" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M14 0 V-14 M14 -10 Q6 -16 8 -24 M14 -12 Q22 -18 20 -28" stroke="#ff8a65" strokeWidth="5" fill="none" strokeLinecap="round" />
      <ellipse cx="30" cy="-6" rx="10" ry="7" fill="#ba68c8" />
      {[-6, -2, 2, 6].map((dx) => (
        <path key={dx} d={`M${30 + dx} -10 q${dx / 3} -6 ${dx / 2} -9`} stroke="#ce93d8" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      ))}
      <circle cx="-20" cy="-2" r="5" fill="#ffd54f" />
      <circle cx="-20" cy="-2" r="5" fill="url(#k-ball)" />
    </At>
  )
}

function Island({ x, y, s = 1, lighthouse = false, lit = false }: { x: number; y: number; s?: number; lighthouse?: boolean; lit?: boolean }) {
  return (
    <At x={x} y={y} s={s}>
      {lit && (
        <Anim cls="a-pulse">
          <path d="M14 -76 L-90 -104 L-90 -52 Z" fill="#fff59d" opacity="0.55" />
        </Anim>
      )}
      <path d="M-52 4 Q-40 -18 0 -20 Q40 -18 52 4 Z" fill="url(#k-sand)" />
      <path d="M-40 -6 Q-30 -16 -14 -16" stroke="#9ccc65" strokeWidth="5" strokeLinecap="round" fill="none" />
      {/* Cây dừa */}
      <path d="M-26 -16 Q-30 -40 -20 -58" stroke="#8d6e63" strokeWidth="5" fill="none" strokeLinecap="round" />
      <Anim cls="a-sway">
        <path d="M-20 -58 Q-34 -64 -44 -54 M-20 -58 Q-8 -68 2 -58 M-20 -58 Q-26 -72 -38 -72 M-20 -58 Q-10 -76 4 -74" stroke="#43a047" strokeWidth="6" fill="none" strokeLinecap="round" />
        <circle cx="-22" cy="-55" r="3" fill="#6d4c41" />
        <circle cx="-17" cy="-56" r="3" fill="#6d4c41" />
      </Anim>
      {lighthouse && (
        <g>
          <path d="M6 -18 L10 -70 H22 L26 -18 Z" fill="#fafafa" />
          <path d="M8.2 -40 L9 -52 H23 L23.8 -40 Z M7 -26 L7.6 -34 H24.4 L25 -26 Z" fill="#e53935" />
          <path d="M6 -18 L10 -70 H22 L26 -18 Z" fill="url(#k-shade)" />
          <rect x="8" y="-82" width="16" height="12" rx="2" fill={lit ? '#fff59d' : '#b3e5fc'} stroke="#455a64" strokeWidth="1.5" />
          {lit && <circle cx="16" cy="-76" r="14" fill="url(#k-glow)" />}
          <path d="M6 -82 L16 -92 L26 -82 Z" fill="#e53935" />
          <rect x="4" y="-71" width="24" height="3" fill="#455a64" />
        </g>
      )}
    </At>
  )
}

function Dock() {
  return (
    <g>
      {[8, 34, 60].map((px) => (
        <rect key={px} x={px} y="112" width="7" height="40" fill="url(#k-wood)" />
      ))}
      <rect x="0" y="108" width="74" height="8" rx="2" fill="#a1887f" />
      <rect x="0" y="108" width="74" height="8" rx="2" fill="url(#k-gloss)" />
      <path d="M0 108 h74" stroke="#6d4c41" strokeWidth="1" />
    </g>
  )
}

function Sky() {
  return (
    <>
      <DaySky />
      <Sun x={282} y={30} r={14} />
      <Cloud x={70} y={28} />
      <Cloud x={196} y={20} s={0.7} />
    </>
  )
}

export function Scene({ scene, flavor }: { scene: string; flavor: string }) {
  const vest = VEST[flavor] ?? flavor
  switch (scene) {
    case 'start':
      return (
        <>
          <Sky />
          <SeaBack y={112} />
          <Dock />
          <Seagull x={30} y={108} s={0.9} flying={false} />
          <Seagull x={230} y={60} s={0.9} />
          <Seagull x={256} y={74} s={0.7} delay={0.5} />
          <Boat x={170} y={160} s={1.05} vest={vest} />
          <SeaFront y={150} opacity={0.45} />
        </>
      )
    case 'fork':
      return (
        <>
          <Sky />
          <SeaBack y={106} />
          <Island x={286} y={112} s={0.6} lighthouse />
          {/* Rạn san hô nhô lên bên trái */}
          <Coral x={50} y={128} s={0.7} />
          <SeaFront y={112} opacity={0.55} />
          <Whale x={180} y={140} s={0.95} tear />
          <SeaFront y={146} opacity={0.4} />
          <Boat x={86} y={178} s={0.72} vest={vest} henryArms="down" henryFace="open" />
        </>
      )
    case 'coral':
      return (
        <>
          <Sky />
          <SeaBack y={62} />
          <path d="M0 184 Q80 172 160 182 T320 180 V200 H0 Z" fill="url(#k-sand)" />
          <Coral x={60} y={186} s={1.2} />
          <Coral x={250} y={188} s={1} />
          <Clownfish x={120} y={150} s={1.1} />
          <SeaTurtle x={210} y={128} s={1.1} flip />
          <Whale x={170} y={176} s={0.6} tear />
          <Bubbles pts={[[96, 120], [104, 104], [230, 100], [236, 86], [150, 96]]} />
          <SeaFront y={62} opacity={0.35} />
          <Boat x={80} y={66} s={0.62} vest={vest} henryArms="down" henryFace="open" />
        </>
      )
    case 'island':
      return (
        <>
          <Sky />
          <SeaBack y={118} />
          <Island x={230} y={140} s={1.25} lighthouse />
          <Seagull x={170} y={50} s={0.9} />
          <Seagull x={196} y={36} s={0.7} delay={0.4} />
          <Seagull x={268} y={130} s={0.8} flying={false} />
          <SeaFront y={132} opacity={0.4} />
          <Whale x={128} y={160} s={0.7} tear />
          <SeaFront y={164} opacity={0.35} />
          <Boat x={60} y={186} s={0.66} vest={vest} henryArms="down" />
        </>
      )
    case 'end-clownfish':
      return (
        <>
          <Sky />
          <SeaBack y={92} />
          <path d="M0 186 Q80 176 160 184 T320 182 V200 H0 Z" fill="url(#k-sand)" />
          <Coral x={46} y={188} s={1} />
          <Coral x={280} y={190} s={0.9} />
          <Whale x={170} y={110} s={1.25} kind="mom" spout />
          <Whale x={240} y={122} s={0.7} spout happy />
          <Clownfish x={120} y={158} s={1} />
          <Clownfish x={150} y={170} s={0.7} />
          <Heart x={206} y={50} />
          <SeaFront y={96} opacity={0.4} />
          <Boat x={56} y={98} s={0.5} vest={vest} henryArms="up" />
        </>
      )
    case 'end-seaturtle':
      return (
        <>
          <Sky />
          <SeaBack y={96} />
          <Whale x={200} y={128} s={1.2} kind="mom" />
          <Whale x={250} y={146} s={0.7} happy />
          <SeaTurtle x={120} y={150} s={1.1} />
          <Heart x={232} y={92} s={1.1} />
          <Bubbles pts={[[140, 130], [146, 116], [270, 120]]} />
          <SeaFront y={100} opacity={0.42} />
          <Boat x={60} y={104} s={0.55} vest={vest} henryArms="up" />
        </>
      )
    case 'end-light':
      return (
        <>
          <rect width="320" height="200" fill="url(#k-sky-warm)" />
          <SeaBack y={118} />
          <Island x={262} y={140} s={1.2} lighthouse lit />
          <Whale x={150} y={140} s={1.1} kind="mom" spout />
          <Whale x={196} y={154} s={0.6} spout happy />
          <Note x={112} y={84} c="#5c6bc0" />
          <Note x={138} y={66} c="#ec407a" delay={0.5} />
          <Note x={178} y={76} c="#43a047" delay={1} />
          <SeaFront y={140} opacity={0.4} />
          <Boat x={56} y={182} s={0.64} vest={vest} henryArms="up" henryFace="open" />
        </>
      )
    case 'end-gulls':
      return (
        <>
          <Sky />
          <SeaBack y={130} />
          <Whale x={110} y={150} s={1.1} kind="mom" />
          {/* Cá voi con nhảy vọt khỏi mặt nước */}
          <At x={200} y={90}>
            <g transform="rotate(-25)">
              <Whale x={0} y={0} s={0.75} happy />
            </g>
          </At>
          <Sparkle x={240} y={60} />
          <Sparkle x={170} y={56} delay={0.5} />
          <Seagull x={120} y={50} s={0.9} />
          <Seagull x={150} y={36} s={0.75} delay={0.3} />
          <Seagull x={260} y={44} s={0.85} delay={0.6} />
          <SeaFront y={150} opacity={0.45} />
          <Boat x={262} y={184} s={0.6} vest={vest} henryArms="up" henryFace="open" />
        </>
      )
    default:
      return <Sky />
  }
}

export function Icon({ icon }: { icon: string }) {
  switch (icon) {
    case 'vest-yellow':
    case 'vest-orange':
      return <Henry x={50} y={68} s={0.95} shirt="#ffffff" vest={VEST[icon.slice(5)]} arms="wave" />
    case 'coral':
      return (
        <>
          <rect x="4" y="8" width="92" height="58" rx="12" fill="url(#k-deep)" />
          <Coral x={50} y={62} s={1.05} />
        </>
      )
    case 'island':
      return (
        <>
          <rect x="4" y="44" width="92" height="22" rx="8" fill="url(#k-sea)" />
          <Island x={56} y={56} s={0.5} lighthouse />
        </>
      )
    case 'clownfish':
      return <Clownfish x={52} y={36} s={1.75} />
    case 'seaturtle':
      return <SeaTurtle x={46} y={38} s={1.2} />
    case 'lighthouse':
      return <Island x={46} y={66} s={0.62} lighthouse lit />
    case 'seagull':
      return (
        <>
          <Seagull x={36} y={30} s={1.3} />
          <Seagull x={70} y={46} s={1} delay={0.4} />
        </>
      )
    default:
      return <></>
  }
}


