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
      return { top: box.top, bottom: box.bottom, ih: innerHeight, sw: document.documentElement.scrollWidth, iw: innerWidth, href: a.href, target: a.target }
    }, code)
    if (!(m.top >= 0 && m.top < m.ih - 60)) fails.push(`${w}: 칸이 첫 화면 밖(top ${Math.round(m.top)} / ${m.ih})`)
    if (m.sw > m.iw) fails.push(`${w}: 가로 스크롤 ${m.sw} > ${m.iw}`)
    if (m.href !== `${GAME.origin}/?room=${code}`) fails.push(`${w}: 들어가기 주소 ${m.href}`)
    if (m.target !== '_blank') fails.push(`${w}: 새 탭이 아니다`)
    console.log(`  ${w}px: 칸 top ${Math.round(m.top)} · ${m.href}`)
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
