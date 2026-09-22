// 공개 방명록 + 방문자/클릭 카운터.
// 정적 사이트(next export)라 서버가 없다 — 전부 브라우저에서 Firestore 로 직접 읽고 쓴다.
// 그래서 "무엇을 쓸 수 있는가"의 진짜 경계선은 firestore.rules 다. 이 파일은 편의 계층일 뿐,
// 여기서 막는 것(길이·쿨다운)은 규칙에서도 한 번 더 막혀 있어야 한다.
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  writeBatch,
  where,
  type Unsubscribe,
} from 'firebase/firestore'
import { getDb, ensureUid, isOwnerSignedIn } from './firebase'

// ── 방명록 ──────────────────────────────────────────────────────────────────

export interface GuestbookEntry {
  id: string
  nickname: string
  message: string
  color: string
  uid: string
  createdAt: number | null
}

export const NICKNAME_MAX = 20
export const MESSAGE_MAX = 500
/** 포스트잇 색. 규칙에서도 이 목록만 허용한다. */
export const NOTE_COLORS = ['yellow', 'mint', 'sky', 'pink', 'lilac'] as const
export type NoteColor = (typeof NOTE_COLORS)[number]

const COOLDOWN_MS = 30_000
const COOLDOWN_KEY = 'simteacher:guestbook:lastPost'

export function cooldownLeftMs(): number {
  if (typeof window === 'undefined') return 0
  const last = Number(window.localStorage.getItem(COOLDOWN_KEY) ?? 0)
  return Math.max(0, COOLDOWN_MS - (Date.now() - last))
}

function markPosted() {
  try {
    window.localStorage.setItem(COOLDOWN_KEY, String(Date.now()))
  } catch {
    /* 저장 실패는 무시 — 쿨다운은 편의 기능이다 */
  }
}

/** 최신 글부터 구독. 컴포넌트 언마운트 시 반환값을 호출해 끊는다. */
export function subscribeGuestbook(
  onData: (entries: GuestbookEntry[]) => void,
  onError: (e: unknown) => void,
  max = 100
): Unsubscribe {
  const q = query(
    collection(getDb(), 'guestbook'),
    orderBy('createdAt', 'desc'),
    limit(max)
  )
  return onSnapshot(
    q,
    (snap) => {
      onData(
        snap.docs.map((d) => {
          const v = d.data()
          const ts = v.createdAt
          return {
            id: d.id,
            nickname: String(v.nickname ?? ''),
            message: String(v.message ?? ''),
            color: String(v.color ?? 'yellow'),
            uid: String(v.uid ?? ''),
            createdAt: ts instanceof Timestamp ? ts.toMillis() : null,
          }
        })
      )
    },
    onError
  )
}

export async function postGuestbook(input: {
  nickname: string
  message: string
  color: NoteColor
}): Promise<string> {
  const nickname = input.nickname.trim().slice(0, NICKNAME_MAX)
  const message = input.message.trim().slice(0, MESSAGE_MAX)
  if (!message) throw new Error('내용을 적어주세요.')
  if (cooldownLeftMs() > 0) throw new Error('조금 전에 남기셨어요. 30초 뒤에 다시 시도해주세요.')

  const uid = await ensureUid()
  const ref = await addDoc(collection(getDb(), 'guestbook'), {
    nickname: nickname || '익명의 선생님',
    message,
    color: input.color,
    uid,
    createdAt: serverTimestamp(),
  })
  markPosted()
  return ref.id
}

/** 본인 글만 삭제된다(규칙이 uid 를 검사). 남의 글이면 권한 오류가 난다. */
export async function deleteGuestbook(id: string): Promise<void> {
  await ensureUid()
  await deleteDoc(doc(getDb(), 'guestbook', id))
}

/** 내 브라우저의 익명 uid — 내 글에만 삭제 버튼을 보여주려고 쓴다. */
export async function myUid(): Promise<string> {
  return ensureUid()
}

// ── 방문자 수 ───────────────────────────────────────────────────────────────

export function todayKey(d = new Date()): string {
  // KST 고정 — 방문자 통계는 한국 날짜 기준이어야 자정에 맞춰 초기화된다.
  const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000)
  return kst.toISOString().slice(0, 10).replace(/-/g, '')
}

