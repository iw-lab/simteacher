'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react'
import { isForKids } from '../../lib/kids-shelf'
import { fetchBookClicks, recordBookClick } from '../../lib/community'
import { rankBooks } from '../../lib/ranking'

/** 이수서재 공개 목록 — 서재에 책을 올리면 여기에도 저절로 뜬다(2026-10-23). 읽기는 이수서재에서. */
export const LIBRARY = 'https://iwlibrary.simssijjang.workers.dev'

export interface Work {
  slug: string
  kind: 'comic' | 'novel' | 'book'
  title: string
  subtitle: string
  cover: string | null
  url: string
  series: string | null
  seriesSlug?: string | null
  /** 서재 태그 — `대상:초등|중학생 이상|어른` 이 붙어 있다(2026-10-23) */
  tags?: string[]
  units: number
  publishedAt: number | null
}

export const KIND_LABEL: Record<Work['kind'], string> = { comic: '학습만화', novel: '소설', book: '책' }

/** 같은 시리즈끼리 묶는다(시리즈 없는 작품은 종류별 한 묶음). 순서는 목록에 처음 나온 순. */
export function groupBySeries(works: Work[]): { title: string; works: Work[] }[] {
  const m = new Map<string, { title: string; works: Work[] }>()
  for (const w of works) {
    const k = w.series ?? `_${w.kind}`
    const title = w.series ?? (w.kind === 'comic' ? '학습만화' : KIND_LABEL[w.kind])
    if (!m.has(k)) m.set(k, { title, works: [] })
    m.get(k)!.works.push(w)
  }
  // 시리즈 안은 권 순서(slug 의 번호)대로 — 1단원이 맨 앞
  for (const g of m.values()) g.works.sort((a, b) => a.slug.localeCompare(b.slug, undefined, { numeric: true }))
  return [...m.values()]
}

export async function fetchWorks(): Promise<Work[]> {
  const r = await fetch(`${LIBRARY}/api/public/works`)
  if (!r.ok) throw new Error(`서재 ${r.status}`)
  return ((await r.json()) as { works: Work[] }).works
}

/** 표지를 누르면 작품 소개를 거치지 않고 1화(소설은 1장) 읽기 화면으로 바로 간다(2026-10-23 사용자 «그 화로 바로»). */
export function readUrl(w: Work): string {
  return w.kind === 'comic' ? `${w.url}/1` : `${w.url}/chapters/1`
}

/** 표지 카드 — clicks 를 주면 아래에 누적 클릭 수를 적는다(서재 탭). 누르면 클릭을 센다(홈 카드와 같은 셈법). */
export function WorkCard({ w, clicks }: { w: Work; clicks?: number }) {
  return (
    <a
      href={readUrl(w)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => recordBookClick(w.slug)}
      className="group block glass rounded-2xl overflow-hidden hover:border-primary-500/60 hover:-translate-y-1 transition-all"
    >
      <div className="relative aspect-[3/4] bg-muted overflow-hidden border-b border-line">
        {w.cover && (
          // 다른 집(이수서재)의 표지라 next/image 최적화를 거치지 않는다(정적 내보내기)
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={w.cover}
            alt={`${w.title} 표지`}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
          />
        )}
        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 text-white text-xs font-semibold">
          {KIND_LABEL[w.kind]}
        </span>
      </div>
      <div className="px-3 py-2.5">
        <p className="text-sm font-bold text-fg leading-snug line-clamp-2">{w.title}</p>
        {w.series && <p className="mt-0.5 text-xs text-muted-fg truncate">{w.series}</p>}
        {clicks !== undefined && <p className="mt-0.5 text-xs text-muted-fg/80 tabular-nums">누적 {clicks.toLocaleString()}번</p>}
      </div>
    </a>
  )
}

const RANK_BADGE = ['bg-amber-400 text-amber-950', 'bg-slate-300 text-slate-900', 'bg-orange-400 text-orange-950']

