// 지금 열린 온라인 방 — 순수 함수(시험이 바로 부른다). 화면은 components/community/LiveRooms.tsx
/** 방 게시판(~/Documents/dev/room-board) — 게임 방장 화면이 알린 «기다리는 중 + 자리 남은» 방 */
export const ROOM_BOARD = 'https://room-board.simssijjang-korea.workers.dev'
/** 목록을 다시 읽는 간격 — 화면이 보일 때만. 서버비 원칙(15초 미만 폴링 금지) · 게시판도 10초 공유 캐시 */
export const ROOMS_POLL_MS = 20_000

export interface LiveRoom {
  g: string
  title: string
  code: string
  n: number
  max: number
  url: string
  since: number
  /** 'play' = 판이 시작됐지만 중간에 들어갈 수 있는 방(게시판 games.js late) · 없으면 기다리는 방 */
  st?: 'wait' | 'play'
}

/** 게시판 응답을 믿지 않는다 — 들어가는 주소는 https 이고, 등재된 게임이면 등재 주소와 같은 호스트여야 한다.
 *  listedUrl(slug) = 선행쌤에 등재된 그 게임 주소(없으면 undefined) */
export function safeRooms(raw: unknown, listedUrl: (slug: string) => string | undefined): LiveRoom[] {
  const list = (raw as { rooms?: unknown } | null)?.rooms
  if (!Array.isArray(list)) return []
  return list.filter((r): r is LiveRoom => {
    if (!r || typeof r.g !== 'string' || typeof r.code !== 'string' || typeof r.url !== 'string') return false
    try {
      const u = new URL(r.url)
      const listed = listedUrl(r.g)
      // 🔴 등재된 게임만 — 목록에서 뺀 게임(끝까지 진화: 학교 망이 막아 10-26 내림)의 방이 썸네일 없이 떴다(2026-11-04)
      return u.protocol === 'https:' && !!listed && new URL(listed).host === u.host
    } catch {
      return false
    }
  })
}

/** 열린 세계 게임(방 코드 없이 채널에 모이는 멀티 — 게시판 games.js WORLDS) · 2026-11-09 «별빛 용사단은 한 명이라도 있으면 표시되지?» */
export interface LiveWorld {
  g: string
  title: string
  n: number
  /** 선행쌤 등재 주소(게시판이 준 주소는 쓰지 않는다) — 누르면 게임 첫 화면 */
  url: string
}

/** 게시판의 열린 세계 목록 — 등재된 게임만, 한 명 이상, 주소는 등재 주소로 바꿔 끼운다 */
export function safeWorlds(raw: unknown, listedUrl: (slug: string) => string | undefined): LiveWorld[] {
  const list = (raw as { worlds?: unknown } | null)?.worlds
  if (!Array.isArray(list)) return []
  const out: LiveWorld[] = []
  for (const w of list) {
    if (!w || typeof w.g !== 'string' || typeof w.title !== 'string') continue
    const n = Math.floor(Number(w.n))
    const listed = listedUrl(w.g)
    if (!listed || !Number.isFinite(n) || n < 1) continue
    try { if (new URL(listed).protocol !== 'https:') continue } catch { continue }
    out.push({ g: w.g, title: w.title, n: Math.min(n, 999), url: listed })
  }
  return out
}

/** 선행쌤에서 바로 방을 여는 게임 — 2026-11-04 사용자 «게임에 안 들어가고도 방을 만들 수 있게».
 *  방은 방장 화면이 살아 있는 동안만 유지되므로(게시판 TTL 2분) 눌러서 게임의 대기실로 곧장 간다.
 *  🔴 여기 넣기 전에 그 게임이 ?make=1 을 처리해야 한다 — tests/board-listed.test.ts 가 게시판 전체와 대조 */
export const MAKE_ROOM_GAMES = [
  'kkeutjinhwa', 'gulp-planet', 'parabola-crew', 'reloadarena', 'racket-rush', 'schoolstars',
  'blocknuri', 'dokkaebi-circuit', 'sullae', 'malkkori', 'kkeut-bomb', 'dawnlight', 'dalmajung', 'kongkong', 'golden-whistle',
] as const

/** 게임 주소 → 곧장 방을 만드는 주소(?make=1) */
export function makeRoomUrl(url: string): string {
  const u = new URL(url)
  u.searchParams.set('make', '1')
  return u.toString()
}

/** 방 칸의 작은 글씨 — 진행 중(중간 입장) 방은 기다린 시간 대신 «게임 중» */
export function roomStatus(r: Pick<LiveRoom, 'st' | 'since'>, now: number): string {
  if (r.st === 'play') return '게임 중 · 중간 입장'
  const m = Math.max(0, Math.floor((now - r.since) / 60_000))
  return m < 1 ? '방금 열림' : `${m}분째 기다림`
}
