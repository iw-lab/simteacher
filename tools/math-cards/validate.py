#!/usr/bin/env python3
"""out/lessons/<코드>.json 검사 — 규격 VISUAL-SPEC.md. 인자 없으면 있는 것 전부. 종료코드 1 = 실패.
그림은 node 로 실제 그려 빈 결과·오류가 없는지까지 본다."""
import json, os, re, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out')
TYPES = {'counters', 'objects', 'tenframe', 'base10', 'numberline', 'array', 'fraction', 'shapes', 'clock', 'ruler', 'barchart', 'linechart', 'piechart', 'table', 'money', 'pattern', 'grid', 'angle', 'equation', 'cubes', 'lines', 'circles', 'beaker', 'scale'}
EMOJI = re.compile(r'[\U0001F300-\U0001FAFF☀-➿⭐⬆↔-⇿]')
PUB = re.compile(r'천재|비상교육|미래엔|동아출판|아이스크림|금성|교과서 ?\d+ ?쪽|\d+쪽을')


def num(v):
    return isinstance(v, (int, float)) and not isinstance(v, bool)


def vcheck(v, where, errs, code):
    if v is None:
        return
    if not isinstance(v, dict) or v.get('type') not in TYPES:
        errs.append(f'{where}: 모르는 그림 {v if not isinstance(v, dict) else v.get("type")}'); return
    t = v['type']
    if t in ('counters', 'objects'):
        g = v.get('groups') or ([v.get('n')] if v.get('n') is not None else None)
        if not g or not all(num(x) and 0 <= x <= 20 for x in g) or sum(g) > 40: errs.append(f'{where}: counters 수 범위({g})')
    if t == 'tenframe' and not (num(v.get('filled', 0)) and v.get('filled', 0) + v.get('filled2', 0) <= (20 if v.get('total') == 20 else 10)): errs.append(f'{where}: tenframe 칸 넘침')
    if t == 'base10' and not all(num(v.get(k, 0)) and 0 <= v.get(k, 0) <= 9 for k in ('thousands', 'hundreds', 'tens', 'ones')): errs.append(f'{where}: base10 각 자리 0~9')
    if t == 'numberline':
        a, b, s = v.get('from', 0), v.get('to', 10), v.get('step', 1)
        if not (num(a) and num(b) and num(s) and b > a and s > 0 and (b - a) / s <= 100): errs.append(f'{where}: numberline 범위·간격')
    if t == 'array' and not (num(v.get('rows')) and num(v.get('cols')) and v['rows'] <= 12 and v['cols'] <= 12): errs.append(f'{where}: array ≤12')
    if t == 'fraction' and not (num(v.get('num')) and num(v.get('den')) and 1 <= v['den'] <= 24 and 0 <= v['num'] <= v['den'] * 4): errs.append(f'{where}: fraction 값')
    if t == 'clock' and not (num(v.get('h')) and num(v.get('m', 0)) and 0 <= v['h'] <= 12 and 0 <= v.get('m', 0) < 60): errs.append(f'{where}: clock 값')
    if t in ('barchart', 'linechart', 'piechart') and (len(v.get('labels', [])) != len(v.get('values', [])) or not v.get('values')): errs.append(f'{where}: 그래프 이름·값 개수')
    if t == 'table' and not (v.get('rows') or v.get('head')): errs.append(f'{where}: 빈 표')
    if t == 'grid' and not (num(v.get('rows')) and num(v.get('cols')) and v['rows'] <= 20 and v['cols'] <= 20): errs.append(f'{where}: grid ≤20')
    if t == 'shapes' and not v.get('items'): errs.append(f'{where}: shapes 빈 목록')
    if t == 'equation' and not v.get('text'): errs.append(f'{where}: 빈 식')