export interface VisitCounts {
  today: number
  total: number
}

const VISIT_KEY = 'simteacher:visited'

/**
 * 방문 1회 기록. 같은 브라우저는 하루 한 번만 센다(localStorage 기준).
 * 정확한 UV 가 아니라 "하루에 몇 대의 브라우저가 왔나"의 근사치다.
 */
export async function recordVisit(): Promise<void> {
  const day = todayKey()
  try {
    if (window.localStorage.getItem(VISIT_KEY) === day) return
  } catch {
    return // 저장이 안 되는 브라우저면 중복 집계를 막을 수 없으니 아예 세지 않는다
  }

  const db = getDb()
  await Promise.all([
    setDoc(doc(db, 'stats', `d_${day}`), { count: increment(1) }, { merge: true }),
    setDoc(doc(db, 'stats', 'total'), { count: increment(1) }, { merge: true }),
  ])

  // 쓰기가 성공한 뒤에 표시한다. 먼저 표시해 버리면 규칙 거절·네트워크 실패로 못 센 방문이
  // "이미 셌다"로 남아 그날은 영영 재시도되지 않는다(배포 직전 방문에서 실제로 겪었다).
  try {
    window.localStorage.setItem(VISIT_KEY, day)
  } catch {
    /* 여기까지 왔으면 집계는 이미 됐다 */
  }
}

export async function fetchVisitCounts(): Promise<VisitCounts> {
  const db = getDb()
  const [t, all] = await Promise.all([
    getDoc(doc(db, 'stats', `d_${todayKey()}`)),
    getDoc(doc(db, 'stats', 'total')),
  ])
  return {
    today: Number(t.data()?.count ?? 0),
    total: Number(all.data()?.count ?? 0),
  }
}

// ── 인기 클릭 ───────────────────────────────────────────────────────────────

export interface PopularItem {
  slug: string
  name: string
  count: number
}

/** 카드 클릭 1회 기록. 실패해도 사용자 흐름을 막지 않는다(링크는 그대로 열린다). */
export function recordClick(slug: string, rawName: string): void {
  // 규칙이 name 60자를 넘기면 거절한다 — 여기서 미리 자른다.
  const name = rawName.slice(0, 60)
  const day = todayKey()
  const db = getDb()
  void Promise.all([
    setDoc(
      doc(db, 'clicksDaily', `${day}__${slug}`),
      { date: day, slug, name, count: increment(1) },
      { merge: true }
    ),
    setDoc(doc(db, 'clicks', slug), { slug, name, count: increment(1) }, { merge: true }),
  ]).catch(() => {
    /* 통계 실패는 조용히 무시 */
  })
}

/**
 * 오늘의 인기 Top N. 오늘 데이터가 아직 얼마 없으면(이른 아침) 전체 인기로 넘어간다.
 * 반환값의 scope 로 어느 쪽인지 알려주니, 화면 제목도 그에 맞춰 바뀌어야 한다.
 */
export async function fetchPopular(
  n = 5
): Promise<{ scope: 'today' | 'all'; items: PopularItem[] }> {
  const db = getDb()
  const toItems = (
    docs: { data: () => Record<string, unknown> }[]
  ): PopularItem[] =>
    docs.map((d) => ({
      slug: String(d.data().slug ?? ''),
      name: String(d.data().name ?? ''),
      count: Number(d.data().count ?? 0),
    }))

  const todaySnap = await getDocs(
    query(
      collection(db, 'clicksDaily'),
      where('date', '==', todayKey()),
      orderBy('count', 'desc'),
      limit(n)
    )
  )
  const today = toItems(todaySnap.docs)
  if (today.length >= 3) return { scope: 'today', items: today }

  const allSnap = await getDocs(
    query(collection(db, 'clicks'), orderBy('count', 'desc'), limit(n))
  )
  return { scope: 'all', items: toItems(allSnap.docs) }
}

