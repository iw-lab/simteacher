// 게임 길 목록(edge/games.json) 검사 — 빌드 뒤(postbuild).
//  ① 길 이름이 선행쌤 정적 페이지(out/<길>)와 겹치지 않는다(겹치면 정적 파일이 먼저 나가 게임이 영영 옛판이 된다 — 옛 jinhwa 복사본)
//  ② 원본은 https 의 pages.dev/workers.dev 만(아무 데나 이어 주는 열린 프록시 금지)
//  ③ --live: ssamzip.com/<길>/ 이 200 HTML 이고 원본과 같은 <title> 인가
//  ④ --live: http·www 는 https://ssamzip.com 같은 길로 301(같은 페이지가 주소 여러 개면 구글이 대표를 엉뚱하게 고른다)
//   node tools/check-edge-games.mjs [--live]
import { readFileSync, existsSync } from 'node:fs'
const GAMES = JSON.parse(readFileSync('edge/games.json', 'utf8'))
let bad = 0
const fail = (m) => { console.error('FAIL ' + m); bad++ }
// ⑤ 학교 망 필터가 막은 원본은 쌤집 길로 잇지 않는다 — 막힌 끝까지 진화를 ssamzip.com/jinhwa/ 로 열었더니(10-23)
//    필터가 ssamzip.com 전체를 게임 사이트로 묶어 본 주소까지 막았다(2026-10-26 실측 · 우리 사이트 15곳 중 막힌 건 이 둘뿐)
// 2026-10-29 학교 와이파이 실측: tinhelmet·ttak1-rocket·hobakbul 도 막힘 → 넷 다 새 이름(cheolmo·ttak1·hobak-maeul·jinhwa)으로 옮겼다
const FILTER_BLOCKED = ['kkeutjinhwa.pages.dev', 'tinhelmet.pages.dev', 'ttak1-rocket.pages.dev', 'hobakbul.pages.dev']
// ⑥ 2026-10-26 사용자 «선행쌤에서 도메인 주소 게임들 모두 빼자 — 선행쌤 자체가 죽으면 안 돼» → 게임 길은 하나도 두지 않는다
if (Object.keys(GAMES).length) fail(`games.json 에 게임 길 ${Object.keys(GAMES).length}개(${Object.keys(GAMES).join(', ')}) — 선행쌤 도메인 아래 게임 금지(학교 망이 ssamzip.com 째로 막는다). 게임은 제 주소로 링크`)
for (const [path, origin] of Object.entries(GAMES)) {
  if (FILTER_BLOCKED.some((h) => origin.includes(h))) fail(`${path}: 원본 ${origin} 은 학교 망이 막은 게임 — 쌤집 길로 이으면 ssamzip.com 까지 막힌다`)
  if (!/^[a-z0-9-]+$/.test(path)) fail(`${path}: 길 이름은 소문자·숫자·- 만`)
  if (existsSync(`out/${path}`)) fail(`${path}: out/${path} 가 있다 — 정적 복사본이 게임 길을 가린다`)
  if (!/^https:\/\/[a-z0-9-]+\.(pages|workers)\.dev$/.test(origin)) fail(`${path}: 원본 ${origin} 은 https://*.pages.dev|workers.dev 만`)
}
if (process.argv.includes('--live')) {
  const title = (h) => (h.match(/<title>([^<]*)<\/title>/) || [])[1]
  for (const [path, origin] of Object.entries(GAMES)) {
    const [a, b] = await Promise.all([fetch(`https://ssamzip.com/${path}/`), fetch(`${origin}/`)])
    const [ha, hb] = await Promise.all([a.text(), b.text()])
    if (a.status !== 200 || !title(ha) || title(ha) !== title(hb)) fail(`${path}: ssamzip ${a.status} «${title(ha)}» ≠ 원본 ${b.status} «${title(hb)}»`)
    else console.log(`ok ${path} «${title(ha)}»`)
  }
  for (const from of ['http://ssamzip.com/contact/', 'https://www.ssamzip.com/contact/']) {
    // 🔴 학교 망은 ssamzip.com 을 DNS 127.0.0.1 로 꺾는다(2026-10-26) — 여기서 그냥 fetch 하면
    //    ECONNREFUSED 가 «처리 안 된 예외»로 터져 배포 명령 전체가 죽는다(10-28 실측).
    //    못 재는 것과 틀린 것은 다르다 — 망 탓이면 그렇게 말하고 넘어간다(FAIL 로 세지 않는다).
    let r
    try {
      r = await fetch(from, { redirect: 'manual' })
    } catch (e) {
      const sinkholed = /ECONNREFUSED (127\.0\.0\.1|::1)/.test(String(e?.cause ?? e))
      if (sinkholed) { console.log(`⚪ ${from} — 이 망이 막아 못 쟀다(학교 와이파이 DNS 127.0.0.1). 배포 문제 아님`); continue }
      fail(`${from} → 못 받았다: ${String(e?.cause ?? e).slice(0, 80)}`)
      continue
    }
    const to = r.headers.get('location')
    if (r.status !== 301 || to !== 'https://ssamzip.com/contact/') fail(`${from} → ${r.status} ${to} (기대 301 https://ssamzip.com/contact/)`)
    else console.log(`ok ${from} → 301`)
  }
}
console.log(`check-edge-games: ${bad ? 'FAIL' : 'PASS'} games=${Object.keys(GAMES).length} bad=${bad}`)
process.exit(bad ? 1 : 0)
