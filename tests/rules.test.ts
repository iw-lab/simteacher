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
