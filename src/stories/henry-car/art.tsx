// Tranh truyện "Chiếc xe đèn nhấp nháy của Henry" (chuyển từ bản HTML gốc, khung 380×240).
// Màu xe và bầu trời lấy từ biến CSS --hc-car, --hc-car2, --hc-sky1, --hc-sky2, --hc-ground
// (đặt ở khung truyện); lớp .hc-sky-aurora / .hc-sky-sunset trên khung bật cực quang / mặt trời lặn.

import type { CSSProperties, ReactNode } from 'react'

export const VIEW_W = 380
export const VIEW_H = 240

/** Đặt một hình có khung riêng (viewBox) vào ô x, y, w, h, giữ tỉ lệ và canh giữa (như <use> của symbol). */
function Place({
  vb,
  x,
  y,
  w,
  h,
  className,
  style,
  children,
}: {
  vb: [number, number, number, number]
  x: number
  y: number
  w: number
  h: number
  className?: string
  style?: CSSProperties
  children: ReactNode
}) {
  const s = Math.min(w / vb[2], h / vb[3])
  const tx = x + (w - vb[2] * s) / 2 - vb[0] * s
  const ty = y + (h - vb[3] * s) / 2 - vb[1] * s
  return (
    <g className={className} style={style}>
      <g transform={`translate(${tx} ${ty}) scale(${s})`}>{children}</g>
    </g>
  )
}

type At = { x: number; y: number; w: number; h: number; className?: string; style?: CSSProperties }

export function Defs() {
  return (
    <defs>
      <filter id="hc-glow" x="-150%" y="-150%" width="400%" height="400%">
        <feGaussianBlur stdDeviation="4" />
      </filter>
      <filter id="hc-soft" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="9" />
      </filter>
      <linearGradient id="hc-skyg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" style={{ stopColor: 'var(--hc-sky1)' }} />
        <stop offset=".66" style={{ stopColor: 'var(--hc-sky2)' }} />
      </linearGradient>
      <mask id="hc-mm" maskUnits="userSpaceOnUse" x="-30" y="-30" width="60" height="60">
        <circle r="22" fill="#fff" />
        <circle cx="-9" cy="-7" r="21" fill="#000" />
      </mask>
    </defs>
  )
}

function Moon(at: At) {
  return (
    <Place vb={[-40, -40, 80, 80]} {...at}>
      <circle r="26" fill="#FAEEDA" opacity=".35" filter="url(#hc-soft)" />
      <circle r="22" fill="#FAEEDA" mask="url(#hc-mm)" />
    </Place>
  )
}

function Boy(at: At) {
  return (
    <Place vb={[0, 0, 60, 80]} {...at}>
      <rect x="14" y="40" width="32" height="30" rx="10" fill="#FBFAF5" />
      <circle cx="22" cy="50" r="3" fill="#85B7EB" />
      <circle cx="36" cy="48" r="3" fill="#97C459" />
      <circle cx="30" cy="60" r="3" fill="#F0997B" />
      <circle cx="40" cy="62" r="2.5" fill="#FAC775" />
      <circle cx="20" cy="64" r="2.5" fill="#ED93B1" />
      <circle cx="30" cy="24" r="17" fill="#F2C9A0" />
      <path d="M13 22 L15 6 L20 14 L24 2 L28 12 L33 1 L36 12 L42 4 L44 15 L49 9 L47 22 Q30 12 13 22Z" fill="#2C2C2A" />
      <circle cx="24" cy="25" r="2" fill="#2C2C2A" />
      <circle cx="37" cy="25" r="2" fill="#2C2C2A" />
      <path d="M24 32 Q30 38 36 32" fill="none" stroke="#712B13" strokeWidth="2" strokeLinecap="round" />
      <circle cx="20" cy="31" r="3" fill="#F4C0D1" />
      <circle cx="41" cy="31" r="3" fill="#F4C0D1" />
    </Place>
  )
}

