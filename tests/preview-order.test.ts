import { describe, it, expect } from 'vitest'
import { PREVIEW_GROUPS, previewSites } from '../src/data/preview'

// 2026-11-26 사용자 «출시전도 최근걸 맨 위로 올라가게 배치» — 갈래마다 올린 때가 늦은 것이 앞.
describe('출시 전 칸 — 최근 것이 맨 위', () => {
  it('갈래마다 added 내림차순', () => {
    for (const g of PREVIEW_GROUPS) {
      const a = previewSites.filter((s) => s.kind === g.kind).map((s) => s.added)
      expect(a).toEqual([...a].sort((x, y) => y.localeCompare(x)))
    }
  })
  it('가장 늦게 올린 숨은그림찾기가 놀며 배우기 첫 칸', () => {
    expect(previewSites.filter((s) => s.kind === 'play')[0].slug).toBe('hidden-picture-find')
  })
  it('가장 늦게 올린 영어 말하기 스텝이 배우고 만들기 첫 칸', () => {
    expect(previewSites.filter((s) => s.kind === 'learn')[0].slug).toBe('englishstep')
  })
  it('올린 때는 모두 날짜·시각 꼴', () => {
    for (const s of previewSites) expect(s.added).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
  })
})
