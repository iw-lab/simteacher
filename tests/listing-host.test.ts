// 게임 목록에 Vercel 주소가 남으면 안 된다 — 호스트 정본 = Cloudflare korea Pages
// (2026-11-09 사용자 «보카웜디펜스는 왜 버셀? 클라우드플레어로 옮겨» · 11개 이사). 예외는 그 줄에 gb-host-ok <사유>.
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

export function vercelHits(text: string): string[] {
  return text.split('\n').flatMap((line, i) =>
    line.includes('gb-host-ok') ? [] : [...line.matchAll(/https?:\/\/[a-z0-9-]+\.vercel\.app\b/gi)].map((m) => `${i + 1}: ${m[0]}`))
}

describe('listing host', () => {
  it('projects.ts 에 vercel.app 주소 0', () => {
    expect(vercelHits(readFileSync('src/data/projects.ts', 'utf8'))).toEqual([])
  })
  it('검사기가 vercel 주소를 잡는다(빨강 시험)', () => {
    expect(vercelHits("    url: 'https://vocaworm-defense.vercel.app/',")).toHaveLength(1)
    expect(vercelHits("    url: 'https://vocaworm-defense.pages.dev/',")).toHaveLength(0)
  })
})
