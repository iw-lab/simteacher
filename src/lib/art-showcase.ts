// 학생 작품(아트온 전시관) — 순수 함수. 화면은 components/home/ArtShowcase.tsx
//   아트온(~/Documents/dev/iwdraw) 교사가 «선행쌤 전시관에 걸기»로 고른 작품만 · 밖으로 나오는 건 id·건 때·하트 수·새 작품 표시뿐.
//   순서 = 아트온 서버가 정한다(이번 주 하트 순 + 걸린 지 3일 안 된 작품은 3칸마다 · 50위까지 · worker/lib/showcase-rank.ts)
export const ARTON_ORIGIN = 'https://arton.simssijjang.workers.dev'
export const SHOWCASE_MAX = 50

export interface ShowWork { id: string; at: number; likes: number; wk: number; fresh: boolean }

/** 전시관 대답을 믿지 않는다 — id 모양이 틀린 줄은 버리고, 혹시 다른 칸이 와도 정해진 칸만 남긴다 · 50위까지 */
export function safeWorks(raw: unknown): ShowWork[] | null {
  const list = (raw as { works?: unknown } | null)?.works
  if (!Array.isArray(list)) return null
  return list
    .filter((w): w is ShowWork => !!w && typeof w.id === 'string' && /^[A-Za-z0-9_-]{6,64}$/.test(w.id))
    .slice(0, SHOWCASE_MAX)
    .map((w) => ({ id: w.id, at: Number(w.at) || 0, likes: Math.max(0, Number(w.likes) || 0), wk: Math.max(0, Number(w.wk) || 0), fresh: w.fresh === true }))
}

/** 기기 번호 — 하트 중복 막기용 무작위 32자(사람 정보 0 · 서버는 해시만 남긴다) */
export function deviceId(store: Pick<Storage, 'getItem' | 'setItem'>, rand: () => number = Math.random): string {
  const k = 'ssam.did'
  const old = store.getItem(k)
  if (old && /^[0-9a-f]{32}$/.test(old)) return old
  const id = Array.from({ length: 32 }, () => Math.floor(rand() * 16).toString(16)).join('')
  store.setItem(k, id)
  return id
}
