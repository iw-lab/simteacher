// 옛 주소 ssamzip.com 의 문 — 2026-11-03 사용자 «.com 은 왜 서버 연결도 안 되게 해 놓음» → «.com 에서 사이트 그대로»
//   · 사람: 선행쌤을 그대로 본다(.com 전용 빌드 out-com — 대표 주소도 .com, .kr 글자 0).
//   · 검색엔진: 모든 응답에 noindex — 네이버·구글이 .com 을 빼고 .kr 로 «자연스럽게» 갈아탄다(사용자 «언젠간 자연스럽게 교체»).
//   🚫 .kr 로 넘기거나 링크하지 않는다(학교 필터가 .com 을 게임 사이트로 묶었다 — 넘김을 따라가 .kr 까지 막힐 수 있다 · 사용자 11-03 «절대 kr 을 걸지 마»).
//   학교 와이파이에선 .com 이 어차피 막혀 있다(10-26 DNS 127.0.0.1) — 이 문은 집·휴대폰에서 옛 검색 결과를 누른 사람용.
// 🔒 tools/check-two-doors.mjs(.com 모드: noindex 전부·.kr 글자 0) · tools/deploy-com.sh
const NOINDEX = 'noindex, nofollow'
export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    if (url.hostname === 'www.ssamzip.com' || url.protocol === 'http:') {
      url.protocol = 'https:'; url.hostname = 'ssamzip.com'; url.port = ''
      return new Response(null, { status: 301, headers: { location: url.toString(), 'x-robots-tag': NOINDEX } })
    }
    let res = await env.ASSETS.fetch(request)
    if (res.status === 404) {
      const nf = await env.ASSETS.fetch(new Request(new URL('/404.html', url), request))
      res = new Response(nf.body, { status: 404, headers: nf.headers })
    }
    const h = new Headers(res.headers)
    h.set('x-robots-tag', NOINDEX)
    return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h })
  },
}
