// 2026-10-23 사용자 «서재로 하니까 아이들이 안 들어오는 듯 — 학습만화로 하자» — 아이들 눈에 보이는 이름은 «학습만화»(주소 /library 는 그대로).
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'

const src = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')

describe('학습만화 탭 이름', () => {
  it('위 메뉴 탭이 «학습만화»', () => {
    expect(src('src/data/siteConfig.ts')).toMatch(/label: '학습만화', href: '\/library'/)
  })
  it('화면에 «서재»라는 이름이 안 보인다', () => {
    for (const f of ['src/data/siteConfig.ts', 'src/app/library/page.tsx', 'src/components/home/HomeShelves.tsx', 'src/components/library/Bookshelf.tsx']) {
      const visible = src(f).split('\n').filter((l) => !/^\s*(\/\/|\/\*|\*)/.test(l) && !/\/\/.*서재/.test(l))
      expect(visible.filter((l) => l.includes('서재')), f).toEqual([])
    }
  })
})
