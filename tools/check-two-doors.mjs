#!/usr/bin/env node
/**
 * 🔒 이 빌드가 «자기 주소»로 서 있는가.
 *
 * 왜 생겼나 — 선행쌤은 문이 둘이다(ssamzip.com · sunhaengssam.web.app).
 * 학교 망이 본 주소를 막아(2026-10-26 DNS 127.0.0.1) 두 문이 필요한데,
 * 두 문이 canonical 로 본 주소를 가리키면 검색엔진이 두 문을 색인하지 않아
 * **학교에서는 검색으로 들어갈 길이 없다**(2026-10-28 사용자 «걸리게 해»).
 *
 * 반대 사고도 막는다 — 두 문 빌드를 되돌리지 않으면 본 주소에 두 문 canonical 이 박힌다.
 * out/ 하나를 두 곳이 같이 쓰므로 이쪽이 더 잦은 사고다.
 *
 * 쓰기: node tools/check-two-doors.mjs --dir out --expect https://ssamzip.com
 *       node tools/check-two-doors.mjs --url https://sunhaengssam.web.app   (배포본)
 *       node tools/check-two-doors.mjs --selftest
 */
import { readFileSync, existsSync, readdirSync, statSync, mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const arg = (n) => { const i = process.argv.indexOf(n); return i >= 0 ? process.argv[i + 1] : null; };

const CANON = /<link[^>]*rel="canonical"[^>]*href="([^"]+)"/i;
const OGURL = /<meta[^>]*property="og:url"[^>]*content="([^"]+)"/i;
// 두 문 제목 표시 — 검색 결과에서 본 주소 바로 아래 뜰 때 학교에서 어느 쪽을 누를지(2026-10-30 사용자 «제목에»)
const MARK = '(학교와이파이 막힌경우)';
const TITLE = /<title>([^<]*)<\/title>/i;
function titleBad(h, isMirror, where) {
  const t = TITLE.exec(h)?.[1] || '';
  if (isMirror && !t.includes(MARK)) return [`${where} 두 문 제목에 ${MARK} 없음: ${t}`];
  if (!isMirror && t.includes(MARK)) return [`${where} 본 주소 제목에 ${MARK}: ${t}`];
  return [];
}
const MAIN = 'https://ssamzip.com';

function pages(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) pages(p, out);
    else if (e === 'index.html' || (e.endsWith('.html') && e !== '404.html')) out.push(p);
  }
  return out;
}

function checkDir(dir, expect) {
  const bad = [];
  const files = pages(dir);
  if (files.length === 0) return ['검사할 HTML 이 없다 — 탑승객 0 은 통과가 아니다'];
  for (const f of files) {
    const h = readFileSync(f, 'utf8');
    const c = CANON.exec(h)?.[1];
    const o = OGURL.exec(h)?.[1];
    if (c && !c.startsWith(expect)) bad.push(`${f} canonical=${c}`);
    if (o && !o.startsWith(expect)) bad.push(`${f} og:url=${o}`);
    if (f === join(dir, 'index.html')) bad.push(...titleBad(h, expect !== MAIN, f));
  }
  // 사이트맵·robots 도 같은 주소를 가리켜야 한다
  const sm = join(dir, 'sitemap.xml');
  if (existsSync(sm)) {
    const s = readFileSync(sm, 'utf8');
    const other = [...s.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).filter((u) => !u.startsWith(expect));
    if (other.length) bad.push(`sitemap.xml 에 남의 주소 ${other.length}개 (${other[0]})`);
  }
  const rb = join(dir, 'robots.txt');
  if (existsSync(rb)) {
    const line = readFileSync(rb, 'utf8').split('\n').find((l) => l.startsWith('Sitemap:'));
    if (line && !line.includes(expect)) bad.push(`robots.txt ${line.trim()}`);
  }
  return bad.slice(0, 8).map((b) => b) .concat(bad.length > 8 ? [`… 외 ${bad.length - 8}건`] : []);
}

async function checkUrl(url) {
  const base = url.replace(/\/$/, '');
  const bad = [];
  for (const p of ['/', '/tools/', '/about/']) {
    const h = await fetch(base + p).then((r) => r.text()).catch(() => '');
    if (!h) { bad.push(`${p} 를 못 받았다`); continue; }
    const c = CANON.exec(h)?.[1];
    if (!c) bad.push(`${p} canonical 이 없다`);
    else if (!c.startsWith(base)) bad.push(`${p} canonical=${c} (자기 주소가 아니다)`);
    if (p === '/') bad.push(...titleBad(h, base !== MAIN, p));
  }
  const rb = await fetch(base + '/robots.txt').then((r) => r.text()).catch(() => '');
  const line = rb.split('\n').find((l) => l.startsWith('Sitemap:'));
  if (line && !line.includes(base)) bad.push(`robots.txt ${line.trim()}`);
  return bad;
}

function report(bad, what) {
  if (bad.length) {
    for (const b of bad) console.error(`✖ ${b}`);
    console.error(`✖ 두 문 검사 실패 — ${what}`);
    return 1;
  }
  console.log(`✅ 두 문 — ${what} (canonical·og:url·sitemap·robots 전부 자기 주소)`);
  return 0;
}

if (process.argv.includes('--selftest')) {
  const d = mkdtempSync(join(tmpdir(), 'doors-'));
  mkdirSync(join(d, 'tools'), { recursive: true });
  const page = (canon, t = canon.includes('web.app') ? `선행쌤 ${MARK}` : '선행쌤') => `<html><head><title>${t}</title><link rel="canonical" href="${canon}"/><meta property="og:url" content="${canon}"/></head><body>x</body></html>`;
  // 고장 주입 ① 두 문 빌드를 안 되돌려 본 주소에 두 문 canonical 이 박힌 경우
  writeFileSync(join(d, 'index.html'), page('https://sunhaengssam.web.app/'));
  writeFileSync(join(d, 'tools', 'index.html'), page('https://sunhaengssam.web.app/tools/'));
  const red = report(checkDir(d, 'https://ssamzip.com'), '주입①');
  // 고장 주입 ② 두 문인데 canonical 이 본 주소를 가리키는 경우(검색에서 사라진다)
  const red2 = report(checkDir(d, 'https://sunhaengssam.web.app') , '주입② 기준');
  writeFileSync(join(d, 'index.html'), page('https://ssamzip.com/'));
  const red3 = report(checkDir(d, 'https://sunhaengssam.web.app'), '주입②');
  // 고장 주입 ③ 두 문인데 제목 표시가 빠진 경우
  writeFileSync(join(d, 'index.html'), page('https://sunhaengssam.web.app/', '선행쌤'));
  const red4 = report(checkDir(d, 'https://sunhaengssam.web.app'), '주입③');
  console.log(`\n주입③=${red4 === 1 ? 'OK' : '✖'}`);
  console.log(`\n주입①=${red === 1 ? 'OK' : '✖'} · 정상=${red2 === 0 ? 'OK' : '✖'} · 주입②=${red3 === 1 ? 'OK' : '✖'}`);
  process.exit(red === 1 && red2 === 0 && red3 === 1 && red4 === 1 ? 0 : 1);
}

const url = arg('--url');
if (url) process.exit(report(await checkUrl(url), url));
process.exit(report(checkDir(arg('--dir') || 'out', (arg('--expect') || 'https://ssamzip.com').replace(/\/$/, '')), arg('--expect') || 'https://ssamzip.com'));
