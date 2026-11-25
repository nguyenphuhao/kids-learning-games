// Bộ hình vẽ dùng chung cho các truyện: dải màu (gradient), nhân vật Henry, Ba, Bà và cảnh vật.
// Cảnh vẽ trên khung 320x200, hình nút lựa chọn trên khung 100x70.
//
// Các dải màu khai báo một lần trong <ArtDefs/> (gắn ở StoryLayer) và dùng lại bằng url(#k-…),
// nên mọi hình SVG trên trang đều dùng chung, không trùng id.
// Lớp phủ k-shade / k-ball / k-gloss tạo bóng đổ và độ bóng cho mọi màu.
//
// Chuyển động nhẹ (lắc, nhún, nhấp nháy) dùng lớp CSS a-… trong story.css. Phần tử có lớp a-…
// không được có thuộc tính transform (CSS sẽ ghi đè), nên luôn bọc trong <g transform> riêng.

import type { ReactNode } from 'react'

const SKIN = '#f6c39b'
const INK = '#4e342e'

export function ArtDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        {/* Khung cắt cảnh 320x200: phần vẽ tràn ra ngoài không lộ vào vùng nền. */}
        <clipPath id="k-frame">
          <rect width="320" height="200" />
        </clipPath>
        <linearGradient id="k-sky-day" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6ec6f5" />
          <stop offset="1" stopColor="#e1f5fe" />
        </linearGradient>
        <linearGradient id="k-sky-night" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b1446" />
          <stop offset="0.7" stopColor="#283593" />
          <stop offset="1" stopColor="#5c6bc0" />
        </linearGradient>
        <linearGradient id="k-sky-warm" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffcc80" />
          <stop offset="1" stopColor="#fff3e0" />
        </linearGradient>
        <linearGradient id="k-grass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a5d66b" />
          <stop offset="1" stopColor="#6aa335" />
        </linearGradient>
        <linearGradient id="k-grass-night" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2e7d5b" />
          <stop offset="1" stopColor="#1b4332" />
        </linearGradient>
        <linearGradient id="k-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4fc3f7" />
          <stop offset="1" stopColor="#0277bd" />
        </linearGradient>
        <linearGradient id="k-deep" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#29b6f6" />
          <stop offset="1" stopColor="#0d3c8c" />
        </linearGradient>
        <linearGradient id="k-lake" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#81d4fa" />
          <stop offset="1" stopColor="#29b6f6" />
        </linearGradient>
        <linearGradient id="k-sand" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe9c2" />
          <stop offset="1" stopColor="#f3c983" />
        </linearGradient>
        <linearGradient id="k-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e3f2fd" />
          <stop offset="1" stopColor="#fff" />
        </linearGradient>
        <linearGradient id="k-wall-warm" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe0b2" />
          <stop offset="1" stopColor="#fff8e1" />
        </linearGradient>
        <linearGradient id="k-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d7b98e" />
          <stop offset="1" stopColor="#a1764a" />
        </linearGradient>
        <linearGradient id="k-wood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a1887f" />
          <stop offset="1" stopColor="#5d4037" />
        </linearGradient>
        <linearGradient id="k-trunk" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8d6e63" />
          <stop offset="1" stopColor="#5d4037" />
        </linearGradient>
        <linearGradient id="k-leaf" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#81c784" />
          <stop offset="1" stopColor="#2e7d32" />
        </linearGradient>
        <linearGradient id="k-mountain" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7e57c2" />
          <stop offset="1" stopColor="#311b92" />
        </linearGradient>
        <linearGradient id="k-hill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c5e1a5" />
          <stop offset="1" stopColor="#8bc34a" />
        </linearGradient>
        <linearGradient id="k-cloud" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#dbeefc" />
        </linearGradient>
        <linearGradient id="k-cloud-night" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9fa8da" />
          <stop offset="1" stopColor="#5c6bc0" />
        </linearGradient>
        <linearGradient id="k-metal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#eceff1" />
          <stop offset="1" stopColor="#90a4ae" />
        </linearGradient>
        <radialGradient id="k-sun" cx="0.4" cy="0.4" r="0.6">
          <stop offset="0" stopColor="#fffde7" />
          <stop offset="0.5" stopColor="#ffe082" />
          <stop offset="1" stopColor="#ffb300" />
        </radialGradient>
        <radialGradient id="k-moon" cx="0.4" cy="0.4" r="0.65">
          <stop offset="0" stopColor="#fffff5" />
          <stop offset="0.7" stopColor="#fff3b0" />
          <stop offset="1" stopColor="#ffd54f" />
        </radialGradient>
        <radialGradient id="k-glow" r="0.5">
          <stop offset="0" stopColor="#fff59d" stopOpacity="0.95" />
          <stop offset="0.4" stopColor="#ffee58" stopOpacity="0.45" />
          <stop offset="1" stopColor="#ffee58" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="k-glow-warm" r="0.5">
          <stop offset="0" stopColor="#ffe0b2" stopOpacity="0.9" />
          <stop offset="0.5" stopColor="#ffb74d" stopOpacity="0.35" />
          <stop offset="1" stopColor="#ff9800" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="k-skin" cx="0.42" cy="0.38" r="0.65">
          <stop offset="0" stopColor="#ffe4cc" />
          <stop offset="1" stopColor={SKIN} />
        </radialGradient>
        {/* Lớp phủ: tối dần xuống dưới. */}
        <linearGradient id="k-shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.35" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.22" />
        </linearGradient>
        {/* Lớp phủ: vệt sáng phía trên. */}
        <linearGradient id="k-gloss" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="0.6" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        {/* Lớp phủ cho vật tròn: sáng ở góc trên trái, tối ở viền. */}
        <radialGradient id="k-ball" cx="0.35" cy="0.3" r="0.75">
          <stop offset="0" stopColor="#fff" stopOpacity="0.6" />
          <stop offset="0.4" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.22" />
        </radialGradient>
      </defs>
    </svg>
  )
}

