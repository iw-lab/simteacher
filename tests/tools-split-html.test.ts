/**
 * 빌드된 HTML 검사(postbuild) — 게임 ↔ 수업 도구가 «화면에» 실제로 그렇게 섰나.
 * 순수 함수(catalog-split.test)만 보면 페이지가 그 함수를 안 쓰고 옛 목록을 그대로 그려도 통과한다.
 *   잡는 것: /tools 에 빠진 도구 · 홈 게임 칸에 남은 도구뿐인 곳/책상 프로그램 · 갈래 단추 없음 · 사이트맵 누락
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { classToolSites, gameSites, isToolOnly } from '../src/lib/catalog'
import { learningSites, teacherTools } from '../src/data/projects'

const OUT = process.env.OUT_DIR || 'out'
const html = (p: string) => readFileSync(`${OUT}/${p}`, 'utf8')
const slugsIn = (h: string) => [...h.matchAll(/data-slug="([^"]+)"/g)].map((m) => m[1])

describe('빌드 HTML — 게임 ↔ 수업 도구', () => {
  const home = html('index.html'), tools = html('tools/index.html'), teacher = html('teacher/index.html')
  // 2026-11-04 사용자 «수업 보조 도구 오른쪽에 선생님 도구 탭을 추가하고 선생님 책상 프로그램을 그쪽으로 옮기자»
  it('/tools 에는 수업 도구 사이트만(책상 프로그램은 없다)', () => {
    const want = classToolSites(learningSites).map((s) => s.slug).sort()
    expect([...new Set(slugsIn(tools))].sort()).toEqual(want)
  })
  it('/teacher 에 선생님 책상 프로그램이 전부 · 수업 도구 사이트는 없다', () => {
    expect([...new Set(slugsIn(teacher))].sort()).toEqual(teacherTools.map((s) => s.slug).sort())
  })
  it('갈래 단추 순서 = 교실 놀이 · 수업 보조 도구 · 선생님 도구(세 쪽 모두) · /teacher 에서 선생님 도구가 현재 탭', () => {
    for (const h of [home, tools, teacher]) {
      const a = h.indexOf('data-testid="tab-games"'), b = h.indexOf('data-testid="tab-tools"'), c = h.indexOf('data-testid="tab-teacher"')
      expect(a).toBeGreaterThan(-1); expect(b).toBeGreaterThan(a); expect(c).toBeGreaterThan(b)
    }
    expect(teacher).toMatch(/data-testid="tab-teacher"[^>]*aria-current="page"|aria-current="page"[^>]*data-testid="tab-teacher"/)
    const site = (process.env.NEXT_PUBLIC_SITE_URL || 'https://ssamzip.kr').replace(/\/$/, '')
    if (site === 'https://ssamzip.kr') expect(html('sitemap.xml')).toContain(`${site}/teacher/`)
  })
  it('홈 카드 = 게임 쪽 전부, 도구뿐인 곳·책상 프로그램은 없다', () => {
    const got = new Set(slugsIn(home))
    expect([...got].sort()).toEqual(gameSites(learningSites).map((s) => s.slug).sort())
    for (const s of [...learningSites.filter(isToolOnly), ...teacherTools]) expect(got.has(s.slug)).toBe(false)
  })
  it('두 페이지 모두 «게임 | 수업 도구» 갈래 단추 · 사이트맵에 /tools/', () => {
    for (const h of [home, tools]) {
      expect(h).toContain('data-testid="tab-games"')
      expect(h).toContain('data-testid="tab-tools"')
    }
    expect(tools).toMatch(/data-testid="tab-tools"[^>]*aria-current="page"|aria-current="page"[^>]*data-testid="tab-tools"/)
    // 두 문 빌드(NEXT_PUBLIC_SITE_URL)면 그 주소로 들어간다 — 본 주소를 박으면 두 문 빌드가 FAIL
    const site = (process.env.NEXT_PUBLIC_SITE_URL || 'https://ssamzip.kr').replace(/\/$/, '')
    // 두 문 사이트맵은 홈 하나뿐이다(하위 페이지 noindex — 2026-11-02, 🔒 tools/check-two-doors.mjs)
    if (site === 'https://ssamzip.kr') expect(html('sitemap.xml')).toContain(`${site}/tools/`)
    else expect(html('sitemap.xml')).not.toContain(`${site}/tools/`)
  })
  // 2026-10-24 «수위를 낮추고» — 교육부 가이드라인(안) 2025.12: 학운위 심의 필수는 «정규 교과를 위해 사용하는 것으로 한정»(FAQ Q6).
  //   정규 수업용으로 읽히는 표현을 화면에서 빼고, 쓰임새 안내를 /tools 와 모든 쪽 꼬리말에 둔다.
  // 10-25 «첫화면에 저렇게 써놓으면 안 쓰고 싶겠어 — 소개나 문의에» → 안내 풀 문장은 소개·문의에만, 홈·/tools 에는 없다.
  it('정규 수업용 표현이 화면에 없고 쓰임새 안내는 소개·문의에만', () => {
    const BANNED = ['수업에 바로', '한 시간 수업', '정규 수업용', '심의 불필요', '심의 대상 아님', '>수업 도구<']
    for (const [name, h] of [['home', home], ['tools', tools]] as const) {
      for (const b of BANNED) expect(h.includes(b), `${name} 에 «${b}»`).toBe(false)
      expect(h, `${name} 에 쓰임새 안내 풀 문장`).not.toContain('data-use-notice')
    }
    // 10-25 «이 문구는 맨 아래다 써» — 안내 뒤 꼬리말 전까지 다른 글(제목·문단)이 없어야 한다
    for (const p of ['about/index.html', 'contact/index.html']) {
      const h = html(p), at = h.indexOf('data-use-notice'), foot = h.indexOf('<footer', at)
      expect(at, `${p} 쓰임새 안내`).toBeGreaterThan(-1)
      expect(h.slice(h.indexOf('</p>', at), foot), `${p} 안내가 맨 아래가 아님`).not.toMatch(/<(p|h[1-6]|img)[\s>]/)
    }
    expect(tools).toContain('>수업 보조 도구<')
  })
})
