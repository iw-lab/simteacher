#!/usr/bin/env python3
"""수학 수업 카드 일괄 생성 — 성취기준(고시 원문, 저작권법 제7조 2호) 121개 × 만지작 교구 × 수학 게임.

  gen.py build            요청 묶음 만들기(out/requests.jsonl)
  gen.py submit           Message Batches API 로 보내기(out/batch.json 에 id)
  gen.py status           진행 보기
  gen.py fetch            결과 받아 out/cards/<코드>.json 으로 풀고 검사
  gen.py check            out/cards 전수 검사(스키마·정답 위치 덱)
  gen.py retry            실패·불합격만 다시 묶어 보내기

키 = ~/.claude/secrets/anthropic.key (값은 찍지 않는다) · 모델 = model-pins.json «claude_api».
교과서 본문·삽화·문제는 쓰지 않는다 — 모든 문항·발문은 새로 짓는다(MASTER-PLAN §8).
"""
import json, os, re, subprocess, sys, time, random, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out')
CARDS = os.path.join(OUT, 'cards')
MJ = os.path.expanduser('~/Documents/dev/수학도구')
PROJECTS = os.path.join(HERE, '..', '..', 'src', 'data', 'projects.ts')
API = 'https://api.anthropic.com/v1/messages/batches'

# 게임별 실제 출제 범위(2026-11-08 코드 추출 결과 — 기획 메모)
GAME_GRADES = {
    '골든 휘슬 Golden Whistle': '1~6학년 학기별 문제 은행',
    '래킷 러시 Racket Rush': '1~6학년 학기별 문제 은행',
    '슬기셈': '1~6학년 단원별 연산, 매일 10문제',
    '매쓰스텝': '초1~ 성취기준 코드별 단계',
    '공부냥 간식가게': '1~6학년 조작형(돈 주기·나눠 담기)',
    '셈왕국 키우기': '1~6학년 셈 조각',
    '구구성 수호대': '곱셈구구·연산 속도(2학년~)',
    '수학 성 수호자': '3~6학년',
    '루프 파크 Loop Park': '3~6학년',
    '티샷 아일랜드 TeeShot Island': '3~6학년(1·2학년은 이용권 문제만)',
    '포물선 요새단': '각도·어림(5~6학년)',
    '딱1 로켓': '분수·소수 합 1 만들기(3~6학년)',
    '칸채움': '수 퍼즐(논리)',
    '넘버러시 NumRush': '1부터 순서대로 수 찾기(수 세기·수 순서)',
    '오르답 Oreudap': '정답 밟기 문제(학년 선택)',
    '벽란도 상단 키우기': '사고팔기·장부(어림·덧뺄셈·비율)',
}


def key():
    p = os.path.expanduser('~/.claude/secrets/anthropic.key')
    return open(p).read().strip()


def model():
    return subprocess.check_output(['python3', os.path.expanduser('~/.claude/bin/model-pin.py'), 'claude_api'], text=True).strip()


def standards():
    s = open(os.path.join(MJ, 'docs/research/curriculum-2022.md')).read()
    rows = re.findall(r'^\| \[(\d수\d\d-\d\d)\] \| ([^|]+) \|', s, re.M)
    return [(c, t.strip()) for c, t in rows]


def tools():
    s = open(os.path.join(MJ, 'js/tools/index.js')).read()
    out = {}
    for m in re.finditer(r"T\('(\w+)', '([^']+)', '(\w+)', \[(\d), (\d)\], \w+, '[^']*', '([^']*)'\)", s):
        out[m.group(1)] = {'name': m.group(2), 'grades': f'{m.group(4)}~{m.group(5)}학년', 'desc': m.group(6)}
    std = open(os.path.join(MJ, 'js/tools/std.js')).read()
    STD = json.loads(std[std.index('{'):std.rindex('}') + 1])
    for k, v in STD.items():
        if k in out:
            out[k]['std'] = [c for c, _ in v]
    return out


def coverage():
    cov = {}
    d = os.path.join(MJ, 'docs/research/coverage')
    for f in sorted(os.listdir(d)):
        for e in json.load(open(os.path.join(d, f))):
            cov.setdefault(e['std'], []).append(e)
    return cov


