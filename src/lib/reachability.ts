// 이 와이파이에서 그 사이트가 열리나 — 카드에 «막혀 있어요» 표시(2026-10-26).
// 학교 망 필터가 게임 사이트·새 도메인을 DNS 127.0.0.1 로 막아(철모특공대·딱1 로켓·끝까지 진화) 아이들이 눌러도 빈 화면이었다.
// 판정: fetch(no-cors) 응답이 오면 열림. 실패는 «얼마나 빨리»로 가른다 — 망이 DNS 를 127.0.0.1 로 주면 연결 거부가 1ms 안에 온다(실측 tinhelmet 1ms),
//   사이트 자체가 Cross-Origin-Resource-Policy 로 거절하면 실제 왕복 뒤에 온다(실측 vocaworm 51ms — 열리는 사이트를 «막힘»으로 잘못 찍었다).
//   20ms 안 실패 = 막힘 · 그보다 늦은 실패·6초 넘음 = 모름(막힘으로 치지 않는다 — 헛경보보다 놓치는 쪽이 낫다).
// 우회 주소로 몰래 넘기지 않는다 — 학교가 막은 건 알려만 준다(선행쌤 자신만 두 문 주소 sunhaengssam.web.app).
export type Reach = 'ok' | 'blocked' | 'unknown'
const cache = new Map<string, Promise<Reach>>()

export const FAST_FAIL_MS = 20
export function probe(url: string, { fetchImpl = fetch, timeoutMs = 6000, now = () => performance.now(), retryDelayMs = () => 1500 + Math.random() * 1500 }: { fetchImpl?: typeof fetch; timeoutMs?: number; now?: () => number; retryDelayMs?: () => number } = {}): Promise<Reach> {
  let origin: string
  try { origin = new URL(url).origin } catch { return Promise.resolve('unknown') }
  const hit = cache.get(origin)
  if (hit) return hit
  // 카드 수십 장이 한꺼번에 재면 빠른 실패도 20ms 를 넘긴다(실측 딱1 로켓 놓침) → 늦은 실패는 1.5~3초 뒤 혼자 한 번 더(그땐 DNS 도 캐시)
  const once = () => new Promise<'ok' | 'fast' | 'slow' | 'timeout'>((res) => {
    const t = setTimeout(() => res('timeout'), timeoutMs)
    const t0 = now()
    fetchImpl(origin + '/', { mode: 'no-cors', cache: 'no-store', method: 'HEAD' })
      .then(() => { clearTimeout(t); res('ok') })
      .catch(() => { clearTimeout(t); res(now() - t0 < FAST_FAIL_MS ? 'fast' : 'slow') })
  })
  const p = (async (): Promise<Reach> => {
    let r = await once()
    if (r === 'slow') { await new Promise((w) => setTimeout(w, retryDelayMs())); r = await once() }
    return r === 'ok' ? 'ok' : r === 'fast' ? 'blocked' : 'unknown'
  })()
  cache.set(origin, p)
  return p
}

export function _resetReachCache() { cache.clear() }
