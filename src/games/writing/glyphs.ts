// Nét viết của chữ cái và chữ số, theo kiểu chữ viết tay đứng của mẫu chữ lớp 1 ở Việt Nam
// (chữ thường có nét khuyết, nét móc; chữ hoa có vòng xoắn). Hình nét do app tự vẽ theo mô tả
// của mẫu chữ, không chép từ font nào; phụ huynh nên đối chiếu với vở tập viết của bé.
//
// Toạ độ: 1 li = 10 đơn vị, đường kẻ chân chữ (đường kẻ 1) ở y = 0, đi lên là y âm.
//   Chữ thường cao 2 li (y = -20); b, h, k, l, g, y cao 5 li; d, đ, p, q cao 4 li; t cao 3 li.
//   Chữ hoa cao 5 li (y = -50). Chữ số cao 4 li (y = -40).
// Mỗi nét trong `strokes` là một lần đặt bút (viết liền, không nhấc bút), theo đúng thứ tự viết.
// Nét rất ngắn (dấu chấm của i, j) được tính là "chạm".

export type Glyph = {
  /** Mã chữ, dùng làm khoá lưu tiến độ. */
  id: string
  /** Chữ hiển thị (cho trình đọc màn hình). */
  char: string
  /** Bề rộng thân chữ (đơn vị), để căn giữa. */
  w: number
  strokes: string[]
}

export type GlyphKind = 'lower' | 'upper' | 'number'

/** Khung nhìn theo chiều dọc cho từng loại chữ: [y trên, y dưới]. */
export const FRAME: Record<GlyphKind, [number, number]> = {
  lower: [-55, 35],
  upper: [-65, 35],
  number: [-48, 8],
}

// Khung vừa sát cho màn viết (để chữ to nhất có thể), tối thiểu như sau: [y trên, y dưới].
const TIGHT_MIN: Record<GlyphKind, [number, number]> = {
  lower: [-30, 10],
  upper: [-60, 10],
  number: [-48, 8],
}

/** Toạ độ y nhỏ nhất / lớn nhất của các điểm trong nét (gồm cả điểm điều khiển, nên hơi rộng). */
function yRange(g: Glyph): [number, number] {
  const ys = g.strokes.flatMap((d) => [...d.matchAll(/(-?[\d.]+)[ ,](-?[\d.]+)/g)].map((m) => Number(m[2])))
  return [Math.min(...ys), Math.max(...ys)]
}

/**
 * viewBox cho một chữ: rộng theo chữ (thêm lề hai bên, không hẹp hơn minW).
 * Mặc định cao theo loại chữ (các ô trên bảng chữ thẳng hàng nhau); `tight` thì vừa sát chữ, chừa 1 li.
 */
export function glyphBox(g: Glyph, kind: GlyphKind, minW = 0, tight = false) {
  let [top, bottom] = FRAME[kind]
  if (tight) {
    const [lo, hi] = yRange(g)
    top = Math.min(TIGHT_MIN[kind][0], Math.floor((lo - 6) / 10) * 10)
    bottom = Math.max(TIGHT_MIN[kind][1], Math.ceil((hi + 6) / 10) * 10)
  }
  const w = Math.max(g.w + 24, minW)
  const x = g.w / 2 - w / 2
  return { x, y: top, w, h: bottom - top }
}

// Dấu phụ: mũ (â ê ô), dấu á (ă), râu (ơ ư). `top` là chân dấu.
const hat = (cx: number, top: number) => `M${cx - 5},${top} L${cx},${top - 6} L${cx + 5},${top}`
const breve = (cx: number, top: number) => `M${cx - 5},${top - 5} C${cx - 4},${top} ${cx + 4},${top} ${cx + 5},${top - 5}`

