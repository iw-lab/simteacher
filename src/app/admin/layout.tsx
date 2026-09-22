import type { Metadata } from 'next'

/** 숨은 화면 — 검색 색인에서 뺀다. (색인 제외는 «예의»이지 보안이 아니다 — 방어는 비밀번호와 규칙이 한다.) */
export const metadata: Metadata = {
  title: '심쌤 로그인',
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children
}
