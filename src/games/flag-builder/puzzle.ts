// Trò "Ghép quốc kỳ": lấy hình cờ thật (bộ flag-icons, cùng bộ với trò Lái xe tìm cờ, tỉ lệ 4:3)
// cắt thành các mảnh chữ nhật như tranh xếp hình. Trong khay có thêm vài mảnh nhiễu cắt từ cờ nước khác.

import { COUNTRIES, GROUP_A, GROUP_B, flagSrc, type Country } from '../flag-drive/countries'
import type { Level } from '../shared/useLevel'
import { shuffle } from '../shared/util'

// Khung cờ trong khung cảnh: rộng 240 x cao 180 (4:3, giống file cờ 640 x 480).
export const FW = 240
export const FH = 180

/** Số cột x số hàng mảnh cắt và số mảnh nhiễu theo mức chơi. */
const GRID: Record<Level, { cols: number; rows: number; extra: number }> = {
  easy: { cols: 2, rows: 1, extra: 1 },
  medium: { cols: 2, rows: 2, extra: 2 },
  hard: { cols: 3, rows: 2, extra: 2 },
}

/** Dễ: 20 nước quen thuộc; Vừa: 50 nước; Khó: cả 100 nước. */
const POOL: Record<Level, Country[]> = {
  easy: COUNTRIES.filter((c) => GROUP_A.includes(c.code)),
  medium: COUNTRIES.filter((c) => GROUP_B.includes(c.code)),
  hard: COUNTRIES,
}

/** Một mảnh: ô (col, row) của cờ `code`. */
export type Piece = { code: string; col: number; row: number }

export type BuildRound = { target: Country; cols: number; rows: number; pieces: Piece[] }

/** Chọn một lá cờ, cắt mảnh, trộn thêm mảnh nhiễu của cờ khác. */
export function makeBuildRound(level: Level, previous?: string): BuildRound {
  const { cols, rows, extra } = GRID[level]
  const pool = POOL[level]
  const target = shuffle(pool.filter((c) => c.code !== previous))[0]
  const own: Piece[] = []
  for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) own.push({ code: target.code, col, row })
  const others = shuffle(pool.filter((c) => c.code !== target.code)).slice(0, extra)
  const decoys = others.map((c) => ({
    code: c.code,
    col: Math.floor(Math.random() * cols),
    row: Math.floor(Math.random() * rows),
  }))
  return { target, cols, rows, pieces: shuffle([...own, ...decoys]) }
}

/** Mức Khó không có cờ mẫu. */
export const showModel = (level: Level) => level !== 'hard'

// So sánh hình hai mảnh: mảnh trông giống hệt (ví dụ hai mảnh đỏ trơn của cờ Madagascar, hoặc mảnh
// trắng của hai cờ khác nhau) thì đặt vào ô nào cũng tính là đúng.

const IMG_W = 192
const IMG_H = 144
const pixelCache = new Map<string, Promise<Uint8ClampedArray | null>>()

/** Điểm ảnh của cả lá cờ, vẽ ở cỡ 192 x 144. */
function flagPixels(code: string): Promise<Uint8ClampedArray | null> {
  let p = pixelCache.get(code)
  if (!p) {
    p = new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          canvas.width = IMG_W
          canvas.height = IMG_H
          const ctx = canvas.getContext('2d')
          if (!ctx) return resolve(null)
          ctx.drawImage(img, 0, 0, IMG_W, IMG_H)
          resolve(ctx.getImageData(0, 0, IMG_W, IMG_H).data)
        } catch {
          resolve(null)
        }
      }
      img.onerror = () => resolve(null)
      img.src = flagSrc(code)
    })
    pixelCache.set(code, p)
  }
  return p
}

/** Điểm ảnh của một mảnh (bỏ viền 2px để tránh phần khử răng cưa ở mép). */
async function piecePixels(piece: Piece, cols: number, rows: number): Promise<number[] | null> {
  const data = await flagPixels(piece.code)
  if (!data) return null
  const w = IMG_W / cols
  const h = IMG_H / rows
  const out: number[] = []
  for (let y = Math.round(piece.row * h) + 2; y < Math.round((piece.row + 1) * h) - 2; y++)
    for (let x = Math.round(piece.col * w) + 2; x < Math.round((piece.col + 1) * w) - 2; x++) {
      const i = (y * IMG_W + x) * 4
      out.push(data[i], data[i + 1], data[i + 2])
    }
  return out
}

export const pieceKey = (p: Piece) => `${p.code}:${p.col},${p.row}`

/**
 * Với mỗi mảnh trong khay, liệt kê các ô của cờ đích mà mảnh đó trông giống hệt
 * (khác biệt rõ ở không quá 1% điểm ảnh).
 */
export async function lookalikeCells(round: BuildRound): Promise<Record<string, number[]>> {
  const cells: Piece[] = []
  for (let row = 0; row < round.rows; row++)
    for (let col = 0; col < round.cols; col++) cells.push({ code: round.target.code, col, row })
  const cellPx = await Promise.all(cells.map((c) => piecePixels(c, round.cols, round.rows)))
  const result: Record<string, number[]> = {}
  for (const piece of round.pieces) {
    const px = await piecePixels(piece, round.cols, round.rows)
    if (!px) continue
    result[pieceKey(piece)] = cells
      .map((_, k) => k)
      .filter((k) => {
        const other = cellPx[k]
        if (!other || other.length !== px.length) return false
        let bad = 0
        for (let i = 0; i < px.length; i += 3) {
          const d = Math.max(Math.abs(px[i] - other[i]), Math.abs(px[i + 1] - other[i + 1]), Math.abs(px[i + 2] - other[i + 2]))
          if (d > 40) bad++
        }
        return bad <= (px.length / 3) * 0.01
      })
  }
  return result
}
