'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, BookOpen, Music } from 'lucide-react'
import { fetchWorks, WorkCard, type Work } from '@/components/library/Bookshelf'

/** 홈 아래 — 서재 새 책 한 줄 + 음악감상실 입구. 서재를 못 읽으면 그 줄만 숨긴다. */
export function HomeShelves() {
  const [works, setWorks] = useState<Work[]>([])
  useEffect(() => {
    let alive = true
    fetchWorks()
      .then((w) => alive && setWorks(w.slice(0, 8)))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  return (
    <div className="mt-24 space-y-10">
      {works.length > 0 && (
        <section aria-labelledby="home-shelf">
          <div className="flex items-end justify-between gap-3 mb-3">
            <h2 id="home-shelf" className="inline-flex items-center gap-1.5 text-lg md:text-xl font-extrabold text-fg">
              <BookOpen className="w-5 h-5 text-primary-500" />
              서재 — 새로 올린 책
            </h2>
            <Link href="/library" className="inline-flex items-center text-sm font-semibold text-muted-fg hover:text-fg">
              서재 전체 <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>
          <div className="flex gap-3 md:gap-4 overflow-x-auto no-scrollbar snap-x -mx-4 px-4 sm:mx-0 sm:px-0 pb-1">
            {works.map((w) => (
              <div key={w.slug} className="snap-start shrink-0 basis-[38%] sm:basis-[24%] md:basis-[calc((100%-7*1rem)/8)]">
                <WorkCard w={w} />
              </div>
            ))}
          </div>
        </section>
      )}

      <Link
        href="/music"
        className="group flex items-center gap-4 glass rounded-2xl p-5 hover:border-primary-500/60 transition-colors"
      >
        <span className="shrink-0 w-14 h-14 rounded-2xl bg-primary-500/15 inline-flex items-center justify-center text-primary-500">
          <Music className="w-7 h-7" />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-lg font-extrabold text-fg">음악감상실</span>
          <span className="block text-sm text-muted-fg">직접 만든 노래를 가사와 함께 들어요</span>
        </span>
        <ArrowRight className="w-5 h-5 text-muted-fg group-hover:text-fg" />
      </Link>
    </div>
  )
}
