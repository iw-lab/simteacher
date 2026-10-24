// 페이지마다 제목·설명이 달라야 한다 — 「use client」 페이지가 metadata 를 못 내보내 홈 것을 물려받으면
// 구글이 중복으로 묶고 글이 가장 긴 페이지(포트폴리오)를 «선행쌤» 대표로 띄웠다(2026-10-24 사용자 검색 실측).
//   node tools/check-seo-unique.mjs [out]   (postbuild · 겹치면 rc 1)
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const OUT = process.argv[2] || 'out'
if (!existsSync(OUT)) { console.error(`check-seo-unique: ${OUT}/ 없음`); process.exit(1) }
const SKIP = /^(404|_not-found|admin|jinhwa)(\/|$)/ // 검색에 안 내보내는 쪽·따로 사는 게임
const pages = []
const walk = (d) => { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) { if (f !== '_next') walk(p) } else if (f === 'index.html') pages.push(p) } }
walk(OUT)
const seen = { title: new Map(), description: new Map() }
let bad = 0
for (const p of pages) {
  const rel = p.slice(OUT.length + 1).replace(/index\.html$/, '')
  if (SKIP.test(rel)) continue
  const h = readFileSync(p, 'utf8')
  const title = (h.match(/<title>([^<]*)<\/title>/) || [])[1]
  const description = (h.match(/<meta name="description" content="([^"]*)"/) || [])[1]
  for (const [k, v] of Object.entries({ title, description })) {
    if (!v) { console.error(`FAIL /${rel} ${k} 없음`); bad++; continue }
    if (seen[k].has(v)) { console.error(`FAIL /${rel} ${k} 가 /${seen[k].get(v)} 와 같다: ${v}`); bad++ } else seen[k].set(v, rel)
  }
}
console.log(`check-seo-unique: ${bad ? 'FAIL' : 'PASS'} pages=${seen.title.size} dup=${bad}`)
process.exit(bad ? 1 : 0)
