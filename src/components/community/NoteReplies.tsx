'use client'

/**
 * 방명록 쪽지 하나에 달린 답글.
 *
 * 🔴 **펼칠 때만 읽는다.** 모든 쪽지의 답글을 한 번에 구독하면(= slug 한 칸으로 몰면)
 *    답글이 200 을 넘는 순간 오래된 쪽지의 답글이 **조용히 사라진다** — 규칙의 list 상한 200 은
 *    클라이언트가 늘릴 수 없다. 8way 교차검증에서 4계열 전원이 같은 지적을 했다.
 *    그래서 부모(쪽지)별로 나눠 구독하고, 안 펼치면 읽기 비용이 0 이다.
 */

import { useCallback, useEffect, useState } from 'react'
import { CornerDownRight, Loader2, Send, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { AuthorLine } from './AuthorLine'
import {
  COMMENT_MAX,
  COMMENT_NICK_MAX,
  GUESTBOOK_SLUG,
  commentCooldownLeftMs,
  deleteComment,
  myCommentIds,
  postComment,
  subscribeReplies,
  type Comment,
} from '@/lib/community'

function timeAgo(ms: number | null): string {
  if (!ms) return '방금'
  const min = Math.floor((Date.now() - ms) / 60000)
  if (min < 1) return '방금'
  if (min < 60) return `${min}분 전`
  const hour = Math.floor(min / 60)
  if (hour < 24) return `${hour}시간 전`
  const day = Math.floor(hour / 24)
  if (day < 7) return `${day}일 전`
  const d = new Date(ms)
  return `${d.getMonth() + 1}월 ${d.getDate()}일`
}

export function NoteReplies({ entryId }: { entryId: string }) {
  const [open, setOpen] = useState(false)
  const [rows, setRows] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [nickname, setNickname] = useState('')
  const [text, setText] = useState('')
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mine, setMine] = useState<string[]>([])
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    const un = subscribeReplies(
      GUESTBOOK_SLUG,
      entryId,
      (r) => {
        setRows(r)
        setLoading(false)
      },
      (e) => {
        console.error('[replies]', e)
        setLoadError('답글을 불러오지 못했어요.')
        setLoading(false)
      }
    )
    return () => un()
  }, [open, entryId])

  useEffect(() => setMine(myCommentIds()), [rows])
  useEffect(() => {
    if (!open) return
    const t = setInterval(() => setCooldown(commentCooldownLeftMs()), 1000)
    setCooldown(commentCooldownLeftMs())
    return () => clearInterval(t)
  }, [open])

  const submit = useCallback(async () => {
    if (posting) return
    setError(null)
    setPosting(true)
    try {
      await postComment({ slug: GUESTBOOK_SLUG, nickname, message: text, parentId: entryId })
      setText('')
      setMine(myCommentIds())
      setCooldown(commentCooldownLeftMs())
    } catch (e) {
      setError(e instanceof Error ? e.message : '남기지 못했어요. 잠시 뒤 다시 시도해주세요.')
    } finally {
      setPosting(false)
    }
  }, [posting, nickname, text, entryId])

  const remove = useCallback(async (id: string) => {
    try {
      await deleteComment(id)
      setMine(myCommentIds())
    } catch (e) {
      const denied =
        typeof e === 'object' && e !== null && (e as { code?: string }).code === 'permission-denied'
      setError(denied ? '본인이 쓴 답글만 지울 수 있어요.' : '삭제하지 못했어요.')
    }
  }, [])

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 inline-flex items-center gap-1 text-xs text-muted-fg hover:text-primary-500 transition-colors"
      >
        <CornerDownRight className="w-3 h-3" aria-hidden />
        답글
      </button>
    )
  }

  return (
    <div className="mt-3 border-t border-fg/10 pt-3">
      {loading ? (
        <p className="flex items-center gap-1 text-xs text-muted-fg">
          <Loader2 className="w-3 h-3 animate-spin" aria-hidden />
          불러오는 중…
        </p>
      ) : loadError ? (
        <p className="text-xs text-muted-fg">{loadError}</p>
      ) : (
        rows.length > 0 && (
          <ul className="space-y-2 mb-3">
            {rows.map((r) => (
              <li key={r.id}>
                <div className="flex items-baseline gap-2">
                  <AuthorLine nickname={r.nickname} isOwner={r.isOwner} />
                  <span className="text-[11px] text-muted-fg">{timeAgo(r.createdAt)}</span>
                  {mine.includes(r.id) && (
                    <button
                      type="button"
                      onClick={() => remove(r.id)}
                      className="ml-auto text-muted-fg hover:text-red-500 transition-colors"
                      aria-label="내 답글 지우기"
                    >
                      <Trash2 className="w-3 h-3" aria-hidden />
                    </button>
                  )}
                </div>
                <p className="text-sm leading-relaxed text-fg/90 whitespace-pre-wrap break-words">
                  {r.message}
                </p>
              </li>
            ))}
          </ul>
        )
      )}

      <input
        type="text"
        value={nickname}
        onChange={(e) => setNickname(e.target.value.slice(0, COMMENT_NICK_MAX))}
        placeholder="이름 (선택 · 비우면 익명)"
        maxLength={COMMENT_NICK_MAX}
        className="w-full mb-2 px-2 py-1.5 rounded-lg bg-bg/60 border border-fg/15 text-sm text-fg placeholder:text-muted-fg/70 focus:outline-none focus:border-primary-400"
      />
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, COMMENT_MAX))}
        placeholder="답글을 남겨 주세요."
        rows={2}
        maxLength={COMMENT_MAX}
        className="w-full px-2 py-1.5 rounded-lg bg-bg/60 border border-fg/15 text-sm text-fg placeholder:text-muted-fg/70 resize-y focus:outline-none focus:border-primary-400"
      />
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-muted-fg hover:text-fg transition-colors"
        >
          접기
        </button>
        <Button
          size="sm"
          className="ml-auto"
          onClick={submit}
          disabled={posting || cooldown > 0 || !text.trim()}
        >
          {posting ? (
            <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" aria-hidden />
          ) : (
            <Send className="w-3.5 h-3.5 mr-1" aria-hidden />
          )}
          {cooldown > 0 ? `${Math.ceil(cooldown / 1000)}초 뒤에` : '답글'}
        </Button>
      </div>
    </div>
  )
}
