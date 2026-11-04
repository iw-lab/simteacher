'use client'

import { useEffect, useMemo, useState } from 'react'
import { fetchTotalCountsOnce } from '@/lib/community'
import { ToolCard } from '@/components/home/Cards'
import { teacherTools } from '@/data/projects'

// 선생님 책상 프로그램 — /tools 에서 옮겨 왔다(2026-11-04). 많이 쓴 순서, 조회수를 못 읽으면 올린 순서 그대로.
export function TeacherBoard() {
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
  const tools = useMemo(
    () => (totals ? [...teacherTools].sort((a, b) => (totals[b.slug] ?? 0) - (totals[a.slug] ?? 0)) : teacherTools),
    [totals],
  )
  return (
    <section id="teacher-tools" className="scroll-mt-24">
      <h2 className="mb-1 text-xl md:text-2xl font-extrabold tracking-tight text-fg">
        선생님 책상 프로그램 <span className="text-base font-semibold text-muted-fg tabular-nums">{teacherTools.length}</span>
      </h2>
      <p className="mb-5 text-sm text-muted-fg">
        아이들 것만 만들다 보니 정작 교사인 제가 쓸 게 없더군요. 제 책상에서 쓰려고 만들어 무료로 나눕니다.
      </p>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
        {tools.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} views={totals ? totals[tool.slug] ?? 0 : undefined} />
        ))}
      </div>
    </section>
  )
}
