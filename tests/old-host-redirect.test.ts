// 옛 주소 넘기기 — ssamzip.com 이 막힌 망(학교 · 2026-10-26)에서는 옛 주소에 머물러야 한다
import { describe, it, expect, vi } from 'vitest'
import { OLD_HOST_REDIRECT } from '../src/lib/oldHostRedirect'

function run(host: string, img: 'load' | 'error' | 'hang') {
  vi.useFakeTimers()
  const replace = vi.fn()
  let probe: { onload?: () => void; onerror?: () => void; url?: string } = {}
  class FakeImage { onload?: () => void; onerror?: () => void; url?: string; set src(v: string) { this.url = v; probe = this } }
  const location = { hostname: host, pathname: '/tools/', search: '', hash: '', replace }
  new Function('location', 'Image', 'setTimeout', OLD_HOST_REDIRECT)(location, FakeImage, setTimeout)
  if (img === 'load') probe.onload?.()
  if (img === 'error') probe.onerror?.()
  vi.advanceTimersByTime(3500)
  if (img === 'hang') probe.onload?.()   // 3초 넘어 늦게 와도 넘기지 않는다
  vi.useRealTimers()
  return { replace, probe }
}

describe('옛 주소 넘기기', () => {
  it('ssamzip.com 이 열리면 같은 길로 넘긴다', () => {
    expect(run('sunhaengssam.web.app', 'load').replace).toHaveBeenCalledWith('https://ssamzip.com/tools/')
  })
  it('ssamzip.com 이 막히면(학교 망) 옛 주소에 머문다', () => {
    expect(run('sunhaengssam.web.app', 'error').replace).not.toHaveBeenCalled()
    expect(run('sunhaengssam.firebaseapp.com', 'hang').replace).not.toHaveBeenCalled()
  })
  it('www 는 바로 넘기고, ssamzip.com 자신은 그대로', () => {
    expect(run('www.ssamzip.com', 'error').replace).toHaveBeenCalledWith('https://ssamzip.com/tools/')
    expect(run('ssamzip.com', 'load').replace).not.toHaveBeenCalled()
  })
})
