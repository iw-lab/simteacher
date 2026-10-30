import type { Metadata, Viewport } from 'next'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import './globals.css'
import { OLD_HOST_REDIRECT } from '@/lib/oldHostRedirect'
import { SITE_URL } from '@/lib/siteUrl'
import { SITE_NAME, HOME_TITLE, OG_BASE } from '@/lib/siteMeta'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: HOME_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  // 학교 와이파이가 새 도메인 ssamzip.com 을 막아(2026-10-26) 검색 결과를 눌러도 안 열린다 — 검색 결과 설명 맨 앞에 두 문 주소를 적어
  //   막힌 교실에서도 검색 화면에서 바로 다른 주소를 본다(사용자 «검색에서는 방법이 없어?»). 🔒 tools/check-filter-words.mjs ALT 검사
  description:
    '학교 와이파이에서 안 열리면 sunhaengssam.web.app 으로 들어오세요. 선행쌤(쌤집·선행샘·선행 심선생)은 초등학교 교사가 교실에서 필요할 때마다 만든 교실 놀이·학습 사이트·수업 보조 도구 모음입니다.',
  keywords: ['선행쌤', '쌤집', '선행샘', '선행 심선생', '심선생', '교실 놀이', '초등 수업 놀이', '초등 학습 사이트', '수업 보조 도구', '초등 교사', '바이브코딩', '에듀테크'],
  authors: [{ name: '심선생' }],
  alternates: { canonical: './' },
  verification: { other: { 'naver-site-verification': 'e4235028c5908547841febe095942fa789e71bb0' } },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon-48.png', type: 'image/png', sizes: '48x48' },
      { url: '/icon-96.png', type: 'image/png', sizes: '96x96' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: { url: '/apple-touch-icon.png', sizes: '180x180' },
  },
  manifest: '/manifest.webmanifest',
  openGraph: OG_BASE,
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8f7fc' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a12' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* 옛 주소(sunhaengssam.web.app·firebaseapp.com)로 들어오면 새 주소 ssamzip.com 으로 넘긴다 — Firebase 는 호스트별 301 을 못 건다.
            단 ssamzip.com 이 «열릴 때만»(그림 하나를 3초 안에 받아 보고): 학교 망이 새 도메인 ssamzip.com 을 막아(2026-10-26) 넘기면 아이들이 빈 화면에 갇혔다. 🔒 tests/old-host-redirect.test.ts */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              OLD_HOST_REDIRECT,
          }}
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange={false}
        >
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