// ---------- Tiện ích ----------

/** Nhóm có dịch chuyển/phóng to. */
export function At({ x = 0, y = 0, s = 1, flip = false, children }: { x?: number; y?: number; s?: number; flip?: boolean; children: ReactNode }) {
  return <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>{children}</g>
}

/** Nhóm có chuyển động CSS (a-bob, a-sway, a-twinkle, a-drift, a-pulse, a-hop, a-spin). */
export function Anim({ cls, delay = 0, children }: { cls: string; delay?: number; children: ReactNode }) {
  return (
    <g className={cls} style={delay ? { animationDelay: `${delay}s` } : undefined}>
      {children}
    </g>
  )
}

/** Bóng mờ dưới chân. */
export const Shadow = ({ x = 0, y = 0, rx = 14 }: { x?: number; y?: number; rx?: number }) => (
  <ellipse cx={x} cy={y} rx={rx} ry={rx * 0.22} fill="#000" opacity="0.16" />
)

// ---------- Nền ----------

export function DaySky() {
  return <rect width="320" height="200" fill="url(#k-sky-day)" />
}

export function NightSky({ stars = true }: { stars?: boolean }) {
  return (
    <>
      <rect width="320" height="200" fill="url(#k-sky-night)" />
      {stars && <Stars />}
    </>
  )
}

const STAR_POS = [
  [22, 18], [58, 40], [96, 14], [134, 34], [176, 12], [214, 30], [252, 10], [298, 26],
  [40, 70], [118, 62], [196, 58], [280, 64], [12, 46], [160, 44], [236, 46], [306, 48],
]

export function Stars() {
  return (
    <g>
      {STAR_POS.map(([x, y], i) => (
        <Anim key={i} cls="a-twinkle" delay={(i % 5) * 0.4}>
          <path
            d={`M${x} ${y - 3} L${x + 1} ${y - 1} L${x + 3} ${y} L${x + 1} ${y + 1} L${x} ${y + 3} L${x - 1} ${y + 1} L${x - 3} ${y} L${x - 1} ${y - 1} Z`}
            fill="#fff9c4"
          />
        </Anim>
      ))}
    </g>
  )
}

export function Sun({ x, y, r = 18 }: { x: number; y: number; r?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r * 1.8} fill="url(#k-glow)" />
      <Anim cls="a-spin">
        <g>
          {Array.from({ length: 10 }, (_, i) => {
            const a = (i * Math.PI) / 5
            return (
              <line
                key={i}
                x1={x + Math.cos(a) * r * 1.2}
                y1={y + Math.sin(a) * r * 1.2}
                x2={x + Math.cos(a) * r * 1.55}
                y2={y + Math.sin(a) * r * 1.55}
                stroke="#ffca28"
                strokeWidth="3"
                strokeLinecap="round"
              />
            )
          })}
        </g>
      </Anim>
      <circle cx={x} cy={y} r={r} fill="url(#k-sun)" />
    </g>
  )
}

