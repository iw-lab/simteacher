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

const KST_MS = 9 * 60 * 60 * 1000
const DAY_MS = 24 * 60 * 60 * 1000
const kstDay = (ms: number) => new Date(ms + KST_MS).toISOString().slice(0, 10).replace(/-/g, '')

/** 최근 48시간 창 — 집계가 KST 하루 단위(clicksDaily)라 «오늘 전부 + 어제 전부 + 그제는 창에 걸친 만큼»으로 나눈다.
 *  예: 오늘 6시면 오늘 6시간 + 어제 24시간 + 그제 마지막 18시간(그제 수 × 18/24). */
export function window48(now = Date.now()): { day: string; weight: number }[] {
  const hoursToday = ((now + KST_MS) % DAY_MS) / (60 * 60 * 1000)
  return [
    { day: kstDay(now), weight: 1 },
    { day: kstDay(now - DAY_MS), weight: 1 },
    { day: kstDay(now - 2 * DAY_MS), weight: (24 - hoursToday) / 24 },
  ]
}

/** 날짜별 클릭 문서들 → slug 별 48시간 조회수(그제 몫은 반올림) */
export function sumWindow(
  rows: { date: string; slug: string; count: number }[],
  win: { day: string; weight: number }[]
): Record<string, number> {
  const w = new Map(win.map((x) => [x.day, x.weight]))
  const out: Record<string, number> = {}
  for (const r of rows) {
    const k = w.get(r.date)
    if (k === undefined) continue
    out[r.slug] = (out[r.slug] ?? 0) + r.count * k
  }
  for (const s in out) out[s] = Math.round(out[s])
  return out
}
