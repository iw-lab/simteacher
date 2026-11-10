// 세 문 확인 — 선행쌤은 ssamzip.kr(본) · ssamzip.com(옛 주소) · sunhaengssam.web.app(학교 와이파이가 막을 때) 세 곳이다.
// 2026-11-10 사용자 «바다끝도감 선행샘에 올렸어?? 안보이는데 · 항상 셋다 올리도록해 · 전역 코드에 박아» — .kr 만 올리고 끝냈다.
// 가장 최근 등재(added 최신 3개)의 주소가 세 문 첫 화면에 모두 있어야 통과. 이 망이 ssamzip 을 막으면(DNS 127.0.0.1) 바깥 읽기(r.jina.ai)로 잰다.
//   node tools/check-three-doors.mjs [--slug <slug>]
import fs from 'node:fs';
const DOORS = ['https://ssamzip.kr/', 'https://ssamzip.com/', 'https://sunhaengssam.web.app/'];
const src = fs.readFileSync(new URL('../src/data/projects.ts', import.meta.url), 'utf8');
const rows = [...src.matchAll(/slug: '([^']+)',\s*\n\s*added: '([^']+)'[\s\S]*?url: '([^']+)'/g)].map((m) => ({ slug: m[1], added: m[2], url: m[3] }));
const arg = process.argv.indexOf('--slug');
const want = arg > 0 ? rows.filter((r) => r.slug === process.argv[arg + 1]) : rows.sort((a, b) => b.added.localeCompare(a.added)).slice(0, 3);
if (!want.length) { console.error('✖ 확인할 등재가 없다'); process.exit(1); }
async function page(u) {
  const bust = `?three=${Date.now()}`;
  try { const r = await fetch(u + bust, { signal: AbortSignal.timeout(15000) }); if (r.ok) return { how: '직접', html: await r.text() }; } catch { /* 이 망이 막음 */ }
  const r = await fetch('https://r.jina.ai/' + u + bust, { headers: { 'x-no-cache': 'true' }, signal: AbortSignal.timeout(60000) });
  return { how: '바깥 읽기', html: await r.text() };
}
let bad = 0;
for (const d of DOORS) {
  let p; for (let k = 0; k < 3; k++) { try { p = await page(d); if (p.html.length > 2000) break; } catch { /* 다시 */ } await new Promise((r) => setTimeout(r, 5000)); }
  if (!p) { console.log(`✖ ${d} 못 읽음`); bad++; continue; }
  for (const w of want) {
    const host = new URL(w.url).host;
    const ok = p.html.includes(host);
    console.log(`${ok ? '✅' : '✖'} ${d} ${w.slug}(${p.how})`); if (!ok) bad++;
  }
}
console.log(bad ? `✖ 세 문 확인 실패 ${bad}건 — npm run deploy 가 .com(deploy-com.sh)·web.app(deploy-mirror.sh) 까지 올렸나` : '✅ 세 문 모두 최신 등재 확인');
process.exit(bad ? 1 : 0);
