// 학습 사이트 목록 — 모든 내용은 각 프로젝트 저장소(README/docs/소스)에서 확인된 사실만 기재.
// 수치를 바꿀 땐 반드시 원본 저장소에서 근거를 재확인할 것.

/** 카탈로그 필터용 큰 묶음. subject 는 카드에 그대로 보이는 세부 과목명. */
export type SiteCategory = '수학' | '영어' | '국어·통합' | '미술·놀이';

export const SITE_CATEGORIES: SiteCategory[] = ['수학', '영어', '국어·통합', '미술·놀이'];

export interface LearningSite {
  slug: string;
  name: string;
  subject: string;
  category: SiteCategory;
  tagline: string;
  description: string;
  features: string[];
  target: string;
  tech: string[];
  image: string;
  /** 공개 링크. 링크를 걸지 않는 사이트면 undefined */
  url?: string;
  /** url 이 없을 때 카드에 대신 보일 사유. 없으면 '학급 운영 중'.
   *  ⚠️ 사유는 사이트마다 다르다 — 기본 문구를 그대로 두면 사실과 다른 말이 나간다
   *  (2026-08-31 아라하루: 링크를 뺀 이유는 학급 운영이 아니라 «회원가입 필요»였다). */
  urlNote?: string;
}

export interface TeacherTool {
  slug: string;
  name: string;
  platform: string;
  tagline: string;
  description: string;
  features: string[];
  tech: string[];
  image: string;
  /** 다운로드/실행 링크 */
  url?: string;
  urlLabel?: string;
  /** 보조 링크(설치본과 웹판이 둘 다 있는 도구). 홈 카드는 카드 전체가 링크라
   *  중첩 <a> 를 못 넣는다 — 포트폴리오 상세 카드에서만 함께 보인다. */
  altUrl?: string;
  altLabel?: string;
}

// 선생님을 위한 프로그램
export const teacherTools: TeacherTool[] = [
  {
    slug: 'schooldesk',
    name: '스쿨데스크 SchoolDesk',
    platform: 'Windows 데스크톱',
    tagline: '선생님의 책상 위, 가장 똑똑한 도우미',
    description:
      '시간표·할일·D-Day·급식·학급 체크를 바탕화면 위젯으로 띄워 두는 교사용 프로그램입니다. 위젯은 바탕화면에 고정돼 클릭이 통과하니, 일하다 고개만 들면 오늘 할 일이 보입니다.',
    features: [
      '위젯 20종 — 시간표·할일·D-Day·급식·습관 등',
      '학사일정 파일(HWP·엑셀·워드) 자동 불러오기',
      '학생 기록은 암호화 + 변조 탐지 잠금',
      '데이터는 내 컴퓨터에 저장 · 광고 없음 · 무료',
    ],
    tech: ['Electron', 'React', 'SQLite'],
    image: '/images/portfolio/schooldesk.webp',
    url: 'https://github.com/iwschooldesk-app/SchoolDesk/releases/latest/download/SchoolDesk-Setup.zip',
    urlLabel: 'Windows용 내려받기',
  },
  {
    slug: 'ddobak',
    name: '또박또박',
    platform: '안드로이드 · 웹',
    tagline: '또박또박 적는 나의 기록',
    description:
      '할일·메모·일정·습관·목표·루틴을 한 곳에 적는 기록 앱입니다. 스쿨데스크와 계정을 연결하면 교실 컴퓨터에 적어둔 할일을 퇴근길 휴대폰에서 이어서 볼 수 있습니다.',
    features: [
      '할일 · 메모 · 일정 · 습관 · 목표 · 루틴',
      '스쿨데스크와 계정 연동 (선택)',
      '할일·메모·일정은 종단간 암호화',
      '학생 기록은 동기화하지 않음',
    ],
    tech: ['React Native', 'Next.js', 'Cloudflare D1'],
    image: '/images/portfolio/ddobak.webp',
    url: 'https://ddobak.simssijjang-d79.workers.dev',
    urlLabel: '안드로이드 앱 내려받기',
  },
  {
    slug: 'classvotebox',
    name: '우리 반 투표함',
    platform: 'Windows 데스크톱 · 웹',
    tagline: '한 기기를 돌려가며, 비밀은 지켜지는 투표',
    description:
      '교실에서 후보를 정하고 한 기기를 돌려가며 찍는 비밀 투표·개표 도구입니다. 한 사람이 찍고 나면 화면이 바로 다음 투표자용으로 넘어가 앞사람의 선택이 다시 보이지 않고, 개표는 선생님이 정해둔 PIN 4자리를 넣어야 시작됩니다.',
    features: [
      '후보 투표(1인 1표 · 1인 2표)와 찬반 투표(찬성 · 반대 · 기권)',
      '후보 2~20명 · 학급 투표 최대 60명 / 전교 투표 최대 3,000명',
      '숫자키로 바로 투표, 0은 기권 — 줄 서서 찍어도 빠르게',
      '개표 속도 3단(한 표씩 · 빠르게 · 초고속), 득표율은 유효표 기준',
      'Windows 단일 실행 파일(설치 불필요) · 브라우저로도 바로 사용',
      '로그인 없음 · 기록은 그 기기에만 저장 · 학생 정보 수집 없음',
    ],
    tech: ['React', 'Vite'],
    image: '/images/portfolio/classvotebox.webp',
    url: 'https://github.com/iw-lab/class-vote-box/releases/latest/download/ClassVoteBox-win64.zip',
    urlLabel: 'Windows용 내려받기',
    altUrl: 'https://class-vote-box.pages.dev/',
    altLabel: '웹에서 바로 열기',
  },
];