/** Ông Trăng có mặt cười (mood: 'sleep' nhắm mắt, 'smile' cười). */
export function Moon({ x, y, r = 22, mood = 'smile', glow = true }: { x: number; y: number; r?: number; mood?: 'smile' | 'sleep'; glow?: boolean }) {
  return (
    <g>
      {glow && <circle cx={x} cy={y} r={r * 2.2} fill="url(#k-glow)" opacity="0.8" />}
      <circle cx={x} cy={y} r={r} fill="url(#k-moon)" />
      <circle cx={x + r * 0.35} cy={y - r * 0.4} r={r * 0.14} fill="#f9e08b" />
      <circle cx={x - r * 0.45} cy={y + r * 0.45} r={r * 0.1} fill="#f9e08b" />
      {mood === 'smile' ? (
        <>
          <ellipse cx={x - r * 0.32} cy={y - r * 0.05} rx={r * 0.08} ry={r * 0.11} fill={INK} />
          <ellipse cx={x + r * 0.32} cy={y - r * 0.05} rx={r * 0.08} ry={r * 0.11} fill={INK} />
        </>
      ) : (
        <>
          <path d={`M${x - r * 0.45} ${y - r * 0.05} q${r * 0.13} ${r * 0.12} ${r * 0.26} 0`} stroke={INK} strokeWidth="1.6" fill="none" />
          <path d={`M${x + r * 0.19} ${y - r * 0.05} q${r * 0.13} ${r * 0.12} ${r * 0.26} 0`} stroke={INK} strokeWidth="1.6" fill="none" />
        </>
      )}
      <path d={`M${x - r * 0.25} ${y + r * 0.28} q${r * 0.25} ${r * 0.22} ${r * 0.5} 0`} stroke={INK} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <ellipse cx={x - r * 0.55} cy={y + r * 0.2} rx={r * 0.13} ry={r * 0.08} fill="#ff8a80" opacity="0.6" />
      <ellipse cx={x + r * 0.55} cy={y + r * 0.2} rx={r * 0.13} ry={r * 0.08} fill="#ff8a80" opacity="0.6" />
    </g>
  )
}

export function Cloud({ x, y, s = 1, night = false }: { x: number; y: number; s?: number; night?: boolean }) {
  return (
    <At x={x} y={y} s={s}>
      <Anim cls="a-drift">
        <path
          d="M-30 8 C-40 8 -40 -6 -28 -6 C-28 -18 -10 -20 -6 -10 C0 -24 24 -22 24 -6 C36 -8 40 8 28 8 Z"
          fill={night ? 'url(#k-cloud-night)' : 'url(#k-cloud)'}
        />
      </Anim>
    </At>
  )
}

/** Đồi xa phía sau (đường cong mềm). */
export function Hills({ y = 120, night = false }: { y?: number; night?: boolean }) {
  const fill = night ? '#1f5f4a' : 'url(#k-hill)'
  return (
    <g>
      <path d={`M0 ${y} Q60 ${y - 34} 130 ${y - 6} T260 ${y - 14} T320 ${y - 4} V200 H0 Z`} fill={fill} opacity="0.9" />
    </g>
  )
}

/** Mặt đất phía trước từ độ cao y. */
export function Ground({ y = 140, night = false, fill }: { y?: number; night?: boolean; fill?: string }) {
  return (
    <path
      d={`M0 ${y} Q80 ${y - 8} 160 ${y} T320 ${y} V200 H0 Z`}
      fill={fill ?? (night ? 'url(#k-grass-night)' : 'url(#k-grass)')}
    />
  )
}

export function GrassTufts({ points, night = false }: { points: [number, number][]; night?: boolean }) {
  return (
    <g stroke={night ? '#2e7d5b' : '#558b2f'} strokeWidth="1.6" strokeLinecap="round" fill="none">
      {points.map(([x, y]) => (
        <path key={`${x}-${y}`} d={`M${x - 4} ${y} q2 -6 1 -8 M${x} ${y} q0 -8 1 -10 M${x + 4} ${y} q-1 -6 1 -8`} />
      ))}
    </g>
  )
}

// ---------- Cây cối, hoa ----------

