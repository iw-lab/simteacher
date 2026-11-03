#!/usr/bin/env node
// «지금 열린 온라인 방» 실측 — 2026-10-23 «한쪽 부분에 지금 열린 온라인 방 모두 표시 · 누르면 바로 입장».
//   ① 시험 방 하나를 방 게시판에 올리면 15초 안에 첫 화면 칸에 뜬다(넓은 화면 1600 · 폰 390)
//   ② 칸이 스크롤 없이 첫 화면 안에 있다 · 가로 스크롤 없음
//   ③ «들어가기» 주소 = 그 게임의 ?room=코드 · 새 탭
//   ④ 방을 닫으면 목록에서 빠진다(다음 읽기 때)
// 쓰기: node tools/check-live-rooms.mjs <선행쌤 주소>   (종료코드 0 통과 · 1 실패)
import { createRequire } from 'node:module'
import os from 'node:os'
const puppeteer = createRequire(os.homedir() + '/.claude/skills/game-builder/')('puppeteer')
const url = process.argv[2] || 'http://localhost:4177/'
const BOARD = 'https://room-board.simssijjang-korea.workers.dev'
const GAME = { g: 'racket-rush', origin: 'https://racket-rush.vercel.app' }
const code = `CHK${Date.now().toString(36).slice(-5).toUpperCase()}`
const fails = []
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const post = (body) => fetch(`${BOARD}/v1/room`, { method: 'POST', headers: { origin: GAME.origin, 'content-type': 'application/json' }, body: JSON.stringify({ g: GAME.g, code, ...body }) }).then((r) => r.json())

const { k } = await post({ n: 1, max: 2 })
if (!k) { console.error('게시판에 시험 방을 못 올렸다'); process.exit(1) }
const b = await puppeteer.launch({ headless: 'new' })
try {
  for (const [w, h] of [[1600, 950], [390, 844]]) {
    const p = await b.newPage()
    await p.setViewport({ width: w, height: h })
    await p.goto(url, { waitUntil: 'networkidle2', timeout: 60000 })
    // 게시판 캐시 10초 + 화면 폴링 20초 — 처음 읽기에 없으면 새로 고쳐 다시 본다
    let got = null
    for (let t = 0; t < 4 && !got; t++) {
      got = await p.waitForFunction((c) => [...document.querySelectorAll('[data-testid=live-room]')].find((a) => a.href.includes(`room=${c}`)) ? true : null, { timeout: 8000 }, code).then(() => true).catch(() => null)
      if (!got) await p.reload({ waitUntil: 'networkidle2' })
    }
    if (!got) { fails.push(`${w}: 시험 방이 칸에 안 뜬다`); await p.close(); continue }
    const m = await p.evaluate((c) => {
      const box = document.querySelector('[data-testid=live-rooms]').getBoundingClientRect()
      const a = [...document.querySelectorAll('[data-testid=live-room]')].find((x) => x.href.includes(`room=${c}`))
      const lg = document.querySelector('[data-testid=school-league]')?.getBoundingClientRect(); const pop = document.querySelector('[data-testid=popular-strip]')?.getBoundingClientRect() || document.querySelector('main h1, h1')?.getBoundingClientRect()
      return { top: box.top, left: box.left, bottom: box.bottom, ih: innerHeight, sw: document.documentElement.scrollWidth, iw: innerWidth, href: a.href, target: a.target, lgH: lg ? lg.height : 0, lgTop: lg ? lg.top : 0 }
    }, code)
    if (!(m.top >= 0 && m.top < m.ih - 60)) fails.push(`${w}: 칸이 첫 화면 밖(top ${Math.round(m.top)} / ${m.ih})`)
    // 🔒 2026-11-03 사용자 «학교 대항전이 너무 많이 차지 · 오른쪽 첫 화면에 실시간 방 · 실시간 방이 더 중요»
    if (w >= 1280) {
      if (!(m.left > m.iw * 0.6 && m.top < m.ih * 0.5)) fails.push(`${w}: 실시간 방이 오른쪽 첫 화면 위쪽이 아니다(left ${Math.round(m.left)} · top ${Math.round(m.top)})`)
      if (m.lgH > m.ih * 0.55) fails.push(`${w}: 학교 대항전이 화면 높이의 ${Math.round((m.lgH / m.ih) * 100)}%(≤55%)`)
    } else if (m.lgTop && m.lgTop < m.top) fails.push(`${w}: 폰에서 학교 대항전이 실시간 방보다 위`)
    if (m.sw > m.iw) fails.push(`${w}: 가로 스크롤 ${m.sw} > ${m.iw}`)
    if (!m.href.startsWith(`${GAME.origin}/?room=${code}`)) fails.push(`${w}: 들어가기 주소 ${m.href}`)   /* 뒤에 &via=ssam(들어온 길 표시)은 붙어도 된다 */
    if (m.target !== '_blank') fails.push(`${w}: 새 탭이 아니다`)
    // 🔒 2026-11-03 «학교 순위 있는 게임은 인기 순위에도 최신순처럼 이번 주 1위를» — 최신순 카드에 1위 줄이 있는 게임은 인기 순위 카드에도
    await p.waitForSelector('[data-slug] [data-card-leader]', { timeout: 15000 }).catch(() => null)
    const lead = await p.evaluate(() => { const has = (el) => !!el.querySelector('[data-card-leader]'); const cat = new Map([...document.querySelectorAll('div[data-slug], a[data-slug]')].filter((e) => !e.closest('[data-testid=popular-rail]')).map((e) => [e.dataset.slug, has(e)]));
      const pop = [...document.querySelectorAll('[data-testid=popular-rail] a[data-slug]')].map((e) => ({ s: e.dataset.slug, has: has(e) })); return { pn: pop.length, n: [...cat.values()].filter(Boolean).length, miss: pop.filter((q) => cat.get(q.s) && !q.has).map((q) => q.s), popHas: pop.filter((q) => q.has).length }; })
    if (!lead.n) fails.push(`${w}: 최신순 카드에 이번 주 1위 줄이 하나도 없다(판을 못 읽음?)`)
    if (lead.pn < 3) fails.push(`${w}: 인기 순위 카드(data-slug)를 못 찾음 ${lead.pn}`)   /* 0장이면 «빠짐 0» 이 공짜 통과 */
    if (lead.miss.length) fails.push(`${w}: 인기 순위 카드에 1위 줄 빠짐 ${lead.miss.join(',')}`)
    console.log(`  ${w}px: 1위 줄 — 최신순 ${lead.n} · 인기 ${lead.popHas}`)
    console.log(`  ${w}px: 칸 top ${Math.round(m.top)} left ${Math.round(m.left)} · 대항전 높이 ${Math.round(m.lgH)} · ${m.href}`)
    await p.close()
  }
  await post({ st: 'closed', k })
  await wait(11000)
  const left = await fetch(`${BOARD}/v1/rooms`).then((r) => r.json())
  if (left.rooms.some((r) => r.code === code)) fails.push('닫은 방이 목록에 남았다')
} finally {
  await post({ st: 'closed', k }).catch(() => {})
  await b.close()
}
console.log(fails.length ? `❌ check-live-rooms ${fails.length}건\n  ${fails.join('\n  ')}` : '✅ check-live-rooms 통과')
process.exit(fails.length ? 1 : 0)
