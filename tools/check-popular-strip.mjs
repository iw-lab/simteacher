#!/usr/bin/env node
// 맨 위 인기 순위 줄 실측 — 2026-10-23 «자동으로 다음 순위로 넘어가게 · 일정 간격 두고» → «글자 깨진다 7개로 줄이고 7개 한번에 넘어가게».
//   ① 넓은 화면(1280·1600)에 카드가 한 번에 7장 온전히 보인다 · 폰(390)은 3장 · 카드 이름이 잘리지 않을 만큼 넓다(≥140px)
//   ② 가만히 두면 간격마다 «한 화면(7장)씩» 넘어간다 — 넘어간 뒤 첫 카드가 8등
//   ③ 마우스를 올려 두면 멈춘다
//   ④ 끝에서 1등으로 돌아갈 때 되감지 않는다(중간 위치를 지나지 않고 바로 0) — «다시 뒤감기 말고 1번부터 시작»
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
  return [...el.children].filter((li) => { const c = li.getBoundingClientRect(); return c.left >= r.left - 4 && c.right <= r.right + 4 }).length
})
for (const [w, lo, hi] of [[390, 3, 3], [1280, 7, 7], [1600, 7, 7]]) {
  const p = await open(w)
  const n = await visible(p)
  console.log(`① ${w}px 한 번에 ${n}장`)
  if (n < lo || n > hi) fails.push(`① ${w}px ${n}장 (기대 ${lo}~${hi})`)
  if (w >= 1280) {
    const cw = await p.$eval('[data-testid=popular-rail] > li', (li) => li.getBoundingClientRect().width)
    if (cw < 140) fails.push(`① ${w}px 카드 너비 ${Math.round(cw)}px (글자가 깨진다 · ≥140)`)
  }
  if (w === 1280) {
    const ms = Number(await p.$eval('[data-testid=popular-rail]', (el) => el.dataset.autoMs || 0))
    const x0 = await p.$eval('[data-testid=popular-rail]', (el) => el.scrollLeft)
    // 첫 넘김이 시작되는 순간을 잡고(간격 안에 두 번 넘어가는 것을 세지 않도록) 부드럽게 멈출 때까지 기다린다
    const t0 = Date.now()
    while (Date.now() - t0 < (ms || 4000) + 1500) {
      if (Math.abs((await p.$eval('[data-testid=popular-rail]', (el) => el.scrollLeft)) - x0) > 4) break
      await wait(100)
    }
    await wait(1200)
    const x1 = await p.$eval('[data-testid=popular-rail]', (el) => el.scrollLeft)
    const firstRank = await p.$eval('[data-testid=popular-rail]', (el) => {
      const r = el.getBoundingClientRect()
      const li = [...el.children].find((c) => c.getBoundingClientRect().left >= r.left - 2)
      return li ? Number(li.querySelector('span')?.textContent) : null
    })
    console.log(`② 간격 ${ms}ms · scrollLeft ${x0} → ${x1} · 첫 카드 ${firstRank}등`)
    if (!ms || ms < 2000 || ms > 8000) fails.push(`② 간격 ${ms}ms (2~8초여야)`)
    if (!(x1 > x0)) fails.push('② 자동으로 넘어가지 않는다')
    else if (firstRank !== 8) fails.push(`② 한 번에 7장 넘기지 않는다(넘긴 뒤 첫 카드 ${firstRank}등)`)
    const box = await p.$eval('[data-testid=popular-rail]', (el) => { const r = el.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 } })
    await p.mouse.move(box.x, box.y)
    await wait(600)
    const h0 = await p.$eval('[data-testid=popular-rail]', (el) => el.scrollLeft)
    await wait((ms || 4000) * 2 + 500)
    const h1 = await p.$eval('[data-testid=popular-rail]', (el) => el.scrollLeft)
    console.log(`③ 마우스 올림 · scrollLeft ${h0} → ${h1}`)
    if (h1 !== h0) fails.push('③ 마우스를 올려 둬도 넘어간다')
    await p.mouse.move(0, 0)
    // 맨 끝으로 보내 두고 다음 넘김 동안 위치를 30ms 마다 찍는다
    const trace = await p.$eval('[data-testid=popular-rail]', (el, ms) => new Promise((res) => {
      el.style.scrollBehavior = 'auto'; el.scrollLeft = el.scrollWidth; el.style.scrollBehavior = ''
      const max = el.scrollLeft, xs = []
      const id = setInterval(() => { xs.push(Math.round(el.scrollLeft)) }, 30)
      setTimeout(() => { clearInterval(id); res({ max, xs }) }, ms + 600)
    }), ms || 4000)
    const mid = trace.xs.filter((x) => x > 4 && x < trace.max - 4)
    const back = trace.xs.some((x) => x <= 4)
    console.log(`④ 끝(${trace.max}) → ${back ? 0 : '안 돌아옴'} · 중간 위치 ${mid.length}번`)
    if (mid.length) fails.push(`④ 1등으로 되감는다(중간 위치 ${mid.length}번 지남)`)
    else if (!back) fails.push('④ 끝에서 1등으로 돌아가지 않는다')
  }
  await p.close()
}
await b.close()
console.log(fails.length ? `FAIL (${fails.length})\n- ${fails.join('\n- ')}` : 'PASS')
process.exit(fails.length ? 1 : 0)
