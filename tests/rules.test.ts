/**
 * Firestore 보안 규칙 시험 — 「규칙이 무엇을 막는가」를 실제로 실행해 본다.
 *
 * 🔴 문법만 보는 검사는 소용이 없다. 2026-09-18 에 `emulators:exec` 로 «컴파일 확인»을 했는데,
 *    일부러 깨뜨린 규칙도 그대로 통과했다 — 무는지 확인하지 않은 가드는 가드가 아니다.
 *    그래서 여기서는 실제 쓰기·삭제를 시도해 허용/거부를 본다.
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing'
import { readFileSync } from 'node:fs'
import { doc, setDoc, deleteDoc, serverTimestamp, writeBatch } from 'firebase/firestore'

const OWNER = 'OWNER_UID_NOT_SET'   // 규칙의 ownerUid() 와 같은 값
let env: RulesTestEnvironment

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-rules',
    firestore: { rules: readFileSync('firestore.rules', 'utf8'), host: '127.0.0.1', port: 8080 },
  })
})
afterAll(async () => env?.cleanup())
beforeEach(async () => env.clearFirestore())

/** 댓글 + 소유권 문서를 «한 배치로» 쓴다 — 규칙이 요구하는 정상 경로 */
async function post(db: ReturnType<RulesTestEnvironment['authenticatedContext']>['firestore'] extends never ? never : any, uid: string, id: string, data: Record<string, unknown>) {
  const b = writeBatch(db)
  b.set(doc(db, 'comments', id), { nickname: '', message: 'ㅎㅇ', createdAt: serverTimestamp(), ...data })
  b.set(doc(db, 'commentOwners', id), { uid })
  return b.commit()
}

