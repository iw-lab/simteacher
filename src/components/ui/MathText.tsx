import { Fragment } from 'react'

/**
 * 화면 글 속 분수 «1/4» 를 위아래로 쌓아 그린다(초등 교과서 표기 — 분자 위·가로선·분모 아래).
 * 날짜·주소·«1/2학기» 같은 순서 표기는 분수가 아니라 그대로 둔다.
 * 스타일은 globals.css 의 .frac 규칙.
 */
const FRAC = /(?<![\w./])(\d{1,4})\/(\d{1,4})(?![\w/])/g
const ORDINAL = /^(학기|학년|월|일)/

export function MathText({ text }: { text: string }) {
  const out: React.ReactNode[] = []
  let last = 0
  let k = 0
  for (const m of text.matchAll(FRAC)) {
    const i = m.index ?? 0
    if (i > last) out.push(<Fragment key={k++}>{text.slice(last, i)}</Fragment>)
    if (ORDINAL.test(text.slice(i + m[0].length))) {
      // «1/2학기» = 1학기 또는 2학기(순서 표기) — 분수가 아니라 그대로 두고, 탐침이 건너뛰게 표시한다
      out.push(<span key={k++} data-frac-ok>{m[0]}</span>)
      last = i + m[0].length
      continue
    }
    out.push(
      <span key={k++} className="frac" role="img" aria-label={`${m[2]}분의 ${m[1]}`}>
        <span className="frac-n">{m[1]}</span>
        <span className="frac-d">{m[2]}</span>
      </span>,
    )
    last = i + m[0].length
  }
  if (last < text.length) out.push(<Fragment key={k++}>{text.slice(last)}</Fragment>)
  return <>{out}</>
}
