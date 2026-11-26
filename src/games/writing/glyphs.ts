// Nét viết của chữ cái và chữ số, theo dáng chữ viết tay đứng của mẫu chữ lớp 1 ở Việt Nam nhưng
// đơn giản hơn cho bé nhỏ: không có nét khuyết (b, h, k, l, g, y dùng nét thẳng), chữ hoa không có
// vòng xoắn; chỉ giữ móc nhỏ ở chân chữ (a, i, u…). Hình nét do app tự vẽ, không chép từ font nào.
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
// Móc nhỏ ở chân chữ (nét móc ngược phải): từ thân chữ x đi xuống, cong sang phải, dừng ở đường kẻ 2.
const foot = (x: number) => `C${x},0 ${x + 4},0 ${x + 7},-8`
// Nét móc hai đầu (phần sau của n, h, p): từ thân chữ rê lên, vòng qua đỉnh, móc ở chân.
const hump = (x: number) => `L${x},-12 C${x + 2},-18 ${x + 7},-20 ${x + 10},-20 C${x + 13},-20 ${x + 14},-18 ${x + 14},-15 L${x + 14},-5 ${foot(x + 14)}`
// Nét móc xuôi trái ở đầu chữ m, n, v: từ đường kẻ 2 cong lên đầu chữ rồi xuống thân chữ x = 9.
const HOOK_IN = 'M0,-13 C1,-18 4,-20 6,-20 C8,-20 9,-18 9,-15'
// Thân chữ của u, ư, y: nét hất, móc ngược, rê lên đường kẻ 3.
// Đầu chữ r, s theo mẫu: nét hất từ đường kẻ 1 lên quá đường kẻ 3 một chút, vòng thắt nhỏ bên trái đầu nét.
const RS_TOP = 'M0,0 L7,-21.5 C7.6,-24 6,-25.5 4.8,-24.5 C3.8,-23.5 5,-21.5 8,-21'
const U_BODY = 'M0,-10 L6,-20 L6,-6 C6,1 17,1 19,-6 L19,-20'

