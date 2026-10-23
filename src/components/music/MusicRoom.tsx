'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { FileText, Music, Pause, Play, Search, Shuffle, SkipBack, SkipForward, X } from 'lucide-react'

/** 곡 목록·음원은 배포된 비트:온에서 방문 때 읽는다 — 비트:온에 곡을 올리면 여기에도 저절로 뜬다. */
export const BEATON = 'https://beaton-evo.pages.dev'

export interface Song {
  id: string
  title: string
  genre: string
  duration: number
  audio: string
  glow?: string
  bg?: string[]
  orig?: string
}

/** 가사 있는 노래가 먼저, 그 안에서는 비트:온 목록 순서 그대로 */
export function lyricFirst(songs: Song[], lyrics: Record<string, string>): Song[] {
  return [...songs.filter((s) => lyrics[s.id]), ...songs.filter((s) => !lyrics[s.id])]
}

const mmss = (sec: number) => `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`
/** 섞어 듣기 — 렌더 밖 함수로 둔다(렌더 중 Math.random 금지 규칙) */
const pickRandom = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)]
const norm = (t: string) => t.toLowerCase().replace(/\s+/g, '')

function Lyrics({ text }: { text: string }) {
  return (
    <div className="space-y-1 text-[15px] leading-relaxed text-fg">
      {text.split('\n').map((line, i) => {
        const tag = /^\s*\[(.*)\]\s*$/.exec(line)
        if (tag) {
          const part = tag[1].split(' - ')[0]
          return (
            <p key={i} className="pt-3 text-xs font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-300">
              {part}
            </p>
          )
        }
        return line.trim() ? <p key={i}>{line}</p> : null
      })}
    </div>
  )
}

