'use client'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { learningSites } from '@/data/projects'
import { safeGoTarget } from '@/lib/via-ssam'

export function GoDoor() {
  const raw = useSearchParams().get('u')
  const target = safeGoTarget(raw, learningSites.map((s) => s.url))
  const site = target ? learningSites.find((s) => s.url && new URL(s.url).host === new URL(target).host) : undefined

  if (!target) {
    return (
      <div data-testid="go-door" className="glass rounded-2xl p-6 text-center">
        <h1 className="text-2xl font-extrabold text-fg">선행쌤</h1>
        <p className="mt-2 text-muted-fg">열 놀이를 찾지 못했어요. 아래에서 골라 주세요.</p>
        <Link href="/" className="mt-5 inline-block rounded-xl bg-primary px-5 py-3 font-bold text-primary-fg">교실 놀이 모두 보기</Link>
      </div>
    )
  }
  return (
    <div data-testid="go-door" className="glass rounded-2xl p-6 text-center">
      <div className="text-4xl">🔓</div>
      <h1 className="mt-2 text-2xl font-extrabold text-fg">{site?.name ?? '교실 놀이'} — 친구랑 같이 하기</h1>
      <p className="mt-2 text-muted-fg leading-relaxed">선행쌤을 거쳐 왔어요. 이제 이 기기에서는 방 만들기·방 들어가기가 계속 열려요.</p>
      <a data-testid="go-enter" href={target} className="mt-5 block rounded-xl bg-gradient-to-r from-violet-600 to-emerald-500 px-5 py-4 text-lg font-extrabold text-white">
        들어가기
      </a>
      <Link href="/" className="mt-4 inline-block text-sm font-bold text-muted-fg underline underline-offset-4">선행쌤의 다른 교실 놀이 보기</Link>
    </div>
  )
}
