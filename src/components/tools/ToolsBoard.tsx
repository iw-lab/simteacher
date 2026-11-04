'use client'

import { useEffect, useMemo, useState } from 'react'
import { fetchTotalCountsOnce } from '@/lib/community'
import { classToolSites, isOccasion } from '@/lib/catalog'
import { SiteCard } from '@/components/home/Cards'
import { learningSites } from '@/data/projects'

const SITES = classToolSites(learningSites).filter((s) => !isOccasion(s))
const OCCASIONS = classToolSites(learningSites).filter(isOccasion)

// 수업 도구 — 도구끼리만 많이 쓴 순서(게임과 섞으면 늘 밑으로 깔린다). 조회수를 못 읽으면 새로 올린 순서 그대로.
export function ToolsBoard() {
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
  const views = (slug: string) => (totals ? totals[slug] ?? 0 : undefined)
  const byViews = <T extends { slug: string }>(list: T[]) =>
    totals ? [...list].sort((a, b) => (totals[b.slug] ?? 0) - (totals[a.slug] ?? 0)) : list
  const sites = useMemo(() => byViews(SITES), [totals]) // eslint-disable-line react-hooks/exhaustive-deps
  const occasions = useMemo(() => byViews(OCCASIONS), [totals]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-14">
      <section id="class-tools" className="scroll-mt-24">
        <h2 className="mb-1 text-xl md:text-2xl font-extrabold tracking-tight text-fg">
          교실에 바로 띄우기 <span className="text-base font-semibold text-muted-fg tabular-nums">{SITES.length}</span>
        </h2>
        <p className="mb-5 text-sm text-muted-fg">설치 없이 전자칠판·교실 화면에서 바로 열어요.</p>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-5">
          {sites.map((site, i) => (
            <SiteCard key={site.slug} site={site} i={i} views={views(site.slug)} />
          ))}
        </div>
      </section>

      {occasions.length > 0 && (
        <section id="occasion" className="scroll-mt-24 min-w-0">
          <h2 className="mb-1 text-xl md:text-2xl font-extrabold tracking-tight text-fg">
            계기교육 <span className="text-base font-semibold text-muted-fg tabular-nums">{occasions.length}</span>
          </h2>
          <p className="mb-5 text-sm text-muted-fg">그날 그 주제로 함께 이야기 나눌 때.</p>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-5">
            {occasions.map((site, i) => (
              <SiteCard key={site.slug} site={site} i={i} views={views(site.slug)} />
            ))}
          </div>
        </section>
      )}
      {/* 선생님 책상 프로그램은 «선생님 도구»(/teacher) 탭으로 옮겼다(2026-11-04) */}
    </div>
  )
}
