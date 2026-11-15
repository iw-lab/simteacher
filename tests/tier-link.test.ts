// 선행쌤 → 게임 티어 코드 넘기기 — 키트 정본과 같은 규칙 · 게임 링크에만 #gbt 를 붙인다
import { describe, expect, it } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { withTier, myTierCode } from '../src/lib/tier-link'

const KIT = `${process.env.HOME}/.claude/skills/game-builder/kit/school-hub/client/gb-tier-core.js`
describe('티어 코드 넘기기', () => {
  it.runIf(existsSync(KIT))('규칙 사본이 키트 정본과 같다', () => {
    expect(readFileSync('src/lib/gb-tier-core.js', 'utf8')).toBe(readFileSync(KIT, 'utf8'))
  })
  it('게임 링크에 #gbt=코드 — 원래 해시·쿼리는 그대로', () => {
    expect(withTier('https://nyang-cafe.pages.dev/?via=ssam', 'ABCD2345')).toBe('https://nyang-cafe.pages.dev/?via=ssam#gbt=ABCD2345')
    expect(withTier('https://a.pages.dev/#x=1', 'ABCD2345')).toBe('https://a.pages.dev/#x=1&gbt=ABCD2345')
  })
  it('선행쌤 안 주소·http·코드 꼴 틀림은 그대로', () => {
    expect(withTier('https://ssamzip.kr/about', 'ABCD2345')).toBe('https://ssamzip.kr/about')
    expect(withTier('http://a.pages.dev/', 'ABCD2345')).toBe('http://a.pages.dev/')
    expect(withTier('https://a.pages.dev/', 'abc')).toBe('https://a.pages.dev/')
  })
  it('저장된 코드 읽기 — 꼴이 틀리면 빈 값', () => {
    expect(myTierCode({ getItem: () => JSON.stringify({ code: 'ABCD2345' }) })).toBe('ABCD2345')
    expect(myTierCode({ getItem: () => JSON.stringify({ code: '<x>' }) })).toBe('')
    expect(myTierCode({ getItem: () => 'not json' })).toBe('')
  })
})
