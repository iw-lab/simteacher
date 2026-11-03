// 지금 열린 온라인 방 — 2026-10-23 «학생들이 온라인방 찾으러 각 게임에 가지 않고 그곳에서 누르면 바로 입장».
// 첫 화면에 한 번만 그리고, 게시판이 엉뚱한 주소를 줘도 따라가지 않으며, 폴링은 서버비 원칙(≥15초)을 지킨다.
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'

import { safeRooms, ROOMS_POLL_MS, roomStatus } from '../src/lib/live-rooms'

const LISTED = (g: string) => (g === 'racket-rush' ? 'https://racket-rush.vercel.app' : undefined)
const read = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')
const room = (o: object) => ({ g: 'racket-rush', title: '래킷 러시', code: 'AB12', n: 1, max: 2, since: 0, url: 'https://racket-rush.vercel.app/?room=AB12', ...o })

describe('지금 열린 온라인 방', () => {
  it('첫 화면에 한 번 그린다(인기 순위 옆·밑)', () => {
    const page = read('src/app/page.tsx')
    expect(page.match(/<LiveRooms\b/g)?.length).toBe(1)
    expect(page.indexOf('<PopularStrip')).toBeLessThan(page.indexOf('<LiveRooms'))
  })
  it('등재 주소와 다른 호스트·https 아닌 주소는 버린다', () => {
    const ok = safeRooms({ rooms: [room({}), room({ url: 'https://evil.example/?room=AB12' }), room({ url: 'javascript:alert(1)' }), room({ url: 'http://racket-rush.vercel.app/?room=1' })] }, LISTED)
    expect(ok.map((r) => r.url)).toEqual(['https://racket-rush.vercel.app/?room=AB12'])
    expect(safeRooms(null, LISTED)).toEqual([])
    // 등재 안 된 게임(감염 술래잡기 등)은 https 만 확인
    expect(safeRooms({ rooms: [room({ g: 'sullae', url: 'https://sullae.pages.dev/?room=X1' })] }, LISTED)).toHaveLength(1)
  })
  it('목록 폴링은 15초 이상 · 화면이 숨으면 안 읽는다', () => {
    expect(ROOMS_POLL_MS).toBeGreaterThanOrEqual(15_000)
    expect(read('src/components/community/LiveRooms.tsx')).toMatch(/if \(document\.hidden\) return/)
  })
  // 2026-11-03 «중간에 들어올 수 있는 멀티 게임도 시작하고 중간에 들어올 수 있게 방 표시되니?»
  it('진행 중 방(st:play)은 «게임 중 · 중간 입장», 기다리는 방은 «N분째 기다림»', () => {
    expect(roomStatus(room({ st: 'play', since: 0 }), 10 * 60_000)).toBe('게임 중 · 중간 입장')
    expect(roomStatus(room({ st: 'wait', since: 0 }), 3 * 60_000)).toBe('3분째 기다림')
    expect(roomStatus(room({ since: 0 }), 10_000)).toBe('방금 열림')
    expect(read('src/components/community/LiveRooms.tsx')).toMatch(/roomStatus\(r, now\)/)
  })
})
