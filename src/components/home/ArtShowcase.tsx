'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, ChevronLeft, ChevronRight, EyeOff, Heart, Palette, X } from 'lucide-react'
import { recordClick } from '@/lib/community'
import { learningSites } from '@/data/projects'
import { ARTON_ORIGIN, deviceId, safeWorks, type ShowWork } from '@/lib/art-showcase'
import { useAutoRail } from '@/lib/use-auto-rail'

const ARTON = learningSites.find((s) => s.slug === 'arton')
/** 새로 건 작품을 다시 읽는 간격 — 화면이 보일 때만(서버비: 15초 미만 폴링 금지 · 전시관 대답은 엣지 캐시) */
export const SHOWCASE_POLL_MS = 60_000
/** 자동으로 다음 칸으로 넘기는 간격 — 인기 순위 띠와 같게 */
export const SHOWCASE_ADVANCE_MS = 3500
const LIKED_KEY = 'ssam.artLiked'

const readLiked = (): Set<string> => {
  try { return new Set(JSON.parse(localStorage.getItem(LIKED_KEY) || '[]')) } catch { return new Set() }
}

/** «학생 작품» — 아트온에서 선생님이 고른 작품만, 그림만(이름·제목 없이).
 *  2026-11-03 사용자: 이번 주 하트 순위(50위까지) · 새 작품은 3칸마다 자리 보장 · 인기 순위처럼 자동 넘김 + 좌우 단추 · 여기서 바로 하트 · «숨겨 주세요»
 *  전시관을 못 읽으면 칸째로 숨긴다. */
