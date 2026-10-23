#!/usr/bin/env node
// 맨 위 인기 순위 줄 실측 — 2026-10-23 «7~10개 정도 한번에 · 자동으로 다음 순위로 넘어가게 · 일정 간격 두고».
//   ① 넓은 화면(1280·1600)에 카드가 한 번에 7~10장 온전히 보인다 · 폰(390)은 3장 이상
//   ② 가만히 두면 간격마다 다음 순위로 넘어간다(scrollLeft 증가)
//   ③ 마우스를 올려 두면 멈춘다
// 쓰기: node tools/check-popular-strip.mjs <주소>   (종료코드 0 통과 · 1 실패)
import { createRequire } from 'node:module'
import os from 'node:os'
const puppeteer = createRequire(os.homedir() + '/.claude/skills/game-builder/')('puppeteer')
const url = process.argv[2] || 'http://localhost:4177/'
const fails = []
const b = await puppeteer.launch({ headless: 'new' })
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
async function open(w) {
  const p = await b.newPage()
  await p.setViewport({ width: w, height: 900 })
  await p.goto(url, { waitUntil: 'networkidle2' })
  await p.waitForSelector('[data-testid=popular-rail] a', { timeout: 20000 })
  return p
}
const visible = (p) => p.$eval('[data-testid=popular-rail]', (el) => {
  const r = el.getBoundingClientRect()
  return [...el.children].filter((li) => { const c = li.getBoundingClientRect(); return c.left >= r.left - 1 && c.right <= r.right + 1 }).length
})
for (const [w, lo, hi] of [[390, 3, 4], [1280, 7, 10], [1600, 7, 10]]) {
  const p = await open(w)
  const n = await visible(p)
  console.log(`① ${w}px 한 번에 ${n}장`)
  if (n < lo || n > hi) fails.push(`① ${w}px ${n}장 (기대 ${lo}~${hi})`)
  if (w === 1280) {
    const ms = Number(await p.$eval('[data-testid=popular-rail]', (el) => el.dataset.autoMs || 0))
    const x0 = await p.$eval('[data-testid=popular-rail]', (el) => el.scrollLeft)
    await wait((ms || 4000) * 2 + 1200)
    const x1 = await p.$eval('[data-testid=popular-rail]', (el) => el.scrollLeft)
    console.log(`② 간격 ${ms}ms · scrollLeft ${x0} → ${x1}`)
    if (!ms || ms < 2000 || ms > 8000) fails.push(`② 간격 ${ms}ms (2~8초여야)`)
    if (!(x1 > x0)) fails.push('② 자동으로 넘어가지 않는다')
    const box = await p.$eval('[data-testid=popular-rail]', (el) => { const r = el.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 } })
    await p.mouse.move(box.x, box.y)
    await wait(600)
    const h0 = await p.$eval('[data-testid=popular-rail]', (el) => el.scrollLeft)
    await wait((ms || 4000) * 2 + 500)
    const h1 = await p.$eval('[data-testid=popular-rail]', (el) => el.scrollLeft)
    console.log(`③ 마우스 올림 · scrollLeft ${h0} → ${h1}`)
    if (h1 !== h0) fails.push('③ 마우스를 올려 둬도 넘어간다')
  }
  await p.close()
}
await b.close()
console.log(fails.length ? `FAIL (${fails.length})\n- ${fails.join('\n- ')}` : 'PASS')
process.exit(fails.length ? 1 : 0)
