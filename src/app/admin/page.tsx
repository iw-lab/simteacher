'use client'

/**
 * 주인(심쌤) 로그인 — 「심쌤 답변」 배지를 달기 위한 신원 확인.
 *
 * 🔴 여기서 하는 일은 **로그인뿐**이다. 비밀번호는 코드에 담기지 않고, 이 화면을 거쳐
 *    Firebase 로 바로 간다. 배지를 달 권한은 화면이 아니라 **보안 규칙**이 정한다
 *    (`firestore.rules` 의 ownerUid() 와 대조) — 이 페이지를 우회해도 배지는 못 단다.
 * 🔴 숨은 화면이다. 링크를 어디에도 걸지 않고 검색 색인에서도 뺀다. 다만 «숨김»은 보안이 아니다 —
 *    실제 방어는 비밀번호와 규칙이 한다.
 */

import { useEffect, useState } from 'react'
import { LogIn, LogOut, ShieldCheck } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { OWNER_UID, isOwnerSignedIn, onAuthChange, signInOwner, signOutOwner } from '@/lib/firebase'

export default function AdminPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [signedIn, setSignedIn] = useState(false)

  useEffect(() => {
    const off = onAuthChange(() => setSignedIn(isOwnerSignedIn()))
    setSignedIn(isOwnerSignedIn())
    return off
  }, [])

  const notConfigured = OWNER_UID === 'OWNER_UID_NOT_SET'

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await signInOwner(email.trim(), password)
      setPassword('')
    } catch {
      // 「이메일이 틀렸는지 비번이 틀렸는지」를 알려 주지 않는다 — 계정 존재 여부가 새어 나간다.
      setError('로그인하지 못했어요. 이메일과 비밀번호를 확인해주세요.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-2 flex items-center gap-2 text-xl font-bold">
        <ShieldCheck className="h-5 w-5" aria-hidden />
        심쌤 로그인
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        로그인하면 답글에 「심쌤 답변」 배지가 붙습니다.
      </p>

      {notConfigured && (
        <p className="mb-6 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
          아직 주인 계정이 설정되지 않았어요. Firebase 콘솔에서 계정을 만들고 그 UID를
          <code className="mx-1">NEXT_PUBLIC_OWNER_UID</code>와 보안 규칙의
          <code className="mx-1">ownerUid()</code>에 넣어주세요.
        </p>
      )}

      {signedIn ? (
        <div className="space-y-4">
          <p className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm">
            심쌤으로 로그인되어 있어요. 이제 남기는 답글에 배지가 붙습니다.
          </p>
          <Button
            onClick={async () => {
              await signOutOwner()
              setSignedIn(false)
            }}
          >
            <LogOut className="mr-1 h-4 w-4" aria-hidden />
            로그아웃
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSignIn} className="space-y-3">
          <Input
            type="email"
            autoComplete="username"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            autoComplete="current-password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" disabled={busy || !email || !password}>
            <LogIn className="mr-1 h-4 w-4" aria-hidden />
            {busy ? '확인 중…' : '로그인'}
          </Button>
        </form>
      )}
    </div>
  )
}
