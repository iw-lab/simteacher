'use client'

import { MathText } from '@/components/ui/MathText'
import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Download, ExternalLink, Lock, Search, X } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { recordClick } from '@/lib/community'
import {
  learningSites,
  teacherTools,
  SITE_SUBJECTS,
  SITE_KINDS,
  type LearningSite,
  type SiteTag,
} from '@/data/projects'

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

  const pool = useMemo(() => find(learningSites, q), [q])
  const sites = useMemo(() => pick(pool, subject, kind), [pool, subject, kind])

  return (
    <div className="space-y-24">
      {/* ── 학습 사이트 ───────────────────────────────── */}
      <section id="learning-sites" className="scroll-mt-24">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <span className="text-primary-600 dark:text-primary-300 font-semibold">
              Learning Sites
            </span>
            <h2 className="mt-2 text-2xl md:text-3xl font-extrabold tracking-tight text-fg">
              아이들이 쓰는 <span className="gradient-text">학습 사이트</span>{' '}
              {learningSites.length}개
            </h2>
          </div>
          <p className="text-sm text-muted-fg">
            카드를 누르면 새 창에서 바로 열립니다
          </p>
        </div>

        <label className="relative block mb-4 max-w-md">
          <span className="sr-only">사이트 찾기</span>
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
            options={SITE_KINDS}
            value={kind}
            onChange={setKind}
            pool={pick(pool, subject, '')}
          />
        </div>

        {sites.length === 0 && (
          <p className="py-16 text-center text-muted-fg">
            찾는 사이트가 없어요.{' '}
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
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {sites.map((site, i) => {
            // 🔴 링크가 없는 사이트가 생겼다(2026-08-31 아라하루). 예전엔 전부 url 이 있어서
            //    `<motion.a href={site.url}>` 로 고정이었는데, url 이 undefined 면
            //    **href 없는 <a>** 가 된다 — 링크처럼 보이는데 눌러도 아무 일도 안 일어난다.
            //    그래서 링크가 없으면 아예 <div> 로 렌더한다(클릭 집계도 안 한다).
            const linked = Boolean(site.url)
            const Card = linked ? motion.a : motion.div
            const linkProps = linked
              ? {
                  href: site.url,
                  target: '_blank',
                  rel: 'noopener noreferrer',
                  onClick: () => recordClick(site.slug, site.name),
                }
              : {}
            return (
            <Card
              key={site.slug}
              {...linkProps}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i, 8) * 0.04 }}
              className={`group glass rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col transition-all duration-200 ${
                linked ? 'hover:border-primary-500/60 hover:-translate-y-1' : ''
              }`}
            >
              <div className="relative aspect-[8/5] bg-muted overflow-hidden border-b border-line">
                <Image
                  src={site.image}
                  alt={`${site.name} 화면`}
                  fill
                  sizes="(max-width: 1024px) 50vw, 33vw"
                  className="object-cover object-top group-hover:scale-[1.03] transition-transform duration-300"
                />
              </div>

              <div className="p-3 sm:p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-2 sm:mb-3 min-w-0">
                  <Badge variant="primary">{site.subject}</Badge>
                  <span className="hidden sm:inline-flex"><Badge variant="outline">{site.target}</Badge></span>
                </div>

                <h3 className="text-[15px] sm:text-lg font-bold text-fg leading-snug">{site.name}</h3>
                <p className="mt-1 sm:mt-1.5 text-[13px] sm:text-[15px] text-muted-fg leading-relaxed line-clamp-2 sm:line-clamp-none">
                  <MathText text={site.tagline} />
                </p>

                {linked ? (
                  <span className="mt-auto pt-5 hidden sm:inline-flex items-center text-sm font-semibold text-primary-600 dark:text-primary-300">
                    사이트 열기
                    <ExternalLink className="ml-1.5 w-4 h-4" />
                  </span>
                ) : (
                  <span className="mt-auto pt-3 sm:pt-5 inline-flex items-center text-xs sm:text-sm text-muted-fg">
                    <Lock className="mr-1.5 w-3.5 h-3.5" />
                    {site.urlNote ?? '학급 운영 중'}
                  </span>
                )}
              </div>
            </Card>
            )
          })}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/portfolio"
            className="inline-flex items-center text-sm font-semibold text-muted-fg hover:text-fg transition-colors"
          >
            각 사이트를 왜, 어떻게 만들었는지 자세히 보기
            <ArrowRight className="ml-1.5 w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── 선생님을 위한 프로그램 ─────────────────────── */}
      <section id="teacher-tools" className="scroll-mt-24">
        <div className="mb-8">
          <span className="text-primary-600 dark:text-primary-300 font-semibold">
            For Teachers
          </span>
          <h2 className="mt-2 text-2xl md:text-3xl font-extrabold tracking-tight text-fg">
            <span className="gradient-text">선생님</span>을 위한 프로그램
          </h2>
          <p className="mt-3 text-muted-fg max-w-2xl">
            아이들 것만 만들다 보니 정작 교사인 제가 쓸 게 없더군요. 제 책상에서
            쓰려고 만들어 무료로 나눕니다.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {/* 카드 전체를 <a> 로 감싸지 않는다 — 설치본과 웹판이 둘 다 있는 도구
              (우리 반 투표함)에서 링크를 중첩할 수 없어 웹판으로 들어갈 길이
              막혔다(2026-09-02). 이제 링크는 카드 아래에 나란히 둔다. */}
          {teacherTools.map((tool) => (
            <div
              key={tool.slug}
              className="group glass rounded-3xl overflow-hidden flex flex-col hover:border-primary-500/60 hover:-translate-y-1 transition-all duration-200"
            >
              <div className="relative aspect-[8/5] bg-muted overflow-hidden border-b border-line">
                <Image
                  src={tool.image}
                  alt={`${tool.name} 화면`}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover object-top group-hover:scale-[1.03] transition-transform duration-300"
                />
              </div>

              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary">{tool.platform}</Badge>
                  <Badge variant="outline">무료</Badge>
                </div>

                <h3 className="text-lg font-bold text-fg">{tool.name}</h3>
                <p className="mt-1.5 text-[15px] text-muted-fg leading-relaxed">
                  <MathText text={tool.tagline} />
                </p>

                <div className="mt-auto pt-5 flex items-center gap-4 flex-wrap">
                  <a
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => recordClick(tool.slug, tool.name)}
                    className="inline-flex items-center text-sm font-semibold text-primary-600 dark:text-primary-300 hover:underline"
                  >
                    <Download className="mr-1.5 w-4 h-4" />
                    {tool.urlLabel}
                  </a>

                  {tool.altUrl && (
                    <a
                      href={tool.altUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => recordClick(tool.slug, tool.name)}
                      className="inline-flex items-center text-sm font-semibold text-muted-fg hover:text-fg hover:underline"
                    >
                      {tool.altLabel}
                      <ExternalLink className="ml-1.5 w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
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
            <span className="gradient-text">알찬</span> — 위 학습 사이트들이
            모여 있는 곳
          </h2>
          <p className="mt-4 text-muted-fg leading-relaxed max-w-3xl">
            아이들이 월급을 받고, 세금을 내고, 주식과 부동산에 투자하고, 재판까지
            경험하는 교실 속 경제 세계입니다. 위의 학습 사이트는 알찬 메뉴에서
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
