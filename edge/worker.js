// ssamzip.com 의 앞문 — 모든 요청이 먼저 여기로 온다(run_worker_first): www → 301, /<게임>/ → 원본, 나머지 → 정적 out/.
// 게임 길을 정적 파일보다 먼저 보는 까닭: 옛 복사본(out/jinhwa)이 다시 생겨도 게임을 가리지 못하게(2026-10-24 다른 세션 빌드가 되살림).
// /<게임>/… 은 그 게임의 원래 배포(pages.dev)에서 그대로 받아 온다(복사 0 · 게임만 배포하면 바로 반영).
// 학교 망이 pages.dev·하위 도메인을 막아도 ssamzip.com 은 통과하므로 이 길로 연다(2026-10-23 끝까지 진화 실측 · 2026-10-24 사용자 «앞으로는 쌤집 아래로»).
// 🚫 2026-10-26 게임 길 전부 뺐다 — 학교 망 필터가 막힌 게임(끝까지 진화)을 이 길로 연 탓에 ssamzip.com 전체를 게임 사이트로 묶어 막았다.
//    사용자 «선행쌤에서 도메인 주소 게임들 모두 빼자 — 선행쌤 자체가 죽으면 안 돼». games.json 은 비어 있어야 한다(check-edge-games ⑥). 🔒 tools/check-edge-games.mjs(빌드 뒤 · 목록과 sitemap·out/ 충돌 검사)
import GAMES from './games.json'


export default {
  async fetch(req, env) {
    const url = new URL(req.url)
    // www·http·workers.dev 는 전부 https://ssamzip.com 한 주소로 — 구글이 같은 페이지를 여러 주소로 보지 않게
    if (url.hostname !== 'localhost' && (url.protocol === 'http:' || url.hostname !== 'ssamzip.com')) {
      url.protocol = 'https:'; url.hostname = 'ssamzip.com'; url.port = ''
      return Response.redirect(url.toString(), 301)
    }
    const m = url.pathname.match(/^\/([a-z0-9-]+)(\/.*)?$/)
    const origin = m && GAMES[m[1]]
    if (origin) {
      if (!m[2]) { url.pathname += '/'; return Response.redirect(url.toString(), 301) }
      const up = new URL(m[2] + url.search, origin)
      const res = await fetch(new Request(up, req), { redirect: 'manual' })
      const loc = res.headers.get('location')
      if (!loc) return res
      // 원본이 돌려보내는 주소를 우리 길 아래로(같은 원본 안 이동만)
      const to = new URL(loc, up)
      if (to.origin !== new URL(origin).origin) return res
      const h = new Headers(res.headers); h.set('location', `/${m[1]}${to.pathname}${to.search}`)
      return new Response(res.body, { status: res.status, headers: h })
    }
    const res = await env.ASSETS.fetch(req)
    if (res.status !== 404) return res
    // 정적 자산에도 게임 목록에도 없는 주소 = 선행쌤 404 페이지
    const nf = await env.ASSETS.fetch(new Request(new URL('/404', url), req))
    return new Response(nf.body, { status: 404, headers: nf.headers })
  },
}
