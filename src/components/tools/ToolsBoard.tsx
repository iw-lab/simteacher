'use client'

import { useEffect, useMemo, useState } from 'react'
import { fetchTotalCountsOnce } from '@/lib/community'
import { classToolSites, isOccasion } from '@/lib/catalog'
import { SiteCard, ToolCard } from '@/components/home/Cards'
import { learningSites, teacherTools } from '@/data/projects'

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
  const tools = useMemo(() => byViews(teacherTools), [totals]) // eslint-disable-line react-hooks/exhaustive-deps
  const occasions = useMemo(() => byViews(OCCASIONS), [totals]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-14">
      <section id="class-tools" className="scroll-mt-24">
        <h2 className="mb-1 text-xl md:text-2xl font-extrabold tracking-tight text-fg">
          수업에 바로 띄우기 <span className="text-base font-semibold text-muted-fg tabular-nums">{SITES.length}</span>
        </h2>
        <p className="mb-5 text-sm text-muted-fg">설치 없이 전자칠판·교실 화면에서 바로 열어요.</p>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-5">
          {sites.map((site, i) => (
            <SiteCard key={site.slug} site={site} i={i} views={views(site.slug)} />
          ))}
        </div>
      </section>

      {/* 넓은 화면: 계기교육(1장)과 책상 프로그램(3장)을 한 줄에 — 따로 두면 오른쪽이 텅 비었다(2026-10-24 사용자 «왜 좌우 이렇게 비워놈?») */}
      <div className={`grid gap-x-5 gap-y-14 ${occasions.length ? 'xl:grid-cols-4' : ''}`}>
      {occasions.length > 0 && (
        <section id="occasion" className="scroll-mt-24 min-w-0">
          <h2 className="mb-1 text-xl md:text-2xl font-extrabold tracking-tight text-fg">
            계기교육 <span className="text-base font-semibold text-muted-fg tabular-nums">{occasions.length}</span>
          </h2>
          <p className="mb-5 text-sm text-muted-fg">그날 그 주제로 한 시간 수업할 때.</p>
          <div className="grid grid-cols-2 xl:grid-cols-1 gap-3 sm:gap-5">
            {occasions.map((site, i) => (
              <SiteCard key={site.slug} site={site} i={i} views={views(site.slug)} />
            ))}
          </div>
        </section>
      )}

      <section id="teacher-tools" className={`scroll-mt-24 min-w-0 ${occasions.length ? 'xl:col-span-3' : ''}`}>
        <h2 className="mb-1 text-xl md:text-2xl font-extrabold tracking-tight text-fg">
          선생님 책상 프로그램 <span className="text-base font-semibold text-muted-fg tabular-nums">{teacherTools.length}</span>
        </h2>
        <p className="mb-5 text-sm text-muted-fg">
          아이들 것만 만들다 보니 정작 교사인 제가 쓸 게 없더군요. 제 책상에서 쓰려고 만들어 무료로 나눕니다.
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          {tools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} views={views(tool.slug)} />
          ))}
        </div>
      </section>
      </div>
    </div>
  )
}
