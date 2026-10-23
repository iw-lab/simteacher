'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Radio, Users } from 'lucide-react'
import { recordClick } from '@/lib/community'
import { learningSites } from '@/data/projects'
import { ROOM_BOARD, ROOMS_POLL_MS, safeRooms, type LiveRoom } from '@/lib/live-rooms'

const BY_SLUG = new Map(learningSites.map((s) => [s.slug, s]))

function waited(since: number, now: number) {
  const m = Math.max(0, Math.floor((now - since) / 60_000))
  return m < 1 ? '방금 열림' : `${m}분째 기다림`
}

/** 지금 열린 온라인 방 — 넓은 화면은 오른쪽 칸(따라 내려옴), 폰·태블릿은 인기 순위 바로 밑.
 *  2026-10-23 사용자 «학생들이 온라인방 찾으러 각 게임에 가지 않고 그곳에서 누르면 바로 입장» */
export function LiveRooms({ className = '' }: { className?: string }) {
  const [rooms, setRooms] = useState<LiveRoom[] | null>(null)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    let alive = true
    let timer = 0
    const load = () => {
      if (document.hidden) return
      fetch(`${ROOM_BOARD}/v1/rooms`)
        .then((r) => r.json())
        .then((j) => {
          if (!alive) return
          setRooms(safeRooms(j, (g) => BY_SLUG.get(g)?.url))
          setNow(Date.now())
        })
        .catch(() => alive && setRooms((prev) => prev ?? []))
    }
    load()
    timer = window.setInterval(load, ROOMS_POLL_MS)
    const onShow = () => !document.hidden && load()
    document.addEventListener('visibilitychange', onShow)
    return () => {
      alive = false
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onShow)
    }
  }, [])

  const has = !!rooms && rooms.length > 0

  return (
    <aside aria-labelledby="live-rooms-title" data-testid="live-rooms" className={`glass rounded-2xl p-3 ${has ? '' : 'max-xl:py-2'} ${className}`}>
      <h2 id="live-rooms-title" className="flex items-center gap-1.5 text-base font-extrabold text-fg">
        <span className="relative inline-flex w-2.5 h-2.5">
          {has && <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-70" />}
          <span className={`relative inline-flex w-2.5 h-2.5 rounded-full ${has ? 'bg-emerald-500' : 'bg-muted-fg/40'}`} />
        </span>
        지금 열린 온라인 방
        {has && <span className="ml-auto text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{rooms.length}개</span>}
      </h2>

      {rooms === null ? (
        <p className="mt-2 text-sm text-muted-fg">불러오는 중…</p>
      ) : !has ? (
        <p data-testid="live-rooms-empty" className="mt-1 text-sm text-muted-fg">
          기다리는 방이 없어요. 게임에서 방을 만들면 여기에 떠요.
        </p>
      ) : (
        <ul className="mt-2 flex gap-2 overflow-x-auto no-scrollbar xl:flex-col xl:overflow-visible xl:max-h-[calc(100vh-10rem)] xl:overflow-y-auto">
          {rooms.map((r) => {
            const site = BY_SLUG.get(r.g)
            return (
              <li key={`${r.g}:${r.code}`} className="shrink-0 basis-[88%] sm:basis-[48%] md:basis-[30%] xl:basis-auto">
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="live-room"
                  onClick={() => recordClick(r.g, site?.name ?? r.title)}
                  className="group flex items-center gap-2.5 rounded-xl border border-line bg-card/70 p-2 min-h-[56px] hover:border-emerald-500/60 transition-colors"
                >
                  <span className="relative w-12 h-12 shrink-0 rounded-lg overflow-hidden bg-muted">
                    {site?.image ? (
                      <Image src={site.image} alt="" fill sizes="48px" className="object-cover object-top" />
                    ) : (
                      <Radio className="w-6 h-6 m-3 text-muted-fg" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-fg line-clamp-1">{site?.name.split(' ').filter((w) => /[가-힣]/.test(w)).join(' ') || r.title}</span>
                    <span className="flex items-center gap-1 text-xs text-muted-fg tabular-nums">
                      <Users className="w-3.5 h-3.5" />
                      {r.n}/{r.max}명 · {waited(r.since, now)}
                    </span>
                  </span>
                  <span className="shrink-0 rounded-lg bg-emerald-500 px-2.5 py-1.5 text-sm font-extrabold text-white group-hover:bg-emerald-600">
                    들어가기
                  </span>
                </a>
              </li>
            )
          })}
        </ul>
      )}
    </aside>
  )
}
