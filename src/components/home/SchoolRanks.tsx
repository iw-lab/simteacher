'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { Search, Trophy, X } from 'lucide-react'
import { learningSites } from '@/data/projects'
import { viaSsam } from '@/lib/via-ssam'
import { findSchools, medalRank, mySpots, type Board, type MySchool, type Span } from '@/lib/school-league'
import { useBoard } from '@/components/home/SchoolLeague'

/* 전체 학교 순위 — 2026-11-03 사용자 «전체 순위와 학교 검색도 되게».
 *   ① 학교 검색(판에 오른 학교 · 이름·시도 낱말) → 그 학교의 종합 순위·게임별 순위
 *   ② 종합 순위 전체(금·은·동 · 1위 한 게임) ③ 놀이별 순위(이번 주 / 오늘 · 학교 10곳) */

const BY_SLUG = new Map(learningSites.map((s) => [s.slug, s]))
const gameName = (slug: string) => BY_SLUG.get(slug)?.name.split(' ').filter((w) => /[가-힣]/.test(w)).join(' ') || BY_SLUG.get(slug)?.name || slug
const MEDAL_CLS = ['bg-amber-400 text-amber-950', 'bg-slate-300 text-slate-900', 'bg-orange-400 text-orange-950']

function Badge({ i }: { i: number }) {
  return <span className={`w-7 h-7 shrink-0 rounded-full inline-flex items-center justify-center text-sm font-black tabular-nums ${MEDAL_CLS[i] ?? 'bg-muted text-fg'}`}>{i + 1}</span>
}

