import type { Metadata } from 'next'

// 페이지가 'use client' 라 metadata 를 여기서 — 없으면 홈 제목을 물려받아 구글이 홈 대신 이 페이지를 띄운다(🔒 tools/check-seo-unique.mjs)
export const metadata: Metadata = {
  title: '만든 사람',
  description: '초등 교사 심선생(선행쌤)이 교실에서 필요한 것을 바이브코딩으로 만들게 된 이야기',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
