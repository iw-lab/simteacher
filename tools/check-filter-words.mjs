// 학교 망 필터 분류어 검사 — 빌드 뒤(postbuild).
// 학교 망 필터가 ssamzip.com 을 막았다(2026-10-26). 필터는 사이트를 제목·설명으로 분류하는데 제목이 «학습 게임·사이트 모음»이었다
// (사용자 «이름에 학습 게임 이런 게 들어가서 그런 거 아닐까 — 교실 놀이로»). 모든 페이지의 <title>·description·og·키워드·메뉴에 «게임» 금지.
//   node tools/check-filter-words.mjs [out 폴더]
import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
const OUT = process.argv[2] || 'out'
const WORDS = /게임|game/i
const pages = []
const walk = (d) => { for (const f of readdirSync(d)) { const p = path.join(d, f); if (statSync(p).isDirectory()) walk(p); else if (f === 'index.html') pages.push(p) } }
walk(OUT)
let bad = 0
// 블로그 글 하나하나(blog/<글>/)는 글쓴이의 글이라 뺀다 — 사이트 자체(첫 화면·메뉴 페이지·블로그 목록)만 본다
for (const p of pages.filter((p) => !/^blog\/[^/]+\/index\.html$/.test(path.relative(OUT, p)))) {
  const h = readFileSync(p, 'utf8')
  const meta = [...h.matchAll(/<title>([^<]*)<\/title>|<meta (?:name|property)="(?:description|og:title|og:description|twitter:title|twitter:description|keywords)" content="([^"]*)"/g)].map((m) => m[1] ?? m[2])
  const nav = (h.match(/<nav[^>]*>[\s\S]*?<\/nav>/g) || []).map((n) => n.replace(/<[^>]+>/g, ' '))
  for (const t of [...meta, ...nav]) if (WORDS.test(t)) { console.error(`FAIL ${path.relative(OUT, p)}: «${t.trim().replace(/\s+/g, ' ').slice(0, 80)}» — 제목·설명·메뉴에 «게임»(학교 망이 게임 사이트로 분류해 막는다 · «교실 놀이»로)`); bad++ }
}
console.log(`check-filter-words: ${bad ? 'FAIL' : 'PASS'} pages=${pages.length} bad=${bad}`)
process.exit(bad ? 1 : 0)
