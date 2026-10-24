/**
 * 게임 ↔ 수업 도구 — 2026-10-24 사용자 «수업도구는 게임 사이트 옆으로 정식 종목으로 빼자».
 * 잡는 것: 어느 쪽에도 안 서는 사이트(사라짐) · 게임 쪽에 남은 «도구뿐인» 곳 · 도구 쪽에서 빠진 꼬리표 사이트.
 */
import { describe, expect, it } from 'vitest'
import { classToolSites, gameSites, isToolOnly, GAME_KINDS, TOOL_TAG } from '../src/lib/catalog'
import { learningSites } from '../src/data/projects'

describe('게임 ↔ 수업 도구 나누기', () => {
  it('모든 사이트가 적어도 한쪽에 선다(사라지는 곳 0)', () => {
    const games = new Set(gameSites(learningSites).map((s) => s.slug))
    const tools = new Set(classToolSites(learningSites).map((s) => s.slug))
    const lost = learningSites.filter((s) => !games.has(s.slug) && !tools.has(s.slug)).map((s) => s.slug)
    expect(lost).toEqual([])
  })
  it('«수업 도구» 꼬리표 사이트는 전부 도구 쪽에', () => {
    const want = learningSites.filter((s) => s.tags.includes(TOOL_TAG)).map((s) => s.slug)
    expect(classToolSites(learningSites).map((s) => s.slug)).toEqual(want)
    expect(want.length).toBeGreaterThan(0)
  })
  it('도구뿐인 곳(뽑기ON)은 게임 쪽에 없고, 게임이기도 한 곳(만지작 수학실)은 양쪽에', () => {
    const games = gameSites(learningSites).map((s) => s.slug)
    expect(games).not.toContain('iwpick')
    expect(games).toContain('manjijak')
    expect(isToolOnly({ tags: ['수학', TOOL_TAG] })).toBe(true) // 과목만 있고 다른 «종류»가 없으면 도구뿐
    expect(isToolOnly({ tags: [TOOL_TAG, '퍼즐'] })).toBe(false)
  })
  it('홈 종류 칩에 «수업 도구»가 없다', () => {
    expect(GAME_KINDS).not.toContain(TOOL_TAG)
  })
})
