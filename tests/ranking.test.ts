/**
 * 홈 맨 위 인기 순위·아래 새로 올린 순서 — 2026-10-23 사용자 «인기 순서대로 1등부터 마지막 순위까지 · 아래는 새로 올린 순서대로».
 */
import { describe, expect, it } from 'vitest'
import { newestFirst, rankByClicks, rankSongs, songsNewestFirst, sumWindow, window48 } from '../src/lib/ranking'
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

describe('최근 48시간', () => {
  // 2026-10-23 06:00 KST = 2026-10-22T21:00Z
  const now = Date.parse('2026-10-22T21:00:00Z')
  it('오늘·어제 전부, 그제는 창에 걸친 18시간 몫', () => {
    expect(window48(now)).toEqual([
      { day: '20261023', weight: 1 },
      { day: '20261022', weight: 1 },
      { day: '20261021', weight: 0.75 },
    ])
  })
  it('창 밖 날짜(사흘 전·누적)는 안 센다', () => {
    const c = sumWindow(
      [
        { date: '20261023', slug: 'a', count: 2 },
        { date: '20261022', slug: 'a', count: 3 },
        { date: '20261021', slug: 'a', count: 4 },
        { date: '20261020', slug: 'a', count: 100 },
        { date: '20261020', slug: 'b', count: 100 },
      ],
      window48(now)
    )
    expect(c).toEqual({ a: 8 })
  })
})

describe('음악감상실', () => {
  it('올린 때 사본이 있고 곡마다 날짜가 있다', async () => {
    const fs = await import('node:fs')
    const ad = JSON.parse(fs.readFileSync('public/music/added.json', 'utf8')) as Record<string, string>
    expect(Object.keys(ad).length).toBeGreaterThan(150)
    for (const [id, t] of Object.entries(ad)) expect(t, id).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
  })
  it('가사 사본이 있고 노래마다 부르는 줄이 있다', async () => {
    const fs = await import('node:fs')
    const ly = JSON.parse(fs.readFileSync('public/music/lyrics.json', 'utf8')) as Record<string, string>
    expect(Object.keys(ly).length).toBeGreaterThan(150)
    for (const [id, t] of Object.entries(ly)) expect(t.split('\n').filter((l) => l.trim() && !/^\s*\[.*\]\s*$/.test(l)).length, id).toBeGreaterThanOrEqual(2)
  })
})

describe('서재 묶기', () => {
  const w = (slug: string, kind: 'comic' | 'novel' | 'book', series: string | null, tags?: string[]) => ({
    slug, kind, series, tags, title: slug, subtitle: '', cover: null, url: '', units: 1, publishedAt: 0,
  })
  it('대상 태그를 읽고, 없으면 만화=초등·그 밖=어른', async () => {
    const { audienceOf } = await import('../src/components/library/Bookshelf')
    expect(audienceOf(w('a', 'novel', null, ['대상:중학생 이상']))).toBe('중학생 이상')
    expect(audienceOf(w('b', 'comic', null))).toBe('초등')
    expect(audienceOf(w('c', 'book', null))).toBe('어른')
  })
  it('시리즈별로 묶고 시리즈 안은 권 순서', async () => {
    const { groupBySeries } = await import('../src/components/library/Bookshelf')
    const g = groupBySeries([w('m-06', 'comic', '수학'), w('s-01', 'comic', '사회'), w('m-01', 'comic', '수학'), w('x', 'comic', null)])
    expect(g.map((x) => x.title)).toEqual(['수학', '사회', '학습만화'])
    expect(g[0].works.map((x) => x.slug)).toEqual(['m-01', 'm-06'])
  })
})

describe('음악감상실 순위', () => {
  const songs = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }]
  const added = { a: '2026-09-01T00:00', b: '2026-10-11T00:00', c: '2026-10-10T00:00' }
  it('48시간 재생 많은 순 · 같으면 누적 · 그래도 같으면 새 곡 · 0회는 빠진다', () => {
    const r = rankSongs(songs, { a: 5, c: 2, b: 2 }, { a: 9, b: 3, c: 7 }, added)
    expect(r.map((s) => s.id)).toEqual(['a', 'c', 'b'])
    expect(r.map((s) => s.rank)).toEqual([1, 2, 3])
    expect(rankSongs(songs, {}, { d: 1, b: 1 }, added).map((s) => s.id)).toEqual(['b', 'd'])
    expect(rankSongs(songs, {}, {}, added)).toEqual([])
  })
  it('아래 목록은 올린 순서 — 최근이 앞, 모르는 곡은 맨 뒤', () => {
    expect(songsNewestFirst(songs, added).map((s) => s.id)).toEqual(['b', 'c', 'a', 'd'])
  })
})
