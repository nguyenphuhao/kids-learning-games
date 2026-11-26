import { useEffect, useState } from 'react'
import { useLanguage } from '../i18n/useLanguage'
import { pageUrl, type Page } from '../seo/pages'

/**
 * Nút chia sẻ cho phụ huynh. Điện thoại / máy tính bảng: mở bảng chia sẻ của máy
 * (Zalo, Messenger, Facebook…). Máy tính, hoặc máy không có bảng đó: hiện link kèm nút Chép link, Facebook.
 */
export function ShareButton({ page, name }: { page: Page; name: string }) {
  const { t } = useLanguage()
  const [menu, setMenu] = useState(false)
  const [copied, setCopied] = useState(false)
  const url = pageUrl(page)
  const text = t.share.text.replace('{name}', name)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timer)
  }, [copied])

  // Máy tính (chuột): mở bảng có Chép link. Điện thoại / máy tính bảng: bảng chia sẻ của máy.
  const share = async () => {
    const desktop = matchMedia('(hover: hover) and (pointer: fine)').matches
    if (!desktop && navigator.share) {
      try {
        await navigator.share({ title: name, text, url })
        return
      } catch (err) {
        // Người dùng tự đóng bảng chia sẻ thì thôi; lỗi khác thì hiện cách dự phòng.
        if (err instanceof DOMException && err.name === 'AbortError') return
      }
    }
    setMenu((m) => !m)
  }

  const shareMore = async () => {
    setMenu(false)
    try {
      await navigator.share({ title: name, text, url })
    } catch {
      // Đóng bảng hoặc máy không hỗ trợ: không làm gì.
    }
  }

  // Bấm ra ngoài hoặc phím Esc thì đóng bảng.
  useEffect(() => {
    if (!menu) return
    const onDown = (e: PointerEvent) => {
      if (!(e.target as Element).closest('.share')) setMenu(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenu(false)
    }
    addEventListener('pointerdown', onDown)
    addEventListener('keydown', onKey)
    return () => {
      removeEventListener('pointerdown', onDown)
      removeEventListener('keydown', onKey)
    }
  }, [menu])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setMenu(false)
    } catch {
      // Không chép được (trình duyệt chặn): hiện link để phụ huynh tự chép.
      prompt(t.share.copy, url)
    }
  }

  const facebook = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`

  return (
    <div className="share">
      <button type="button" className="share-button" onClick={share} aria-label={t.share.button} aria-expanded={menu}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" fill="none" strokeWidth="2" />
        </svg>
      </button>
      {menu && (
        <div className="share-menu" role="dialog" aria-label={t.share.button}>
          <input className="share-url" readOnly value={url} onFocus={(e) => e.currentTarget.select()} aria-label="URL" />
          <div className="share-actions">
            <button type="button" className="share-copy" onClick={copy}>
              {t.share.copy}
            </button>
            <a href={facebook} target="_blank" rel="noopener noreferrer" onClick={() => setMenu(false)}>
              {t.share.facebook}
            </a>
            {'share' in navigator && (
              <button type="button" onClick={shareMore}>
                {t.share.more}
              </button>
            )}
          </div>
        </div>
      )}
      {copied && (
        <div className="share-toast" role="status">
          {t.share.copied}
        </div>
      )}
    </div>
  )
}
