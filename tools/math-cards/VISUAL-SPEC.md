# 수업 화면 자료 규격 (out/lessons/<코드>.json)

카드(out/cards/<코드>.json)는 **교사용**(발문·살필 점)이다. 이 파일은 그 카드를 **아이들이 보는 화면**으로 바꾼 것 — 아이스크림 수업처럼 그림과 짧은 지시로 40분이 흐르게.

```json
{
 "std": "2수01-04",
 "variants": [            // 카드의 cards[] 와 같은 순서·같은 개수
  {
   "variant": "A",
   "materials": { "teacher": ["바둑돌 7개씩 모둠 수만큼"], "student": ["공책", "색연필"] },
   "hook": {               // 동기유발 — 아이 눈높이 상황 이야기 + 그림 + 물음
     "title": "다람쥐의 도토리 나누기",
     "story": "다람쥐가 도토리 7개를 주웠어요. 두 주머니에 나눠 담으려고 해요.",   // 2~3문장, 아이에게 읽어 주는 말
     "visual": { "type": "objects", "kind": "cookie", "groups": [3, 4] },
     "question": "도토리를 어떻게 나눠 담을 수 있을까요?"
   },
   "activities": [         // 카드 develop[] 와 같은 개수·같은 순서
     { "title": "칩 7개 나누기",               // 아이용 활동 이름
       "steps": ["칩 7개를 꺼내요.", "두 접시에 나눠 놓아요.", "몇 개와 몇 개인지 짝에게 말해요."],   // 2~4개, 한 문장씩, «~해요»
       "visual": { "type": "counters", "groups": [2, 5] },
       "share": "짝과 다른 방법을 찾았나요?" }
   ],
   "concept": { "title": "오늘 배운 것", "points": ["7은 1과 6, 2와 5, 3과 4로 가를 수 있어요."], "visual": { "type": "counters", "groups": [3, 4] } },
   "worksheet": { "title": "모으기와 가르기", "items": [
       { "q": "그림을 보고 빈칸에 알맞은 수를 쓰세요. 7은 3과 □", "visual": { "type": "counters", "groups": [3, 4], "hide": 1 }, "space": "box" }
   ] }                     // 4~6개, space = line | box | none
  }
 ]
}
```

## 지킬 것
- 아이에게 보이는 글(story·question·steps·share·points·worksheet)은 **그 학년 아이가 읽을 말**로. 1~2학년은 한 문장 25자 안팎, 어려운 한자어 금지.
- 교과서 문장·삽화·문제를 옮기지 않는다. 출판사·교과서 쪽수 언급 금지. 이모지 금지.
- 수·범위는 성취기준 안에서. 그림의 수와 글의 수가 **반드시 맞아야** 한다(그림 7개인데 글은 8개 금지).
- 문제 4개(quiz)는 카드에 있으니 다시 만들지 않는다. 활동지는 quiz 와 다른 새 문항.
- 분수는 3/4, 대분수는 «1과 1/2».

## 그림(visual) 종류 — 이것만 쓴다(없으면 null)
| type | 인자 | 쓰임 |
|---|---|---|
| counters | n 또는 groups:[a,b,…] · kind(아이콘, 생략하면 동그라미) · hide(가릴 묶음 번호 0부터) · labels(false면 수 숨김) | 세기·모으기·가르기·덧뺄셈 (한 묶음 ≤ 20, 합 ≤ 40) |
| objects | counters 와 같음, kind 기본 apple | 상황 그림(사과·사탕 등) |
| tenframe | filled · filled2(두 번째 색) · total 10\|20 | 10 만들기·받아올림 |
| base10 | thousands · hundreds · tens · ones (각 ≤ 9) | 자릿값 |
| numberline | from · to · step · marks:[값] · jumps:[[a,b],…] · labels:{"값":"글"} · unknown:값 | 수의 순서·뛰어 세기·분수·소수 ((to-from)/step ≤ 100) |
| array | rows · cols (≤ 12) · kind · split(이 열부터 다른 색) | 곱셈·나눗셈 |
| fraction | num · den(≤ 24) · shape bar\|circle | 분수 (num > den 이면 여러 개) |
| shapes | items:[{kind, label, color}] (≤ 8) kind = triangle·right_triangle·square·rect·circle·pentagon·hexagon·rhombus·trapezoid·parallelogram | 도형 |
| clock | h · m · digital(true면 아래에 글) | 시각 |
| ruler | length(cm ≤ 30) · mark(재는 물건 길이 cm) | 길이 재기 |
| barchart | labels · values · title · unit | 막대그래프 |
| linechart | labels · values · title · unit | 꺾은선그래프 |
| piechart | labels · values(합 100이면 %) | 원그래프·띠그래프 대신 |
| table | head:[…] · rows:[[…]] (≤ 10행) | 표 |
| money | items:{"10000":n,"5000":n,"1000":n,"500":n,"100":n,"50":n,"10":n} | 돈 |
| pattern | seq:["circle:red","triangle:blue","square:yellow", 아이콘이름:색 …] (≤ 14) · blanks:[인덱스] | 규칙 |
| grid | rows · cols (≤ 20) · filled:[[r,c]] 또는 count · color · unit | 넓이·백분율·모눈 |
| angle | deg · label | 각도 |
| cubes | stacks:[높이…] | 쌓기나무(정면) |
| equation | text | 큰 식 하나 |
| lines | items:[{kind: segment·ray·line·parallel·perpendicular, a:'ㄱ', b:'ㄴ', label}] (≤ 4) | 선분·반직선·직선·평행·수직 |
| circles | radii:[…] (≤ 4, 실제 비율로) · unit(cm·m) · labels · center(false면 반지름 선 숨김) | 원·반지름·지름 비교 |
| beaker | cap(눈금 끝) · amount · step · unit(mL·L) | 들이 |
| scale | max · value · step · unit(g·kg) | 무게(바늘 저울) |
(clock 에 s(초)를 주면 초바늘을 그린다)

아이콘 kind: apple · candy · star · flower · ball · cookie · fish · pencil · car · person · coin · leaf
색: red · blue · green · yellow · purple · gray
모든 visual 에 caption(그림 아래 한 줄)을 붙일 수 있다.

## 검사
`python3 tools/math-cards/validate.py <코드…>` — 실패 0 이어야 끝.
