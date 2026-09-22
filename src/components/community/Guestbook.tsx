'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PenLine, Send, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { NoteReplies } from './NoteReplies'
import {
  MESSAGE_MAX,
  NICKNAME_MAX,
  NOTE_COLORS,
  cooldownLeftMs,
  deleteGuestbook,
  myUid,
  postGuestbook,
  subscribeGuestbook,
  type GuestbookEntry,
  type NoteColor,
} from '@/lib/community'
import { isOwnerSignedIn, onAuthChange } from '@/lib/firebase'

// 포스트잇 색 — 라이트/다크 모두에서 글자가 읽히는 조합만 골랐다.
const COLOR_CLASS: Record<string, string> = {
  yellow: 'bg-amber-100 dark:bg-amber-300/15 border-amber-300/60 dark:border-amber-300/25',
  mint: 'bg-teal-100 dark:bg-teal-300/15 border-teal-300/60 dark:border-teal-300/25',
  sky: 'bg-sky-100 dark:bg-sky-300/15 border-sky-300/60 dark:border-sky-300/25',
  pink: 'bg-rose-100 dark:bg-rose-300/15 border-rose-300/60 dark:border-rose-300/25',
  lilac: 'bg-violet-100 dark:bg-violet-300/15 border-violet-300/60 dark:border-violet-300/25',
}

const COLOR_SWATCH: Record<string, string> = {
  yellow: 'bg-amber-300',
  mint: 'bg-teal-300',
  sky: 'bg-sky-300',
  pink: 'bg-rose-300',
  lilac: 'bg-violet-300',
}

function timeAgo(ms: number | null): string {
  if (!ms) return '방금'
  const diff = Date.now() - ms
  const min = Math.floor(diff / 60000)
  if (min < 1) return '방금'
  if (min < 60) return `${min}분 전`
  const hour = Math.floor(min / 60)
  if (hour < 24) return `${hour}시간 전`
  const day = Math.floor(hour / 24)
  if (day < 7) return `${day}일 전`
  const d = new Date(ms)
  return `${d.getMonth() + 1}월 ${d.getDate()}일`
}

