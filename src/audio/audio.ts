// Âm thanh tạo sẵn bằng ElevenLabs, phát từ file trong public/audio/.
//   Câu thoại: public/audio/<lang>/<key>.mp3, ví dụ public/audio/vi/flags-great.mp3
//   Nhạc nền:  public/audio/music/background.mp3 (phát lặp trong màn chơi)
// Web không gọi ElevenLabs khi bé chơi.

import type { Lang } from '../i18n/strings'
import { loadValue, saveValue } from '../lib/storage'

const MUSIC_VOLUME = 0.25
const MUSIC_DUCKED = 0.08 // nhạc nhỏ lại khi đang có lời nói

let voice: HTMLAudioElement | null = null
let music: HTMLAudioElement | null = null
let musicOn = loadValue<boolean>('music-on', true)

function setMusicVolume(v: number) {
  if (music) music.volume = v
}

export function playLine(lang: Lang, key: string): void {
  voice?.pause()
  const audio = new Audio(`/audio/${lang}/${key}.mp3`)
  voice = audio
  setMusicVolume(MUSIC_DUCKED)
  const restore = () => {
    if (voice === audio) setMusicVolume(MUSIC_VOLUME)
  }
  audio.addEventListener('ended', restore)
  audio.addEventListener('error', restore)
  // Chưa có file hoặc trình duyệt chặn tự phát: bỏ qua, không làm hỏng game.
  audio.play().catch(restore)
}

export function stopAudio(): void {
  voice?.pause()
  voice = null
  stopMusic()
}

export function startMusic(): void {
  if (!musicOn) return
  if (!music) {
    music = new Audio('/audio/music/background.mp3')
    music.loop = true
  }
  music.volume = voice && !voice.paused ? MUSIC_DUCKED : MUSIC_VOLUME
  music.play().catch(() => {})
}

export function stopMusic(): void {
  music?.pause()
}

export function isMusicOn(): boolean {
  return musicOn
}

export function setMusicOn(on: boolean): void {
  musicOn = on
  saveValue('music-on', on)
  if (on) startMusic()
  else stopMusic()
}
