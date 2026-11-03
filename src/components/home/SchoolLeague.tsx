'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { Crown, Flame, School, Search, Trophy, X } from 'lucide-react'
import { learningSites, type LearningSite } from '@/data/projects'
import { recordClick } from '@/lib/community'
import {
  fetchBoard, findSchools, leader, mySpots, readMySchool, MY_SCHOOL_KEY,
  type Board, type GameBoard, type Medal, type MySchool, type Span,
} from '@/lib/school-league'

const SITE = new Map(learningSites.map((s) => [s.slug, s]))
/** 처음에 보이는 게임 1위 칸 수 — 나머지는 «모두 보기» */
const FIRST = 6   /* 2026-11-03 «학교 대항전이 너무 많이 차지» — 8 → 6 */

/** 판 한 벌을 여러 칸이 같이 쓴다(요청은 한 번) — 못 읽으면 null 그대로(칸이 숨는다) */
export function useBoard(): Board | null {
  const [b, setB] = useState<Board | null>(null)
  useEffect(() => {
    let alive = true
    fetchBoard().then((x) => alive && setB(x))
    return () => {
      alive = false
    }
  }, [])
  return b
}

/** 판이 오기 전엔 칸이 null 이라(서버·첫 칠하기 모두 빈칸) 기기 값을 처음부터 읽어도 화면이 갈리지 않는다 */
function useMySchool(): [MySchool | null, (s: MySchool | null) => void] {
  const [me, setMe] = useState<MySchool | null>(() => {
    try {
      return typeof window === 'undefined' ? null : readMySchool(localStorage.getItem(MY_SCHOOL_KEY))
    } catch {
      return null
    }
  })
  const set = (s: MySchool | null) => {
    setMe(s)
    try {
      if (s) localStorage.setItem(MY_SCHOOL_KEY, JSON.stringify(s))
      else localStorage.removeItem(MY_SCHOOL_KEY)
    } catch {}
  }
  return [me, set]
}

const MEDAL = ['🥇', '🥈', '🥉']
const fmt = (n: number) => n.toLocaleString()

function MedalCount({ m }: { m: Medal }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-bold tabular-nums">
      {m.g > 0 && <span>🥇{m.g}</span>}
      {m.sv > 0 && <span>🥈{m.sv}</span>}
      {m.b > 0 && <span>🥉{m.b}</span>}
    </span>
  )
}