export function ArtShowcase({ live = false }: { live?: boolean }) {
  const [works, setWorks] = useState<ShowWork[] | null>(null)
  const [big, setBig] = useState<ShowWork | null>(null)
  const [liked, setLiked] = useState<Set<string>>(() => (typeof window === 'undefined' ? new Set() : readLiked()))
  const [note, setNote] = useState('')
  const { rail, page, pause, bind } = useAutoRail<HTMLOListElement>(!!works && works.length > 0, SHOWCASE_ADVANCE_MS)

  useEffect(() => {
    let alive = true
    const load = () => {
      if (document.hidden) return
      fetch(`${ARTON_ORIGIN}/api/showcase`)
        .then((r) => (r.ok ? r.json() : null))
        .then((j) => { const w = safeWorks(j); if (alive) setWorks((prev) => w ?? prev ?? null) })
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

  /** 하트 — 같은 기기는 한 작품에 하나(다시 누르면 취소). 화면은 먼저 바꾸고 서버 숫자로 맞춘다 */
  const toggleLike = async (w: ShowWork) => {
    pause()
    const on = !liked.has(w.id)
    const next = new Set(liked); if (on) next.add(w.id); else next.delete(w.id)
    setLiked(next)
    try { localStorage.setItem(LIKED_KEY, JSON.stringify([...next].slice(-500))) } catch {}
    const bump = (n: number) => setWorks((ws) => ws?.map((x) => (x.id === w.id ? { ...x, likes: Math.max(0, n) } : x)) ?? ws)
    bump(w.likes + (on ? 1 : -1))
    try {
      const r = await fetch(`${ARTON_ORIGIN}/api/showcase/${w.id}/like`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ did: deviceId(localStorage), on }) })
      const j = await r.json()
      if (r.ok && typeof j.likes === 'number') bump(j.likes)
      else if (j.error === 'cap') setNote('오늘은 하트를 많이 눌렀어요 — 내일 또 눌러 주세요')
    } catch {}
  }
  /** «이름이 보여요 · 숨겨 주세요» — 한 번이면 바로 내려가고 그 반 선생님께 알려진다 */
  const report = async (w: ShowWork) => {
    setBig(null)
    setWorks((ws) => ws?.filter((x) => x.id !== w.id) ?? ws)
    setNote('알려 줘서 고마워요 — 바로 내렸고 선생님께 알렸어요')
    try { await fetch(`${ARTON_ORIGIN}/api/showcase/${w.id}/report`, { method: 'POST' }) } catch {}
  }
  useEffect(() => { if (!note) return; const t = window.setTimeout(() => setNote(''), 3500); return () => window.clearTimeout(t) }, [note])

  if (!works || !ARTON?.url) return null
  const go = () => recordClick(ARTON.slug, ARTON.name)

  return (
    <section aria-labelledby="art-title" data-testid="art-showcase">
      <div className="flex items-end justify-between gap-3 mb-3">
        <h2 id="art-title" className="inline-flex flex-wrap items-baseline gap-x-1.5 text-lg md:text-xl font-extrabold text-fg">
          <Palette className="w-5 h-5 text-pink-500 self-center" />
          학생 작품
          <span className="text-sm font-medium text-muted-fg">이번 주 하트 순 · 새 그림은 3칸마다{works.length ? ` · ${works.length}점` : ''}</span>
        </h2>
        <a href={ARTON.url} target="_blank" rel="noopener noreferrer" onClick={go} className="shrink-0 inline-flex items-center text-sm font-semibold text-muted-fg hover:text-fg">
          아트온에서 그리기 <ArrowRight className="ml-1 w-4 h-4" />
        </a>
      </div>
      {works.length ? (
        <div className="relative">
          <button type="button" onClick={() => page(-1)} data-testid="art-prev" aria-label="앞 작품 보기" className="inline-flex absolute -left-3 md:-left-5 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full border border-line bg-card shadow-md items-center justify-center text-muted-fg hover:text-fg hover:border-pink-400/50">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button type="button" onClick={() => page(1)} data-testid="art-next" aria-label="다음 작품 보기" className="inline-flex absolute -right-3 md:-right-5 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full border border-line bg-card shadow-md items-center justify-center text-muted-fg hover:text-fg hover:border-pink-400/50">
            <ChevronRight className="w-5 h-5" />
          </button>
          <ol ref={rail} data-testid="art-rail" data-auto-ms={SHOWCASE_ADVANCE_MS} {...bind} className="flex gap-2 md:gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth">
            {works.map((w, i) => (
              <li key={w.id} data-art={w.id} className="snap-start shrink-0 basis-[calc((100%-3*0.5rem)/4)] sm:basis-[calc((100%-5*0.5rem)/6)] lg:basis-[calc((100%-7*0.75rem)/8)]">
                <div className="group relative w-full aspect-square rounded-2xl overflow-hidden border border-line bg-white hover:border-pink-400/70 transition-colors">
                  <button type="button" onClick={() => { pause(); setBig(w) }} aria-label={`${i + 1}위 작품 크게 보기`} className="block w-full h-full">
                    {/* eslint-disable-next-line @next/next/no-img-element -- 아트온 서버 그림(정적 내보내기라 next/image 최적화 없음) */}
                    <img src={`${ARTON_ORIGIN}/api/showcase/${w.id}`} alt="학생 작품" loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300" />
                  </button>
                  <span data-art-rank className={`absolute top-1 left-1 min-w-6 h-6 px-1 rounded-full inline-flex items-center justify-center text-xs font-extrabold tabular-nums shadow ${i === 0 ? 'bg-amber-400 text-amber-950' : i === 1 ? 'bg-slate-300 text-slate-900' : i === 2 ? 'bg-orange-400 text-orange-950' : 'bg-black/60 text-white'}`}>
                    {i + 1}
                  </span>
                  {w.fresh && <span data-art-new className="absolute top-1 right-1 rounded-full bg-pink-500 px-1.5 py-0.5 text-[10px] font-black text-white shadow">NEW</span>}
                  <button
                    type="button"
                    onClick={() => toggleLike(w)}
                    data-art-like
                    aria-pressed={liked.has(w.id)}
                    aria-label={liked.has(w.id) ? '하트 취소' : '하트 주기'}
                    className={`absolute bottom-1 right-1 inline-flex items-center gap-0.5 rounded-full px-2 min-h-8 text-xs font-bold tabular-nums shadow transition-colors ${liked.has(w.id) ? 'bg-pink-500 text-white' : 'bg-black/55 text-white hover:bg-pink-500/80'}`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${liked.has(w.id) ? 'fill-current' : ''}`} aria-hidden /> {w.likes}
                  </button>
                  {w.r && <span data-art-sido className="absolute bottom-1 left-1 rounded-full bg-black/55 px-1.5 py-0.5 text-[10px] font-bold text-white shadow">{w.r}</span>}
                </div>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
      {note && <p role="status" className="mt-2 text-sm font-semibold text-pink-600 dark:text-pink-400">{note}</p>}
      <a
        href={ARTON.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={go}
        data-testid="art-go"
        className={`group flex items-center gap-4 rounded-2xl p-4 border border-pink-400/30 bg-gradient-to-r from-pink-500/10 via-card to-amber-400/10 hover:border-pink-400/70 transition-colors ${works.length ? 'mt-3' : ''}`}
      >
        <span className="shrink-0 w-12 h-12 rounded-2xl bg-pink-500/15 inline-flex items-center justify-center text-pink-500">
          <Palette className="w-6 h-6" />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block font-extrabold text-fg">아트온 — 우리 반 그림 갤러리</span>
          <span className="block text-sm text-muted-fg">
            {works.length ? '선생님이 고른 작품이 여기 걸려요 · 이름 없이 그림만' : '선생님이 «전시관에 걸기»를 누른 작품이 여기 걸려요 — 이름 없이 그림만'}
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
            <img src={`${ARTON_ORIGIN}/api/showcase/${big.id}`} alt="학생 작품" className="w-full rounded-2xl bg-white object-contain max-h-[65dvh]" />
            {big.r && <p data-art-big-sido className="mt-2 text-center text-sm font-semibold text-muted-fg">{big.r} 친구의 그림</p>}
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={() => { const w = works.find((x) => x.id === big.id) ?? big; toggleLike(w) }} data-art-big-like className={`flex-1 inline-flex items-center justify-center gap-1.5 min-h-11 rounded-2xl font-bold ${liked.has(big.id) ? 'bg-pink-500 text-white' : 'bg-pink-500/15 text-pink-600 dark:text-pink-300 hover:bg-pink-500/25'}`}>
                <Heart className={`w-4 h-4 ${liked.has(big.id) ? 'fill-current' : ''}`} /> {works.find((x) => x.id === big.id)?.likes ?? big.likes}
              </button>
              <a href={ARTON.url} target="_blank" rel="noopener noreferrer" onClick={go} className="flex-[2] flex items-center justify-center gap-1.5 min-h-11 rounded-2xl bg-pink-500 text-white font-bold hover:bg-pink-600">
                나도 아트온에서 그려 보기 <ArrowRight className="w-4 h-4" />
              </a>
            </div>
            <button type="button" onClick={() => report(big)} data-art-report className="mt-2 w-full inline-flex items-center justify-center gap-1 min-h-10 rounded-xl text-xs font-semibold text-muted-fg hover:text-red-600 hover:bg-red-500/10">
              <EyeOff className="w-3.5 h-3.5" /> 그림에 이름·학교가 보여요 · 숨겨 주세요
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
