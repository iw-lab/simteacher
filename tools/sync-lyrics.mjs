// 음악감상실 가사 — 비트:온 저장소(~/Documents/dev/music/songs/<id>/lyrics.txt)에서 모아 public/music/lyrics.json 으로 굽는다.
// 곡 목록·음원은 배포된 비트:온(beaton-evo.pages.dev/songs/index.json)에서 방문 때 읽으니 새 곡은 저절로 뜬다.
// 가사만 여기 사본이라 노래를 새로 넣으면 이걸 다시 돌린다(prebuild 가 원본이 있으면 자동으로 돈다).
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'

const SRC = process.env.MUSIC_SONGS ?? join(homedir(), 'Documents/dev/music/songs')
const OUT = new URL('../public/music/lyrics.json', import.meta.url)

if (!existsSync(SRC)) {
  console.log(`sync-lyrics: 원본 없음(${SRC}) — 커밋된 사본을 그대로 쓴다`)
  process.exit(0)
}
const out = {}
for (const id of readdirSync(SRC).sort()) {
  const p = join(SRC, id, 'lyrics.txt')
  if (!existsSync(p)) continue
  const text = readFileSync(p, 'utf8').replace(/\r/g, '').trim()
  // [Verse] 같은 구간 표시만 있고 부르는 줄이 2줄 미만이면 가사 없는 곡으로 본다
  const sung = text.split('\n').filter((l) => l.trim() && !/^\s*\[.*\]\s*$/.test(l))
  if (sung.length >= 2) out[id] = text
}
writeFileSync(OUT, JSON.stringify(out))
console.log(`sync-lyrics: 가사 ${Object.keys(out).length}곡 → public/music/lyrics.json`)
