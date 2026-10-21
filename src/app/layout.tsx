import type { Metadata, Viewport } from 'next'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://sunhaengssam.web.app'),
  title: {
    default: '선행쌤 | 교실에서 쓰라고 만든 학습 사이트·게임 모음',
    template: '%s | 선행쌤',
  },
  description:
    '선행쌤(선행 심선생)은 초등학교 교사가 교실에서 필요할 때마다 만든 학습 사이트·교과 게임·선생님용 프로그램 모음입니다.',
  keywords: ['선행쌤', '선행샘', '선행 심선생', '심선생', '초등 학습 사이트', '교과 게임', '수업 도구', '초등 교사', '바이브코딩', '에듀테크'],
  authors: [{ name: '심선생' }],
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon.svg', type: 'image/svg+xml', sizes: '32x32' },
    ],
    apple: '/favicon.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://sunhaengssam.web.app',
    siteName: '선행쌤',
    title: '선행쌤 | 교실에서 쓰라고 만든 학습 사이트·게임 모음',
    description: '초등 교사 심선생이 만든 학습 사이트·게임·선생님 프로그램 모음',
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
