/**
 * 홈 맨 위 인기 순위·아래 새로 올린 순서 — 2026-10-23 사용자 «인기 순서대로 1등부터 마지막 순위까지 · 아래는 새로 올린 순서대로».
 */
import { describe, expect, it } from 'vitest'
import { newestFirst, rankByClicks } from '../src/lib/ranking'
import { learningSites, teacherTools } from '../src/data/projects'

describe('인기 순위', () => {
  it('클릭 많은 순서 · 한 번도 안 눌린 곳도 맨 뒤까지 빠짐없이', () => {
    const all = [...learningSites, ...teacherTools]
    const r = rankByClicks(all, { hobakbul: 3, vocaworm: 40, gugu: 12 })
    expect(r.length).toBe(all.length)
    expect(r.slice(0, 3).map((s) => s.slug)).toEqual(['vocaworm', 'gugu', 'hobakbul'])
    expect(r.map((s) => s.rank)).toEqual(all.map((_, i) => i + 1))
    for (let i = 1; i < r.length; i++) expect(r[i - 1].count).toBeGreaterThanOrEqual(r[i].count)
  })
  it('같은 수끼리는 새로 올린 곳이 앞', () => {
    const r = rankByClicks(
      [{ slug: 'a', added: '2026-07-01T00:00' }, { slug: 'b', added: '2026-10-01T00:00' }],
      {}
    )
    expect(r.map((s) => s.slug)).toEqual(['b', 'a'])
  })
})

describe('새로 올린 순서', () => {
  it('학습 사이트마다 올린 때가 있다', () => {
    for (const s of learningSites) expect(s.added, s.slug).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
  })
  it('가장 최근이 맨 앞', () => {
    const n = newestFirst(learningSites)
    for (let i = 1; i < n.length; i++) expect(n[i - 1].added >= n[i].added).toBe(true)
    expect(n[0].slug).toBe('gugu-2d')
    expect(n.at(-1)!.added.startsWith('2026-07-22')).toBe(true)
  })
})
