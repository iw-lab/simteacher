// 선행쌤 앞문 워커 — 본 주소 ssamzip.kr 한 곳 · 게임을 대신 받아 오는 길 0 (2026-11-03 사용자 «kr 은 학교 와이파이에서 절대 걸리지 않게 · 절대 게임 같은 거 걸지 마 · 코드에 박아»)
import { describe, it, expect, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import worker from '../edge/worker.js'

const page = (u: string) => new Response(`page ${new URL(u).pathname}`, { status: new URL(u).pathname.startsWith('/nope') ? 404 : 200 })
const env = { ASSETS: { fetch: vi.fn(async (r: Request) => page(r.url)) } }
const go = (u: string) => worker.fetch(new Request(u), env as never)

describe('앞문 워커', () => {
  it('.com·www·http 는 https://ssamzip.kr 같은 길로 301', async () => {
    for (const from of ['https://ssamzip.com/tools/', 'https://www.ssamzip.com/tools/', 'https://www.ssamzip.kr/tools/', 'http://ssamzip.kr/tools/']) {
      const r = await go(from)
      expect(r.status, from).toBe(301)
      expect(r.headers.get('location'), from).toBe('https://ssamzip.kr/tools/')
    }
  })
  it('검색엔진 소유확인 파일은 .html 그대로 200(네이버가 307 을 실패로 본다)', async () => {
    const r = await go('https://ssamzip.kr/naver01d9419e1d76eb7de28e0fdc56c2456a.html')
    expect(r.status).toBe(200)
    expect(env.ASSETS.fetch.mock.calls.at(-1)![0].url).toBe('https://ssamzip.kr/naver01d9419e1d76eb7de28e0fdc56c2456a')
  })
  it('본 주소는 정적 페이지를 그대로 낸다', async () => {
    expect((await go('https://ssamzip.kr/tools/')).status).toBe(200)
  })
  it('게임 이름 길(/jinhwa/ 등)도 다른 사이트로 가지 않는다 — 바깥 fetch 0', async () => {
    const spy = vi.spyOn(globalThis, 'fetch')
    for (const p of ['/jinhwa/', '/blocknuri/', '/cheolmo/']) await go(`https://ssamzip.kr${p}`)
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  })
  it('워커 소스에 바깥 fetch·게임 목록 import 가 없다', () => {
    const src = readFileSync('edge/worker.js', 'utf8').replace(/\/\/.*$/gm, '')
    expect(src).not.toMatch(/(?<![.\w])(?<!async )fetch\(/)
    expect(src).not.toMatch(/games\.json/)
  })
})
