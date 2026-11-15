'use client'
// 선행쌤 머리줄 «내 티어» — 코드를 넣어 두면 여기서 여는 모든 게임에 티어가 따라간다(2026-11-15).
// 개인 순위판이 아니다 — 내 티어·칭호만 본다. 서버 = ssam-tier(코드 해시만 저장).
import { useEffect, useState } from 'react'
import { Award, X } from 'lucide-react'
import { codeOk, normCode, showCode, tierOf, titleName } from '@/lib/gb-tier-core.js'
import { TIER_KEY, TIER_URL, myTierCode, withTier } from '@/lib/tier-link'

type Me = { ok: boolean; why?: string; xp?: number; titles?: string[]; plays?: number; games?: number }

export function TierCode() {
  const [code, setCode] = useState('')
  const [me, setMe] = useState<Me | null>(null)
  const [open, setOpen] = useState(false)
  const [typed, setTyped] = useState('')
  const [msg, setMsg] = useState('')

  useEffect(() => { setCode(myTierCode()) }, [])
  // 게임으로 나가는 링크를 누르는 순간 #gbt=코드 를 붙인다(정적 빌드라 링크 글자에는 미리 못 넣는다)
  useEffect(() => {
    const on = (e: MouseEvent) => {
      const c = myTierCode(); if (!c) return
      const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null
      if (!a) return
      const n = withTier(a.href, c); if (n !== a.href) a.href = n
    }
    document.addEventListener('click', on, true); document.addEventListener('auxclick', on, true)
    return () => { document.removeEventListener('click', on, true); document.removeEventListener('auxclick', on, true) }
  }, [])
  useEffect(() => {
    if (!code) { setMe(null); return }
    let dead = false
    fetch(`${TIER_URL}/v1/me?code=${code}`).then((r) => r.json()).then((j: Me) => { if (!dead) setMe(j) }).catch(() => { if (!dead) setMe(null) })
    return () => { dead = true }
  }, [code])

  const save = async () => {
    const c = normCode(typed)
    if (!codeOk(c)) { setMsg('코드는 영어·숫자 8글자예요(한/영 키를 눌러 영어로)'); return }
    setMsg('확인하는 중…')
    try {
      const j: Me = await (await fetch(`${TIER_URL}/v1/me?code=${c}`)).json()
      if (!j.ok) { setMsg(j.why === 'slow' ? '너무 많이 틀렸어요 — 잠시 뒤에 다시 해요' : '그런 코드가 없어요 — 게임의 «내 티어» 창에서 확인해요'); return }
      localStorage.setItem(TIER_KEY, JSON.stringify({ code: c })); setCode(c); setMe(j); setTyped(''); setMsg('')
    } catch { setMsg('지금은 연결이 안 돼요 — 잠시 뒤에 다시 해요') }
  }
  const t = tierOf(me?.ok ? me.xp || 0 : 0)
  return (
    <div className="relative shrink-0">
      <button type="button" data-testid="tier-code" onClick={() => setOpen((v) => !v)} className="inline-flex items-center gap-1.5 min-h-[44px] px-3 rounded-full border border-line bg-card/70 text-sm font-bold text-fg hover:bg-card">
        <Award className="w-4 h-4" style={{ color: t.color }} />{code && me?.ok ? t.label : '내 티어'}
      </button>
      {open && (
        <div role="dialog" aria-label="내 티어 코드" className="absolute right-0 top-12 z-50 w-[300px] glass rounded-2xl p-4 text-left shadow-xl">
          <div className="flex items-center gap-2"><b className="text-fg">내 게임 티어</b>
            <button type="button" onClick={() => setOpen(false)} aria-label="닫기" className="ml-auto p-1 rounded-lg text-muted-fg hover:text-fg"><X className="w-4 h-4" /></button></div>
          {code && me?.ok ? (
            <>
              <p className="mt-2 text-lg font-black" style={{ color: t.color }}>{t.label}</p>
              <p className="text-sm text-muted-fg">{me.titles?.[0] ? `칭호 «${titleName(me.titles[0])}» · ` : ''}{me.plays ?? 0}판 · 게임 {me.games ?? 0}가지</p>
              <p className="mt-2 text-sm text-fg">코드 <b className="font-mono tracking-widest">{showCode(code)}</b></p>
              <p className="mt-1 text-xs text-muted-fg">여기서 여는 게임마다 이 티어가 그대로 이어져요</p>
              <button type="button" onClick={() => { localStorage.removeItem(TIER_KEY); setCode(''); setMe(null) }} className="mt-2 text-xs text-muted-fg underline">이 기기에서 코드 지우기</button>
            </>
          ) : (
            <>
              <p className="mt-1 text-sm text-muted-fg">게임 첫 화면의 티어 배지를 누르면 «내 코드»가 있어요. 여기에 한 번 넣어 두면 선행쌤에서 여는 모든 게임에 티어가 이어져요.</p>
              <input value={typed} onChange={(e) => setTyped(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') void save() }} inputMode="text" autoCapitalize="characters" spellCheck={false} maxLength={9} placeholder="ABCD-2345"
                className="mt-2 w-full min-h-[44px] rounded-xl border border-line bg-bg px-3 font-mono text-lg tracking-widest uppercase text-fg" aria-label="내 코드 8글자" />
              <button type="button" onClick={() => void save()} className="mt-2 w-full min-h-[44px] rounded-xl bg-fg text-bg font-bold">넣기</button>
              {msg && <p className="mt-1 text-sm text-red-500" role="status">{msg}</p>}
            </>
          )}
        </div>
      )}
    </div>
  )
}
