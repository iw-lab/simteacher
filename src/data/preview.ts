import imageVersions from './imageVersions.json';
import { viaSsam } from '../lib/via-ssam';
import type { LearningSite } from './projects';

// «출시 전» — 다 만들었거나 거의 다 만든 것을 정식으로 올리기 전에 먼저 써 보는 칸.
//   2026-11-24 사용자 «실과랑.. 우리 거의 다 만들었거나 했던거중에.. 선행쌤에 안올라가있는거 다 올려.. 탭 하나 추가해서.. 출시전?? 거기에 다 넣어줘봐»
//   · 홈 목록·인기 순위·학교 대항 판(hub-games.json)·검색(sitemap)에는 안 선다. 탭(/preview)에서만 보인다.
//   · 정식으로 올릴 때 = projects.ts 로 옮기고 여기서 지운다(두 곳에 있으면 tests/tools-split-html.test.ts 가 막는다).
//   · 가입·로그인해야 쓸 수 있는 것, 열리지 않는 것은 넣지 않는다. 주소는 Cloudflare 만(vercel 금지 — tests/listing-host.test.ts).
//   · 글은 앱 화면·README 에서 확인한 사실만.

export type PreviewKind = 'play' | 'learn' | 'teacher';
export interface PreviewSite extends LearningSite { kind: PreviewKind }

type Row = { slug: string; name: string; kind: PreviewKind; subject: string; target: string; tagline: string; url: string };