/** Cây tán tròn. (x, y) là gốc cây. */
export function Tree({ x, y, s = 1, fruit, night = false }: { x: number; y: number; s?: number; fruit?: string; night?: boolean }) {
  return (
    <At x={x} y={y} s={s}>
      <Shadow rx={22} />
      <path d="M-6 0 L-4 -34 Q0 -38 4 -34 L6 0 Z" fill="url(#k-trunk)" />
      <path d="M-2 -26 L-12 -36 M2 -30 L12 -40" stroke="#6d4c41" strokeWidth="3" strokeLinecap="round" />
      <Anim cls="a-sway">
        <g>
          <circle cx="-16" cy="-42" r="17" fill={night ? '#1b5e20' : 'url(#k-leaf)'} />
          <circle cx="16" cy="-44" r="18" fill={night ? '#1b5e20' : 'url(#k-leaf)'} />
          <circle cx="0" cy="-60" r="22" fill={night ? '#2e7d32' : 'url(#k-leaf)'} />
          <circle cx="-8" cy="-66" r="8" fill="#fff" opacity="0.18" />
          {fruit &&
            [
              [-18, -40], [12, -50], [-4, -58], [20, -36], [-10, -70], [6, -72],
            ].map(([fx, fy]) => (
              <g key={`${fx}${fy}`}>
                <circle cx={fx} cy={fy} r="4.2" fill={fruit} />
                <circle cx={fx} cy={fy} r="4.2" fill="url(#k-ball)" />
              </g>
            ))}
        </g>
      </Anim>
    </At>
  )
}

export function Bush({ x, y, s = 1, berries }: { x: number; y: number; s?: number; berries?: string }) {
  return (
    <At x={x} y={y} s={s}>
      <Shadow rx={18} />
      <circle cx="-10" cy="-8" r="10" fill="url(#k-leaf)" />
      <circle cx="10" cy="-8" r="10" fill="url(#k-leaf)" />
      <circle cx="0" cy="-15" r="12" fill="url(#k-leaf)" />
      {berries &&
        [
          [-10, -10], [2, -18], [10, -6], [-2, -6], [12, -14],
        ].map(([bx, by]) => <circle key={`${bx}${by}`} cx={bx} cy={by} r="2.6" fill={berries} />)}
    </At>
  )
}

export function Flower({ x, y, c, s = 1 }: { x: number; y: number; c: string; s?: number }) {
  return (
    <At x={x} y={y} s={s}>
      <path d="M0 0 Q-1 -6 0 -12" stroke="#558b2f" strokeWidth="1.8" fill="none" />
      <path d="M0 -5 q-5 -2 -6 -6 q5 0 6 4" fill="#7cb342" />
      <Anim cls="a-sway">
        <g>
          {[0, 72, 144, 216, 288].map((a) => (
            <circle key={a} cx={4.6 * Math.cos((a * Math.PI) / 180)} cy={-12 + 4.6 * Math.sin((a * Math.PI) / 180)} r="3.8" fill={c} />
          ))}
          <circle cy="-12" r="2.8" fill="#ffeb3b" />
        </g>
      </Anim>
    </At>
  )
}

const FLOWER_COLORS = ['#ec407a', '#ab47bc', '#ff7043', '#fdd835', '#42a5f5']

export function FlowerBed({ xs, y }: { xs: number[]; y: number }) {
  return (
    <g>
      {xs.map((fx, i) => (
        <Flower key={fx} x={fx} y={y + (i % 2) * 7} c={FLOWER_COLORS[i % FLOWER_COLORS.length]} />
      ))}
    </g>
  )
}

// ---------- Ký hiệu nhỏ ----------

export function Heart({ x, y, s = 1, c = '#f06292' }: { x: number; y: number; s?: number; c?: string }) {
  return (
    <At x={x} y={y} s={s}>
      <Anim cls="a-pulse">
        <path d="M0 6 C-10 -2 -8 -10 -3 -10 C-1 -10 0 -8 0 -7 C0 -8 1 -10 3 -10 C8 -10 10 -2 0 6 Z" fill={c} />
        <circle cx="-4" cy="-6" r="1.5" fill="#fff" opacity="0.7" />
      </Anim>
    </At>
  )
}

export function Sparkle({ x, y, s = 1, c = '#fff59d', delay = 0 }: { x: number; y: number; s?: number; c?: string; delay?: number }) {
  return (
    <At x={x} y={y} s={s}>
      <Anim cls="a-twinkle" delay={delay}>
        <path d="M0 -8 Q1 -1 8 0 Q1 1 0 8 Q-1 1 -8 0 Q-1 -1 0 -8 Z" fill={c} />
      </Anim>
    </At>
  )
}

export function Note({ x, y, s = 1, c = '#fff', delay = 0 }: { x: number; y: number; s?: number; c?: string; delay?: number }) {
  return (
    <At x={x} y={y} s={s}>
      <Anim cls="a-bob" delay={delay}>
        <ellipse cx="-3" cy="4" rx="4" ry="3" fill={c} transform="rotate(-20 -3 4)" />
        <path d="M0.5 3 V-10 Q5 -8 7 -4" stroke={c} strokeWidth="2" fill="none" strokeLinecap="round" />
      </Anim>
    </At>
  )
}