export const learningSites: LearningSite[] = [
  {
    slug: 'koreahis',
    name: '한국사 문제은행',
    subject: '한국사',
    category: '국어·통합',
    tagline: '외우지 말고 근거로 푸는 한국사 문항 5,446개',
    description:
      '국사편찬위원회 «우리역사넷» 한국사 연대기를 분석해 만든 오리지널 문항 은행입니다. 원문의 사실 명제를 문항으로 조립하고, 해설에는 그 출처를 그대로 답니다. 틀린 선지에는 «왜 틀렸는지» 대신 «그건 누구의 사실인지»를 붙여, 답을 외우지 않아도 다음 문항에서 쓸 수 있는 지식이 남게 했습니다.',
    features: [
      '문항 5,446개 · 사실 판별 · 인물 · 순서 배열 · 시기 판별 · 유물 사진',
      '심화 4,621 · 기본 825 · 시대 7구분으로 범위 지정',
      '모의고사 · 오답노트 간격 반복 복습 · 시대별 정답률 통계',
      '모든 문항이 AI 두 계열 교차검증을 거침',
      '가입도 서버도 없음 — 학습 이력은 그 브라우저에만',
    ],
    target: '한국사능력검정시험 준비생 · 초등 고학년 이상',
    tech: ['Python 문항 생성 파이프라인', '결정론 검수 게이트', 'Vanilla JS PWA', 'Vercel'],
    image: '/images/portfolio/koreahis.webp',
    url: 'https://koreahis.vercel.app/',
  },
  {
    slug: 'beaton',
    name: '비트:온 BEAT:ON',
    subject: '음악',
    category: '미술·놀이',
    tagline: '떨어지는 노트를 박자 맞춰 두드리는 리듬 게임',
    description:
      '가사·채보·프로그램을 직접 만들고 음원까지 AI 작곡 도구로 직접 생성한 리듬 게임입니다. 남의 곡을 쓰지 않아 교실에서 마음 놓고 틀 수 있고, 민요·트로트부터 K-POP·국악 퓨전까지 장르를 넓게 담았습니다. 채보는 곡을 분석해 자동 생성한 뒤 «한 손 3연타»·«같은 레인 연타» 같은 물리적으로 못 치는 배치를 게이트로 걸러냅니다.',
    features: [
      '직접 만든 60여 곡 · 민요부터 K-POP까지',
      '4키 · 6키 · 6키+스크래치 3개 모드',
      '이지 · 노멀 · 하드 난이도별 채보',
      '키 배치 변경 · 롱노트 릴리즈 판정',
    ],
    target: '초등 전 학년',
    tech: ['ACE-Step 음원 생성', 'librosa 비트 분석', 'Canvas 2D', 'Cloudflare Pages'],
    image: '/images/portfolio/beaton.webp',
    url: 'https://beaton-evo.pages.dev',
  },
  {
    slug: 'arton',
    name: '아트온 ArtON',
    subject: '미술',
    category: '미술·놀이',
    tagline: '로그인 없이 바로 색칠하는 도안 라이브러리',
    description:
      'AI로 직접 만든 색칠 도안을 주제·학년별로 골라 화면에서 칠하거나 A4로 인쇄해 쓰는 사이트입니다. 선을 SVG 벡터로 뽑아 크게 인쇄해도 계단 현상이 없고, 결정론 게이트로 도안 품질을 자동 검수합니다.',
    features: [
      '도안 1,300여 장 · 29개 테마',
      '저·중·고학년 난이도 3단계',
      '내 사진을 도안으로 변환',
      '저작권 만료 명화 포함',
    ],
    target: '초등 전 학년',
    tech: ['Node.js 생성 파이프라인', 'SVG 벡터화', 'Firebase Hosting'],
    image: '/images/portfolio/arton.webp',
    url: 'https://arton.simssijjang.workers.dev/coloring',
  },
  {
    slug: 'papersky',
    name: '종이하늘',
    subject: '논리 퍼즐',
    category: '미술·놀이',
    tagline: '종이비행기를 날려 보드를 비우는 원터치 퍼즐',
    description:
      '경로가 뚫린 비행기만 날 수 있어 "지금 뺄 수 있는 것"을 찾는 게 재미의 핵심입니다. 레벨을 역순으로 배치해 생성하기 때문에 무한히 만들어도 100% 풀 수 있고, 실패도 재시작도 없는 힐링 퍼즐입니다.',
    features: [
      '레벨 자동 생성 — 무한 플레이',
      '5의 배수 레벨은 그림이 되는 도안 29종',
      '엽서 수집 · 업적 18종 · 데일리 퍼즐',
      '색약 모드 등 접근성 지원',
    ],
    target: '전 연령',
    tech: ['TypeScript', 'Canvas 2D', 'Vite'],
    image: '/images/portfolio/papersky.webp',
    url: 'https://papersky.pages.dev/',
  },
  {
    slug: 'vocaworm',
    name: '보카웜 디펜스',
    subject: '영어 단어',
    category: '영어',
    tagline: '단어를 맞히면 포탄이 나가는 학습 디펜스 게임',
    description:
      '영단어 퀴즈로 거대 단어웜을 막아내는 게임입니다. 자동 공격은 보조일 뿐이라 문제를 풀지 않으면 절대 클리어할 수 없고, 틀린 단어는 황금 보스 마디로 다시 나타나 자연스럽게 복습됩니다.',
    features: [
      '교육과정 어휘 960개 (학년별 240개)',
      '오답 단어 재출현 — 간격 반복을 게임으로',
      '콤보 · 피버 · 궁극기 · 무한 원정',
      '찍기로는 못 깨는 학습 게이트 (테스트로 고정)',
    ],
    target: '초등 3~6학년',
    tech: ['Phaser 3', 'TypeScript', 'PWA'],
    image: '/images/portfolio/vocaworm.webp',
    url: 'https://vocaworm-defense.vercel.app/',
  },
  {
    slug: 'echotale',
    name: '에코테일 EchoTale',
    subject: '영어 읽기',
    category: '영어',
    tagline: 'AI가 읽어주는 단계별 영어 그림책',
    description:
      '읽고(Read) · 듣고(Hear) · 따라 하고(Echo) · 말하는(Speak) 셰도잉 루프로 영어 그림책을 읽습니다. 교사의 발음 부담 없이, 아이가 자기 수준을 골라 계정 없이 바로 시작할 수 있습니다.',
    features: [
      '단계별 콘텐츠 353권 (그림책 · 생활영어 · 신화)',
      'CEFR preA1부터 단계별 라이브러리',
      'Leitner 간격 반복 단어장',
      '삽화·음성 모두 AI로 제작',
    ],
    target: '초등 영어 학습자',
    tech: ['Next.js', 'Cloudflare Workers', 'D1'],
    image: '/images/portfolio/echotale.webp',
    url: 'https://echotale.simssijjang-d79.workers.dev/',
  },
  {
    slug: 'seulgisem',
    name: '슬기셈',
    subject: '수학',
    category: '수학',
    tagline: '내 수준에 맞춰 매일 10문제씩',
    description:
      '배치고사로 지금 수준을 찾고, 매일 10문제 미션을 풉니다. 성공률에 따라 다음 미션의 난이도와 복습 비율이 자동으로 조정되고, 막히면 선수 개념을 디딤돌로 먼저 보충합니다.',
    features: [
      '수준 진단 배치고사',
      '매일 10문제 적응형 미션',
      '막히면 선수 개념 자동 보충',
      '성장 대시보드',
    ],
    target: '초등 1~6학년',
    tech: ['Next.js', 'React', 'Firebase'],
    image: '/images/portfolio/seulgisem.webp',
    url: 'https://word-e329c.web.app',
  },
  {
    slug: 'mathcastle',
    name: '수학 성 수호자',
    subject: '수학',
    category: '수학',
    tagline: '문제를 맞혀 마법을 쏘는 수학 타워 디펜스',
    description:
      '학년·학기를 고르면 그 학기 교육과정 안에서만 문제가 나옵니다. 마법사를 움직여 타워를 세우고 밀려오는 몬스터를 막는데, 틀리면 한 줄 풀이 힌트가 뜨고 그 문제는 맞힐 때까지 3·7·15웨이브 뒤에 다시 나옵니다.',
    features: [
      '3-1부터 6-2까지 8개 학기 · 문제 약 2만 문항',
      '오답 풀이 힌트 + 간격 반복 재출제 · 오답노트',
      '타워 23종 · 몬스터 34종 · 마법 10종',
      '일간 · 주간 · 월간 랭킹 · 업적 19종',
    ],
    target: '초등 3~6학년',
    tech: ['JavaScript', 'Canvas 2D', 'Cloudflare Pages · D1'],
    image: '/images/portfolio/mathcastle.webp',
    url: 'https://mathcastle.pages.dev/',
  },
  {
    slug: 'gugu',
    name: '구구성 수호대',
    subject: '수학 연산',
    category: '수학',
    tagline: '계산이 빨라질수록 내 군대가 강해진다',
    description:
      '숫자가 살아 있는 셈나라를 지키는 라인 디펜스입니다. 문제를 맞히면 셈력이 차오르고, 그 힘으로 셈지기를 불러내 전선을 밀어냅니다. 곱셈구구를 가운데 두고 1학년 한 자리 덧셈부터 3학년 나눗셈까지 다룹니다.',
    features: [
      '스테이지 무한 · 셈지기 24종 · 엉킴괴수 12종',
      '숫자패드로 직접 입력 — 찍기로는 뚫리지 않게',
      '틀린 문제는 엉킴 봉인으로 남아 다음 판에 다시',
      '로그인 없이 바로 · 기록은 기기에만 (주간 순위는 선택)',
    ],
    target: '초등 2~4학년',
    tech: ['TypeScript', 'Canvas 2D', 'Cloudflare Workers'],
    image: '/images/portfolio/gugu.webp',
    url: 'https://gugu-guardians.pages.dev/',
  },
  {
    slug: 'araharu',
    name: '아라하루',
    subject: '아침 학습',
    category: '국어·통합',
    tagline: '매일 아침, 알아가는 즐거움',
    description:
      "'알아가다'의 순우리말 '아라'와 '하루'를 합친 이름입니다. 학년·학기에 맞춘 하루치 학습 세트를 매일 자동으로 만들어, 아침 시간에 여러 과목을 조금씩 다룹니다.",
    features: [
      '학년·학기별 일일 세트 자동 생성',
      '수학 · 글쓰기 · 맞춤법 · 어휘 · 한자 · 영어 · 독해 등',
      '출제 이력 기반 중복 방지',
      '2022 개정 교육과정 기준',
    ],
    target: '초등 1~6학년',
    tech: ['Next.js', 'Cloudflare Pages', 'D1'],
    image: '/images/portfolio/araharu.webp',
    // 2026-08-31 사용자 지시로 링크를 뺐다 — 쓰려면 회원가입이 필요해서
    // 홈페이지에서 바로 눌러 들어가는 흐름과 맞지 않는다. 알찬 쪽 링크는 그대로 둔다.
    urlNote: '회원가입 후 이용',
  },
  {
    slug: 'numeroquest',
    name: '칸채움',
    subject: '스도쿠',
    category: '수학',
    tagline: '매일 새로운 도전, 매일 더 강해지는 두뇌',
    description:
      '가로·세로·상자에 숫자를 겹치지 않게 채우는 스도쿠입니다. 생성기가 답이 하나뿐인 판만 내보내기 때문에 찍어서 맞는 칸이 없고, 난이도는 "필요한 풀이 기법"으로 갈라 놓아 위 단계가 실제로 더 깊은 생각을 요구합니다.',
    features: [
      '난이도 6단계 — 입문 · 쉬움 · 보통 · 어려움 · 전문가 · 마스터',
      '오늘의 도전 · 주간 미션 · 연속 기록(스트릭)',
      '두뇌 점수와 업적 40종',
      '퍼즐을 A4로 인쇄해 종이로도 풀기',
    ],
    target: '초등 고학년 · 어른',
    tech: ['Next.js', 'Cloudflare Pages', 'D1'],
    image: '/images/portfolio/numeroquest.webp',
    url: 'https://numero-quest.pages.dev',
  },
  {
    slug: 'typingverse',
    name: '타이핑버스 TypingVerse',
    subject: '타자',
    category: '국어·통합',
    tagline: '손끝으로 여는 무한한 세계',
    description:
      '한글·영문 타자 연습에 성장 요소를 얹었습니다. 정확도는 시도 단위로 세기 때문에 오타를 지우고 다시 쳐도 100%로 세탁되지 않고, 자주 틀리는 키를 모아 맞춤 드릴을 만들어 줍니다.',
    features: [
      '연습 7종 · 테스트 3종 · 타자 게임 6종',
      '한글 오토마타 기반 손가락 매핑 · 취약 키 드릴',
      'XP · 레벨 · 스트릭 · 일일 퀘스트 · 리그',
      '순위 점수는 서버가 검증 — 자동 입력 차단',
    ],
    target: '초등 전 학년',
    tech: ['Next.js', 'Cloudflare Pages Functions', 'D1'],
    image: '/images/portfolio/typingverse.webp',
    url: 'https://typingverse.pages.dev',
  },
  {
    slug: 'iwpick',
    name: '뽑기ON',
    subject: '교실 추첨',
    category: '미술·놀이',
    tagline: '이름만 넣으면 끝나는 교실 랜덤 추첨',
    description:
      '설치도 로그인도 없이 이름만 붙여 넣으면 추첨이 시작됩니다. 응모권을 여러 장 낸 사람이 그만큼 유리한 가중치 추첨을 지원하고, 끝에서만 긴장되던 기존 추첨과 달리 관문 세 개로 긴장을 나눠 놓았습니다.',
    features: [
      '구슬 레이스 — 관문 3개(좁은 문 · 회전 지옥 · 최후의 문), 70명 기준 약 2분',
      '서바이벌 — 라운드마다 탈락, 최후의 1인까지 약 30초',
      '가중치 추첨 — 이름 뒤에 *3을 붙이면 응모권 3장',
      '3명이 남으면 자동 슬로우모션 · 화면 확대 · 심장박동',
      '구슬이 끼면 자동으로 풀려나 레이스가 반드시 끝남',
    ],
    target: '학급 전체',
    tech: ['Vite'],
    image: '/images/portfolio/iwpick.webp',
    url: 'https://iwpick.pages.dev/',
  },
  {
    slug: 'numrush',
    name: '넘버러시 NumRush',
    subject: '수 감각',
    category: '수학',
    tagline: '60초 안에 1부터 순서대로 몇 번까지',
    description:
      '전자칠판 앞에서 4~6명이 한 기기를 교대하며 푸는 60초 게임입니다. 1부터 순서대로 숫자를 찾고, 그 결과가 오늘의 발표 순서와 팀이 됩니다. 의존성과 빌드 도구 없이 만들어 초기 로드가 82.5KB입니다.',
    features: [
      '60초 시간 고정 — 4~6명 교대가 수업 시간 안에 끝남',
      '초기 로드 82.5KB · 웹폰트 0KB — 교실 AP 한 대에 40명이 붙어도 열림',
      '터치 타겟 88px 이상 · 수치 96px 이상 — 서서 조작, 뒷자리에서도 읽힘',
      '이름 입력 없음 — 60초 세션에 한글 IME 를 넣지 않음',
    ],
    target: '초등 3~6학년',
    tech: ['Vanilla JS'],
    image: '/images/portfolio/numrush.webp',
    url: 'https://numrush.vercel.app',
  },
  {
    slug: 'spanland',
    name: '한뼘 땅따먹기 SpanLand',
    subject: '측정·넓이',
    category: '수학',
    tagline: '돌을 세 번 튕겨 집으로 돌아오면 그 안이 내 땅',
    description:
      '전래놀이 땅따먹기를 전자칠판용으로 각색했습니다. 방향과 세기를 정해 돌을 튕기고, 3타 안에 내 땅으로 돌아오면 궤적이 그린 다각형이 내 땅이 됩니다. 멀리 갈수록 큰 땅이지만 못 돌아올 위험도 커지는 긴장 하나로 게임이 성립해 아이템도 상점도 없습니다.',
    features: [
      '탭 2회로 방향과 세기 — 전자칠판 적외선 터치는 드래그 중 끊기므로 드래그 0',
      '2타 복귀는 삼각형(안전), 3타 복귀는 사각형(큰 소득)',
      '60초 뒤 차지한 칸 수가 점수 · 1~6인 핫시트',
      '의존성 0 · 빌드 도구 0 · 웹폰트 0KB',
    ],
    target: '초등 3~6학년',
    tech: ['Vanilla JS'],
    image: '/images/portfolio/spanland.webp',
    url: 'https://spanland.vercel.app',
  },
  {
    slug: 'yutdash',
    name: '한달음 윷놀이 YutDash',
    subject: '확률·자료',
    category: '수학',
    tagline: '번갈아 윷을 던져 말을 집으로, 남의 말은 잡고',
    description:
      '전래놀이 윷놀이를 전자칠판용 턴제 대결로 각색했습니다. 누르는 것이 말이 아니라 목적지라 「말 고르고 → 길 고르기」의 두 단계가 없고, 잡을 수 있는 자리는 붉은 가시 링으로 미리 보입니다. 누가 목표에 닿아도 그 바퀴는 마쳐 전원이 같은 횟수의 차례를 받습니다.',
    features: [
      '목적지를 누르는 조작 — 지름길과 바깥길이 그냥 다른 목적지',
      '남의 말을 잡으면 한 번 더, 윷·모도 한 번 더',
      '개(2칸)가 6/16 로 가장 자주 나오는 실제 윷 확률 그대로',
      '목표 점수 도달 후에도 그 바퀴는 마침 — 차례 수가 같아야 공정',
    ],
    target: '초등 3~6학년',
    tech: ['Vanilla JS'],
    image: '/images/portfolio/yutdash.webp',
    url: 'https://yutdash.vercel.app',
  },
  {
    slug: 'chromafall',
    name: '크로마폴 ChromaFall',
    subject: '색채 퍼즐',
    category: '미술·놀이',
    tagline: '색을 섞어 터뜨리는 낙하 퍼즐',
    description:
      '떨어지는 블록의 색을 섞어 같은 색을 만들고 연쇄로 터뜨립니다. 수학 모드에서는 융합 조건이 색이 아니라 값이라, 1/2 · 0.5 · 50%가 한 덩어리로 터집니다.',
    features: [
      '모드 7종 — 클래식 · 수학 · 퍼즐 · 젠 · 일일 챌린지 · 서바이벌 · 챌린지',
      '수학 모드 — 분수 · 소수 · 백분율을 같은 값끼리',
      '일일 챌린지는 매일 같은 판으로 3분 승부',
      '젠 모드는 게임오버 없이 편안하게',
    ],
    target: '초등 3~6학년',
    tech: ['React', 'TypeScript', 'Vite'],
    image: '/images/portfolio/chromafall.webp',
    url: 'https://chromafall.pages.dev/',
  },
  {
    slug: 'keywordschool',
    name: '열쇠말 학교',
    subject: '학습 방탈출',
    category: '국어·통합',
    tagline: '배움이 곧 열쇠',
    description:
      'ZEP 풍 2D 탑다운 방탈출입니다. 문제를 풀어야 자물쇠가 열리고, 여섯 개의 열쇠말을 모으면 정문이 열립니다. 조각 4개를 모으기 전에는 자물쇠 입력 자체가 잠겨 완전탐색으로 통과할 수 없습니다.',
    features: [
      '문항 2,300여 개 — 수학 · 국어 · 과학 · 사회',
      '학년·학기를 고르면 그때까지 배운 범위에서만 출제',
      '6번 틀리면 해설과 함께 조각 지급 — 누구도 갇히지 않는다',
      '이름·학교·계정 없음 · 진행은 기기 안에만',
    ],
    target: '초등 3~6학년',
    tech: ['Phaser 3', 'TypeScript', 'Vite'],
    image: '/images/portfolio/keywordschool.webp',
    url: 'https://yeolsoemal-school.vercel.app/',
  },
  {
    slug: 'kongkong',
    name: '콩콩배구',
    subject: '캐주얼 게임',
    category: '미술·놀이',
    tagline: '3개 키만 알면 되는데, 옆사람과 30분을 싸우게 되는 배구',
    description:
      '이동·점프·때리기 세 가지만 알면 시작하는 2D 물리 배구입니다. 스파이크 각도는 그 순간 누르고 있는 이동 방향이 정하고, 타구를 이어가면 필살 게이지가 찹니다. 한 대에서 둘이 하거나, 방 코드를 나눠 다른 컴퓨터끼리 붙을 수 있습니다.',
    features: [
      '1인 플레이 · 2인 대전 · 방 코드 4글자 온라인 대전',
      '오리지널 캐릭터 4종 · 난이도 3단계',
      '목표 점수와 공 중력까지 고르는 경기 규칙',
      '스파이크 가이드는 색이 아니라 선 모양과 기호로도 구분',
    ],
    target: '전 연령',
    tech: ['JavaScript', 'Canvas 2D', 'Cloudflare Pages'],
    image: '/images/portfolio/kongkong.webp',
    url: 'https://kongkong-volley.pages.dev/',
  },
  {
    slug: 'reloadarena',
    name: '리로드 아레나 Reload Arena',
    subject: '교과 대항전',
    category: '국어·통합',
    tagline: '물감은 시간으로도 돈으로도 안 나온다 — 문제를 맞혀야 충전된다',
    description:
      '물감 통 모양 드론이 되어 교실을 물감으로 칠하는 대항전입니다. 다른 게임과 달리 탄약이 시간으로 차지 않습니다. 영어·수학·과학·사회 문제를 맞혀야만 물감이 나오므로, 조준이 서툰 아이도 문제를 풀어 팀에 기여할 수 있습니다.',
    features: [
      '문항 은행 1만 1천여 개 — 영어 3,322 · 과학 3,586 · 사회 4,435 · 수학은 학년별 생성',
      '학년·학기를 고르면 그 범위에서만 출제 (3~6학년)',
      '놀이 방식 3종 — 정지전 · 바닥 칠하기 · 칠하기+정지',
      '팀전 2:2 · 4:4 · 6:6, 개인전 4~6명 · 방 코드로 함께',
      '이름 직접 입력 · 계정 없음 · 채팅 없음 · 기록은 기기에만',
    ],
    target: '초등 3~6학년',
    tech: ['Three.js', 'Cloudflare Workers', 'Durable Objects'],
    image: '/images/portfolio/reloadarena.webp',
    url: 'https://reload-arena.simssijjang-d79.workers.dev/',
  },
  {
    slug: 'oreudap',
    name: '오르답 Oreudap',
    subject: '구구단 · 영단어',
    category: '수학',
    tagline: '정답을 밟아야 한 층 오른다',
    description:
      '문제를 보고 정답이 적힌 발판을 밟아 위로 오르는 즉답 아케이드입니다. 발판은 캐릭터가 아니라 «세계»가 내려가며 쌓이고, 층이 오를수록 제한시간이 줄고 문항 등급이 열리며 배경음악이 조여듭니다. 틀린 낱말은 오답노트에 담겨 며칠 뒤 다시 나옵니다.',
    features: [
      '모드 3가지 — 무한 오르기(하트 3) · 아슬아슬(기력이 계속 줄어든다) · 60초 질주',
      '구구단 72문항 + 영단어 1,207개(3·4학년 617 · 5·6학년 590), 두 방향으로 출제',
      '영어 낱말 943개는 원어민 발음 파일로 읽어 주고, 나머지는 브라우저 음성이 읽는다',
      '10·25층에서 문항 등급이 열리고 BGM 이 함께 바뀜 — 어려워지는 것을 귀로 먼저 안다',
      '일일 등수는 과목·모드별로 따로 — 이름은 기기에서 가려서 보낸다(김철수 → 김*수)',
      '계정 없음 · 나이·학교 안 받음 · 기록은 그 브라우저에만 저장',
    ],
    target: '초등 2~6학년',
    tech: ['Phaser 3', 'Vite', 'Cloudflare Workers'],
    image: '/images/portfolio/oreudap.webp',
    url: 'https://oreudap.vercel.app',
  },
  {
    slug: 'hopsquad',
    name: '폴짝 원정대',
    subject: '교과 통합',
    category: '국어·통합',
    tagline: '문제를 안 풀어도 깰 수 있다 — 맞히면 상만 있다',
    description:
      '10월드 70스테이지 점프 액션입니다. 길목의 «지혜의 돌»을 건드리면 국어·수학·영어·과학 4지선다가 뜨는데, 맞히면 이슬과 활공 씨앗을 받고 틀리거나 그냥 지나쳐도 잃는 것이 없습니다. 학습을 벌이 아니라 상으로만 걸어 두었고, 문제를 하나도 풀지 않은 봇이 70스테이지를 전부 깨는 것을 검증으로 확인합니다.',
    features: [
      '문항 1,913개 — 국어 499 · 수학 624 · 영어 500 · 과학 290',
      '타이틀에서 학년·학기 출제 범위 지정 — 고른 범위에 몇 문항이 있는지 그 자리에서 보여 준다',
      '문제를 안 풀어도 클리어 가능 · 정답 보상은 이슬과 활공 씨앗',
      '전 스테이지 봇 클리어·불가능 점프 없음·결정론을 기계 검증 19항목으로 고정',
      '키보드 · 터치 · 전자칠판 · 전체화면',
      '계정 없음 · 기록은 그 브라우저에만 저장 · 개인정보 수집 없음',
    ],
    target: '초등 1~6학년',
    tech: ['Phaser 3', 'JavaScript', 'Vite'],
    image: '/images/portfolio/hopsquad.webp',
    url: 'https://hop-squad-mu.vercel.app',
  },
  {
    slug: 'ttobagi',
    name: '또박이',
    subject: '국어·영어',
    category: '국어·통합',
    tagline: '급수표를 만들 필요가 없다 — 열면 바로 받아쓰기가 된다',
    description:
      '초등 받아쓰기 앱입니다. 국어 537급 5,370문항과 영어 229급 2,290문항이 «미리 구운 사람 목소리»까지 함께 들어 있어, 급수표를 따로 만들지 않아도 링크를 열면 그 자리에서 시작됩니다. 맞고 틀림만 세는 대신 받침·연음·구개음화 같은 오류 유형을 함께 내어 이 아이가 무엇을 어려워하는지 보여 줍니다. 서버가 아예 없어서 아이가 쓴 것과 점수는 그 기기 브라우저 밖으로 나가지 않습니다.',
    features: [
      '국어 537급 5,370문항 · 영어 229급 2,290문항 내장 — 문항마다 음원 7,660개 전수 확인',
      '자모 채점 16종(받침·겹받침·된소리·연음·구개음화·띄어쓰기 등) · 영어 철자 채점 14종',
      '칠판 모드 — 큰 글씨·자동 진행·단축키, 같은 브라우저의 다른 창을 리모컨으로',
      '손글씨 답은 사람이 ○/× 로 확정하기 전까지 정답 처리하지 않는다',
      '시험 중에는 정답·정오를 어떤 경로로도 보여 주지 않는다',
      '인쇄물 5종(급수표·따라쓰기·연습시험지·시험지·오답연습지) · 링크와 QR 로 나눠 주기',
      '한 번 열면 오프라인에서도 진행(PWA) · 계정 없음 · 네트워크로 나가는 학생 데이터 없음',
    ],
    target: '초등 1~6학년(영어는 3~6학년)',
    tech: ['TypeScript', 'Vite', 'PWA'],
    image: '/images/portfolio/ttobagi.webp',
    url: 'https://ttobagi.pages.dev/',
  },
  {
    slug: 'prism-pop',
    name: '프리즘 팝',
    subject: '교과 통합',
    category: '국어·통합',
    tagline: '조각을 맞추다 보면 문제가 끼어든다',
    description:
      '매치3 퍼즐입니다. 같은 조각을 셋 이상 맞춰 판을 깨는 사이사이에 4지선다 한 문제가 끼어듭니다. 처음 열 때 학년과 학기를 고르면 그 학기까지 배운 범위에서만 문제가 나오고, 한국사는 5학년 2학기부터 열립니다. 틀려도 잃는 것이 없고 문제를 건너뛰어도 판은 그대로 진행되어서, 학습이 벌이 아니라 덤으로만 작동합니다. 라이프가 없어 몇 번이든 다시 도전할 수 있고, 현금 결제·광고·확률형 아이템이 하나도 없습니다.',
    features: [
      '문항 1,566개 — 수학 756 · 영어 413 · 국어 265 · 한국사 132, 3학년 1학기~6학년 2학기',
      '학년·학기를 고르면 안 배운 단원은 나오지 않는다 — 한국사는 5-2부터',
      '목표 12종(점수·얼음·씨앗·색 모으기·특수 발동·블로커·잉크·펭귄·물때·연쇄·시간·보스)',
      '단계는 끝이 없다 — 손으로 만든 120단계 뒤로는 곡선을 물려받아 계속 생성된다',
      '특수 조각 5종이 무엇을 터뜨렸는지 연출로 구분된다(가로·세로 쓸기, 회전, 방사, 프리즘)',
      '결제·광고·확률형 아이템·라이프 없음 — 코인은 판을 깨면 쌓인다',
      '색맹 대비로 색마다 모양이 다르다 · 긴장 연출 완화 토글 · 계정 없음, 기록은 그 브라우저에만',
    ],
    target: '초등 3~6학년',
    tech: ['Phaser 3', 'TypeScript', 'Vite'],
    image: '/images/portfolio/prism-pop.webp',
    url: 'https://prism-pop.pages.dev/',
  },
  {
    slug: 'skyguard',
    name: '하늘수비대 SkyGuard',
    subject: '교과 통합',
    category: '국어·통합',
    tagline: '위에서 쏟아지는 것을, 아래에서 막는다',
    description:
      '적이 위에서 아래로 내려오고 아이는 화면 아래에 탑을 세워 막는 웨이브 디펜스입니다. 웨이브 사이의 관제 문제와 전투 중 지식탄으로 국어·수학·과학·사회 문항이 섞이는데, 틀려도 잃는 것이 없고 연속으로 맞힐수록 보상이 커집니다.',
    features: [
      '캠페인 20웨이브 + 클리어 후 열리는 무한모드, 난이도 보통·어려움·악몽',
      '탑 6종(화살·폭탄·서리·송곳·방벽·발전소)과 특화 갈래 — 한 종류만 쌓으면 막히도록 설계',
      '문항 122개 — 국어 31 · 사회 31 · 수학 30 · 과학 30, 3~6학년',
      '오답 페널티 없음 · 연속 정답이 보상을 키움 · 학습이 플레이 시간의 약 8.5%',
      '보스 4종(5·10·15·20웨이브)은 약점 퀴즈를 맞히면 약해짐',
      '계정 없음 · 기록은 그 브라우저에만 저장 · 개인정보 수집 없음',
    ],
    target: '초등 3~6학년',
    tech: ['Phaser 3', 'TypeScript', 'Vite'],
    image: '/images/portfolio/skyguard.webp',
    url: 'https://skyguard-bdk.pages.dev/',
  },
  {
    slug: 'pilhan',
    name: '필한 筆漢',
    subject: '한자 급수',
    category: '국어·통합',
    tagline: '눈으로 보는 한자가 아니라, 손으로 쓰는 한자',
    description:
      '한국어문회 8급~3급 배정한자 1,817자를 급수 순서대로 손으로 쓰며 익히는 앱입니다. 화면에 획순 번호가 뜨고, 마우스·손가락·펜 어느 것으로 그어도 획의 순서와 방향을 그 자리에서 채점합니다. 반대로 그으면 통과되지 않습니다.',
    features: [
      '한 글자를 3획 → 다른 글자 → 3획 → 4획으로 나눠 쓰는 분산 반복',
      '획순 채점 1,805자 · 나머지 12자는 자형이 다를 위험이 있어 따라쓰기로',
      '간격 반복(SM-2) 복습 — 확인 문항은 학습 직후가 아니라 다음 세션에',
      '칭호 童蒙→書聖 10단계 · 도장첩 20개 · 하루 목표',
      '설치 없이 브라우저에서 · 오프라인에서도 · 기록은 기기에만',
    ],
    target: '초등 3학년 이상 · 한자 급수 준비',
    tech: ['TypeScript', 'React', 'PWA(오프라인)', 'IndexedDB'],
    image: '/images/portfolio/pilhan.webp',
    url: 'https://pilhan.pages.dev/',
  },
  {
    slug: 'looppark',
    name: '루프 파크 Loop Park',
    subject: '학년별 수학',
    category: '수학',
    tagline: '문제를 풀어야 놀이공원이 커진다',
    description:
      '길을 깔고 놀이기구를 놓아 손님을 모으는 3D 경영 시뮬레이션입니다. 새 시설은 «연구»로 열리는데, 연구 포인트는 연구소에 쌓인 문제를 풀어야 나옵니다. 시작할 때 대상 학년과 학기를 고르면 그 학기 교과 범위 안에서만 출제됩니다.',
    features: [
      '학년·학기 선택(3-1~6-2) — 교과서 단원 36개에 맞춘 문항, 학기마다 300회를 뽑아 서로 다른 문항 152~279개',
      '롤러코스터를 직접 그린다 — 조각을 이어 붙이면 짜릿·아찔·울렁과 G 안전 판정이 즉시 갱신되고, 추천 코스 4종으로 한 번에 완성할 수도 있다',
      '요금을 올리면 이용객이 줄고, 줄이 길면 손님이 화를 낸다 — 수치가 그대로 게임이 된다',
      '청소부·정비공·엔터테이너가 각자 실제로 일한다(쓰레기·고장·대기 불만)',
      '12달 한 판 · 동/은/금메달 · KST 기준 일일 랭킹(이름은 가운데 글자를 가려 저장)',
      '계정 없음 · 개인정보 수집 없음 · 기록은 그 브라우저에만 저장',
    ],
    target: '초등 3~6학년',
    tech: ['Three.js', 'JavaScript', 'Cloudflare Pages/KV'],
    image: '/images/portfolio/looppark.webp',
    url: 'https://loop-park.pages.dev/',
  },
  {
    slug: 'pongdang',
    name: '퐁당 낚시터',
    subject: '교과 통합',
    category: '국어·통합',
    tagline: '찌를 기다리는 몇 초에, 문제 하나',
    description:
      '캐스팅하고 찌를 기다리는 그 몇 초에 «물음표 병» 하나가 떠오릅니다. 맞히면 황금미끼와 물때가 올라 더 크고 귀한 물고기가 물고, 틀려도 잃는 것은 없습니다. 문제를 풀지 않아도 낚시 게임으로 완결되도록 만들었습니다 — 학습은 결과를 «더 좋게» 하지, 못 풀었다고 벌을 주지 않습니다.',
    features: [
      '한 판 4분 · 캐스팅 거리 조절 → 입질 → 챔질 → 텐션 파이팅',
      '3~6학년 5과목 2,491문항(수학 1,354 · 영단어 316 · 국어 어휘 280 · 과학 290 · 사회 251) — 시작할 때 고른 학년·학기 범위에서만 출제',
      '오답 페널티 0 · 정답은 황금미끼와 물때로 «다음 물고기»에 바로 반영',
      '낚시터 4곳(호수·강·바다·심해) · 어종 203종 도감',
      '일일 랭킹 — 점수는 서버가 입력 로그를 다시 돌려 계산한다(클라이언트 점수 미신뢰)',
      '계정 없음 · 자유 입력 이름 없음 · 랭킹 이름은 가운데 글자를 가려 저장',
    ],
    target: '초등 3~6학년',
    tech: ['TypeScript', 'Three.js', 'Cloudflare Pages/Functions/KV'],
    image: '/images/portfolio/pongdang.webp',
    url: 'https://pongdang-fishing.pages.dev/',
  },
  {
    slug: 'baton',
    name: '배트온 BatOn',
    subject: '교과 통합',
    category: '국어·통합',
    tagline: '타석에 들어서기 전, 문제 하나',
    description:
      '«오늘의 투수»를 상대로 2이닝을 치거나 던지는 야구 게임입니다. 타석에 들어서기 전 4지선다 한 문제가 뜨는데, 맞히면 집중 게이지가 차고(다음 공의 구종·코스를 미리 알려 줍니다) 타구 위력이 오릅니다. 틀려도 잃는 것은 없습니다 — 문제를 하나도 못 풀어도 야구는 그대로 굴러가고, 학습은 «더 잘 치게» 할 뿐입니다. 점수는 서버가 입력 기록을 같은 시뮬레이터로 다시 돌려 계산합니다.',
    features: [
      '한 판 2분 남짓 · 타자 · 투수 · 혼합 3가지 역할',
      '3~6학년 5과목 2,536문항(수학 1,320 · 영어 450 · 과학 290 · 국어 265 · 사회 211) — 한 판에 3문항',
      '오답 페널티 0 · 정답은 집중 게이지(구종·코스 예고)와 타구 위력으로 돌아온다',
      '도루와 견제 · 결과별 중계 컷 · 심판 음성 콜 14종',
      '일일 랭킹은 역할별로 나뉜다(타자와 투수는 점수 척도가 다르다) · 하루 3회',
      '계정 없음 · 자유 입력 이름 없음 · 랭킹 이름은 가운데 글자를 가려 저장',
    ],
    target: '초등 3~6학년',
    tech: ['JavaScript', 'Three.js', 'Cloudflare Pages/Functions/D1'],
    image: '/images/portfolio/baton.webp',
    url: 'https://baton-8x7.pages.dev/',
  },
  {
    slug: 'hwalbaram',
    name: '활바람 Hwalbaram',
    subject: '체육·양궁',
    category: '미술·놀이',
    tagline: '바람을 읽고, 흔들림이 멎는 순간에 놓아라',
    description:
      '70 m 과녁을 향해 쏘는 풀 3D 양궁입니다. 누르면 활을 당기고, 끌어서 조준하고, 떼면 나갑니다 — 조작은 손가락 하나가 전부입니다. 어려운 것은 조작이 아니라 «언제 놓느냐»입니다. 당기고 있으면 조준점이 떨리는데, 1.2초쯤부터 3초까지가 가장 잔잔하고 그 뒤로는 팔이 지쳐 다시 흔들립니다. 거기에 바람이 얹힙니다: 측풍 1 m/s 는 정확히 과녁 한 칸을 밀고, 상승·하강 기류는 짧은 돌풍으로 따로 옵니다. 그래서 잘 쏘는 법이 «세게»가 아니라 «읽고 기다리기»가 됩니다. 교과 문제는 들어 있지 않습니다.',
    features: [
      '한 손가락 조작 — 누르기(당기기) · 끌기(조준) · 떼기(발사)',
      '바람 세 성분을 따로 모델링 — 측풍 1 m/s = 한 칸 · 앞뒤바람은 낙차 · 상승기류는 돌풍으로',
      '한 기기 둘이서 화살 교대 세트제(세트 승 2점 · 6점 선취) · AI 3단계 · 연습장',
      '«오늘의 바람» — 날마다 같은 바람으로 12발, 일일 순위',
      '경기장 3곳 · 업적 18 · 효과음과 배경음악 전부 자체 생성',
      '계정 없음 · 순위 이름은 가운데 글자를 지운 뒤에만 저장(온전한 이름은 기기에도 안 남습니다)',
    ],
    target: '초등 3~6학년(전연령)',
    tech: ['JavaScript', 'Three.js', 'Cloudflare Pages/Functions/D1'],
    image: '/images/portfolio/hwalbaram.webp',
    url: 'https://hwalbaram.pages.dev/',
  },
  {
    slug: 'seolbong',
    name: '설봉 러시 Seolbong Rush',
    subject: '스포츠 게임',
    category: '미술·놀이',
    tagline: '한 산을 정상에서 베이스까지, 깃대 사이로 내리꽂는다',
    description:
      '브라우저에서 도는 3D 스키 다운힐입니다. 설봉산 정상에서 베이스까지 한 번에 내려오는데, 길에는 통과해야 할 깃대가 줄지어 서 있습니다. 빠를수록 점수가 붙고 깃대를 지날 때마다 배수가 오르지만, 눈은 실제로 미끄러워서 최고 속도로 가다 확 꺾으면 날이 걸려 그대로 넘어집니다 — 속도와 정확도를 같이 재는 구조입니다. 어디로 가야 하는지는 설면 화살표·깃대 위 빛기둥·화면 아래 방향 표시 세 가지로 알려 줍니다.',
    features: [
      '코스 6개(은빛 능선 ~ 얼음 폭포) · 경사 19.7° ~ 34.1° · 눈질 4종(다져진 눈 · 파우더 · 빙판 · 습설)',
      '스키어 5종 — 외형이 아니라 물리 배율(항력 · 그립 · 조향 · 공중조향 · 밸런스)이 다릅니다',
      '1인칭 · 3인칭 전환(V) · 주행 중에도 바뀝니다',
      '실시간 점수 = 속도² × 배수 · 깃대 통과 +120 · 넘어지면 배수를 잃습니다',
      '매일 같은 코스로 겨루는 랭킹 — 서버가 입력 로그를 그대로 다시 돌려 기록을 검증합니다',
      '계정 없음 · 자유 입력 이름 없음 · 랭킹 이름은 세 글자 중 가운데를 가려 저장(김*수)',
    ],
    target: '초등 3~6학년(전연령)',
    tech: ['JavaScript', 'Three.js', 'Cloudflare Pages/Workers/Durable Objects'],
    image: '/images/portfolio/seolbong.webp',
    url: 'https://seolbong-rush.pages.dev/',
  },
  {
    slug: 'pinthunder',
    name: '핀 천둥 Pin Thunder',
    subject: '수학',
    category: '수학',
    tagline: '공을 잡고 휘휘 돌려 던지면, 핀 100개가 무너진다',
    description:
      '핀이 진짜 물리로 무너지는 3D 볼링입니다. 공을 눌러 잡고 손으로 휘휘 돌리면 스핀이 차고, 그대로 위로 휙 던지면 돌린 쪽으로 휘어 나갑니다. 조준하는 동안 보기 3개짜리 수학 문제가 하나 뜨는데, 맞히면 «천둥 볼»이 충전될 뿐 틀려도 잃는 것은 없습니다 — 문제를 하나도 안 풀어도 볼링은 그대로 굴러가고, 학습은 «더 시원하게 무너뜨리는» 보상으로만 작동합니다. 학년대(2~3 · 3~4 · 4~5학년)는 교사가 고르고, 아예 끌 수도 있습니다.',
    features: [
      '한 판 10프레임 · 10핀 정규 / 50핀 화살촉 / 100핀 다이아몬드 3가지 모드',
      '조작 = 잡고 · 휘휘 돌려 스핀 · 위로 휙(PC 는 스페이스바 게이지로도 던집니다)',
      '수학 문제는 결정론 생성 — 같은 씨앗이면 같은 문제라 교실에서 같은 문제를 낼 수 있습니다',
      '혼자 · 한 기기 돌려가며 2~4인 핫시트 · AI 4단계(도토리·참새·매·번개)',
      '스페어 연습 레인 8종 배치 · 일일 랭킹',
      '계정 없음 · 자유 입력 이름 없음 · 랭킹 이름은 가운데 글자를 가려 저장',
    ],
    target: '초등 3~6학년(전연령)',
    tech: ['JavaScript', 'Three.js', 'Rapier', 'Cloudflare Pages/Functions/D1'],
    image: '/images/portfolio/pinthunder.webp',
    url: 'https://pin-thunder.pages.dev/',
  },
  {
    slug: 'teeshot',
    name: '티샷 아일랜드 TeeShot Island',
    subject: '교과 통합',
    category: '수학',
    tagline: '치기 전에 한 문제, 잘 맞히면 더 멀리',
    description:
      '섬 코스를 도는 3D 골프입니다. 조준하는 동안 4지선다 한 문제가 뜨는데, 맞히면 «집중 토큰»이 쌓이고 비거리가 붙습니다. 틀려도 잃는 것은 없습니다 — 문제를 하나도 못 풀어도 골프는 그대로 굴러가고, 학습은 «더 멀리·더 정확히» 치게 할 뿐입니다. 힘은 오락가락하는 막대를 놓는 시각으로, 정확도는 줄어드는 원을 맞히는 시각으로 정해집니다. 점수는 서버가 입력 기록을 같은 시뮬레이터로 다시 돌려 계산합니다.',
    features: [
      '오늘의 코스 3홀(파3·파4·파5) — 전원 같은 홀·바람·핀 · 하루 3회',
      '3~6학년 25단원 · 한 판 4문항 · 오답 페널티 0',
      '정답은 집중 토큰(판정 창 ×2.6 · 정확 낙하 예측선)과 비거리 보너스(정답당 +3 %, 판 상한 +12 %)로 돌아온다',
      '조작 = 좌우로 끌어 조준 · 막대를 놓아 힘 · 줄어드는 원을 탭해 정확도',
      '자유 연습 9홀 · 한 홀 반복 · 오답 노트 · 바람과 경사 힌트 항상 표시',
      '계정 없음 · 자유 입력 이름 없음 · 랭킹 이름은 가운데 글자를 가려 저장',
    ],
    target: '초등 3~6학년',
    tech: ['JavaScript', 'Three.js', 'Cloudflare Pages/Functions/KV'],
    image: '/images/portfolio/teeshot.webp',
    url: 'https://teeshot-island.pages.dev/',
  },
  {
    slug: 'michyeonsang',
    name: '미현상 未現像',
    subject: '학습 방탈출',
    category: '국어·통합',
    tagline: '힌트를 사려면 교과 문제를 맞혀야 합니다',
    description:
      '1인칭 3D 방탈출 다섯 편입니다. 한 건물을 10년씩 거슬러 올라가며 1987 사진관·1997 헌책방·2007 비디오 대여점·2017 철거 현장을 지나고, 시즌 2 《밤차》는 새벽 3시 달리는 열차 안에서 시작합니다. 이번엔 뒤칸에도 갇힌 사람이 있어, 인터폰으로 서로가 본 것을 읽어 줘야 둘 다 나갈 수 있습니다. 풀어야 다음으로 가는 구조라 찍어 맞히기로는 못 넘어갑니다.',
    features: [
      '다섯 편 · 한 편에 방 3칸·자물쇠 12개 · 제한 60분(무제한 모드 있음)',
      '힌트 3단계 — 1·2·3단계에 교과 문제 1·2·3문항을 맞혀야 열림(오답 페널티 0)',
      '문제은행 132문항 · 6영역 각 22문항(수 패턴 · 공간·도형 추론 · 논리 추론 · 언어 추론 · 과학 · 역사·지리)',
      '시즌 2는 «전달» — 내가 본 것 중에서 골라 읽어 주면 저쪽 자물쇠가 열린다. 자유 입력 채팅이 아니다',
      '눈으로 본 것만으로 풀리게 했다 — 소리 단서에는 전부 화면 표시가 붙어 있다',
      '계정·로그인 없음 · 외부 요청 0건(게이트가 매 배포마다 잰다) · 진행은 기기에만 저장',
    ],
    target: '초등 고학년~중학생',
    tech: ['JavaScript', 'Three.js', 'Vercel'],
    image: '/images/portfolio/michyeonsang.webp',
    url: 'https://michyeonsang.vercel.app/',
  },
];
