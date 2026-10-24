'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Lock, Search, X } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { fetchTotalCountsOnce } from '@/lib/community'
import { newestFirst } from '@/lib/ranking'
import { gameSites, GAME_KINDS } from '@/lib/catalog'
import { SiteCard } from '@/components/home/Cards'
import {
  learningSites,
  SITE_SUBJECTS,
  type LearningSite,
  type SiteTag,
} from '@/data/projects'

// 게임 쪽 목록 — 도구뿐인 곳(뽑기ON 등)과 선생님 책상 프로그램은 /tools 로 갔다(2026-10-24)
const GAMES = gameSites(learningSites)

/** 과목 하나·종류 하나를 고르면 둘 다 붙은 사이트만(고르지 않은 줄은 통과) */
function pick(list: LearningSite[], subject: SiteTag | '', kind: SiteTag | '') {
  return list.filter(
    (s) =>
      (!subject || s.tags.includes(subject)) && (!kind || s.tags.includes(kind))
  )
}

/** 이름·한 줄 소개·과목에서 찾기(띄어쓰기·대소문자 무시) — 55개를 눈으로 훑지 않게 */
const norm = (t: string) => t.toLowerCase().replace(/\s+/g, '')
function find(list: LearningSite[], q: string) {
  const k = norm(q)
  if (!k) return list
  return list.filter((s) => norm(`${s.name}${s.tagline}${s.subject}${s.tags.join('')}`).includes(k))
}