export function Rainbow({ cx = 160, y = 140, r = 120 }: { cx?: number; y?: number; r?: number }) {
  const colors = ['#ef5350', '#ffa726', '#ffee58', '#66bb6a', '#42a5f5', '#ab47bc']
  return (
    <g opacity="0.8">
      {colors.map((c, i) => (
        <path key={c} d={`M${cx - r + i * 6} ${y} A${r - i * 6} ${(r - i * 6) * 0.8} 0 0 1 ${cx + r - i * 6} ${y}`} stroke={c} strokeWidth="6.5" fill="none" />
      ))}
    </g>
  )
}

export function Zzz({ x, y }: { x: number; y: number }) {
  return (
    <g fill="#5c6bc0" fontWeight="800" fontFamily="system-ui, sans-serif">
      <Anim cls="a-bob">
        <text x={x} y={y} fontSize="10">z</text>
        <text x={x + 7} y={y - 8} fontSize="13">z</text>
        <text x={x + 16} y={y - 18} fontSize="16">Z</text>
      </Anim>
    </g>
  )
}

// ---------- Nhân vật ----------

export type Face = 'smile' | 'open' | 'blow' | 'sleepy' | 'sad'
export type Arms = 'down' | 'up' | 'wave' | 'hold' | 'hug'
export type HenryHat = 'cap' | 'conical' | 'straw'
export type Outfit = 'tee' | 'aodai' | 'coat'

function Eyes({ y, dx, r, face }: { y: number; dx: number; r: number; face: Face }) {
  if (face === 'sleepy')
    return (
      <g stroke={INK} strokeWidth="1.3" fill="none" strokeLinecap="round">
        <path d={`M${-dx - r} ${y} q${r} ${r} ${2 * r} 0`} />
        <path d={`M${dx - r} ${y} q${r} ${r} ${2 * r} 0`} />
      </g>
    )
  return (
    <g>
      {[-dx, dx].map((ex) => (
        <g key={ex}>
          <ellipse cx={ex} cy={y} rx={r * 0.8} ry={r} fill={INK} />
          <circle cx={ex + r * 0.3} cy={y - r * 0.4} r={r * 0.35} fill="#fff" />
        </g>
      ))}
    </g>
  )
}

function Mouth({ y, w, face }: { y: number; w: number; face: Face }) {
  switch (face) {
    case 'open':
      return <path d={`M${-w} ${y} Q0 ${y + w * 1.6} ${w} ${y} Z`} fill="#c62828" stroke={INK} strokeWidth="0.8" />
    case 'blow':
      return <ellipse cx="0" cy={y + 1} rx={w * 0.45} ry={w * 0.55} fill="#8d4a3b" />
    case 'sad':
      return <path d={`M${-w * 0.8} ${y + 2} Q0 ${y - 1} ${w * 0.8} ${y + 2}`} stroke={INK} strokeWidth="1.3" fill="none" strokeLinecap="round" />
    default:
      return <path d={`M${-w} ${y} Q0 ${y + w * 1.1} ${w} ${y}`} stroke={INK} strokeWidth="1.4" fill="none" strokeLinecap="round" />
  }
}

function Cheeks({ y, dx }: { y: number; dx: number }) {
  return (
    <g fill="#ff8a80" opacity="0.55">
      <ellipse cx={-dx} cy={y} rx="2.6" ry="1.6" />
      <ellipse cx={dx} cy={y} rx="2.6" ry="1.6" />
    </g>
  )
}

/** Tay: nét cong màu áo, bàn tay tròn. Toạ độ theo vai (sx, sy). */
function Arm({ sx, sy, pose, side, len, color, w }: { sx: number; sy: number; pose: Arms; side: -1 | 1; len: number; color: string; w: number }) {
  const L = len
  let d: string
  let hx: number
  let hy: number
  switch (pose) {
    case 'up':
      hx = sx + side * L * 0.35
      hy = sy - L * 1.05
      d = `M${sx} ${sy} Q${sx + side * L * 0.55} ${sy - L * 0.45} ${hx} ${hy}`
      break
    case 'hold':
      hx = sx - side * L * 0.45
      hy = sy + L * 0.75
      d = `M${sx} ${sy} Q${sx + side * L * 0.3} ${sy + L * 0.6} ${hx} ${hy}`
      break
    case 'hug':
      hx = sx + side * L * 1.05
      hy = sy + L * 0.2
      d = `M${sx} ${sy} Q${sx + side * L * 0.6} ${sy + L * 0.45} ${hx} ${hy}`
      break
    default:
      hx = sx + side * L * 0.32
      hy = sy + L
      d = `M${sx} ${sy} Q${sx + side * L * 0.42} ${sy + L * 0.45} ${hx} ${hy}`
  }
  return (
    <g>
      <path d={d} stroke={color} strokeWidth={w} fill="none" strokeLinecap="round" />
      <circle cx={hx} cy={hy} r={w * 0.52} fill={SKIN} />
    </g>
  )
}

