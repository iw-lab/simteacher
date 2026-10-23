#!/usr/bin/env node
// 문의 탭 방명록 — 답글이 달린 쪽지는 처음부터 펼쳐져 답글이 보인다(2026-10-23 «내가 댓글을 달면 기본 펼치기»).
//   답글 있는 쪽지 = 펼쳐진 답글 목록이 보인다 · 쓰는 칸(textarea)은 접혀 있다 · 답글 없는 쪽지 = «답글» 단추만
// 쓰기: node tools/check-note-replies.mjs <주소>   (종료코드 0 통과 · 1 실패 · 2 답글 달린 쪽지가 없어 못 봄)
import { createRequire } from 'node:module'
import os from 'node:os'
const puppeteer = createRequire(os.homedir() + '/.claude/skills/game-builder/')('puppeteer')
const base = (process.argv[2] || 'http://localhost:4177/').replace(/\/$/, '')
const b = await puppeteer.launch({ headless: 'new' })
const p = await b.newPage()
await p.setViewport({ width: 1280, height: 1200 })
await p.goto(base + '/contact/', { waitUntil: 'networkidle2' })
await new Promise((r) => setTimeout(r, 4000))
const r = await p.evaluate(() => {
  const lists = [...document.querySelectorAll('[data-testid=note-replies]')].filter((u) => u.querySelector('li'))
  return {
    openLists: lists.length,
    textareasInOpen: lists.filter((u) => u.parentElement.querySelector('textarea')).length,
    replyButtons: [...document.querySelectorAll('button')].filter((x) => x.textContent.trim() === '답글').length,
  }
})
await b.close()
console.log(`펼쳐진 답글 목록 ${r.openLists} · 그중 쓰는 칸까지 열린 것 ${r.textareasInOpen} · 답글 단추 ${r.replyButtons}`)
if (!r.openLists && !r.replyButtons) { console.log('못 봄: 쪽지가 없다'); process.exit(2) }
const fails = []
if (!r.openLists) fails.push('답글이 달린 쪽지가 펼쳐져 있지 않다')
if (r.textareasInOpen) fails.push('저절로 펼친 쪽지에 쓰는 칸까지 열려 있다')
console.log(fails.length ? `FAIL\n- ${fails.join('\n- ')}` : 'PASS')
process.exit(fails.length ? 1 : 0)
