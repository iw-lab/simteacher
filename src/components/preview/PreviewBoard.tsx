'use client'

import { useEffect, useState } from 'react'
import { fetchTotalCountsOnce } from '@/lib/community'
import { SiteCard } from '@/components/home/Cards'
import { PREVIEW_GROUPS, previewSites } from '@/data/preview'

// 출시 전 카드판 — 갈래마다 data/preview.ts 에 적힌 순서 그대로.
export function PreviewBoard() {
  const [totals, setTotals] = useState<Record<string, number> | null>(null)
  useEffect(() => {
    let alive = true
    fetchTotalCountsOnce()
      .then((t) => alive && setTotals(t))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])
  return (
    <div className="space-y-14">
      {PREVIEW_GROUPS.map((g) => {
        const sites = previewSites.filter((s) => s.kind === g.kind)
        return (
          <section key={g.kind} id={`preview-${g.kind}`} className="scroll-mt-24">
            <h2 className="mb-1 text-xl md:text-2xl font-extrabold tracking-tight text-fg">
              {g.title} <span className="text-base font-semibold text-muted-fg tabular-nums">{sites.length}</span>
            </h2>
            <p className="mb-5 text-sm text-muted-fg">{g.note}</p>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-5">
              {sites.map((site, i) => (
                <SiteCard key={site.slug} site={site} i={i} views={totals ? totals[site.slug] ?? 0 : undefined} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