const ROWS: Row[] = [
  // ── 배우고 만들기
  { slug: 'sonkkeut', name: '손끝공방', kind: 'learn', subject: '실과', target: '초1~중3', url: 'https://sonkkeut-enq.pages.dev/',
    tagline: '톱질·바느질·찰흙·로봇·요리를 실제 순서대로 해 보는 실과 공방 — 이름 없이 만들고 전시관에 자랑해요' },
  { slug: 'gyokwaseo-hanguksa', name: '교과서 한국사', kind: 'learn', subject: '사회', target: '초등 5~6학년', url: 'https://gyokwaseo-hanguksa.pages.dev/',
    tagline: '유물 하나로 옛사람의 하루를 읽는 한국사 — 9단원을 만화·동화·영상·놀이로 만나요' },
  { slug: 'whymath', name: '왜냐하면 수학', kind: 'learn', subject: '수학', target: '초5~중학', url: 'https://whymath.pages.dev/',
    tagline: '공식을 외우지 않고 «왜?»부터 — 유도를 보고 스스로 증명한 뒤 문제로 넘어가요' },
  { slug: 'byeolnuri', name: '별누리', kind: 'learn', subject: '과학', target: '초등 4·6학년', url: 'https://byeolnuri.pages.dev/',
    tagline: '북극성 찾기·달의 모양·계절 별자리·태양 고도를 직접 움직여 보는 밤하늘 관측실' },
  { slug: 'grammar-ladder', name: '그래머 래더', kind: 'learn', subject: '영어', target: '초3~성인', url: 'https://grammar-ladder.pages.dev/',
    tagline: '영문법 개념 167개를 한 줄로 이어 내 자리부터 차근차근 — 진단하고 익히고 잊을 때쯤 다시' },
  { slug: 'haru-korean', name: '하루국어', kind: 'learn', subject: '국어', target: '초등 1~6학년', url: 'https://iwonedaykorean.simssijjang.workers.dev/',
    tagline: '비문학·문학·시·문법을 하루 15분 — «체험해 보기»를 누르면 가입 없이 풀어 봐요' },
  { slug: 'vocab-card', name: '영단어 플래시카드', kind: 'learn', subject: '영어', target: '초등', url: 'https://vocab-card-129.pages.dev/',
    tagline: '초등 영단어 1,000개를 그림 카드·퀴즈·짝 맞추기·받아쓰기로 외워요' },
  { slug: 'coloria', name: '컬러링 스튜디오 Coloria', kind: 'learn', subject: '미술', target: '유아~초등', url: 'https://coloria.pages.dev/',
    tagline: '39가지 주제, 1,210장 색칠 도안을 골라 바로 인쇄해요' },
  { slug: 'brainferry', name: '두뇌 나룻배 BrainFerry', kind: 'learn', subject: '수학', target: '초등 고학년~', url: 'https://brainferry.pages.dev/',
    tagline: '강 건너기·저울·불 끄기 같은 두뇌 퍼즐 10가지 — 판이 매번 새로 만들어져요' },
  { slug: 'neuroflex', name: '두뇌 체조 NeuroFlex', kind: 'learn', subject: '여러 과목', target: '초등 고학년~', url: 'https://neuroflex.simssijjang.workers.dev/',
    tagline: '숫자·무늬·색·낱말·계산·공간 — 여섯 가지 두뇌 놀이와 오늘의 미션' },

  // ── 놀며 배우기
  { slug: 'civriver', name: '문명의 강', kind: 'play', subject: '사회', target: '초5~중3', url: 'https://civriver.pages.dev/',
    tagline: '실제 발상지에서 문명을 일으키며 격변을 견디는 역사 전략 놀이' },
  { slug: 'samhan-iltong', name: '삼한일통', kind: 'play', subject: '사회', target: '초등 고학년~', url: 'https://samhan-iltong.pages.dev/',
    tagline: '사료를 읽고 사람을 얻어 후삼국을 하나로 — 사실과 가정을 나눠 적은 역사 전략 놀이' },
  { slug: 'proof-kingdom', name: '증명의 왕국', kind: 'play', subject: '수학', target: '초5~중학', url: 'https://proof-kingdom.pages.dev/',
    tagline: '제자를 키워 사라진 수학 법칙 235개를 증명으로 되살리는 이야기 놀이' },
  { slug: 'knowledge-room', name: '탈출! 지식의 방', kind: 'play', subject: '여러 과목', target: '초등 1~6학년', url: 'https://knowledge-room.pages.dev/',
    tagline: '교과 개념을 손으로 움직이면 자물쇠가 열리는 방탈출' },
  { slug: 'munje-sanyang', name: '문제 사냥', kind: 'play', subject: '여러 과목', target: '초등', url: 'https://munje-sanyang.pages.dev/',
    tagline: '가위바위보와 문제로 카드를 모으는 교실 놀이 — 방을 열어 다 같이 해요' },
  { slug: 'gimje-kid', name: '김제 꼬마 해결사', kind: 'play', subject: '사회', target: '초등', url: 'https://gimje-kid.pages.dev/',
    tagline: '김제 거리를 3D로 달리며 의뢰를 해결하고 사진을 모으는 동네 모험' },
  { slug: 'lumenheim', name: '루멘하임', kind: 'play', subject: '수학', target: '초등 3~6학년', url: 'https://lumenheim.pages.dev/',
    tagline: '멈추지 않고 달리며 정답 빛알을 주워 룬을 채우는 학습 액션' },
  { slug: 'booster-island', name: '부스터 아일랜드', kind: 'play', subject: '여러 과목', target: '초등', url: 'https://booster-island.pages.dev/',
    tagline: '드리프트로 달리다 문제를 맞히면 부스터가 하나 더 켜지는 카트 경주' },
  { slug: 'silverwing', name: '은빛 편대', kind: 'play', subject: '여러 과목', target: '초등', url: 'https://silverwing.pages.dev/',
    tagline: '8단계를 나는 비행기 놀이 — 보급 상자의 문제를 맞히면 화력이 열려요. 한 기계로 둘이서도' },
  { slug: 'wordguard', name: '워드가드', kind: 'play', subject: '영어', target: '초등 3학년~', url: 'https://wordguard.pages.dev/',
    tagline: '영단어를 맞혀 마법의 왕국을 지키는 디펜스 놀이' },
  { slug: 'runegard', name: '룬가르드 연대기', kind: 'play', subject: '여러 과목', target: '초등 4~6학년', url: 'https://runegard.pages.dev/',
    tagline: '지도를 탐험하고 성을 키우다 문제로 봉인을 푸는 턴제 전략 놀이' },
  { slug: 'hanjo', name: '한조재흥기', kind: 'play', subject: '사회', target: '초등 고학년~', url: 'https://hanjo.pages.dev/',
    tagline: '복숭아꽃 맹세부터 한나라 재흥까지 — 장수 40명을 이끄는 삼국지 턴제 전략' },
  { slug: 'gwanggaeto', name: '광개토태왕 천하통일기', kind: 'play', subject: '사회', target: '초등 고학년~', url: 'https://gwanggaeto.pages.dev/',
    tagline: '광개토태왕이 되어 군사를 움직이는 고구려 전략 놀이' },
  { slug: 'guleum-seowon', name: '구름서원', kind: 'play', subject: '국어', target: '초등 고학년~', url: 'https://guleum-seowon.pages.dev/',
    tagline: '매판 새 사건을 만들어 주는 추리 보드 놀이 — 단서 카드를 인쇄해 2~6명이 함께' },
  { slug: 'gonu-madang', name: '고누마당', kind: 'play', subject: '사회', target: '초등', url: 'https://gonu-madang.pages.dev/',
    tagline: '땅에 선을 긋고 두던 우리 놀이 고누 세 가지 — 규칙은 세 줄이면 끝나요' },
  { slug: 'kingseeker', name: '킹시커', kind: 'play', subject: '여러 과목', target: '초등 3~6학년', url: 'https://iwkingseeker.pages.dev/',
    tagline: '두 팀으로 나눠 문제를 풀며 상대 팀의 숨은 왕을 찾는 교실 퀴즈' },
  { slug: 'jeongdap-squad', name: '정답 스쿼드', kind: 'play', subject: '수학', target: '초등', url: 'https://iwgun.pages.dev/',
    tagline: '화면을 보고 다 같이 손가락으로 정답을 가리키는 교실 놀이' },
  { slug: 'deultong', name: '들통', kind: 'play', subject: '놀이', target: '초등 고학년~', url: 'https://deultong.pages.dev/',
    tagline: '심박과 목소리로 재 보는 재미용 거짓말 탐지기 — 진짜 판정이 아니에요' },
  { slug: 'spot-the-difference', name: '틀린그림찾기', kind: 'play', subject: '놀이', target: '초등 전 학년', url: 'https://spot-the-difference-kr.pages.dev/',
    tagline: '두 그림에서 다른 곳을 찾아 장난꾼 꾸깃이를 쫓아요 — 이야기 108판·놀이 방식 10가지·내가 낸 문제를 친구에게' },

  // ── 선생님 책상
  { slug: 'semtle-exam', name: '셈틀 시험지', kind: 'teacher', subject: '수학', target: '초등 선생님', url: 'https://semtle-exam.pages.dev/',
    tagline: '초등 1~6학년 수학 단원을 고르면 매번 다른 시험지를 만들어 주는 출제 도구' },
  { slug: 'think-first', name: '생각먼저', kind: 'teacher', subject: '수업 설계', target: '초등 선생님', url: 'https://think-first-c25.pages.dev/',
    tagline: '성취기준을 고르면 «생각이 먼저»인 수업 흐름을 함께 짜 주는 수업 설계 도구' },
  { slug: 'ssamgibu', name: '선행 쌤기부', kind: 'teacher', subject: '학급 업무', target: '초등 선생님', url: 'https://ssamgibu.pages.dev/',
    tagline: '생기부 문장 후보·교육과정 시수·연간 시간표 — 초안을 놓고 선생님이 고쳐 써요' },
];

const versions: Record<string, string> = imageVersions;
const withVersion = (p: string) => (versions[p] ? `${p}?v=${versions[p]}` : p);

export const previewSites: PreviewSite[] = ROWS.map((r) => {
  const image = `/images/portfolio/${r.slug}.webp`;
  const thumb = `/images/portfolio/${r.slug}.thumb.webp`;
  return {
    ...r,
    added: '2026-11-25T00:30',
    category: '국어·통합',
    tags: [],
    description: r.tagline,
    features: [],
    tech: [],
    image: withVersion(image),
    thumb: versions[thumb] ? withVersion(thumb) : withVersion(image),
    url: viaSsam(r.url),
  };
});

export const PREVIEW_GROUPS: { kind: PreviewKind; title: string; note: string }[] = [
  { kind: 'learn', title: '배우고 만들기', note: '공방·교과·두뇌 퍼즐 — 혼자서도 끝까지 해 볼 수 있어요.' },
  { kind: 'play', title: '놀며 배우기', note: '전략·방탈출·경주·교실 퀴즈 — 쉬는 시간에 먼저 해 보세요.' },
  { kind: 'teacher', title: '선생님 책상', note: '시험지·수업 설계·학급 업무.' },
];
