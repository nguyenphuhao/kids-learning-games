// Phát các câu thoại đã tạo sẵn bằng ElevenLabs.
// File đặt tại public/audio/<lang>/<key>.mp3, ví dụ public/audio/vi/counting-intro.mp3.
// Web không gọi ElevenLabs khi bé chơi.

import type { Lang } from '../i18n/strings'

let current: HTMLAudioElement | null = null

export function playLine(lang: Lang, key: string): void {
  current?.pause()
  const audio = new Audio(`/audio/${lang}/${key}.mp3`)
  current = audio
  // Chưa có file hoặc trình duyệt chặn tự phát: bỏ qua, không làm hỏng game.
  audio.play().catch(() => {})
}

export function stopAudio(): void {
  current?.pause()
  current = null
}