const LOWER_VI: Glyph[] = [
  { id: 'a', char: 'a', w: 23, strokes: [A_BOWL, `M16,-20 L16,-5 ${foot(16)}`] },
  { id: 'ă', char: 'ă', w: 23, strokes: [A_BOWL, `M16,-20 L16,-5 ${foot(16)}`, breve(8, -24)] },
  { id: 'â', char: 'â', w: 23, strokes: [A_BOWL, `M16,-20 L16,-5 ${foot(16)}`, hat(8, -24)] },
  // Không có nét khuyết: thân chữ là nét thẳng từ đường kẻ 6 xuống.
  { id: 'b', char: 'b', w: 21, strokes: ['M4,-50 L4,-6 C4,-1 7,0 11,0 C17,0 20,-5 19.5,-11 C19,-17 17,-20 15,-20 C13,-20 13,-17 15.5,-16.5 L20,-17'] },
  { id: 'c', char: 'c', w: 16, strokes: ['M14,-16 C12,-19 10,-20 8,-20 C3,-20 0,-15 0,-10 C0,-4 3,0 8,0 C11,0 14,-2 16,-5'] },
  { id: 'd', char: 'd', w: 23, strokes: [A_BOWL, `M16,-40 L16,-5 ${foot(16)}`] },
  { id: 'đ', char: 'đ', w: 23, strokes: [A_BOWL, `M16,-40 L16,-5 ${foot(16)}`, 'M10,-30 L22,-30'] },
  { id: 'e', char: 'e', w: 16, strokes: ['M1,-9 C6,-9 14,-11 14,-15 C14,-18 11,-20 8,-20 C3,-20 0,-15 0,-10 C0,-4 3,0 8,0 C11,0 14,-2 16,-5'] },
  {
    id: 'ê',
    char: 'ê',
    w: 16,
    strokes: ['M1,-9 C6,-9 14,-11 14,-15 C14,-18 11,-20 8,-20 C3,-20 0,-15 0,-10 C0,-4 3,0 8,0 C11,0 14,-2 16,-5', hat(8, -24)],
  },
  // g, y: nét thẳng xuống dưới, cuối nét cong sang trái (không vòng khuyết).
  { id: 'g', char: 'g', w: 17, strokes: [A_BOWL, 'M16,-20 L16,22 C16,29 9,30 5,25'] },
  { id: 'h', char: 'h', w: 25, strokes: [`M4,-50 L4,0 ${hump(4)}`] },
  { id: 'i', char: 'i', w: 13, strokes: [`M0,-10 L6,-20 L6,-5 ${foot(6)}`, 'M6,-28 L6,-27'] },
  { id: 'k', char: 'k', w: 22, strokes: [`M4,-50 L4,0 L4,-11 C6,-17 11,-21 15,-18 C17,-15 13,-11 9,-11 C7.5,-11 7.5,-9.5 9.5,-10 C13,-10 15,-7 15,-5 ${foot(15)}`] },
  { id: 'l', char: 'l', w: 11, strokes: [`M4,-50 L4,-5 ${foot(4)}`] },
  { id: 'm', char: 'm', w: 44, strokes: [`${HOOK_IN} L9,0 L9,-12 C11,-18 16,-20 19,-20 C22,-20 23,-18 23,-15 L23,0 ${hump(23)}`] },
  { id: 'n', char: 'n', w: 30, strokes: [`${HOOK_IN} L9,0 ${hump(9)}`] },
  { id: 'o', char: 'o', w: 14, strokes: [oval(7, -10, 7, 10)] },
  { id: 'ô', char: 'ô', w: 14, strokes: [oval(7, -10, 7, 10), hat(7, -24)] },
  { id: 'ơ', char: 'ơ', w: 18, strokes: [oval(7, -10, 7, 10), 'M12,-17 C16,-17 18,-19 17,-23'] },
  { id: 'p', char: 'p', w: 27, strokes: ['M0,-12 L6,-20 L6,20 ' + hump(6)] },
  { id: 'q', char: 'q', w: 17, strokes: [A_BOWL, 'M16,-20 L16,20'] },
  // r: nét ngang ngắn rồi nét móc ngược; s: nét cong phải, cuối nét móc nhỏ hếch lên, không chạm nét hất.
  { id: 'r', char: 'r', w: 22, strokes: [`${RS_TOP} C11,-22 14,-22 15.5,-20 C17,-18 16.5,-14 16,-10 L16,-5 ${foot(16)}`] },
  { id: 's', char: 's', w: 21, strokes: ['M0,0 L8,-21.5 C8.6,-24 7,-25.5 5.8,-24.5 C4.8,-23.5 6,-21.5 9,-21 C12.5,-18 17.5,-14 19.5,-10 C21.5,-5 18,-0.5 13,-0.5 C9,-0.5 6,-2 5,-5'] },
  { id: 't', char: 't', w: 13, strokes: [`M6,-30 L6,-5 ${foot(6)}`, 'M1,-20 L12,-20'] },
  { id: 'u', char: 'u', w: 26, strokes: [`${U_BODY} L19,-5 ${foot(19)}`] },
  { id: 'ư', char: 'ư', w: 26, strokes: [`${U_BODY} L19,-5 ${foot(19)}`, 'M19,-19 C23,-19 25,-21 24,-25'] },
  { id: 'v', char: 'v', w: 24, strokes: [`${HOOK_IN} L9,-7 C9,-2 12,0 14,0 C19,0 21,-6 21,-13 C21,-18 20,-20 19,-20 C17.5,-20 17.5,-17.5 20,-17 L24,-17.5`] },
  { id: 'x', char: 'x', w: 22, strokes: ['M1,-18 C5,-21 11,-18 11,-10 C11,-2 5,1 0,-2', 'M21,-18 C17,-21 11,-18 11,-10 C11,-2 17,1 22,-2'] },
  { id: 'y', char: 'y', w: 20, strokes: [`${U_BODY} L19,22 C19,29 12,30 8,25`] },
]

