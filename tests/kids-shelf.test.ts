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

describe('curriculumOf — 태그에서 학년·과목·단원 읽기', () => {
  it('5학년·수학·4단원', async () => {
    const { curriculumOf } = await import('../src/lib/kids-shelf')
    expect(curriculumOf(['5학년', '수학', '4단원', '대상:초등'])).toEqual({ grade: 5, subject: '수학', unit: 4 })
  })
  it('교과 태그가 없으면 전부 null', async () => {
    const { curriculumOf } = await import('../src/lib/kids-shelf')
    expect(curriculumOf(['그리스로마신화', '대상:초등'])).toEqual({ grade: null, subject: null, unit: null })
    expect(curriculumOf(undefined)).toEqual({ grade: null, subject: null, unit: null })
  })
  it('curriculumLabel 은 있는 것만 잇는다', async () => {
    const { curriculumLabel } = await import('../src/lib/kids-shelf')
    expect(curriculumLabel(['5학년', '사회', '3단원'])).toBe('5학년 사회 3단원')
    expect(curriculumLabel(['신화'])).toBe('')
  })
})

describe('orderShelf — 교과 묶음을 학년→과목 순으로 앞에', () => {
  it('교과 묶음이 먼저(학년·과목 순), 나머지는 원래 순서', async () => {
    const { orderShelf } = await import('../src/lib/kids-shelf')
    const g = (title: string, tags: string[]) => ({ title, works: [{ tags }] })
    const out = orderShelf([
      g('그리스로마신화', ['신화']),
      g('5학년 사회', ['5학년', '사회', '1단원']),
      g('삼국지', ['고전']),
      g('5학년 수학', ['5학년', '수학', '1단원']),
      g('4학년 과학', ['4학년', '과학', '2단원']),
    ])
    expect(out.map((x) => x.title)).toEqual(['4학년 과학', '5학년 수학', '5학년 사회', '그리스로마신화', '삼국지'])
  })
})
