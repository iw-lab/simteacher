// 방문자 수(오늘·전체)는 상단 머리글에 있다 — 2026-10-23 «총 방문자와 오늘 방문자 수를 상단으로 올리자».
// 바닥글로 되돌아가거나 두 곳에 같이 그려지면(조회가 두 번 나간다) 빨갛다.
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'

const read = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')

describe('방문자 수 자리', () => {
  it('머리글에 그린다', () => {
    expect(read('src/components/layout/Header.tsx')).toMatch(/<VisitCounter\b/)
  })
  it('바닥글에는 없다(한 곳만)', () => {
    expect(read('src/components/layout/Footer.tsx')).not.toMatch(/VisitCounter/)
  })
})
