// 카드용 작은 그림 — 첫 화면 카드는 화면에 40~380px 로 보이는데 원본(1200×750, 150~260KB)을 그대로 받았다.
//   2026-11-08 «파이어베이스 쓸데없는 요금 몇천원»: Hosting 전송 24GB/30일(₩3,182) — 새 방문자 1명이 첫 1분에 그림 72장 9MB.
//   x.webp → x.thumb.webp(폭 640 · 품질 72). 같은 폴더라 img-versions 가 해시를 붙인다. 원본은 포트폴리오 상세에 그대로 쓴다.
//   node tools/img-thumbs.mjs          → 없거나 원본보다 오래된 것만 만든다(prebuild)
//   node tools/img-thumbs.mjs --check  → 원본마다 작은 그림이 있고 원본보다 작아야 통과(rc 1)
import sharp from 'sharp'
import { readdirSync, statSync, existsSync } from 'node:fs'
import { join } from 'node:path'
const DIR = 'public/images/portfolio', W = 640, Q = 72
const srcs = readdirSync(DIR).filter((f) => /\.(webp|png|jpe?g)$/.test(f) && !f.includes('.thumb.'))
const thumbOf = (f) => f.replace(/\.(webp|png|jpe?g)$/, '.thumb.webp')
if (process.argv.includes('--check')) {
  const bad = srcs.filter((f) => { const t = join(DIR, thumbOf(f)); return !existsSync(t) || statSync(t).size >= statSync(join(DIR, f)).size })
  if (bad.length) { console.error(`img-thumbs FAIL — 작은 그림 없음/원본보다 큼 ${bad.length}개: ${bad.slice(0, 8).join(', ')}`); process.exit(1) }
  console.log(`img-thumbs PASS — ${srcs.length}개`)
} else {
  let made = 0
  for (const f of srcs) {
    const s = join(DIR, f), t = join(DIR, thumbOf(f))
    if (existsSync(t) && statSync(t).mtimeMs >= statSync(s).mtimeMs) continue
    await sharp(s).resize({ width: W, withoutEnlargement: true }).webp({ quality: Q }).toFile(t)
    made++
  }
  console.log(`img-thumbs: ${made}개 새로 만듦 · 전체 ${srcs.length}개`)
}
