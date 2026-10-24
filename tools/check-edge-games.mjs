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
for (const [path, origin] of Object.entries(GAMES)) {
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
    const r = await fetch(from, { redirect: 'manual' })
    const to = r.headers.get('location')
    if (r.status !== 301 || to !== 'https://ssamzip.com/contact/') fail(`${from} → ${r.status} ${to} (기대 301 https://ssamzip.com/contact/)`)
    else console.log(`ok ${from} → 301`)
  }
}
console.log(`check-edge-games: ${bad ? 'FAIL' : 'PASS'} games=${Object.keys(GAMES).length} bad=${bad}`)
process.exit(bad ? 1 : 0)
