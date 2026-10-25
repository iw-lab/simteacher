import type { Metadata, Viewport } from 'next'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://ssamzip.com'),
  title: {
    default: '선행쌤 | 교실에서 쓰라고 만든 학습 게임·사이트 모음',
    template: '%s | 선행쌤',
  },
  description:
    '선행쌤(선행샘·선행 심선생)은 초등학교 교사가 교실에서 필요할 때마다 만든 학습 게임·학습 사이트·선생님용 프로그램 모음입니다.',
  keywords: ['선행쌤', '선행샘', '선행 심선생', '심선생', '초등 학습 게임', '교과 게임', '초등 학습 사이트', '수업 보조 도구', '초등 교사', '바이브코딩', '에듀테크'],
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
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: './',
    siteName: '선행쌤',
    title: '선행쌤 | 교실에서 쓰라고 만든 학습 게임·사이트 모음',
    description: '초등 교사 심선생이 만든 학습 게임·사이트·선생님 프로그램 모음',
  },
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
        {/* 옛 주소(sunhaengssam.web.app·firebaseapp.com)로 들어오면 새 주소 ssamzip.com 으로 넘긴다 — Firebase 는 호스트별 301 을 못 건다 */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){var h=location.hostname;if(/^sunhaengssam\\.(web\\.app|firebaseapp\\.com)$/.test(h)||h==='www.ssamzip.com'){location.replace('https://ssamzip.com'+location.pathname+location.search+location.hash)}})()",
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