function Dad(at: At) {
  return (
    <Place vb={[0, 0, 80, 110]} {...at}>
      <rect x="12" y="52" width="56" height="50" rx="16" fill="#85B7EB" />
      <path d="M22 54 L56 98" stroke="#2C2C2A" strokeWidth="4" />
      <rect x="44" y="84" width="22" height="16" rx="4" fill="#2C2C2A" />
      <circle cx="40" cy="30" r="22" fill="#E9B98C" />
      <path d="M18 26 Q20 6 40 6 Q62 6 62 26 Q52 14 40 16 Q28 14 18 26Z" fill="#2C2C2A" />
      <circle cx="32" cy="30" r="2.2" fill="#2C2C2A" />
      <circle cx="48" cy="30" r="2.2" fill="#2C2C2A" />
      <path d="M30 40 Q40 48 50 40" fill="#fff" stroke="#712B13" strokeWidth="2" strokeLinecap="round" />
    </Place>
  )
}

function Wheel({ cx, go }: { cx: number; go?: boolean }) {
  return (
    <g className={go ? 'hc-spin' : undefined}>
      <circle cx={cx} cy="50" r="10" fill="#2C2C2A" />
      <path d={`M${cx} 42V58M${cx - 8} 50H${cx + 8}`} stroke="#B4B2A9" strokeWidth="2" />
      <circle cx={cx} cy="50" r="3.5" fill="#B4B2A9" />
    </g>
  )
}

const LIGHTS: [number, number, string, string, string][] = [
  [20, 38, '#5DCAA5', '#C9F5E4', 'hc-bl'],
  [40, 40, '#AFA9EC', '#E3E0FF', 'hc-bl2'],
  [60, 40, '#FAC775', '#FFF0CC', 'hc-bl'],
  [80, 40, '#ED93B1', '#FFD9E6', 'hc-bl2'],
  [100, 38, '#85B7EB', '#D6E9FF', 'hc-bl'],
]

/** Xe điện nhỏ; `go`: bánh xe quay. */
function Car({ go, ...at }: At & { go?: boolean }) {
  return (
    <Place vb={[0, 0, 120, 60]} {...at}>
      <ellipse className="hc-uglow" cx="60" cy="61" rx="58" ry="6" opacity=".75" filter="url(#hc-glow)" />
      <rect x="6" y="18" width="108" height="30" rx="14" style={{ fill: 'var(--hc-car)' }} />
      <rect x="14" y="22" width="92" height="8" rx="4" style={{ fill: 'var(--hc-car2)' }} />
      <Wheel cx={28} go={go} />
      <Wheel cx={92} go={go} />
      <g filter="url(#hc-glow)">
        {LIGHTS.map(([cx, cy, c, , cls]) => (
          <circle key={cx} className={cls} cx={cx} cy={cy} r="7" fill={c} />
        ))}
      </g>
      {LIGHTS.map(([cx, cy, , c, cls]) => (
        <circle key={cx} className={cls} cx={cx} cy={cy} r="3.5" fill={c} />
      ))}
      <path d="M100 18 L104 0" stroke="#444441" strokeWidth="4" strokeLinecap="round" />
      <path d="M94 0 L114 0" stroke="#444441" strokeWidth="5" strokeLinecap="round" />
    </Place>
  )
}

const STARS: [number, number, number, string][] = [
  [40, 30, 1.6, 'hc-tw'],
  [120, 18, 1.3, 'hc-tw2'],
  [210, 36, 1.6, 'hc-tw3'],
  [300, 20, 1.3, 'hc-tw'],
  [350, 50, 1.6, 'hc-tw2'],
  [80, 62, 1.2, 'hc-tw3'],
  [160, 52, 1, 'hc-tw'],
  [250, 66, 1.2, 'hc-tw2'],
  [20, 84, 1, 'hc-tw3'],
  [330, 88, 1.1, 'hc-tw'],
]

