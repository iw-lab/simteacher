'use client'

import { useEffect, useMemo, useState } from 'react'
import { isForKids } from '../../lib/kids-shelf'

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

export function WorkCard({ w }: { w: Work }) {
  return (
    <a
      href={w.url}
      target="_blank"
      rel="noopener noreferrer"
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
      </div>
    </a>
  )
}

export function Bookshelf() {
  const [works, setWorks] = useState<Work[] | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let alive = true
    fetchWorks()
      .then((w) => alive && setWorks(w))
      .catch(() => alive && setFailed(true))
    return () => {
      alive = false
    }
  }, [])

  // 아이들이 쓰는 곳이라 아동용만 — 청소년·어른 책은 이수서재에만 있다
  const groups = useMemo(() => groupBySeries((works ?? []).filter(isForKids)), [works])

  if (failed) {
    return (
      <p className="py-16 text-center text-muted-fg">
        서재를 불러오지 못했어요.{' '}
        <a href={LIBRARY} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary-600 dark:text-primary-300 hover:underline">
          이수서재에서 바로 보기
        </a>
      </p>
    )
  }

  return (
    <div className="pb-16">
      {!works && <p className="py-16 text-center text-muted-fg">책을 불러오는 중…</p>}
      <div data-testid="shelf" className="space-y-8 mt-4">
        {groups.map((g) => (
          <section key={g.title}>
            <h2 className="mb-3 text-lg font-extrabold text-fg">
              {g.title} <span className="text-sm font-medium text-muted-fg">{g.works.length}</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3 sm:gap-4">
              {g.works.map((w) => (
                <WorkCard key={w.slug} w={w} />
              ))}
            </div>
          </section>
        ))}
      </div>
      {works && (
        <p className="mt-10 text-center text-sm text-muted-fg">
          청소년·어른을 위한 소설과 책은{' '}
          <a href={LIBRARY} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary-600 dark:text-primary-300 hover:underline">
            이수서재
          </a>
          에 있어요.
        </p>
      )}
    </div>
  )
}
