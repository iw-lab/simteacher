// 🔴 방 게시판에 등록된 온라인 게임은 선행쌤 목록에도 있어야 한다 — 없으면 방을 열어도 선행쌤에 안 뜬다(live-rooms 필터).
//    2026-11-04: 끝까지 진화·꿀꺽 행성·포물선 요새단이 그래서 방이 안 보였다. 게시판 등록표 사본(room-board/src/games.js)과 대조.
import { describe, expect, it } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { learningSites } from '../src/data/projects'

const BOARD = `${process.env.HOME}/Documents/dev/room-board/src/games.js`
describe('방 게시판 ↔ 선행쌤 목록', () => {
  it.runIf(existsSync(BOARD))('게시판 게임은 전부 같은 주소로 등재돼 있다', () => {
    const src = readFileSync(BOARD, 'utf8')
    const rows = [...src.matchAll(/'?([a-z-]+)'?: \{[^\n]*?join: '([^']+)'/g)].map((m) => [m[1], new URL(m[2]).host])
    expect(rows.length).toBeGreaterThan(5)
    const by = new Map(learningSites.map((s) => [s.slug, s.url && new URL(s.url).host]))
    expect(rows.filter(([g, h]) => by.get(g) !== h).map(([g]) => g)).toEqual([])
  })
})
