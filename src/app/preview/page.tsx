import type { Metadata } from 'next'
import Link from 'next/link'
import { SectionTabs } from '@/components/home/SectionTabs'
import { PreviewBoard } from '@/components/preview/PreviewBoard'

// 검색에 안 내보낸다 — 아직 다듬는 중이라 이 쪽이 대표로 뜨면 안 된다(sitemap 에도 없음 · 🔒 tests/tools-split-html.test.ts)
export const metadata: Metadata = {
  title: '출시 전',
  description: '정식으로 올리기 전에 먼저 써 보는 칸 — 다 만들었거나 거의 다 만든 교실 놀이와 선생님 도구',
  robots: { index: false, follow: true },
}

// 출시 전 — 네 번째 탭(2026-11-24 사용자 «선행쌤에 안올라가있는거 다 올려.. 탭 하나 추가해서.. 출시전??»)
export default function PreviewPage() {
  return (
    <div className="relative min-h-screen pt-20 md:pt-24 pb-16 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        <div className="aurora-blob aurora-cyan w-[420px] h-[420px] -top-24 left-[8%] opacity-60" />
      </div>
      <div className="relative max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-base md:text-lg font-bold text-fg">출시 전</h1>
          <SectionTabs active="preview" />
        </div>
        <p className="mb-8 max-w-3xl text-sm md:text-[15px] leading-relaxed text-muted-fg">
          다 만들었거나 거의 다 만든 것들이에요. 먼저 써 보고 다듬어서 정식으로 올립니다. 막히거나 이상한 곳이 있으면{' '}
          <Link href="/contact/" className="font-semibold text-primary-600 dark:text-primary-300 hover:underline">문의</Link>로 알려 주세요.
        </p>
        <PreviewBoard />
      </div>
    </div>
  )
}
