// Âm thanh tạo sẵn bằng ElevenLabs, phát từ file trong public/audio/.
//   Câu thoại: public/audio/<lang>/<key>.mp3, ví dụ public/audio/vi/flags-great.mp3
//   Nhạc nền:  public/audio/music/background.mp3 (phát lặp trong màn chơi)
// Web không gọi ElevenLabs khi bé chơi.
//
// Phát bằng Web Audio API vì:
// - Âm lượng chỉnh được trên mọi máy (Safari iOS bỏ qua audio.volume của thẻ <audio>).
// - Sau lần chạm đầu tiên, âm thanh phát được cả khi gọi sau một khoảng chờ (setTimeout).
// - Câu thoại được tải và giải mã trước, giữ trong bộ nhớ, nên phát ngay không trễ.
// Trình duyệt không có Web Audio thì quay về thẻ <audio>.

import type { Lang } from '../i18n/strings'
import { loadValue, saveValue } from '../lib/storage'
import { AUDIO_KEYS } from './manifest'

const MUSIC_GAIN = 0.5 // file nhạc đã được giảm sẵn 12 dB
const MUSIC_DUCKED = 0.15 // nhạc nhỏ lại khi đang có lời nói
const VOICE_GAIN = 1

type Ctx = {
  ctx: AudioContext
  musicGain: GainNode
  voiceGain: GainNode
}

let audio: Ctx | null = null
const buffers = new Map<string, Promise<AudioBuffer | null>>()
let voiceSource: AudioBufferSourceNode | null = null
let voiceRequest = 0
let musicSource: AudioBufferSourceNode | null = null
let musicWanted = false
let musicOn = loadValue<boolean>('music-on', true)

function getAudio(): Ctx | null {
  if (audio) return audio
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AC) return null
  // Safari 17+: phát cả khi iPhone đang gạt sang chế độ im lặng, như thẻ <audio>.
  const nav = navigator as Navigator & { audioSession?: { type: string } }
  if (nav.audioSession) nav.audioSession.type = 'playback'
  const ctx = new AC()
  const musicGain = ctx.createGain()
  const voiceGain = ctx.createGain()
  musicGain.gain.value = MUSIC_GAIN
  voiceGain.gain.value = VOICE_GAIN
  musicGain.connect(ctx.destination)
  voiceGain.connect(ctx.destination)
  audio = { ctx, musicGain, voiceGain }
  return audio
}

/** Mở khoá âm thanh. Gọi trong sự kiện chạm/bấm (trình duyệt chỉ cho phép lúc đó). */
export function unlockAudio(): void {
  const a = getAudio()
  if (a && a.ctx.state !== 'running') a.ctx.resume().catch(() => {})
}

// Mỗi lần chạm đều thử mở khoá (iOS có thể tạm dừng âm thanh khi chuyển ứng dụng).
if (typeof document !== 'undefined') {
  document.addEventListener('pointerdown', unlockAudio, { capture: true })
  document.addEventListener('keydown', unlockAudio, { capture: true })
}

function load(url: string): Promise<AudioBuffer | null> {
  let p = buffers.get(url)
  if (!p) {
    const a = getAudio()
    p = !a
      ? Promise.resolve(null)
      : fetch(url)
          .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status)))))
          .then((data) => a.ctx.decodeAudioData(data))
          .catch(() => {
            buffers.delete(url) // lần sau thử tải lại
            return null
          })
    buffers.set(url, p)
  }
  return p
}

const lineUrl = (lang: Lang, key: string) => `/audio/${lang}/${key}.mp3`
const MUSIC_URL = '/audio/music/background.mp3'

/** Tải trước toàn bộ câu thoại của một ngôn ngữ (và nhạc nền), lần lượt từng nhóm nhỏ. */
export async function preloadAudio(lang: Lang): Promise<void> {
  if (!getAudio()) return
  const urls = [MUSIC_URL, ...AUDIO_KEYS.map((k) => lineUrl(lang, k))]
  for (let i = 0; i < urls.length; i += 6) {
    await Promise.all(urls.slice(i, i + 6).map(load))
  }
}

function duck(on: boolean) {
  if (!audio) return
  const g = audio.musicGain.gain
  g.cancelScheduledValues(audio.ctx.currentTime)
  g.setTargetAtTime(on ? MUSIC_DUCKED : MUSIC_GAIN, audio.ctx.currentTime, 0.08)
}

// --- Phương án dự phòng: thẻ <audio> ---
let fallbackVoice: HTMLAudioElement | null = null
let fallbackMusic: HTMLAudioElement | null = null

/** Phát một câu thoại. `onEnd` được gọi khi câu đọc xong (không gọi nếu bị câu khác chen ngang). */
export function playLine(lang: Lang, key: string, onEnd?: () => void): void {
  const a = getAudio()
  if (!a) {
    fallbackVoice?.pause()
    const el = new Audio(lineUrl(lang, key))
    fallbackVoice = el
    if (onEnd) {
      el.addEventListener('ended', () => fallbackVoice === el && onEnd())
      el.addEventListener('error', () => fallbackVoice === el && onEnd())
    }
    el.play().catch(() => onEnd && window.setTimeout(onEnd, 1500))
    return
  }
  const request = ++voiceRequest
  voiceSource?.stop()
  voiceSource = null
  load(lineUrl(lang, key)).then((buffer) => {
    // Bỏ qua nếu đã có câu khác được yêu cầu sau câu này.
    if (request !== voiceRequest) return
    // File lỗi: vẫn báo "đọc xong" để trò chơi/truyện không bị kẹt.
    if (!buffer) {
      if (onEnd) window.setTimeout(onEnd, 1500)
      return
    }
    if (a.ctx.state !== 'running') a.ctx.resume().catch(() => {})
    const src = a.ctx.createBufferSource()
    src.buffer = buffer
    src.connect(a.voiceGain)
    src.onended = () => {
      if (voiceSource === src) {
        voiceSource = null
        duck(false)
        onEnd?.()
      }
    }
    voiceSource = src
    duck(true)
    src.start()
  })
}

function stopVoice() {
  voiceRequest++
  voiceSource?.stop()
  voiceSource = null
  fallbackVoice?.pause()
  duck(false)
}

export function startMusic(): void {
  musicWanted = true
  if (!musicOn) return
  const a = getAudio()
  if (!a) {
    fallbackMusic ??= Object.assign(new Audio(MUSIC_URL), { loop: true, volume: 0.5 })
    fallbackMusic.play().catch(() => {})
    return
  }
  if (musicSource) return
  load(MUSIC_URL).then((buffer) => {
    if (!buffer || !musicWanted || !musicOn || musicSource) return
    const src = a.ctx.createBufferSource()
    src.buffer = buffer
    src.loop = true
    src.connect(a.musicGain)
    src.start()
    musicSource = src
  })
}

export function stopMusic(): void {
  musicWanted = false
  musicSource?.stop()
  musicSource = null
  fallbackMusic?.pause()
}

export function stopAudio(): void {
  stopVoice()
  stopMusic()
}

export function isMusicOn(): boolean {
  return musicOn
}

export function setMusicOn(on: boolean): void {
  musicOn = on
  saveValue('music-on', on)
  if (on) startMusic()
  else {
    const wanted = musicWanted
    stopMusic()
    musicWanted = wanted
  }
}
