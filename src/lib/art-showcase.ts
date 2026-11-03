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
