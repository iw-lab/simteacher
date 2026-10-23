import { describe, expect, it } from 'vitest'
import { isForKids } from '../src/lib/kids-shelf'

describe('isForKids — 선행쌤 서재는 아동용만', () => {
  it('대상:초등 이 붙은 작품만 싣는다', () => {
    expect(isForKids({ tags: ['그리스로마신화', '대상:초등'] })).toBe(true)
  })
  it('중학생 이상·어른 책은 뺀다', () => {
    expect(isForKids({ tags: ['소설', '대상:중학생 이상'] })).toBe(false)
    expect(isForKids({ tags: ['대상:어른'] })).toBe(false)
  })
  it('태그 없는 작품은 만화라도 뺀다(판정 전엔 숨긴다)', () => {
    expect(isForKids({ tags: [] })).toBe(false)
    expect(isForKids({})).toBe(false)
    expect(isForKids({ tags: null })).toBe(false)
  })
})

describe('readUrl — 표지는 읽기 화면으로 바로', () => {
  it('만화는 1화, 소설·책은 1장', async () => {
    const { readUrl } = await import('../src/components/library/Bookshelf')
    const w = { slug: 's', title: '', subtitle: '', cover: null, url: 'https://x/works/s', series: null, units: 1, publishedAt: 0 }
    expect(readUrl({ ...w, kind: 'comic' })).toBe('https://x/works/s/1')
    expect(readUrl({ ...w, kind: 'novel' })).toBe('https://x/works/s/chapters/1')
  })
})