describe('댓글 규칙', () => {
  // 2026-11-10 사용자 «왜 갑자기 선행쌤 답글이 안 달아지지?» — 여러 줄 답글이 «Missing or insufficient permissions».
  // RE2 의 . 은 줄바꿈을 못 건넌다 → '.*\\S.*' 가 줄바꿈 있는 글을 통째로 거절했다(한 줄 «감사합니다^^» 는 통과).
  it('🔴 여러 줄 댓글·답글도 쓸 수 있다(줄바꿈)', async () => {
    const db = env.authenticatedContext('aaa').firestore()
    await assertSucceeds(post(db, 'aaa', 'm1', { slug: 'hello-world', message: '첫 줄입니다.\n둘째 줄입니다.^^' }))
    await assertSucceeds(post(db, 'aaa', 'm2', { slug: 'hello-world', message: '\n\n가운데만 글\n', nickname: '선행쌤' }))
  })
  it('공백·줄바꿈만 있는 글은 여전히 거부', async () => {
    const db = env.authenticatedContext('aaa').firestore()
    await assertFails(post(db, 'aaa', 'm3', { slug: 'hello-world', message: '\n  \n\t' }))
    // 교차검증(codex): 유니코드 공백(NBSP·전각 공백·폭 없는 공백)만으로도 «빈 글»이다
    await assertFails(post(db, 'aaa', 'm4', { slug: 'hello-world', message: '\n\u00A0\n\u3000\u200B' }))
    await assertFails(post(db, 'aaa', 'm5', { slug: 'hello-world', message: '\n\u2002\u000B\u0085\u2029\n' }))
    await assertSucceeds(post(db, 'aaa', 'm6', { slug: 'hello-world', message: '\u2002가\u3000' }))
  })
  it('🔴 이름: 특수 공백만·폭 없는 문자로 «심쌤» 사칭 금지', async () => {
    const db = env.authenticatedContext('aaa').firestore()
    await assertFails(post(db, 'aaa', 'n1', { slug: 'hello-world', nickname: '\u00A0\u200B' }))
    await assertFails(post(db, 'aaa', 'n2', { slug: 'hello-world', nickname: '심\u200B쌤' }))
    await assertFails(post(db, 'aaa', 'n4', { slug: 'hello-world', nickname: '심\u2066쌤\u2069' }))
    await assertFails(post(db, 'aaa', 'm7', { slug: 'hello-world', message: '\u2060' }))
    await assertSucceeds(post(db, 'aaa', 'n3', { slug: 'hello-world', nickname: '바다 선생님' }))
    await assertFails(post(db, 'aaa', 'n5', { slug: 'hello-world', nickname: '\u1109\u1175\u11B7\u110A\u1162\u11B7' }))   // 조합형 자모 «심쌤»
    await assertFails(post(db, 'aaa', 'n6', { slug: 'hello-world', nickname: '심\u180E쌤' }))
    await assertSucceeds(post(db, 'aaa', 'n7', { slug: 'hello-world', nickname: 'ㅋㅋ Kim_3' }))
  })
  it('글: 보이는 글자가 있어야 — 결합 문자·변형 선택자만은 거부 · 이모지·^^ 만은 허용', async () => {
    const db = env.authenticatedContext('aaa').firestore()
    await assertFails(post(db, 'aaa', 'v1', { slug: 'hello-world', message: '\u034F' }))
    await assertFails(post(db, 'aaa', 'v2', { slug: 'hello-world', message: '\uFE0F\n\u200D' }))
    await assertSucceeds(post(db, 'aaa', 'v3', { slug: 'hello-world', message: '👍' }))
    await assertSucceeds(post(db, 'aaa', 'v4', { slug: 'hello-world', message: '^^' }))
    await assertSucceeds(post(db, 'aaa', 'v5', { slug: 'hello-world', message: '감사합니다.\n다음에도 부탁드려요 :)' }))
  })

  it('보통 사람은 최상위 댓글을 쓸 수 있다', async () => {
    const db = env.authenticatedContext('aaa').firestore()
    await assertSucceeds(post(db, 'aaa', 'c1', { slug: 'hello-world' }))
  })

  it('🔴 배지는 위조할 수 없다 — 주인이 아니면 owner:true 가 거부된다', async () => {
    const db = env.authenticatedContext('attacker').firestore()
    await assertFails(post(db, 'attacker', 'c2', { slug: 'hello-world', owner: true }))
  })

  it('주인은 배지를 달 수 있다', async () => {
    const db = env.authenticatedContext(OWNER).firestore()
    await assertSucceeds(post(db, OWNER, 'c3', { slug: 'hello-world', owner: true }))
  })

  it('owner:false 는 아예 받지 않는다 (있거나 없거나)', async () => {
    const db = env.authenticatedContext('aaa').firestore()
    await assertFails(post(db, 'aaa', 'c4', { slug: 'hello-world', owner: false }))
  })

  it('🔴 주인이 아니면 「심쌤」을 사칭하는 이름을 못 쓴다', async () => {
    const db = env.authenticatedContext('aaa').firestore()
    await assertFails(post(db, 'aaa', 'c5', { slug: 'hello-world', nickname: '심쌤' }))
    await assertFails(post(db, 'aaa', 'c6', { slug: 'hello-world', nickname: '진짜 심쌤임' }))
  })

  it('🔴 소유권 문서 없이 태어날 수 없다 (선점 공격 차단)', async () => {
    const db = env.authenticatedContext('aaa').firestore()
    await assertFails(
      setDoc(doc(db, 'comments', 'c7'), { slug: 'hello-world', nickname: '', message: 'ㅎㅇ', createdAt: serverTimestamp() })
    )
  })
})

describe('답글 규칙', () => {
  it('최상위 댓글에는 답글을 달 수 있다', async () => {
    const a = env.authenticatedContext('aaa').firestore()
    await post(a, 'aaa', 'p1', { slug: 'hello-world' })
    const b = env.authenticatedContext('bbb').firestore()
    await assertSucceeds(post(b, 'bbb', 'r1', { slug: 'hello-world', parentId: 'p1' }))
  })

  it('🔴 답글에 또 답글은 달 수 없다 (깊이 2 를 규칙이 강제한다)', async () => {
    const a = env.authenticatedContext('aaa').firestore()
    await post(a, 'aaa', 'p2', { slug: 'hello-world' })
    await post(a, 'aaa', 'r2', { slug: 'hello-world', parentId: 'p2' })
    const b = env.authenticatedContext('bbb').firestore()
    await assertFails(post(b, 'bbb', 'r3', { slug: 'hello-world', parentId: 'r2' }))
  })

  it('🔴 없는 부모를 가리키는 답글은 거부된다', async () => {
    const db = env.authenticatedContext('aaa').firestore()
    await assertFails(post(db, 'aaa', 'r4', { slug: 'hello-world', parentId: 'nosuchparent' }))
  })

  it('방명록 쪽지에는 답글을 달 수 있다', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'guestbook', 'g1'), {
        nickname: '익명', message: 'ㅎㅇ', color: 'yellow', uid: 'zzz', createdAt: new Date(),
      })
    })
    const db = env.authenticatedContext('aaa').firestore()
    await assertSucceeds(post(db, 'aaa', 'gr1', { slug: 'guestbook', parentId: 'g1' }))
  })

  it('🔴 없는 쪽지에 답글은 거부된다', async () => {
    const db = env.authenticatedContext('aaa').firestore()
    await assertFails(post(db, 'aaa', 'gr2', { slug: 'guestbook', parentId: 'nosuchnote' }))
  })

  it("🔴 예약 slug 'guestbook' 에 최상위 댓글은 못 쓴다", async () => {
    const db = env.authenticatedContext('aaa').firestore()
    await assertFails(post(db, 'aaa', 'gr3', { slug: 'guestbook' }))
  })
})

