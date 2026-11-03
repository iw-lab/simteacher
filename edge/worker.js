// ssamzip.com 의 앞문 — 모든 요청이 먼저 여기로 온다(run_worker_first): www → 301, /<게임>/ → 원본, 나머지 → 정적 out/.
// 게임 길을 정적 파일보다 먼저 보는 까닭: 옛 복사본(out/jinhwa)이 다시 생겨도 게임을 가리지 못하게(2026-10-24 다른 세션 빌드가 되살림).
// /<게임>/… 은 그 게임의 원래 배포(pages.dev)에서 그대로 받아 온다(복사 0 · 게임만 배포하면 바로 반영).
// 학교 망이 pages.dev·하위 도메인을 막아도 ssamzip.com 은 통과하므로 이 길로 연다(2026-10-23 끝까지 진화 실측 · 2026-10-24 사용자 «앞으로는 쌤집 아래로»).
// 🚫 2026-10-26 게임 길 전부 뺐다 — 학교 망 필터가 막힌 게임(끝까지 진화)을 이 길로 연 탓에 ssamzip.com 전체를 게임 사이트로 묶어 막았다.
//    사용자 «선행쌤에서 도메인 주소 게임들 모두 빼자 — 선행쌤 자체가 죽으면 안 돼». games.json 은 비어 있어야 한다(check-edge-games ⑥). 🔒 tools/check-edge-games.mjs(빌드 뒤 · 목록과 sitemap·out/ 충돌 검사)
export const MAIN_HOST = 'ssamzip.kr'


export default {
  async fetch(req, env) {
    const url = new URL(req.url)
    // www·http·workers.dev·옛 본 주소 ssamzip.com 은 전부 https://ssamzip.kr 한 주소로(301) — 구글이 같은 페이지를 여러 주소로 보지 않게.
    // 2026-11-03 본 주소를 ssamzip.kr 로 옮겼다(사용자 «.com 공유하지마» — .com 은 학교 망이 게임 도메인으로 묶어 막았다). 🔒 tests/edge-worker.test.ts
    if (url.hostname !== 'localhost' && (url.protocol === 'http:' || url.hostname !== MAIN_HOST)) {
      url.protocol = 'https:'; url.hostname = MAIN_HOST; url.port = ''
      return Response.redirect(url.toString(), 301)
    }
    // 🚫 2026-11-03 게임 이어주기 코드 자체를 뺐다(사용자 «kr 은 학교 와이파이에서 절대 걸리지 않게 · 절대 게임 같은 거 걸지 마 · 코드에 박아»).
    //    이 워커는 선행쌤 정적 페이지만 낸다 — 다른 사이트를 대신 받아 오는 길이 아예 없다. 🔒 tests/edge-worker.test.ts · tools/check-edge-games.mjs
    // 검색엔진 소유확인 파일(naver….html · google….html)은 «.html 그대로» 200 이어야 한다 — 정적 자산 설정(auto-trailing-slash)이 .html 을 떼는 307 을 줘서 네이버 소유확인이 실패한다(2026-11-03)
    if (/^\/(naver|google)[0-9a-f]+\.html$/.test(url.pathname)) {
      const v = await env.ASSETS.fetch(new Request(new URL(url.pathname.replace(/\.html$/, ''), url), req))
      if (v.ok) return new Response(v.body, { status: 200, headers: { 'content-type': 'text/html; charset=utf-8' } })
    }
    const res = await env.ASSETS.fetch(req)
    if (res.status !== 404) return res
    // 정적 자산에도 게임 목록에도 없는 주소 = 선행쌤 404 페이지
    const nf = await env.ASSETS.fetch(new Request(new URL('/404', url), req))
    return new Response(nf.body, { status: 404, headers: nf.headers })
  },
}
