// 2026-10-23 사용자 «모바일에서 메뉴 열었는데 뒤가 비치니 안 보임 · 분류탭에 계기교육도 넣을까? 독도교육 같은»
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { SITE_SUBJECTS, learningSites } from '../src/data/projects'

const src = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')

describe('모바일 메뉴', () => {
  const h = src('src/components/layout/Header.tsx')
  const menu = h.slice(h.indexOf('Mobile Navigation'))
  it('펼친 메뉴는 반투명 glass 가 아니라 불투명 배경', () => {
    const cls = menu.match(/<div className="md:hidden[^"]*"/)?.[0] ?? ''
    expect(cls).not.toMatch(/\bglass\b/)
    expect(cls).toMatch(/\bbg-card\b/)
  })
  it('메뉴가 열리면 머리줄도 불투명', () => {
    expect(h).toMatch(/isMenuOpen\s*\?\s*'bg-card/)
  })
})

describe('계기교육 분류', () => {
  it('과목 줄에 «계기교육» 칩', () => {
    expect(SITE_SUBJECTS as readonly string[]).toContain('계기교육')
  })
  it('독도 탐사 일지가 계기교육에 든다', () => {
    const d = learningSites.find((s) => s.name === '독도 탐사 일지')
    expect(d?.tags).toContain('계기교육')
  })
})
