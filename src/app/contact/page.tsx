'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Send, CheckCircle, MessageCircle, Lock, Inbox, ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { siteConfig } from '@/data/siteConfig'
import { submitContactForm } from '@/lib/firestore'
import { Guestbook } from '@/components/community/Guestbook'
import { UseNotice } from '@/components/ui/UseNotice'

// 이 기기에서 보낸 문의 기록 (로컬 전용 — 서버로 안 나가고, 다른 사람에겐 안 보임)
const HISTORY_KEY = 'simteacher:inquiries'
type SentItem = { title: string; at: number }

function loadHistory(): SentItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY)
    return raw ? (JSON.parse(raw) as SentItem[]) : []
  } catch {
    return []
  }
}

function pushHistory(title: string) {
  if (typeof window === 'undefined') return
  try {
    const next = [{ title, at: Date.now() }, ...loadHistory()].slice(0, 20)
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next))
  } catch {
    /* 저장 실패는 조용히 무시 — 문의 자체엔 영향 없음 */
  }
}

function formatDate(ts: number): string {
  const d = new Date(ts)
  return `${d.getMonth() + 1}월 ${d.getDate()}일`
}

export default function ContactPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submittedWithEmail, setSubmittedWithEmail] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<SentItem[]>([])
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    school: '',
    title: '',
    message: '',
  })

  const [honeypot, setHoneypot] = useState('')

  useEffect(() => {
    setHistory(loadHistory())
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // 허니팟: 숨겨진 필드에 값이 있으면 봇 — 전송한 척만 한다
    if (honeypot) {
      setIsSubmitted(true)
      return
    }
    setIsSubmitting(true)
    setError(null)

    const hadEmail = formData.email.trim().length > 0
    const id = await submitContactForm({
      name: formData.name.trim(),
      email: formData.email.trim(),
      school: formData.school.trim(),
      title: formData.title.trim(),
      message: formData.message.trim(),
    })

    setIsSubmitting(false)
    if (id) {
      pushHistory(formData.title.trim() || '문의')
      setSubmittedWithEmail(hadEmail)
      setHistory(loadHistory())
      setIsSubmitted(true)
    } else {
      setError('전송에 실패했어요. 잠시 후 다시 시도하거나 이메일로 보내주세요.')
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary-500/15 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-primary-500 dark:text-primary-300" />
          </div>
          <h1 className="text-2xl font-bold text-fg mb-4">
            문의가 잘 도착했어요!
          </h1>
          <p className="text-muted-fg mb-8 leading-relaxed">
            {submittedWithEmail
              ? '읽어보고 남겨주신 이메일로 답장 드릴게요. 감사합니다.'
              : '심쌤만 볼 수 있는 문의함에 담겼어요. 답장을 받고 싶으시면 이메일을 남겨서 한 번 더 보내주셔도 좋아요.'}
          </p>
          <Button href="/">홈으로 돌아가기</Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen pt-24 pb-16 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        <div className="aurora-blob aurora-cyan w-[400px] h-[400px] -top-24 left-[12%] opacity-70" />
        <div className="aurora-blob aurora-violet w-[360px] h-[360px] bottom-0 right-[8%] opacity-60" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <span className="text-primary-600 dark:text-primary-300 font-semibold">Contact</span>
          <h1 className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight text-fg">
            편하게 <span className="gradient-text">한 마디</span> 남겨주세요
          </h1>
          <p className="mt-6 text-lg text-muted-fg max-w-xl mx-auto leading-relaxed">
            에듀테크, 바이브코딩, 학급 운영 이야기 — 무엇이든 좋습니다.
            로그인 없이 익명으로 붙이는 쪽지판이에요. 인사만 남겨주셔도 반가워요.
          </p>
        </motion.div>

        {/* 공개 쪽지판 안내 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass rounded-2xl p-5 mb-8 flex items-start gap-4 border border-primary-500/20"
        >
          <div className="w-11 h-11 shrink-0 rounded-xl bg-primary-500/15 flex items-center justify-center text-primary-600 dark:text-primary-300">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div className="text-sm leading-relaxed">
            <div className="font-bold text-fg mb-1">여기 남긴 쪽지는 모두에게 보여요</div>
            <p className="text-muted-fg">
              가입도 로그인도 없습니다. 닉네임은 <b>선택</b>이고, 비워두면 &lsquo;익명의 선생님&rsquo;으로
              올라가요. 조용히 물어볼 이야기라면 아래 <b>비공개 문의</b>를 쓰시면 심쌤만 봅니다.
            </p>
          </div>
        </motion.div>

        {/* 공개 방명록 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-14"
        >
          <Guestbook />
        </motion.div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="glass rounded-3xl overflow-hidden">
            <button
              type="button"
              onClick={() => setFormOpen((v) => !v)}
              aria-expanded={formOpen}
              className="w-full flex items-center gap-3 p-6 md:px-10 text-left hover:bg-muted/40 transition-colors"
            >
              <Lock className="w-5 h-5 text-primary-500 dark:text-primary-300 shrink-0" />
              <span className="min-w-0">
                <span className="block text-lg font-bold text-fg">비공개로 문의하기</span>
                <span className="block text-sm text-muted-fg mt-0.5">
                  심쌤만 볼 수 있어요. 다른 방문자에게는 보이지 않습니다.
                </span>
              </span>
              <ChevronDown
                className={`ml-auto w-5 h-5 text-muted-fg shrink-0 transition-transform ${
                  formOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            <div className={formOpen ? 'block p-6 pt-0 md:px-10 md:pb-10' : 'hidden'}>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 허니팟 — 봇 스팸 방지용 숨김 필드 (사람은 보지도, 채우지도 않음) */}
              <input
                type="text"
                name="website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                autoComplete="off"
                tabIndex={-1}
                aria-hidden="true"
                className="hidden"
              />

              <Input
                label="제목"
                name="title"
                id="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="어떤 이야기인가요?"
                maxLength={120}
                required
              />

              <Textarea
                label="내용"
                name="message"
                id="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="하고 싶은 이야기를 자유롭게 적어주세요"
                rows={6}
                maxLength={5000}
                required
              />

              <div className="grid md:grid-cols-3 gap-6">
                <Input
                  label="이름 (선택)"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="닉네임도 좋아요"
                  maxLength={100}
                />
                <Input
                  label="학교 (선택)"
                  name="school"
                  id="school"
                  value={formData.school}
                  onChange={handleChange}
                  placeholder="안 적으셔도 돼요"
                  maxLength={100}
                />
                <Input
                  label="이메일 (선택)"
                  name="email"
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="답장 받으실 주소"
                  maxLength={200}
                />
              </div>

              <p className="text-xs text-muted-fg -mt-2">
                답장을 받고 싶으시면 이메일을 남겨주세요. 그 외엔 모두 비워두셔도 됩니다.
              </p>

              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              )}

              <Button type="submit" isLoading={isSubmitting} className="w-full">
                <Send className="w-4 h-4 mr-2" />
                문의 보내기
              </Button>
            </form>
            </div>
          </div>
        </motion.div>

        {/* 이 기기에서 보낸 문의 (로컬 기록) */}
        {history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-6 mt-8"
          >
            <div className="flex items-center gap-2 mb-4 text-fg">
              <Inbox className="w-4 h-4 text-primary-500 dark:text-primary-300" />
              <h3 className="text-sm font-bold">이 기기에서 보낸 문의</h3>
            </div>
            <ul className="divide-y divide-line">
              {history.map((item, i) => (
                <li
                  key={`${item.at}-${i}`}
                  className="py-2.5 flex items-center justify-between gap-4 text-sm"
                >
                  <span className="text-fg truncate">{item.title}</span>
                  <span className="text-muted-fg shrink-0">{formatDate(item.at)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-muted-fg">
              이 목록은 지금 쓰시는 기기에만 저장돼요. 다른 사람은 볼 수 없어요.
            </p>
          </motion.div>
        )}

        {/* 이메일로 직접 보내기 (대체 수단) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass rounded-2xl p-5 mt-8 flex items-center justify-center gap-4"
        >
          <div className="w-11 h-11 rounded-xl bg-primary-500/15 flex items-center justify-center text-primary-600 dark:text-primary-300">
            <Mail className="w-5 h-5" />
          </div>
          <div className="text-center sm:text-left">
            <div className="text-sm text-muted-fg">폼 대신 이메일로 보내셔도 돼요</div>
            <a
              href={`mailto:${siteConfig.links.email}`}
              className="font-semibold text-fg hover:text-primary-600 dark:hover:text-primary-300 transition-colors"
            >
              {siteConfig.links.email}
            </a>
          </div>
        </motion.div>

        {/* 쓰임새 안내 — 소개·문의 맨 아래에만(2026-10-25 «첫화면에 써놓으면 안 쓰고 싶겠어» · «이 문구는 맨 아래다 써») */}
        <UseNotice className="text-center max-w-2xl mx-auto mt-16" />
      </div>
    </div>
  )
}
