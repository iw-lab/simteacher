import { IS_MAIN_SITE } from '@/lib/siteUrl'

// 두 문 제목엔 «(학교와이파이 막힌경우)» — 구글·네이버·다음 검색 결과에서 본 주소 바로 아래 뜰 때 어느 쪽을 누를지 보이게(2026-10-30 사용자)
//   🔒 tools/check-two-doors.mjs
export const SITE_NAME = IS_MAIN_SITE ? '선행쌤' : '선행쌤 (학교와이파이 막힌경우)'
export const HOME_TITLE = `${SITE_NAME} | 교실에서 쓰라고 만든 교실 놀이·학습 사이트 모음`

// og:title·og:description 은 홈만 갖는다 — 레이아웃에 두면 모든 하위 페이지가 홈 제목을 물려받아
//   구글이 홈·문의를 한 묶음으로 보고 «문의»를 대표로 띄웠다(2026-10-30 사용자 «쌤집이 문의가 젤 먼저 뜬다»).
//   page 의 openGraph 는 레이아웃 것을 통째로 갈아 끼우므로 공통 칸을 여기 둔다. 🔒 tools/check-seo-unique.mjs og:title
export const OG_BASE = { type: 'website' as const, locale: 'ko_KR', url: './', siteName: '선행쌤' }