export function Guestbook() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [nickname, setNickname] = useState('')
  const [message, setMessage] = useState('')
  const [color, setColor] = useState<NoteColor>('yellow')
  const [posting, setPosting] = useState(false)
  const [postError, setPostError] = useState<string | null>(null)
  const [uid, setUid] = useState<string | null>(null)
  // 주인 로그인 상태 — 쪽지 쓰기를 막는 데만 쓴다(배지 권한은 규칙이 정한다)
  const [ownerMode, setOwnerMode] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const honeypot = useRef('')

  useEffect(() => {
    let unsub: (() => void) | undefined
    try {
      unsub = subscribeGuestbook(
        (list) => {
          setEntries(list)
          setLoading(false)
        },
        (e) => {
          console.error('guestbook subscribe failed:', e)
          setLoadError('방명록을 불러오지 못했어요. 잠시 후 새로고침해 주세요.')
          setLoading(false)
        }
      )
    } catch (e) {
      console.error('guestbook init failed:', e)
      setLoadError('방명록을 불러오지 못했어요.')
      setLoading(false)
    }
    return () => unsub?.()
  }, [])

  // 내 글에만 삭제 버튼을 보여주려면 내 uid 를 알아야 한다.
  // 익명 로그인은 글을 쓸 때 어차피 필요하니, 미리 한 번 해 둔다.
  useEffect(() => {
    myUid()
      .then(setUid)
      .catch(() => setUid(null))
  }, [])

  // 주인으로 로그인/로그아웃하면 uid 도 바뀐다 — 둘을 같이 다시 읽는다.
  useEffect(() => {
    const off = onAuthChange(() => {
      setOwnerMode(isOwnerSignedIn())
      myUid()
        .then(setUid)
        .catch(() => setUid(null))
    })
    setOwnerMode(isOwnerSignedIn())
    return off
  }, [])

  const submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (honeypot.current) return // 봇: 보낸 척만 한다
      setPostError(null)

      const left = cooldownLeftMs()
      if (left > 0) {
        setPostError(`조금 전에 남기셨어요. ${Math.ceil(left / 1000)}초 뒤에 다시 눌러주세요.`)
        return
      }

      setPosting(true)
      try {
        await postGuestbook({ nickname, message, color })
        setMessage('')
      } catch (err) {
        const msg = err instanceof Error ? err.message : ''
        setPostError(
          msg.includes('permission') || msg.includes('Missing')
            ? '글을 남기지 못했어요. 브라우저의 시크릿 모드나 쿠키 차단 설정 때문일 수 있어요.'
            : msg || '글을 남기지 못했어요. 잠시 후 다시 시도해주세요.'
        )
      } finally {
        setPosting(false)
      }
    },
    [nickname, message, color]
  )

  const remove = useCallback(async (id: string) => {
    setDeletingId(id)
    try {
      await deleteGuestbook(id)
    } catch (e) {
      console.error('delete failed:', e)
      setPostError('삭제하지 못했어요. 글을 쓴 그 브라우저에서만 지울 수 있어요.')
    } finally {
      setDeletingId(null)
    }
  }, [])

  return (
    <div className="space-y-8">
      {/* 쓰기 카드 */}
      <div className="glass rounded-3xl p-6 md:p-8">
        <div className="flex items-center gap-2 mb-5 text-fg">
          <PenLine className="w-5 h-5 text-primary-500 dark:text-primary-300" />
          <h2 className="text-lg font-bold">한 마디 남기기</h2>
          <span className="ml-auto text-xs text-muted-fg">
            로그인 없이, 익명으로
          </span>
        </div>

        {ownerMode ? (
          /* 🔴 주인이 로그인한 채로 쪽지를 쓰면 안 된다. 방명록 문서는 uid 를 **공개로** 담기 때문에
             그 순간 주인의 uid 가 드러나고, 주인이 익명으로 남긴 쪽지까지 대조로 전부 특정된다
             (8way 교차검증 지적). 주인은 «답글»로만 말한다 — 답글은 uid 를 담지 않는다. */
          <p className="rounded-xl border border-fg/15 bg-bg/40 p-4 text-sm text-muted-fg">
            심쌤으로 로그인한 상태예요. 쪽지는 익명으로만 남길 수 있어서, 지금은 새 쪽지를 쓸 수
            없습니다. 각 쪽지의 <b>답글</b>로 답해주세요.
          </p>
        ) : (
        <form onSubmit={submit} className="space-y-4">
          <input
            type="text"
            name="website"
            onChange={(e) => (honeypot.current = e.target.value)}
            autoComplete="off"
            tabIndex={-1}
            aria-hidden="true"
            className="hidden"
          />

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="인사도 좋고, 궁금한 것도 좋고, 이런 사이트 만들어달라는 부탁도 좋아요."
            rows={4}
            maxLength={MESSAGE_MAX}
            required
            className="w-full px-4 py-3 rounded-xl border border-line bg-card text-fg placeholder:text-muted-fg/60 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-y"
          />

          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="닉네임 (비우면 '익명의 선생님')"
              maxLength={NICKNAME_MAX}
              className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl border border-line bg-card text-fg placeholder:text-muted-fg/60 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            />

            <div className="flex items-center gap-1.5" role="radiogroup" aria-label="쪽지 색">
              {NOTE_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={color === c}
                  aria-label={`${c} 색`}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full ${COLOR_SWATCH[c]} transition-all ${
                    color === c
                      ? 'ring-2 ring-offset-2 ring-primary-500 ring-offset-bg scale-110'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                />
              ))}
            </div>

            <span className="text-xs text-muted-fg tabular-nums">
              {message.length}/{MESSAGE_MAX}
            </span>

            <Button type="submit" isLoading={posting} className="ml-auto">
              <Send className="w-4 h-4 mr-2" />
              붙이기
            </Button>
          </div>

          {postError && (
            <p className="text-sm text-red-600 dark:text-red-400">{postError}</p>
          )}
          <p className="text-xs text-muted-fg">
            남긴 글은 <b>모든 방문자에게 보입니다.</b> 지우는 건 글을 쓴 그 브라우저에서만 가능해요.
            개인정보(연락처·학교명 등)는 적지 말아주세요.
          </p>
        </form>
        )}
      </div>

      {/* 목록 */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-fg">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          불러오는 중…
        </div>
      ) : loadError ? (
        <p className="text-center py-12 text-muted-fg">{loadError}</p>
      ) : entries.length === 0 ? (
        <p className="text-center py-12 text-muted-fg">
          아직 아무도 없네요. 첫 쪽지를 붙여주세요 🙂
        </p>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 [column-fill:_balance]">
          <AnimatePresence initial={false}>
            {entries.map((e) => (
              <motion.div
                key={e.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`mb-4 break-inside-avoid rounded-2xl border p-5 shadow-sm ${
                  COLOR_CLASS[e.color] ?? COLOR_CLASS.yellow
                }`}
              >
                <p className="text-[15px] leading-relaxed text-fg whitespace-pre-wrap break-words">
                  {e.message}
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-muted-fg">
                  <span className="font-semibold text-fg/80 truncate">{e.nickname}</span>
                  <span aria-hidden>·</span>
                  <span className="shrink-0">{timeAgo(e.createdAt)}</span>
                  {uid && e.uid === uid && (
                    <button
                      type="button"
                      onClick={() => remove(e.id)}
                      disabled={deletingId === e.id}
                      className="ml-auto inline-flex items-center gap-1 text-muted-fg hover:text-red-500 transition-colors disabled:opacity-50"
                      aria-label="내 글 지우기"
                    >
                      {deletingId === e.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                      지우기
                    </button>
                  )}
                </div>
                <NoteReplies entryId={e.id} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
