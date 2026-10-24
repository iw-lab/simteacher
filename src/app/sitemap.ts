import type { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/blog'

export const dynamic = 'force-static'

// 블로그 글도 넣는다 — 빠지면 검색 엔진이 링크를 따라 올 때까지 글을 모른다(2026-10-24)
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ['', 'library/', 'music/', 'portfolio/', 'blog/', 'about/', 'contact/'].map((p) => ({
    url: `https://ssamzip.com/${p}`,
    changeFrequency: 'weekly' as const,
    priority: p === '' ? 1 : 0.7,
  }))
  const posts = getAllPosts().map((p) => ({
    url: `https://ssamzip.com/blog/${p.slug}/`,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }))
  return [...pages, ...posts]
}
