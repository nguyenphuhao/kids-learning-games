import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const root = createRoot(document.getElementById('root')!)
const preview = import.meta.env.DEV ? /^#art=(\w+)/.exec(location.hash) : null

if (import.meta.env.DEV && preview) {
  // Bản dev: /#art=<storyId> mở trang xem trước hình vẽ của truyện.
  import('./stories/ArtPreview').then(({ ArtPreview }) => root.render(<ArtPreview id={preview[1]} />))
} else {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
