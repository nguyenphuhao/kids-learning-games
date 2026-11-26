import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
// Sau App để bố cục máy tính đè lên CSS của từng trò.
import './desktop.css'

const root = createRoot(document.getElementById('root')!)
const preview = import.meta.env.DEV ? /^#art=(\w+)/.exec(location.hash) : null

if (import.meta.env.DEV && location.hash === '#glyphs') {
  // Bản dev: /#glyphs xem trước nét viết của mọi chữ và số.
  import('./games/writing/GlyphPreview').then(({ GlyphPreview }) => root.render(<GlyphPreview />))
} else if (import.meta.env.DEV && preview) {
  // Bản dev: /#art=<storyId> mở trang xem trước hình vẽ của truyện.
  import('./stories/ArtPreview').then(({ ArtPreview }) => root.render(<ArtPreview id={preview[1]} />))
} else {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
