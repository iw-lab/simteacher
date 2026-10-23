'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react'
import { fetchRecentCounts, fetchTotalCounts, recordClick } from '@/lib/community'
import { rankByClicks } from '@/lib/ranking'
import { learningSites, teacherTools } from '@/data/projects'

const ALL = [...learningSites, ...teacherTools]

/** 자동으로 다음 순위로 넘기는 간격(ms) — 2026-10-23 «자동으로 다음 순위로 넘어가게 · 일정 간격 두고» */
export const AUTO_ADVANCE_MS = 3500
/** 손으로 만진 뒤 자동 넘김을 쉬는 시간(ms) */
const RESUME_AFTER_MS = 8000

/** 맨 위 인기 순위 — 최근 48시간 조회수 1등부터 마지막까지 썸네일 카드를 가로로 민다.
 *  한 번에 폰 3 · 태블릿 4~5 · 넓은 화면 7장(2026-10-23 «글자 깨진다 7개로 줄이고 7개 한번에 넘어가게»).
 *  AUTO_ADVANCE_MS 마다 보이는 장수만큼(한 화면) 다음 순위로 넘기고, 끝에 닿으면 1등으로 돌아간다.
 *  마우스를 올리거나 손으로 밀면 잠시 멈춘다. 집계를 못 읽으면 순위를 지어낼 수 없으니 아예 숨긴다. */
export function PopularStrip() {
  const [counts, setCounts] = useState<Record<string, number> | null>(null)
  const [totals, setTotals] = useState<Record<string, number>>({})
  const [failed, setFailed] = useState(false)
  const rail = useRef<HTMLOListElement>(null)
  const hold = useRef(0) // 이 시각(ms)까지 자동 넘김을 쉰다
  const hover = useRef(false)

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

  // 자동 넘김 — 한 화면(보이는 장수)씩. 화면이 숨었거나 마우스가 올라가 있거나 방금 손댔으면 건너뛴다
  useEffect(() => {
    if (!counts) return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const id = window.setInterval(() => {
      const el = rail.current
      if (!el || document.hidden || hover.current || Date.now() < hold.current) return
      const gap = parseFloat(getComputedStyle(el).columnGap) || 0
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4
      const behavior: ScrollBehavior = reduce ? 'auto' : 'smooth'
      if (atEnd) el.scrollTo({ left: 0, behavior })
      else el.scrollBy({ left: el.clientWidth + gap, behavior })
    }, AUTO_ADVANCE_MS)
    return () => window.clearInterval(id)
  }, [counts])

  const pause = () => {
    hold.current = Date.now() + RESUME_AFTER_MS
  }

  if (failed) return null
  const ranked = counts ? rankByClicks(ALL, counts) : []
  const grand = ALL.reduce((n, s) => n + (totals[s.slug] ?? 0), 0)

  // 한 번에 보이는 너비만큼 넘긴다
  const page = (dir: 1 | -1) => {
    pause()
    const el = rail.current
    if (el) el.scrollBy({ left: dir * (el.clientWidth + (parseFloat(getComputedStyle(el).columnGap) || 0)), behavior: 'smooth' })
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

      {/* 카드 너비 = (줄 너비 − 사이 N−1칸) / N. 폰은 3장 조금 넘게 보여 옆으로 밀 수 있음을 알린다 */}
      <ol
        ref={rail}
        data-testid="popular-rail"
        data-auto-ms={AUTO_ADVANCE_MS}
        // 폰에서 누르면 mouseenter 가 남아 영영 멈춘다 → 진짜 마우스만 «올려 둠»으로 친다
        onPointerEnter={(e) => e.pointerType === 'mouse' && (hover.current = true)}
        onPointerLeave={() => (hover.current = false)}
        onTouchStart={pause}
        onWheel={pause}
        onFocus={pause}
        className="flex gap-2 md:gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0 pb-1"
      >
        {(counts ? ranked : Array.from({ length: 7 }, () => null)).map((site, i) => (
          <li
            key={site?.slug ?? `skeleton-${i}`}
            className="snap-start shrink-0 basis-[30%] sm:basis-[calc((100%-3*0.5rem)/4)] md:basis-[calc((100%-4*0.75rem)/5)] lg:basis-[calc((100%-6*0.75rem)/7)]"
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
                    sizes="(max-width: 640px) 30vw, (max-width: 768px) 25vw, (max-width: 1024px) 20vw, 14vw"
                    className="object-cover object-top group-hover:scale-[1.04] transition-transform duration-300"
                  />
                  <span
                    className={`absolute top-1 left-1 min-w-6 h-6 px-1 rounded-full inline-flex items-center justify-center text-xs font-extrabold tabular-nums shadow ${
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
                <div className="px-2 py-1.5">
                  <p className="text-[13px] sm:text-sm font-bold text-fg leading-snug line-clamp-1">{site.name}</p>
                  <p className="mt-0.5 text-xs text-muted-fg tabular-nums line-clamp-1">
                    {site.count > 0 ? `48시간 ${site.count.toLocaleString()}번` : '48시간 기록 없음'}
                  </p>
                  <p className="text-xs text-muted-fg/80 tabular-nums line-clamp-1">
                    누적 {(totals[site.slug] ?? 0).toLocaleString()}번
                  </p>
                </div>
              </a>
            ) : (
              <div className="glass rounded-2xl overflow-hidden" aria-hidden>
                <div className="aspect-[8/5] bg-muted animate-pulse" />
                <div className="h-[60px]" />
              </div>
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}
