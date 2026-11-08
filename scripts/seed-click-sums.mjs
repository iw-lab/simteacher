#!/usr/bin/env node
/**
 * 홈 인기 순위 합계 문서(clickSum) 를 기존 기록(clicks·clicksDaily)에서 다시 맞춘다 — 처음 옮길 때·어긋났을 때(2026-11-08).
 *   node scripts/seed-click-sums.mjs          → 계산만 해서 보여 준다(쓰기 0)
 *   node scripts/seed-click-sums.mjs --apply  → total + 최근 사흘 하루 문서를 덮어쓴다(관리자 권한 — 규칙을 거치지 않는다)
 *   언제 다시 돌려도 된다 — 앱별 기록(clicks·clicksDaily)이 정본이고, 합계가 어긋나면(쓰기 경합·장난) 이걸로 다시 맞춘다.
 * 인증 = firebase CLI 로그인(~/.config/configstore/firebase-tools.json)의 갱신 토큰. 읽기 = clicks 전체(앱 수만큼) + clicksDaily 사흘치.
 */
import { readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
const PROJECT = JSON.parse(readFileSync('.firebaserc', 'utf8')).projects.default
const APPLY = process.argv.includes('--apply')
const MAX_DOCS = 2000 // 읽기 상한 — 넘으면 멈춘다(감사 스크립트가 무료 한도를 태운 2026-07-27 사고)
const tok = JSON.parse(readFileSync(join(homedir(), '.config/configstore/firebase-tools.json'), 'utf8')).tokens.refresh_token
const at = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: tok, client_id: '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com', client_secret: 'j9iVZfS8kkCEFUPaAeJV0sAi' }) }).then((r) => r.json())
if (!at.access_token) { console.error('토큰 교환 실패', at.error); process.exit(2) }
const H = { authorization: `Bearer ${at.access_token}`, 'content-type': 'application/json' }
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`
const num = (v) => Number(v?.integerValue ?? v?.doubleValue ?? 0)
async function list(coll) {
  const out = []; let page = ''
  do {
    const r = await fetch(`${BASE}/${coll}?pageSize=300${page ? `&pageToken=${page}` : ''}`, { headers: H }).then((x) => x.json())
    out.push(...(r.documents || [])); page = r.nextPageToken || ''
    if (out.length > MAX_DOCS) { console.error(`${coll} 가 ${MAX_DOCS} 를 넘는다 — 멈춤`); process.exit(3) }
  } while (page)
  return out
}
const kst = (d) => { const k = new Date(d.getTime() + 9 * 3600e3); return `${k.getUTCFullYear()}${String(k.getUTCMonth() + 1).padStart(2, '0')}${String(k.getUTCDate()).padStart(2, '0')}` }
const days = [0, 1, 2].map((i) => kst(new Date(Date.now() - i * 86400e3)))
// 등록된 앱만 남긴다 — 누구나 +1 할 수 있는 합계에 가짜 이름 칸을 채우는 장난을 이 스크립트가 걷어낸다(교차검증 codex)
const KNOWN = new Set([...readFileSync('src/data/projects.ts', 'utf8').matchAll(/^\s+slug: '([a-z0-9-]{1,60})'/gm)].map((m) => m[1]))
if (KNOWN.size < 10) { console.error('등록된 앱 목록을 못 읽었다 — 멈춤'); process.exit(4) }
const SLUG = { test: (s) => KNOWN.has(s) }
const total = {}
for (const d of await list('clicks')) { const f = d.fields || {}; const s = f.slug?.stringValue ?? d.name.split('/').pop(); if (SLUG.test(s)) total[s] = num(f.count) }
const byDay = Object.fromEntries(days.map((d) => [d, {}]))
for (const day of days) {
  const r = await fetch(`${BASE}:runQuery`, { method: 'POST', headers: H, body: JSON.stringify({ structuredQuery: { from: [{ collectionId: 'clicksDaily' }], where: { fieldFilter: { field: { fieldPath: 'date' }, op: 'EQUAL', value: { stringValue: day } } }, limit: 500 } }) }).then((x) => x.json())
  for (const row of r) { const f = row.document?.fields; if (f && SLUG.test(f.slug?.stringValue ?? '')) byDay[day][f.slug.stringValue] = num(f.count) }
}
const sumOf = (m) => Object.values(m).reduce((a, b) => a + b, 0)
console.log(`total: 앱 ${Object.keys(total).length}개 · 클릭 ${sumOf(total)}`)
for (const d of days) console.log(`${d}: 앱 ${Object.keys(byDay[d]).length}개 · 클릭 ${sumOf(byDay[d])}`)
if (!APPLY) { console.log('(계산만 — 쓰려면 --apply)'); process.exit(0) }
const mapVal = (m) => ({ mapValue: { fields: Object.fromEntries(Object.entries(m).map(([k, v]) => [k, { integerValue: String(v) }])) } })
for (const [id, m] of [['total', total], ...days.map((d) => [d, byDay[d]])]) {
  if (!Object.keys(m).length) continue
  const k = Object.keys(m)[0]
  const r = await fetch(`${BASE}/clickSum/${id}`, { method: 'PATCH', headers: H, body: JSON.stringify({ fields: { c: mapVal(m), k: { stringValue: k } } }) })
  console.log(`clickSum/${id} ← ${r.status}`)
  if (!r.ok) { console.error(await r.text()); process.exit(1) }
}
