// 친구들의 작품(아트온 전시관) — 순수 함수. 화면은 components/home/ArtShowcase.tsx
//   아트온(~/Documents/dev/iwdraw) 교사가 «선행쌤 전시관에 걸기»로 고른 작품만 · 밖으로 나오는 건 id·건 때·좋아요 수뿐.
export const ARTON_ORIGIN = 'https://arton.simssijjang.workers.dev'

export interface ShowWork { id: string; at: number; likes: number }

/** 전시관 대답을 믿지 않는다 — id 모양이 틀린 줄은 버리고, 혹시 다른 칸이 와도 id·at·likes 만 남긴다 */
export function safeWorks(raw: unknown): ShowWork[] | null {
  const list = (raw as { works?: unknown } | null)?.works
  if (!Array.isArray(list)) return null
  return list
    .filter((w): w is ShowWork => !!w && typeof w.id === 'string' && /^[A-Za-z0-9_-]{6,64}$/.test(w.id))
    .map((w) => ({ id: w.id, at: Number(w.at) || 0, likes: Math.max(0, Number(w.likes) || 0) }))
}

/** 처음엔 섞어서 SHOW 개 · 다시 읽을 땐 새로 걸린 작품을 앞에 끼우고 나머지는 그 자리 그대로(1분마다 판이 뒤섞이지 않게) · 내려간 작품은 뺀다 */
export function mergeWorks(prev: ShowWork[] | null, now: ShowWork[], n: number): ShowWork[] {
  if (!prev) return shuffle(now).slice(0, n)
  const ids = new Set(now.map((x) => x.id)); const had = new Set(prev.map((x) => x.id))
  const fresh = now.filter((x) => !had.has(x.id)).sort((a, b) => b.at - a.at)
  const kept = prev.filter((x) => ids.has(x.id)).map((x) => now.find((y) => y.id === x.id)!)
  return [...fresh, ...kept].slice(0, n)
}

function shuffle<T>(a: T[]): T[] {
  const b = [...a]
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[b[i], b[j]] = [b[j], b[i]]
  }
  return b
}
