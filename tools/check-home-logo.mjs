#!/usr/bin/env node
/**
 * 🔒 머리말의 «선행쌤»이 언제나 첫 화면으로 데려가는가.
 *
 * 왜 생겼나 — 2026-10-27 사용자 «왼쪽 상단을 누르면 다시 첫화면으로 안 들어가니».
 * 하위 페이지에서는 멀쩡히 «/» 로 갔다. 문제는 **이미 홈에 있을 때**다 —
 * Next 의 Link 는 길이 같으면 아무 일도 안 해서, 한참 내려간 스크롤도
 * 걸어 둔 과목·종류·찾는 말도 그대로였다. 「안 눌리는 것처럼」 보인다.
 *
 * 무엇을 보나 — 소스가 아니라 «진짜 클릭»이다. onClick 이 `if (false &&` 로 꺼져 있어도
 * 코드 검사는 통과한다. 그래서 띄워 놓고 눌러 스크롤과 필터를 재 본다.
 *
 * 쓰기: node tools/check-home-logo.mjs [--url http://…]   (기본 = out/ 을 띄워서 검사)
 *       node tools/check-home-logo.mjs --selftest
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import puppeteer from 'puppeteer';

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8', '.woff2': 'font/woff2' };

async function serve(root) {
  const base = resolve(root);
  const srv = createServer(async (req, res) => {
    let p = decodeURIComponent((req.url || '/').split('?')[0]);
    let f = join(base, p);
    try {
      if ((await stat(f)).isDirectory()) f = join(f, 'index.html');
    } catch {
      if (!extname(f)) f = join(base, p.replace(/\/$/, '') + '.html');
    }
    try {
      const body = await readFile(f);
      res.writeHead(200, { 'content-type': TYPES[extname(f)] || 'application/octet-stream' });
      res.end(body);
    } catch {
      res.writeHead(404).end('nope');
    }
  });
  await new Promise((r) => srv.listen(0, r));
  return { srv, url: `http://127.0.0.1:${srv.address().port}` };
}

/** 홈에서 상태를 흐트러뜨린 뒤 로고를 눌러 «첫 화면»으로 돌아오는지 본다. */
async function checkHome(page, base) {
  await page.goto(base + '/', { waitUntil: 'networkidle2', timeout: 120000 });
  await new Promise((r) => setTimeout(r, 900));

  // ① 찾는 말을 넣어 목록을 좁히고 ② 한참 내려간다
  const typed = await page.evaluate(() => {
    const i = document.querySelector('[data-testid="catalog-search"]');
    if (!i) return false;
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(i, '구구');
    i.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  });
  await new Promise((r) => setTimeout(r, 500));
  const narrowed = await page.evaluate(() => document.querySelectorAll('[data-slug]').length);
  await page.evaluate(() => window.scrollTo(0, 1200));
  await new Promise((r) => setTimeout(r, 300));

  const logo = await page.evaluate(() => {
    const a = [...document.querySelectorAll('a')].find((x) => /선행\s*쌤/.test(x.textContent || '') && x.getBoundingClientRect().top < 140);
    if (!a) return null;
    const r = a.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  });
  if (!logo) return ['머리말에서 «선행쌤» 링크를 못 찾았다'];

  await page.mouse.click(logo.x, logo.y);
  // 부드러운 스크롤은 부하가 높으면 1.4초에 안 끝난다(2026-11-07 load 50 에서 스크롤 14 로 거짓 빨강) — 5초까지 지켜본다. 끝내 안 올라가면 빨강.
  await new Promise((r) => setTimeout(r, 1400));
  for (let t = 0; t < 18 && (await page.evaluate(() => window.scrollY)) > 8; t++) await new Promise((r) => setTimeout(r, 200));

  const after = await page.evaluate(() => ({
    y: Math.round(window.scrollY),
    cards: document.querySelectorAll('[data-slug]').length,
    q: (document.querySelector('[data-testid="catalog-search"]') || {}).value ?? '',
    path: location.pathname,
  }));

  const bad = [];
  if (after.path !== '/') bad.push(`길이 «${after.path}» 로 갔다`);
  if (after.y > 8) bad.push(`맨 위로 안 올라갔다(스크롤 ${after.y})`);
  if (typed) {
    if (after.q !== '') bad.push(`찾는 말이 남아 있다(«${after.q}»)`);
    if (narrowed > 0 && after.cards <= narrowed) bad.push(`목록이 좁혀진 채다(${narrowed} → ${after.cards})`);
  }
  return bad;
}