// ── 글별 댓글 ───────────────────────────────────────────────────────────────
// 방명록과 같은 계약에서 출발하되, 교차검증에서 잡힌 세 가지를 고쳤다.
//
// ① **댓글 문서에 uid 를 두지 않는다.** 두면 「익명」으로 쓴 글과 이름을 적은 글이 같은 uid 로
//    묶여 누구나 대조만으로 익명 작성자를 특정할 수 있다. 소유권은 commentOwners 에 따로 두고
//    그 문서는 본인만 읽는다. 삭제 권한은 규칙이 그 문서를 열어 검사한다.
// ② **최신순으로 읽고 화면에서 뒤집는다.** 오래된 순 + limit 이면 댓글이 상한을 넘는 순간
//    새 댓글이 영원히 화면에 안 나온다(구독 결과가 옛 200개에 고정된다).
// ③ localStorage 는 읽기도 막힐 수 있다(사파리 프라이빗 등). 읽기·쓰기 전부 감싼다.
//
// ⚠️ 남은 한계: 30초 쿨다운은 **이 브라우저의 편의**일 뿐 서버 강제가 아니다. SDK 를 직접 부르면
//    우회된다. Firestore 규칙만으로는 이걸 못 막는다(규칙은 같은 배치 안의 다른 쓰기를 못 본다).
//    진짜 방어는 Firebase App Check 이고, 그건 콘솔 설정이 필요하다.

export interface Comment {
  id: string
  slug: string
  nickname: string
  message: string
  createdAt: number | null
  /** 무엇에 대한 답인가. 최상위면 null. 방명록 쪽지 id 또는 최상위 댓글 id. */
  parentId: string | null
  /** 주인(심쌤)이 단 답변인가. 규칙이 강제하므로 위조할 수 없다. */
  isOwner: boolean
}

/**
 * 방명록 답글이 쓰는 예약 slug. 🔴 **여기 한 곳에만 둔다** — 규칙(firestore.rules)과
 * 짝이라, 주석으로만 적어 두면 갈린다. 규칙은 이 칸에 parentId 없는 글을 허용하지 않는다.
 */
export const GUESTBOOK_SLUG = 'guestbook'

export const COMMENT_MAX = 1000
export const COMMENT_NICK_MAX = 20
export const COMMENT_PAGE = 200

const C_COOLDOWN_MS = 30_000
const C_COOLDOWN_KEY = 'simteacher:comments:lastPost'
const C_MINE_KEY = 'simteacher:comments:mine'

function readLS(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null // 저장소가 아예 막힌 브라우저 — 없는 것으로 다룬다
  }
}
function writeLS(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    /* 무시 */
  }
}

export function commentCooldownLeftMs(): number {
  if (typeof window === 'undefined') return 0
  const last = Number(readLS(C_COOLDOWN_KEY) ?? 0)
  return Math.max(0, C_COOLDOWN_MS - (Date.now() - last))
}

/** 내가 쓴 댓글 id — 삭제 버튼을 «보여줄지» 정하는 데만 쓴다. 실제 권한은 규칙이 판단한다. */
export function myCommentIds(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = readLS(C_MINE_KEY)
    const arr = raw ? (JSON.parse(raw) as unknown) : []
    return Array.isArray(arr) ? arr.filter((v): v is string => typeof v === 'string') : []
  } catch {
    return []
  }
}
function rememberMine(id: string) {
  const next = [...myCommentIds(), id].slice(-300)
  writeLS(C_MINE_KEY, JSON.stringify(next))
}
function forgetMine(id: string) {
  writeLS(C_MINE_KEY, JSON.stringify(myCommentIds().filter((v) => v !== id)))
}

/**
 * 최신순으로 구독하고, 화면에 줄 때 시간순으로 뒤집는다.
 * 오래된 순 + limit 으로 구독하면 댓글이 상한을 넘는 순간 새 댓글이 결과에서 빠진다.
 */
