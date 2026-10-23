import type { Metadata } from 'next'
import { Bookshelf, LIBRARY } from '@/components/library/Bookshelf'

export const metadata: Metadata = {
  title: '서재',
  description: '직접 만든 학습만화·소설·책 — 로그인 없이 읽고 내려받기',
}

export default function LibraryPage() {
  return (
    <div className="relative min-h-screen pt-20 md:pt-24 overflow-hidden">
      <div className="relative max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-fg">
              <span className="gradient-text">서재</span>
            </h1>
            <p className="mt-1 text-sm text-muted-fg">
              직접 만든 학습만화·소설·책이에요. 표지를 누르면 «이수서재»에서 로그인 없이 읽을 수 있어요.
            </p>
          </div>
          <a href={LIBRARY} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-fg hover:text-fg hover:underline">
            이수서재 바로 가기 →
          </a>
        </div>
        <Bookshelf />
      </div>
    </div>
  )
}
