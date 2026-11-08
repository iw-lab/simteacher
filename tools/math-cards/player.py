#!/usr/bin/env python3
"""수업 플레이어 — 차시를 열면 «다음»만 눌러 40분 수업이 흘러가는 전자칠판용 한 장 페이지(out/player.html).
표지 → 도입 → 전개 → 정리 → 형성평가 → 마침. 단계마다 큰 발문(눌러서 다음 발문)·타이머·만지작 교구 단추·선생님 메모.
"""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import gen

stds = gen.standards()
tl = gen.tools()
gl = {g['name']: g['url'] for g in gen.games()}
deck = json.load(open(os.path.join(gen.OUT, 'deck.json')))
cards = []
for code, text in stds:
    c = json.load(open(os.path.join(gen.CARDS, code + '.json')))
    for i, q in enumerate(c['quiz']):
        d = deck[f'{code}#{i}']
        q['choices'], q['ai'] = d['choices'], d['answer_index']
        del q['answer'], q['wrong']
    c['text'] = text
    cards.append(c)
data = {'cards': cards, 'tools': {k: v['name'] for k, v in tl.items()}, 'games': gl}

HTML = r'''<!DOCTYPE html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>선행쌤 수학 수업</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Jua&family=Noto+Sans+KR:wght@400;500;700;900&display=swap">
<style>
:root{--bg:#fdf8ee;--ink:#22303c;--sub:#6b7680;--acc:#1f7a5c;--acc2:#e3f3ec;--sun:#ffb938;--coral:#ef6b4f;--sky:#3d8bd9;--card:#fff;--line:#ecdfc8}
*{box-sizing:border-box}html,body{height:100%}
body{margin:0;font-family:'Noto Sans KR','Apple SD Gothic Neo','Malgun Gothic',system-ui,sans-serif;background:var(--bg);color:var(--ink);overflow:hidden}
button{font:inherit;cursor:pointer}
.frac{display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;font-size:.8em;line-height:1.05;margin:0 .12em}
.frac span:first-child{border-bottom:.08em solid currentColor;padding:0 .12em}
/* 홈 */
#home{height:100%;overflow:auto;padding:28px 36px}
.top{display:flex;align-items:center;gap:16px;flex-wrap:wrap}
.logo{font-family:Jua,sans-serif;font-size:30px;color:var(--acc)}
.grades{display:flex;gap:8px}
.grades button{border:2px solid var(--line);background:#fff;border-radius:14px;padding:10px 20px;font-size:18px;font-weight:700;min-height:52px}
.grades button.on{background:var(--acc);border-color:var(--acc);color:#fff}
.find{flex:1;min-width:200px;border:2px solid var(--line);border-radius:14px;padding:12px 16px;font-size:17px;min-height:52px}
.area{font-family:Jua,sans-serif;font-size:22px;margin:26px 0 10px;color:var(--sub)}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:14px}
.tile{background:#fff;border:2px solid var(--line);border-radius:18px;padding:16px 18px;text-align:left;min-height:110px;transition:transform .12s,box-shadow .12s}
.tile:hover{transform:translateY(-3px);box-shadow:0 8px 20px rgba(0,0,0,.08);border-color:var(--acc)}
.tile .c{font-size:13px;color:var(--acc);font-weight:700}.tile .t{font-size:19px;font-weight:900;margin:4px 0}.tile .s{font-size:13px;color:var(--sub);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
/* 고르기 */
#pick{position:fixed;inset:0;background:rgba(20,30,40,.45);display:none;align-items:center;justify-content:center;z-index:20}
#pick .p{background:#fff;border-radius:24px;padding:28px;max-width:760px;width:92%}
#pick h2{margin:4px 0 18px;font-size:26px}
.opt{display:block;width:100%;text-align:left;border:2px solid var(--line);background:var(--bg);border-radius:18px;padding:18px 20px;margin:10px 0;min-height:80px}
.opt:hover{border-color:var(--acc)}.opt b{font-size:20px}.opt span{display:block;color:var(--sub);font-size:14px;margin-top:4px}
/* 수업 */
#stage{display:none;height:100%;flex-direction:column}
.bar{display:flex;align-items:center;gap:10px;padding:10px 18px;background:#fff;border-bottom:2px solid var(--line)}
.bar .x{border:0;background:var(--bg);border-radius:12px;padding:10px 14px;min-height:46px;font-weight:700}
.dots{display:flex;gap:6px;flex:1;justify-content:center;flex-wrap:wrap}
.dot{border:0;border-radius:999px;padding:7px 14px;background:var(--bg);color:var(--sub);font-weight:700;font-size:14px;min-height:38px}
.dot.on{background:var(--acc);color:#fff}.dot.done{background:var(--acc2);color:var(--acc)}
.slide{flex:1;position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:28px 6vw 110px;text-align:center;overflow:auto}
.tag{font-family:Jua,sans-serif;font-size:clamp(22px,2.6vw,34px);color:#fff;background:var(--acc);border-radius:999px;padding:6px 26px;margin-bottom:18px}
.tag.intro{background:var(--sun);color:#5a3b00}.tag.dev{background:var(--sky)}.tag.wrap{background:var(--coral)}
.big{font-family:Jua,sans-serif;font-size:clamp(34px,4.6vw,68px);line-height:1.3;max-width:1300px;word-break:keep-all}
.mid{font-size:clamp(20px,2.1vw,30px);color:var(--sub);margin-top:16px;max-width:1100px;word-break:keep-all}
.qnav{margin-top:26px;display:flex;gap:10px;align-items:center;justify-content:center;flex-wrap:wrap}
.pill{border:2px solid var(--line);background:#fff;border-radius:999px;padding:12px 22px;font-size:19px;font-weight:700;min-height:54px}
.pill.go{background:var(--acc);border-color:var(--acc);color:#fff}
.pill.tool{background:var(--sun);border-color:var(--sun);color:#4a3200;text-decoration:none;display:inline-flex;align-items:center}
.hands{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:18px}
.hand{background:#fff;border:2px solid var(--line);border-radius:14px;padding:6px 16px;font-size:18px;font-weight:700}
.timer{position:absolute;top:18px;right:22px;background:#fff;border:2px solid var(--line);border-radius:18px;padding:8px 14px;display:flex;align-items:center;gap:8px}
.timer .t{font-family:Jua,sans-serif;font-size:34px;min-width:96px}
.timer.end .t{color:var(--coral);animation:blink .6s infinite alternate}@keyframes blink{to{opacity:.3}}
.timer button{border:0;background:var(--bg);border-radius:10px;padding:8px 12px;min-height:44px;font-weight:700}
.note{position:absolute;left:22px;top:18px;max-width:min(560px,40vw);text-align:left}
.note>button{border:2px dashed #cdbb94;background:#fffaf0;border-radius:12px;padding:8px 14px;color:#7a6236;font-weight:700;min-height:44px}
.note .body{display:none;margin-top:8px;background:#fffaf0;border:2px solid #e7d6ae;border-radius:14px;padding:14px 16px;font-size:16px;line-height:1.6;max-height:50vh;overflow:auto;box-shadow:0 10px 24px rgba(0,0,0,.08)}
.note.open .body{display:block}.note .w{color:var(--coral);margin-top:8px}
.foot{position:absolute;left:0;right:0;bottom:0;display:flex;justify-content:space-between;align-items:center;padding:16px 22px;pointer-events:none}
.foot button{pointer-events:auto;border:0;border-radius:18px;padding:16px 30px;font-size:22px;font-weight:900;min-height:64px}
.prev{background:#fff;border:2px solid var(--line)!important;color:var(--sub)}
.next{background:var(--acc);color:#fff;box-shadow:0 6px 0 #145a43}
.next:active{transform:translateY(3px);box-shadow:0 3px 0 #145a43}
/* 퀴즈 */
.choices{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:28px;width:min(1200px,100%)}
.choice{border:3px solid var(--line);background:#fff;border-radius:22px;padding:20px 22px;font-size:clamp(22px,2.4vw,34px);font-weight:700;text-align:left;min-height:90px;display:flex;gap:14px;align-items:center}
.choice .n{flex:none;width:52px;height:52px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-family:Jua,sans-serif;font-size:28px}
.choice:nth-child(1) .n{background:var(--coral)}.choice:nth-child(2) .n{background:var(--sky)}.choice:nth-child(3) .n{background:var(--sun)}.choice:nth-child(4) .n{background:var(--acc)}
.choice.right{border-color:var(--acc);background:#e5f6ee;transform:scale(1.03)}.choice.dim{opacity:.35}
.why{font-size:clamp(18px,2vw,26px);color:var(--acc);margin-top:20px;min-height:1.5em}
.score{font-family:Jua,sans-serif;font-size:clamp(60px,9vw,130px);color:var(--sun)}
.games{display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-top:20px}
.burst{position:fixed;pointer-events:none;font-family:Jua,sans-serif;font-size:60px;color:var(--sun);animation:up 1s ease-out forwards;z-index:30}
@keyframes up{to{transform:translateY(-120px) scale(1.4);opacity:0}}
#toolbox{position:fixed;inset:0;z-index:40;background:#fff;display:none;flex-direction:column}
#toolbox .tb{display:flex;justify-content:space-between;align-items:center;padding:8px 14px;border-bottom:2px solid var(--line);font-size:18px}
#toolbox iframe{flex:1;border:0;width:100%}
@media (max-width:760px){.choices{grid-template-columns:1fr}.note{position:static;max-width:none;margin-bottom:10px}.timer{position:static;margin-bottom:10px}}
</style></head><body>
<section id="home"><div class="top"><div class="logo">선행쌤 수학 수업</div>
<div class="grades" id="grades"><button data-b="2" class="on">1~2학년</button><button data-b="4">3~4학년</button><button data-b="6">5~6학년</button></div>
<input class="find" id="find" placeholder="찾기 — 예: 분수, 시각, 그래프"></div><div id="list"></div></section>
<div id="pick"><div class="p" id="pickp"></div></div>
<section id="stage"><div class="bar"><button class="x" id="exit">← 차시 목록</button><div class="dots" id="dots"></div><button class="x" id="fs">전체 화면</button></div>
<div class="slide" id="slide"></div></section>
<div id="toolbox"><div class="tb"><b>만지작 교구</b><button class="pill" id="tclose">닫고 수업으로 ✕</button></div><iframe id="toolf" title="만지작 교구"></iframe></div>
<script>
let D=__DATA__;
const AREA={'01':'수와 연산','02':'변화와 관계','03':'도형과 측정','04':'자료와 가능성'};
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fr=s=>esc(s).replace(/(\d+)과 (\d+)\/(\d+)/g,'$1<span class="frac"><span>$2</span><span>$3</span></span>').replace(/(?<![\d.])(\d+)\/(\d+)(?![\d.])/g,'<span class="frac"><span>$1</span><span>$2</span></span>');
let band='2',L=null,K=null,S=[],at=0,qi=0,score=0,timer=null,left=0;
let ac=null;const beep=(f=660,d=.15)=>{try{ac=ac||new AudioContext();const o=ac.createOscillator(),g=ac.createGain();o.frequency.value=f;o.connect(g);g.connect(ac.destination);g.gain.setValueAtTime(.2,ac.currentTime);g.gain.exponentialRampToValueAtTime(.001,ac.currentTime+d);o.start();o.stop(ac.currentTime+d)}catch{}};
function home(){const q=$('#find').value.trim();let h='',last='';
 for(const c of D.cards){if(q?!(c.std+c.topic+c.text).includes(q):c.std[0]!==band)continue;const a=c.std[0]+c.std.slice(2,4);
  if(a!==last){if(last)h+='</div>';h+=`<div class="area">${{2:'1~2학년',4:'3~4학년',6:'5~6학년'}[c.std[0]]} · ${AREA[c.std.slice(2,4)]}</div><div class="grid">`;last=a}
  h+=`<button class="tile" data-s="${c.std}"><div class="c">[${c.std}]</div><div class="t">${fr(c.topic)}</div><div class="s">${fr(c.objective)}</div></button>`}
 $('#list').innerHTML=(h?h+'</div>':'<div class="area">찾는 차시가 없어요</div>')}
function pick(code){L=D.cards.find(c=>c.std===code);
 $('#pickp').innerHTML=`<div style="color:var(--acc);font-weight:700">[${L.std}]</div><h2>${fr(L.topic)}</h2>${L.cards.map((k,i)=>`<button class="opt" data-v="${i}"><b>${esc(k.variant)}안 · ${esc(k.name)}</b><span>${esc(k.style)} · 도입 ${k.intro.minutes}분 · 전개 ${k.develop.reduce((a,d)=>a+d.minutes,0)}분 · 정리 ${k.wrap.minutes}분 + 형성평가 ${L.quiz.length}문항</span></button>`).join('')}<button class="pill" id="pclose" style="margin-top:6px">닫기</button>`;
 $('#pick').style.display='flex'}
function start(v){K=L.cards[v];S=[{kind:'cover'},{kind:'step',lbl:'생각 열기',cls:'intro',s:K.intro},...K.develop.map((d,i)=>({kind:'step',lbl:'활동 '+(i+1),cls:'dev',s:d})),{kind:'step',lbl:'정리',cls:'wrap',s:K.wrap},...L.quiz.map((q,i)=>({kind:'quiz',i})),{kind:'end'}];
 at=0;score=0;$('#pick').style.display='none';$('#home').style.display='none';$('#stage').style.display='flex';render()}
function stopT(){clearInterval(timer);timer=null}
function fmt(s){return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`}
function tick(){left--;const el=$('.timer');if(!el){stopT();return}el.querySelector('.t').textContent=fmt(Math.max(0,left));if(left<=0){stopT();el.classList.add('end');beep(880,.4);setTimeout(()=>beep(660,.4),450)}}
function dots(){const lab=x=>x.kind==='cover'?'시작':x.kind==='step'?x.lbl:x.kind==='quiz'?'문제 '+(x.i+1):'마침';
 $('#dots').innerHTML=S.map((x,i)=>`<button class="dot ${i===at?'on':i<at?'done':''}" data-i="${i}">${lab(x)}</button>`).join('')}
const SAME=location.hostname.includes('manjijak')||location.hostname==='127.0.0.1'||location.hostname==='localhost';
function tool(id){if(!id)return'';const n=esc(D.tools[id]||id);return SAME?`<button class="pill tool" data-tool="${id}">교구 열기 · ${n}</button>`:`<a class="pill tool" href="https://manjijak-4ys.pages.dev/#t=${id}" target="_blank" rel="noopener">교구 열기 · ${n}</a>`}
function render(){stopT();dots();const x=S[at],el=$('#slide');qi=0;
 const foot=`<div class="foot"><button class="prev" id="prev" ${at?'':'style="visibility:hidden"'}>◀ 이전</button><button class="next" id="next">${at===S.length-1?'끝내기':at===0?'수업 시작 ▶':'다음 ▶'}</button></div>`;
 if(x.kind==='cover'){el.innerHTML=`<div class="tag">오늘의 수학</div><div class="big">${fr(L.topic)}</div><div class="mid">${fr(L.objective)}</div><div class="hands">${['생각 열기','활동','정리','문제 '+L.quiz.length+'개'].map(h=>`<span class="hand">${h}</span>`).join('')}</div>`+foot}
 else if(x.kind==='step'){const s=x.s,asks=s.teacher_asks.length?s.teacher_asks:[s.activity];left=s.minutes*60;
  el.innerHTML=`<div class="note"><button id="nt">선생님 메모</button><div class="body"><b>할 일</b><br>${fr(s.activity)}${s.watch_for?`<div class="w"><b>살필 점</b> · ${fr(s.watch_for)}</div>`:''}${x.cls==='wrap'?'':`<div style="margin-top:8px;color:var(--sub)"><b>기기 없이</b> · ${fr(K.no_device)}</div>`}</div></div>
  <div class="timer"><span class="t">${fmt(left)}</span><button id="tgo">시작</button><button id="tadd">+1분</button></div>
  <div class="tag ${x.cls}">${x.lbl}</div><div class="big" id="ask">${fr(asks[0])}</div>
  <div class="qnav">${asks.length>1?`<button class="pill" id="qprev">◀</button><span id="qn" style="font-weight:700;color:var(--sub)">질문 1 / ${asks.length}</span><button class="pill go" id="qnext">다음 질문 ▶</button>`:''}${tool(s.tool)}</div>
  ${s.hands?`<div class="hands">${s.hands.map(h=>`<span class="hand">${esc(h)}</span>`).join('')}</div>`:''}`+foot;el.dataset.asks=JSON.stringify(asks)}
 else if(x.kind==='quiz'){const q=L.quiz[x.i];el.innerHTML=`<div class="tag">문제 ${x.i+1}</div><div class="big" style="font-size:clamp(28px,3.6vw,54px)">${fr(q.q)}</div><div class="choices">${q.choices.map((c,j)=>`<button class="choice" data-j="${j}"><span class="n">${j+1}</span><span>${fr(c)}</span></button>`).join('')}</div><div class="why" id="why"></div><div class="qnav"><button class="pill go" id="reveal">정답 보기</button></div>`+foot}
 else{el.innerHTML=`<div class="tag wrap">오늘 수업 끝!</div><div class="score">★ ${score} / ${L.quiz.length}</div><div class="mid">${fr(L.objective)}</div>${L.games.length?`<div class="mid" style="margin-top:28px">쉬는 시간에 이어서 해 봐요</div><div class="games">${L.games.map(g=>`<a class="pill tool" target="_blank" rel="noopener" href="${esc(D.games[g.name]||'#')}">${esc(g.name)}</a>`).join('')}</div>`:''}`+foot}}
function reveal(pickJ){const q=L.quiz[S[at].i];if($('#why').textContent)return;
 document.querySelectorAll('.choice').forEach((b,j)=>{b.classList.add(j===q.ai?'right':'dim')});const rv=$('#reveal');if(rv)rv.remove();$('#why').innerHTML='정답 '+(q.ai+1)+'번 · '+fr(q.why);
 if(pickJ===q.ai){score++;beep(784);setTimeout(()=>beep(1046,.25),120);const r=document.querySelector('.choice.right').getBoundingClientRect(),b=document.createElement('div');b.className='burst';b.textContent='★';b.style.left=(r.left+r.width/2-30)+'px';b.style.top=(r.top-20)+'px';document.body.appendChild(b);setTimeout(()=>b.remove(),1000)}else if(pickJ!=null)beep(220,.3)}
function go(d){at=Math.max(0,Math.min(S.length-1,at+d));render()}
document.addEventListener('click',e=>{const t=e.target.closest('button');if(!t)return;
 if(t.dataset.b){band=t.dataset.b;$('#find').value='';document.querySelectorAll('#grades button').forEach(b=>b.classList.toggle('on',b===t));home();return}
 if(t.dataset.s){pick(t.dataset.s);return}if(t.dataset.v!=null){start(+t.dataset.v);return}
 if(t.dataset.tool){$('#toolf').src='/#t='+t.dataset.tool;$('#toolbox').style.display='flex';return}if(t.id==='tclose'){$('#toolbox').style.display='none';$('#toolf').src='about:blank';return}
 if(t.id==='pclose'){$('#pick').style.display='none';return}
 if(t.id==='exit'){stopT();$('#stage').style.display='none';$('#home').style.display='block';return}
 if(t.id==='fs'){(document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen()).catch(()=>{});return}
 if(t.id==='next'){if(at===S.length-1){$('#exit').click()}else go(1);return}if(t.id==='prev'){go(-1);return}
 if(t.classList.contains('dot')){at=+t.dataset.i;render();return}
 if(t.id==='nt'){t.parentElement.classList.toggle('open');return}
 if(t.id==='tgo'){if(timer){stopT();t.textContent='계속'}else{timer=setInterval(tick,1000);t.textContent='멈춤';beep(523,.1)}return}
 if(t.id==='tadd'){left+=60;$('.timer').classList.remove('end');$('.timer .t').textContent=fmt(left);return}
 if(t.id==='qnext'||t.id==='qprev'){const a=JSON.parse($('#slide').dataset.asks);qi=(qi+(t.id==='qnext'?1:-1)+a.length)%a.length;$('#ask').innerHTML=fr(a[qi]);$('#qn').textContent=`질문 ${qi+1} / ${a.length}`;return}
 if(t.classList.contains('choice')){reveal(+t.dataset.j);return}if(t.id==='reveal'){reveal(null);return}});
document.addEventListener('keydown',e=>{if($('#stage').style.display!=='flex'||e.target.tagName==='INPUT')return;if(e.key==='ArrowRight'||e.key===' '){e.preventDefault();$('#next').click()}if(e.key==='ArrowLeft')$('#prev').click()});
$('#find').oninput=home;if(D)home();else fetch('data.json',{cache:'no-store'}).then(r=>r.json()).then(d=>{D=d;home()});
</script></body></html>'''

out = os.path.join(gen.OUT, 'player.html')
open(out, 'w').write(HTML.replace('__DATA__', json.dumps(data, ensure_ascii=False)))
print(out, os.path.getsize(out))

# 만지작 /lesson/ — CSP(script-src 'self' · font-src 'self') 라 스크립트·자료를 파일로 나눈다. 문은 functions/lesson/_middleware.js(비밀번호)
MJL = os.path.join(gen.MJ, 'lesson')
os.makedirs(MJL, exist_ok=True)
head, rest = HTML.split('<script>', 1)
js, tail = rest.split('</script>', 1)
head = head.replace('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Jua&family=Noto+Sans+KR:wght@400;500;700;900&display=swap">\n', '')
head = head.replace('<meta name="viewport"', '<meta name="robots" content="noindex,nofollow"><meta name="viewport"')
open(os.path.join(MJL, 'index.html'), 'w').write(head + '<script src="player.js"></script>' + tail)
open(os.path.join(MJL, 'player.js'), 'w').write(js.replace('__DATA__', 'null'))
open(os.path.join(MJL, 'data.json'), 'w').write(json.dumps(data, ensure_ascii=False))
print(MJL, sorted(os.listdir(MJL)))