/**
 * 이미 맨 위·필터 없는 «처음 상태»에서 눌렀을 때도 눈에 보이는 반응이 나는가.
 * 되돌릴 게 없으면 화면이 그대로여서 「눌러도 반응 없다」가 된다(2026-10-27 재제보).
 * 소스에 애니메이션 class 가 있는지가 아니라 **화소가 바뀌는지**로 잰다.
 */
async function checkTapFeedback(page, base) {
  await page.goto(base + '/', { waitUntil: 'networkidle2', timeout: 120000 });
  await new Promise((r) => setTimeout(r, 1000));
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise((r) => setTimeout(r, 300));

  const logo = await page.evaluate(() => {
    const a = [...document.querySelectorAll('a')].find((x) => /선행\s*쌤/.test(x.textContent || '') && x.getBoundingClientRect().top < 140);
    if (!a) return null;
    const r = a.getBoundingClientRect();
    return { clip: { x: Math.max(0, r.x - 14), y: Math.max(0, r.y - 14), width: r.width + 28, height: r.height + 28 }, cx: r.x + r.width / 2, cy: r.y + r.height / 2 };
  });
  if (!logo) return ['머리말에서 «선행쌤» 링크를 못 찾았다'];

  const shot = () => page.screenshot({ clip: logo.clip, encoding: 'base64' });
  // 기준 그림은 두 장이 똑같아질 때 잡는다 — 막 뜬 화면은 가만둬도 화소가 달라져(11-07 실측) 반응 없는 빌드가 초록으로, 멀쩡한 빌드가 빨강으로 갈렸다.
  let before = await shot();
  for (let t = 0; t < 20; t++) { await new Promise((r) => setTimeout(r, 250)); const again = await shot(); if (again === before) break; before = again; }
  // 반응은 0.46초뿐인데 부하가 높으면 스크린샷 한 장이 그보다 오래 걸려 끝난 뒤를 찍는다(2026-11-07 load 50~70 에서 연달아 거짓 빨강).
  //   다섯 번 눌러 한 번이라도 화소가 바뀌면 반응이 있는 것이다. 반응이 없는 빌드는 몇 번을 눌러도 바뀌지 않으니 그대로 빨강.
  //   화소만으로는 머리말 뒤 배경의 흔들림을 반응으로 착각했다(11-07 반응을 뗀 빌드가 4번 중 2번 초록) — 그 요소에서 실제로 시작된 애니메이션도 함께 본다.
  await page.evaluate(() => { window.__tap = 0; const a = [...document.querySelectorAll('a')].find((x) => /선행\s*쌤/.test(x.textContent || '')); a?.addEventListener('animationstart', () => { window.__tap++; }); });
  let during = before;
  for (let k = 0; k < 5 && during === before; k++) {
    await page.mouse.click(logo.cx, logo.cy);
    await new Promise((r) => setTimeout(r, 120));    // 반응 한가운데
    during = await shot();
    if (during === before) await new Promise((r) => setTimeout(r, 600));
  }
  // 가라앉기 — 고정 0.9초였더니 빌드 중(load 30+)엔 애니메이션이 덜 끝나 거짓 빨강(2026-11-03 세 번째).
  //   3초까지 0.25초마다 보고 «원래 모습»이 한 번이라도 나오면 통과. 끝내 안 돌아오면 빨강(--selftest 가 그 경우를 만든다).
  if (process.argv.includes('--selftest')) await page.evaluate(() => { const a = [...document.querySelectorAll('a')].find((x) => /선행\s*쌤/.test(x.textContent || '')); if (a) a.style.outline = '6px solid red'; });
  let settled = null;
  for (let t = 0; t < 12; t++) { await new Promise((r) => setTimeout(r, 250)); settled = await shot(); if (settled === before) break; }

  const bad = [];
  // 반응 = 그 요소에서 실제로 시작된 애니메이션(animationstart). 화소 비교는 보조 — 빌드 직후 열기(부하)엔 스크린샷 한 장이 반응(0.46초)보다
  //   오래 걸려 끝난 뒤만 찍혀 배포가 4번 내리 거짓 빨강이었다(2026-11-10 · --throttle 20 으로 재현). 반응을 뗀 빌드는 animationstart 가 0 이라 그대로 빨강(--selftest-noreact).
  const tapped = await page.evaluate(() => window.__tap);
  if (!tapped) bad.push(during === before ? '처음 상태에서 눌렀는데 화소가 하나도 안 바뀐다(반응 없음)' : '화소는 바뀌었지만 «선행쌤»에서 시작된 애니메이션이 없다(반응 없음)');
  if (settled !== before) bad.push('반응이 끝나고도 원래 모습으로 안 돌아온다');
  return bad;
}