/** Bầu trời (sao, sao băng, cực quang hoặc mặt trời lặn tuỳ lựa chọn) và mặt đất. */
function Sky() {
  return (
    <g>
      <rect width="380" height="240" fill="url(#hc-skyg)" />
      <circle className="hc-sun" cx="190" cy="150" r="46" fill="#FFB36B" opacity=".55" filter="url(#hc-soft)" />
      <g className="hc-aurora" fill="none" strokeLinecap="round" filter="url(#hc-soft)">
        <path className="hc-au" d="M-20 80 Q80 20 170 70 T400 50" stroke="#5DCAA5" strokeWidth="26" />
        <path className="hc-au2" d="M-20 110 Q100 60 210 100 T400 80" stroke="#7F77DD" strokeWidth="20" />
        <path className="hc-au" d="M-20 50 Q120 0 240 40 T400 20" stroke="#9FE1CB" strokeWidth="14" />
      </g>
      <g fill="#fff">
        {STARS.map(([cx, cy, r, cls]) => (
          <circle key={`${cx}-${cy}`} className={cls} cx={cx} cy={cy} r={r} />
        ))}
      </g>
      <g className="hc-shoot">
        <path d="M0 0 L42 -15" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        <circle r="2.5" fill="#fff" />
      </g>
      <rect y="150" width="380" height="90" style={{ fill: 'var(--hc-ground)' }} />
      <rect y="150" width="380" height="6" fill="#000" opacity=".08" />
    </g>
  )
}

const Say = ({ x, y, size, children }: { x: number; y: number; size: number; children: string }) => (
  <text className="hc-float" x={x} y={y} fontSize={size} fill="#FAC775" fontStyle="italic" fontFamily="Georgia, 'Times New Roman', serif">
    {children}
  </text>
)

function Cover() {
  return (
    <>
      <Sky />
      <Moon className="hc-float" x={282} y={22} w={60} h={60} />
      <g className="hc-driveS">
        <g className="hc-bob">
          <Dad x={140} y={80} w={70} h={96} />
          <Boy x={150} y={110} w={46} h={62} />
          <Car go x={110} y={160} w={130} h={65} />
        </g>
      </g>
    </>
  )
}

function Lot() {
  return (
    <>
      <Sky />
      <rect x="20" y="90" width="340" height="60" fill="#EDE6D3" />
      <rect x="20" y="90" width="340" height="8" fill="#D85A30" />
      <g fill="#FFE9A8">
        <rect x="40" y="108" width="40" height="22" />
        <rect x="110" y="108" width="40" height="22" className="hc-tw3" />
        <rect x="230" y="108" width="40" height="22" />
        <rect x="300" y="108" width="40" height="22" className="hc-tw" />
      </g>
      <rect x="186" y="40" width="6" height="110" fill="#5F5E5A" />
      <path className="hc-beam" d="M189 38 L100 230 L278 230Z" fill="#FFF6C8" opacity=".28" />
      <circle cx="189" cy="38" r="20" fill="#FFF6C8" opacity=".6" filter="url(#hc-soft)" />
      <circle cx="189" cy="38" r="11" fill="#FFFBE6" />
      <g className="hc-driveS">
        <Car go x={0} y={176} w={70} h={35} />
      </g>
      <g className="hc-drive" style={{ animationDelay: '-3s' }}>
        <Car go x={0} y={200} w={60} h={30} />
      </g>
      <g className="hc-bob">
        <Car x={270} y={185} w={70} h={35} />
      </g>
    </>
  )
}

