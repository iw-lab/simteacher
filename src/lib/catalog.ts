// 게임 ↔ 수업 도구 나누기 — 순수 함수(시험이 바로 부른다). 2026-10-24 사용자 «수업도구는 게임 사이트 옆으로 정식 종목으로 빼자».
//   수업 도구 쪽(/tools) = «수업 도구» 꼬리표가 붙은 사이트 전부 + 선생님 책상 프로그램(teacherTools).
//   게임 쪽(홈) = 나머지 + 게임이기도 한 수업 도구(다른 «종류» 꼬리표가 하나라도 있으면 양쪽에 다 선다).
//   새 수업 도구를 올릴 땐 projects.ts 에 꼬리표만 붙이면 된다 — 따로 옮기지 않는다.
import { SITE_KINDS, type LearningSite } from '../data/projects'

export const TOOL_TAG = '수업 도구'
const OTHER_KINDS = new Set<string>(SITE_KINDS.filter((k) => k !== TOOL_TAG))

export const isClassTool = (s: Pick<LearningSite, 'tags'>) => s.tags.includes(TOOL_TAG)
/** 게임 쪽에 안 서는 곳 — 종류가 «수업 도구» 하나뿐(예: 뽑기ON) */
export const isToolOnly = (s: Pick<LearningSite, 'tags'>) => isClassTool(s) && !s.tags.some((t) => OTHER_KINDS.has(t))
export const gameSites = <T extends Pick<LearningSite, 'tags'>>(list: T[]) => list.filter((s) => !isToolOnly(s))
export const classToolSites = <T extends Pick<LearningSite, 'tags'>>(list: T[]) => list.filter(isClassTool)
/** 홈 «종류» 칩 — 수업 도구는 따로 칸이 생겼으니 뺀다 */
export const GAME_KINDS = SITE_KINDS.filter((k) => k !== TOOL_TAG)