def check(code):
    p = os.path.join(OUT, 'lessons', code + '.json')
    errs, visuals = [], []
    if not os.path.exists(p):
        return ['없음'], []
    try:
        L = json.load(open(p))
    except Exception as e:
        return [f'JSON {e}'], []
    card = json.load(open(os.path.join(OUT, 'cards', code + '.json')))
    V = L.get('variants', [])
    if len(V) != len(card['cards']): errs.append(f'variants {len(V)} ≠ 카드 {len(card["cards"])}')
    for vi, (v, k) in enumerate(zip(V, card['cards'])):
        w = f'v{vi}'
        m = v.get('materials', {})
        if not isinstance(m.get('teacher'), list) or not isinstance(m.get('student'), list) or not (m['teacher'] or m['student']): errs.append(f'{w}.materials')
        h = v.get('hook', {})
        for f in ('title', 'story', 'question'):
            if not h.get(f): errs.append(f'{w}.hook.{f} 없음')
        if h.get('story') and len(h['story']) > 220: errs.append(f'{w}.hook.story 김({len(h["story"])})')
        vcheck(h.get('visual'), f'{w}.hook', errs, code); visuals.append(h.get('visual'))
        A = v.get('activities', [])
        if len(A) != len(k['develop']): errs.append(f'{w}.activities {len(A)} ≠ develop {len(k["develop"])}')
        for ai, a in enumerate(A):
            if not a.get('title') or not (2 <= len(a.get('steps', [])) <= 5): errs.append(f'{w}.act{ai} 제목·단계(2~5)')
            for s in a.get('steps', []):
                if len(s) > 90: errs.append(f'{w}.act{ai} 단계 김')
            vcheck(a.get('visual'), f'{w}.act{ai}', errs, code); visuals.append(a.get('visual'))
        c = v.get('concept', {})
        if not c.get('points'): errs.append(f'{w}.concept.points')
        vcheck(c.get('visual'), f'{w}.concept', errs, code); visuals.append(c.get('visual'))
        ws = v.get('worksheet', {})
        if not (4 <= len(ws.get('items', [])) <= 6): errs.append(f'{w}.worksheet 4~6')
        for ii, it in enumerate(ws.get('items', [])):
            if not it.get('q') or it.get('space') not in ('line', 'box', 'none'): errs.append(f'{w}.ws{ii} q·space')
            vcheck(it.get('visual'), f'{w}.ws{ii}', errs, code); visuals.append(it.get('visual'))
        if sum(1 for x in [h.get('visual')] + [a.get('visual') for a in A] + [c.get('visual')] if x) < 2: errs.append(f'{w}: 그림 2개 미만')
    blob = json.dumps(L, ensure_ascii=False)
    if EMOJI.search(blob): errs.append('이모지')
    if PUB.search(blob): errs.append('출판사·쪽수')
    if code.startswith('2') and re.search(r'(?<![\d.])\d+/\d+(?![\d.])', blob) and not code.startswith('2수04'): errs.append('1~2학년에 분수 표기')
    return errs, [x for x in visuals if x]


def render_check(vis):
    js = os.path.join(HERE, 'visuals.js')
    src = "const VZ=require(%r);const V=JSON.parse(require('fs').readFileSync(0,'utf8'));let bad=0;for(const v of V){const s=VZ.render(v);if(!s||s.length<40||/NaN|undefined/.test(s)){bad++;console.log('그림 실패',JSON.stringify(v).slice(0,120))}}process.exit(bad?1:0)" % js
    r = subprocess.run(['node', '-e', src], input=json.dumps(vis), text=True, capture_output=True)
    return r.returncode == 0, r.stdout.strip()


if __name__ == '__main__':
    codes = sys.argv[1:] or sorted(f[:-5] for f in os.listdir(os.path.join(OUT, 'lessons')) if f.endswith('.json'))
    bad = 0; allv = []
    for c in codes:
        e, v = check(c); allv += v
        if e:
            bad += 1; print('✗', c, e[:6])
    ok, msg = render_check(allv)
    if not ok:
        print(msg[:2000]); bad += 1
    print(f'검사 {len(codes)} · 실패 {bad} · 그림 {len(allv)}')
    sys.exit(1 if bad else 0)
