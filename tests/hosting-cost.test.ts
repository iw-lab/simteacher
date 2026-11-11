// 🔒 Firebase Hosting 전송 무료 한도(하루 360MB)를 넘지 않게 — 그림은 Cloudflare Pages 문(ssam-img.pages.dev)에서 받는다.
// 2026-11-11 «50% of budget reached»(madchumbub 예산 ₩5,000) · 사용자 «파이어베이스 돈 안 나가게».
// 썸네일 처방 뒤에도 방문당 web.app 전송 2.4MB 중 그림 1.9MB → 하루 ~650MB(유료). tools/deploy-img-door.sh
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

const fb = JSON.parse(readFileSync('firebase.json', 'utf8'))
const main = fb.hosting.find((h: { target: string }) => h.target === 'main')

describe('Hosting 비용 — 그림은 Cloudflare 문으로', () => {
  it('web.app 의 /images/** 는 ssam-img.pages.dev 로 넘긴다', () => {
    const r = (main.redirects ?? []).find((x: { source: string }) => x.source.startsWith('/images/'))
    expect(r, 'firebase.json main.redirects 에 /images/** 넘김이 없다').toBeTruthy()
    expect(r.destination).toMatch(/^https:\/\/ssam-img\.pages\.dev\/images\//)
  })
  it('두 문 배포가 그림 문을 먼저 올린다(넘긴 곳에 그림이 없으면 깨진다)', () => {
    const s = readFileSync('tools/deploy-mirror.sh', 'utf8')
    const img = s.indexOf('deploy-img-door.sh'), fire = s.indexOf('firebase-tools')
    expect(img, 'deploy-mirror.sh 가 deploy-img-door.sh 를 안 부른다').toBeGreaterThan(-1)
    expect(img).toBeLessThan(fire)
  })
})
