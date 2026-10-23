#!/usr/bin/env node
// 첫 화면 글씨 최소·한 줄(2026-10-23 «첫화면 글씨좀 최소화 · 최대한 한줄로») — 폰 폭 390px 에서
//   소개 줄·인기 순위 제목·학습 게임 제목이 각각 한 줄이고 화면 밖으로 넘치지 않는다 · «새 창에서 열립니다» 같은 안내 문장이 없다
// 쓰기: node tools/check-home-oneline.mjs <주소>   (종료코드 0 통과 · 1 실패)
import { createRequire } from 'node:module'
import os from 'node:os'
const puppeteer = createRequire(os.homedir() + '/.claude/skills/game-builder/')('puppeteer')
const base = (process.argv[2] || 'http://localhost:4177/').replace(/\/$/, '')
const b = await puppeteer.launch({ headless: 'new' })
const p = await b.newPage()
await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true })
await p.goto(base + '/', { waitUntil: 'networkidle2' })
await new Promise((r) => setTimeout(r, 2000))
const r = await p.evaluate(() => {
  const line = (el) => {
    if (!el) return null
    const lh = parseFloat(getComputedStyle(el).lineHeight) || parseFloat(getComputedStyle(el).fontSize) * 1.5
    const rc = el.getBoundingClientRect()
    return { lines: Math.round(rc.height / lh), right: Math.round(rc.right), text: el.textContent.trim().slice(0, 40) }
  }
  const h2s = [...document.querySelectorAll('h2')]
  return {
    vw: innerWidth,
    hero: line(document.querySelector('h1')),
    popular: line(document.getElementById('popular-title')),
    catalog: line(h2s.find((h) => /학습 게임/.test(h.textContent))),
    wordy: /새 창에서 열립니다|Learning Games|눌러서 바로 쓰세요/.test(document.body.innerText),
  }
})
await b.close()
const fails = []
for (const k of ['hero', 'popular', 'catalog']) {
  const x = r[k]
  console.log(k, JSON.stringify(x))
  if (!x) { fails.push(`${k} 를 못 찾았다`); continue }
  if (x.lines > 1) fails.push(`${k} 가 ${x.lines}줄이다`)
  if (x.right > r.vw) fails.push(`${k} 가 화면 밖(${x.right}px > ${r.vw}px)으로 넘친다`)
}
if (r.wordy) fails.push('안내 문장(새 창에서 열립니다 등)이 남아 있다')
console.log(fails.length ? `FAIL\n- ${fails.join('\n- ')}` : 'PASS')
process.exit(fails.length ? 1 : 0)
