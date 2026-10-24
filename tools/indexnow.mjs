// 배포 뒤 IndexNow 로 네이버·빙에 «바뀐 주소»를 바로 알린다(다음·구글은 IndexNow 를 안 받는다 — 구글=서치콘솔, 다음=웹마스터도구).
// 키 = public/<32hex>.txt (파일 이름 = 내용). 주소 = 빌드된 sitemap.xml 전부.
//   node tools/indexnow.mjs [--dry]
import { readFileSync, readdirSync } from 'node:fs'
const HOST = 'ssamzip.com'
const key = readdirSync('public').map((f) => f.match(/^([0-9a-f]{32})\.txt$/)).find(Boolean)?.[1]
if (!key || readFileSync(`public/${key}.txt`, 'utf8').trim() !== key) { console.error('indexnow: 키 파일 없음/불일치'); process.exit(1) }
const urls = [...readFileSync('out/sitemap.xml', 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
if (!urls.length) { console.error('indexnow: sitemap 비어 있음'); process.exit(1) }
const body = { host: HOST, key, keyLocation: `https://${HOST}/${key}.txt`, urlList: urls }
if (process.argv.includes('--dry')) { console.log(`indexnow --dry: ${urls.length}개`); process.exit(0) }
let bad = 0
for (const ep of ['https://api.indexnow.org/indexnow', 'https://searchadvisor.naver.com/indexnow', 'https://www.bing.com/indexnow']) {
  const r = await fetch(ep, { method: 'POST', headers: { 'content-type': 'application/json; charset=utf-8' }, body: JSON.stringify(body) }).catch((e) => ({ status: 0, statusText: String(e) }))
  const ok = r.status === 200 || r.status === 202
  if (!ok) bad++
  console.log(`indexnow ${ok ? 'ok ' : 'FAIL'} ${ep} → ${r.status} ${r.statusText || ''}`)
}
console.log(`indexnow: 주소 ${urls.length}개 알림 · 실패 ${bad}`)
process.exit(bad === 3 ? 1 : 0)
