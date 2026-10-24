// ssamzip.com 의 앞문 — 선행쌤 정적 사이트(out/)는 Workers 정적 자산이 그대로 주고, 거기 없는 주소만 여기로 온다.
// /<게임>/… 은 그 게임의 원래 배포(pages.dev)에서 그대로 받아 온다(복사 0 · 게임만 배포하면 바로 반영).
// 학교 망이 pages.dev·하위 도메인을 막아도 ssamzip.com 은 통과하므로 이 길로 연다(2026-10-23 끝까지 진화 실측 · 2026-10-24 사용자 «앞으로는 쌤집 아래로»).
// 새 게임 = edge/games.json 한 줄. 🔒 tools/check-edge-games.mjs(빌드 뒤 · 목록과 sitemap·out/ 충돌 검사)
import GAMES from './games.json'

const WWW = /^www\./

export default {
  async fetch(req, env) {
    const url = new URL(req.url)
    if (WWW.test(url.hostname)) { url.hostname = url.hostname.replace(WWW, ''); return Response.redirect(url.toString(), 301) }
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
    // 정적 자산에도 게임 목록에도 없는 주소 = 선행쌤 404 페이지
    const nf = await env.ASSETS.fetch(new Request(new URL('/404', url), req))
    return new Response(nf.body, { status: 404, headers: nf.headers })
  },
}
