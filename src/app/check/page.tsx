import type { Metadata } from 'next'
import { NetCheck } from '@/components/check/NetCheck'

export const metadata: Metadata = {
  title: '망 점검',
  description: '지금 쓰는 인터넷(학교 와이파이·유선 랜·집)에서 선행쌤 주소가 열리는지 바로 확인합니다. 아무것도 수집하지 않습니다.',
}

// 학교마다 차단 목록이 달라 «여기서도 막히나»를 알 길이 없었다(2026-10-28 사용자).
// 동료 선생님에게 이 주소 하나만 보내면 각자 망에서 뭐가 막히는지 바로 보인다.
export default function CheckPage() {
  return (
    <div className="min-h-screen pt-24 md:pt-28 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-fg">망 점검</h1>
        <p className="mt-2 mb-7 text-muted-fg leading-relaxed">
          지금 쓰고 있는 인터넷에서 선행쌤 주소가 열리는지 바로 재 봅니다. 학교 와이파이·유선 랜·집에서 각각 결과가 다를 수 있습니다.
        </p>
        <NetCheck />
      </div>
    </div>
  )
}
