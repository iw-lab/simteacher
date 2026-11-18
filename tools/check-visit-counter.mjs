// 머리글 «오늘·전체» 입장 수가 Firestore 실시간 채널(WebChannel)이 막힌 망에서도 보이는가 — 실브라우저로 잰다.
// 2026-11-18 사용자 «선행쌤 우측 상단 오늘 입장 누적 입장 수 어디로 감» — 채널이 막힌 망(학교 망·광고 차단기)에선 SDK 조회가 멈춰 칸이 통째로 숨었다.
//   node tools/check-visit-counter.mjs <URL> [--resolve host=ip]   (이 망은 ssamzip 을 127.0.0.1 로 막는다 → 바깥 IP 를 준다)
//   --selftest: 옛 경로(SDK 만)를 흉내 내 REST 까지 막으면 빨강이 나야 한다
import { createRequire } from 'node:module';
const puppeteer = createRequire(process.env.HOME + '/.claude/skills/game-builder/')('puppeteer');
const a = process.argv.slice(2); const self = a.includes('--selftest');
const url = a.find((x) => /^https?:/.test(x)) || 'http://localhost:5299/';
const rs = a.filter((x, i) => a[i - 1] === '--resolve').map((x) => { const [h, ip] = x.split('='); return `MAP ${h} ${ip}`; });
async function run(blockRest) {
  const br = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', ...(rs.length ? [`--host-resolver-rules=${rs.join(', ')}`] : [])] });
  try {
    const p = await br.newPage(); await p.setViewport({ width: 1280, height: 800 }); await p.setRequestInterception(true);
    p.on('request', (r) => { const u = r.url(); if (/firestore\.googleapis\.com\/google\.firestore\.v1\.Firestore\/(Listen|Write)\/channel/.test(u) || (blockRest && /firestore\.googleapis\.com\/v1\//.test(u))) r.abort(); else r.continue(); });
    await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
    const ok = await p.waitForFunction(() => /오늘\s*[\d,]+\s*명/.test(document.querySelector('[data-visit-counter]')?.textContent || ''), { timeout: 15000 }).then(() => true).catch(() => false);
    return { ok, text: await p.evaluate(() => document.querySelector('[data-visit-counter]')?.textContent || '(없음)') };
  } finally { await br.close(); }
}
if (self) {
  const g = await run(false), r = await run(true);
  const pass = g.ok && !r.ok; console.log(`${g.ok ? 'ok' : 'FAIL'} 채널 막힘 → 보인다 «${g.text}»\n${!r.ok ? 'ok' : 'FAIL'} REST 까지 막힘(옛 경로) → 빨강 «${r.text}»`);
  console.log(pass ? 'VISIT-COUNTER SELFTEST PASS' : 'VISIT-COUNTER SELFTEST FAIL'); process.exit(pass ? 0 : 1);
}
const g = await run(false); console.log(g.ok ? `✅ 입장 수(채널 막힘에서도) «${g.text}» ${url}` : `❌ 입장 수가 안 보인다(채널 막힘) «${g.text}» ${url}`); process.exit(g.ok ? 0 : 1);
