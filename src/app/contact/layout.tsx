import type { Metadata } from 'next'

// 페이지가 'use client' 라 metadata 를 여기서 — 없으면 홈 제목을 물려받아 구글이 홈 대신 이 페이지를 띄운다(🔒 tools/check-seo-unique.mjs)
export const metadata: Metadata = {
  title: '문의',
  description: '선행쌤 교실 놀이·학습 사이트 사용·제안·오류 문의',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
