import type { Metadata } from 'next'
import { MusicRoom } from '@/components/music/MusicRoom'

export const metadata: Metadata = {
  title: '음악감상실',
  description: '우리가 직접 만든 노래 — 가사와 함께 듣기. 비트:온 수록곡 전부.',
}

export default function MusicPage() {
  return (
    <div className="relative min-h-screen pt-20 md:pt-24 overflow-hidden">
      <div className="relative max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="mb-5">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-fg">
            <span className="gradient-text">음악감상실</span>
          </h1>
          <p className="mt-1 text-sm text-muted-fg">
            직접 만든 노래를 가사와 함께 들어요. 리듬게임 «비트:온»에 들어 있는 곡들이에요.
          </p>
        </div>
        <MusicRoom />
      </div>
    </div>
  )
}