/** 하위 페이지에서는 그냥 홈으로 가야 한다(원래 되던 것을 깨지 않았는지). */
async function checkSub(page, base, path) {
  await page.goto(base + path, { waitUntil: 'networkidle2', timeout: 120000 });
  await new Promise((r) => setTimeout(r, 700));
  const logo = await page.evaluate(() => {
    const a = [...document.querySelectorAll('a')].find((x) => /선행\s*쌤/.test(x.textContent || '') && x.getBoundingClientRect().top < 140);
    if (!a) return null;
    const r = a.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  });
  if (!logo) return [`${path} 머리말에서 «선행쌤» 링크를 못 찾았다`];
  await page.mouse.click(logo.x, logo.y);
  await new Promise((r) => setTimeout(r, 1600));
  const p = await page.evaluate(() => location.pathname);
  return p === '/' ? [] : [`${path} 에서 눌렀더니 «${p}» 로 갔다`];
}

async function run(base) {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });
  // --throttle N = CPU N배 느리게(배포 직후 빌드 열기에서 4번 내리 거짓 빨강 — 2026-11-10 재현용) · --selftest-noreact = 반응을 뗀 빌드 흉내(빨강이어야)
  { const t = process.argv.indexOf('--throttle'); if (t >= 0) { const c = await page.target().createCDPSession(); await c.send('Emulation.setCPUThrottlingRate', { rate: +process.argv[t + 1] || 20 }); } }
  if (process.argv.includes('--selftest-noreact')) await page.evaluateOnNewDocument(() => { addEventListener('DOMContentLoaded', () => { const st = document.createElement('style'); st.textContent = '.brand-tap{animation:none!important;transform:none!important;filter:none!important}'; document.head.append(st); }); });
  const bad = [
    ...(await checkHome(page, base)),
    ...(await checkTapFeedback(page, base)),
    ...(await checkSub(page, base, '/about/')),
  ];
  await browser.close();
  if (bad.length) {
    for (const b of bad) console.error(`✖ ${b}`);
    console.error('✖ 머리말 «선행쌤» 이 첫 화면으로 못 데려간다');
    return 1;
  }
  console.log('✅ 머리말 «선행쌤» — 홈에서 맨 위·필터 초기화 · 처음 상태에서도 보이는 반응 · 하위 페이지에서 홈으로 (3항)');
  return 0;
}

const i = process.argv.indexOf('--url');
if (i >= 0) {
  process.exit(await run(process.argv[i + 1].replace(/\/$/, '')));
}
const { srv, url } = await serve(process.env.OUT_DIR || 'out');
const rc = await run(url);
srv.close();
process.exit(rc);
