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
  seriesSlug?: string | null
  /** 서재 태그 — `대상:초등|중학생 이상|어른` 이 붙어 있다(2026-10-23) */
  tags?: string[]
  units: number
  publishedAt: number | null
}

export const KIND_LABEL: Record<Work['kind'], string> = { comic: '학습만화', novel: '소설', book: '책' }

export type Audience = '초등' | '중학생 이상' | '어른'
export const AUDIENCE_LABEL: Record<Audience, string> = {
  초등: '아이들',
  '중학생 이상': '중학생 이상',
  어른: '선생님·부모님',
}

/** 태그가 없던 옛 응답이면 보수적으로: 만화=초등, 그 밖=어른 */
export function audienceOf(w: Work): Audience {
  const t = w.tags?.find((x) => x.startsWith('대상:'))?.slice(3)
  if (t === '초등' || t === '중학생 이상' || t === '어른') return t
  return w.kind === 'comic' ? '초등' : '어른'
}

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
  const [aud, setAud] = useState<Audience>('초등')

  useEffect(() => {
    let alive = true
    fetchWorks()
      .then((w) => alive && setWorks(w))
      .catch(() => alive && setFailed(true))
    return () => {
      alive = false
    }
  }, [])

  const groups = useMemo(
    () => groupBySeries((works ?? []).filter((w) => audienceOf(w) === aud)),
    [works, aud]
  )
  const count = (a: Audience) => (works ?? []).filter((w) => audienceOf(w) === a).length

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
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-2" role="group" aria-label="누가 읽는 책인지 고르기">
        {(['초등', '중학생 이상', '어른'] as const).map((a) => (
          <button
            key={a}
            type="button"
            aria-pressed={aud === a}
            onClick={() => setAud(a)}
            className={`shrink-0 h-11 px-4 rounded-full text-sm font-semibold border transition-colors ${
              aud === a
                ? 'border-primary-500/60 bg-primary-500/15 text-primary-700 dark:text-primary-200'
                : 'border-line bg-card text-muted-fg hover:text-fg'
            }`}
          >
            {AUDIENCE_LABEL[a]}
            <span className="ml-1.5 text-xs opacity-70">{count(a)}</span>
          </button>
        ))}
      </div>
      {aud !== '초등' && (
        <p className="mb-4 text-sm text-muted-fg">
          {aud === '어른'
            ? '선생님과 부모님을 위한 책이에요. 아이들 책은 «아이들» 칸에 있어요.'
            : '전쟁 장면 등이 나오는 소설이라 중학생 이상에게 권해요.'}
        </p>
      )}
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
    </div>
  )
}