// Bốn chữ chỉ có trong bảng chữ tiếng Anh, vẽ cùng kiểu.
const LOWER_EN_EXTRA: Glyph[] = [
  { id: 'f', char: 'f', w: 15, strokes: ['M15,-45 C13,-49 10,-50 8,-50 C5,-50 4,-47 4,-43 L4,0', 'M0,-20 L12,-20'] },
  { id: 'j', char: 'j', w: 10, strokes: ['M0,-10 L6,-20 L6,22 C6,29 0,30 -4,25', 'M6,-28 L6,-27'] },
  { id: 'w', char: 'w', w: 28, strokes: ['M0,-10 L6,-20 L6,-6 C6,1 15,1 17,-6 L17,-20 L17,-6 C17,1 26,1 28,-6 L28,-20'] },
  { id: 'z', char: 'z', w: 16, strokes: ['M1,-20 L15,-20 L1,0 L16,0'] },
]

// Chữ hoa: thân chữ trong khoảng y = -50 … 0. Không có vòng xoắn; chỉ giữ móc nhỏ ở chân chữ.
const U_HAT = (cx: number) => hat(cx, -54)
const U_A = ['M5,0 L21,-50 L31,-6 C32,-1 35,0 38,-4', 'M10,-20 C16,-24 22,-16 32,-22']
const U_E = 'M27,-44 C24,-49 18,-50 14,-49 C8,-47 7,-40 9,-35 C11,-30 15,-27 19,-26 C10,-25 2,-19 2,-11 C2,-3 8,0 15,0 C22,0 27,-3 29,-8'
const U_O = oval(17, -25, 15, 25)
const U_U = 'M6,-48 L6,-14 C6,-4 12,0 17,0 C24,0 28,-5 28,-14 L28,-48 L28,-6 C28,0 32,0 35,-4'
const U_C = 'M30,-42 C27,-48 22,-50 17,-49 C7,-47 1,-37 1,-25 C1,-10 8,0 18,0 C25,0 30,-4 32,-9'
const U_D = ['M8,-48 L8,0', 'M8,-48 C26,-49 33,-38 33,-25 C33,-10 26,0 8,0']
const U_TOP_BAR = (x0: number, x1: number) => `M${x0},-47 C${x0 + 8},-50 ${x1 - 8},-46 ${x1},-49`

