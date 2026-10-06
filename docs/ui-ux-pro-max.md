# ui-ux-pro-max 스킬 안내서

## 1. 무엇을 설치했나

[ui-ux-pro-max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) 는 Claude 가 화면을 만들거나 고칠 때 참고하는 **디자인 자료집 + 검색 스크립트**다.
`npx ui-ux-pro-max-cli init --ai claude` 로 설치했고, **전역**으로도 복사해 뒀다 — `C:\Users\comsc\.claude\skills\ui-ux-pro-max\`.
전역 사본이 있으면 **다른 모든 프로젝트에서도** 같은 스킬을 바로 쓸 수 있다 (프로젝트별로 다시 설치할 필요 없음).
이 프로젝트용 사본은 `.claude/skills/ui-ux-pro-max/` 에 그대로 남아 있다 (두 사본은 지금 내용이 같다 — 아래 "두 사본 관리" 참고).

| 폴더 | 내용 | 비고 |
|---|---|---|
| `ui-ux-pro-max/` | **핵심.** UI 스타일 79종, 팔레트 192종, 폰트 조합 74종, UX 가이드라인 119개, 차트 25종, 아이콘 105개, 스택별 구현 가이드 22종. `scripts/search.py` 로 검색 | Python 3 필요 (설치됨: 3.12) |
| `design/` | 로고·CI·배너·아이콘·소셜 이미지 생성 | **Gemini API 키 필요**, `pip install google-genai pillow`, playwright. 이 프로젝트에선 안 씀 |
| `design-system/` | 디자인 토큰 3계층(원시→의미→컴포넌트) 설계, 컴포넌트 스펙 | 외부 의존 없음 |
| `ui-styling/` | shadcn/ui + Tailwind 기반 UI | 이 앱은 Tailwind 를 안 쓰므로 해당 없음 |
| `brand/` | 브랜드 보이스·메시지 프레임워크 | 외부 의존 없음 |
| `slides/` | Chart.js HTML 프레젠테이션 | 외부 의존 없음 |
| `banner-design/` | 소셜/광고 배너 시안 | `design` 스킬에 기대므로 Gemini 키 필요 |

설치기가 7개를 한꺼번에 넣는다. **피드백 모드 연결과 이 앱 작업에 실제로 쓰는 건 `ui-ux-pro-max` 하나**다. 나머지는 지워도 되고,
두면 Claude 가 요청 내용에 따라 알아서 고른다 (예: "발표 슬라이드 만들어줘" → `slides`).

데이터는 전부 로컬 CSV 이고 검색은 네트워크 없이 돈다. `design`/`banner-design` 의 이미지 생성만 외부 API 를 부른다.

## 2. 호출하는 법

네 가지 길이 있다. 보통은 ①로 충분하다. 전역 설치돼 있으므로 아래는 **어떤 프로젝트에서나** 그대로 된다.

### ① 트리거 단어로 (자동 호출)

**"디자인 시안"** 이라는 말이 들어가면 이 스킬이 호출된다. "UI 시안", "디자인 추천" 도 같이 걸린다.

- "로그인 화면 디자인 시안 2개만 줘"
- "이 카드 UI 시안 다르게 짜줘"
- "여기 디자인 추천해줘"

### ② Claude 에게 말로 (자동 호출, 트리거 단어 없이도)

화면의 **모양·배치·동작·느낌**에 대한 요청이면 Claude 가 스스로 이 스킬을 쓴다. 꼭 "디자인 시안"이라고 안 해도 된다.

- "반납하기 화면 UX 점검해줘"
- "보유 현황 표가 답답한데 여백 어떻게 잡는 게 좋아?"
- "연도별 보유 추이를 차트로 보여주려면 어떤 차트가 맞아?"
- "이 버튼 색이 배경이랑 안 어울려. 대안 줘"

명시적으로 부르려면 채팅에 `/ui-ux-pro-max` 를 치고 뒤에 요청을 쓴다: `/ui-ux-pro-max 대여 화면 모바일 UX 점검`

### ③ 피드백 모드에서 (화면 위에서 바로)

개발 서버 화면 우하단 "피드백" → 요소 클릭 → **"디자인 추천 받기"** 체크 → 보내기.
다음 세션(또는 "피드백 모드 처리해줘")에서 Claude 가 이 스킬로 검색해 **후보 2~3개를 먼저 보여 주고**, 고른 것만 반영한다.
자세한 흐름은 [tools/feedback-mode/GUIDE.md](../tools/feedback-mode/GUIDE.md) 9번.

### ④ 터미널에서 직접 검색

Claude 없이 자료만 보고 싶을 때. 프로젝트 폴더에서:

```powershell
python .claude\skills\ui-ux-pro-max\scripts\search.py "dense admin table spacing" --domain ux -n 3
python .claude\skills\ui-ux-pro-max\scripts\search.py "purple accent light admin" --domain color -n 3
python .claude\skills\ui-ux-pro-max\scripts\search.py "korean sans readable dashboard" --domain typography -n 3
python .claude\skills\ui-ux-pro-max\scripts\search.py "yearly trend comparison" --domain chart -n 3
```

- 검색어는 **영어**로 (데이터가 영어). 한국어로 넣으면 거의 안 잡힌다.
- `--domain` 선택: 색/대비 `color` · 글꼴 `typography` · 차트 `chart` · 아이콘 `icons` · 여백/배치/표/폼/터치/접근성 `ux` · 분위기 전체 `style` · 랜딩 구조 `landing` · 제품 유형 `product` · 애니메이션 `gsap`
- React 구현 세부: `--stack react` (예: `"table virtualization" --stack react`)
- `-n` 결과 수(기본 3, 최대 20), `--json` JSON 출력, `--full` 긴 필드 자르지 않음
- `python` 이 "Python" 만 찍고 끝나면 스토어 껍데기다. 터미널을 새로 열거나 전체 경로 `C:\Users\comsc\AppData\Local\Programs\Python\Python312\python.exe` 를 쓴다.

## 3. 이 프로젝트에서의 활용 원칙

- **`--design-system`(전체 테마 추천)은 쓰지 않는다.** 이 앱으로 돌려 보면 Glassmorphism 다크 테마 + Fira Code 가 나온다. SaaS 랜딩용 추천이라
  교내 업무용 표·폼 화면과 맞지 않는다. 항목별 `--domain` 검색만 쓴다.
- 검색 결과는 **기존 토큰 안에서 번역**한다. 색은 `src/styles.css` 의 `:root` (`--purple`, `--ink*`, `--surface*`, `--fs-*`, `--radius-*`)에 맞추고,
  새 팔레트나 새 폰트를 끌어오는 제안은 뒤로 둔다. 현재 글꼴은 Pretendard 다.
- CLAUDE.md 의 Surgical Changes 원칙이 우선이다. 스킬이 "이것도 저것도 고치라"고 해도 **요청한 요소만** 고친다.
- 점검(접근성·타이포·색 대비)은 이미 있는 `better-*` 스킬과 겹친다. 둘 다 있으면 `better-*` 는 **판정**(막아야 하는지), ui-ux-pro-max 는 **대안 후보**로 역할을 나눈다.

## 4. 활용 예시

| 상황 | 말하는 법 | 스킬이 하는 일 |
|---|---|---|
| 표가 빽빽해 보임 | "보유 현황 표 여백이 답답해. 대안 줘" | `ux` 에서 touch spacing·table handling 가이드 검색 → 기존 `--fs-*`/padding 토큰으로 후보 2~3개 |
| 색 조합 고민 | "반납 완료 배지 초록이 보라 테마랑 안 맞아" | `color` 검색 → `--green`/`--purple` 관계에서 대비 4.5:1 지키는 후보 |
| 차트 추가 | "연도별 보유 현황 추이 차트, 어떤 종류?" | `chart` 에서 trend/comparison 차트 추천 + 범례·툴팁·색맹 대응 체크 |
| 모바일 UX | "대여 화면 복도에서 태블릿으로 쓰기 편하게" | `ux` touch target 44px·safe area·loading feedback 검색 → 해당 버튼만 수정 |
| 출시 전 점검 | "배포 전에 전체 화면 UI 체크리스트 돌려줘" | SKILL.md 의 Pre-Delivery Checklist (포커스 링, 대비, reduced-motion, 375/768/1024/1440) 로 점검 |

## 5. 다른 프로젝트에서 쓰기 (이미 전역 설치됨)

`C:\Users\comsc\.claude\skills\ui-ux-pro-max\` 에 있으므로 **아무 프로젝트를 열어도 따로 설치할 필요 없이** 바로 "디자인 시안" 같은 말로 호출된다.
Python 3 도 PC 전역에 설치돼 있어 (`winget install Python.Python.3.12`) 어느 프로젝트에서나 `python` 으로 검색 스크립트가 돈다.

프로젝트마다 다르게 챙겨야 할 것:

1. **토큰 번역 기준**: 이 문서 3번(활용 원칙)의 "결과는 기존 토큰 안에서 번역" 은 프로젝트마다 그 프로젝트의 CSS 변수/디자인 토큰으로 바꿔 적용해야 한다.
   새 프로젝트라 아직 토큰이 없으면 반대로 `--design-system -p "앱 이름"` 으로 시작점을 잡고, `--persist --output-dir .` 로
   `design-system/<앱>/MASTER.md` 에 저장해 두면 다음 세션에서도 같은 기준을 쓴다.
2. **CLAUDE.md 에 원칙 한 줄**(선택): "UI 추천은 ui-ux-pro-max `--domain` 검색만 쓰고 `--design-system` 은 쓰지 않는다. 결과는 기존 토큰 안에서 번역."
   — 이미 토큰 체계가 잡힌 프로젝트에서만 넣는다.
3. **피드백 모드**를 그 프로젝트에도 두려면 [tools/feedback-mode/GUIDE.md](../tools/feedback-mode/GUIDE.md) 7번대로 `tools/feedback-mode/` 폴더를 복사한다 —
   "디자인 추천 받기" 체크박스가 전역 ui-ux-pro-max 와 자동으로 연결된다. (feedback_mode 스킬도 이미 전역 설치돼 있다: `C:\Users\comsc\.claude\skills\feedback_mode\`.)
4. **업데이트**: ui-ux-pro-max CLI 가 새 버전을 낼 때마다 `npx --yes ui-ux-pro-max-cli init --ai claude` 를 **전역 스킬 폴더가 있는 쪽**에서 한 번
   돌리고(또는 이 전역 사본에 덮어쓰기), 이 프로젝트 사본(`.claude/skills/ui-ux-pro-max/`)에도 다시 복사해 둔다 — 두 사본이 자동으로 동기화되진 않는다.

## 6. 문제 해결

| 증상 | 확인 |
|---|---|
| `/ui-ux-pro-max` 를 쳐도 반응 없음 | 스킬은 세션 시작 때 읽힌다 → Claude Code 새 세션. `.claude/skills/ui-ux-pro-max/SKILL.md` 존재 확인 |
| search.py 가 "Python" 만 찍고 끝남 | 스토어 껍데기. 터미널 새로 열기 또는 전체 경로(2-③) |
| 결과가 0건 | 검색어를 영어로, 더 짧게. `--domain` 을 바꿔 본다 (`ux` 가 가장 넓다) |
| 추천이 이 앱과 안 맞음(다크·글래스) | `--design-system` 을 쓴 것. `--domain` 으로 바꾸고 기존 토큰으로 번역 |
| `design` 스킬이 API 키를 요구 | 로고/배너 생성은 Gemini 키가 필요. 이 프로젝트에선 쓰지 않음 — 폴더를 지워도 된다 |
