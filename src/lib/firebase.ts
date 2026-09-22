import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, signInAnonymously, type Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Lazy init — 빌드(prerender) 시점에 env 없이 모듈이 로드되어도 크래시하지 않도록
// 실제 사용(문의 전송) 순간에만 초기화한다.
let app: FirebaseApp | null = null;
let db: Firestore | null = null;

export function getDb(): Firestore {
  if (!firebaseConfig.apiKey) {
    // env 미설정 시 조용한 실패 대신 명시적 에러 (fail-fast)
    throw new Error('Firebase 환경변수(NEXT_PUBLIC_FIREBASE_*)가 설정되지 않았습니다.');
  }
  if (!db) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    db = getFirestore(app);
  }
  return db;
}

// ── 익명 인증 ───────────────────────────────────────────────────────────────
// 방명록은 로그인 없이 쓰지만, "본인 글만 지울 수 있게" 하려면 규칙이 검사할 수 있는
// 신원이 하나 필요하다. Firebase 익명 인증은 가입·개인정보 없이 브라우저마다 uid 하나를
// 만들어 주고, 그 uid 는 Firestore 규칙에서 위조할 수 없다.
// (4자리 비밀번호 방식은 Firestore 규칙이 삭제 요청의 비밀번호를 검사할 방법이 없어
//  사실상 아무나 지울 수 있게 된다 — 그래서 uid 방식으로 간다.)
let auth: Auth | null = null
let uidPromise: Promise<string> | null = null

export function getAuthClient(): Auth {
  if (!auth) auth = getAuth(getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0])
  return auth
}

/**
 * 브라우저마다 고정된 익명 uid. 여러 번 불러도 익명 로그인은 한 번만 일어난다.
 *
 * 🔴 **결과를 영구 캐시하지 않는다.** 주인이 이메일 계정으로 로그인하면 uid 가 바뀌는데,
 *    캐시된 프라미스를 그대로 돌려주면 「주인으로 로그인했는데 옛 익명 uid 로 글이 나가는」
 *    상태가 된다 — 배지도 안 붙고 소유권도 어긋난다(2026-09-18).
 *    그래서 «지금 로그인된 사람»을 매번 확인하고, 아무도 없을 때만 익명 로그인을 붙잡아 둔다.
 */
export function ensureUid(): Promise<string> {
  getDb() // env 검증 + app 초기화
  const a = getAuthClient()
  if (a.currentUser) return Promise.resolve(a.currentUser.uid)
  if (!uidPromise) {
    uidPromise = signInAnonymously(a)
      .then((cred) => cred.user.uid)
      .catch((e) => {
        uidPromise = null // 실패를 캐시하면 다음 시도까지 영원히 막힌다
        throw e
      })
  }
  return uidPromise
}

// ── 주인(심쌤) 계정 ─────────────────────────────────────────────────────────
// 「심쌤 답변」 배지는 **위조 불가능**해야 한다. 그래서 신원을 보안 규칙이 확인할 수 있어야 하고,
// 규칙이 확인할 수 있는 건 `request.auth.uid` 뿐이다. 익명 uid 는 브라우저 저장소를 비우면
// 사라지므로 주인 신원으로 못 쓴다 → 이메일/비밀번호 계정 하나를 주인 신원으로 둔다.
//
// 🔴 공유 암호를 댓글에 실어 규칙이 대조하는 방식은 쓸 수 없다 — 저장된 문서가 공개 읽기라
//    암호가 그대로 노출된다. 이건 4자리 비번으로 삭제를 막으려다 실패한 것과 같은 함정이다.

/** 규칙의 ownerUid() 와 **같은 값이어야 한다.** 비밀이 아니다(식별자일 뿐). */
export const OWNER_UID = process.env.NEXT_PUBLIC_OWNER_UID ?? 'OWNER_UID_NOT_SET'

export function isOwnerSignedIn(): boolean {
  const u = getAuthClient().currentUser
  return !!u && u.uid === OWNER_UID
}

/** 주인 로그인 — 비밀번호는 주인이 직접 입력한다(코드에 담기지 않는다). */
export async function signInOwner(email: string, password: string): Promise<void> {
  const { signInWithEmailAndPassword } = await import('firebase/auth')
  getDb()
  await signInWithEmailAndPassword(getAuthClient(), email, password)
  uidPromise = null // 익명 uid 캐시를 버린다
}

export async function signOutOwner(): Promise<void> {
  const { signOut } = await import('firebase/auth')
  await signOut(getAuthClient())
  uidPromise = null
}

/** 로그인 상태가 바뀔 때 알려 준다(화면이 배지·글쓰기 가능 여부를 다시 그린다). */
export function onAuthChange(cb: () => void): () => void {
  const a = getAuthClient()
  let unsub = () => {}
  void import('firebase/auth').then(({ onAuthStateChanged }) => {
    unsub = onAuthStateChanged(a, () => cb())
  })
  return () => unsub()
}
