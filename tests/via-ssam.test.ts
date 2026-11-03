// 방 멀티는 선행쌤에서만(2026-11-03) — 게임 링크에 ?via=ssam, /go 문은 등재된 게임 호스트로만 보낸다
import { describe, it, expect } from 'vitest'
import { viaSsam, safeGoTarget } from '../src/lib/via-ssam'
import { learningSites } from '../src/data/projects'

describe('viaSsam', () => {
  it('게임 주소에 via=ssam 을 붙인다(방 코드 등 기존 값 유지)', () => {
    expect(viaSsam('https://blocknuri-2xd.pages.dev/')).toBe('https://blocknuri-2xd.pages.dev/?via=ssam')
    expect(viaSsam('https://x.pages.dev/?room=AB12')).toBe('https://x.pages.dev/?room=AB12&via=ssam')
  })
  it('선행쌤 자기 주소·빈 값은 그대로', () => {
    expect(viaSsam('https://ssamzip.com/blog/')).toBe('https://ssamzip.com/blog/')
    expect(viaSsam(undefined)).toBeUndefined()
  })
  it('⭐ 등재된 게임 링크는 전부 via=ssam 을 단다', () => {
    const bare = learningSites.filter((s) => s.url && new URL(s.url).protocol === 'https:' && new URL(s.url).searchParams.get('via') !== 'ssam')
    expect(bare.map((s) => s.slug)).toEqual([])
  })
})

describe('safeGoTarget', () => {
  const listed = ['https://blocknuri-2xd.pages.dev/?via=ssam', undefined]
  it('등재 게임 호스트면 via=ssam 을 붙여 보낸다', () => {
    expect(safeGoTarget('https://blocknuri-2xd.pages.dev/?room=AB12', listed)).toBe('https://blocknuri-2xd.pages.dev/?room=AB12&via=ssam')
  })
  it('⭐ 남의 주소·http·javascript: 는 막는다(열린 넘기기 금지)', () => {
    for (const bad of ['https://evil.io/', 'http://blocknuri-2xd.pages.dev/', 'javascript:alert(1)', 'https://blocknuri-2xd.pages.dev.evil.io/', null])
      expect(safeGoTarget(bad, listed)).toBeNull()
  })
})