export function MusicRoom() {
  const [songs, setSongs] = useState<Song[] | null>(null)
  const [lyrics, setLyrics] = useState<Record<string, string>>({})
  const [failed, setFailed] = useState(false)
  const [onlyLyrics, setOnlyLyrics] = useState(true)
  const [genre, setGenre] = useState('')
  const [q, setQ] = useState('')
  const [cur, setCur] = useState<Song | null>(null)
  const [playing, setPlaying] = useState(false)
  const [shuffle, setShuffle] = useState(false)
  // 폰에선 가사 칸이 긴 목록 아래로 밀려 안 보인다 — 재생줄의 «가사» 단추로 아래에서 올라오는 판으로 연다
  const [sheet, setSheet] = useState(false)
  const [t, setT] = useState(0)
  const audio = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    let alive = true
    Promise.all([
      fetch(`${BEATON}/songs/index.json`).then((r) => r.json() as Promise<{ songs: Song[] }>),
      fetch('/music/lyrics.json').then((r) => (r.ok ? (r.json() as Promise<Record<string, string>>) : {})),
    ])
      .then(([idx, ly]) => {
        if (!alive) return
        setLyrics(ly)
        setSongs(lyricFirst(idx.songs, ly))
      })
      .catch(() => alive && setFailed(true))
    return () => {
      alive = false
    }
  }, [])

  const lyricCount = songs ? songs.filter((s) => lyrics[s.id]).length : 0
  const pool = useMemo(
    () => (songs ?? []).filter((s) => !onlyLyrics || lyrics[s.id]),
    [songs, lyrics, onlyLyrics]
  )
  const genres = useMemo(() => {
    const m = new Map<string, number>()
    for (const s of pool) m.set(s.genre, (m.get(s.genre) ?? 0) + 1)
    return [...m].sort((a, b) => b[1] - a[1])
  }, [pool])
  const list = useMemo(() => {
    const k = norm(q)
    return pool.filter(
      (s) => (!genre || s.genre === genre) && (!k || norm(`${s.title}${s.genre}${s.orig ?? ''}${lyrics[s.id] ?? ''}`).includes(k))
    )
  }, [pool, genre, q, lyrics])

  const play = (s: Song) => {
    const el = audio.current
    if (!el) return
    if (cur?.id === s.id) {
      if (el.paused) void el.play()
      else el.pause()
      return
    }
    setCur(s)
    setT(0)
    el.src = `${BEATON}/songs/${s.id}/${s.audio}`
    void el.play()
  }
  const step = (dir: 1 | -1) => {
    if (list.length === 0) return
    if (shuffle) return play(pickRandom(list))
    const i = cur ? list.findIndex((s) => s.id === cur.id) : -1
    play(list[(i + dir + list.length) % list.length])
  }

  if (failed) {
    return (
      <p className="py-16 text-center text-muted-fg">
        노래 목록을 불러오지 못했어요. 잠시 뒤 다시 열어 주세요.
      </p>
    )
  }

  return (
    <div className="pb-40">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {[
          [true, `가사 있는 노래 ${lyricCount}`],
          [false, `전체 ${songs?.length ?? 0}`],
        ].map(([v, label]) => (
          <button
            key={String(v)}
            type="button"
            aria-pressed={onlyLyrics === v}
            onClick={() => {
              setOnlyLyrics(v as boolean)
              setGenre('')
            }}
            className={`h-11 px-4 rounded-full text-sm font-semibold border transition-colors ${
              onlyLyrics === v
                ? 'border-primary-500/60 bg-primary-500/15 text-primary-700 dark:text-primary-200'
                : 'border-line bg-card text-muted-fg hover:text-fg'
            }`}
          >
            {label as string}
          </button>
        ))}
        <label className="relative ml-auto w-full sm:w-80">
          <span className="sr-only">노래 찾기</span>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-fg" aria-hidden />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="제목·장르·가사로 찾기"
            className="w-full h-11 pl-11 pr-4 rounded-2xl border border-line bg-card text-[15px] text-fg placeholder:text-muted-fg focus:outline-none focus:border-primary-500/60"
          />
        </label>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-6" role="group" aria-label="장르로 고르기">
        {[['', pool.length] as [string, number], ...genres].map(([g, n]) => (
          <button
            key={g || '_all'}
            type="button"
            aria-pressed={genre === g}
            onClick={() => setGenre(genre === g ? '' : g)}
            className={`shrink-0 whitespace-nowrap px-3.5 py-2 rounded-full text-sm font-semibold border transition-colors ${
              genre === g
                ? 'border-primary-500/60 bg-primary-500/15 text-primary-700 dark:text-primary-200'
                : 'border-line bg-card text-muted-fg hover:text-fg'
            }`}
          >
            {g || '모든 장르'}
            <span className="ml-1.5 text-xs opacity-70">{n}</span>
          </button>
        ))}
      </div>

      {!songs && <p className="py-16 text-center text-muted-fg">노래를 불러오는 중…</p>}

      <div className="grid lg:grid-cols-[minmax(0,1fr)_380px] gap-6 items-start">
        <ol data-testid="song-list" className="grid sm:grid-cols-2 2xl:grid-cols-3 gap-3">
          {list.map((s) => {
            const on = cur?.id === s.id
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => play(s)}
                  aria-label={`${s.title} ${on && playing ? '멈춤' : '듣기'}`}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-2xl border text-left transition-colors ${
                    on ? 'border-primary-500/60 bg-primary-500/10' : 'border-line bg-card hover:border-primary-500/40'
                  }`}
                >
                  <span
                    className="relative shrink-0 w-14 h-14 rounded-xl inline-flex items-center justify-center text-white"
                    style={{
                      background: `radial-gradient(circle at 30% 30%, ${s.glow ?? '#7c3aed'}, ${s.bg?.[0] ?? '#111'})`,
                    }}
                  >
                    {on && playing ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold text-fg truncate">{s.title}</span>
                    <span className="block text-xs text-muted-fg truncate">
                      {s.genre} · {mmss(s.duration)}
                      {lyrics[s.id] ? ' · 가사' : ' · 연주곡'}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ol>

        <aside
          data-testid="lyrics-panel"
          // glass 는 반투명이라 폰 판에선 뒤 목록이 비친다 — 판일 땐 불투명 배경, 재생줄(z-40) 아래 층
          className={`p-5 overflow-y-auto lg:block lg:sticky lg:top-24 lg:rounded-3xl lg:max-h-[calc(100vh-8rem)] ${
            sheet
              ? 'fixed inset-x-0 bottom-0 top-20 z-30 rounded-t-3xl border-t border-line pb-40 shadow-2xl lg:static lg:inset-auto lg:z-auto lg:pb-5 lg:shadow-none lg:border-t-0'
              : 'hidden glass'
          }`}
          style={sheet ? { background: 'var(--background)' } : undefined}
        >
          {sheet && (
            <button type="button" onClick={() => setSheet(false)} aria-label="가사 닫기" className="lg:hidden float-right w-11 h-11 -mt-2 -mr-2 inline-flex items-center justify-center text-muted-fg">
              <X className="w-5 h-5" />
            </button>
          )}
          {cur ? (
            <>
              <p className="text-xs font-semibold text-primary-600 dark:text-primary-300">{cur.genre}</p>
              <h2 className="mt-1 text-xl font-extrabold text-fg">{cur.title}</h2>
              {cur.orig && <p className="mt-1 text-xs text-muted-fg">원곡: {cur.orig}</p>}
              <div className="mt-4">
                {lyrics[cur.id] ? (
                  <Lyrics text={lyrics[cur.id]} />
                ) : (
                  <p className="text-muted-fg">가사 없는 연주곡이에요.</p>
                )}
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-muted-fg">
              <Music className="w-8 h-8 mx-auto mb-3 text-primary-500" />
              노래를 누르면 여기에 가사가 나와요
            </div>
          )}
        </aside>
      </div>

      {/* 아래 고정 재생줄 */}
      <div className={`fixed bottom-0 inset-x-0 z-40 transition-transform ${cur ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 pb-3">
          <div className="glass rounded-2xl shadow-lg px-3 sm:px-4 py-2 sm:py-3 flex flex-wrap sm:flex-nowrap items-center gap-x-1 sm:gap-x-3 gap-y-1">
            <button type="button" onClick={() => step(-1)} aria-label="이전 곡" className="w-11 h-11 inline-flex items-center justify-center rounded-full text-fg hover:bg-primary-500/10">
              <SkipBack className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => cur && play(cur)}
              aria-label={playing ? '멈춤' : '재생'}
              className="w-12 h-12 inline-flex items-center justify-center rounded-full bg-primary-500 text-white"
            >
              {playing ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>
            <button type="button" onClick={() => step(1)} aria-label="다음 곡" className="w-11 h-11 inline-flex items-center justify-center rounded-full text-fg hover:bg-primary-500/10">
              <SkipForward className="w-5 h-5" />
            </button>
            <div className="order-first sm:order-none basis-full sm:basis-auto min-w-0 flex-1">
              <p className="font-bold text-fg truncate">{cur?.title}</p>
              <input
                type="range"
                min={0}
                max={cur?.duration ?? 0}
                step={1}
                value={t}
                onChange={(e) => {
                  if (audio.current) audio.current.currentTime = Number(e.target.value)
                }}
                aria-label="재생 위치"
                className="w-full accent-primary-500"
              />
            </div>
            <span className="hidden sm:inline text-xs text-muted-fg tabular-nums">
              {mmss(t)} / {mmss(cur?.duration ?? 0)}
            </span>
            <button
              type="button"
              onClick={() => setShuffle((v) => !v)}
              aria-pressed={shuffle}
              aria-label="섞어 듣기"
              className={`w-11 h-11 inline-flex items-center justify-center rounded-full ${shuffle ? 'text-primary-500 bg-primary-500/10' : 'text-muted-fg'}`}
            >
              <Shuffle className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setSheet((v) => !v)}
              aria-pressed={sheet}
              aria-label="가사 보기"
              className="lg:hidden ml-auto h-11 px-3 inline-flex items-center gap-1 rounded-full text-sm font-semibold text-fg hover:bg-primary-500/10"
            >
              <FileText className="w-5 h-5" /> 가사
            </button>
            <button
              type="button"
              onClick={() => {
                audio.current?.pause()
                setCur(null)
                setSheet(false)
              }}
              aria-label="닫기"
              className="w-11 h-11 inline-flex items-center justify-center rounded-full text-muted-fg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <audio
        ref={audio}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setT(e.currentTarget.currentTime)}
        onEnded={() => step(1)}
      />
    </div>
  )
}
