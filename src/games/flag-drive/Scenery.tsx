// Cảnh nền của trò "Lái xe tìm cờ". Mỗi vòng (5 lá cờ) đổi sang một cảnh khác.
// Khung 300x400 (nhìn từ trên xuống). Đường đi do FlagDriveGame vẽ đè lên; đồ trang trí chỉ đặt
// ở hai bên (x < 60, x > 240) và hai góc dưới, nơi đường không đi qua.

import type { ReactNode } from 'react'
import type { Theme } from './themes'

// ---------- Đồ trang trí (toạ độ là tâm/gốc) ----------

const G = ({ x, y, s = 1, children }: { x: number; y: number; s?: number; children: ReactNode }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>{children}</g>
)

/** Cây tán tròn nhìn từ trên. */
function TreeTop({ x, y, s = 1, c = '#43a047', c2 = '#66bb6a' }: { x: number; y: number; s?: number; c?: string; c2?: string }) {
  return (
    <G x={x} y={y} s={s}>
      <ellipse cx="3" cy="4" rx="17" ry="15" fill="#000" opacity="0.15" />
      <circle r="16" fill={c} />
      <circle cx="-5" cy="-5" r="9" fill={c2} />
      <circle cx="6" cy="2" r="6" fill={c2} opacity="0.7" />
    </G>
  )
}

function Flower({ x, y, c }: { x: number; y: number; c: string }) {
  return (
    <G x={x} y={y}>
      {[0, 72, 144, 216, 288].map((a) => (
        <circle key={a} cx={3.5 * Math.cos((a * Math.PI) / 180)} cy={3.5 * Math.sin((a * Math.PI) / 180)} r="2.6" fill={c} />
      ))}
      <circle r="1.8" fill="#ffeb3b" />
    </G>
  )
}

function Pond({ x, y, rx = 22, ry = 14, c = '#4fc3f7' }: { x: number; y: number; rx?: number; ry?: number; c?: string }) {
  return (
    <G x={x} y={y}>
      <ellipse rx={rx + 3} ry={ry + 3} fill="#8d6e63" opacity="0.3" />
      <ellipse rx={rx} ry={ry} fill={c} />
      <path d={`M${-rx * 0.5} -2 q4 -3 8 0 t8 0`} stroke="#fff" strokeWidth="1.5" fill="none" opacity="0.8" />
    </G>
  )
}

function Palm({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <G x={x} y={y} s={s}>
      <ellipse cx="6" cy="6" rx="16" ry="12" fill="#000" opacity="0.12" />
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <path key={a} d="M0 0 Q8 -6 18 0 Q8 3 0 0 Z" fill="#43a047" transform={`rotate(${a})`} />
      ))}
      <circle r="4" fill="#8d6e63" />
    </G>
  )
}

function Umbrella({ x, y, c = '#ef5350' }: { x: number; y: number; c?: string }) {
  return (
    <G x={x} y={y}>
      <circle r="15" fill="#fff" />
      {[0, 90, 180, 270].map((a) => (
        <path key={a} d="M0 0 L15 0 A15 15 0 0 1 0 15 Z" fill={c} transform={`rotate(${a})`} />
      ))}
      <circle r="2" fill="#fff" />
    </G>
  )
}

function Starfish({ x, y }: { x: number; y: number }) {
  return (
    <G x={x} y={y}>
      <path d="M0 -8 L2 -2 L8 -2 L3 2 L5 8 L0 4 L-5 8 L-3 2 L-8 -2 L-2 -2 Z" fill="#ff8a65" />
    </G>
  )
}

function SandCastle({ x, y }: { x: number; y: number }) {
  return (
    <G x={x} y={y}>
      <rect x="-14" y="-8" width="28" height="16" rx="2" fill="#e0b86a" />
      <rect x="-8" y="-16" width="16" height="10" rx="2" fill="#d8ac58" />
      <path d="M0 -16 V-24 L7 -21 L0 -19" stroke="#8d6e63" strokeWidth="1.2" fill="#ef5350" />
    </G>
  )
}

