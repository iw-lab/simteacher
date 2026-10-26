// 옛 주소 → ssamzip.com 넘기기(layout.tsx 의 <head> 인라인 스크립트).
// www.ssamzip.com 은 바로 넘긴다. 옛 주소(sunhaengssam.web.app·firebaseapp.com)는 ssamzip.com 이 «이 망에서 열릴 때만» 넘긴다 —
// 학교 망이 새 도메인 ssamzip.com 을 막아(2026-10-26 · DNS 127.0.0.1) 무조건 넘기면 아이들이 아무것도 못 봤다. 3초 안에 그림이 오면 넘기고, 아니면 옛 주소에 머문다.
export const OLD_HOST_REDIRECT =
  "(function(){var h=location.hostname,to='https://ssamzip.com'+location.pathname+location.search+location.hash;" +
  "if(h==='www.ssamzip.com'){location.replace(to);return}" +
  "if(!/^sunhaengssam\\.(web\\.app|firebaseapp\\.com)$/.test(h))return;" +
  "var done=0,i=new Image();i.onload=function(){if(!done){done=1;location.replace(to)}};" +
  "i.onerror=function(){done=1};setTimeout(function(){done=1},3000);" +
  "i.src='https://ssamzip.com/icon-48.png?r='+Date.now()})()"