/** Henry (bé trai ~3 tuổi). (x, y) là điểm giữa hai bàn chân. */
export function Henry({
  x = 0,
  y = 0,
  s = 1,
  shirt = '#ffb74d',
  outfit = 'tee',
  hat,
  vest,
  arms = 'down',
  face = 'smile',
  flip = false,
  shadow = true,
  children,
}: {
  x?: number
  y?: number
  s?: number
  shirt?: string
  outfit?: Outfit
  hat?: HenryHat
  vest?: string
  arms?: Arms
  face?: Face
  flip?: boolean
  shadow?: boolean
  /** Vẽ thêm trong toạ độ của Henry (vd. đồ vật trên tay, ở khoảng y = -25). */
  children?: ReactNode
}) {
  const leftArm: Arms = arms === 'wave' ? 'down' : arms
  const rightArm: Arms = arms === 'wave' ? 'up' : arms
  const sleeve = outfit === 'coat' ? '#fafafa' : shirt
  return (
    <At x={x} y={y} s={s} flip={flip}>
      {shadow && <Shadow rx={13} />}
      {/* Chân */}
      <rect x="-7.5" y="-15" width="6" height="14" rx="3" fill={outfit === 'aodai' ? '#fafafa' : SKIN} />
      <rect x="1.5" y="-15" width="6" height="14" rx="3" fill={outfit === 'aodai' ? '#fafafa' : SKIN} />
      <ellipse cx="-5" cy="-1.5" rx="5" ry="2.8" fill="#6d4c41" />
      <ellipse cx="5" cy="-1.5" rx="5" ry="2.8" fill="#6d4c41" />
      {outfit !== 'aodai' && <rect x="-10" y="-23" width="20" height="10" rx="4" fill="#3f51b5" />}
      {/* Thân */}
      {outfit === 'aodai' ? (
        <g>
          <path d="M-11 -9 L-10.5 -35 Q0 -38 10.5 -35 L11 -9 Q0 -7 -11 -9 Z" fill={shirt} />
          <path d="M-11 -9 L-10.5 -35 Q0 -38 10.5 -35 L11 -9 Q0 -7 -11 -9 Z" fill="url(#k-shade)" />
          <path d="M-4 -36 H4 V-33 H-4 Z" fill="#fdd835" />
          <path d="M0 -33 V-12" stroke="#fdd835" strokeWidth="0.8" strokeDasharray="2 2" />
        </g>
      ) : (
        <g>
          <path d="M-11 -20 Q-12 -36 0 -37 Q12 -36 11 -20 Z" fill={shirt} />
          {outfit === 'coat' && (
            <>
              <path d="M-11.5 -13 Q-12.5 -36 0 -37 Q12.5 -36 11.5 -13 Z" fill="#fafafa" />
              <path d="M-4 -36 L0 -27 L4 -36 Z" fill={shirt} />
              <rect x="3.5" y="-24" width="5" height="4" rx="1" fill="#e0e0e0" />
              <path d="M-6 -28 v6 m-3 -3 h6" stroke="#e53935" strokeWidth="1.6" />
            </>
          )}
          <path d="M-11 -20 Q-12 -36 0 -37 Q12 -36 11 -20 Z" fill="url(#k-shade)" />
        </g>
      )}
      {vest && (
        <g>
          <path d="M-11.5 -19 L-11 -34 Q-7 -37 -3 -35 L-3 -19 Z" fill={vest} />
          <path d="M11.5 -19 L11 -34 Q7 -37 3 -35 L3 -19 Z" fill={vest} />
          <path d="M-11.5 -19 L-11 -34 Q-7 -37 -3 -35 L-3 -19 Z M11.5 -19 L11 -34 Q7 -37 3 -35 L3 -19 Z" fill="url(#k-gloss)" />
          <path d="M-3 -27 H3" stroke="#eceff1" strokeWidth="2" />
          <path d="M-11 -24 H-3 M3 -24 H11" stroke="#fff" strokeWidth="1.4" opacity="0.85" />
        </g>
      )}
      <Arm sx={-9.5} sy={-33} pose={leftArm} side={-1} len={12} color={vest ?? sleeve} w={5} />
      <Arm sx={9.5} sy={-33} pose={rightArm} side={1} len={12} color={vest ?? sleeve} w={5} />
      {/* Đầu */}
      <circle cx="-13" cy="-48" r="3" fill={SKIN} />
      <circle cx="13" cy="-48" r="3" fill={SKIN} />
      <circle cx="0" cy="-49" r="13.5" fill="url(#k-skin)" />
      <path d="M-13.4 -50 C-15 -65 14 -67 13.4 -51 C10 -57 4 -58 -1 -56 C-6 -59 -10 -56 -13.4 -50 Z" fill="#5d4037" />
      <path d="M-1 -62 q2 -6 6 -4" stroke="#5d4037" strokeWidth="2" fill="none" strokeLinecap="round" />
      <Eyes y={-48} dx={4.6} r={2.3} face={face} />
      <Cheeks y={-43.5} dx={8.2} />
      <Mouth y={-42.5} w={3.4} face={face} />
      {hat === 'cap' && (
        <g>
          <path d="M-13.5 -53 Q-12 -68 2 -67 Q14 -66 13.5 -53 Z" fill="#fdd835" />
          <path d="M-13.5 -53 Q-12 -68 2 -67 Q14 -66 13.5 -53 Z" fill="url(#k-ball)" />
          <path d="M4 -54 Q16 -56 24 -52 Q14 -50 4 -52 Z" fill="#f9a825" />
          <circle cx="0" cy="-67" r="1.8" fill="#f9a825" />
        </g>
      )}
      {hat === 'conical' && (
        <g>
          <path d="M-22 -54 L0 -76 L22 -54 Q0 -49 -22 -54 Z" fill="#f2d98d" />
          <path d="M-14 -56 L0 -76 M-6 -54.5 L0 -76 M6 -54.5 L0 -76 M14 -56 L0 -76" stroke="#d1b35f" strokeWidth="0.8" />
          <path d="M-22 -54 L0 -76 L22 -54 Q0 -49 -22 -54 Z" fill="url(#k-shade)" />
          <path d="M-11 -52 Q-8 -34 0 -36 Q8 -34 11 -52" stroke="#c62828" strokeWidth="0.9" fill="none" />
        </g>
      )}
      {hat === 'straw' && (
        <g>
          <ellipse cx="0" cy="-56" rx="21" ry="4.5" fill="#e8c46a" />
          <path d="M-11 -56 Q-11 -69 0 -69 Q11 -69 11 -56 Z" fill="#edcf7b" />
          <path d="M-11 -59 H11 V-56 H-11 Z" fill="#e53935" />
          <path d="M-11 -56 Q-11 -69 0 -69 Q11 -69 11 -56 Z" fill="url(#k-shade)" />
        </g>
      )}
      {children}
    </At>
  )
}

