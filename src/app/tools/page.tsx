import type { Metadata } from 'next'
import { SectionTabs } from '@/components/home/SectionTabs'
import { ToolsBoard } from '@/components/tools/ToolsBoard'
import { ArtShowcase } from '@/components/home/ArtShowcase'

export const metadata: Metadata = {
  title: '수업 보조 도구',
  description: '교실 추첨·투표·미술·수학 교구·계기교육 등 쉬는 시간·자투리 시간에 교실 화면에 바로 띄우는 무료 수업 보조 도구',
}

// 교실 보조 도구(옛 «수업 도구») — 게임 옆 정식 갈래(2026-10-24 사용자 «수업도구는 게임 사이트 옆으로 정식 종목으로 빼자»)
export default function ToolsPage() {
  return (
    <div className="relative min-h-screen pt-20 md:pt-24 pb-16 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        <div className="aurora-blob aurora-cyan w-[420px] h-[420px] -top-24 left-[8%] opacity-60" />
      </div>
      <div className="relative max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-base md:text-lg font-bold text-fg">수업 보조 도구</h1>
          <SectionTabs active="tools" />
        </div>
        {/* 학생 작품 — 아트온 전시관(선생님이 고른 작품만 · 이름 없이 그림만) · 1분마다 새 작품(2026-11-03 «킹수학처럼 · 홍보도 되고») */}
        <div className="mb-8"><ArtShowcase live /></div>
        <ToolsBoard />
      </div>
    </div>
  )
}
