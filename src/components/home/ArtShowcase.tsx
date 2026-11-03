'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, Heart, Palette, X } from 'lucide-react'
import { recordClick } from '@/lib/community'
import { learningSites } from '@/data/projects'
import { ARTON_ORIGIN, mergeWorks, safeWorks, type ShowWork } from '@/lib/art-showcase'

const ARTON = learningSites.find((s) => s.slug === 'arton')
/** 한 번에 보이는 작품 수 — 올 때마다 섞어서 고른다(킹수학 «친구들의 작품»처럼) */
const SHOW = 8

/** 홈 «친구들의 작품» — 아트온에서 선생님이 고른 작품만, 그림만(이름·제목 없이 · 2026-11-03 사용자 «이름은 반드시 지우고»).
 *  작품이 아직 적으면 칸은 남기고 아트온으로 가는 길만 보인다. 전시관을 못 읽으면 칸째로 숨긴다. */
/** 새로 건 작품을 다시 읽는 간격 — 화면이 보일 때만(서버비: 15초 미만 폴링 금지 · 전시관 대답은 엣지 캐시) */
export const SHOWCASE_POLL_MS = 60_000

export function ArtShowcase({ live = false }: { live?: boolean }) {
  const [works, setWorks] = useState<ShowWork[] | null>(null)
  const [big, setBig] = useState<ShowWork | null>(null)
  useEffect(() => {
    let alive = true
    const load = () => {
      if (document.hidden) return
      fetch(`${ARTON_ORIGIN}/api/showcase`)
        .then((r) => (r.ok ? r.json() : null))
        .then((j) => {
          const w = safeWorks(j)
          if (!alive) return
          // 실시간(2026-11-03 «수업 보조 도구에 아트온 작품 실시간으로») — 새로 걸린 작품을 앞에, 나머지는 섞어서
          setWorks((prev) => (w ? mergeWorks(prev, w, SHOW) : prev ?? null))
        })
        .catch(() => alive && setWorks((prev) => prev ?? null))
    }
    load()
    const timer = live ? window.setInterval(load, SHOWCASE_POLL_MS) : 0
    const onShow = () => live && !document.hidden && load()
    document.addEventListener('visibilitychange', onShow)
    return () => {
      alive = false
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onShow)
    }
  }, [live])
  useEffect(() => {
    if (!big) return
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setBig(null)
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [big])
  if (!works || !ARTON?.url) return null
  const go = () => recordClick(ARTON.slug, ARTON.name)
  const shown = works

  return (
    <section aria-labelledby="art-title" data-testid="art-showcase">
      <div className="flex items-end justify-between gap-3 mb-3">
        <h2 id="art-title" className="inline-flex items-center gap-1.5 text-lg md:text-xl font-extrabold text-fg">
          <Palette className="w-5 h-5 text-pink-500" />
          친구들의 작품
          <span className="ml-1 text-sm font-medium text-muted-fg">아트온 전시관</span>
        </h2>
        <a href={ARTON.url} target="_blank" rel="noopener noreferrer" onClick={go} className="inline-flex items-center text-sm font-semibold text-muted-fg hover:text-fg">
          아트온에서 그리기 <ArrowRight className="ml-1 w-4 h-4" />
        </a>
      </div>
      {shown.length ? (
        <ul className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2 md:gap-3">
          {shown.map((w) => (
            <li key={w.id}>
              <button type="button" onClick={() => setBig(w)} aria-label="작품 크게 보기" className="group relative block w-full aspect-square rounded-2xl overflow-hidden border border-line bg-white hover:border-pink-400/70 transition-colors">
                {/* eslint-disable-next-line @next/next/no-img-element -- 아트온 서버 그림(정적 내보내기라 next/image 최적화 없음) */}
                <img src={`${ARTON_ORIGIN}/api/showcase/${w.id}`} alt="친구 작품" loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300" />
                {w.likes > 0 && (
                  <span className="absolute bottom-1 right-1 inline-flex items-center gap-0.5 rounded-full bg-black/55 px-1.5 py-0.5 text-[11px] font-bold text-white tabular-nums">
                    <Heart className="w-3 h-3 fill-current" aria-hidden /> {w.likes}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <a
        href={ARTON.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={go}
        data-testid="art-go"
        className={`group flex items-center gap-4 rounded-2xl p-4 border border-pink-400/30 bg-gradient-to-r from-pink-500/10 via-card to-amber-400/10 hover:border-pink-400/70 transition-colors ${shown.length ? 'mt-3' : ''}`}
      >
        <span className="shrink-0 w-12 h-12 rounded-2xl bg-pink-500/15 inline-flex items-center justify-center text-pink-500">
          <Palette className="w-6 h-6" />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block font-extrabold text-fg">아트온 — 우리 반 그림 갤러리</span>
          <span className="block text-sm text-muted-fg">
            {shown.length ? '선생님이 고른 작품이 여기 걸려요 · 이름 없이 그림만' : '선생님이 «전시관에 걸기»를 누른 작품이 여기 걸려요 — 이름 없이 그림만'}
          </span>
        </span>
        <ArrowRight className="w-5 h-5 text-muted-fg group-hover:text-fg" />
      </a>

      {big && (
        <div role="dialog" aria-modal="true" aria-label="작품 크게 보기" onClick={() => setBig(null)} className="fixed inset-0 z-[60] grid place-items-center bg-black/75 p-4">
          <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-lg rounded-3xl bg-card p-3 shadow-2xl">
            <button type="button" onClick={() => setBig(null)} aria-label="닫기" className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-card border border-line shadow inline-flex items-center justify-center text-fg">
              <X className="w-5 h-5" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${ARTON_ORIGIN}/api/showcase/${big.id}`} alt="친구 작품" className="w-full rounded-2xl bg-white object-contain max-h-[70dvh]" />
            <a href={ARTON.url} target="_blank" rel="noopener noreferrer" onClick={go} className="mt-3 flex items-center justify-center gap-1.5 min-h-11 rounded-2xl bg-pink-500 text-white font-bold hover:bg-pink-600">
              나도 아트온에서 그려 보기 <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </section>
  )
}