/** Ba (người lớn). (x, y) là điểm giữa hai bàn chân. */
export function Dad({
  x = 0,
  y = 0,
  s = 1,
  shirt = '#42a5f5',
  arms = 'down',
  face = 'smile',
  flip = false,
  shadow = true,
  nurse = false,
  children,
}: {
  x?: number
  y?: number
  s?: number
  shirt?: string
  arms?: Arms
  face?: Face
  flip?: boolean
  shadow?: boolean
  nurse?: boolean
  children?: ReactNode
}) {
  const leftArm: Arms = arms === 'wave' ? 'down' : arms
  const rightArm: Arms = arms === 'wave' ? 'up' : arms
  const top = nurse ? '#4db6ac' : shirt
  return (
    <At x={x} y={y} s={s} flip={flip}>
      {shadow && <Shadow rx={18} />}
      <rect x="-11" y="-40" width="9" height="39" rx="4" fill="#455a64" />
      <rect x="2" y="-40" width="9" height="39" rx="4" fill="#455a64" />
      <ellipse cx="-7" cy="-1.8" rx="7" ry="3.2" fill="#3e2723" />
      <ellipse cx="7" cy="-1.8" rx="7" ry="3.2" fill="#3e2723" />
      <path d="M-15.5 -38 Q-17 -72 0 -73 Q17 -72 15.5 -38 Z" fill={top} />
      <path d="M-5 -72 L0 -64 L5 -72 Z" fill="#fff" opacity={nurse ? 0.9 : 0.5} />
      {nurse && <path d="M-8 -56 v7 m-3.5 -3.5 h7" stroke="#fff" strokeWidth="2" />}
      <path d="M-15.5 -38 Q-17 -72 0 -73 Q17 -72 15.5 -38 Z" fill="url(#k-shade)" />
      <Arm sx={-14} sy={-67} pose={leftArm} side={-1} len={27} color={top} w={7} />
      <Arm sx={14} sy={-67} pose={rightArm} side={1} len={27} color={top} w={7} />
      <circle cx="-13.5" cy="-85" r="3.2" fill={SKIN} />
      <circle cx="13.5" cy="-85" r="3.2" fill={SKIN} />
      <ellipse cx="0" cy="-86" rx="13.5" ry="14.5" fill="url(#k-skin)" />
      <path d="M-13.8 -87 C-16 -104 15 -105 13.8 -87 C11 -94 4 -95 -1 -93 C-6 -96 -11 -94 -13.8 -87 Z" fill="#3e2723" />
      <path d="M-8 -91 h5 M3 -91 h5" stroke="#3e2723" strokeWidth="1.5" strokeLinecap="round" />
      <Eyes y={-86} dx={5} r={2.1} face={face} />
      <ellipse cx="0" cy="-82" rx="1.6" ry="1.2" fill="#e8a982" />
      <Mouth y={-78.5} w={4} face={face} />
      {nurse && (
        <g>
          <path d="M-11 -97 Q0 -104 11 -97 L9 -93 H-9 Z" fill="#4db6ac" />
          <path d="M-2 -99 h4 m-2 -2 v4" stroke="#fff" strokeWidth="1.2" />
        </g>
      )}
      {children}
    </At>
  )
}

