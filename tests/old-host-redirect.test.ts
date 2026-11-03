// 주소 정리 — 두 문(sunhaengssam.web.app)은 «머물러야» 한다(2026-10-28).
// 학교 망이 ssamzip.com 을 막아, 두 문이 본 주소로 넘어가면 검색으로 들어갈 길이 사라진다.
import { describe, it, expect, vi } from 'vitest'
import { OLD_HOST_REDIRECT } from '../src/lib/oldHostRedirect'

function run(host: string) {
  const replace = vi.fn()
  const location = { hostname: host, pathname: '/tools/', search: '', hash: '', replace }
  new Function('location', OLD_HOST_REDIRECT)(location)
  return replace
}

describe('주소 정리', () => {
  it('두 문(web.app)은 머문다 — 넘기면 검색에서 사라진다', () => {
    expect(run('sunhaengssam.web.app')).not.toHaveBeenCalled()
  })
  it('옛 별칭 firebaseapp.com 은 두 문으로 모은다', () => {
    expect(run('sunhaengssam.firebaseapp.com')).toHaveBeenCalledWith('https://sunhaengssam.web.app/tools/')
  })
  it('www·옛 본 주소(.com)는 새 본 주소 ssamzip.kr 로 모으고, 본 주소 자신은 그대로(2026-11-03 «.com 공유하지마»)', () => {
    for (const h of ['www.ssamzip.kr', 'ssamzip.com', 'www.ssamzip.com']) expect(run(h)).toHaveBeenCalledWith('https://ssamzip.kr/tools/')
    expect(run('ssamzip.kr')).not.toHaveBeenCalled()
  })
})
