import { VisitCounter } from '@/components/community/VisitCounter'
import Link from 'next/link'
import { Github, Mail } from 'lucide-react'
import { siteConfig } from '@/data/siteConfig'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-line bg-card">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <span className="text-2xl font-extrabold tracking-tight">
                <span className="gradient-text">선행</span>
                <span className="text-fg">쌤</span>
              </span>
            </Link>
            <p className="text-muted-fg mb-4 max-w-md leading-relaxed">
              선행쌤(선행샘) — 교실에서 쓰라고 만든 학습 사이트·게임·선생님 프로그램 모음.
              <br />
              만든 사람: 초등교사 심선생
            </p>
            {/* Social Links */}
            <div className="flex space-x-4">
              {siteConfig.links.github && (
                <a
                  href={siteConfig.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-fg hover:text-primary-500 dark:hover:text-primary-300 transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="w-5 h-5" />
                </a>
              )}
              {siteConfig.links.email && (
                <a
                  href={`mailto:${siteConfig.links.email}`}
                  className="text-muted-fg hover:text-primary-500 dark:hover:text-primary-300 transition-colors"
                  aria-label="Email"
                >
                  <Mail className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-fg uppercase tracking-wider mb-4">
              바로가기
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-muted-fg hover:text-primary-500 dark:hover:text-primary-300 transition-colors"
                >
                  소개
                </Link>
              </li>
              <li>
                <Link
                  href="/portfolio"
                  className="text-muted-fg hover:text-primary-500 dark:hover:text-primary-300 transition-colors"
                >
                  포트폴리오
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-muted-fg hover:text-primary-500 dark:hover:text-primary-300 transition-colors"
                >
                  블로그
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-fg uppercase tracking-wider mb-4">
              문의
            </h3>
            <ul className="space-y-3 text-muted-fg">
              <li>
                <Link
                  href="/contact"
                  className="hover:text-primary-500 dark:hover:text-primary-300 transition-colors"
                >
                  문의하기
                </Link>
              </li>
              <li>
                <a
                  href={`mailto:${siteConfig.links.email}`}
                  className="hover:text-primary-500 dark:hover:text-primary-300 transition-colors"
                >
                  {siteConfig.links.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-line">
          <div className="flex flex-col items-center gap-3">
            <VisitCounter />
            <p className="text-center text-muted-fg text-sm">
              © {currentYear} 선행쌤. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
