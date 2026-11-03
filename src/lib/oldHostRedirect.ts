// 주소 정리 — layout.tsx 의 <head> 인라인 스크립트.
//
// 2026-10-28 바뀐 점: **두 문(sunhaengssam.web.app)은 더 이상 본 주소로 넘기지 않는다.**
//   학교 망이 ssamzip.com 을 막아(10-26 DNS 127.0.0.1) 검색으로 들어갈 길이 없어졌다.
//   두 문을 검색에 걸리게 하려면 자기 주소에 머물러야 한다 — 넘기면 검색엔진이 따라가
//   두 문을 색인하지 않는다(사용자 «걸리게 해»).
//   firebaseapp.com 은 같은 내용의 옛 별칭이라 두 문(web.app)으로 모아 준다.
//
// 남는 넘기기 = www·옛 본 주소(ssamzip.com) → 새 본 주소 ssamzip.kr(2026-11-03 사용자 «.com 공유하지마» — 워커가 301 로 먼저 넘기고, 이 줄은 정적 사본용 예비).
export const OLD_HOST_REDIRECT =
  "(function(){var h=location.hostname,t=location.pathname+location.search+location.hash;" +
  "if(h==='www.ssamzip.kr'||h==='ssamzip.com'||h==='www.ssamzip.com'){location.replace('https://ssamzip.kr'+t);return}" +
  "if(h==='sunhaengssam.firebaseapp.com'){location.replace('https://sunhaengssam.web.app'+t)}})()"
