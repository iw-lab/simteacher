'use client'

import { MathText } from '@/components/ui/MathText'
import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Download, ExternalLink, Lock } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { recordClick } from '@/lib/community'
import {
  learningSites,
  teacherTools,
  SITE_CATEGORIES,
  type SiteCategory,
} from '@/data/projects'

const FILTERS: ('전체' | SiteCategory)[] = ['전체', ...SITE_CATEGORIES]

export function Catalog() {
  const [filter, setFilter] = useState<'전체' | SiteCategory>('전체')

  const sites = useMemo(
    () =>
      filter === '전체'
        ? learningSites
        : learningSites.filter((s) => s.category === filter),
    [filter]
  )

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

        {/* 과목 필터 */}
        <div className="flex flex-wrap gap-2 mb-8">
          {FILTERS.map((f) => {
            const count =
              f === '전체'
                ? learningSites.length
                : learningSites.filter((s) => s.category === f).length
            const active = filter === f
            return (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                aria-pressed={active}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border ${
                  active
                    ? 'border-primary-500/60 bg-primary-500/15 text-primary-700 dark:text-primary-200'
                    : 'border-line bg-card text-muted-fg hover:text-fg hover:border-primary-500/40'
                }`}
              >
                {f}
                <span className="ml-1.5 text-xs opacity-70">{count}</span>
              </button>
            )
          })}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
              className={`group glass rounded-3xl overflow-hidden flex flex-col transition-all duration-200 ${
                linked ? 'hover:border-primary-500/60 hover:-translate-y-1' : ''
              }`}
            >
              <div className="relative aspect-[8/5] bg-muted overflow-hidden border-b border-line">
                <Image
                  src={site.image}
                  alt={`${site.name} 화면`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover object-top group-hover:scale-[1.03] transition-transform duration-300"
                />
              </div>

              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="primary">{site.subject}</Badge>
                  <Badge variant="outline">{site.target}</Badge>
                </div>

                <h3 className="text-lg font-bold text-fg">{site.name}</h3>
                <p className="mt-1.5 text-[15px] text-muted-fg leading-relaxed">
                  <MathText text={site.tagline} />
                </p>

                {linked ? (
                  <span className="mt-auto pt-5 inline-flex items-center text-sm font-semibold text-primary-600 dark:text-primary-300">
                    사이트 열기
                    <ExternalLink className="ml-1.5 w-4 h-4" />
                  </span>
                ) : (
                  <span className="mt-auto pt-5 inline-flex items-center text-sm text-muted-fg">
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
