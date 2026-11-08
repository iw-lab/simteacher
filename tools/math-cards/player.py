#!/usr/bin/env python3
"""수업 플레이어 — 만지작 /lesson/ 으로 내보낸다(문 = 수학도구/functions/lesson/_middleware.js 비밀번호).
차시를 열면 «다음»만 눌러 40분이 흐른다: 표지 → 준비물 → 생각 열기(상황 그림) → 활동(아이용 단계·그림·교구·레시피 시연) → 정리 → 문제 → 마침(활동지 인쇄).
그림 = visuals.js(코드로 그린 수학 그림) · 교사용 발문·살필 점 = 카드(out/cards) · 아이용 화면 = out/lessons.
"""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import gen

HERE = os.path.dirname(os.path.abspath(__file__))
stds = gen.standards()
tl = gen.tools()
gl = {g['name']: g['url'] for g in gen.games()}
deck = json.load(open(os.path.join(gen.OUT, 'deck.json')))
rec = json.load(open(os.path.join(gen.OUT, 'recipes-by-std.json')))
cards = []
for code, text in stds:
    c = json.load(open(os.path.join(gen.CARDS, code + '.json')))
    for i, q in enumerate(c['quiz']):
        d = deck[f'{code}#{i}']
        q['choices'], q['ai'] = d['choices'], d['answer_index']
        q.pop('answer', None); q.pop('wrong', None)
    c['text'] = text
    lp = os.path.join(gen.OUT, 'lessons', code + '.json')
    c['lesson'] = json.load(open(lp))['variants'] if os.path.exists(lp) else None
    c['recipes'] = rec.get(code, [])
    cards.append(c)
data = {'cards': cards, 'tools': {k: v['name'] for k, v in tl.items()}, 'games': gl}
VZJS = open(os.path.join(HERE, 'visuals.js')).read().replace("if (typeof module !== 'undefined') module.exports = VZ;", '')

