#!/usr/bin/env python3
"""수업 카드 검토용 한 장짜리 페이지 — out/viewer.html (비공개 아티팩트로 올려 주인만 본다)."""
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
    c['text'] = text
    cards.append(c)
data = {'cards': cards, 'tools': {k: v['name'] for k, v in tl.items()}, 'games': gl}

HTML = r'''<!DOCTYPE html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>선행쌤 수학 수업 카드 검토</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap">
<style>
:root{--bg:#f6f5f1;--card:#fff;--ink:#1f2328;--sub:#5d6670;--line:#e3e1da;--acc:#2f6f5e;--acc2:#e8f1ee;--warn:#b5532a;--ok:#2f6f5e}
*{box-sizing:border-box}body{margin:0;font-family:'Noto Sans KR',system-ui,sans-serif;background:var(--bg);color:var(--ink);font-size:15px;line-height:1.6}
header{position:sticky;top:0;z-index:5;background:var(--card);border-bottom:1px solid var(--line);padding:12px 20px;display:flex;gap:12px;align-items:center;flex-wrap:wrap}
h1{font-size:17px;margin:0 12px 0 0}
.seg{display:flex;border:1px solid var(--line);border-radius:10px;overflow:hidden}
.seg button{border:0;background:none;padding:8px 14px;font:inherit;cursor:pointer;color:var(--sub);min-height:40px}
.seg button.on{background:var(--acc);color:#fff}
input[type=search]{flex:1;min-width:180px;border:1px solid var(--line);border-radius:10px;padding:8px 12px;font:inherit;min-height:40px}
.stat{color:var(--sub);font-size:13px}
.wrap{display:grid;grid-template-columns:320px 1fr;gap:0;min-height:calc(100vh - 66px)}
nav{border-right:1px solid var(--line);overflow:auto;max-height:calc(100vh - 66px);position:sticky;top:66px;background:#fbfaf7}
nav .area{font-size:12px;color:var(--sub);padding:14px 16px 4px;font-weight:700}
nav a{display:block;padding:9px 16px;text-decoration:none;color:var(--ink);border-left:3px solid transparent;cursor:pointer}
nav a:hover{background:var(--acc2)}nav a.on{background:var(--acc2);border-left-color:var(--acc)}
nav a .c{font-size:12px;color:var(--sub);margin-right:6px}nav a .m{float:right;font-size:12px}
.m.ok{color:var(--ok)}.m.fix{color:var(--warn)}
main{padding:24px 32px;max-width:980px}
.code{display:inline-block;background:var(--acc2);color:var(--acc);font-weight:700;border-radius:6px;padding:2px 8px;font-size:13px}
h2{font-size:22px;margin:8px 0 6px}.std{color:var(--sub);margin:0 0 14px}
.box{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px 20px;margin:14px 0}
.box h3{font-size:14px;margin:0 0 8px;color:var(--sub);font-weight:700}
ul{margin:4px 0;padding-left:20px}
.tabs{display:flex;gap:8px;margin:18px 0 0}
.tabs button{border:1px solid var(--line);background:var(--card);border-radius:10px 10px 0 0;padding:10px 16px;font:inherit;cursor:pointer;min-height:44px}
.tabs button.on{border-bottom-color:var(--card);font-weight:700;color:var(--acc)}
.lesson{border-top-left-radius:0;margin-top:-1px}
.step{display:grid;grid-template-columns:72px 1fr;gap:14px;padding:12px 0;border-bottom:1px dashed var(--line)}.step:last-child{border-bottom:0}
.step .t{font-weight:700;color:var(--acc)}.step .t small{display:block;color:var(--sub);font-weight:400}
.ask{background:#faf8f2;border-left:3px solid #d8c9a3;padding:6px 10px;margin:6px 0;border-radius:4px}
.chip{display:inline-block;font-size:12px;border:1px solid var(--line);border-radius:999px;padding:1px 9px;margin:2px 4px 2px 0;color:var(--sub)}
.chip.tool{border-color:var(--acc);color:var(--acc);text-decoration:none}
.watch{font-size:13px;color:var(--warn);margin-top:6px}
.q{padding:10px 0;border-bottom:1px dashed var(--line)}.q:last-child{border:0}
.ch{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:6px 0}
.ch button{text-align:left;border:1px solid var(--line);background:#fff;border-radius:8px;padding:8px 10px;font:inherit;cursor:pointer;min-height:44px}
.ch button.right{background:#e6f2ec;border-color:var(--ok)}.ch button.wrong{background:#fbece6;border-color:var(--warn)}
.why{font-size:13px;color:var(--sub);display:none}.q.done .why{display:block}
.review{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.review button{border:1px solid var(--line);background:#fff;border-radius:10px;padding:8px 14px;font:inherit;cursor:pointer;min-height:44px}
.review button.on.ok{background:var(--ok);color:#fff;border-color:var(--ok)}.review button.on.fix{background:var(--warn);color:#fff;border-color:var(--warn)}
textarea{width:100%;min-height:70px;border:1px solid var(--line);border-radius:10px;padding:8px;font:inherit;margin-top:8px}
.frac{display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;font-size:.85em;line-height:1.05;margin:0 2px}
.frac span:first-child{border-bottom:1.5px solid currentColor;padding:0 2px}
#copied{color:var(--ok);font-size:13px}
@media (max-width:820px){.wrap{grid-template-columns:1fr}nav{position:static;max-height:260px}main{padding:16px}.ch{grid-template-columns:1fr}}
</style></head><body>
<header><h1>선행쌤 수학 수업 카드 <span class="stat">검토용 · 비공개</span></h1>
<div class="seg" id="band"><button data-b="">전체</button><button data-b="2">1~2학년</button><button data-b="4">3~4학년</button><button data-b="6">5~6학년</button></div>
<input type="search" id="q" placeholder="성취기준·주제 찾기">
<span class="stat" id="prog"></span><button class="seg" style="padding:8px 12px;background:#fff;cursor:pointer" id="copy">검토 메모 복사</button><span id="copied"></span>
</header>
<div class="wrap"><nav id="nav"></nav><main id="main"></main></div>
<script>
const D=__DATA__;
const AREA={'01':'수와 연산','02':'변화와 관계','03':'도형과 측정','04':'자료와 가능성'};
const BAND={'2':'1~2학년군','4':'3~4학년군','6':'5~6학년군'};
let band='',cur=null,variant=0;
const st=(()=>{try{return JSON.parse(localStorage.getItem('mc-review')||'{}')}catch{return{}}})();
const save=()=>{try{localStorage.setItem('mc-review',JSON.stringify(st))}catch{}};
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fr=s=>esc(s).replace(/(\d+)과 (\d+)\/(\d+)/g,'$1<span class="frac"><span>$2</span><span>$3</span></span>').replace(/(?<![\d.])(\d+)\/(\d+)(?![\d.])/g,'<span class="frac"><span>$1</span><span>$2</span></span>');
function list(){const q=document.getElementById('q').value.trim();
 const items=D.cards.filter(c=>(!band||c.std[0]===band)&&(!q||(c.std+c.topic+c.text).includes(q)));
 let h='',last='';for(const c of items){const k=c.std[0]+c.std.slice(2,4);if(k!==last){h+=`<div class="area">${BAND[c.std[0]]} · ${AREA[c.std.slice(2,4)]}</div>`;last=k}
  const r=st[c.std]?.mark;h+=`<a data-s="${c.std}" class="${c.std===cur?'on':''}"><span class="c">${c.std}</span>${esc(c.topic)}<span class="m ${r||''}">${r==='ok'?'확인':r==='fix'?'고칠 곳':''}</span></a>`}
 document.getElementById('nav').innerHTML=h||'<div class="area">없음</div>';
 const n=Object.values(st).filter(v=>v.mark).length;document.getElementById('prog').textContent=`검토 ${n}/${D.cards.length}`}
function tool(id){return id?`<a class="chip tool" href="https://manjijak-4ys.pages.dev/#t=${id}" target="_blank">만지작 ${esc(D.tools[id]||id)}</a>`:''}
function step(lbl,s){return `<div class="step"><div class="t">${lbl}<small>${s.minutes}분</small></div><div>${fr(s.activity)}<div>${(s.hands||[]).map(h=>`<span class="chip">${esc(h)}</span>`).join('')}${tool(s.tool)}</div>${(s.teacher_asks||[]).map(a=>`<div class="ask">${fr(a)}</div>`).join('')}${s.watch_for?`<div class="watch">살필 점 · ${fr(s.watch_for)}</div>`:''}</div></div>`}
function show(code){cur=code;const c=D.cards.find(x=>x.std===code);if(!c)return;const k=c.cards[variant]||c.cards[0];const r=st[code]||{};
 document.getElementById('main').innerHTML=`<span class="code">[${c.std}]</span> <span class="stat">${BAND[c.std[0]]} · ${AREA[c.std.slice(2,4)]}</span>
 <h2>${esc(c.topic)}</h2><p class="std">${esc(c.text)}</p>
 <div class="box"><h3>학습 목표</h3>${fr(c.objective)}<h3 style="margin-top:10px">먼저 알아야 할 것</h3>${fr(c.prior)}<h3 style="margin-top:10px">아이들이 흔히 하는 실수</h3><ul>${c.misconceptions.map(m=>`<li>${fr(m)}</li>`).join('')}</ul></div>
 <div class="tabs">${c.cards.map((x,i)=>`<button data-v="${i}" class="${i===variant?'on':''}">${esc(x.variant)}안 · ${esc(x.style)}</button>`).join('')}</div>
 <div class="box lesson"><h3>${esc(k.name)}</h3>${step('도입',k.intro)}${k.develop.map((d,i)=>step('전개 '+(i+1),d)).join('')}${step('정리',k.wrap)}
 <div class="ask" style="border-color:#bbb;background:#f4f4f4">기기 없이 · ${fr(k.no_device)}</div></div>
 <div class="box"><h3>형성평가 (보기를 눌러 보세요)</h3>${c.quiz.map((q,i)=>`<div class="q" data-i="${i}"><b>${i+1}.</b> ${fr(q.q)}<div class="ch">${q.choices.map((x,j)=>`<button data-j="${j}">${'①②③④'[j]} ${fr(x)}</button>`).join('')}</div><div class="why">정답 ${'①②③④'[q.ai]} · ${fr(q.why)}</div></div>`).join('')}</div>
 ${c.games.length?`<div class="box"><h3>연결 게임</h3>${c.games.map(g=>`<div style="margin:6px 0"><a href="${esc(D.games[g.name]||'#')}" target="_blank"><b>${esc(g.name)}</b></a> — ${fr(g.use)}</div>`).join('')}</div>`:''}
 ${c.manjijak_gap?`<div class="box"><h3>만지작에 있으면 좋을 장면</h3>${fr(c.manjijak_gap)}</div>`:''}
 <div class="box"><h3>내 검토</h3><div class="review"><button class="ok ${r.mark==='ok'?'on':''}" data-m="ok">이대로 좋음</button><button class="fix ${r.mark==='fix'?'on':''}" data-m="fix">고칠 곳 있음</button></div><textarea id="memo" placeholder="고칠 곳을 적어 두면 «검토 메모 복사»로 한 번에 모아 전달할 수 있어요">${esc(r.memo||'')}</textarea></div>`;
 list();window.scrollTo(0,0);if(location.hash!=='#s'+code.replace('수','M'))history.replaceState(null,'','#s'+code.replace('수','M'))}
document.getElementById('nav').onclick=e=>{const a=e.target.closest('a[data-s]');if(a){variant=0;show(a.dataset.s)}};
document.getElementById('main').onclick=e=>{const t=e.target.closest('button');if(!t)return;
 if(t.dataset.v!=null){variant=+t.dataset.v;show(cur);return}
 if(t.dataset.m){st[cur]={...(st[cur]||{}),mark:st[cur]?.mark===t.dataset.m?'':t.dataset.m};save();show(cur);return}
 if(t.dataset.j!=null){const qd=t.closest('.q'),q=D.cards.find(x=>x.std===cur).quiz[+qd.dataset.i];qd.querySelectorAll('button').forEach((b,j)=>{b.classList.toggle('right',j===q.ai);b.classList.toggle('wrong',j===+t.dataset.j&&j!==q.ai)});qd.classList.add('done')}};
document.getElementById('main').oninput=e=>{if(e.target.id==='memo'){st[cur]={...(st[cur]||{}),memo:e.target.value};save()}};
document.getElementById('band').onclick=e=>{const b=e.target.closest('button');if(!b)return;band=b.dataset.b;document.querySelectorAll('#band button').forEach(x=>x.classList.toggle('on',x===b));list()};
document.getElementById('q').oninput=list;
document.getElementById('copy').onclick=async()=>{const lines=D.cards.filter(c=>st[c.std]?.mark||st[c.std]?.memo).map(c=>`[${c.std}] ${st[c.std].mark==='ok'?'이대로 좋음':st[c.std].mark==='fix'?'고칠 곳':'메모'}${st[c.std].memo?' — '+st[c.std].memo.replace(/\n/g,' '):''}`);
 const txt=lines.join('\n')||'(아직 검토한 카드가 없어요)';try{await navigator.clipboard.writeText(txt);document.getElementById('copied').textContent=`${lines.length}건 복사됨`}catch{document.getElementById('main').insertAdjacentHTML('afterbegin',`<div class="box"><h3>아래 글을 직접 복사하세요</h3><textarea>${esc(txt)}</textarea></div>`)}};
document.querySelector('#band button').classList.add('on');
const h=location.hash.match(/^#s(\dM\d\d-\d\d)$/);show(h?h[1].replace('M','수'):D.cards[0].std);
</script></body></html>'''

out = os.path.join(gen.OUT, 'viewer.html')
open(out, 'w').write(HTML.replace('__DATA__', json.dumps(data, ensure_ascii=False)))
print(out, os.path.getsize(out))
