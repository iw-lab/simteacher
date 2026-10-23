// 학교 망에서 막히는 게임을 선행쌤 도메인 아래 길(ssamzip.com/<길>/)로도 연다 — 2026-10-23 사용자 «끝까지 진화가 학교 와이파이에서 안 들어가진다».
// 그 망은 kkeutjinhwa.pages.dev 이름과 ssamzip.com 의 하위 도메인(jinhwa.ssamzip.com 등)을 DNS 에서 127.0.0.1 로 막지만
// ssamzip.com 자체는 통과시킨다(실측). 게임 빌드(dist)는 상대 경로라 하위 폴더에 그대로 얹힌다.
// 원본이 없으면(다른 기기) 건너뛴다 — 이 폴더는 git 에 넣지 않는다(.gitignore). 게임을 고쳐 배포했으면 이 사이트도 다시 배포해야 반영된다.
import { cpSync, existsSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'

const GAMES = [{ path: 'jinhwa', src: join(homedir(), 'Documents/dev/서바이벌게임/dist') }]
for (const g of GAMES) {
  const out = new URL(`../public/${g.path}/`, import.meta.url).pathname
  if (!existsSync(join(g.src, 'index.html'))) {
    console.log(`sync-games: 원본 없음(${g.src}) — /${g.path}/ 건너뜀`)
    continue
  }
  rmSync(out, { recursive: true, force: true })
  cpSync(g.src, out, { recursive: true, filter: (p) => !p.endsWith('/_headers') && !p.endsWith('/_redirects') })
  console.log(`sync-games: ${g.src} → public/${g.path}/`)
}
