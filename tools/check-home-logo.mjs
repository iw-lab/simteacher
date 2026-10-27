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
    const i = document.querySelector('input[type="search"], input[placeholder*="찾"]');
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
  await new Promise((r) => setTimeout(r, 1400));

  const after = await page.evaluate(() => ({
    y: Math.round(window.scrollY),
    cards: document.querySelectorAll('[data-slug]').length,
    q: (document.querySelector('input[type="search"], input[placeholder*="찾"]') || {}).value ?? '',
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
  const bad = [
    ...(await checkHome(page, base)),
    ...(await checkSub(page, base, '/about/')),
  ];
  await browser.close();
  if (bad.length) {
    for (const b of bad) console.error(`✖ ${b}`);
    console.error('✖ 머리말 «선행쌤» 이 첫 화면으로 못 데려간다');
    return 1;
  }
  console.log('✅ 머리말 «선행쌤» — 홈에서도 맨 위·필터 초기화, 하위 페이지에서도 홈으로 (2항)');
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
