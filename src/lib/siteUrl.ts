/**
 * 이 빌드가 어느 문으로 나가는가.
 *
 * 선행쌤은 문이 둘이다 — 본 주소 ssamzip.com 과 두 문 sunhaengssam.web.app.
 * 학교 망이 ssamzip.com 을 DNS 127.0.0.1 로 막아(2026-10-26) 검색 결과를 눌러도 안 열리는데,
 * 두 문이 canonical 로 본 주소를 가리키면 **검색엔진이 두 문을 아예 색인하지 않는다** —
 * 그래서 학교에서는 검색으로 찾아 들어갈 길이 없었다(2026-10-28 사용자 «걸리게 해»).
 *
 * 그래서 문마다 **자기 주소로** 빌드한다. canonical·og:url·sitemap 이 전부 이 값을 쓴다.
 * 차단이 풀리면 두 문 빌드를 그만두면 되고, 그 순간 검색 순위는 다시 본 주소로 모인다.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://ssamzip.kr').replace(/\/$/, '')

/** 본 주소로 나가는 빌드인가(두 문 빌드면 false). */
export const IS_MAIN_SITE = SITE_URL === 'https://ssamzip.kr'

/** 옛 주소 ssamzip.com 문인가 — 사람에겐 사이트를 그대로 보여 주되 검색엔진엔 전부 noindex(네이버가 .kr 로 갈아타게).
 *  🚫 .kr 을 가리키는 글자가 하나도 없어야 한다(학교 필터가 .com 을 게임으로 묶었다 — 사용자 11-03). 🔒 tools/check-two-doors.mjs(.com 모드) */
export const IS_COM_DOOR = process.env.NEXT_PUBLIC_COM_DOOR === '1'   // tools/deploy-com.sh 가 켠다(주소 글자를 비교하면 본 빌드에 .com 글자가 남는다)
