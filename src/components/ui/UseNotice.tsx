// 쓰임새 안내 — 2026-10-24 사용자 «정규 수업에 쓰는 건 심의를 받아야 하니 수위를 낮추고, 선생님들이 알아서».
// 근거: 교육부 「학습지원 소프트웨어 선정 기준 및 가이드라인(안)」(2025. 12.) 적용 대상·제외 · FAQ Q6 «정규 교과를 위해 사용하는 것으로 한정» · 초·중등교육법 제29조의2 ②(2026. 3. 1. 시행).
// «심의 대상 아님»을 단정하지 않는다(학교 판단) — 쓰임새와 절차만 알린다. 🔒 tests/tools-split-html.test.ts
export const USE_NOTICE =
  '선행쌤의 게임·도구는 쉬는 시간·자투리 시간에 쓰는 교실 놀이·보조 자료입니다. 정규 교과 수업에 쓰실 때는 학교의 학습지원 소프트웨어 선정 절차(학교운영위원회 심의, 2026. 3. 1. 시행)를 따라 주세요.'

export function UseNotice({ className = '' }: { className?: string }) {
  return <p data-use-notice className={`text-xs text-muted-fg leading-relaxed ${className}`}>{USE_NOTICE}</p>
}
