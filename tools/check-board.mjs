#!/usr/bin/env node
// 문의 게시판 — 말머리 탭·한 줄 목록·답변 배지·후기 쪽지 벽(2026-11-13 «게시판처럼 · 어떤 글이 있는지 분류» → 절충안).
//   옛 check-note-replies(답글 달린 쪽지는 처음부터 펼침, 2026-10-23)를 잇는다: 목록에선 «답변» 배지로 보이고, 줄을 펼치면 답글이 열려 있고 쓰는 칸은 접혀 있다.
// 쓰기: node tools/check-board.mjs <주소>   (종료코드 0 통과 · 1 실패 · 2 글이 없어 못 봄)
import { createRequire } from 'node:module'
import os from 'node:os'
const puppeteer = createRequire(os.homedir() + '/.claude/skills/game-builder/')('puppeteer')
const base = (process.argv[2] || 'http://localhost:4177/').replace(/\/$/, '')
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const b = await puppeteer.launch({ headless: 'new' })
const fails = []
let seen = 0
for (const [w, h, tag] of [[1280, 900, 'PC'], [390, 844, '폰']]) {
  const p = await b.newPage()
  await p.setViewport({ width: w, height: h, isMobile: w < 500, hasTouch: w < 500 })
  await p.goto(base + '/contact/', { waitUntil: 'networkidle2' })
  await wait(4500)
  const r = await p.evaluate(() => {
    const tabs = Object.fromEntries([...document.querySelectorAll('[data-tab]')].map((t) => [t.dataset.tab, Number(t.textContent.replace(/\D/g, ''))]))
    return { tabs, rows: document.querySelectorAll('[data-row]').length, answered: document.querySelectorAll('[data-answered]').length, wide: document.documentElement.scrollWidth > innerWidth + 1 }
  })
  seen = Math.max(seen, r.rows)
  const sum = ['ask', 'request', 'bug', 'hello', 'etc'].reduce((a, k) => a + (r.tabs[k] ?? 0), 0)
  console.log(`${tag} 탭 ${JSON.stringify(r.tabs)} · 줄 ${r.rows} · 답변 배지 ${r.answered}`)
  if (Object.keys(r.tabs).length !== 6) fails.push(`${tag} 말머리 탭이 6개가 아니다`)
  if (r.tabs.all !== sum) fails.push(`${tag} 전체(${r.tabs.all}) ≠ 말머리 합(${sum})`)
  if (r.rows && r.rows !== Math.min(r.tabs.all, 20)) fails.push(`${tag} 전체 탭 줄 수 ${r.rows} ≠ min(전체, 20)`)
  if (r.wide) fails.push(`${tag} 가로로 넘친다`)
  const open = await p.evaluate(async () => {
    const li = document.querySelector('[data-answered]')?.closest('li')
    if (!li) return null
    li.querySelector('button').click()
    await new Promise((res) => setTimeout(res, 2500))
    return { replies: li.querySelectorAll('[data-testid=note-replies] li').length, textarea: !!li.querySelector('textarea') }
  })
  if (open) {
    if (!open.replies) fails.push(`${tag} 답변 배지 줄을 펼쳐도 답글이 안 보인다`)
    if (open.textarea) fails.push(`${tag} 펼친 줄에 쓰는 칸까지 열려 있다`)
  }
  await p.evaluate(() => document.querySelector('[data-tab=hello]')?.click())
  await wait(1200)
  const wall = await p.evaluate(() => ({ notes: document.querySelectorAll('[data-note]').length, rows: document.querySelectorAll('[data-row]').length }))
  if (wall.rows || wall.notes !== r.tabs.hello) fails.push(`${tag} 후기·인사 탭이 쪽지 벽이 아니다(${JSON.stringify(wall)})`)
  await p.close()
}
await b.close()
if (!seen && !fails.length) { console.log('못 봄: 글이 없다'); process.exit(2) }
console.log(fails.length ? `FAIL\n- ${fails.join('\n- ')}` : 'BOARD PASS')
process.exit(fails.length ? 1 : 0)
