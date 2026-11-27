// 🔒 2026-11-27 사용자 «구글로 로그인해도 댓글 달려고 하면 관리자가 풀려버림 (문의 탭)»
// 원인: 문의 탭(방명록)이 열리자마자 ensureUid() 를 부르는데, 그때는 저장된 구글 로그인이 아직 복원 전이라
// currentUser 가 비어 있다 → 익명 로그인을 해 버리고, 그게 구글(주인) 로그인을 덮어쓴다.
// 고침: 로그인 복원(authStateReady)을 기다린 뒤에 «아무도 없을 때만» 익명 로그인.
import { describe, it, expect, vi, beforeEach } from 'vitest'

const google = { uid: 'OWNER', isAnonymous: false, email: 'o@x' }
const fake: { currentUser: unknown; authStateReady: () => Promise<void> } = {
  currentUser: null,
  authStateReady: async () => { await new Promise((r) => setTimeout(r, 5)); fake.currentUser = google },
}
const anon = vi.fn(async () => { fake.currentUser = { uid: 'ANON', isAnonymous: true }; return { user: fake.currentUser } })
vi.mock('firebase/app', () => ({ initializeApp: () => ({}), getApps: () => [{}] }))
vi.mock('firebase/firestore', () => ({ getFirestore: () => ({}) }))
vi.mock('firebase/auth', () => ({ getAuth: () => fake, signInAnonymously: (...a: unknown[]) => anon(...(a as [])) }))

describe('주인 로그인이 익명 로그인에 덮이지 않는다', () => {
  beforeEach(() => { process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'k'; fake.currentUser = null; anon.mockClear() })
  it('복원 전에 ensureUid 를 불러도 구글 uid 를 돌려주고 익명 로그인을 하지 않는다', async () => {
    const { ensureUid } = await import('../src/lib/firebase')
    expect(await ensureUid()).toBe('OWNER')
    expect(anon).not.toHaveBeenCalled()
    expect(fake.currentUser).toBe(google)
  })
})
