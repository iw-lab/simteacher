import { describe, expect, it } from 'vitest'
import { findSchools, leader, mySpots, readMySchool, safeBoard, type Board, type GameBoard } from '../src/lib/school-league'
import { safeWorks, mergeWorks } from '../src/lib/art-showcase'
import { readFileSync } from 'node:fs'

const row = (c: string, n: string, s: number, r = '전북') => ({ c, n, r, s })
const game = (slug: string, week: ReturnType<typeof row>[], today = week): GameBoard => ({ slug, at: 1, week, today, st: { schools: 3, today: 1, playsToday: 1, plays: 1 } })
const B: Board = {
  at: 1,
  games: [
    game('a', [row('7000001', '김제중앙초', 90), row('7000002', '서울연은초', 80, '서울'), row('7000003', '평산초', 10, '경남')]),
    game('b', [row('7000003', '평산초', 50, '경남'), row('7000001', '김제중앙초', 50)], []),
    game('c', [row('7000002', '서울연은초', 0, '서울')]),
  ],
  medals: [{ c: '7000009', n: '메달만초', r: '부산', g: 1, sv: 0, b: 0, w: ['x'] }],
  total: { games: 3, schools: 3, today: 3, playsToday: 3 },
}

describe('학교 대항전', () => {
  it('1위와 2위 차 · 0점은 1위가 아니다 · 빈 기간은 null', () => {
    expect(leader(B.games[0], 'week')).toEqual({ top: B.games[0].week[0], gap: 10 })
    expect(leader(B.games[1], 'week')?.gap).toBe(0)
    expect(leader(B.games[1], 'today')).toBeNull()
    expect(leader(B.games[2], 'week')).toBeNull()
  })

  it('우리 학교 자리 — 순위 높은 게임이 앞 · 바로 위 학교와 점수 차', () => {
    expect(mySpots(B, '7000003')).toEqual([
      { slug: 'b', week: 1, today: null, behind: null },
      { slug: 'a', week: 3, today: 3, behind: 70 },
    ])
    expect(mySpots(B, '0000000')).toEqual([])
  })

  it('학교 찾기 — 낱말마다 이름이나 시도에 · 메달표에만 있는 학교도', () => {
    expect(findSchools(B, '중앙 전북').map((s) => s.n)).toEqual(['김제중앙초'])
    expect(findSchools(B, '서울').map((s) => s.n)).toEqual(['서울연은초'])
    expect(findSchools(B, '메달').map((s) => s.c)).toEqual(['7000009'])
    expect(findSchools(B, '  ')).toEqual([])
  })

  it('워커 대답 · 기기 저장값을 믿지 않는다', () => {
    expect(safeBoard(null)).toBeNull()
    expect(safeBoard({ games: [], medals: [], total: {} })).toBeNull()
    expect(safeBoard({ ...B, games: [{ ...B.games[0], week: [{ c: 1 }, ...B.games[0].week] }] })?.games[0].week).toHaveLength(3)
    expect(readMySchool('{"c":"7000001","n":"김제중앙초"}')).toEqual({ c: '7000001', n: '김제중앙초', r: '' })
    expect(readMySchool('{"c":"<b>","n":"x"}')).toBeNull()
    expect(readMySchool('나쁜 값')).toBeNull()
  })
})

describe('친구들의 작품', () => {
  it('id·at·likes 만 남기고 이상한 id 는 버린다 — 이름 칸이 와도 안 그린다', () => {
    expect(safeWorks({ works: [{ id: 'abcdef12', at: 5, likes: 2, nickname: '철수', title: '우리 집' }, { id: '../x' }, null] })).toEqual([{ id: 'abcdef12', at: 5, likes: 2 }])
    expect(safeWorks(null)).toBeNull()
    expect(safeWorks({ works: [] })).toEqual([])
  })
})

// 🔒 2026-11-03 «수업 보조 도구에 아트온 작품 실시간으로» — 1분마다 다시 읽어 새 작품을 앞에 · 판이 뒤섞이지 않게 · 내려간 작품은 뺀다
describe('친구들의 작품 실시간', () => {
  const w = (id: string, at: number) => ({ id, at, likes: 0 })
  it('새로 건 작품은 앞에 · 그대로인 작품은 자리 그대로 · 내린 작품은 빠진다', () => {
    const prev = [w('aaaaaa', 1), w('bbbbbb', 2), w('cccccc', 3)]
    const now = [w('aaaaaa', 1), w('cccccc', 3), w('dddddd', 9), w('eeeeee', 8)]
    expect(mergeWorks(prev, now, 8).map((x) => x.id)).toEqual(['dddddd', 'eeeeee', 'aaaaaa', 'cccccc'])
    expect(mergeWorks(prev, now, 3).length).toBe(3)
    expect(mergeWorks(null, now, 2).length).toBe(2)
  })
  it('수업 보조 도구에 걸려 있고 다시 읽기는 15초 이상 · 화면이 숨으면 안 읽는다', () => {
    expect(readFileSync('src/app/tools/page.tsx', 'utf8')).toMatch(/<ArtShowcase live \/>/)
    const src = readFileSync('src/components/home/ArtShowcase.tsx', 'utf8')
    const ms = Number((src.match(/SHOWCASE_POLL_MS = ([\d_]+)/)?.[1] || '0').replace(/_/g, ''))
    expect(ms).toBeGreaterThanOrEqual(15_000)
    expect(src).toMatch(/document\.hidden/)
  })
})

