/**
 * 수업 보조 도구 판 — 새로 올린 도구가 맨 위. 2026-11-10 사용자 «신규 도구가 왜 맨 밑으로 가니 맨위로 와야지».
 * 잡는 것: 조회수 순(갓 올린 도구 = 0 → 맨 밑)으로 되돌아가는 것.
 */
import { describe, expect, it } from 'vitest'
import { toolBoardOrder } from '../src/lib/catalog'
import { learningSites } from '../src/data/projects'

describe('수업 보조 도구 순서', () => {
  const { sites, occasions } = toolBoardOrder(learningSites)
  it('도구가 있다(검사 0 금지)', () => { expect(sites.length).toBeGreaterThan(3) })
  it('새로 올린 순서 — 앞 도구가 뒤 도구보다 늦게(같게) 올라왔다', () => {
    for (const l of [sites, occasions]) for (let i = 1; i < l.length; i++) expect(l[i - 1].added >= l[i].added, `${l[i - 1].slug} ↔ ${l[i].slug}`).toBe(true)
  })
  it('가장 최근 도구가 맨 위', () => {
    const newest = [...sites].sort((a, b) => b.added.localeCompare(a.added))[0]
    expect(sites[0].slug).toBe(newest.slug)
  })
  it('가짜 새 도구를 넣으면 맨 위로', () => {
    const fake = { ...sites[sites.length - 1], slug: 'zz-new-tool', added: '2099-01-01T00:00' }
    expect(toolBoardOrder([...learningSites, fake as never]).sites[0].slug).toBe('zz-new-tool')
  })
})
