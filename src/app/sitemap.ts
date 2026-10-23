import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  return ['', 'library/', 'music/', 'portfolio/', 'blog/', 'about/', 'contact/'].map((p) => ({
    url: `https://ssamzip.com/${p}`,
    changeFrequency: 'weekly',
    priority: p === '' ? 1 : 0.7,
  }))
}