describe('방명록 말머리·제목 규칙(2026-11-13 게시판 목록)', () => {
  const note = (uid: string, extra: Record<string, unknown> = {}) =>
    ({ nickname: '익명의 선생님', message: '안녕하세요', color: 'yellow', uid, createdAt: serverTimestamp(), ...extra })
  it('말머리·제목 없이(옛 화면)도 · 있어도 쓸 수 있다', async () => {
    const db = env.authenticatedContext('aaa').firestore()
    await assertSucceeds(setDoc(doc(db, 'guestbook', 'n1'), note('aaa')))
    await assertSucceeds(setDoc(doc(db, 'guestbook', 'n2'), note('aaa', { category: 'bug', title: 'A키가 안 눌려요' })))
    await assertSucceeds(setDoc(doc(db, 'guestbook', 'n3'), note('aaa', { category: 'hello' })))
  })
  it('🔴 정해진 말머리만 · 제목은 1~60자 글자만 · 다른 칸은 못 싣는다', async () => {
    const db = env.authenticatedContext('aaa').firestore()
    await assertFails(setDoc(doc(db, 'guestbook', 'b1'), note('aaa', { category: 'notice' })))
    await assertFails(setDoc(doc(db, 'guestbook', 'b2'), note('aaa', { category: 'ask', title: '' })))
    await assertFails(setDoc(doc(db, 'guestbook', 'b3'), note('aaa', { category: 'ask', title: 'ㄱ'.repeat(61) })))
    await assertFails(setDoc(doc(db, 'guestbook', 'b4'), note('aaa', { category: 'ask', title: 7 })))
    await assertFails(setDoc(doc(db, 'guestbook', 'b7'), note('aaa', { category: 'ask', title: '   ' })))
    await assertFails(setDoc(doc(db, 'guestbook', 'b5'), note('aaa', { category: 'ask', answered: true })))
    await assertFails(setDoc(doc(db, 'guestbook', 'b6'), note('bbb', { category: 'ask' })))
  })
})

describe('삭제 규칙', () => {
  it('본인 글만 지운다', async () => {
    const a = env.authenticatedContext('aaa').firestore()
    await post(a, 'aaa', 'd1', { slug: 'hello-world' })
    const b = env.authenticatedContext('bbb').firestore()
    await assertFails(deleteDoc(doc(b, 'comments', 'd1')))
    await assertSucceeds(deleteDoc(doc(a, 'comments', 'd1')))
  })

  it('주인은 남의 글도 지운다 (모더레이션)', async () => {
    const a = env.authenticatedContext('aaa').firestore()
    await post(a, 'aaa', 'd2', { slug: 'hello-world' })
    const o = env.authenticatedContext(OWNER).firestore()
    await assertSucceeds(deleteDoc(doc(o, 'comments', 'd2')))
  })

  it('수정은 누구도 못 한다', async () => {
    const a = env.authenticatedContext('aaa').firestore()
    await post(a, 'aaa', 'd3', { slug: 'hello-world' })
    await assertFails(setDoc(doc(a, 'comments', 'd3'), { slug: 'hello-world', nickname: '', message: '바꿔치기', createdAt: serverTimestamp() }))
  })
})

