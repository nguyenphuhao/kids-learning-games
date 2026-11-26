// Tiếng hiệu ứng tổng hợp bằng Web Audio (không cần file): tiếng động cơ xe, tiếng chạm bạn thú,
// chạm cây cối, còi xe, chuông vui. Dùng chung AudioContext với câu thoại (audio.ts).

import { sfxOutput } from './audio'

function tone(type: OscillatorType, from: number, to: number, start: number, dur: number, peak: number) {
  const o = sfxOutput()
  if (!o || o.ctx.state !== 'running') return
  const { ctx, out } = o
  const t = ctx.currentTime + start
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(from, t)
  osc.frequency.exponentialRampToValueAtTime(to, t + dur)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(peak, t + 0.015)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(g).connect(out)
  osc.start(t)
  osc.stop(t + dur + 0.02)
}

/** Chạm bạn thú: tiếng "boing" nảy lên. */
export function sfxBoing() {
  tone('sine', 220, 660, 0, 0.18, 0.35)
  tone('sine', 660, 440, 0.16, 0.14, 0.2)
}

/** Chạm cây, bụi, hoa, nấm, mây: tiếng "bụp" nhỏ. */
export function sfxPop() {
  tone('sine', 520, 180, 0, 0.1, 0.3)
}

/** Chạm xe: hai tiếng còi "bíp bíp". */
export function sfxHorn() {
  tone('square', 440, 430, 0, 0.12, 0.12)
  tone('square', 440, 430, 0.18, 0.14, 0.12)
}

/** Nhận chữ, cứu được bạn, qua cổng: chuông vui ba nốt. */
export function sfxChime() {
  ;[784, 988, 1319].forEach((f, i) => tone('triangle', f, f, i * 0.09, 0.35, 0.18))
}

/**
 * Tiếng động cơ xe: hai dao động trầm qua bộ lọc thấp, nhịp "phành phạch" nhẹ.
 * setSpeed(0…1): 0 là xe đứng (tắt dần), càng nhanh tiếng càng cao và to.
 */
export class Engine {
  private nodes: { ctx: AudioContext; gain: GainNode; oscs: OscillatorNode[]; lfo: OscillatorNode } | null = null
  private speed = 0

  private ensure() {
    if (this.nodes) return this.nodes
    const o = sfxOutput()
    if (!o || o.ctx.state !== 'running') return null
    const { ctx, out } = o
    const gain = ctx.createGain()
    gain.gain.value = 0
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 420
    const oscs = [
      Object.assign(ctx.createOscillator(), { type: 'sawtooth' as OscillatorType }),
      Object.assign(ctx.createOscillator(), { type: 'square' as OscillatorType }),
    ]
    oscs[0].frequency.value = 45
    oscs[1].frequency.value = 90
    // Nhịp nổ của máy: dao động chậm làm âm lượng lên xuống.
    const lfo = ctx.createOscillator()
    lfo.frequency.value = 14
    const lfoDepth = ctx.createGain()
    lfoDepth.gain.value = 0.35
    const am = ctx.createGain()
    am.gain.value = 0.65
    lfo.connect(lfoDepth).connect(am.gain)
    oscs.forEach((osc) => osc.connect(filter))
    filter.connect(am).connect(gain).connect(out)
    oscs.forEach((osc) => osc.start())
    lfo.start()
    this.nodes = { ctx, gain, oscs, lfo }
    return this.nodes
  }

  setSpeed(speed: number) {
    if (Math.abs(speed - this.speed) < 0.05 && !(speed === 0 && this.speed !== 0)) return
    this.speed = speed
    const n = this.ensure()
    if (!n) return
    const t = n.ctx.currentTime
    n.gain.gain.setTargetAtTime(speed > 0 ? 0.05 + 0.1 * speed : 0, t, speed > 0 ? 0.08 : 0.25)
    n.oscs[0].frequency.setTargetAtTime(45 + 40 * speed, t, 0.15)
    n.oscs[1].frequency.setTargetAtTime(90 + 80 * speed, t, 0.15)
    n.lfo.frequency.setTargetAtTime(12 + 14 * speed, t, 0.15)
  }

  stop() {
    if (!this.nodes) return
    const { ctx, gain, oscs, lfo } = this.nodes
    gain.gain.setTargetAtTime(0, ctx.currentTime, 0.05)
    const end = ctx.currentTime + 0.3
    oscs.forEach((o) => o.stop(end))
    lfo.stop(end)
    this.nodes = null
    this.speed = 0
  }
}
