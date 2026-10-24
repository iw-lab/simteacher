import Link from 'next/link'
import { PopularStrip } from '@/components/community/PopularStrip'
import { LiveRooms } from '@/components/community/LiveRooms'
import { Catalog } from '@/components/home/Catalog'
import { HomeShelves } from '@/components/home/HomeShelves'
import { CTASection } from '@/components/home/CTASection'

// 구글에 «이 사이트 대표 = 홈»을 알린다(사이트 이름 선행쌤) — 포트폴리오가 대표로 뜨던 일(2026-10-24)
const SITE_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: '선행쌤',
  alternateName: ['선행샘', '선행 심선생', 'ssamzip'],
  url: 'https://ssamzip.com/',
}

// 첫 화면은 곧바로 쓰는 곳 — 만든 사람 소개는 한 줄 링크로만(2026-10-23 사용자 «빼거나 훨씬 축소 · 바로 쓸 수 있게»)
export default function Home() {
  return (
    <div className="relative min-h-screen pt-20 md:pt-24 pb-8 overflow-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SITE_LD) }} />
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
        {/* 지금 열린 온라인 방 = 넓은 화면은 인기 순위 밑 오른쪽 칸(스크롤을 따라 내려옴 · 순위 줄 7장 폭은 그대로) · 좁은 화면은 인기 순위 바로 밑 */}
        <div className="grid grid-cols-1 [grid-template-areas:'rank'_'rooms'_'rest'] xl:grid-cols-[minmax(0,1fr)_300px] xl:[grid-template-areas:'rank_rank'_'rest_rooms'] xl:gap-x-6">
          <div className="[grid-area:rank] min-w-0">
            <PopularStrip />
          </div>
          <LiveRooms className="[grid-area:rooms] mb-8 xl:mb-0 xl:self-start xl:sticky xl:top-24" />
          <div className="[grid-area:rest] min-w-0">
            <Catalog />
            <HomeShelves />
          </div>
        </div>
      </div>

      <CTASection />
    </div>
  )
}