export function subscribeComments(
  slug: string,
  onData: (rows: Comment[]) => void,
  onError: (e: unknown) => void,
  max = COMMENT_PAGE
): Unsubscribe {
  const q = query(
    collection(getDb(), 'comments'),
    where('slug', '==', slug),
    orderBy('createdAt', 'desc'),
    limit(max)
  )
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map((d) => {
        const v = d.data()
        const ts = v.createdAt
        return {
          id: d.id,
          slug: String(v.slug ?? ''),
          nickname: String(v.nickname ?? ''),
          message: String(v.message ?? ''),
          createdAt: ts instanceof Timestamp ? ts.toMillis() : null,
          parentId: typeof v.parentId === 'string' ? v.parentId : null,
          // 🔴 truthy 검사 금지 — 반드시 === true. 배지는 신뢰 신호다.
          isOwner: v.owner === true,
        }
      })
      onData(rows.reverse()) // 화면은 위에서 아래로 시간순
    },
    onError
  )
}

/**
 * 쪽지 하나에 달린 답글만 구독한다.
 *
 * 🔴 방명록 답글 전부를 `slug=='guestbook'` 한 칸으로 구독하면 안 된다 — 답글이 200 을 넘는
 *    순간 **오래된 쪽지의 답글이 조용히 사라진다**(규칙의 list 상한 200 은 클라이언트가 못 늘린다).
 *    8way 교차검증에서 4계열 전원이 같은 지적을 했다. 그래서 «부모별»로 나눠 구독하고,
 *    쪽지의 답글은 **펼칠 때만** 읽는다(안 펼치면 읽기 0).
 */
export function subscribeReplies(
  slug: string,
  parentId: string,
  onData: (rows: Comment[]) => void,
  onError: (e: unknown) => void,
  max = COMMENT_PAGE
): Unsubscribe {
  const q = query(
    collection(getDb(), 'comments'),
    where('slug', '==', slug),
    where('parentId', '==', parentId),
    orderBy('createdAt', 'asc'),
    limit(max)
  )
  return onSnapshot(
    q,
    (snap) =>
      onData(
        snap.docs.map((d) => {
          const v = d.data()
          const ts = v.createdAt
          return {
            id: d.id,
            slug: String(v.slug ?? ''),
            nickname: String(v.nickname ?? ''),
            message: String(v.message ?? ''),
            createdAt: ts instanceof Timestamp ? ts.toMillis() : null,
            parentId: typeof v.parentId === 'string' ? v.parentId : null,
            isOwner: v.owner === true,
          }
        })
      ),
    onError
  )
}

export async function postComment(input: {
  slug: string
  nickname: string
  message: string
  /** 답글이면 부모 id — 최상위 댓글 id 또는 방명록 쪽지 id */
  parentId?: string
}): Promise<string> {
  const nickname = input.nickname.trim().slice(0, COMMENT_NICK_MAX)
  const message = input.message.trim().slice(0, COMMENT_MAX)
  if (!message) throw new Error('내용을 적어주세요.')
  // 규칙이 보는 것과 같은 형식을 여기서도 본다. 여기서 걸러야 사용자가
  // 「권한 없음」이라는 알 수 없는 오류 대신 뜻이 통하는 말을 본다.
  // 형식만 본다. 「실제로 있는 글인가」는 검사하지 않는다 — 규칙도 글 목록을 모르므로
  // SDK 를 직접 부르면 없는 slug 로도 문서를 만들 수 있다. 다만 읽기는 언제나
  // where(slug == 실제 글) 이라 그런 문서는 아무 화면에도 안 나오고 저장 공간만 쓴다.
  // 이것도 도배와 같은 뿌리(서버 강제 부재)이고, 처방도 같다: App Check.
  if (!/^[a-z0-9-]{1,100}$/.test(input.slug)) throw new Error('잘못된 글 주소입니다.')
  if (commentCooldownLeftMs() > 0) throw new Error('조금 전에 남기셨어요. 30초 뒤에 다시 시도해주세요.')

  if (input.parentId !== undefined && !/^[A-Za-z0-9_-]{1,64}$/.test(input.parentId)) {
    throw new Error('잘못된 답글 대상입니다.')
  }
  if (input.slug === GUESTBOOK_SLUG && !input.parentId) {
    throw new Error('방명록 답글에는 대상 쪽지가 필요합니다.')
  }

  const uid = await ensureUid()
  const db = getDb()
  // 문서 id 를 먼저 정해야 소유권 문서를 같은 id 로 만들 수 있다.
  // 🔴 규칙이 `getAfter` 로 «같은 배치에 소유권 문서가 있는가»를 확인한다 — 둘은 반드시 함께 쓴다.
  //    예전엔 댓글만 만들어 둘 수 있었고, 그런 댓글은 나중에 아무나 자기 것이라 주장해 지울 수 있었다.
  const ref = doc(collection(db, 'comments'))
  const batch = writeBatch(db)
  batch.set(ref, {
    slug: input.slug,
    nickname, // 빈 문자열 그대로 — 화면에서 「익명」으로 그린다
    message,
    createdAt: serverTimestamp(),
    // 🔴 키 자체를 조건부로 넣는다. `parentId: undefined` 는 Firestore 가 거부하고,
    //    `owner: false` 는 규칙이 통째로 거절한다(owner 는 있거나 없거나 둘 중 하나).
    ...(input.parentId ? { parentId: input.parentId } : {}),
    ...(isOwnerSignedIn() ? { owner: true as const } : {}),
  })
  batch.set(doc(db, 'commentOwners', ref.id), { uid })
  await batch.commit()

  rememberMine(ref.id)
  writeLS(C_COOLDOWN_KEY, String(Date.now()))
  return ref.id
}

