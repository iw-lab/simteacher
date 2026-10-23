import type { Metadata } from 'next'
import { Bookshelf } from '@/components/library/Bookshelf'

export const metadata: Metadata = {
  title: '학습만화',
  description: '아이들을 위해 직접 만든 학습만화·동화 — 로그인 없이 읽고 내려받기',
}

export default function LibraryPage() {
  return (
    <div className="relative min-h-screen pt-20 md:pt-24 overflow-hidden">
      <div className="relative max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-fg">
              <span className="gradient-text">학습만화</span>
            </h1>
            <p className="mt-1 text-sm text-muted-fg">
              아이들을 위해 직접 만든 학습만화예요. 표지를 누르면 바로 읽을 수 있어요.
            </p>
          </div>
        </div>
        <Bookshelf />
      </div>
    </div>
  )
}
