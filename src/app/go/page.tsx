import type { Metadata } from 'next'
import { Suspense } from 'react'
import { GoDoor } from '@/components/go/GoDoor'

export const metadata: Metadata = {
  title: '선행쌤에서 열기',
  description: '친구랑 방 만들어 하는 놀이는 선행쌤을 거쳐 열립니다.',
  robots: { index: false, follow: false },
}

// 게임의 «방 멀티» 잠금 창(키트 gb-ssam-pass.js)이 여기로 보낸다 — /go?u=<게임 주소(방 코드 포함)>.
// 한 번 거쳐 가면 그 기기에선 계속 열린다(2026-11-03 사용자 «방 멀티는 선행쌤에서만»).
export default function GoPage() {
  return (
    <div className="min-h-screen pt-24 md:pt-28 pb-16">
      <div className="max-w-xl mx-auto px-4 sm:px-6">
        <Suspense>
          <GoDoor />
        </Suspense>
      </div>
    </div>
  )
}
