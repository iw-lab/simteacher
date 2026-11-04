import Link from 'next/link'
import { learningSites, teacherTools } from '@/data/projects'
import { classToolSites, gameSites } from '@/lib/catalog'

// 교실 놀이 | 수업 보조 도구 | 선생님 도구 — 세 갈래(2026-10-24 «수업도구는 게임 사이트 옆으로» · 2026-11-04 «수업 보조 도구 오른쪽에 선생님 도구 탭 · 선생님 책상 프로그램을 그쪽으로»).
// 홈·/tools·/teacher 맨 위에 같은 모양으로.
export const GAME_COUNT = gameSites(learningSites).length
export const TOOL_COUNT = classToolSites(learningSites).length
export const TEACHER_COUNT = teacherTools.length

export function SectionTabs({ active }: { active: 'games' | 'tools' | 'teacher' }) {
  const tab = (key: 'games' | 'tools' | 'teacher', href: string, label: string, n: number) => (
    <Link
      href={href}
      aria-current={active === key ? 'page' : undefined}
      data-testid={`tab-${key}`}
      className={`inline-flex items-center whitespace-nowrap min-h-11 px-3 sm:px-4 rounded-full text-[14px] sm:text-[15px] font-bold transition-colors ${
        active === key
          ? 'bg-primary-500/15 text-primary-700 dark:text-primary-200 border border-primary-500/60'
          : 'text-muted-fg hover:text-fg border border-transparent hover:border-line'
      }`}
    >
      {label}
      <span className="hidden sm:inline ml-1.5 text-xs font-semibold opacity-70 tabular-nums">{n}</span>
    </Link>
  )
  return (
    <nav aria-label="교실 놀이·수업 보조 도구·선생님 도구" className="inline-flex flex-nowrap max-w-full items-center gap-0.5 sm:gap-1 p-1 rounded-full bg-card border border-line">
      {tab('games', '/', '교실 놀이', GAME_COUNT)}
      {tab('tools', '/tools/', '수업 보조 도구', TOOL_COUNT)}
      {tab('teacher', '/teacher/', '선생님 도구', TEACHER_COUNT)}
    </nav>
  )
}