function Squeeze() {
  return (
    <>
      <Sky />
      <Moon x={40} y={24} w={50} h={50} />
      <Dad className="hc-laugh" x={150} y={68} w={88} h={121} />
      <path d="M152 168 Q140 110 172 124" fill="#E9B98C" stroke="#C99A6E" strokeWidth="2" />
      <path d="M246 168 Q258 110 226 124" fill="#E9B98C" stroke="#C99A6E" strokeWidth="2" />
      <Boy className="hc-laugh" style={{ animationDelay: '.2s' }} x={164} y={110} w={54} h={72} />
      <Car x={120} y={160} w={150} h={75} />
      <Say x={278} y={100} size={22}>
        hi hi hi
      </Say>
    </>
  )
}

function Zoom() {
  return (
    <>
      <Sky />
      <g stroke="#FBFAF5" strokeWidth="3" strokeLinecap="round">
        <path className="hc-wind" d="M20 120 H90" />
        <path className="hc-wind" style={{ animationDelay: '.2s' }} d="M10 150 H80" />
        <path className="hc-wind" style={{ animationDelay: '.4s' }} d="M30 180 H100" />
        <path className="hc-wind" style={{ animationDelay: '.6s' }} d="M14 205 H70" />
      </g>
      <g className="hc-bob">
        <Dad x={160} y={68} w={88} h={121} />
        <Boy x={172} y={104} w={58} h={78} />
        <Car go x={128} y={160} w={150} h={75} />
      </g>
      <Say x={236} y={62} size={26}>
        brừm brừm!
      </Say>
    </>
  )
}

function Bus() {
  return (
    <>
      <Sky />
      <g className="hc-breathe">
        <rect x="170" y="80" width="190" height="100" rx="14" fill="#F1EFE8" />
        <rect x="170" y="140" width="190" height="14" fill="#B4B2A9" />
        <rect x="184" y="94" width="160" height="34" rx="6" fill="#B5D4F4" />
        <path d="M200 112 Q212 120 224 112 M300 112 Q312 120 324 112" fill="none" stroke="#2C2C2A" strokeWidth="3" strokeLinecap="round" />
        <path d="M250 132 Q262 138 274 132" fill="none" stroke="#2C2C2A" strokeWidth="2" strokeLinecap="round" />
      </g>
      <circle cx="205" cy="182" r="14" fill="#2C2C2A" />
      <circle cx="325" cy="182" r="14" fill="#2C2C2A" />
      <text className="hc-zz" x="300" y="70" fontSize="22" fill="#FBFAF5" fontStyle="italic" fontFamily="Georgia, serif">
        z z z
      </text>
      <g className="hc-pass">
        <Dad x={30} y={100} w={64} h={88} />
        <Boy x={40} y={128} w={40} h={54} />
        <Car go x={10} y={170} w={110} h={55} />
      </g>
    </>
  )
}

function Wave() {
  return (
    <>
      <Sky />
      <Moon x={300} y={20} w={50} h={50} />
      <path d="M150 230 L345 238 L335 228 L160 218Z" fill="#000" opacity=".18" />
      <g className="hc-bob">
        <Dad x={80} y={90} w={76} h={104} />
        <Boy x={92} y={120} w={48} h={64} />
        <path className="hc-wave" d="M136 150 L156 120" stroke="#F2C9A0" strokeWidth="7" strokeLinecap="round" />
        <Car go x={50} y={168} w={130} h={65} />
      </g>
      <g className="hc-bob" style={{ animationDelay: '.25s' }}>
        <Boy x={268} y={120} w={44} h={58} />
        <path className="hc-wave" style={{ animationDelay: '.3s' }} d="M268 142 L252 114" stroke="#F2C9A0" strokeWidth="6" strokeLinecap="round" />
        <Car go x={240} y={164} w={100} h={50} />
      </g>
    </>
  )
}

const Fireflies = ({ dots }: { dots: [number, number, number, string, string?][] }) => (
  <g fill="#FFF3A8" filter="url(#hc-glow)">
    {dots.map(([cx, cy, r, cls, delay]) => (
      <circle key={`${cx}-${cy}`} className={cls} style={delay ? { animationDelay: delay } : undefined} cx={cx} cy={cy} r={r} />
    ))}
  </g>
)

