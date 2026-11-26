// Các con vật trên thẻ (hình Kenney Animal Pack Redux, CC0, trong public/assets/kenney/animal-pack/).
// Lật thẻ lên thì giọng đọc tên con vật: public/audio/<vi|en>/animal-<id>.mp3.

export const ANIMALS = [
  'dog',
  'pig',
  'cow',
  'duck',
  'elephant',
  'giraffe',
  'monkey',
  'panda',
  'rabbit',
  'frog',
  'penguin',
  'zebra',
] as const

export type Animal = (typeof ANIMALS)[number]

export const animalImage = (a: Animal) => `/assets/kenney/animal-pack/${a}.png`