def games():
    t = open(PROJECTS).read()
    out = []
    for b in re.split(r'\n  \{\n', t):
        if "category: '수학'" not in b:
            continue
        nm = re.search(r"name: '([^']+)'", b)
        u = re.search(r"url: '([^']+)'", b)
        tg = re.search(r"tagline: '([^']+)'", b)
        if not nm or nm.group(1).startswith('만지작') or '2D 오리지널' in nm.group(1):
            continue
        out.append({'name': nm.group(1), 'url': u.group(1) if u else '', 'what': tg.group(1) if tg else '',
                    'range': GAME_GRADES.get(nm.group(1), '')})
    return out


AREA = {'01': '수와 연산', '02': '변화와 관계', '03': '도형과 측정', '04': '자료와 가능성'}
BAND = {'2': '1~2학년군', '4': '3~4학년군', '6': '5~6학년군'}

SYSTEM = """너는 한국 초등학교 수학 수업을 20년 해 온 교사이자 수업 설계자다. 교사가 «오늘 수업» 화면에서 누르기만 하면 40분 수업이 돌아가도록 «수업 카드»를 짓는다.

지킬 것:
1. 교과서(국정·검정) 본문·삽화·문제·단원명 문구를 옮기지 않는다. 발문·문항·상황은 모두 새로 짓는다. 출판사 이름을 쓰지 않는다.
2. 성취기준 범위를 넘지 않는다. 그 학년군 아이가 이미 배운 것만 쓴다(예: 1~2학년군에 곱셈 기호·분수 금지, 수의 범위도 성취기준대로).
3. 손이 하는 일이 바뀌게 — 한 차시에 «보기 누르기» 말고 동사 2개 이상(세기·끌어 놓기·묶기·접기·재기·그리기·말하기).
4. 교구는 아래 «만지작 교구» 목록의 id 만 쓴다(없으면 null). 게임은 «수학 게임» 목록의 이름 그대로, 학년 범위가 맞는 것만, 억지로 넣지 말 것(0~3개).
5. 형성평가 4문항: 정답 1개 + 오답 3개. 오답은 이 단원 아이들이 실제로 하는 실수에서 나온 «그럴듯한 실수»이고 정답과 길이·말투가 비슷해야 한다. 정답이 가장 긴 보기가 되지 않게.
6. 분수는 3/4 처럼 쓰고(화면에서 위아래로 쌓아 그린다), 대분수는 «1과 1/2». 이모지 금지.
7. 아이 개인정보(이름 쓰기·사진·채팅)를 요구하는 활동 금지. 이름이 필요하면 «짝», «모둠».
8. 문장은 짧고 쉬운 한국어. 교사 발문은 실제로 입에서 나오는 말투.

출력은 JSON 하나만(코드블록·설명 없이)."""

SCHEMA = """{
 "std": "코드",
 "topic": "차시 주제 15자 이내",
 "objective": "학습 목표 한 문장(~할 수 있다)",
 "prior": "이 수업 전에 알아야 할 것 한 줄",
 "misconceptions": ["아이들이 흔히 하는 실수 2~3개"],
 "cards": [
  {"variant": "A", "name": "수업 이름", "style": "교구 탐구형 | 놀이형 | 이야기 상황형 중 하나",
   "intro": {"minutes": 5, "activity": "무엇을 하나", "teacher_asks": ["발문"], "tool": "교구 id 또는 null"},
   "develop": [{"minutes": 15, "activity": "", "hands": ["동사"], "tool": "교구 id 또는 null", "teacher_asks": ["발문"], "watch_for": "교사가 봐야 할 점"}],
   "wrap": {"minutes": 5, "activity": "", "teacher_asks": ["발문"]},
   "no_device": "기기 없이(바둑돌·종이) 같은 수업을 하는 법 한두 줄"}
 ],
 "quiz": [{"q": "문항", "answer": "정답", "wrong": ["오답","오답","오답"], "why": "정답 풀이 한 줄"}],
 "games": [{"name": "게임 이름", "use": "언제 어떻게(쉬는 시간 5분 복습 등)"}],
 "manjijak_gap": "만지작 교구로 부족해 새로 만들면 좋을 장면(없으면 빈 문자열)"
}
cards 는 서로 다른 style 로 2개(A, B), develop 은 1~2개, 세 단계 분 합계 40분. quiz 는 정확히 4개."""