/** 본인 댓글만 지워진다 — 규칙이 commentOwners 를 열어 uid 를 검사한다. */
export async function deleteComment(id: string): Promise<void> {
  await ensureUid()
  const db = getDb()
  const batch = writeBatch(db)
  batch.delete(doc(db, 'comments', id))
  batch.delete(doc(db, 'commentOwners', id))
  await batch.commit()
  forgetMine(id)
}

// ── 글 조회수 ───────────────────────────────────────────────────────────────
// 방문자 수와 같은 성격이다: **정확한 조회수가 아니라 근사치**다.
// 같은 브라우저는 같은 글을 하루 한 번만 센다 — 새로고침할 때마다 오르면 숫자가 거짓말을 한다.
// 저장소가 막힌 브라우저(사파리 프라이빗 등)에서는 중복을 막을 방법이 없으니 아예 세지 않는다.

const VIEW_KEY_PREFIX = 'simteacher:viewed:'

/**
 * 조회 1회 기록. 실패해도 화면을 막지 않는다(숫자는 글보다 덜 중요하다).
 * 표시는 쓰기가 «성공한 뒤에» 한다 — 먼저 표시하면 규칙 거절·오프라인으로 못 센 조회가
 * 「이미 셌다」로 남아 그날은 영영 재시도되지 않는다(방문자 카운터에서 실제로 겪었다).
 */
export async function recordPostView(slug: string): Promise<void> {
  if (!/^[a-z0-9-]{1,100}$/.test(slug)) return
  const key = `${VIEW_KEY_PREFIX}${slug}`
  const day = todayKey()
  if (readLS(key) === day) return
  // 저장소가 아예 막혀 있으면 중복 집계를 못 막으므로 세지 않는다.
  try {
    window.localStorage.setItem(`${key}:probe`, day)
    window.localStorage.removeItem(`${key}:probe`)
  } catch {
    return
  }

  try {
    await setDoc(
      doc(getDb(), 'postViews', slug),
      { slug, count: increment(1) },
      { merge: true }
    )
    writeLS(key, day)
  } catch {
    /* 집계 실패는 조용히 무시 — 다음 방문에 다시 시도된다 */
  }
}

/** 글 하나의 조회수. 문서가 없으면 0. */
export async function fetchPostViews(slug: string): Promise<number> {
  const snap = await getDoc(doc(getDb(), 'postViews', slug))
  return Number(snap.data()?.count ?? 0)
}

/**
 * 전체 글의 조회수를 한 번에. 목록 화면이 글 수만큼 읽기를 날리지 않게 하려고 있다.
 * 규칙이 list 에 상한을 걸어 두었으므로 limit 은 «반드시» 붙여야 한다.
 */
export async function fetchAllPostViews(): Promise<Record<string, number>> {
  const snap = await getDocs(query(collection(getDb(), 'postViews'), limit(200)))
  const out: Record<string, number> = {}
  snap.docs.forEach((d) => {
    out[d.id] = Number(d.data().count ?? 0)
  })
  return out
}
