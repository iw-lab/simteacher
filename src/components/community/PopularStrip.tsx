'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react'
import { fetchRecentCounts, fetchTotalCounts, recordClick } from '@/lib/community'
import { rankByClicks } from '@/lib/ranking'
import { learningSites, teacherTools } from '@/data/projects'

const ALL = [...learningSites, ...teacherTools]

/** 맨 위 인기 순위 — 최근 48시간 조회수 1등부터 마지막까지 썸네일 카드를 가로로 민다(넓은 화면 5장씩).
 *  집계를 못 읽으면 순위를 지어낼 수 없으니 아예 숨긴다. */
export function PopularStrip() {
  const [counts, setCounts] = useState<Record<string, number> | null>(null)
  const [totals, setTotals] = useState<Record<string, number>>({})
  const [failed, setFailed] = useState(false)
  const rail = useRef<HTMLOListElement>(null)

  useEffect(() => {
    let alive = true
    fetchRecentCounts()
      .then((c) => alive && setCounts(c))
      .catch(() => alive && setFailed(true))
    // 누적은 곁들이는 숫자 — 못 읽어도 순위는 그대로 보인다
    fetchTotalCounts()
      .then((t) => alive && setTotals(t))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  if (failed) return null
  const ranked = counts ? rankByClicks(ALL, counts) : []
  const grand = ALL.reduce((n, s) => n + (totals[s.slug] ?? 0), 0)

  // 한 번에 보이는 너비만큼(5장) 넘긴다
  const page = (dir: 1 | -1) => {
    const el = rail.current
    if (el) el.scrollBy({ left: dir * el.clientWidth, behavior: 'smooth' })
  }

  return (
    <section aria-labelledby="popular-title" className="mb-10">
      <div className="flex items-end justify-between gap-3 mb-3">
        <h2 id="popular-title" className="inline-flex items-center gap-1.5 text-lg md:text-xl font-extrabold text-fg">
          <Flame className="w-5 h-5 text-orange-500" />
          인기 순위
          <span className="ml-1 text-sm font-medium text-muted-fg">최근 48시간 · {ALL.length}곳 전체{grand > 0 && ` · 총 누적 ${grand.toLocaleString()}번`}</span>
        </h2>
        <div className="hidden md:flex gap-2">
          <button type="button" onClick={() => page(-1)} aria-label="앞 순위 보기" className="w-11 h-11 rounded-full border border-line bg-card inline-flex items-center justify-center text-muted-fg hover:text-fg hover:border-primary-500/40">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button type="button" onClick={() => page(1)} aria-label="다음 순위 보기" className="w-11 h-11 rounded-full border border-line bg-card inline-flex items-center justify-center text-muted-fg hover:text-fg hover:border-primary-500/40">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 카드 너비 = (줄 너비 − 사이 4칸) / 5. 폰은 2장 반이 보여 옆으로 밀 수 있음을 알린다 */}
      <ol
        ref={rail}
        data-testid="popular-rail"
        className="flex gap-3 md:gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0 pb-1"
      >
        {(counts ? ranked : Array.from({ length: 5 }, () => null)).map((site, i) => (
          <li
            key={site?.slug ?? `skeleton-${i}`}
            className="snap-start shrink-0 basis-[40%] sm:basis-[calc((100%-2*0.75rem)/3)] md:basis-[calc((100%-4*1rem)/5)]"
          >
            {site ? (
              <a
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={site.url ? () => recordClick(site.slug, site.name) : undefined}
                aria-disabled={!site.url}
                className="group block glass rounded-2xl overflow-hidden hover:border-primary-500/60 transition-colors"
              >
                <div className="relative aspect-[8/5] bg-muted overflow-hidden border-b border-line">
                  <Image
                    src={site.image}
                    alt={`${site.name} 화면`}
                    fill
                    sizes="(max-width: 640px) 40vw, (max-width: 768px) 33vw, 20vw"
                    className="object-cover object-top group-hover:scale-[1.04] transition-transform duration-300"
                  />
                  <span
                    className={`absolute top-1.5 left-1.5 min-w-7 h-7 px-1.5 rounded-full inline-flex items-center justify-center text-sm font-extrabold tabular-nums shadow ${
                      site.rank === 1
                        ? 'bg-amber-400 text-amber-950'
                        : site.rank === 2
                          ? 'bg-slate-300 text-slate-900'
                          : site.rank === 3
                            ? 'bg-orange-400 text-orange-950'
                            : 'bg-black/60 text-white'
                    }`}
                  >
                    {site.rank}
                  </span>
                </div>
                <div className="px-2.5 py-2">
                  <p className="text-[13px] sm:text-sm font-bold text-fg leading-snug line-clamp-1">{site.name}</p>
                  <p className="mt-0.5 text-xs text-muted-fg tabular-nums">
                    {site.count > 0 ? `48시간 ${site.count.toLocaleString()}번` : '48시간 기록 없음'}
                  </p>
                  <p className="text-xs text-muted-fg/80 tabular-nums">
                    누적 {(totals[site.slug] ?? 0).toLocaleString()}번
                  </p>
                </div>
              </a>
            ) : (
              <div className="glass rounded-2xl overflow-hidden" aria-hidden>
                <div className="aspect-[8/5] bg-muted animate-pulse" />
                <div className="h-[68px]" />
              </div>
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}
