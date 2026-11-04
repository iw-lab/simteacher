import type { Metadata } from 'next'
import { SectionTabs } from '@/components/home/SectionTabs'
import { TeacherBoard } from '@/components/teacher/TeacherBoard'

export const metadata: Metadata = {
  title: '선생님 도구',
  description: '초등 교사가 자기 책상에서 쓰려고 만든 업무 프로그램 — 학급 관리·생활기록·문서 작업을 돕는 무료 선생님 책상 프로그램',
}

// 선생님 도구 — 수업 보조 도구 오른쪽 탭(2026-11-04 사용자 «선생님 도구 탭을 추가하고 선생님 책상 프로그램을 그쪽으로 옮기자»)
export default function TeacherPage() {
  return (
    <div className="relative min-h-screen pt-20 md:pt-24 pb-16 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        <div className="aurora-blob aurora-cyan w-[420px] h-[420px] -top-24 left-[8%] opacity-60" />
      </div>
      <div className="relative max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-base md:text-lg font-bold text-fg">선생님 도구</h1>
          <SectionTabs active="teacher" />
        </div>
        <TeacherBoard />
      </div>
    </div>
  )
}
