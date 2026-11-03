// 주소 정리 — layout.tsx 의 <head> 인라인 스크립트.
//
// 2026-10-28 바뀐 점: **두 문(sunhaengssam.web.app)은 더 이상 본 주소로 넘기지 않는다.**
//   학교 망이 ssamzip.com 을 막아(10-26 DNS 127.0.0.1) 검색으로 들어갈 길이 없어졌다.
//   두 문을 검색에 걸리게 하려면 자기 주소에 머물러야 한다 — 넘기면 검색엔진이 따라가
//   두 문을 색인하지 않는다(사용자 «걸리게 해»).
//   firebaseapp.com 은 같은 내용의 옛 별칭이라 두 문(web.app)으로 모아 준다.
//
// 남는 넘기기 = www.ssamzip.kr → ssamzip.kr 뿐. 🚫 옛 ssamzip.com 은 .kr 로 넘기지 않는다(11-03 — 게임으로 막힌 .com 과 .kr 을 잇지 않는다).
// 옛 .com 문 빌드(tools/deploy-com.sh)엔 .kr 줄을 싣지 않는다 — 환경값을 여기서 바로 읽어야 빌드가 접어 지운다
export const OLD_HOST_REDIRECT =
  "(function(){var h=location.hostname,t=location.pathname+location.search+location.hash;" +
  (process.env.NEXT_PUBLIC_COM_DOOR === '1' ? '' : "if(h==='www.ssamzip.kr'){location.replace('https://ssamzip.kr'+t);return}") +
  "if(h==='sunhaengssam.firebaseapp.com'){location.replace('https://sunhaengssam.web.app'+t)}})()"
