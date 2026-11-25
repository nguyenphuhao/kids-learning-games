// Hàm dùng chung cho các trò chơi.

export function shuffle<T>(list: T[]): T[] {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Số nguyên ngẫu nhiên trong [min, max]. */
export function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}

export function pick<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)]
}

/** Đổi toạ độ con trỏ (pixel màn hình) sang toạ độ trong viewBox của SVG. */
export function svgPoint(svg: SVGSVGElement, clientX: number, clientY: number) {
  const m = svg.getScreenCTM()
  if (!m) return { x: 0, y: 0 }
  const p = new DOMPoint(clientX, clientY).matrixTransform(m.inverse())
  return { x: p.x, y: p.y }
}

export const CELEBRATE_MS = 1500
