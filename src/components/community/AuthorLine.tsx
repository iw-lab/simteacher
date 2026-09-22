import { BadgeCheck } from 'lucide-react'

/**
 * 글쓴이 이름 한 줄.
 *
 * 🔴 **주인 답변의 이름은 문서가 아니라 상수로 그린다.** 배지 자체는 규칙이 지켜 주지만,
 *    닉네임은 누구나 적을 수 있어서 「심쌤」이라고 써 놓으면 배지 옆에서 구별이 안 된다.
 *    (규칙도 주인이 아닌 사람의 닉네임에 '심쌤' 이 들어가는 것을 막지만, 화면도 문서의
 *     이름을 믿지 않는다 — 신뢰 신호는 한 군데서만 나와야 한다.)
 */
export function AuthorLine({ nickname, isOwner }: { nickname: string; isOwner: boolean }) {
  if (isOwner) {
    return (
      <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary-500">
        심쌤
        <span className="inline-flex items-center gap-0.5 rounded-full bg-primary-500/15 px-1.5 py-0.5 text-[11px] font-medium text-primary-500">
          <BadgeCheck className="h-3 w-3" aria-hidden />
          답변
        </span>
      </span>
    )
  }
  return <span className="text-sm font-semibold text-fg">{nickname || '익명'}</span>
}
