import { SiteConfig, NavItem } from '@/types';

export const siteConfig: SiteConfig = {
  name: '선행쌤',
  description:
    '초등 교사 심선생이 교실에서 쓰라고 만든 학습 게임·사이트·선생님 프로그램 모음',
  url: 'https://ssamzip.com',
  ogImage: '/images/og/og-default.png',
  links: {
    github: 'https://github.com/iw-lab',
    email: 'simssijjang@gmail.com',
  },
};

// 사실 기반 프로필 (허위 금지 — 수치 변경 시 근거 확인)
export const profile = {
  teachingSince: '2013년 9월', // 교직 시작
  teachingYears: 14, // 교직 경력 (년차)
  vibeCodingSince: 2025, // 바이브코딩 시작 연도
  // 🔴 이 값은 «해가 바뀌면 틀려진다». 2026-09-05 에 1년차로 남아 있던 것을 사용자가 잡았다.
  //    화면 세 곳에 하드코딩돼 있던 걸 여기 하나로 모았으니, 고칠 때는 여기만 고친다.
  vibeCodingYears: '2년차',
};

export const navigation: NavItem[] = [
  { label: '게임·사이트', href: '/' },
  { label: '학습만화', href: '/library' },
  { label: '음악감상실', href: '/music' },
  { label: '소개', href: '/about' },
  { label: '포트폴리오', href: '/portfolio' },
  { label: '블로그', href: '/blog' },
  { label: '문의', href: '/contact' },
];
