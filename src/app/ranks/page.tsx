import type { Metadata } from 'next'
import { SchoolRanks } from '@/components/home/SchoolRanks'

// 2026-11-03 사용자 «학교종합순위 맨 오른쪽에 전체 순위 보기 · 전체 순위와 학교 검색도 되게»
export const metadata: Metadata = {
  title: '학교 순위',
  description: '선행쌤 교실 놀이 이번 주 학교 종합 순위(금·은·동)와 놀이별 학교 순위 — 우리 학교 이름으로 찾아보기',
}

export default function RanksPage() {
  return (
    <div className="relative min-h-screen pt-20 md:pt-24 pb-10 overflow-hidden">
      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="mb-5">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-fg">
            <span className="gradient-text">학교 순위</span>
          </h1>
          <p className="mt-1 text-sm text-muted-fg">이번 주 놀이마다 1~3위 학교에 금·은·동을 모은 종합 순위예요. 우리 학교 이름으로 찾아보세요.</p>
        </div>
        <SchoolRanks />
      </div>
    </div>
  )
}