def prompt(code, text, tl, cov, gl):
    band = BAND[code[0]]
    area = AREA[code[2:4]]
    rel_tools = {k: v for k, v in tl.items() if code in v.get('std', [])}
    cov_e = [{'activity': e['activity'], 'tools': e['tools'], 'status': e['status'],
              'scene': e.get('scenario_title', ''), 'missing': e.get('missing', '')} for e in cov.get(code, [])]
    return f"""성취기준 [{code}] ({band} · {area})
«{text}»
(출처: 교육부 고시 제2022-33호 [별책 8] 수학과 교육과정)

만지작 수학교실(https://manjijak-4ys.pages.dev, 주소 #t=교구id 로 바로 열림)에서 이 성취기준에 연결된 교구:
{json.dumps(rel_tools, ensure_ascii=False)}
이 성취기준으로 이미 검증한 만지작 장면:
{json.dumps(cov_e, ensure_ascii=False)}

전체 만지작 교구 id 목록(다른 교구가 더 맞으면 써도 된다):
{json.dumps({k: v['name'] + ' (' + v['grades'] + ')' for k, v in tl.items()}, ensure_ascii=False)}

수학 게임(선행쌤 등록 — 이름·하는 일·출제 범위):
{json.dumps(gl, ensure_ascii=False)}

아래 모양의 JSON 으로 답하라.
{SCHEMA}"""


def build():
    os.makedirs(OUT, exist_ok=True)
    tl, cov, gl, m = tools(), coverage(), games(), model()
    only = set(sys.argv[2:])
    n = 0
    with open(os.path.join(OUT, 'requests.jsonl'), 'w') as f:
        for code, text in standards():
            if only and code not in only:
                continue
            req = {'custom_id': code.replace('수', 'M'), 'params': {
                'model': m, 'max_tokens': 8000, 'system': SYSTEM,
                'messages': [{'role': 'user', 'content': prompt(code, text, tl, cov, gl)}]}}
            f.write(json.dumps(req, ensure_ascii=False) + '\n')
            n += 1
    print(f'요청 {n}개 · 모델 {m} · 교구 {len(tl)} · 게임 {len(gl)}')


def call(url, data=None, method=None):
    r = urllib.request.Request(url, data=json.dumps(data).encode() if data is not None else None, method=method,
                               headers={'x-api-key': key(), 'anthropic-version': '2023-06-01', 'content-type': 'application/json'})
    with urllib.request.urlopen(r, timeout=120) as res:
        return res.read().decode()


def submit():
    reqs = [json.loads(l) for l in open(os.path.join(OUT, 'requests.jsonl'))]
    b = json.loads(call(API, {'requests': reqs}))
    json.dump(b, open(os.path.join(OUT, 'batch.json'), 'w'), indent=1)
    print('보냄', b['id'], b['processing_status'], len(reqs))


def status():
    bid = json.load(open(os.path.join(OUT, 'batch.json')))['id']
    b = json.loads(call(f'{API}/{bid}'))
    json.dump(b, open(os.path.join(OUT, 'batch.json'), 'w'), indent=1)
    print(b['processing_status'], json.dumps(b['request_counts']))
    return b


def norm_code(cid):
    return cid.replace('M', '수')


def fetch():
    b = status()
    if b['processing_status'] != 'ended':
        print('아직'); return 1
    os.makedirs(CARDS, exist_ok=True)
    raw = call(b['results_url'])
    usage = {'in': 0, 'out': 0}
    bad = []
    for line in raw.splitlines():
        if not line.strip():
            continue
        r = json.loads(line)
        code = norm_code(r['custom_id'])
        res = r['result']
        if res['type'] != 'succeeded':
            bad.append((code, res['type'])); continue
        msg = res['message']
        usage['in'] += msg['usage']['input_tokens']; usage['out'] += msg['usage']['output_tokens']
        txt = ''.join(c.get('text', '') for c in msg['content'])
        txt = txt[txt.find('{'):txt.rfind('}') + 1]
        try:
            card = json.loads(txt)
        except Exception as e:
            bad.append((code, f'json {e}')); open(os.path.join(CARDS, code + '.raw.txt'), 'w').write(txt); continue
        card['std'] = code
        json.dump(card, open(os.path.join(CARDS, code + '.json'), 'w'), ensure_ascii=False, indent=1)
    print('토큰', usage, '실패', bad)
    return check()