CSS = r'''
:root{--bg:#fdf8ee;--ink:#22303c;--sub:#6b7680;--acc:#1f7a5c;--acc2:#e3f3ec;--sun:#ffb938;--coral:#ef6b4f;--sky:#3d8bd9;--line:#ecdfc8}
*{box-sizing:border-box}html,body{height:100%}
body{margin:0;font-family:'Pretendard','Apple SD Gothic Neo','Malgun Gothic',system-ui,sans-serif;background:var(--bg);color:var(--ink);overflow:hidden}
button{font:inherit;cursor:pointer}
.frac{display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;font-size:.8em;line-height:1.05;margin:0 .12em}
.frac span:first-child{border-bottom:.08em solid currentColor;padding:0 .12em}
#home{height:100%;overflow:auto;padding:28px 36px}
.top{display:flex;align-items:center;gap:16px;flex-wrap:wrap}
.logo{font-size:30px;font-weight:900;color:var(--acc)}
.grades{display:flex;gap:8px}
.grades button{border:2px solid var(--line);background:#fff;border-radius:14px;padding:10px 20px;font-size:18px;font-weight:700;min-height:52px}
.grades button.on{background:var(--acc);border-color:var(--acc);color:#fff}
.find{flex:1;min-width:200px;border:2px solid var(--line);border-radius:14px;padding:12px 16px;font-size:17px;min-height:52px}
.area{font-size:21px;font-weight:900;margin:26px 0 10px;color:var(--sub)}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:14px}
.tile{background:#fff;border:2px solid var(--line);border-radius:18px;padding:16px 18px;text-align:left;min-height:110px;transition:transform .12s,box-shadow .12s}
.tile:hover{transform:translateY(-3px);box-shadow:0 8px 20px rgba(0,0,0,.08);border-color:var(--acc)}
.tile .c{font-size:13px;color:var(--acc);font-weight:700}.tile .t{font-size:19px;font-weight:900;margin:4px 0}.tile .s{font-size:13px;color:var(--sub);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
#pick{position:fixed;inset:0;background:rgba(20,30,40,.45);display:none;align-items:center;justify-content:center;z-index:20}
#pick .p{background:#fff;border-radius:24px;padding:28px;max-width:760px;width:92%}
#pick h2{margin:4px 0 18px;font-size:26px}
.opt{display:block;width:100%;text-align:left;border:2px solid var(--line);background:var(--bg);border-radius:18px;padding:18px 20px;margin:10px 0;min-height:80px}
.opt:hover{border-color:var(--acc)}.opt b{font-size:20px}.opt span{display:block;color:var(--sub);font-size:14px;margin-top:4px}
#stage{display:none;height:100%;flex-direction:column}
.bar{display:flex;align-items:center;gap:10px;padding:10px 18px;background:#fff;border-bottom:2px solid var(--line)}
.bar .x{border:0;background:var(--bg);border-radius:12px;padding:10px 14px;min-height:46px;font-weight:700}
.dots{display:flex;gap:6px;flex:1;justify-content:center;flex-wrap:wrap}
.dot{border:0;border-radius:999px;padding:7px 13px;background:var(--bg);color:var(--sub);font-weight:700;font-size:14px;min-height:38px}
.dot.on{background:var(--acc);color:#fff}.dot.done{background:var(--acc2);color:var(--acc)}
.slide{flex:1;position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:76px 5vw 110px;text-align:center;overflow:auto}
.tag{font-size:clamp(20px,2.3vw,30px);font-weight:900;color:#fff;background:var(--acc);border-radius:999px;padding:6px 26px;margin-bottom:14px}
.tag.intro{background:var(--sun);color:#5a3b00}.tag.dev{background:var(--sky)}.tag.wrap{background:var(--coral)}.tag.prep{background:#8a63d2}
.big{font-size:clamp(30px,4.2vw,62px);font-weight:900;line-height:1.3;max-width:1300px;word-break:keep-all}
.mid{font-size:clamp(20px,2.1vw,30px);color:var(--sub);margin-top:12px;max-width:1150px;word-break:keep-all;line-height:1.5}
.story{font-size:clamp(22px,2.4vw,34px);max-width:1150px;word-break:keep-all;line-height:1.55;margin:6px 0 10px}
.qnav{margin-top:20px;display:flex;gap:10px;align-items:center;justify-content:center;flex-wrap:wrap}
.pill{border:2px solid var(--line);background:#fff;border-radius:999px;padding:12px 22px;font-size:19px;font-weight:700;min-height:54px}
.pill.go{background:var(--acc);border-color:var(--acc);color:#fff}
.pill.tool{background:var(--sun);border-color:var(--sun);color:#4a3200;text-decoration:none;display:inline-flex;align-items:center}
.pill.demo{background:#efe7ff;border-color:#c9b6f2;color:#4b2f8f}
.hands{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:16px}
.hand{background:#fff;border:2px solid var(--line);border-radius:14px;padding:6px 16px;font-size:18px;font-weight:700}
.two{display:grid;grid-template-columns:1.05fr 1fr;gap:4vw;align-items:center;width:min(1400px,100%);text-align:left}
.steps{list-style:none;margin:10px 0 0;padding:0;counter-reset:s}
.steps li{counter-increment:s;font-size:clamp(22px,2.3vw,34px);font-weight:700;line-height:1.4;margin:12px 0;padding-left:64px;position:relative;word-break:keep-all}
.steps li::before{content:counter(s);position:absolute;left:0;top:-2px;width:48px;height:48px;border-radius:50%;background:var(--sky);color:#fff;display:flex;align-items:center;justify-content:center;font-size:26px}
.share{margin-top:18px;background:#fff;border:2px dashed var(--line);border-radius:16px;padding:12px 18px;font-size:clamp(18px,1.8vw,26px);font-weight:700;color:var(--acc)}
.vz-fig{margin:6px auto;background:#fff;border:2px solid var(--line);border-radius:22px;padding:18px 20px;max-width:min(900px,100%)}
.vz-fig svg{display:block;margin:0 auto;height:clamp(150px,30vh,330px);width:auto;max-width:100%}
.vz-fig figcaption{text-align:center;color:var(--sub);font-size:clamp(16px,1.6vw,22px);font-weight:700;margin-top:8px}
.vz-eq{font-size:clamp(34px,4.5vw,64px);font-weight:900;text-align:center;padding:10px 20px}
.points{list-style:none;padding:0;margin:8px 0;text-align:left}
.points li{font-size:clamp(22px,2.3vw,34px);font-weight:700;margin:12px 0;padding-left:44px;position:relative;word-break:keep-all}
.points li::before{content:'';position:absolute;left:6px;top:.45em;width:22px;height:22px;border-radius:6px;background:var(--coral)}
.mats{display:grid;grid-template-columns:1fr 1fr;gap:24px;width:min(1100px,100%);text-align:left}
.mats div{background:#fff;border:2px solid var(--line);border-radius:20px;padding:18px 24px}
.mats h3{margin:0 0 8px;font-size:22px;color:var(--sub)}.mats li{font-size:clamp(20px,2vw,28px);font-weight:700;margin:6px 0}
.timer{position:absolute;top:14px;right:18px;background:#fff;border:2px solid var(--line);border-radius:18px;padding:6px 12px;display:flex;align-items:center;gap:8px;z-index:3}
.timer .t{font-size:32px;font-weight:900;min-width:92px;font-variant-numeric:tabular-nums}
.timer.end .t{color:var(--coral);animation:blink .6s infinite alternate}@keyframes blink{to{opacity:.3}}
.timer button{border:0;background:var(--bg);border-radius:10px;padding:8px 12px;min-height:44px;font-weight:700}
.note{position:absolute;left:18px;top:14px;max-width:min(560px,40vw);text-align:left;z-index:3}
.note>button{border:2px dashed #cdbb94;background:#fffaf0;border-radius:12px;padding:8px 14px;color:#7a6236;font-weight:700;min-height:44px}
.note .body{display:none;margin-top:8px;background:#fffaf0;border:2px solid #e7d6ae;border-radius:14px;padding:14px 16px;font-size:16px;line-height:1.6;max-height:60vh;overflow:auto;box-shadow:0 10px 24px rgba(0,0,0,.08)}
.note.open .body{display:block}.note .w{color:var(--coral);margin-top:8px}.note .a{margin:4px 0;padding-left:10px;border-left:3px solid #d8c9a3}
.foot{position:absolute;left:0;right:0;bottom:0;display:flex;justify-content:space-between;align-items:center;padding:16px 22px;pointer-events:none}
.foot button{pointer-events:auto;border:0;border-radius:18px;padding:16px 30px;font-size:22px;font-weight:900;min-height:64px}
.prev{background:#fff;border:2px solid var(--line)!important;color:var(--sub)}
.next{background:var(--acc);color:#fff;box-shadow:0 6px 0 #145a43}.next:active{transform:translateY(3px);box-shadow:0 3px 0 #145a43}
.choices{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:24px;width:min(1200px,100%)}
.choice{border:3px solid var(--line);background:#fff;border-radius:22px;padding:18px 22px;font-size:clamp(22px,2.4vw,34px);font-weight:700;text-align:left;min-height:88px;display:flex;gap:14px;align-items:center}
.choice .n{flex:none;width:50px;height:50px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:26px;font-weight:900}
.choice:nth-child(1) .n{background:var(--coral)}.choice:nth-child(2) .n{background:var(--sky)}.choice:nth-child(3) .n{background:var(--sun)}.choice:nth-child(4) .n{background:var(--acc)}
.choice.right{border-color:var(--acc);background:#e5f6ee;transform:scale(1.03)}.choice.dim{opacity:.35}
.why{font-size:clamp(18px,2vw,26px);color:var(--acc);margin-top:18px;min-height:1.5em}
.score{font-size:clamp(60px,9vw,130px);font-weight:900;color:var(--sun)}
.games{display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-top:16px}
.burst{position:fixed;pointer-events:none;font-size:60px;font-weight:900;color:var(--sun);animation:up 1s ease-out forwards;z-index:30}
@keyframes up{to{transform:translateY(-120px) scale(1.4);opacity:0}}
#toolbox{position:fixed;inset:0;z-index:40;background:#fff;display:none;flex-direction:column}
#toolbox .tb{display:flex;justify-content:space-between;align-items:center;padding:8px 14px;border-bottom:2px solid var(--line);font-size:18px}
#toolbox iframe{flex:1;border:0;width:100%}
#sheet{display:none}
@media (max-width:900px){.two,.mats{grid-template-columns:1fr}.choices{grid-template-columns:1fr}.note{max-width:70vw}}
@media print{
 body{overflow:visible;background:#fff}#home,#stage,#pick,#toolbox{display:none!important}
 #sheet{display:block;padding:8mm 10mm;font-size:15pt}
 #sheet h1{font-size:20pt;margin:0 0 4mm}#sheet .who{border-bottom:1px solid #000;padding-bottom:3mm;margin-bottom:5mm;font-size:12pt}
 #sheet .it{break-inside:avoid;margin:0 0 6mm}#sheet .vz-fig{border:1px solid #bbb;max-width:120mm;padding:3mm}#sheet .vz-fig svg{height:38mm;max-height:none}
 #sheet .box{display:inline-block;width:22mm;height:12mm;border:1.5px solid #000;vertical-align:middle;margin-left:4mm}#sheet .ln{border-bottom:1px solid #000;height:12mm}
}
'''