describe('음악감상실 재생 수 규칙', () => {
  const anon = () => env.unauthenticatedContext().firestore()

  it('처음 재생은 1로 만들고, 다음부터는 +1 만 된다', async () => {
    const db = anon()
    await assertSucceeds(setDoc(doc(db, 'songPlays', 'abcrocket'), { id: 'abcrocket', count: 1 }))
    await assertSucceeds(setDoc(doc(db, 'songPlays', 'abcrocket'), { id: 'abcrocket', count: 2 }))
    await assertFails(setDoc(doc(db, 'songPlays', 'abcrocket'), { id: 'abcrocket', count: 100 }))
  })

  it('🔴 처음부터 큰 수로 만들 수 없다 · 문서 이름과 id 가 달라도 안 된다 · 지울 수 없다', async () => {
    const db = anon()
    await assertFails(setDoc(doc(db, 'songPlays', 'yeouya'), { id: 'yeouya', count: 999 }))
    await assertFails(setDoc(doc(db, 'songPlays', 'yeouya'), { id: 'abcrocket', count: 1 }))
    await assertFails(setDoc(doc(db, 'songPlays', 'Bad_ID'), { id: 'Bad_ID', count: 1 }))
    await assertSucceeds(setDoc(doc(db, 'songPlays', 'yeouya'), { id: 'yeouya', count: 1 }))
    await assertFails(deleteDoc(doc(db, 'songPlays', 'yeouya')))
  })

  it('날짜별 문서는 «날짜__id» 이름에 +1 만', async () => {
    const db = anon()
    await assertSucceeds(setDoc(doc(db, 'songPlaysDaily', '20261023__abcrocket'), { date: '20261023', id: 'abcrocket', count: 1 }))
    await assertSucceeds(setDoc(doc(db, 'songPlaysDaily', '20261023__abcrocket'), { date: '20261023', id: 'abcrocket', count: 2 }))
    await assertFails(setDoc(doc(db, 'songPlaysDaily', '20261023__abcrocket'), { date: '20261023', id: 'abcrocket', count: 50 }))
    await assertFails(setDoc(doc(db, 'songPlaysDaily', '20261023__yeouya'), { date: '20261023', id: 'abcrocket', count: 1 }))
    await assertFails(setDoc(doc(db, 'songPlaysDaily', '20261023__x'), { date: '20261023', id: 'x', count: 1, extra: 1 }))
  })
})

describe('서재 책 클릭 수 규칙', () => {
  const anon = () => env.unauthenticatedContext().firestore()
  it('처음은 1, 다음부터 +1 만 · 큰 수·이름 불일치·삭제는 거부', async () => {
    const db = anon()
    await assertSucceeds(setDoc(doc(db, 'bookClicks', 'gwahak-1'), { id: 'gwahak-1', count: 1 }))
    await assertSucceeds(setDoc(doc(db, 'bookClicks', 'gwahak-1'), { id: 'gwahak-1', count: 2 }))
    await assertFails(setDoc(doc(db, 'bookClicks', 'gwahak-1'), { id: 'gwahak-1', count: 9 }))
    await assertFails(setDoc(doc(db, 'bookClicks', 'x'), { id: 'x', count: 500 }))
    await assertFails(setDoc(doc(db, 'bookClicks', 'y'), { id: 'z', count: 1 }))
    await assertFails(deleteDoc(doc(db, 'bookClicks', 'gwahak-1')))
    await assertSucceeds(setDoc(doc(db, 'bookClicksDaily', '20261023__gwahak-1'), { date: '20261023', id: 'gwahak-1', count: 1 }))
    await assertFails(setDoc(doc(db, 'bookClicksDaily', '20261023__gwahak-1'), { date: '20261023', id: 'gwahak-1', count: 40 }))
    await assertFails(setDoc(doc(db, 'bookClicksDaily', '20261023__a'), { date: '20261023', id: 'b', count: 1 }))
  })
})

