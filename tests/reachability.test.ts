// 막힌 사이트 표시 — 네트워크 오류 = 막힘 · 응답 = 열림 · 느림 = 모름(막힘으로 치지 않는다)
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { probe, _resetReachCache } from '../src/lib/reachability'

beforeEach(() => _resetReachCache())
describe('probe', () => {
  it('응답이 오면 열림', async () => {
    expect(await probe('https://a.pages.dev/x', { fetchImpl: (async () => new Response(null)) as typeof fetch })).toBe('ok')
  })
  it('곧바로 실패(DNS 127.0.0.1 → 연결 거부 1ms)면 막힘', async () => {
    let t = 0; const now = () => t
    expect(await probe('https://b.pages.dev/', { now, fetchImpl: (async () => { t = 1; throw new TypeError('Failed to fetch') }) as typeof fetch })).toBe('blocked')
  })
  it('왕복 뒤 실패(사이트의 CORP same-origin · vocaworm 51ms)는 모름 — 열리는 사이트를 막힘으로 찍지 않는다', async () => {
    let t = 0; const now = () => t
    expect(await probe('https://vocaworm.vercel.app/', { now, retryDelayMs: () => 0, fetchImpl: (async () => { t += 51; throw new TypeError('Failed to fetch') }) as typeof fetch })).toBe('unknown')
  })
  it('한꺼번에 재느라 늦은 막힘은 다시 재서 잡는다(딱1 로켓)', async () => {
    let t = 0, n = 0; const now = () => t
    expect(await probe('https://ttak1.pages.dev/', { now, retryDelayMs: () => 0, fetchImpl: (async () => { t += ++n === 1 ? 40 : 1; throw new TypeError('Failed to fetch') }) as typeof fetch })).toBe('blocked')
  })
  it('느리면 모름 — 막힘으로 치지 않는다', async () => {
    vi.useFakeTimers()
    const p = probe('https://c.pages.dev/', { fetchImpl: (() => new Promise(() => {})) as typeof fetch, timeoutMs: 100 })
    vi.advanceTimersByTime(200); expect(await p).toBe('unknown'); vi.useRealTimers()
  })
  it('같은 주소는 한 번만 잰다', async () => {
    const f = vi.fn(async () => new Response(null)) as unknown as typeof fetch
    await probe('https://d.pages.dev/a', { fetchImpl: f }); await probe('https://d.pages.dev/b', { fetchImpl: f })
    expect(f).toHaveBeenCalledTimes(1)
  })
})