BODY = r'''<section id="home"><div class="top"><div class="logo">선행쌤 수학 수업</div>
<div class="grades" id="grades"><button data-b="2" class="on">1~2학년</button><button data-b="4">3~4학년</button><button data-b="6">5~6학년</button></div>
<input class="find" id="find" placeholder="찾기 — 예: 분수, 시각, 그래프"><a class="pill" href="/lesson/logout" style="text-decoration:none;color:var(--sub)">나가기</a></div><div id="list"></div></section>
<div id="pick"><div class="p" id="pickp"></div></div>
<section id="stage"><div class="bar"><button class="x" id="exit">← 차시 목록</button><div class="dots" id="dots"></div><button class="x" id="sheetbtn">활동지 인쇄</button><button class="x" id="fs">전체 화면</button></div>
<div class="slide" id="slide"></div></section>
<div id="toolbox"><div class="tb"><b id="tbt">만지작 교구</b><button class="pill" id="tclose">닫고 수업으로</button></div><iframe id="toolf" title="만지작 교구"></iframe></div>
<div id="sheet"></div>'''

JS = r'''
let D=null;
const AREA={'01':'수와 연산','02':'변화와 관계','03':'도형과 측정','04':'자료와 가능성'};
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fr=s=>esc(s).replace(/(\d+)과 (\d+)\/(\d+)/g,'$1<span class="frac"><span>$2</span><span>$3</span></span>').replace(/(?<![\d.])(\d+)\/(\d+)(?![\d.])/g,'<span class="frac"><span>$1</span><span>$2</span></span>');
const V=v=>v?VZ.render(v).replace(/<div class="vz-eq">([^<]*)<\/div>/,(m,t)=>`<div class="vz-eq">${fr(t.replace(/&amp;/g,'&'))}</div>`):'';
let band='2',L=null,K=null,LV=null,S=[],at=0,qi=0,score=0,timer=null,left=0,ask=[];
let ac=null;const beep=(f=660,d=.15)=>{try{ac=ac||new AudioContext();const o=ac.createOscillator(),g=ac.createGain();o.frequency.value=f;o.connect(g);g.connect(ac.destination);g.gain.setValueAtTime(.2,ac.currentTime);g.gain.exponentialRampToValueAtTime(.001,ac.currentTime+d);o.start();o.stop(ac.currentTime+d)}catch{}};
function home(){const q=$('#find').value.trim();let h='',last='';
 for(const c of D.cards){if(q?!(c.std+c.topic+c.text).includes(q):c.std[0]!==band)continue;const a=c.std[0]+c.std.slice(2,4);
  if(a!==last){if(last)h+='</div>';h+=`<div class="area">${{2:'1~2학년',4:'3~4학년',6:'5~6학년'}[c.std[0]]} · ${AREA[c.std.slice(2,4)]}</div><div class="grid">`;last=a}
  h+=`<button class="tile" data-s="${c.std}"><div class="c">[${c.std}]</div><div class="t">${fr(c.topic)}</div><div class="s">${fr(c.objective)}</div></button>`}
 $('#list').innerHTML=(h?h+'</div>':'<div class="area">찾는 차시가 없어요</div>')}
function pick(code){L=D.cards.find(c=>c.std===code);
 $('#pickp').innerHTML=`<div style="color:var(--acc);font-weight:700">[${L.std}]</div><h2>${fr(L.topic)}</h2>${L.cards.map((k,i)=>`<button class="opt" data-v="${i}"><b>${esc(k.variant)}안 · ${esc(L.lesson?.[i]?.hook?.title||k.name)}</b><span>${esc(k.style)} · 생각 열기 ${k.intro.minutes}분 · 활동 ${k.develop.reduce((a,d)=>a+d.minutes,0)}분 · 정리 ${k.wrap.minutes}분 · 문제 ${L.quiz.length}개</span></button>`).join('')}<button class="pill" id="pclose" style="margin-top:6px">닫기</button>`;
 $('#pick').style.display='flex'}
function start(v){K=L.cards[v];LV=L.lesson?.[v]||null;
 S=[{kind:'cover'}];if(LV)S.push({kind:'prep'});
 S.push({kind:'hook'});K.develop.forEach((d,i)=>S.push({kind:'act',i}));S.push({kind:'concept'});
 L.quiz.forEach((q,i)=>S.push({kind:'quiz',i}));S.push({kind:'end'});
 at=0;score=0;$('#pick').style.display='none';$('#home').style.display='none';$('#stage').style.display='flex';sheet();render()}
function stopT(){clearInterval(timer);timer=null}
const fmt=s=>`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
function tick(){left--;const el=$('.timer');if(!el){stopT();return}el.querySelector('.t').textContent=fmt(Math.max(0,left));if(left<=0){stopT();el.classList.add('end');beep(880,.4);setTimeout(()=>beep(660,.4),450)}}
function dots(){const lab=x=>({cover:'시작',prep:'준비물',hook:'생각 열기',concept:'정리',end:'마침'}[x.kind]||(x.kind==='act'?'활동 '+(x.i+1):'문제 '+(x.i+1)));
 $('#dots').innerHTML=S.map((x,i)=>`<button class="dot ${i===at?'on':i<at?'done':''}" data-i="${i}">${lab(x)}</button>`).join('')}
function toolBtn(id){if(!id)return'';return `<button class="pill tool" data-tool="${id}">교구 열기 · ${esc(D.tools[id]||id)}</button>`}
function demoBtn(tool){const r=(L.recipes||[]).find(x=>x.tool===tool)||(L.recipes||[])[0];return r?`<button class="pill demo" data-tool="${r.tool}" data-rec="${r.id}">시연 보기 · ${esc(r.title)}</button>`:''}
function memo(title,s,extra=''){return `<div class="note"><button id="nt">선생님 메모</button><div class="body"><b>${title}</b><br>${fr(s.activity||'')}${(s.teacher_asks||[]).map(a=>`<div class="a">${fr(a)}</div>`).join('')}${s.watch_for?`<div class="w"><b>살필 점</b> · ${fr(s.watch_for)}</div>`:''}${extra}</div></div>`}
function tbox(min){left=min*60;return `<div class="timer"><span class="t">${fmt(left)}</span><button id="tgo">시작</button><button id="tadd">+1분</button></div>`}
function asknav(list){ask=list.filter(Boolean);qi=0;return ask.length>1?`<button class="pill" id="qprev">◀</button><span id="qn" style="font-weight:700;color:var(--sub)">질문 1 / ${ask.length}</span><button class="pill go" id="qnext">다음 질문 ▶</button>`:''}
function render(){stopT();dots();const x=S[at],el=$('#slide');
 const foot=`<div class="foot"><button class="prev" id="prev" ${at?'':'style="visibility:hidden"'}>◀ 이전</button><button class="next" id="next">${at===S.length-1?'끝내기':at===0?'수업 시작 ▶':'다음 ▶'}</button></div>`;
 let h='';
 if(x.kind==='cover')h=`<div class="tag">오늘의 수학</div><div class="big">${fr(L.topic)}</div><div class="mid">${fr(L.objective)}</div><div class="hands">${['생각 열기','활동 '+K.develop.length+'개','정리','문제 '+L.quiz.length+'개'].map(t=>`<span class="hand">${t}</span>`).join('')}</div>`;
 else if(x.kind==='prep'){const m=LV.materials;h=memo('기기 없이 할 때',{activity:K.no_device})+`<div class="tag prep">준비물</div><div class="mats"><div><h3>선생님</h3><ul>${m.teacher.map(t=>`<li>${fr(t)}</li>`).join('')||'<li>없음</li>'}</ul></div><div><h3>우리</h3><ul>${m.student.map(t=>`<li>${fr(t)}</li>`).join('')||'<li>없음</li>'}</ul></div></div>`}
 else if(x.kind==='hook'){const s=K.intro;
  if(LV){const k=LV.hook;h=memo('선생님 할 일',s)+tbox(s.minutes)+`<div class="tag intro">생각 열기</div><div class="big" style="font-size:clamp(26px,3vw,44px)">${fr(k.title)}</div><div class="story">${fr(k.story)}</div>${V(k.visual)}<div class="big" id="ask" style="font-size:clamp(26px,3.2vw,46px);margin-top:10px">${fr(k.question)}</div><div class="qnav">${asknav([k.question,...s.teacher_asks])}${toolBtn(s.tool)}</div>`}
  else h=memo('선생님 할 일',s)+tbox(s.minutes)+`<div class="tag intro">생각 열기</div><div class="big" id="ask">${fr(s.teacher_asks[0]||s.activity)}</div><div class="qnav">${asknav(s.teacher_asks)}${toolBtn(s.tool)}</div>`}
 else if(x.kind==='act'){const s=K.develop[x.i],a=LV?.activities?.[x.i];
  if(a)h=memo('선생님 할 일',s)+tbox(s.minutes)+`<div class="tag dev">활동 ${x.i+1}</div><div class="two"><div><div class="big" style="font-size:clamp(28px,3.4vw,50px)">${fr(a.title)}</div><ol class="steps">${a.steps.map(t=>`<li>${fr(t)}</li>`).join('')}</ol><div class="share">${fr(a.share)}</div></div><div>${V(a.visual)}<div class="qnav">${toolBtn(s.tool)}${demoBtn(s.tool)}</div></div></div>`;
  else h=memo('선생님 할 일',s)+tbox(s.minutes)+`<div class="tag dev">활동 ${x.i+1}</div><div class="big" id="ask">${fr(s.teacher_asks[0]||s.activity)}</div><div class="qnav">${asknav(s.teacher_asks)}${toolBtn(s.tool)}${demoBtn(s.tool)}</div>`}
 else if(x.kind==='concept'){const s=K.wrap,c=LV?.concept;
  h=memo('선생님 할 일',s)+tbox(s.minutes)+`<div class="tag wrap">정리</div>`+(c?`<div class="two"><div><div class="big" style="font-size:clamp(28px,3.4vw,50px)">${fr(c.title)}</div><ul class="points">${c.points.map(t=>`<li>${fr(t)}</li>`).join('')}</ul></div><div>${V(c.visual)}</div></div><div class="qnav" style="margin-top:14px"><span class="mid" id="ask" style="margin:0">${fr(s.teacher_asks[0]||'')}</span>${asknav(s.teacher_asks)}</div>`:`<div class="big" id="ask">${fr(s.teacher_asks[0]||s.activity)}</div><div class="qnav">${asknav(s.teacher_asks)}</div>`)}
 else if(x.kind==='quiz'){const q=L.quiz[x.i];h=`<div class="tag">문제 ${x.i+1}</div><div class="big" style="font-size:clamp(28px,3.6vw,54px)">${fr(q.q)}</div><div class="choices">${q.choices.map((c,j)=>`<button class="choice" data-j="${j}"><span class="n">${j+1}</span><span>${fr(c)}</span></button>`).join('')}</div><div class="why" id="why"></div><div class="qnav"><button class="pill go" id="reveal">정답 보기</button></div>`}
 else h=`<div class="tag wrap">오늘 수업 끝!</div><div class="score">★ ${score} / ${L.quiz.length}</div><div class="mid">${fr(L.objective)}</div><div class="qnav">${LV?'<button class="pill go" id="print">활동지 인쇄</button>':''}</div>${L.games.length?`<div class="mid" style="margin-top:22px">쉬는 시간에 이어서 해 봐요</div><div class="games">${L.games.map(g=>`<a class="pill tool" target="_blank" rel="noopener" href="${esc(D.games[g.name]||'#')}">${esc(g.name)}</a>`).join('')}</div>`:''}`;
 el.innerHTML=h+foot;el.scrollTop=0}
function sheet(){const w=LV?.worksheet;$('#sheetbtn').style.display=w?'':'none';if(!w){$('#sheet').innerHTML='';return}
 $('#sheet').innerHTML=`<h1>${fr(w.title)}</h1><div class="who">[${L.std}] ${fr(L.topic)} &nbsp;&nbsp; ___학년 ___반 ___번</div>${w.items.map((it,i)=>`<div class="it"><b>${i+1}.</b> ${fr(it.q)}${it.space==='box'?'<span class="box"></span>':''}${V(it.visual)}${it.space==='line'?'<div class="ln"></div><div class="ln"></div>':''}</div>`).join('')}`}
function reveal(pickJ){const q=L.quiz[S[at].i];if($('#why').textContent)return;const rv=$('#reveal');if(rv)rv.remove();
 document.querySelectorAll('.choice').forEach((b,j)=>{b.classList.add(j===q.ai?'right':'dim')});$('#why').innerHTML='정답 '+(q.ai+1)+'번 · '+fr(q.why);
 if(pickJ===q.ai){score++;beep(784);setTimeout(()=>beep(1046,.25),120);const r=document.querySelector('.choice.right').getBoundingClientRect(),b=document.createElement('div');b.className='burst';b.textContent='★';b.style.left=(r.left+r.width/2-30)+'px';b.style.top=(r.top-20)+'px';document.body.appendChild(b);setTimeout(()=>b.remove(),1000)}else if(pickJ!=null)beep(220,.3)}
function go(d){at=Math.max(0,Math.min(S.length-1,at+d));render()}
document.addEventListener('click',e=>{const t=e.target.closest('button');if(!t)return;
 if(t.dataset.b){band=t.dataset.b;$('#find').value='';document.querySelectorAll('#grades button').forEach(b=>b.classList.toggle('on',b===t));home();return}
 if(t.dataset.s){pick(t.dataset.s);return}if(t.dataset.v!=null){start(+t.dataset.v);return}
 if(t.dataset.tool){$('#toolf').src='/#t='+t.dataset.tool+(t.dataset.rec?'&r='+t.dataset.rec:'');$('#tbt').textContent=t.dataset.rec?'만지작 시연':'만지작 교구';$('#toolbox').style.display='flex';return}
 if(t.id==='tclose'){$('#toolbox').style.display='none';$('#toolf').src='about:blank';return}
 if(t.id==='pclose'){$('#pick').style.display='none';return}
 if(t.id==='exit'){stopT();$('#stage').style.display='none';$('#home').style.display='block';return}
 if(t.id==='fs'){(document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen()).catch(()=>{});return}
 if(t.id==='print'||t.id==='sheetbtn'){window.print();return}
 if(t.id==='next'){if(at===S.length-1){$('#exit').click()}else go(1);return}if(t.id==='prev'){go(-1);return}
 if(t.classList.contains('dot')){at=+t.dataset.i;render();return}
 if(t.id==='nt'){t.parentElement.classList.toggle('open');return}
 if(t.id==='tgo'){if(timer){stopT();t.textContent='계속'}else{timer=setInterval(tick,1000);t.textContent='멈춤';beep(523,.1)}return}
 if(t.id==='tadd'){left+=60;$('.timer').classList.remove('end');$('.timer .t').textContent=fmt(left);return}
 if(t.id==='qnext'||t.id==='qprev'){qi=(qi+(t.id==='qnext'?1:-1)+ask.length)%ask.length;$('#ask').innerHTML=fr(ask[qi]);$('#qn').textContent=`질문 ${qi+1} / ${ask.length}`;return}
 if(t.classList.contains('choice')){reveal(+t.dataset.j);return}if(t.id==='reveal'){reveal(null);return}});
document.addEventListener('keydown',e=>{if($('#stage').style.display!=='flex'||e.target.tagName==='INPUT')return;if(e.key==='ArrowRight'||e.key===' '){e.preventDefault();$('#next').click()}if(e.key==='ArrowLeft')$('#prev').click();if(e.key==='Escape'&&$('#toolbox').style.display==='flex')$('#tclose').click()});
$('#find').oninput=home;
fetch('data.json',{cache:'no-store'}).then(r=>r.json()).then(d=>{D=d;home()});
'''

HTML = f'''<!DOCTYPE html>
<html lang="ko"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>선행쌤 수학 수업</title><link rel="stylesheet" href="player.css"></head><body>
{BODY}
<script src="visuals.js"></script><script src="player.js"></script></body></html>'''

MJL = os.path.join(gen.MJ, 'lesson')
os.makedirs(MJL, exist_ok=True)
files = {'index.html': HTML, 'player.css': CSS, 'player.js': JS, 'visuals.js': VZJS, 'data.json': json.dumps(data, ensure_ascii=False)}
for k, v in files.items():
    open(os.path.join(MJL, k), 'w').write(v)
have = sum(1 for c in cards if c['lesson'])
print(MJL, sorted(os.listdir(MJL)), f'아이용 화면 {have}/{len(cards)}')