// 홈 인기 순위 합계(2026-11-08 «파이어베이스 요금») — 하루 문서 1개 + 누적 1개.
// 홈은 문서 3~4개만 읽는다(예전: 앱별 문서 수백 건). 쓰기는 «한 칸만 +1» 만 된다.
describe('클릭 합계(clickSum) 규칙', () => {
  const anon = () => env.unauthenticatedContext().firestore()
  const seed = async (id: string, c: Record<string, number>) =>
    env.withSecurityRulesDisabled(async (ctx) => { await setDoc(doc(ctx.firestore(), 'clickSum', id), { c }) })
  it('누구나 처음 한 칸을 1로 만든다', async () => {
    await assertSucceeds(setDoc(doc(anon(), 'clickSum', '20261108'), { c: { 'kkeut-bomb': 1 }, k: 'kkeut-bomb' }))
    await assertSucceeds(setDoc(doc(anon(), 'clickSum', 'total'), { c: { gugu: 1 }, k: 'gugu' }))
  })
  it('한 칸을 +1 하는 것만 된다(다른 칸은 그대로)', async () => {
    await seed('total', { gugu: 5, mulkko: 2 })
    await assertSucceeds(setDoc(doc(anon(), 'clickSum', 'total'), { c: { gugu: 6, mulkko: 2 }, k: 'gugu' }))
    await assertSucceeds(setDoc(doc(anon(), 'clickSum', 'total'), { c: { gugu: 6, mulkko: 2, newgame: 1 }, k: 'newgame' }))
  })
  it('🔴 +2 이상·깎기·두 칸 동시·칸 지우기·딴 필드는 막는다', async () => {
    await seed('total', { gugu: 5, mulkko: 2 })
    const d = doc(anon(), 'clickSum', 'total')
    await assertFails(setDoc(d, { c: { gugu: 7, mulkko: 2 }, k: 'gugu' }))
    await assertFails(setDoc(d, { c: { gugu: 4, mulkko: 2 }, k: 'gugu' }))
    await assertFails(setDoc(d, { c: { gugu: 6, mulkko: 3 }, k: 'gugu' }))
    await assertFails(setDoc(d, { c: { gugu: 5, mulkko: 3 }, k: 'gugu' }))
    await assertFails(setDoc(d, { c: { gugu: 5 }, k: 'gugu' }))
    await assertFails(setDoc(d, { c: { gugu: 6, mulkko: 2 }, k: 'gugu', x: 1 }))
    await assertFails(setDoc(d, { c: { gugu: 5, mulkko: 2, newgame: 5 }, k: 'newgame' }))
    await assertFails(deleteDoc(d))
  })
  it('🔴 이상한 문서 이름·이상한 칸 이름·처음부터 큰 값은 막는다', async () => {
    await assertFails(setDoc(doc(anon(), 'clickSum', 'hack'), { c: { gugu: 1 }, k: 'gugu' }))
    await assertFails(setDoc(doc(anon(), 'clickSum', '20261108'), { c: { 'Bad Name!': 1 }, k: 'Bad Name!' }))
    await assertFails(setDoc(doc(anon(), 'clickSum', '20261108'), { c: { gugu: 9 }, k: 'gugu' }))
    await assertFails(setDoc(doc(anon(), 'clickSum', '20261108'), { c: { gugu: 1, mulkko: 1 }, k: 'gugu' }))
  })
  it('🔴 칸 상한(2000)을 넘는 새 칸은 막는다', async () => {
    const big: Record<string, number> = {}
    for (let i = 0; i < 2000; i++) big[`g${i}`] = 1
    await seed('total', big)
    await assertFails(setDoc(doc(anon(), 'clickSum', 'total'), { c: { ...big, extra: 1 }, k: 'extra' }))
    await assertSucceeds(setDoc(doc(anon(), 'clickSum', 'total'), { c: { ...big, g5: 2 }, k: 'g5' }))
  })
  it('사이트가 실제로 쓰는 모양(병합 + increment)이 통과한다 — 새 날짜 문서·기존 칸·새 칸', async () => {
    const { increment } = await import('firebase/firestore')
    const w = (id: string, slug: string) => setDoc(doc(anon(), 'clickSum', id), { c: { [slug]: increment(1) }, k: slug }, { merge: true })
    await assertSucceeds(w('20261109', 'gugu'))
    await assertSucceeds(w('20261109', 'gugu'))
    await assertSucceeds(w('20261109', 'mulkko'))
    await seed('total', { gugu: 5 })
    await assertSucceeds(w('total', 'gugu'))
    await assertSucceeds(w('total', 'newgame'))
    const { getDoc } = await import('firebase/firestore')
    let snap: Record<string, unknown> | undefined
    await env.withSecurityRulesDisabled(async (ctx) => { snap = (await getDoc(doc(ctx.firestore(), 'clickSum', '20261109'))).data() })
    expect(snap?.c).toEqual({ gugu: 2, mulkko: 1 })
    await assertFails(setDoc(doc(anon(), 'clickSum', 'total'), { c: { gugu: increment(2) }, k: 'gugu' }, { merge: true }))
  })
  it('누구나 읽는다', async () => {
    await seed('total', { gugu: 5 })
    const { getDoc } = await import('firebase/firestore')
    await assertSucceeds(getDoc(doc(anon(), 'clickSum', 'total')))
  })
})
