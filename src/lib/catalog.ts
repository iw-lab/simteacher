// 게임 ↔ 수업 도구 나누기 — 순수 함수(시험이 바로 부른다). 2026-10-24 사용자 «수업도구는 게임 사이트 옆으로 정식 종목으로 빼자».
//   수업 도구 쪽(/tools) = «수업 도구» 꼬리표가 붙은 사이트 전부 + 선생님 책상 프로그램(teacherTools).
//   게임 쪽(홈) = 나머지 + 게임이기도 한 수업 도구(다른 «종류» 꼬리표가 하나라도 있으면 양쪽에 다 선다).
//   새 수업 도구를 올릴 땐 projects.ts 에 꼬리표만 붙이면 된다 — 따로 옮기지 않는다.
//   계기교육(독도의 날 등 그날 수업)은 통째로 수업 도구 쪽으로 옮긴다 — 게임 쪽엔 안 선다(2026-10-24 «계기 교육도 수업도구 쪽으로 옮기자»).
import { SITE_KINDS, SITE_SUBJECTS, type LearningSite } from '../data/projects'

export const TOOL_TAG = '수업 도구'
export const OCCASION_TAG = '계기교육'
// 게임 쪽에도 서게 하는 «게임 종류». 공부·연습·만들기는 게임이 아니다 — 수업 도구 꼬리표가 붙으면 도구 쪽에만
// (2026-10-24 사용자 «게임과 수업 도구는 중복 제거하는 게 낫나» → 연습·만들기 도구 8곳을 게임 쪽에서 뺐다).
const NOT_GAME_KINDS = new Set<string>([TOOL_TAG, '공부·연습', '만들기'])
const OTHER_KINDS = new Set<string>(SITE_KINDS.filter((k) => !NOT_GAME_KINDS.has(k)))

export const isOccasion = (s: Pick<LearningSite, 'tags'>) => s.tags.includes(OCCASION_TAG)
export const isClassTool = (s: Pick<LearningSite, 'tags'>) => s.tags.includes(TOOL_TAG) || isOccasion(s)
/** 게임 쪽에 안 서는 곳 — 계기교육 · 게임 종류 꼬리표가 없는 수업 도구(뽑기ON·또박이·코드스쿨 등) */
export const isToolOnly = (s: Pick<LearningSite, 'tags'>) =>
  isOccasion(s) || (s.tags.includes(TOOL_TAG) && !s.tags.some((t) => OTHER_KINDS.has(t)))
export const gameSites = <T extends Pick<LearningSite, 'tags'>>(list: T[]) => list.filter((s) => !isToolOnly(s))
export const classToolSites = <T extends Pick<LearningSite, 'tags'>>(list: T[]) => list.filter(isClassTool)
/** 홈 «종류» 칩 — 수업 도구는 따로 칸이 생겼으니 뺀다 */
export const GAME_KINDS = SITE_KINDS.filter((k) => k !== TOOL_TAG)
/** 홈 «과목» 칩 — 계기교육도 옮겼으니 뺀다 */
export const GAME_SUBJECTS = SITE_SUBJECTS.filter((k) => k !== OCCASION_TAG)
/** 홈 맨 위 인기 순위 = 게임·수업 도구 통합(2026-10-24 사용자 «인기 순위는 그대로 통합으로») — 게임 쪽에서 뺀 도구도 순위엔 선다 */
export const rankingSites = <T extends Pick<LearningSite, 'tags'>>(list: T[]) => list
