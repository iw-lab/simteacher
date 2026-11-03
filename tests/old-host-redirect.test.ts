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
  it('www 는 ssamzip.kr 로 모으고, 본 주소는 그대로 · 옛 .com 은 .kr 로 넘기지 않는다(11-03)', () => {
    if (process.env.NEXT_PUBLIC_COM_DOOR === '1') {   // 옛 .com 문 빌드 — .kr 줄 자체가 없다(tools/deploy-com.sh)
      expect(OLD_HOST_REDIRECT).not.toMatch(/ssamzip\.kr/)
    } else expect(run('www.ssamzip.kr')).toHaveBeenCalledWith('https://ssamzip.kr/tools/')
    for (const h of ['ssamzip.kr', 'ssamzip.com', 'www.ssamzip.com']) expect(run(h), h).not.toHaveBeenCalled()
  })
})
