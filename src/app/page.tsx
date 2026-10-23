import Link from 'next/link'
import { PopularStrip } from '@/components/community/PopularStrip'
import { Catalog } from '@/components/home/Catalog'
import { HomeShelves } from '@/components/home/HomeShelves'
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
        {/* 글씨 최소·한 줄(2026-10-23 사용자 «첫화면 글씨좀 최소화 · 최대한 한줄로») */}
        <div className="mb-4 flex items-baseline justify-between gap-3 whitespace-nowrap">
          <h1 className="min-w-0 truncate text-base md:text-lg font-bold text-fg">교실에서 바로 쓰는 학습 게임</h1>
          <Link href="/about" className="shrink-0 text-sm text-muted-fg hover:text-fg hover:underline">
            만든 사람 →
          </Link>
        </div>
        <PopularStrip />
        <Catalog />
        <HomeShelves />
      </div>

      <CTASection />
    </div>
  )
}