def check():
    tl = tools(); gl = {g['name'] for g in games()}
    stds = dict(standards())
    fails = {}
    have = 0
    for code in stds:
        p = os.path.join(CARDS, code + '.json')
        if not os.path.exists(p):
            fails[code] = ['없음']; continue
        have += 1
        c = json.load(open(p)); e = []
        if len(c.get('cards', [])) != 2: e.append('카드 2개 아님')
        for k in c.get('cards', []):
            mins = k['intro']['minutes'] + sum(d['minutes'] for d in k['develop']) + k['wrap']['minutes']
            if not 35 <= mins <= 45: e.append(f'{k["variant"]} {mins}분')
            for t in [k['intro'].get('tool')] + [d.get('tool') for d in k['develop']]:
                if t and t not in tl: e.append(f'없는 교구 {t}')
            verbs = {v for d in k['develop'] for v in d.get('hands', [])}
            if len(verbs) < 2: e.append(f'{k["variant"]} 동사 {len(verbs)}')
        if len(c.get('quiz', [])) != 4: e.append('문항 4개 아님')
        for q in c.get('quiz', []):
            if len(q.get('wrong', [])) != 3 or q['answer'] in q['wrong']: e.append('보기 이상')
        for g in c.get('games', []):
            if g['name'] not in gl: e.append(f'없는 게임 {g["name"]}')
        blob = json.dumps(c, ensure_ascii=False)
        if re.search(r'[\U0001F300-\U0001FAFF☀-➿]', blob): e.append('이모지')
        if re.search(r'천재|비상|미래엔|동아|아이스크림|금성|교과서 \d+쪽', blob): e.append('출판사·쪽수 언급')
        if e: fails[code] = e
    longest = sum(1 for code in stds if os.path.exists(os.path.join(CARDS, code + '.json'))
                  for q in json.load(open(os.path.join(CARDS, code + '.json'))).get('quiz', [])
                  if all(len(q['answer']) > len(w) for w in q.get('wrong', [])))
    total_q = 4 * have
    print(f'카드 {have}/{len(stds)} · 불합격 {len(fails)} · 정답=유일 최장 {longest}/{total_q}')
    for k, v in list(fails.items())[:40]:
        print(' ', k, v)
    json.dump(fails, open(os.path.join(OUT, 'fails.json'), 'w'), ensure_ascii=False, indent=1)
    return 0 if not fails and total_q and longest / total_q <= 0.5 else 1


def deal():
    """정답 위치 덱 — 표시 순서는 생성물이 아니라 구조로 정한다(game-builder 🔢). 결과 = out/deck.json"""
    rng = random.Random(20261108)
    deck, out = [], {}
    for code in sorted(dict(standards())):
        p = os.path.join(CARDS, code + '.json')
        if not os.path.exists(p): continue
        for i, q in enumerate(json.load(open(p))['quiz']):
            if not deck:
                deck = [0, 1, 2, 3] * 2; rng.shuffle(deck)
            pos = deck.pop()
            ch = list(q['wrong']); rng.shuffle(ch); ch.insert(pos, q['answer'])
            out[f'{code}#{i}'] = {'choices': ch, 'answer_index': pos}
    json.dump(out, open(os.path.join(OUT, 'deck.json'), 'w'), ensure_ascii=False, indent=1)
    from collections import Counter
    print('정답 위치', Counter(v['answer_index'] for v in out.values()))


def retry():
    fails = json.load(open(os.path.join(OUT, 'fails.json')))
    sys.argv = ['', 'build'] + list(fails)
    build(); submit()


if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'status'
    r = {'build': build, 'submit': submit, 'status': status, 'fetch': fetch, 'check': check, 'deal': deal, 'retry': retry}[cmd]()
    sys.exit(r if isinstance(r, int) else 0)
