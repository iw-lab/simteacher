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
  const home = html('index.html'), tools = html('tools/index.html')
  it('/tools 에 수업 도구 사이트 + 책상 프로그램이 전부', () => {
    const want = [...classToolSites(learningSites), ...teacherTools].map((s) => s.slug).sort()
    expect([...new Set(slugsIn(tools))].sort()).toEqual(want)
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
    expect(html('sitemap.xml')).toContain('https://ssamzip.com/tools/')
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
    for (const p of ['about/index.html', 'contact/index.html']) expect(html(p), `${p} 쓰임새 안내`).toContain('data-use-notice')
    expect(tools).toContain('>수업 보조 도구<')
  })
})