// Nét cong kín (như chữ o): bắt đầu ở phía trên bên phải, viết sang trái (ngược chiều kim đồng hồ),
// vòng hết một vòng rồi chồng lên đầu nét một chút.
function oval(cx: number, cy: number, rx: number, ry: number, from = -60, sweep = 375): string {
  const pt = (deg: number) => {
    const a = (deg * Math.PI) / 180
    return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)]
  }
  const n = Math.ceil(sweep / 90)
  const step = -sweep / n // đi ngược chiều kim đồng hồ trên màn hình (y hướng xuống)
  const k = (4 / 3) * Math.tan(((Math.abs(step) * Math.PI) / 180) / 4)
  const [x0, y0] = pt(from)
  let d = `M${x0.toFixed(1)},${y0.toFixed(1)}`
  for (let i = 0; i < n; i++) {
    const a0 = ((from + step * i) * Math.PI) / 180
    const a1 = ((from + step * (i + 1)) * Math.PI) / 180
    const s = Math.sign(step)
    const c1 = [cx + rx * (Math.cos(a0) - s * k * Math.sin(a0)), cy + ry * (Math.sin(a0) + s * k * Math.cos(a0))]
    const c2 = [cx + rx * (Math.cos(a1) + s * k * Math.sin(a1)), cy + ry * (Math.sin(a1) - s * k * Math.cos(a1))]
    const [x1, y1] = pt(from + step * (i + 1))
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${x1.toFixed(1)},${y1.toFixed(1)}`
  }
  return d
}

// Thân chung của a, ă, â, d, đ, g, q: nét cong kín hơi hẹp.
const A_BOWL = oval(8, -10, 7.5, 10)
// Nét khuyết xuôi (đầu khuyết chạm đường kẻ 6), dùng cho b, h, k, l: kết thúc ở chân thân chữ x = 4.
const LOOP_UP = 'M0,-10 C4,-16 11,-30 11,-40 C11,-47 9,-50 7,-50 C5,-50 4,-47 4,-42'
// Nét móc hai đầu (phần sau của n, h, p): từ thân chữ rê lên, vòng qua đỉnh, móc ở chân, dừng ở đường kẻ 2.
const hump = (x: number) =>
  `L${x},-12 C${x + 2},-18 ${x + 6},-20 ${x + 8},-20 C${x + 10},-20 ${x + 11},-18 ${x + 11},-15 L${x + 11},-5 C${x + 11},0 ${x + 15},0 ${x + 18},-8`

const LOWER_VI: Glyph[] = [
  { id: 'a', char: 'a', w: 23, strokes: [A_BOWL, 'M16,-20 L16,-5 C16,0 20,0 23,-8'] },
  { id: 'ă', char: 'ă', w: 23, strokes: [A_BOWL, 'M16,-20 L16,-5 C16,0 20,0 23,-8', breve(8, -24)] },
  { id: 'â', char: 'â', w: 23, strokes: [A_BOWL, 'M16,-20 L16,-5 C16,0 20,0 23,-8', hat(8, -24)] },
  {
    id: 'b',
    char: 'b',
    w: 22,
    strokes: [`${LOOP_UP} L4,-6 C4,0 8,0 11,0 C16,0 19,-5 19,-11 C19,-17 17,-20 15,-20 C13,-20 12,-17 15,-16 L21,-17`],
  },
  { id: 'c', char: 'c', w: 16, strokes: ['M13,-15 C15,-17 13,-20 9,-20 C4,-20 0,-16 0,-10 C0,-4 3,0 8,0 C11,0 14,-2 16,-5'] },
  { id: 'd', char: 'd', w: 23, strokes: [A_BOWL, 'M16,-40 L16,-5 C16,0 20,0 23,-8'] },
  { id: 'đ', char: 'đ', w: 23, strokes: [A_BOWL, 'M16,-40 L16,-5 C16,0 20,0 23,-8', 'M10,-30 L22,-30'] },
  { id: 'e', char: 'e', w: 16, strokes: ['M1,-9 C6,-9 14,-11 14,-15 C14,-18 11,-20 8,-20 C3,-20 0,-15 0,-10 C0,-4 3,0 8,0 C11,0 14,-2 16,-5'] },
  {
    id: 'ê',
    char: 'ê',
    w: 16,
    strokes: ['M1,-9 C6,-9 14,-11 14,-15 C14,-18 11,-20 8,-20 C3,-20 0,-15 0,-10 C0,-4 3,0 8,0 C11,0 14,-2 16,-5', hat(8, -24)],
  },
  { id: 'g', char: 'g', w: 23, strokes: [A_BOWL, 'M16,-20 L16,24 C16,29 13,30 12,30 C10,30 10,27 11,22 C12,14 14,6 16,1 C18,-3 20,-5 23,-8'] },
  { id: 'h', char: 'h', w: 22, strokes: [`${LOOP_UP} L4,0 ${hump(4)}`] },
  { id: 'i', char: 'i', w: 13, strokes: ['M0,-10 L6,-20 L6,-5 C6,0 10,0 13,-8', 'M6,-28 L6,-27'] },
  {
    id: 'k',
    char: 'k',
    w: 22,
    strokes: [`${LOOP_UP} L4,0 L4,-12 C6,-18 11,-21 14,-18 C16,-15 12,-11 8,-11 C12,-11 15,-8 15,-5 C15,0 19,0 22,-8`],
  },
  { id: 'l', char: 'l', w: 12, strokes: [`${LOOP_UP} L4,-5 C4,0 8,0 12,-8`] },
  { id: 'm', char: 'm', w: 33, strokes: ['M0,-14 C1,-19 3,-20 5,-20 C6,-20 6,-18 6,-15 L6,0 L6,-12 C8,-18 11,-20 13,-20 C15,-20 16,-18 16,-15 L16,0 ' + hump(16)] },
  { id: 'n', char: 'n', w: 24, strokes: ['M0,-14 C1,-19 3,-20 5,-20 C6,-20 6,-18 6,-15 L6,0 ' + hump(6)] },
  { id: 'o', char: 'o', w: 16, strokes: [oval(8, -10, 8, 10)] },
  { id: 'ô', char: 'ô', w: 16, strokes: [oval(8, -10, 8, 10), hat(8, -24)] },
  { id: 'ơ', char: 'ơ', w: 20, strokes: [oval(8, -10, 8, 10), 'M14,-17 C18,-17 20,-19 19,-23'] },
  { id: 'p', char: 'p', w: 24, strokes: ['M0,-12 L6,-20 L6,20 ' + hump(6)] },
  { id: 'q', char: 'q', w: 17, strokes: [A_BOWL, 'M16,-20 L16,20'] },
  { id: 'r', char: 'r', w: 20, strokes: ['M0,-10 L5,-25 C3,-23 3,-20 6,-21 C9,-22 12,-22 13,-19 L13,-5 C13,0 17,0 20,-8'] },
  { id: 's', char: 's', w: 15, strokes: ['M0,-10 L7,-25 C9,-22 14,-16 14,-9 C14,-3 10,0 7,0 C3,0 2,-3 4,-5 C6,-6 7,-4 5,-3'] },
  { id: 't', char: 't', w: 14, strokes: ['M0,-12 L6,-20 L6,-30 L6,-5 C6,0 10,0 14,-8', 'M0,-20 L12,-20'] },
  { id: 'u', char: 'u', w: 24, strokes: ['M0,-10 L6,-20 L6,-6 C6,1 15,1 17,-6 L17,-20 L17,-5 C17,0 21,0 24,-8'] },
  {
    id: 'ư',
    char: 'ư',
    w: 24,
    strokes: ['M0,-10 L6,-20 L6,-6 C6,1 15,1 17,-6 L17,-20 L17,-5 C17,0 21,0 24,-8', 'M17,-19 C21,-19 23,-21 22,-25'],
  },
  {
    id: 'v',
    char: 'v',
    w: 20,
    strokes: ['M0,-14 C1,-19 3,-20 5,-20 C7,-20 7,-17 7,-14 L7,-7 C7,-2 10,0 12,0 C16,0 17,-6 17,-13 C17,-18 16,-20 15,-20 C13,-20 13,-17 16,-16 L20,-17'],
  },
  { id: 'x', char: 'x', w: 18, strokes: ['M1,-18 C4,-21 9,-18 9,-10 C9,-2 4,1 0,-2', 'M17,-18 C14,-21 9,-18 9,-10 C9,-2 14,1 18,-2'] },
  { id: 'y', char: 'y', w: 24, strokes: ['M0,-10 L6,-20 L6,-6 C6,1 15,1 17,-6 L17,-20 L17,24 C17,29 14,30 13,30 C11,30 11,27 12,22 C13,14 15,6 17,1 C19,-3 21,-5 24,-8'] },
]

// Bốn chữ chỉ có trong bảng chữ tiếng Anh, vẽ cùng kiểu.
const LOWER_EN_EXTRA: Glyph[] = [
  {
    id: 'f',
    char: 'f',
    w: 18,
    strokes: ['M0,-10 C4,-16 11,-30 11,-40 C11,-47 9,-50 7,-50 C5,-50 4,-47 4,-42 L4,22 C4,30 0,30 0,26 C0,20 6,10 10,4', 'M0,-20 L12,-20'],
  },
  { id: 'j', char: 'j', w: 14, strokes: ['M0,-10 L6,-20 L6,22 C6,30 -2,30 -2,25 C-2,18 7,5 13,-5', 'M6,-28 L6,-27'] },
  {
    id: 'w',
    char: 'w',
    w: 30,
    strokes: ['M0,-10 L6,-20 L6,-6 C6,1 15,1 17,-6 L17,-20 L17,-6 C17,1 26,1 27,-6 L27,-13 C27,-18 26,-20 25,-20 C23,-20 23,-17 26,-16 L30,-17'],
  },
  { id: 'z', char: 'z', w: 17, strokes: ['M1,-18 C5,-21 10,-19 15,-20 L1,0 C6,-3 11,2 17,-1'] },
]

// Chữ hoa: thân chữ trong khoảng y = -50 … 0 (G, Y thêm nét khuyết xuống dưới).
const U_HAT = (cx: number) => hat(cx, -54)
const U_A = [
  'M5,-14 C2,-14 1,-9 3,-5 C5,-1 9,-1 11,-6 L22,-50 L30,-6 C31,-1 34,0 37,-4',
  'M8,-21 C14,-26 20,-17 33,-24',
]
const U_E = 'M20,-42 C19,-46 23,-49 27,-46 C22,-50 12,-49 10,-44 C8,-37 12,-28 18,-26 C14,-26 13,-23 17,-24 C8,-24 2,-18 2,-11 C2,-3 8,0 15,0 C22,0 27,-3 29,-8'
const U_O = 'M20,-46 C10,-50 2,-40 2,-25 C2,-10 10,0 18,0 C27,0 34,-10 34,-25 C34,-40 27,-49 18,-48 C14,-47 14,-42 18,-42 C21,-42 23,-44 22,-47'
const U_U = 'M3,-42 C3,-48 10,-50 10,-42 L10,-12 C10,-3 14,0 19,0 C25,0 28,-5 28,-14 L28,-48 L28,-6 C28,0 32,0 36,-5'
const U_C_TOP = 'M24,-40 C20,-40 19,-46 23,-48 C27,-50 31,-47 30,-43 C28,-48 22,-50 16,-49 C6,-47 1,-37 1,-25'
const U_I_TOP = 'M2,-40 C1,-46 6,-49 10,-47 C14,-45 18,-44 26,-48'

const UPPER_VI: Glyph[] = [
  { id: 'A', char: 'A', w: 37, strokes: U_A },
  { id: 'Ă', char: 'Ă', w: 37, strokes: [...U_A, breve(22, -55)] },
  { id: 'Â', char: 'Â', w: 37, strokes: [...U_A, U_HAT(22)] },
  {
    id: 'B',
    char: 'B',
    w: 28,
    strokes: ['M12,-48 L12,-6 C12,1 4,2 3,-4', 'M5,-42 C8,-50 22,-52 24,-42 C25,-34 18,-27 12,-26 C10,-26 10,-23 12,-24 C22,-26 28,-20 27,-11 C26,-3 18,1 10,0'],
  },
  { id: 'C', char: 'C', w: 32, strokes: [`${U_C_TOP} C1,-10 8,0 18,0 C25,0 30,-4 32,-9`] },
  {
    id: 'D',
    char: 'D',
    w: 35,
    strokes: ['M12,-46 C14,-30 14,-15 11,-5 C9,0 3,0 3,-3 C3,-6 8,-5 12,-2 C14,0 18,0 22,0 C31,0 35,-12 35,-25 C35,-40 27,-49 16,-49 C10,-49 6,-46 6,-42'],
  },
  {
    id: 'Đ',
    char: 'Đ',
    w: 35,
    strokes: [
      'M12,-46 C14,-30 14,-15 11,-5 C9,0 3,0 3,-3 C3,-6 8,-5 12,-2 C14,0 18,0 22,0 C31,0 35,-12 35,-25 C35,-40 27,-49 16,-49 C10,-49 6,-46 6,-42',
      'M6,-24 L20,-24',
    ],
  },
  { id: 'E', char: 'E', w: 29, strokes: [U_E] },
  { id: 'Ê', char: 'Ê', w: 29, strokes: [U_E, U_HAT(16)] },
  { id: 'G', char: 'G', w: 36, strokes: [`${U_C_TOP} C1,-10 8,0 18,0 C24,0 28,-8 29,-24 L29,24 C29,32 21,32 21,26 C21,19 30,6 36,-4`] },
  {
    id: 'H',
    char: 'H',
    w: 34,
    strokes: [
      'M3,-40 C1,-46 8,-50 12,-48 C16,-46 18,-44 20,-46',
      'M16,-46 C14,-30 14,-12 10,-3 C8,1 3,0 3,-4 C3,-10 14,-24 24,-26 C30,-32 33,-44 31,-48 C29,-51 26,-46 26,-40 L26,-6 C26,0 30,0 34,-6',
      'M20,-31 L20,-21',
    ],
  },
  { id: 'I', char: 'I', w: 26, strokes: [U_I_TOP, 'M18,-46 C17,-30 17,-14 15,-6 C13,0 7,1 5,-3 C4,-6 6,-8 9,-7'] },
  {
    id: 'K',
    char: 'K',
    w: 35,
    strokes: [
      U_I_TOP,
      'M18,-46 C17,-30 17,-14 15,-6 C13,0 7,1 5,-3 C4,-6 6,-8 9,-7',
      'M33,-44 C34,-48 30,-48 28,-44 C25,-36 22,-28 18,-26 C16,-25 17,-22 19,-24 C24,-24 27,-12 28,-5 C29,0 32,0 35,-4',
    ],
  },
  {
    id: 'L',
    char: 'L',
    w: 34,
    strokes: ['M18,-40 C16,-46 22,-50 26,-47 C30,-44 24,-41 21,-45 C18,-38 18,-20 14,-8 C12,-2 6,0 4,-3 C2,-6 8,-7 14,-3 C20,0 26,2 34,-3'],
  },
  { id: 'M', char: 'M', w: 38, strokes: ['M3,-5 C4,-1 7,-1 8,-6 C10,-16 12,-36 13,-48 L13,0 L28,-48 L30,-6 C31,0 35,0 38,-5'] },
  { id: 'N', char: 'N', w: 36, strokes: ['M3,-5 C4,-1 7,-1 8,-6 C10,-16 12,-36 13,-48 L27,0 L29,-44 C30,-48 33,-49 36,-46'] },
  { id: 'O', char: 'O', w: 34, strokes: [U_O] },
  { id: 'Ô', char: 'Ô', w: 34, strokes: [U_O, U_HAT(18)] },
  { id: 'Ơ', char: 'Ơ', w: 38, strokes: [U_O, 'M32,-40 C36,-40 39,-43 38,-48'] },
  {
    id: 'P',
    char: 'P',
    w: 27,
    strokes: ['M12,-48 L12,-6 C12,1 4,2 3,-4', 'M5,-42 C8,-50 22,-52 26,-42 C28,-34 22,-26 12,-26 C10,-26 10,-28 12,-29'],
  },
  { id: 'Q', char: 'Q', w: 34, strokes: ['M20,-46 C10,-50 2,-40 2,-25 C2,-10 10,0 18,0 C27,0 34,-10 34,-25 C34,-40 27,-49 18,-48', 'M10,-6 C16,-10 20,4 34,2'] },
  {
    id: 'R',
    char: 'R',
    w: 34,
    strokes: ['M12,-48 L12,-6 C12,1 4,2 3,-4', 'M5,-42 C8,-50 22,-52 26,-42 C28,-34 20,-27 13,-26 C11,-26 11,-23 13,-24 C20,-24 24,-14 25,-6 C26,0 30,0 34,-4'],
  },
  {
    id: 'S',
    char: 'S',
    w: 30,
    strokes: ['M14,-30 C6,-34 4,-44 12,-48 C18,-51 26,-48 28,-44 C26,-46 22,-47 20,-44 C17,-38 26,-30 28,-20 C30,-8 24,0 14,0 C8,0 4,-3 4,-7 C4,-10 8,-10 10,-6'],
  },
  {
    id: 'T',
    char: 'T',
    w: 30,
    strokes: ['M6,-40 C3,-44 6,-49 11,-47 C16,-45 22,-44 30,-48', 'M20,-46 C14,-36 22,-20 18,-8 C15,0 8,1 6,-3 C5,-6 8,-7 10,-5'],
  },
  { id: 'U', char: 'U', w: 36, strokes: [U_U] },
  { id: 'Ư', char: 'Ư', w: 36, strokes: [U_U, 'M28,-46 C33,-47 35,-50 34,-54'] },
  {
    id: 'V',
    char: 'V',
    w: 36,
    strokes: ['M2,-42 C2,-48 8,-50 12,-46 C15,-40 17,-20 18,0 C22,-20 26,-40 30,-46 C32,-49 36,-48 36,-44'],
  },
  {
    id: 'X',
    char: 'X',
    w: 35,
    strokes: ['M4,-42 C6,-50 14,-48 16,-40 L22,-10 C24,-2 30,0 34,-6', 'M34,-42 C30,-48 26,-46 24,-40 L14,-10 C12,-2 6,0 3,-6'],
  },
  {
    id: 'Y',
    char: 'Y',
    w: 36,
    strokes: ['M3,-42 C3,-48 10,-50 10,-42 L10,-14 C10,-4 14,-2 19,-2 C25,-2 28,-8 28,-16 L28,-48 L28,22 C28,30 20,30 20,24 C20,17 30,6 36,-4'],
  },
]

const UPPER_EN_EXTRA: Glyph[] = [
  {
    id: 'F',
    char: 'F',
    w: 30,
    strokes: [
      'M6,-40 C3,-44 6,-49 11,-47 C16,-45 22,-44 30,-48',
      'M20,-46 C14,-36 22,-20 18,-8 C15,0 8,1 6,-3 C5,-6 8,-7 10,-5',
      'M12,-24 L26,-26',
    ],
  },
  { id: 'J', char: 'J', w: 26, strokes: [U_I_TOP, 'M18,-46 C17,-30 18,-10 17,10 C16,22 6,24 4,16 C3,10 10,4 18,0'] },
  { id: 'W', char: 'W', w: 40, strokes: ['M3,-42 C3,-48 10,-50 10,-42 L12,0 L20,-36 L28,0 L34,-42 C35,-48 40,-48 40,-44'] },
  { id: 'Z', char: 'Z', w: 32, strokes: ['M4,-42 C10,-48 20,-44 30,-48 L6,-2 C14,-6 22,2 32,-2'] },
]

export const NUMBERS: Glyph[] = [
  { id: '0', char: '0', w: 22, strokes: [oval(11, -20, 10, 20)] },
  { id: '1', char: '1', w: 16, strokes: ['M4,-27 L14,-40', 'M14,-40 L14,0'] },
  { id: '2', char: '2', w: 22, strokes: ['M3,-30 C3,-37 8,-40 12,-40 C17,-40 21,-37 21,-31 C21,-24 15,-17 3,0', 'M3,0 L22,0'] },
  {
    id: '3',
    char: '3',
    w: 22,
    strokes: ['M3,-33 C5,-38 9,-40 12,-40 C18,-40 21,-36 21,-31 C21,-25 16,-21 10,-21 C17,-21 22,-16 22,-10 C22,-3 17,0 11,0 C6,0 3,-2 2,-6'],
  },
  { id: '4', char: '4', w: 22, strokes: ['M14,-40 L2,-12', 'M2,-12 L22,-12', 'M16,-27 L16,0'] },
  {
    id: '5',
    char: '5',
    w: 22,
    strokes: ['M5,-40 L4,-22', 'M4,-22 C8,-26 20,-27 21,-14 C22,-3 15,0 10,0 C6,0 3,-2 2,-5', 'M5,-40 L21,-40'],
  },
  {
    id: '6',
    char: '6',
    w: 22,
    strokes: ['M19,-37 C17,-40 14,-40 12,-40 C6,-40 2,-30 2,-16 C2,-5 7,0 12,0 C18,0 21,-5 21,-12 C21,-19 17,-24 12,-24 C7,-24 3,-20 2,-15'],
  },
  { id: '7', char: '7', w: 22, strokes: ['M2,-40 L21,-40', 'M21,-40 L8,0', 'M7,-20 L19,-20'] },
  {
    id: '8',
    char: '8',
    w: 22,
    strokes: [
      'M19,-35 C18,-39 15,-40 11,-40 C6,-40 3,-37 3,-32 C3,-26 9,-23 12,-21 C17,-18 21,-14 21,-9 C21,-3 17,0 12,0 C7,0 3,-3 3,-9 C3,-14 7,-18 12,-21 C16,-24 20,-27 20,-32 C20,-37 16,-40 12,-40',
    ],
  },
  { id: '9', char: '9', w: 22, strokes: [oval(11.5, -29, 9, 11), 'M20.5,-31 L20.5,-10 C20.5,-3 16,0 11,0 C7,0 4,-2 3,-5'] },
]

const byIds = (list: Glyph[], order: string) => order.split(' ').map((id) => list.find((g) => g.id === id)!)

const LOWER_ALL = [...LOWER_VI, ...LOWER_EN_EXTRA]
const UPPER_ALL = [...UPPER_VI, ...UPPER_EN_EXTRA]

/** Bảng chữ cái theo ngôn ngữ: tiếng Việt 29 chữ, tiếng Anh 26 chữ. */
export const ALPHABET = {
  vi: {
    lower: LOWER_VI,
    upper: UPPER_VI,
  },
  en: {
    lower: byIds(LOWER_ALL, 'a b c d e f g h i j k l m n o p q r s t u v w x y z'),
    upper: byIds(UPPER_ALL, 'A B C D E F G H I J K L M N O P Q R S T U V W X Y Z'),
  },
} as const
