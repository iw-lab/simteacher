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
      return u.protocol === 'https:' && (!listed || new URL(listed).host === u.host)
    } catch {
      return false
    }
  })
}