function SchoolCard({ b, s, onClose }: { b: Board; s: MySchool; onClose: () => void }) {
  const rank = medalRank(b, s.c)
  const m = rank ? b.medals[rank - 1] : null
  const spots = mySpots(b, s.c)
  return (
    <div data-testid="rank-school" className="glass rounded-2xl p-4">
      <div className="flex items-center gap-2">
        <b className="text-lg text-fg">{s.n}</b>
        <span className="text-sm text-muted-fg">{s.r}</span>
        <button type="button" onClick={onClose} aria-label="닫기" className="ml-auto p-1 rounded-lg text-muted-fg hover:text-fg"><X className="w-4 h-4" /></button>
      </div>
      <p className="mt-1 text-sm text-fg">
        {m ? <>종합 <b className="text-amber-600 dark:text-amber-400">{rank}위</b> · 금{m.g} 은{m.sv} 동{m.b}</> : '이번 주 종합 순위(메달)에는 아직 없어요'}
      </p>
      {spots.length ? (
        <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
          {spots.map((x) => (
            <li key={x.slug} className="flex items-center gap-2 rounded-xl border border-line bg-card/60 px-3 py-2 text-sm">
              <span className="min-w-0 flex-1 truncate text-fg">{gameName(x.slug)}</span>
              {x.week && <span className="shrink-0 tabular-nums">이번 주 <b>{x.week}위</b></span>}
              {x.today && <span className="shrink-0 tabular-nums text-muted-fg">오늘 {x.today}위</span>}
              {x.behind ? <span className="shrink-0 text-xs text-emerald-600 dark:text-emerald-400">위 학교와 {x.behind}점</span> : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-muted-fg">놀이별 10위 안에 오르면 여기에 나와요.</p>
      )}
    </div>
  )
}

export function SchoolRanks() {
  const b = useBoard()
  const [q, setQ] = useState('')
  const [pick, setPick] = useState<MySchool | null>(null)
  const [span, setSpan] = useState<Span>('week')
  const hits = useMemo(() => (b && q.trim() ? findSchools(b, q) : []), [b, q])
  const games = useMemo(() => (b ? b.games.filter((g) => g[span].some((r) => r.s > 0)).sort((x, y) => y.st.plays - x.st.plays) : []), [b, span])

  if (!b) return <p className="text-sm text-muted-fg">순위를 불러오는 중…</p>
  return (
    <div className="grid gap-6">
      <p className="text-sm text-muted-fg tabular-nums">
        참여 학교 {b.total.schools.toLocaleString()}곳 · 오늘 {b.total.today.toLocaleString()}명 · 학교 순위 놀이 {b.total.games}개
        {b.at ? ` · ${new Date(b.at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} 기준(10분마다 새로 고침)` : ''}
      </p>

      {/* ① 학교 검색 */}
      <section aria-labelledby="rank-search-title" className="grid gap-2">
        <h2 id="rank-search-title" className="sr-only">학교 찾기</h2>
        <label className="flex items-center gap-2 rounded-2xl border border-line bg-card/70 px-4 py-3 focus-within:border-violet-500/60">
          <Search className="w-5 h-5 text-muted-fg shrink-0" aria-hidden />
          <input data-testid="rank-search" value={q} onChange={(e) => { setQ(e.target.value); setPick(null) }} placeholder="학교 이름이나 지역으로 찾기 (예: 김제 중앙, 이도초)" className="w-full bg-transparent text-base text-fg outline-none placeholder:text-muted-fg" />
        </label>
        {q.trim() && !pick && (
          hits.length ? (
            <ul className="flex flex-wrap gap-2">
              {hits.map((s) => (
                <li key={s.c}>
                  <button type="button" data-testid="rank-hit" onClick={() => setPick(s)} className="rounded-full border border-line bg-card/70 px-3 py-1.5 text-sm hover:border-violet-500/60">
                    <b className="text-fg">{s.n}</b> <span className="text-muted-fg">{s.r}</span>
                    {medalRank(b, s.c) ? <span className="ml-1 text-amber-600 dark:text-amber-400">종합 {medalRank(b, s.c)}위</span> : null}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-fg">이번 주 순위(놀이별 10위 · 종합 30위)에 오른 학교 중에는 없어요. 놀이에서 학교를 고르고 놀면 순위에 올라요.</p>
          )
        )}
        {pick && <SchoolCard b={b} s={pick} onClose={() => setPick(null)} />}
      </section>

      {/* ② 종합 순위 전체 */}
      <section aria-labelledby="rank-all-title">
        <h2 id="rank-all-title" className="mb-2 flex items-center gap-1.5 text-lg font-extrabold text-fg"><Trophy className="w-5 h-5 text-amber-500" aria-hidden /> 학교 종합 순위 <span className="text-sm font-normal text-muted-fg">이번 주 · 금·은·동</span></h2>
        <ol data-testid="rank-all" className="grid gap-1.5 md:grid-cols-2">
          {b.medals.map((m, i) => (
            <li key={m.c}>
              <button type="button" onClick={() => { setPick({ c: m.c, n: m.n, r: m.r }); setQ(''); window.scrollTo({ top: 0, behavior: 'smooth' }) }} className="w-full flex items-center gap-2.5 rounded-xl border border-line bg-card/60 px-3 py-2 text-left hover:border-violet-500/60">
                <Badge i={i} />
                <span className="min-w-0 flex-1">
                  <b className="text-fg">{m.n}</b> <span className="text-xs text-muted-fg">{m.r}</span>
                  {m.w.length ? <span className="block text-xs text-muted-fg truncate">1위: {m.w.slice(0, 3).map(gameName).join(' · ')}{m.w.length > 3 ? ` 외 ${m.w.length - 3}` : ''}</span> : null}
                </span>
                <span className="shrink-0 text-sm tabular-nums"><b className="text-amber-600 dark:text-amber-400">금{m.g}</b> <span className="text-muted-fg">은{m.sv} 동{m.b}</span></span>
              </button>
            </li>
          ))}
        </ol>
      </section>

      {/* ③ 놀이별 순위 */}
      <section aria-labelledby="rank-games-title">
        <div className="mb-2 flex items-center gap-2">
          <h2 id="rank-games-title" className="text-lg font-extrabold text-fg">놀이별 학교 순위</h2>
          <div className="ml-auto inline-flex rounded-full border border-line p-0.5 text-sm">
            {(['week', 'today'] as Span[]).map((s) => (
              <button key={s} type="button" onClick={() => setSpan(s)} className={`rounded-full px-3 py-1 ${span === s ? 'bg-violet-600 text-white' : 'text-muted-fg hover:text-fg'}`}>{s === 'week' ? '이번 주' : '오늘'}</button>
            ))}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {games.map((g) => {
            const site = BY_SLUG.get(g.slug)
            return (
              <div key={g.slug} className="glass rounded-2xl p-3">
                <a href={site?.url ? viaSsam(site.url) : undefined} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 min-w-0">
                  {site?.image && <span className="relative w-10 h-10 shrink-0 rounded-lg overflow-hidden bg-muted"><Image src={site.thumb ?? site.image} alt="" fill sizes="40px" className="object-cover object-top" /></span>}
                  <b className="text-fg truncate">{gameName(g.slug)}</b>
                  <span className="ml-auto shrink-0 text-xs text-muted-fg tabular-nums">{g.st.schools}개교</span>
                </a>
                <ol className="mt-2 grid gap-1">
                  {g[span].filter((r) => r.s > 0).map((r, i) => (
                    <li key={r.c} className="flex items-center gap-2 text-sm">
                      <span className={`w-5 h-5 shrink-0 rounded-full inline-flex items-center justify-center text-[11px] font-black ${MEDAL_CLS[i] ?? 'bg-muted text-fg'}`}>{i + 1}</span>
                      <button type="button" onClick={() => { setPick({ c: r.c, n: r.n, r: r.r }); setQ(''); window.scrollTo({ top: 0, behavior: 'smooth' }) }} className="min-w-0 flex-1 truncate text-left text-fg hover:underline">{r.n} <span className="text-xs text-muted-fg">{r.r}</span></button>
                      <span className="shrink-0 tabular-nums text-muted-fg">{r.s.toLocaleString()}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
