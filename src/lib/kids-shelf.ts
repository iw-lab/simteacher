// 선행쌤 서재는 아이들이 쓰는 곳이라 아동용만 싣는다(2026-10-23 사용자 «권장이라 해도 아무나 읽을 수 있잖아 → 아동용만»).
// «대상:초등» 태그가 **명시된** 작품만 통과 — 태그 없는 새 작품은 누가 판정하기 전까지 숨는다(종류로 짐작하지 않는다).

export function isForKids(w: { tags?: string[] | null }): boolean {
  return (w.tags ?? []).includes('대상:초등')
}

// 학습만화를 학년→과목→단원으로 찾게(2026-10-23 장부 F) — 서재 태그 «5학년·수학·4단원» 을 읽는다.
const SUBJECTS = ['국어', '수학', '사회', '과학', '영어', '도덕', '실과', '음악', '미술', '체육']

export interface Curriculum {
  grade: number | null
  subject: string | null
  unit: number | null
}

export function curriculumOf(tags: string[] | null | undefined): Curriculum {
  const t = tags ?? []
  const num = (re: RegExp) => {
    for (const s of t) {
      const m = re.exec(s)
      if (m) return Number(m[1])
    }
    return null
  }
  return { grade: num(/^(\d)학년$/), subject: t.find((s) => SUBJECTS.includes(s)) ?? null, unit: num(/^(\d+)단원$/) }
}

export function curriculumLabel(tags: string[] | null | undefined): string {
  const c = curriculumOf(tags)
  return [c.grade && `${c.grade}학년`, c.subject, c.unit && `${c.unit}단원`].filter(Boolean).join(' ')
}

/** 교과 묶음(학년·과목 태그가 있는 시리즈)을 학년→과목 순으로 앞에 두고, 나머지는 원래 순서대로 뒤에 둔다. */
export function orderShelf<G extends { works: { tags?: string[] | null }[] }>(groups: G[]): G[] {
  const key = (g: G) => curriculumOf(g.works[0]?.tags)
  const edu = groups.filter((g) => key(g).grade !== null && key(g).subject !== null)
  const rest = groups.filter((g) => !edu.includes(g))
  edu.sort((a, b) => key(a).grade! - key(b).grade! || SUBJECTS.indexOf(key(a).subject!) - SUBJECTS.indexOf(key(b).subject!))
  return [...edu, ...rest]
}