function Slow() {
  return (
    <g className="hc-sleepy">
      <Sky />
      <Moon className="hc-float" x={286} y={22} w={56} h={56} />
      <g className="hc-slow">
        <Dad x={140} y={70} w={88} h={121} />
        <Boy x={152} y={108} w={54} h={72} />
        <Car x={110} y={160} w={150} h={75} />
      </g>
      <Fireflies
        dots={[
          [60, 130, 3, 'hc-fly'],
          [320, 140, 3, 'hc-fly2'],
          [280, 110, 2.5, 'hc-fly', '-2s'],
        ]}
      />
    </g>
  )
}

function Sleep() {
  return (
    <>
      <rect width="380" height="240" fill="url(#hc-skyg)" />
      <g className="hc-aurora" fill="none" filter="url(#hc-soft)">
        <path className="hc-au" d="M-20 70 Q100 20 200 60 T400 40" stroke="#5DCAA5" strokeWidth="22" />
      </g>
      <Moon className="hc-float" x={272} y={20} w={70} h={70} />
      <g fill="#fff">
        <circle className="hc-tw" cx="60" cy="40" r="1.6" />
        <circle className="hc-tw2" cx="130" cy="76" r="1.6" />
        <circle className="hc-tw3" cx="220" cy="30" r="1.3" />
        <circle className="hc-tw2" cx="350" cy="130" r="1.6" />
        <circle className="hc-tw" cx="40" cy="130" r="1.3" />
        <circle className="hc-tw3" cx="90" cy="180" r="1.2" />
        <circle className="hc-tw" cx="320" cy="190" r="1.2" />
      </g>
      <Fireflies
        dots={[
          [70, 150, 3, 'hc-fly'],
          [300, 170, 3, 'hc-fly2'],
          [250, 120, 2.5, 'hc-fly', '-3s'],
          [110, 100, 2.5, 'hc-fly2', '-1s'],
        ]}
      />
      <g className="hc-breathe">
        <Dad x={110} y={45} w={120} h={165} />
        <rect x="152" y="150" width="58" height="36" rx="14" fill="#FBFAF5" />
        <circle cx="164" cy="162" r="3" fill="#85B7EB" />
        <circle cx="182" cy="172" r="3" fill="#F0997B" />
        <circle cx="196" cy="160" r="3" fill="#97C459" />
        <circle cx="224" cy="160" r="19" fill="#F2C9A0" />
        <path d="M206 158 L209 142 L216 149 L224 139 L232 149 L239 142 L242 158 Q224 147 206 158Z" fill="#2C2C2A" />
        <path d="M214 163 q4 4 8 0 M227 163 q4 4 8 0" fill="none" stroke="#2C2C2A" strokeWidth="2" strokeLinecap="round" />
        <circle cx="212" cy="169" r="3" fill="#F4C0D1" />
        <circle cx="237" cy="169" r="3" fill="#F4C0D1" />
        <path d="M134 152 Q128 198 180 194 L236 190" fill="none" stroke="#E9B98C" strokeWidth="12" strokeLinecap="round" />
      </g>
      <text className="hc-zz" x="250" y="130" fontSize="20" fill="#FBFAF5" fontStyle="italic" fontFamily="Georgia, serif">
        z z
      </text>
    </>
  )
}

const SCENES: Record<string, () => ReactNode> = {
  cover: Cover,
  lot: Lot,
  squeeze: Squeeze,
  zoom: Zoom,
  bus: Bus,
  wave: Wave,
  slow: Slow,
  sleep: Sleep,
}

/** Một cảnh của truyện, gồm cả <defs> (mỗi lúc chỉ có một cảnh trên màn hình). */
export function Scene({ scene }: { scene: string }) {
  const S = SCENES[scene] ?? Cover
  return (
    <>
      <Defs />
      <S />
    </>
  )
}
