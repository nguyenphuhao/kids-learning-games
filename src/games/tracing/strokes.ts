// Các nét cho trò "Tô theo nét". Mỗi nét là một dãy điểm trong khung 300×300,
// đi theo đúng chiều bé cần tô (từ chú ong tới bông hoa).
//
// Dễ: nét thẳng. Vừa: nét cong. Khó: nét kết hợp (móc, vòng, răng cưa, xoắn ốc).

import type { Level } from '../shared/useLevel'

export type Point = { x: number; y: number }

const STEP = 3 // khoảng cách giữa hai điểm sau khi chia đều

function line(a: Point, b: Point): Point[] {
  return [a, b]
}

/** Cung tròn tâm (cx, cy), góc tính bằng độ, 0° ở bên phải, chiều dương đi xuống (theo toạ độ SVG). */
function arc(cx: number, cy: number, r: number, from: number, to: number, ry = r): Point[] {
  const n = Math.max(8, Math.ceil(Math.abs(to - from) / 6))
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = ((from + ((to - from) * i) / n) * Math.PI) / 180
    return { x: cx + r * Math.cos(a), y: cy + ry * Math.sin(a) }
  })
}

function wave(x0: number, x1: number, y: number, amp: number, humps: number): Point[] {
  const n = 80
  return Array.from({ length: n + 1 }, (_, i) => ({
    x: x0 + ((x1 - x0) * i) / n,
    y: y - amp * Math.sin((Math.PI * humps * i) / n),
  }))
}

function spiral(cx: number, cy: number, r0: number, r1: number, turns: number): Point[] {
  const n = Math.ceil(turns * 60)
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n
    const a = -Math.PI / 2 + t * turns * 2 * Math.PI
    const r = r0 + (r1 - r0) * t
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
  })
}

/** Nối các đoạn và chia lại thành các điểm cách đều nhau. */
function path(...parts: Point[][]): Point[] {
  const raw = parts.flat()
  const out: Point[] = [raw[0]]
  let carry = 0
  for (let i = 1; i < raw.length; i++) {
    const a = raw[i - 1]
    const b = raw[i]
    const len = Math.hypot(b.x - a.x, b.y - a.y)
    if (len === 0) continue
    let d = STEP - carry
    while (d <= len) {
      out.push({ x: a.x + ((b.x - a.x) * d) / len, y: a.y + ((b.y - a.y) * d) / len })
      d += STEP
    }
    carry = len - (d - STEP)
  }
  const last = raw[raw.length - 1]
  const end = out[out.length - 1]
  if (Math.hypot(last.x - end.x, last.y - end.y) > 0.5) out.push(last)
  return out
}

export type Stroke = { id: string; points: Point[] }

const EASY: Stroke[] = [
  { id: 'across', points: path(line({ x: 45, y: 150 }, { x: 255, y: 150 })) },
  { id: 'down', points: path(line({ x: 150, y: 45 }, { x: 150, y: 255 })) },
  { id: 'slant-down', points: path(line({ x: 70, y: 60 }, { x: 230, y: 240 })) },
  { id: 'slant-up', points: path(line({ x: 70, y: 240 }, { x: 230, y: 60 })) },
  { id: 'valley', points: path(line({ x: 55, y: 70 }, { x: 150, y: 235 }), line({ x: 150, y: 235 }, { x: 245, y: 70 })) },
  { id: 'roof', points: path(line({ x: 55, y: 230 }, { x: 150, y: 65 }), line({ x: 150, y: 65 }, { x: 245, y: 230 })) },
]

const MEDIUM: Stroke[] = [
  // Cầu vồng: cung tròn phía trên, từ trái sang phải.
  { id: 'rainbow', points: path(arc(150, 205, 100, 180, 360)) },
  // Cái chén: cung tròn phía dưới, từ trái sang phải.
  { id: 'bowl', points: path(arc(150, 95, 100, 180, 0)) },
  // Sóng nước.
  { id: 'wave', points: path(wave(40, 260, 150, 55, 3)) },
  // Nét cong hở bên phải (như chữ c): bắt đầu ở trên bên phải, đi ngược chiều kim đồng hồ.
  { id: 'curve-c', points: path(arc(160, 150, 90, -45, -315)) },
  // Nét cong hở bên trái: bắt đầu ở trên bên trái, đi theo chiều kim đồng hồ.
  { id: 'curve-reverse', points: path(arc(140, 150, 90, 225, 495)) },
  // Vòng tròn (gần khép kín): bắt đầu ở trên, đi ngược chiều kim đồng hồ.
  { id: 'circle', points: path(arc(150, 150, 95, -80, -400)) },
]

const HARD: Stroke[] = [
  // Nét móc: đi lên rồi vòng xuống (như chữ n).
  { id: 'hook-hump', points: path(line({ x: 80, y: 245 }, { x: 80, y: 150 }), arc(140, 150, 60, 180, 360), line({ x: 200, y: 150 }, { x: 200, y: 245 })) },
  // Nét móc ngược: đi xuống, vòng lên (như chữ u).
  { id: 'hook-cup', points: path(line({ x: 80, y: 55 }, { x: 80, y: 160 }), arc(140, 160, 60, 180, 0), line({ x: 200, y: 160 }, { x: 200, y: 55 })) },
  // Hai ngọn núi (như chữ m).
  {
    id: 'double-hump',
    points: path(
      line({ x: 45, y: 240 }, { x: 45, y: 150 }),
      arc(97.5, 150, 52.5, 180, 360),
      line({ x: 150, y: 150 }, { x: 150, y: 240 }),
      line({ x: 150, y: 240 }, { x: 150, y: 150 }),
      arc(202.5, 150, 52.5, 180, 360),
      line({ x: 255, y: 150 }, { x: 255, y: 240 }),
    ),
  },
  // Răng cưa.
  {
    id: 'zigzag',
    points: path(
      line({ x: 40, y: 200 }, { x: 95, y: 100 }),
      line({ x: 95, y: 100 }, { x: 150, y: 200 }),
      line({ x: 150, y: 200 }, { x: 205, y: 100 }),
      line({ x: 205, y: 100 }, { x: 260, y: 200 }),
    ),
  },
  // Nét có vòng ở trên (như chữ l viết thường): xiên lên bên phải, vòng qua đỉnh sang trái,
  // rồi đi xuống cắt qua nét vừa tô.
  {
    id: 'loop',
    points: path(
      line({ x: 70, y: 250 }, { x: 180.8, y: 94.4 }),
      arc(150, 80, 34, 25, -180),
      line({ x: 116, y: 80 }, { x: 140, y: 250 }),
    ),
  },
  // Xoắn ốc từ ngoài vào trong.
  { id: 'spiral', points: path(spiral(150, 150, 115, 20, 2.25)) },
]

export const STROKES: Record<Level, Stroke[]> = { easy: EASY, medium: MEDIUM, hard: HARD }

/** Bé được lệch khỏi đường bao nhiêu (đơn vị khung 300×300). */
export const TOLERANCE: Record<Level, number> = { easy: 34, medium: 28, hard: 22 }
