'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Crown, Trophy } from 'lucide-react'
import { fetchBoard, leader, type Board, type Medal } from '@/lib/school-league'

/* 학교 대항전 — 2026-11-03 사용자 «학교 성적 너무 과해 · 1~5등 종합 순위로 간단하게 · 게임별 1등은 썸네일 아래 · 첫 화면에 콘텐츠가 가장 많이»
 *   홈엔 제목 줄 한 줄(SchoolTop5)만, 게임별 1위는 카드 밑 CardLeader. 큰 시상대·게임별 칸은 뺐다(git 이력 b1bb8a8). */

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

const MEDAL_CLS = ['bg-amber-400 text-amber-950', 'bg-slate-300 text-slate-900', 'bg-orange-400 text-orange-950']

function Medals({ m }: { m: Medal }) {
  return <span className="text-[11px] text-muted-fg tabular-nums">금{m.g}{m.sv ? `·은${m.sv}` : ''}{m.b ? `·동${m.b}` : ''}</span>
}

/** 제목 줄 «학교 종합 1~5위» — 이번 주 게임마다 1~3위 학교에 금·은·동을 모은 순위(한 줄 · 넘치면 옆으로 민다) */
export function SchoolTop5({ className = '' }: { className?: string }) {
  const board = useBoard()
  const top = board?.medals.slice(0, 5) ?? []
  if (!top.length) return null
  return (
    <div data-testid="school-top5" className={`flex items-center gap-1.5 min-w-0 whitespace-nowrap ${className}`} title="이번 주 학교 종합 순위 — 게임마다 1~3위 학교에 금·은·동">
      <span className="shrink-0 inline-flex items-center gap-1 text-sm font-extrabold text-fg">
        <Trophy className="w-4 h-4 text-amber-500" aria-hidden /> 학교 종합
      </span>
      <ol className="flex items-center gap-1.5 min-w-0 overflow-x-auto no-scrollbar">
        {top.map((m, i) => (
          <li key={m.c} className="shrink-0 inline-flex items-center gap-1 rounded-full border border-line bg-card/70 pl-0.5 pr-2 py-0.5">
            <span className={`w-5 h-5 rounded-full inline-flex items-center justify-center text-[11px] font-black ${MEDAL_CLS[i] ?? 'bg-muted text-fg'}`}>{i + 1}</span>
            <b className="text-sm text-fg">{m.n}</b>
            <Medals m={m} />
          </li>
        ))}
      </ol>
      {/* 2026-11-03 사용자 «학교종합순위 맨 오른쪽에 전체 순위 보기» — 칩이 넘쳐 밀려도 이 단추는 늘 보인다 */}
      <Link href="/ranks/" data-testid="school-ranks-link" className="shrink-0 ml-1 inline-flex items-center rounded-full border border-amber-500/50 bg-amber-500/10 px-2.5 py-0.5 text-sm font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-500/20">
        전체 순위 보기 →
      </Link>
    </div>
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
