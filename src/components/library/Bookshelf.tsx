'use client'

import { useEffect, useMemo, useState } from 'react'

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
  units: number
  publishedAt: number | null
}

export const KIND_LABEL: Record<Work['kind'], string> = { comic: '학습만화', novel: '소설', book: '책' }

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
  const [kind, setKind] = useState<Work['kind'] | ''>('')

  useEffect(() => {
    let alive = true
    fetchWorks()
      .then((w) => alive && setWorks(w))
      .catch(() => alive && setFailed(true))
    return () => {
      alive = false
    }
  }, [])

  const list = useMemo(() => (works ?? []).filter((w) => !kind || w.kind === kind), [works, kind])
  const count = (k: Work['kind'] | '') => (works ?? []).filter((w) => !k || w.kind === k).length

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
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-6" role="group" aria-label="종류로 고르기">
        {(['', 'comic', 'novel', 'book'] as const).map((k) => (
          <button
            key={k || '_all'}
            type="button"
            aria-pressed={kind === k}
            onClick={() => setKind(k)}
            className={`shrink-0 h-11 px-4 rounded-full text-sm font-semibold border transition-colors ${
              kind === k
                ? 'border-primary-500/60 bg-primary-500/15 text-primary-700 dark:text-primary-200'
                : 'border-line bg-card text-muted-fg hover:text-fg'
            }`}
          >
            {k ? KIND_LABEL[k] : '전체'}
            <span className="ml-1.5 text-xs opacity-70">{count(k)}</span>
          </button>
        ))}
      </div>
      {!works && <p className="py-16 text-center text-muted-fg">책을 불러오는 중…</p>}
      <div data-testid="shelf" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3 sm:gap-4">
        {list.map((w) => (
          <WorkCard key={w.slug} w={w} />
        ))}
      </div>
    </div>
  )
}
