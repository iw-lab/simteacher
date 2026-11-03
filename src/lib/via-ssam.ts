// 선행쌤에서 게임으로 나가는 링크에 «선행쌤을 거쳐 왔다» 표시(?via=ssam)를 붙인다.
// 게임 쪽 키트 gb-ssam-pass.js 가 이 표시를 보고 «방 만들어 하는 멀티»를 연다(2026-11-03 사용자 «방 멀티는 선행쌤에서만»).
// referrer 로는 안 된다 — 우리 링크는 전부 rel="noreferrer" 라 게임이 어디서 왔는지 못 본다.
// 옛 .com 문 빌드엔 .kr 글자를 싣지 않는다(빌드 때 상수로 접힌다) — 🔒 tools/check-two-doors.mjs(.com 모드)
export const SSAM_HOSTS = [
  'sunhaengssam.web.app', 'sunhaengssam.firebaseapp.com',
  'ssamzip.com', 'www.ssamzip.com', ...(process.env.NEXT_PUBLIC_COM_DOOR === '1' ? [] : ['ssamzip.kr', 'www.ssamzip.kr']),
]

export function viaSsam(url: string): string
export function viaSsam(url: string | undefined): string | undefined
export function viaSsam(url: string | undefined): string | undefined {
  if (!url) return url
  try {
    const u = new URL(url)
    if (u.protocol !== 'https:' || SSAM_HOSTS.includes(u.hostname)) return url
    u.searchParams.set('via', 'ssam')
    return u.toString()
  } catch {
    return url
  }
}

/** /go?u=… 의 u 를 믿지 않는다 — 선행쌤에 등재된 게임 호스트로 가는 https 주소만(열린 넘기기 막기). */
export function safeGoTarget(raw: string | null, listedUrls: (string | undefined)[]): string | null {
  if (!raw) return null
  try {
    const u = new URL(raw)
    if (u.protocol !== 'https:') return null
    const hosts = new Set(listedUrls.flatMap((x) => { try { return x ? [new URL(x).host] : [] } catch { return [] } }))
    return hosts.has(u.host) ? viaSsam(u.toString()) : null
  } catch {
    return null
  }
}
