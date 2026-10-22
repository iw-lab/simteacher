// 홈 맨 위 인기 순위·그 아래 새로 올린 순서 — 둘 다 순수 함수로 두어 시험한다(tests/ranking.test.ts).

/** 누적 클릭 수 순서로 전부 세운다. 한 번도 안 눌린 곳도 빠지지 않고 맨 뒤에 선다
 *  (같은 수끼리는 새로 올린 곳이 앞). 1등부터 마지막까지가 한 줄이다. */
export function rankByClicks<T extends { slug: string; added?: string }>(
  sites: T[],
  counts: Record<string, number>
): (T & { rank: number; count: number })[] {
  return sites
    .map((s) => ({ ...s, count: counts[s.slug] ?? 0 }))
    .sort((a, b) => b.count - a.count || (b.added ?? '').localeCompare(a.added ?? ''))
    .map((s, i) => ({ ...s, rank: i + 1 }))
}

/** 새로 올린 순서(가장 최근이 맨 앞) */
export function newestFirst<T extends { added: string }>(sites: T[]): T[] {
  return [...sites].sort((a, b) => b.added.localeCompare(a.added))
}
