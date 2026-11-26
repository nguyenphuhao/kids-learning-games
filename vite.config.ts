import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, runnerImport, type Plugin } from 'vite'

type Meta = { title: string; description: string }
type SeoModule = {
  SITE_URL: string
  SITE_NAME: string
  OG_IMAGE: string
  allPages: () => unknown[]
  pagePath: (page: unknown) => string
  pageUrl: (page: unknown) => string
  pageMeta: (page: unknown, lang: 'vi') => Meta
}

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/**
 * Lúc build: tạo sẵn file HTML cho từng trò chơi / truyện (dist/games/<id>/index.html…)
 * với tiêu đề, mô tả, thẻ Open Graph riêng, vì Facebook, Zalo không chạy JavaScript
 * khi đọc link. Thêm sitemap.xml và robots.txt. Nội dung lấy từ src/seo/pages.ts.
 */
function seoPages(): Plugin {
  let outDir = 'dist'
  return {
    name: 'seo-pages',
    apply: 'build',
    configResolved(config) {
      outDir = config.build.outDir
    },
    async writeBundle() {
      const { module: seo } = await runnerImport<SeoModule>('/src/seo/pages.ts', { configFile: false, logLevel: 'error' })
      const template = await readFile(join(outDir, 'index.html'), 'utf8')
      const block = /<!-- seo:start -->[\s\S]*?<!-- seo:end -->/
      if (!block.test(template)) throw new Error('index.html thiếu khối <!-- seo:start --> … <!-- seo:end -->')

      const pages = seo.allPages()
      for (const page of pages) {
        const { title, description } = seo.pageMeta(page, 'vi')
        const url = seo.pageUrl(page)
        const image = seo.SITE_URL + seo.OG_IMAGE
        const tags = [
          `<title>${escape(title)}</title>`,
          `<meta name="description" content="${escape(description)}" />`,
          `<link rel="canonical" href="${url}" />`,
          `<meta property="og:type" content="website" />`,
          `<meta property="og:site_name" content="${escape(seo.SITE_NAME)}" />`,
          `<meta property="og:title" content="${escape(title)}" />`,
          `<meta property="og:description" content="${escape(description)}" />`,
          `<meta property="og:url" content="${url}" />`,
          `<meta property="og:image" content="${image}" />`,
          `<meta property="og:image:width" content="1200" />`,
          `<meta property="og:image:height" content="630" />`,
          `<meta property="og:locale" content="vi_VN" />`,
          `<meta property="og:locale:alternate" content="en_US" />`,
          `<meta name="twitter:card" content="summary_large_image" />`,
        ]
        if (page === null) {
          const ld = { '@context': 'https://schema.org', '@type': 'WebSite', name: seo.SITE_NAME, url: seo.SITE_URL, description, inLanguage: ['vi', 'en'] }
          tags.push(`<script type="application/ld+json">${JSON.stringify(ld)}</script>`)
        }
        const html = template.replace(block, tags.join('\n    '))
        const file = join(outDir, seo.pagePath(page), 'index.html')
        await mkdir(dirname(file), { recursive: true })
        await writeFile(file, html)
      }

      const urls = pages.map((p) => `  <url><loc>${seo.pageUrl(p)}</loc></url>`).join('\n')
      await writeFile(
        join(outDir, 'sitemap.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      )
      await writeFile(join(outDir, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${seo.SITE_URL}/sitemap.xml\n`)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), seoPages()],
})