function Pine({ x, y, s = 1, snow = false }: { x: number; y: number; s?: number; snow?: boolean }) {
  return (
    <G x={x} y={y} s={s}>
      <ellipse cx="4" cy="5" rx="15" ry="13" fill="#000" opacity="0.13" />
      <path d="M0 -16 L14 8 L-14 8 Z M0 -8 L11 14 L-11 14 Z" fill="#2e7d32" transform="translate(0 -3)" />
      {snow && <path d="M0 -19 L6 -9 L-6 -9 Z M-8 3 h6 M3 6 h7" stroke="#fff" strokeWidth="2.5" fill="#fff" strokeLinecap="round" />}
    </G>
  )
}

function Snowman({ x, y }: { x: number; y: number }) {
  return (
    <G x={x} y={y}>
      <ellipse cx="3" cy="4" rx="12" ry="9" fill="#90a4ae" opacity="0.3" />
      <circle r="11" fill="#fff" stroke="#cfd8dc" />
      <circle cy="-13" r="7" fill="#fff" stroke="#cfd8dc" />
      <circle cx="-2.5" cy="-14" r="1" fill="#263238" />
      <circle cx="2.5" cy="-14" r="1" fill="#263238" />
      <path d="M0 -12 l5 1.5 -5 1 Z" fill="#ff7043" />
      <path d="M-7 -6 h14" stroke="#e53935" strokeWidth="3" strokeLinecap="round" />
    </G>
  )
}

function Snowflake({ x, y }: { x: number; y: number }) {
  return (
    <G x={x} y={y}>
      <path d="M-5 0 H5 M0 -5 V5 M-3.5 -3.5 L3.5 3.5 M-3.5 3.5 L3.5 -3.5" stroke="#b3e5fc" strokeWidth="1.5" strokeLinecap="round" />
    </G>
  )
}

function Cactus({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <G x={x} y={y} s={s}>
      <ellipse cx="4" cy="2" rx="12" ry="4" fill="#000" opacity="0.12" />
      <rect x="-5" y="-30" width="10" height="32" rx="5" fill="#43a047" />
      <path d="M-5 -14 H-12 V-24" stroke="#43a047" strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 -10 H12 V-18" stroke="#43a047" strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M0 -26 v20" stroke="#2e7d32" strokeWidth="1.2" />
      <circle cx="0" cy="-31" r="3" fill="#ec407a" />
    </G>
  )
}

function Rock({ x, y, s = 1, c = '#a1887f' }: { x: number; y: number; s?: number; c?: string }) {
  return (
    <G x={x} y={y} s={s}>
      <path d="M-12 4 Q-14 -6 -4 -9 Q8 -12 12 -2 Q14 6 2 7 Q-8 8 -12 4 Z" fill={c} />
      <path d="M-6 -5 Q0 -8 6 -4" stroke="#fff" strokeWidth="1.5" fill="none" opacity="0.4" />
    </G>
  )
}

function Dune({ x, y, w = 70 }: { x: number; y: number; w?: number }) {
  return <path d={`M${x - w / 2} ${y} Q${x} ${y - 22} ${x + w / 2} ${y} Z`} fill="#e9bd6c" />
}

function Building({ x, y, w, h, c }: { x: number; y: number; w: number; h: number; c: string }) {
  const cols = Math.max(1, Math.floor((w - 6) / 9))
  const rows = Math.max(1, Math.floor((h - 6) / 10))
  return (
    <g>
      <rect x={x + 3} y={y + 3} width={w} height={h} fill="#000" opacity="0.15" />
      <rect x={x} y={y} width={w} height={h} rx="2" fill={c} />
      {Array.from({ length: rows * cols }, (_, i) => (
        <rect key={i} x={x + 5 + (i % cols) * 9} y={y + 5 + Math.floor(i / cols) * 10} width="5" height="5" fill="#fff59d" opacity="0.85" />
      ))}
    </g>
  )
}

function Planter({ x, y }: { x: number; y: number }) {
  return (
    <G x={x} y={y}>
      <rect x="-9" y="-9" width="18" height="18" rx="3" fill="#8d6e63" />
      <circle r="8" fill="#66bb6a" />
    </G>
  )
}