/** Bà (tóc bạc búi, đeo kính, áo bà ba tím). */
export function Grandma({ x = 0, y = 0, s = 1, arms = 'down', face = 'smile', flip = false }: { x?: number; y?: number; s?: number; arms?: Arms; face?: Face; flip?: boolean }) {
  const leftArm: Arms = arms === 'wave' ? 'down' : arms
  const rightArm: Arms = arms === 'wave' ? 'up' : arms
  return (
    <At x={x} y={y} s={s} flip={flip}>
      <Shadow rx={16} />
      <path d="M-11 -32 L-12 -1 H-1 L-1 -32 Z M1 -32 L1 -1 H12 L11 -32 Z" fill="#37474f" />
      <ellipse cx="-6.5" cy="-1.5" rx="6" ry="2.8" fill="#5d4037" />
      <ellipse cx="6.5" cy="-1.5" rx="6" ry="2.8" fill="#5d4037" />
      <path d="M-14 -26 Q-15 -60 0 -61 Q15 -60 14 -26 Z" fill="#8e5bb5" />
      <circle cx="0" cy="-50" r="1.2" fill="#e1bee7" />
      <circle cx="0" cy="-42" r="1.2" fill="#e1bee7" />
      <path d="M-14 -26 Q-15 -60 0 -61 Q15 -60 14 -26 Z" fill="url(#k-shade)" />
      <Arm sx={-12.5} sy={-56} pose={leftArm} side={-1} len={22} color="#8e5bb5" w={6.5} />
      <Arm sx={12.5} sy={-56} pose={rightArm} side={1} len={22} color="#8e5bb5" w={6.5} />
      <circle cx="0" cy="-87" r="7" fill="#e0e0e0" />
      <circle cx="-12.5" cy="-72" r="3" fill={SKIN} />
      <circle cx="12.5" cy="-72" r="3" fill={SKIN} />
      <circle cx="0" cy="-73" r="13" fill="url(#k-skin)" />
      <path d="M-13 -73 C-15 -88 15 -88 13 -73 C9 -80 -9 -80 -13 -73 Z" fill="#eeeeee" />
      <path d="M-13 -73 C-15 -88 15 -88 13 -73" stroke="#bdbdbd" strokeWidth="1" fill="none" />
      <Eyes y={-72} dx={4.6} r={1.8} face={face} />
      <g stroke="#8d6e63" strokeWidth="1.1" fill="none">
        <circle cx="-4.6" cy="-72" r="3.6" />
        <circle cx="4.6" cy="-72" r="3.6" />
        <path d="M-1 -72 h2" />
      </g>
      <Cheeks y={-67.5} dx={8} />
      <Mouth y={-66.5} w={3.4} face={face} />
    </At>
  )
}