/** 시상대 — 2·1·3 순서로 세우고 1위 단이 가장 높다 */
function Podium({ medals, me }: { medals: Medal[]; me: string | undefined }) {
  const order = [1, 0, 2].map((i) => medals[i]).filter(Boolean)
  const h = ['h-7', 'h-10', 'h-5']   /* 시상대 낮게(칸 높이 줄이기) */
  return (
    <div className="flex items-end justify-center gap-2 sm:gap-3 pt-1" data-testid="league-podium">
      {order.map((m) => {
        const rank = medals.indexOf(m)
        return (
          <div key={m.c} className={`flex-1 max-w-[9.5rem] flex flex-col items-center ${rank === 0 ? 'league-pop' : ''}`}>
            <span className={`text-2xl ${rank === 0 ? 'league-bob' : ''}`} aria-hidden>{MEDAL[rank]}</span>
            <span className={`mt-0.5 w-full text-center text-sm font-extrabold leading-tight line-clamp-1 ${m.c === me ? 'text-primary-600 dark:text-primary-300' : 'text-fg'}`}>
              {m.n}
            </span>
            <span className="text-[11px] text-muted-fg">{m.r}</span>
            <MedalCount m={m} />
            <div
              className={`mt-1 w-full ${h[rank]} rounded-t-lg flex items-start justify-center pt-0.5 text-sm font-black text-white/95 shadow-inner ${
                rank === 0 ? 'bg-gradient-to-b from-amber-300 to-amber-500' : rank === 1 ? 'bg-gradient-to-b from-slate-300 to-slate-400' : 'bg-gradient-to-b from-orange-300 to-orange-500'
              }`}
            >
              {rank + 1}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function SchoolPicker({ board, me, setMe }: { board: Board; me: MySchool | null; setMe: (s: MySchool | null) => void }) {
  const [q, setQ] = useState('')
  const hits = useMemo(() => findSchools(board, q), [board, q])
  if (me)
    return (
      <div className="flex items-center gap-2 text-sm">
        <School className="w-4 h-4 text-primary-500 shrink-0" aria-hidden />
        <span className="font-bold text-fg truncate">우리 학교 · {me.n}</span>
        <button type="button" onClick={() => setMe(null)} className="ml-auto inline-flex items-center gap-0.5 min-h-9 px-2 rounded-lg text-xs text-muted-fg hover:text-fg hover:bg-muted" aria-label="우리 학교 바꾸기">
          <X className="w-3.5 h-3.5" /> 바꾸기
        </button>
      </div>
    )
  return (
    <div className="relative">
      <label className="flex items-center gap-2 rounded-xl border border-line bg-card px-3 min-h-11 focus-within:border-primary-500">
        <Search className="w-4 h-4 text-muted-fg shrink-0" aria-hidden />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="우리 학교 이름 (예: 김제 중앙)"
          aria-label="우리 학교 찾기"
          data-testid="league-school-input"
          className="flex-1 min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-fg"
        />
      </label>
      {q.trim() && (
        <ul className="absolute z-20 left-0 right-0 mt-1 rounded-xl border border-line bg-card shadow-lg overflow-hidden">
          {hits.length ? (
            hits.map((s) => (
              <li key={s.c}>
                <button type="button" onClick={() => { setMe(s); setQ('') }} className="w-full text-left px-3 min-h-10 text-sm hover:bg-muted">
                  <b className="text-fg">{s.n}</b> <span className="text-muted-fg text-xs">{s.r}</span>
                </button>
              </li>
            ))
          ) : (
            <li className="px-3 py-2.5 text-xs text-muted-fg leading-relaxed">
              아직 순위에 없는 학교예요. 아래 게임에서 학교를 정하고 한 판만 해도 올라와요!
            </li>
          )}
        </ul>
      )}
    </div>
  )
}

function MySummary({ board, me }: { board: Board; me: MySchool }) {
  const spots = mySpots(board, me.c)
  const m = board.medals.find((x) => x.c === me.c)
  const mr = m ? board.medals.indexOf(m) + 1 : null
  if (!spots.length)
    return <p className="mt-2 text-xs text-muted-fg leading-relaxed">아직 순위 밖이에요 — 오른쪽 게임에서 첫 점수를 올려 보세요!</p>
  return (
    <div className="mt-2 space-y-1.5" data-testid="league-mine">
      <p className="text-xs text-muted-fg">
        {mr ? <>메달 순위 <b className="text-fg">{mr}위</b> · </> : null}순위에 든 게임 <b className="text-fg">{spots.length}개</b>
      </p>
      <ul className="flex flex-wrap gap-1.5">
        {spots.slice(0, 6).map((s) => {
          const site = SITE.get(s.slug)
          if (!site) return null
          return (
            <li key={s.slug}>
              <a href={site.url} target="_blank" rel="noopener noreferrer" onClick={() => recordClick(site.slug, site.name)} className="inline-flex items-center gap-1 rounded-full border border-line bg-card px-2.5 min-h-8 text-xs hover:border-primary-500/60">
                <span className="font-semibold text-fg">{site.name}</span>
                <span className="tabular-nums text-primary-600 dark:text-primary-300 font-bold">{s.week ?? s.today}위</span>
                {s.behind !== null && <span className="text-muted-fg">· {fmt(s.behind)}점 차</span>}
              </a>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function GameLeader({ g, site, span, me, className = '' }: { g: GameBoard; site: LearningSite; span: Span; me: string | undefined; className?: string }) {
  const l = leader(g, span)
  const mine = me ? g[span].findIndex((x) => x.c === me) : -1
  return (
    <a
      href={site.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => recordClick(site.slug, site.name)}
      data-testid="league-game"
      className={`group flex gap-2.5 rounded-2xl border border-line bg-card/80 p-2 hover:border-amber-400/70 hover:-translate-y-0.5 transition-all ${className}`}
    >
      <span className="relative shrink-0 w-20 sm:w-24 aspect-[8/5] rounded-xl overflow-hidden bg-muted">
        <Image src={site.image} alt="" fill sizes="96px" className="object-cover object-top" />
      </span>
      <span className="min-w-0 flex-1 flex flex-col justify-center">
        <span className="text-[13px] font-bold text-fg leading-snug line-clamp-1">{site.name}</span>
        {l ? (
          <>
            <span className="mt-0.5 inline-flex items-center gap-1 text-[13px] leading-tight min-w-0">
              <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" aria-hidden />
              <b className={`truncate ${l.top.c === me ? 'text-primary-600 dark:text-primary-300' : 'text-fg'}`}>{l.top.n}</b>
              <span className="shrink-0 text-muted-fg tabular-nums text-xs">{fmt(l.top.s)}점</span>
            </span>
            <span className="text-[11px] text-muted-fg tabular-nums line-clamp-1">
              {mine > 0 ? <b className="text-primary-600 dark:text-primary-300">우리 학교 {mine + 1}위 · </b> : null}
              {l.gap === null ? '혼자 달리는 중 — 따라잡아요!' : l.gap === 0 ? '공동 1위 — 한 판이면 뒤집혀요!' : `2위와 ${fmt(l.gap)}점 차`}
            </span>
          </>
        ) : (
          <span className="mt-0.5 text-xs text-muted-fg">{span === 'today' ? '오늘 1위 자리가 비었어요 — 첫 1위 도전!' : '1위 자리가 비었어요'}</span>
        )}
      </span>
    </a>
  )
}

/** 홈 «학교 대항전» — 이번 주 메달 시상대 + 게임별 1위 + 우리 학교. 판을 못 읽으면 칸째로 숨긴다(지어내지 않는다). */
export function SchoolLeague() {
  const board = useBoard()
  const [me, setMe] = useMySchool()
  const [span, setSpan] = useState<Span>('week')
  const [all, setAll] = useState(false)
  if (!board) return null
  const games = board.games.filter((g) => SITE.get(g.slug)?.url)
  // 1위가 있는 게임 먼저(그 기간 이용 많은 순은 워커가 세웠다)
  const shown = [...games].sort((a, b) => Number(!!leader(b, span)) - Number(!!leader(a, span)))
  const list = all ? shown : shown.slice(0, FIRST)
  const top = board.medals.slice(0, 5)   /* 시상대 3 + 4·5위 */
  const meMedal = me ? board.medals.findIndex((m) => m.c === me.c) : -1

  return (
    <section aria-labelledby="league-title" data-testid="school-league" className="mb-8 relative overflow-hidden rounded-2xl border border-amber-400/40 bg-gradient-to-br from-amber-400/15 via-card to-primary-500/10 p-3 md:p-4 shadow-sm">
      <div className="league-shine pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative flex flex-wrap items-center gap-x-3 gap-y-2 mb-2">
        <h2 id="league-title" className="inline-flex items-center gap-2 text-lg font-black text-fg">
          <Trophy className="w-5 h-5 text-amber-500 league-bob" />
          학교 대항전
        </h2>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 px-2.5 py-0.5 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" aria-hidden /> 실시간
        </span>
        <span className="flex-1" aria-hidden />
        <span className="flex flex-wrap gap-1.5 text-xs text-muted-fg" data-testid="league-stats">
          <span className="rounded-full border border-line bg-card/70 px-2.5 py-1">게임 <b className="text-fg tabular-nums">{games.length}</b>개</span>
          {board.total.schools > 0 && <span className="rounded-full border border-line bg-card/70 px-2.5 py-1">학교 <b className="text-fg tabular-nums">{fmt(board.total.schools)}</b>곳+</span>}
          <span className="rounded-full border border-line bg-card/70 px-2.5 py-1 inline-flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-orange-500" aria-hidden />오늘 <b className="text-fg tabular-nums">{fmt(board.total.playsToday)}</b>판
          </span>
        </span>
      </div>

      <div className="relative grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,8fr)]">
        <div className="min-w-0">
          <h3 className="text-sm font-extrabold text-fg mb-1">이번 주 메달 순위 <span className="font-medium text-muted-fg">· 게임마다 1~3위 학교에 금·은·동</span></h3>
          {top.length ? (
            <>
              <Podium medals={top} me={me?.c} />
              <ol start={4} className="mt-2 divide-y divide-line rounded-xl border border-line bg-card/70 overflow-hidden">
                {top.slice(3).map((m, i) => (
                  <li key={m.c} className={`flex items-center gap-2 px-3 min-h-8 text-sm ${m.c === me?.c ? 'bg-primary-500/10' : ''}`}>
                    <span className="w-5 text-right font-black tabular-nums text-muted-fg">{i + 4}</span>
                    <span className="font-bold text-fg truncate">{m.n}</span>
                    <span className="text-[11px] text-muted-fg">{m.r}</span>
                    <span className="ml-auto"><MedalCount m={m} /></span>
                  </li>
                ))}
                {meMedal >= 5 && me && (
                  <li className="flex items-center gap-2 px-3 min-h-9 text-sm bg-primary-500/10">
                    <span className="w-5 text-right font-black tabular-nums text-primary-600 dark:text-primary-300">{meMedal + 1}</span>
                    <span className="font-bold text-fg truncate">{me.n}</span>
                    <span className="ml-auto"><MedalCount m={board.medals[meMedal]} /></span>
                  </li>
                )}
              </ol>
            </>
          ) : (
            <p className="py-6 text-center text-sm text-muted-fg">이번 주 첫 메달을 기다리고 있어요</p>
          )}
          <div className="mt-2">
            <SchoolPicker board={board} me={me} setMe={setMe} />
            {me && <MySummary board={board} me={me} />}
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-sm font-extrabold text-fg">게임별 1위 학교</h3>
            <span className="hidden sm:inline text-xs text-muted-fg">— 눌러서 1위를 뺏어 오세요</span>
            <span className="flex-1" aria-hidden />
            <div role="tablist" aria-label="기간" className="inline-flex rounded-full border border-line bg-card p-0.5 text-xs font-bold">
              {(['week', 'today'] as Span[]).map((s) => (
                <button key={s} type="button" role="tab" aria-selected={span === s} onClick={() => setSpan(s)} className={`px-3 min-h-8 rounded-full whitespace-nowrap ${span === s ? 'bg-amber-400 text-amber-950' : 'text-muted-fg hover:text-fg'}`}>
                  {s === 'week' ? '이번 주' : '오늘'}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* 폰은 접힌 동안 3칸만(첫 화면 아래 게임 목록이 너무 밀리지 않게) */}
            {list.map((g, i) => <GameLeader key={g.slug} g={g} site={SITE.get(g.slug)!} span={span} me={me?.c} className={!all && i >= 3 ? 'max-sm:hidden' : ''} />)}
          </div>
          {shown.length > 3 && (
            <button type="button" onClick={() => setAll(!all)} data-testid="league-more" className={`mt-2 w-full min-h-10 rounded-xl border border-line bg-card/70 text-sm font-bold text-muted-fg hover:text-fg ${shown.length > FIRST ? '' : 'sm:hidden'}`}>
              {all ? '접기' : `게임 ${shown.length}개 모두 보기`}
            </button>
          )}
        </div>
      </div>
    </section>
  )
}

/** 게임 카드 한 줄 — 학교 순위가 있는 게임이면 이번 주 1위 학교(아직 없으면 «첫 1위 도전»). 학교 순위가 없는 게임은 아무것도 안 그린다.
 *  인기 순위 띠·최신순 목록 두 곳이 같이 쓴다(2026-11-03 «멀티 아니어도 학교 순위 있는 게임은 모두 표시») */
export function CardLeader({ slug, compact = false }: { slug: string; compact?: boolean }) {
  const board = useBoard()
  const g = board?.games.find((x) => x.slug === slug)
  if (!g) return null
  const l = leader(g, 'week')
  return (
    <p data-card-leader className={`${compact ? 'mt-0.5' : 'mt-2'} flex items-center gap-1 text-xs min-w-0`}>
      <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" aria-hidden />
      {l ? (
        <>
          <span className="text-muted-fg shrink-0">{compact ? '주 1위' : '이번 주 1위'}</span>
          <b className="text-fg truncate">{l.top.n}</b>
        </>
      ) : (
        <span className="text-muted-fg truncate">{compact ? '1위 도전!' : '이번 주 1위 자리 비었어요 — 첫 1위 도전!'}</span>
      )}
    </p>
  )
}
