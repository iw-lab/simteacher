'use client'

/**
 * 선행쌤 관리자 알림 — 전시관 «이름·학교가 보여요» 신고(2026-11-17 사용자 «선행쌤 관리자인 나에게도 알림이 오면 좋겠어»).
 * 신고는 그림을 바로 내리지 않고 그림을 건 선생님(아트온 교사 화면)께 간다. 주인(심쌤)으로 로그인한 화면에만 이 줄이 뜬다.
 * 아트온이 내주는 것 = 작품 id·신고 수·마지막 신고 때뿐(별명·학급·학교·선생님 0).
 * 보는 사람이 주인인지는 화면이 아니라 로그인 계정(OWNER_UID)으로 가린다 — 목록 자체는 이미 공개된 그림의 번호라 새는 것이 없다.
 */
import { useEffect, useState } from 'react'
import { BellRing } from 'lucide-react'
import { ARTON_ORIGIN, safeFlags, type ShowFlag } from '@/lib/art-showcase'
import { isOwnerSignedIn, onAuthChange } from '@/lib/firebase'

const when = (t: number) => {
  if (!t) return ''
  const d = new Date(t)
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function OwnerShowcaseFlags({ onOpen }: { onOpen?: (id: string) => void }) {
  const [owner, setOwner] = useState(false)
  const [flags, setFlags] = useState<ShowFlag[]>([])
  useEffect(() => {
    const sync = () => setOwner(isOwnerSignedIn())
    const off = onAuthChange(sync)
    sync()
    return off
  }, [])
  useEffect(() => {
    if (!owner) { setFlags([]); return }
    let alive = true
    fetch(`${ARTON_ORIGIN}/api/showcase/flags`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => { if (alive) setFlags(safeFlags(j)) })
      .catch(() => {})
    return () => { alive = false }
  }, [owner])
  if (!owner || !flags.length) return null
  return (
    <div role="status" data-testid="owner-showcase-flags" className="mb-3 rounded-2xl border border-red-400/40 bg-red-500/10 p-3">
      <p className="flex items-center gap-1.5 text-sm font-bold text-red-700 dark:text-red-300">
        <BellRing className="w-4 h-4" aria-hidden />
        관리자 알림 · 전시관 «이름·학교가 보여요» 신고 {flags.length}점 — 그림은 아직 걸려 있고, 그림을 건 선생님께도 알렸어요
      </p>
      <ul className="mt-2 flex flex-wrap gap-2">
        {flags.map((f) => (
          <li key={f.id}>
            <button type="button" onClick={() => onOpen?.(f.id)} data-owner-flag={f.id} className="relative block w-16 h-16 rounded-xl overflow-hidden border border-red-400/60 bg-white" aria-label={`신고 ${f.n}건 작품 크게 보기`}>
              {/* eslint-disable-next-line @next/next/no-img-element -- 아트온 서버 그림 */}
              <img src={`${ARTON_ORIGIN}/api/showcase/${f.id}`} alt="신고 온 작품" className="w-full h-full object-cover" />
              <span className="absolute bottom-0 inset-x-0 bg-red-600/90 text-[10px] font-bold text-white text-center leading-4">{f.n}건 · {when(f.at)}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
