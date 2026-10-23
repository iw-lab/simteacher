'use client'

import { useEffect, useState } from 'react'
import { Users } from 'lucide-react'
import { fetchVisitCounts, recordVisit, type VisitCounts } from '@/lib/community'

/**
 * 방문자 카운터. 마운트되면 "오늘 이 브라우저의 첫 방문"일 때만 1을 올리고, 현재 수치를 읽어 온다.
 * 집계가 실패하면 아무것도 그리지 않는다 — 통계는 사이트의 본체가 아니다.
 */
export function VisitCounter({ compact = false }: { compact?: boolean }) {
  const [counts, setCounts] = useState<VisitCounts | null>(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        await recordVisit()
      } catch {
        /* 기록 실패해도 조회는 해 본다 */
      }
      try {
        const c = await fetchVisitCounts()
        if (alive) setCounts(c)
      } catch {
        /* 조용히 숨김 */
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  if (!counts) return null

  return (
    <div
      data-visit-counter
      className={`inline-flex items-center whitespace-nowrap text-muted-fg ${
        compact ? 'gap-1.5 text-xs sm:text-sm' : 'gap-2 text-sm'
      }`}
    >
      <Users className={`${compact ? 'hidden sm:block' : ''} w-4 h-4 text-primary-500 dark:text-primary-300`} />
      <span>
        오늘 <b className="text-fg tabular-nums">{counts.today.toLocaleString()}</b>명
      </span>
      <span aria-hidden className="opacity-40">·</span>
      <span>
        전체 <b className="text-fg tabular-nums">{counts.total.toLocaleString()}</b>명
      </span>
    </div>
  )
}
