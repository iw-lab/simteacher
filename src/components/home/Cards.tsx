'use client'

// 홈(게임)·수업 도구(/tools) 두 곳이 같은 카드를 쓴다 — 한쪽만 고쳐 모양이 갈라지지 않게 여기 한 벌만 둔다.
import { MathText } from '@/components/ui/MathText'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Ban, Download, ExternalLink, Eye, Lock } from 'lucide-react'
import { useEffect, useState } from 'react'
import { probe, type Reach } from '@/lib/reachability'
import { Badge } from '@/components/ui/Badge'
import { recordClick } from '@/lib/community'
import type { LearningSite, TeacherTool } from '@/data/projects'

/** 카드 밑 누적 조회수(2026-10-23 «모든 카드 밑에 누적 조회수 적어줘») — 못 읽었으면 아무것도 안 그린다 */
export function Views({ n, className = '' }: { n: number | undefined; className?: string }) {
  if (n === undefined) return null
  return (
    <span data-views className={`inline-flex items-center gap-1 text-xs text-muted-fg tabular-nums ${className}`}>
      <Eye className="w-3.5 h-3.5" aria-hidden />
      누적 {n.toLocaleString()}번
    </span>
  )
}

export function SiteCard({ site, i, views }: { site: LearningSite; i: number; views: number | undefined }) {
  // 🔴 링크가 없는 사이트가 생겼다(2026-08-31 아라하루). 예전엔 전부 url 이 있어서
  //    `<motion.a href={site.url}>` 로 고정이었는데, url 이 undefined 면
  //    **href 없는 <a>** 가 된다 — 링크처럼 보이는데 눌러도 아무 일도 안 일어난다.
  //    그래서 링크가 없으면 아예 <div> 로 렌더한다(클릭 집계도 안 한다).
  const linked = Boolean(site.url)
  // 이 와이파이가 막은 사이트면 카드에 알린다(학교 망 필터 · src/lib/reachability.ts)
  const [reach, setReach] = useState<Reach>('unknown')
  useEffect(() => { if (site.url) probe(site.url).then(setReach) }, [site.url])
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
      data-slug={site.slug}
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
          sizes="(max-width: 1024px) 50vw, (max-width: 1536px) 25vw, 20vw"
          className="object-cover object-top group-hover:scale-[1.03] transition-transform duration-300"
        />
      </div>

      <div className="p-3 sm:p-6 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2 sm:mb-3 min-w-0">
          <Badge variant="primary">{site.subject}</Badge>
          <span className="hidden sm:inline-flex"><Badge variant="outline">{site.target}</Badge></span>
          <time dateTime={site.added} className="ml-auto shrink-0 text-xs text-muted-fg tabular-nums">
            {Number(site.added.slice(5, 7))}.{Number(site.added.slice(8, 10))} 올림
          </time>
        </div>

        <h3 className="text-[15px] sm:text-lg font-bold text-fg leading-snug">{site.name}</h3>
        <p data-blurb className="mt-1 sm:mt-1.5 text-[13px] sm:text-[15px] text-muted-fg leading-relaxed line-clamp-2 sm:line-clamp-none">
          <MathText text={site.tagline} />
        </p>

        {linked && reach === 'blocked' ? (
          <p data-blocked className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-red-600 dark:text-red-400">
            <Ban className="w-3.5 h-3.5" aria-hidden />
            지금 이 와이파이에서 막혀 있어요
          </p>
        ) : null}
        {linked ? (
          <div className="mt-auto pt-3 sm:pt-5 flex items-center justify-between gap-2">
            <Views n={views} />
            <span className="hidden sm:inline-flex items-center text-sm font-semibold text-primary-600 dark:text-primary-300">
              사이트 열기
              <ExternalLink className="ml-1.5 w-4 h-4" />
            </span>
          </div>
        ) : (
          <span className="mt-auto pt-3 sm:pt-5 inline-flex items-center text-xs sm:text-sm text-muted-fg">
            <Lock className="mr-1.5 w-3.5 h-3.5" />
            {site.urlNote ?? '학급 운영 중'}
          </span>
        )}
      </div>
    </Card>
  )
}

/** 선생님 책상 프로그램 — 카드 전체를 <a> 로 감싸지 않는다: 설치본과 웹판이 둘 다 있는 도구
 *  (우리 반 투표함)에서 링크를 중첩할 수 없어 웹판으로 들어갈 길이 막혔다(2026-09-02). 링크는 카드 아래에 나란히. */
export function ToolCard({ tool, views }: { tool: TeacherTool; views: number | undefined }) {
  return (
    <div data-slug={tool.slug} className="group glass rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col hover:border-primary-500/60 hover:-translate-y-1 transition-all duration-200">
      <div className="relative aspect-[8/5] bg-muted overflow-hidden border-b border-line">
        <Image
          src={tool.image}
          alt={`${tool.name} 화면`}
          fill
          sizes="(max-width: 1024px) 50vw, (max-width: 1536px) 25vw, 20vw"
          className="object-cover object-top group-hover:scale-[1.03] transition-transform duration-300"
        />
      </div>

      <div className="p-3 sm:p-6 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2 sm:mb-3 flex-wrap">
          <Badge variant="secondary">{tool.platform}</Badge>
          <Badge variant="outline">무료</Badge>
        </div>

        <h3 className="text-[15px] sm:text-lg font-bold text-fg leading-snug">{tool.name}</h3>
        <p data-blurb className="mt-1 sm:mt-1.5 text-[13px] sm:text-[15px] text-muted-fg leading-relaxed">
          <MathText text={tool.tagline} />
        </p>

        <Views n={views} className="mt-3" />
        <div className="mt-auto pt-3 sm:pt-5 flex items-center gap-x-4 gap-y-2 flex-wrap">
          <a
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => recordClick(tool.slug, tool.name)}
            className="inline-flex items-center min-h-11 text-sm font-semibold text-primary-600 dark:text-primary-300 hover:underline"
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
              className="inline-flex items-center min-h-11 text-sm font-semibold text-muted-fg hover:text-fg hover:underline"
            >
              {tool.altLabel}
              <ExternalLink className="ml-1.5 w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
