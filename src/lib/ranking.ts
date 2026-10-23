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

/** 음악감상실 인기 순위 — 최근 48시간 재생 수, 같으면 누적, 그래도 같으면 새로 올린 곡이 앞.
 *  한 번도 재생 안 된 곡은 순위에 넣지 않는다(0회끼리 줄 세우면 순위가 아니라 목록이다). */
export function rankSongs<T extends { id: string }>(
  songs: T[],
  recent: Record<string, number>,
  total: Record<string, number>,
  added: Record<string, string>
): (T & { rank: number; recent: number; total: number })[] {
  return songs
    .map((s) => ({ ...s, recent: recent[s.id] ?? 0, total: total[s.id] ?? 0 }))
    .filter((s) => s.recent > 0 || s.total > 0)
    .sort((a, b) => b.recent - a.recent || b.total - a.total || (added[b.id] ?? '').localeCompare(added[a.id] ?? ''))
    .map((s, i) => ({ ...s, rank: i + 1 }))
}

/** 곡을 올린 순서(가장 최근이 맨 앞) — 올린 때를 모르는 곡은 맨 뒤, 그 안에서는 원래 순서 */
export function songsNewestFirst<T extends { id: string }>(songs: T[], added: Record<string, string>): T[] {
  return songs
    .map((s, i) => ({ s, i }))
    .sort((a, b) => (added[b.s.id] ?? '').localeCompare(added[a.s.id] ?? '') || a.i - b.i)
    .map((x) => x.s)
}

/** 곡 담기/빼기 — 담으면 맨 뒤에 붙는다 */
export function toggleId(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]
}

/** 다음 곡 자리 — 줄 끝에서 처음으로 돌아간다(그 목록만 계속 반복) */
export function nextIndex(len: number, i: number, dir: 1 | -1): number {
  return len === 0 ? -1 : (i + dir + len) % len
}
