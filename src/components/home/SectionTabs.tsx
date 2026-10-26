import Link from 'next/link'
import { learningSites, teacherTools } from '@/data/projects'
import { classToolSites, gameSites } from '@/lib/catalog'

// 게임 | 수업 도구 — 두 갈래(2026-10-24 사용자 «수업도구는 게임 사이트 옆으로 정식 종목으로»). 홈과 /tools 맨 위에 같은 모양으로.
export const GAME_COUNT = gameSites(learningSites).length
export const TOOL_COUNT = classToolSites(learningSites).length + teacherTools.length

export function SectionTabs({ active }: { active: 'games' | 'tools' }) {
  const tab = (key: 'games' | 'tools', href: string, label: string, n: number) => (
    <Link
      href={href}
      aria-current={active === key ? 'page' : undefined}
      data-testid={`tab-${key}`}
      className={`inline-flex items-center min-h-11 px-4 rounded-full text-[15px] font-bold transition-colors ${
        active === key
          ? 'bg-primary-500/15 text-primary-700 dark:text-primary-200 border border-primary-500/60'
          : 'text-muted-fg hover:text-fg border border-transparent hover:border-line'
      }`}
    >
      {label}
      <span className="ml-1.5 text-xs font-semibold opacity-70 tabular-nums">{n}</span>
    </Link>
  )
  return (
    <nav aria-label="교실 놀이와 수업 보조 도구" className="inline-flex items-center gap-1 p-1 rounded-full bg-card border border-line">
      {tab('games', '/', '교실 놀이', GAME_COUNT)}
      {tab('tools', '/tools/', '수업 보조 도구', TOOL_COUNT)}
    </nav>
  )
}
