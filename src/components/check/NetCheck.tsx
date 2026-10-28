'use client'

import { useCallback, useEffect, useState } from 'react'

/**
 * 이 망에서 선행쌤 주소들이 열리는가 — 보는 사람 브라우저에서만 재고, 아무 데도 보내지 않는다.
 *
 * 왜 만들었나 — 2026-10-28. 학교 와이파이가 ssamzip.com 을 DNS 127.0.0.1 로 꺾는데,
 * 학교마다 차단 목록이 달라 «다른 학교에서도 막히나»를 알 길이 없었다.
 * 동료 선생님이 이 페이지만 열면 자기 망에서 뭐가 막히는지 바로 보인다.
 *
 * 재는 법 — 그 주소의 작은 그림 하나를 불러 본다. DNS 가 127.0.0.1 로 꺾이면
 * 곧바로 실패하고, 열리면 그림이 온다. 느린 망을 «막힘»으로 찍지 않도록 8초까지 기다린다.
 * 🔴 개인정보는 한 글자도 모으지 않는다 — 결과는 이 화면에만 남는다.
 */
type State = 'ing' | 'ok' | 'blocked' | 'slow'

const TARGETS = [
  { host: 'ssamzip.com', label: '선행쌤 본 주소', path: '/icon-48.png' },
  { host: 'sunhaengssam.web.app', label: '선행쌤 두 문', path: '/icon-48.png' },
  { host: 'tajawangguk.pages.dev', label: '타자왕국(놀이)', path: '/favicon.ico' },
  { host: 'kkeutjinhwa.pages.dev', label: '끝까지 진화(놀이)', path: '/favicon.ico' },
]

const TIMEOUT = 8000

function probe(url: string): Promise<State> {
  return new Promise((resolve) => {
    let done = false
    const img = new Image()
    const finish = (s: State) => {
      if (done) return
      done = true
      resolve(s)
    }
    img.onload = () => finish('ok')
    img.onerror = () => finish('blocked')
    window.setTimeout(() => finish('slow'), TIMEOUT)
    img.src = `${url}?r=${Date.now()}`
  })
}

export function NetCheck() {
  const [res, setRes] = useState<Record<string, State>>({})
  const [runAt, setRunAt] = useState(0)

  const run = useCallback(() => {
    setRes({})
    setRunAt(Date.now())
  }, [])

  useEffect(() => {
    let alive = true
    for (const t of TARGETS) {
      setRes((r) => ({ ...r, [t.host]: 'ing' }))
      probe(`https://${t.host}${t.path}`).then((s) => {
        if (alive) setRes((r) => ({ ...r, [t.host]: s }))
      })
    }
    return () => {
      alive = false
    }
  }, [runAt])

  const done = TARGETS.every((t) => res[t.host] && res[t.host] !== 'ing')
  const blocked = TARGETS.filter((t) => res[t.host] === 'blocked')

  return (
    <div className="space-y-6">
      <ul className="rounded-2xl border border-line bg-card divide-y divide-line overflow-hidden">
        {TARGETS.map((t) => {
          const s = res[t.host]
          return (
            <li key={t.host} className="flex items-center justify-between gap-4 px-4 py-4">
              <div className="min-w-0">
                <div className="font-bold text-fg">{t.label}</div>
                <div className="text-sm text-muted-fg truncate">{t.host}</div>
              </div>
              <div className="shrink-0 text-sm font-bold tabular-nums">
                {!s || s === 'ing' ? (
                  <span className="text-muted-fg">재는 중…</span>
                ) : s === 'ok' ? (
                  <span className="text-emerald-600 dark:text-emerald-400">열림</span>
                ) : s === 'slow' ? (
                  <span className="text-amber-600 dark:text-amber-400">느림(모름)</span>
                ) : (
                  <span className="text-rose-600 dark:text-rose-400">막힘</span>
                )}
              </div>
            </li>
          )
        })}
      </ul>

      {done && (
        <div className="rounded-2xl border border-line bg-card p-5 text-[15px] leading-relaxed">
          {blocked.length === 0 ? (
            <p className="text-fg">
              <b>이 망에서는 전부 열립니다.</b> 막히는 게 없습니다.
            </p>
          ) : (
            <>
              <p className="text-fg">
                이 망은 <b>{blocked.map((b) => b.label).join(' · ')}</b> 를 막고 있습니다.
              </p>
              <p className="mt-2 text-muted-fg">
                학교 와이파이가 주소 목록으로 막는 경우가 많습니다. 같은 학교라도{' '}
                <b>유선 랜은 안 막히는</b> 일이 흔한데, 교무망과 학생·무선망이 서로 다른 목록을 쓰기 때문입니다.
                {res['sunhaengssam.web.app'] === 'ok' && (
                  <>
                    {' '}이 망에서는{' '}
                    <a className="underline font-semibold" href="https://sunhaengssam.web.app/">
                      sunhaengssam.web.app
                    </a>{' '}
                    로 들어오시면 됩니다 — 내용은 같습니다.
                  </>
                )}
              </p>
            </>
          )}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={run}
          className="inline-flex items-center min-h-11 px-5 rounded-full bg-primary-500/15 text-primary-700 dark:text-primary-200 border border-primary-500/60 font-bold"
        >
          다시 재기
        </button>
        <p className="text-sm text-muted-fg">결과는 이 화면에만 남습니다 — 아무것도 보내지 않습니다.</p>
      </div>
    </div>
  )
}
