import Link from 'next/link'
import { PopularStrip } from '@/components/community/PopularStrip'
import { Catalog } from '@/components/home/Catalog'
import { CTASection } from '@/components/home/CTASection'

// 첫 화면은 곧바로 쓰는 곳 — 만든 사람 소개는 한 줄 링크로만(2026-10-23 사용자 «빼거나 훨씬 축소 · 바로 쓸 수 있게»)
export default function Home() {
  return (
    <div className="relative min-h-screen pt-20 md:pt-24 pb-8 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        <div className="aurora-blob aurora-violet w-[460px] h-[460px] -top-24 left-[6%] opacity-70" />
        <div className="aurora-blob aurora-cyan w-[420px] h-[420px] top-[45%] -right-32 opacity-60" />
      </div>

      <div className="relative max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h1 className="text-base md:text-lg font-bold text-fg">
            교실에서 쓰라고 만든 학습 게임·사이트와 선생님 프로그램 — 눌러서 바로 쓰세요
          </h1>
          <Link href="/about" className="text-sm text-muted-fg hover:text-fg hover:underline">
            만든 사람: 전북 초등교사 선행쌤 →
          </Link>
        </div>
        <PopularStrip />
        <Catalog />
      </div>

      <CTASection />
    </div>
  )
}
