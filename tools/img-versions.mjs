// 썸네일 주소에 내용 해시를 붙인다 — firebase.json 이 이미지를 1년 immutable 로 캐시해서
// 같은 파일 이름으로 그림을 바꾸면 이미 본 폰은 옛 그림을 1년 동안 본다(2026-10-21 사용자 폰 실측).
//   node tools/img-versions.mjs          → src/data/imageVersions.json 생성(prebuild)
//   node tools/img-versions.mjs --check  → out/ 의 HTML 이 현재 해시를 붙였는지 검사(postbuild · 어기면 rc 1)
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const DIR = 'public/images/portfolio'
const hashes = {}
for (const f of readdirSync(DIR).sort()) {
  if (!/\.(webp|png|jpe?g)$/.test(f)) continue
  hashes[`/images/portfolio/${f}`] = createHash('sha1').update(readFileSync(join(DIR, f))).digest('hex').slice(0, 10)
}

if (!process.argv.includes('--check')) {
  writeFileSync('src/data/imageVersions.json', JSON.stringify(hashes, null, 1) + '\n')
  console.log(`img-versions: ${Object.keys(hashes).length}개`)
} else {
  if (!existsSync('out')) { console.error('img-versions --check: out/ 없음'); process.exit(1) }
  const bad = new Set(); let seen = 0
  const walk = (d) => { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else if (f.endsWith('.html')) scan(p) } }
  const scan = (p) => {
    for (const m of readFileSync(p, 'utf8').matchAll(/(\/images\/portfolio\/[\w.-]+\.(?:webp|png|jpe?g))(\?v=([0-9a-f]+))?/g)) {
      seen++
      if (m[3] !== hashes[m[1]]) bad.add(`${m[1]} (v=${m[3] ?? '없음'} · 지금 ${hashes[m[1]] ?? '파일 없음'})`)
    }
  }
  walk('out')
  if (!seen) { console.error('img-versions --check: 썸네일 참조 0개 — 검사가 아무것도 못 봤다'); process.exit(1) }
  if (bad.size) { console.error(`img-versions FAIL — 해시 없는/낡은 썸네일 주소 ${bad.size}개:\n  ` + [...bad].slice(0, 10).join('\n  ')); process.exit(1) }
  console.log(`img-versions PASS — 썸네일 참조 ${seen}개 모두 현재 해시`)
}
