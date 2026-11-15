// 선행쌤 → 게임 «내 티어 코드» 넘기기(2026-11-15 사용자 «학교에서 한 티어가 집에서도 이어지도록»).
// 선행쌤에서 코드를 한 번 넣어 두면, 여기서 여는 게임 링크에 #gbt=코드 를 붙인다 — 게임 키트(gb-tier.js)가 받아 잇고 주소에서 지운다.
// 해시(#)는 서버로 가지 않는다(게임 서버 기록·리퍼러에 코드가 안 남는다). 정본 규칙 = src/lib/gb-tier-core.js(키트 사본 · tests/tier-link.test.ts 가 같은지 본다)
import { codeOk } from './gb-tier-core.js'
import { SSAM_HOSTS } from './via-ssam'

export const TIER_KEY = 'gb.tier'
export const TIER_URL = 'https://ssam-tier.simssijjang-korea.workers.dev'

export function myTierCode(store: Pick<Storage, 'getItem'> | null = typeof localStorage === 'undefined' ? null : localStorage): string {
  try { const c = JSON.parse(store?.getItem(TIER_KEY) || '{}')?.code; return codeOk(c) ? c : '' } catch { return '' }
}
/** 게임 링크에 코드를 붙인 주소 — 선행쌤 안 주소·https 아님·코드 없음이면 그대로 */
export function withTier(href: string, code: string): string {
  if (!codeOk(code)) return href
  try {
    const u = new URL(href)
    if (u.protocol !== 'https:' || SSAM_HOSTS.includes(u.hostname)) return href
    const h = new URLSearchParams(u.hash.slice(1)); h.set('gbt', code)
    u.hash = h.toString()
    return u.toString()
  } catch { return href }
}