const UPPER_VI: Glyph[] = [
  { id: 'A', char: 'A', w: 38, strokes: U_A },
  { id: 'Ă', char: 'Ă', w: 38, strokes: [...U_A, breve(21, -55)] },
  { id: 'Â', char: 'Â', w: 38, strokes: [...U_A, U_HAT(21)] },
  {
    id: 'B',
    char: 'B',
    w: 28,
    strokes: ['M8,-48 L8,0', 'M8,-48 C20,-50 25,-45 25,-38 C25,-31 20,-26 9,-26 C22,-26 28,-20 28,-12 C28,-4 21,0 8,0'],
  },
  { id: 'C', char: 'C', w: 32, strokes: [U_C] },
  { id: 'D', char: 'D', w: 33, strokes: U_D },
  { id: 'Đ', char: 'Đ', w: 33, strokes: [...U_D, 'M2,-24 L16,-24'] },
  { id: 'E', char: 'E', w: 29, strokes: [U_E] },
  { id: 'Ê', char: 'Ê', w: 29, strokes: [U_E, U_HAT(16)] },
  { id: 'G', char: 'G', w: 32, strokes: [U_C.replace('C25,0 30,-4 32,-9', 'C25,0 31,-5 31,-14 L31,-22'), 'M20,-22 L31,-22'] },
  { id: 'H', char: 'H', w: 34, strokes: ['M7,-48 L7,0', `M28,-48 L28,-5 ${foot(28)}`, 'M7,-25 L28,-25'] },
  { id: 'I', char: 'I', w: 26, strokes: [U_TOP_BAR(4, 28), 'M16,-48 L16,-5 C16,0 11,1 8,-2'] },
  { id: 'K', char: 'K', w: 34, strokes: ['M8,-48 L8,0', 'M31,-47 L10,-24 C18,-22 23,-12 25,-6 C26,0 30,0 34,-4'] },
  { id: 'L', char: 'L', w: 32, strokes: ['M10,-48 L10,-4 C10,0 14,0 18,0 L32,0'] },
  { id: 'M', char: 'M', w: 38, strokes: [`M4,0 L12,-48 L20,-10 L28,-48 L31,-6 ${foot(31)}`] },
  { id: 'N', char: 'N', w: 34, strokes: ['M5,0 L10,-48 L28,0 L32,-48'] },
  { id: 'O', char: 'O', w: 32, strokes: [U_O] },
  { id: 'Ô', char: 'Ô', w: 32, strokes: [U_O, U_HAT(17)] },
  { id: 'Ơ', char: 'Ơ', w: 37, strokes: [U_O, 'M30,-38 C34,-38 37,-41 36,-46'] },
  { id: 'P', char: 'P', w: 28, strokes: ['M8,-48 L8,0', 'M8,-48 C22,-50 27,-44 27,-37 C27,-30 21,-25 8,-25'] },
  { id: 'Q', char: 'Q', w: 34, strokes: [U_O, 'M20,-9 C24,-5 28,0 34,2'] },
  {
    id: 'R',
    char: 'R',
    w: 34,
    strokes: ['M8,-48 L8,0', 'M8,-48 C22,-50 27,-44 27,-37 C27,-30 21,-25 9,-25 C17,-23 22,-14 24,-7 C25,-1 29,0 33,-4'],
  },
  { id: 'S', char: 'S', w: 30, strokes: ['M28,-42 C25,-48 20,-49 16,-49 C9,-49 5,-45 5,-38 C5,-28 28,-25 28,-12 C28,-4 22,0 15,0 C9,0 5,-3 3,-8'] },
  { id: 'T', char: 'T', w: 32, strokes: [U_TOP_BAR(2, 32), 'M17,-48 L17,-5 C17,0 12,1 9,-2'] },
  { id: 'U', char: 'U', w: 35, strokes: [U_U] },
  { id: 'Ư', char: 'Ư', w: 35, strokes: [U_U, 'M28,-46 C33,-47 35,-50 34,-54'] },
  { id: 'V', char: 'V', w: 34, strokes: ['M3,-48 L17,0 L31,-48'] },
  { id: 'X', char: 'X', w: 32, strokes: ['M4,-48 L30,0', 'M30,-48 L4,0'] },
  { id: 'Y', char: 'Y', w: 30, strokes: ['M6,-48 L6,-16 C6,-6 12,-2 17,-2 C24,-2 28,-8 28,-16 L28,-48 L28,22 C28,29 21,30 17,25'] },
]

const UPPER_EN_EXTRA: Glyph[] = [
  { id: 'F', char: 'F', w: 30, strokes: ['M8,-48 L8,0', 'M8,-48 L30,-48', 'M8,-25 L25,-25'] },
  { id: 'J', char: 'J', w: 26, strokes: [U_TOP_BAR(4, 28), 'M18,-48 L18,-10 C18,-2 13,0 9,0 C5,0 2,-3 2,-7'] },
  { id: 'W', char: 'W', w: 40, strokes: ['M3,-48 L11,0 L20,-36 L29,0 L37,-48'] },
  { id: 'Z', char: 'Z', w: 30, strokes: ['M4,-48 L30,-48 L4,0 L31,0'] },
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
