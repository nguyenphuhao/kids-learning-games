// Vẽ một mảnh cờ: phần (col, row) của hình cờ thật, co giãn vào khung (x, y, w, h).

import { flagSrc } from '../flag-drive/countries'
import type { Piece } from './puzzle'

// File cờ flag-icons có kích thước 640 x 480.
const IW = 640
const IH = 480

type Props = { piece: Piece; cols: number; rows: number; x: number; y: number; w: number; h: number }

export function FlagPiece({ piece, cols, rows, x, y, w, h }: Props) {
  const pw = IW / cols
  const ph = IH / rows
  return (
    <svg
      x={x}
      y={y}
      width={w}
      height={h}
      viewBox={`${piece.col * pw} ${piece.row * ph} ${pw} ${ph}`}
      preserveAspectRatio="none"
      pointerEvents="none"
    >
      <image href={flagSrc(piece.code)} width={IW} height={IH} preserveAspectRatio="none" pointerEvents="none" />
    </svg>
  )
}

/** Cả lá cờ (dùng cho cờ mẫu). */
export function WholeFlag({ code, x, y, w, h }: { code: string; x: number; y: number; w: number; h: number }) {
  return <image href={flagSrc(code)} x={x} y={y} width={w} height={h} preserveAspectRatio="none" />
}
