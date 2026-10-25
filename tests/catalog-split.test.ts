/**
 * 게임 ↔ 수업 도구 — 2026-10-24 사용자 «수업도구는 게임 사이트 옆으로 정식 종목으로 빼자».
 * 잡는 것: 어느 쪽에도 안 서는 사이트(사라짐) · 게임 쪽에 남은 «도구뿐인» 곳 · 도구 쪽에서 빠진 꼬리표 사이트.
 */
import { describe, expect, it } from 'vitest'
import { classToolSites, gameSites, isToolOnly, rankingSites, GAME_KINDS, GAME_SUBJECTS, OCCASION_TAG, TOOL_TAG } from '../src/lib/catalog'
import { learningSites } from '../src/data/projects'

describe('게임 ↔ 수업 도구 나누기', () => {
  it('모든 사이트가 적어도 한쪽에 선다(사라지는 곳 0)', () => {
    const games = new Set(gameSites(learningSites).map((s) => s.slug))
    const tools = new Set(classToolSites(learningSites).map((s) => s.slug))
    const lost = learningSites.filter((s) => !games.has(s.slug) && !tools.has(s.slug)).map((s) => s.slug)
    expect(lost).toEqual([])
  })
  it('«수업 도구» 꼬리표 사이트는 전부 도구 쪽에', () => {
    const want = learningSites.filter((s) => s.tags.includes(TOOL_TAG) || s.tags.includes(OCCASION_TAG)).map((s) => s.slug)
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
  it('연습·만들기뿐인 수업 도구는 게임 쪽에서 빠진다(중복 제거 2026-10-24) · 학교 대항 게임은 양쪽', () => {
    const games = gameSites(learningSites).map((s) => s.slug)
    for (const slug of ['ttobagi', 'pilhan', 'seulgisem', 'araharu', 'echotale']) expect(games).not.toContain(slug)
    expect(games).toContain('mathstep') // 2026-10-25 «메쓰스탭은 양쪽에 같이»
    expect(classToolSites(learningSites).map((s) => s.slug)).toContain('mathstep') // 2026-10-24 «매쓰스텝도 수업도구에도»
    for (const slug of ['manjijak', 'tajawangguk']) expect(games).toContain(slug)
    expect(isToolOnly({ tags: ['국어', '공부·연습', TOOL_TAG] })).toBe(true)
    expect(isToolOnly({ tags: ['정보', '만들기', TOOL_TAG] })).toBe(true)
    expect(isToolOnly({ tags: ['국어', '공부·연습'] })).toBe(false) // 수업 도구 꼬리표 없는 연습 사이트는 게임 쪽 그대로
  })
  it('인기 순위는 통합 — 게임 칸에서 빠진 도구(또박이·뽑기ON·독도)도 순위엔 선다', () => {
    const r = rankingSites(learningSites).map((s) => s.slug)
    for (const slug of ['ttobagi', 'iwpick', 'dokdo-log', 'manjijak']) expect(r).toContain(slug)
    expect(r.length).toBe(learningSites.length)
  })
  it('홈 종류 칩에 «수업 도구»가 없다 · 과목 칩에 «계기교육»이 없다', () => {
    expect(GAME_KINDS).not.toContain(TOOL_TAG)
    expect(GAME_SUBJECTS).not.toContain(OCCASION_TAG)
  })
  it('계기교육(독도 탐사 일지)은 게임 쪽에서 빠지고 수업 도구 쪽에만', () => {
    expect(gameSites(learningSites).map((s) => s.slug)).not.toContain('dokdo-log')
    expect(classToolSites(learningSites).map((s) => s.slug)).toContain('dokdo-log')
  })
  it('타자 연습(타이핑버스·타자왕국)은 양쪽에', () => {
    for (const slug of ['typingverse', 'tajawangguk']) {
      expect(gameSites(learningSites).map((s) => s.slug)).toContain(slug)
      expect(classToolSites(learningSites).map((s) => s.slug)).toContain(slug)
    }
  })
})