function ChipRow({
  label,
  allLabel,
  options,
  value,
  onChange,
  pool,
}: {
  label: string
  allLabel: string
  options: readonly SiteTag[]
  value: SiteTag | ''
  onChange: (v: SiteTag | '') => void
  pool: LearningSite[]
}) {
  // 사이트가 0개인 칸은 숨긴다(눌러도 빈 화면 금지). 숫자는 «다른 줄에서 고른 것» 기준.
  const counts = options
    .map((o) => [o, pool.filter((s) => s.tags.includes(o)).length] as const)
    .filter(([o, n]) => n > 0 || o === value)
  const chip = (key: string, text: string, n: number, active: boolean, onClick: () => void) => (
    <button
      key={key}
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 whitespace-nowrap px-3.5 py-2 rounded-full text-sm font-semibold transition-all duration-200 border ${
        active
          ? 'border-primary-500/60 bg-primary-500/15 text-primary-700 dark:text-primary-200'
          : 'border-line bg-card text-muted-fg hover:text-fg hover:border-primary-500/40'
      }`}
    >
      {text}
      <span className="ml-1.5 text-xs opacity-70">{n}</span>
    </button>
  )
  return (
    <div className="flex items-start gap-3" role="group" aria-label={`${label}로 고르기`}>
      <span className="shrink-0 w-10 pt-2 text-sm font-bold text-muted-fg">{label}</span>
      {/* 폰에선 한 줄을 옆으로 밀어 본다 — 칩이 아홉 줄로 접혀 카드가 화면 밖으로 밀렸다(2026-10-21) */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mr-4 pr-4 sm:mr-0 sm:pr-0 sm:flex-wrap sm:overflow-visible">
        {chip('_all', allLabel, pool.length, !value, () => onChange(''))}
        {counts.map(([o, n]) =>
          chip(o, o, n, value === o, () => onChange(value === o ? '' : o))
        )}
      </div>
    </div>
  )
}

export function Catalog() {
  const [subject, setSubject] = useState<SiteTag | ''>('')
  const [kind, setKind] = useState<SiteTag | ''>('')
  const [q, setQ] = useState('')
  const [totals, setTotals] = useState<Record<string, number> | null>(null)
  useEffect(() => {
    let alive = true
    fetchTotalCountsOnce()
      .then((t) => alive && setTotals(t))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])
  const views = (slug: string) => (totals ? totals[slug] ?? 0 : undefined)

  // 새로 올린 곳이 맨 앞 — 위 인기 순위와 짝(2026-10-23 사용자)
  const pool = useMemo(() => find(newestFirst(GAMES), q), [q])
  const sites = useMemo(() => pick(pool, subject, kind), [pool, subject, kind])

  return (
    <div className="space-y-24">
      {/* ── 학습 사이트 ───────────────────────────────── */}
      <section id="learning-sites" className="scroll-mt-24">
        <h2 className="mb-4 whitespace-nowrap text-xl md:text-3xl font-extrabold tracking-tight text-fg">
          <span className="gradient-text">학습 게임·사이트</span> {GAMES.length}개
          <span className="ml-2 text-sm font-medium text-muted-fg">새로 올린 순</span>
        </h2>

        <label className="relative block mb-4 max-w-md">
          <span className="sr-only">게임·사이트 찾기</span>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-fg" aria-hidden />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="이름이나 과목으로 찾기 (예: 구구단, 한국사)"
            className="w-full h-12 pl-11 pr-11 rounded-2xl border border-line bg-card text-[15px] text-fg placeholder:text-muted-fg focus:outline-none focus:border-primary-500/60"
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ('')}
              aria-label="찾기 지우기"
              className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 inline-flex items-center justify-center text-muted-fg hover:text-fg"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </label>

        {/* 카테고리 — 과목·종류 두 줄(킹수학처럼) */}
        <div className="space-y-2.5 mb-8">
          <ChipRow
            label="과목"
            allLabel="모든 과목"
            options={SITE_SUBJECTS}
            value={subject}
            onChange={setSubject}
            pool={pick(pool, '', kind)}
          />
          <ChipRow
            label="종류"
            allLabel="모든 종류"
            options={GAME_KINDS}
            value={kind}
            onChange={setKind}
            pool={pick(pool, subject, '')}
          />
        </div>

        {sites.length === 0 && (
          <p className="py-16 text-center text-muted-fg">
            찾는 게임·사이트가 없어요.{' '}
            <button
              type="button"
              onClick={() => { setQ(''); setSubject(''); setKind('') }}
              className="font-semibold text-primary-600 dark:text-primary-300 hover:underline"
            >
              모두 보기
            </button>
          </p>
        )}

        {/* 폰은 두 칸 — 한 칸씩이면 55장이 29,000px 로 늘어났다(2026-10-21 실측) */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-5">
          {sites.map((site, i) => (
            <SiteCard key={site.slug} site={site} i={i} views={views(site.slug)} />
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/portfolio"
            className="inline-flex items-center text-sm font-semibold text-muted-fg hover:text-fg transition-colors"
          >
            각 게임·사이트를 왜, 어떻게 만들었는지 자세히 보기
            <ArrowRight className="ml-1.5 w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── 수업 도구는 따로 칸(/tools) — 선생님 책상 프로그램도 그쪽으로 갔다(2026-10-24) ── */}
      <section id="class-tools-link" className="scroll-mt-24">
        <Link
          href="/tools/"
          className="glass rounded-3xl p-6 md:p-8 flex items-center justify-between gap-4 hover:border-primary-500/60 transition-colors"
        >
          <span>
            <span className="block text-xl md:text-2xl font-extrabold tracking-tight text-fg">
              <span className="gradient-text">수업 도구</span>는 따로 모았어요
            </span>
            <span className="mt-1 block text-sm md:text-[15px] text-muted-fg">
              뽑기·투표·미술·수학 교구, 그리고 선생님 책상 프로그램
            </span>
          </span>
          <ArrowRight className="shrink-0 w-6 h-6 text-primary-600 dark:text-primary-300" />
        </Link>
      </section>

      {/* ── 알찬 ──────────────────────────────────────── */}
      <section id="alchan" className="scroll-mt-24">
        <div className="glass rounded-3xl p-8 md:p-10">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge variant="primary" size="md">
              학급 경제 플랫폼
            </Badge>
            <Badge variant="outline" size="md">
              실제 학급 운영 중
            </Badge>
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-fg">
            <span className="gradient-text">알찬</span> — 위 학습 게임·사이트가
            모여 있는 곳
          </h2>
          <p className="mt-4 text-muted-fg leading-relaxed max-w-3xl">
            아이들이 월급을 받고, 세금을 내고, 주식과 부동산에 투자하고, 재판까지
            경험하는 교실 속 경제 세계입니다. 위의 학습 게임·사이트는 알찬 메뉴에서
            바로 들어가 쓸 수 있게 붙여 두었습니다.
          </p>
          <p className="mt-3 text-sm text-muted-fg">
            <Lock className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />
            학급 전용 서비스로 운영 중이라 링크는 공개하지 않습니다.
          </p>

          <Link
            href="/portfolio"
            className="mt-6 inline-flex items-center text-sm font-semibold text-primary-600 dark:text-primary-300 hover:underline"
          >
            알찬이 어떤 기능을 담고 있는지 보기
            <ArrowRight className="ml-1.5 w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