function Pumpkin({ x, y }: { x: number; y: number }) {
  return (
    <G x={x} y={y}>
      <ellipse cx="-4" rx="6" ry="7" fill="#f57c00" />
      <ellipse cx="4" rx="6" ry="7" fill="#f57c00" />
      <ellipse rx="5" ry="7.5" fill="#ff9800" />
      <rect x="-1" y="-10" width="2" height="4" fill="#558b2f" />
    </G>
  )
}

function Mushroom({ x, y }: { x: number; y: number }) {
  return (
    <G x={x} y={y}>
      <rect x="-2" y="-2" width="4" height="7" rx="1.5" fill="#fff3e0" />
      <path d="M-7 -1 Q0 -11 7 -1 Z" fill="#e53935" />
      <circle cx="-2" cy="-4" r="1.2" fill="#fff" />
      <circle cx="3" cy="-3" r="1" fill="#fff" />
    </G>
  )
}

function Leaf({ x, y, r, c }: { x: number; y: number; r: number; c: string }) {
  return <path d="M0 -4 Q4 0 0 4 Q-4 0 0 -4 Z" fill={c} transform={`translate(${x} ${y}) rotate(${r})`} />
}

function Lamp({ x, y }: { x: number; y: number }) {
  return (
    <G x={x} y={y}>
      <circle r="26" fill="url(#fd-lamp-glow)" />
      <circle r="5" fill="#fff59d" />
      <circle r="2.5" fill="#fff" />
    </G>
  )
}

function Firefly({ x, y, d = 0 }: { x: number; y: number; d?: number }) {
  return (
    <circle className="fd-twinkle" style={{ animationDelay: `${d}s` }} cx={x} cy={y} r="2.2" fill="#fff59d" />
  )
}

function Tent({ x, y, c = '#ff7043' }: { x: number; y: number; c?: string }) {
  return (
    <G x={x} y={y}>
      <path d="M-16 10 L0 -14 L16 10 Z" fill={c} />
      <path d="M0 -14 L0 10" stroke="#000" strokeOpacity="0.2" strokeWidth="2" />
      <path d="M-4 10 L0 2 L4 10 Z" fill="#3e2723" />
    </G>
  )
}

// ---------- Từng cảnh ----------

const FLOWER_COLORS = ['#ec407a', '#ab47bc', '#ff7043', '#fdd835', '#42a5f5']

function Meadow() {
  return (
    <g>
      <TreeTop x={28} y={170} />
      <TreeTop x={270} y={185} s={1.1} />
      <TreeTop x={40} y={300} s={1.2} />
      <TreeTop x={262} y={330} />
      <Pond x={85} y={365} />
      {[[20, 230], [50, 245], [255, 255], [285, 240], [215, 380], [240, 395], [110, 330], [200, 300]].map(([fx, fy], i) => (
        <Flower key={i} x={fx} y={fy} c={FLOWER_COLORS[i % 5]} />
      ))}
    </g>
  )
}

function Beach() {
  return (
    <g>
      {/* Biển bên phải */}
      <path d="M262 120 Q250 220 266 300 T258 400 H320 V120 Z" fill="#4fc3f7" />
      <path d="M262 120 Q250 220 266 300 T258 400" stroke="#fff" strokeWidth="3" fill="none" opacity="0.8" />
      <path d="M280 170 q5 -3 10 0 M286 250 q5 -3 10 0 M278 340 q5 -3 10 0" stroke="#fff" strokeWidth="1.6" fill="none" />
      <Palm x={30} y={175} />
      <Palm x={40} y={300} s={1.2} />
      <Umbrella x={95} y={350} />
      <Umbrella x={215} y={330} c="#42a5f5" />
      <SandCastle x={30} y={380} />
      <Starfish x={70} y={240} />
      <Starfish x={230} y={385} />
    </g>
  )
}

function Snow() {
  return (
    <g>
      <Pine x={28} y={170} snow />
      <Pine x={270} y={180} s={1.1} snow />
      <Pine x={45} y={290} s={1.2} snow />
      <Pine x={262} y={300} snow />
      <Snowman x={90} y={360} />
      <Pond x={230} y={370} c="#b3e5fc" />
      {[[20, 230], [60, 250], [250, 245], [290, 230], [120, 300], [190, 330], [20, 360], [290, 380]].map(([sx, sy], i) => (
        <Snowflake key={i} x={sx} y={sy} />
      ))}
    </g>
  )
}

