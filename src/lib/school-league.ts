// 학교 대항전 — 순수 함수(시험이 바로 부른다). 화면은 components/home/SchoolLeague.tsx
//   2026-11-03 사용자 «게임마다 학교별 랭킹을 적절하게 잘 표시 · 경쟁심을 자극할 만하게».
//   판은 ssam-ranks 워커(~/Documents/dev/ssam-ranks)가 10분마다 게임별 학교 허브를 모은 것.

export const RANKS_URL = 'https://ssam-ranks.simssijjang-korea.workers.dev/ranks'
/** 기기에 저장하는 «우리 학교»(학교 코드·이름만 — 서버로 안 보낸다) */
export const MY_SCHOOL_KEY = 'ssam.school'

export interface Row { c: string; n: string; r: string; s: number }
export interface GameBoard {
  slug: string
  at: number
  today: Row[]
  week: Row[]
  st: { schools: number; today: number; playsToday: number; plays: number }
}
export interface Medal { c: string; n: string; r: string; g: number; sv: number; b: number; w: string[] }
export interface Board {
  at: number
  games: GameBoard[]
  medals: Medal[]
  total: { games: number; schools: number; today: number; playsToday: number }
}
export type Span = 'week' | 'today'
export interface MySchool { c: string; n: string; r: string }

/** 워커 대답을 믿지 않는다 — 모양이 틀리면 null(화면은 칸째로 숨는다) */
export function safeBoard(raw: unknown): Board | null {
  const b = raw as Board | null
  if (!b || !Array.isArray(b.games) || !Array.isArray(b.medals) || !b.total) return null
  const row = (x: Row) => x && typeof x.c === 'string' && typeof x.n === 'string' && Number.isFinite(x.s)
  const games = b.games.filter((g) => g && typeof g.slug === 'string' && Array.isArray(g.today) && Array.isArray(g.week) && g.st)
    .map((g) => ({ ...g, today: g.today.filter(row), week: g.week.filter(row) }))
  return games.length ? { ...b, games } : null
}

/** 게임 하나의 그 기간 1위와 2위와의 차 — 점수가 0이면 1위가 아니다 */
export function leader(g: GameBoard, span: Span): { top: Row; gap: number | null } | null {
  const l = g[span]
  if (!l.length || !l[0].s) return null
  return { top: l[0], gap: l[1] ? l[0].s - l[1].s : null }
}

/** «우리 학교»가 판에 오른 자리 — 게임마다 이번 주·오늘 순위(없으면 null) · 순위 높은 게임이 앞 */
export function mySpots(b: Board, code: string): { slug: string; week: number | null; today: number | null; behind: number | null }[] {
  const at = (l: Row[]) => { const i = l.findIndex((x) => x.c === code); return i < 0 ? null : i + 1 }
  return b.games
    .map((g) => {
      const w = at(g.week)
      // 바로 위 학교와 몇 점 차인지 — «조금만 더» 가 경쟁심을 건드린다
      const behind = w && w > 1 ? g.week[w - 2].s - g.week[w - 1].s : null
      return { slug: g.slug, week: w, today: at(g.today), behind }
    })
    .filter((x) => x.week !== null || x.today !== null)
    .sort((a, b) => (a.week ?? 99) - (b.week ?? 99) || (a.today ?? 99) - (b.today ?? 99))
}

/** 판에 오른 학교 찾기 — 띄어 쓴 낱말이 다 이름이나 시도에 들어 있으면(«김제 중앙» · «중앙초») · 최대 8곳 */
export function findSchools(b: Board, q: string): MySchool[] {
  const words = q.trim().split(/\s+/).filter(Boolean)
  if (!words.length) return []
  const seen = new Map<string, MySchool>()
  for (const g of b.games) for (const x of [...g.week, ...g.today]) if (!seen.has(x.c)) seen.set(x.c, { c: x.c, n: x.n, r: x.r })
  for (const m of b.medals) if (!seen.has(m.c)) seen.set(m.c, { c: m.c, n: m.n, r: m.r })
  return [...seen.values()].filter((s) => words.every((w) => s.n.includes(w) || s.r.includes(w))).sort((a, b) => a.n.localeCompare(b.n, 'ko')).slice(0, 8)
}

export function readMySchool(raw: string | null): MySchool | null {
  try {
    const v = raw ? JSON.parse(raw) : null
    return v && typeof v.c === 'string' && /^\d{7,10}$/.test(v.c) && typeof v.n === 'string' ? { c: v.c, n: v.n.slice(0, 30), r: String(v.r ?? '').slice(0, 4) } : null
  } catch {
    return null
  }
}

let once: Promise<Board | null> | null = null
/** 한 화면에서 여러 칸(판·게임 카드 띠)이 불러도 요청은 한 번 */
export function fetchBoard(): Promise<Board | null> {
  once ??= fetch(RANKS_URL)
    .then((r) => (r.ok ? r.json() : null))
    .then(safeBoard)
    .catch(() => null)
  return once
}

/** 학교 종합(메달) 순위 자리 — 판에 없으면 null */
export function medalRank(b: Board, code: string): number | null {
  const i = b.medals.findIndex((m) => m.c === code)
  return i < 0 ? null : i + 1
}