/** 맨 위 인기 순위 — 홈처럼 최근 48시간 클릭 1등부터 마지막까지 표지를 가로로 민다 */
function PopularBooks({ ranked, grand }: { ranked: ReturnType<typeof rankBooks<Work>>; grand: number }) {
  const rail = useRef<HTMLOListElement>(null)
  const page = (dir: 1 | -1) => rail.current?.scrollBy({ left: dir * rail.current.clientWidth, behavior: 'smooth' })
  return (
    <section aria-labelledby="book-popular" className="mt-4 mb-10">
      <div className="flex items-end justify-between gap-3 mb-3">
        <h2 id="book-popular" className="inline-flex items-center gap-1.5 text-lg md:text-xl font-extrabold text-fg">
          <Flame className="w-5 h-5 text-orange-500" />
          인기 순위
          <span className="ml-1 text-sm font-medium text-muted-fg">
            최근 48시간 · {ranked.length}권 전체{grand > 0 && ` · 총 누적 ${grand.toLocaleString()}번`}
          </span>
        </h2>
        <div className="hidden md:flex gap-2">
          {([-1, 1] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => page(d)}
              aria-label={d < 0 ? '앞 순위 보기' : '다음 순위 보기'}
              className="w-11 h-11 rounded-full border border-line bg-card inline-flex items-center justify-center text-muted-fg hover:text-fg hover:border-primary-500/40"
            >
              {d < 0 ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
          ))}
        </div>
      </div>
      <ol
        ref={rail}
        data-testid="book-popular-rail"
        className="flex gap-3 md:gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0 pb-1"
      >
        {ranked.map((w) => (
          <li key={w.slug} className="snap-start shrink-0 basis-[40%] sm:basis-[calc((100%-3*0.75rem)/4)] lg:basis-[calc((100%-5*1rem)/6)]">
            <a
              href={readUrl(w)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => recordBookClick(w.slug)}
              className="group block glass rounded-2xl overflow-hidden hover:border-primary-500/60 transition-colors"
            >
              <div className="relative aspect-[3/4] bg-muted overflow-hidden border-b border-line">
                {w.cover && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={w.cover} alt={`${w.title} 표지`} loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
                )}
                <span
                  className={`absolute top-1.5 left-1.5 min-w-7 h-7 px-1.5 rounded-full inline-flex items-center justify-center text-sm font-extrabold tabular-nums shadow ${
                    RANK_BADGE[w.rank - 1] ?? 'bg-black/60 text-white'
                  }`}
                >
                  {w.rank}
                </span>
              </div>
              <div className="px-2.5 py-2">
                <p className="text-[13px] sm:text-sm font-bold text-fg leading-snug line-clamp-1">{w.title}</p>
                <p className="mt-0.5 text-xs text-muted-fg tabular-nums">
                  {w.recent > 0 ? `48시간 ${w.recent.toLocaleString()}번` : '48시간 기록 없음'}
                </p>
                <p className="text-xs text-muted-fg/80 tabular-nums">누적 {w.total.toLocaleString()}번</p>
              </div>
            </a>
          </li>
        ))}
      </ol>
    </section>
  )
}

export function Bookshelf() {
  const [works, setWorks] = useState<Work[] | null>(null)
  const [failed, setFailed] = useState(false)
  // 클릭 수 — 못 읽으면 순위 줄·숫자만 숨기고 책장은 그대로(순위를 지어낼 수 없다)
  const [clicks, setClicks] = useState<{ recent: Record<string, number>; total: Record<string, number> } | null>(null)

  useEffect(() => {
    let alive = true
    fetchWorks()
      .then((w) => alive && setWorks(w))
      .catch(() => alive && setFailed(true))
    fetchBookClicks()
      .then((c) => alive && setClicks(c))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  // 아이들이 쓰는 곳이라 아동용만 — 청소년·어른 책은 여기 싣지도 안내하지도 않는다(2026-10-23 사용자 «일반인용 책이랑 있어서 부담»)
  const kids = useMemo(() => (works ?? []).filter(isForKids), [works])
  const groups = useMemo(() => groupBySeries(kids), [kids])
  const ranked = useMemo(() => (clicks ? rankBooks(kids, clicks.recent, clicks.total) : []), [kids, clicks])
  const grand = ranked.reduce((n, w) => n + w.total, 0)

  if (failed) {
    return (
      <p className="py-16 text-center text-muted-fg">
        서재를 불러오지 못했어요. 잠시 뒤 다시 열어 주세요.
      </p>
    )
  }

  return (
    <div className="pb-16">
      {!works && <p className="py-16 text-center text-muted-fg">책을 불러오는 중…</p>}
      {ranked.length > 0 && <PopularBooks ranked={ranked} grand={grand} />}
      <div data-testid="shelf" className="space-y-8 mt-4">
        {groups.map((g) => (
          <section key={g.title}>
            <h2 className="mb-3 text-lg font-extrabold text-fg">
              {g.title} <span className="text-sm font-medium text-muted-fg">{g.works.length}</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3 sm:gap-4">
              {g.works.map((w) => (
                <WorkCard key={w.slug} w={w} clicks={clicks ? (clicks.total[w.slug] ?? 0) : undefined} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