function Desert() {
  return (
    <g>
      <Dune x={50} y={220} />
      <Dune x={260} y={250} w={80} />
      <Dune x={230} y={395} w={90} />
      <Cactus x={30} y={190} />
      <Cactus x={275} y={200} s={0.9} />
      <Cactus x={50} y={330} s={1.2} />
      <Rock x={95} y={375} />
      <Rock x={250} y={320} s={0.8} c="#8d6e63" />
      <Rock x={20} y={265} s={0.6} />
    </g>
  )
}

function City() {
  return (
    <g>
      <Building x={2} y={130} w={44} h={60} c="#ef9a9a" />
      <Building x={254} y={135} w={44} h={56} c="#90caf9" />
      <Building x={4} y={205} w={40} h={50} c="#ffe082" />
      <Building x={256} y={205} w={42} h={52} c="#a5d6a7" />
      <Building x={8} y={280} w={70} h={44} c="#ce93d8" />
      <Building x={210} y={285} w={80} h={40} c="#ffcc80" />
      <Planter x={100} y={350} />
      <Planter x={200} y={350} />
      <Planter x={40} y={370} />
      <Planter x={260} y={370} />
      {/* Vạch qua đường */}
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={130 + i * 9} y="320" width="5" height="22" fill="#fff" opacity="0.9" />
      ))}
    </g>
  )
}

function Autumn() {
  return (
    <g>
      <TreeTop x={28} y={170} c="#e65100" c2="#ff9800" />
      <TreeTop x={270} y={185} s={1.1} c="#c62828" c2="#ef5350" />
      <TreeTop x={40} y={300} s={1.2} c="#f9a825" c2="#fdd835" />
      <TreeTop x={262} y={330} c="#e65100" c2="#ffa726" />
      <Pumpkin x={95} y={360} />
      <Pumpkin x={210} y={380} />
      <Mushroom x={70} y={240} />
      <Mushroom x={235} y={250} />
      {[[20, 230, 20, '#ff7043'], [110, 320, -30, '#fdd835'], [200, 300, 45, '#e53935'], [280, 260, 10, '#ffa726'], [140, 380, 60, '#ff7043'], [30, 380, -10, '#e53935']].map(
        ([lx, ly, r, c], i) => (
          <Leaf key={i} x={lx as number} y={ly as number} r={r as number} c={c as string} />
        ),
      )}
    </g>
  )
}

function Night() {
  return (
    <g>
      <TreeTop x={28} y={170} c="#1b5e20" c2="#2e7d32" />
      <TreeTop x={270} y={185} s={1.1} c="#1b5e20" c2="#2e7d32" />
      <Tent x={45} y={300} />
      <Tent x={258} y={310} c="#5c6bc0" />
      <Pond x={90} y={370} c="#1a237e" />
      <circle cx="96" cy="366" r="5" fill="#fff9c4" opacity="0.9" />
      <Lamp x={118} y={300} />
      <Lamp x={182} y={300} />
      <Lamp x={118} y={380} />
      <Lamp x={182} y={380} />
      {[[20, 230], [60, 250], [250, 245], [290, 230], [220, 360], [280, 380], [30, 390], [70, 210]].map(([fx, fy], i) => (
        <Firefly key={i} x={fx} y={fy} d={(i % 4) * 0.4} />
      ))}
    </g>
  )
}

export function Scenery({ theme }: { theme: Theme }) {
  return (
    <g pointerEvents="none">
      <defs>
        <radialGradient id="fd-lamp-glow">
          <stop offset="0" stopColor="#fff59d" stopOpacity="0.7" />
          <stop offset="1" stopColor="#fff59d" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="-200" y="-100" width="700" height="600" fill={theme.ground} />
      {theme.id === 'meadow' && <Meadow />}
      {theme.id === 'beach' && <Beach />}
      {theme.id === 'snow' && <Snow />}
      {theme.id === 'desert' && <Desert />}
      {theme.id === 'city' && <City />}
      {theme.id === 'autumn' && <Autumn />}
      {theme.id === 'night' && <Night />}
    </g>
  )
}
