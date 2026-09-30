# 정보부 업무 관리 시스템

구글 공유 시트에 있는 정보부 데이터를 **화면에 보여주고 · 시트로 바로 이동하고 · 전자기기 대여를 간편하게 기록**하는 웹앱.
관리자가 승인한 교직원만 접속할 수 있고, 한 번 로그인한 기기에서는 다시 묻지 않는다.

## 바로 실행 (데모 모드)

```bash
npm install
npm run dev        # http://localhost:5173
```

`.env` 가 없으면 **데모 모드**로 뜬다. 로그인 화면의 데모 계정(한나라=관리자, 오하늘=일반, 대기중=미승인)을 누르면 된다.
데모 데이터는 [src/data/demo.js](src/data/demo.js) 한 곳에 있고, 여기서 데모 시트와 seed.sql 이 생성된다.

```bash
npm run make:demo  # demo/정보부_업무관리_데모시트.xlsx + supabase/seed.sql 재생성
```

## 구조

```
shared/sheet-schema.js        시트 탭 ↔ DB 테이블 ↔ 열 정의 (단일 진실 공급원)
src/data/demo.js              데모 데이터
src/lib/auth.jsx              로그인·승인 (Supabase Auth / 데모)
src/lib/data.js               데이터 API (Supabase 뷰 / 데모 메모리)
src/pages/*                   화면 (홈·메뉴얼·연락망·Goedu·전자기기·에듀테크·교직원별·반별·대여·관리자)
supabase/migrations/0001_schema.sql   테이블·뷰·RLS
supabase/seed.sql             데모 seed (생성 파일)
netlify/functions/sync-sheets-scheduled.mts   10분마다 시트 → DB
netlify/functions/sync-sheets.mts             관리자 "지금 동기화"
netlify/functions/rental.mts                  대여 추가·반납 (시트 먼저, DB 다음)
netlify/lib/google-sheets.mts                 Sheets API (서비스 계정)
demo/정보부_업무관리_데모시트.xlsx             구글 시트에 올릴 데모 파일
```

## 데이터 흐름 (핵심 결정)

- **구글 시트가 단일 진실 공급원.** Supabase 는 시트의 읽기 캐시 + 로그인/승인 저장소.
- 동기화 함수가 10분마다 탭을 읽어 테이블을 **통째로 교체**한다(시트에 없는 행은 삭제). 그래서 앱에서 하는 모든 쓰기(대여 기록, 메뉴얼, 표 셀 편집)는 **시트에 먼저 쓰고 DB 에 반영**한다 — 순서가 바뀌면 다음 동기화 때 앱에서 고친 내용이 지워진다.
- **표 셀 편집**: 거의 모든 표에서 셀을 누르면 바로 고칠 수 있다([DataTable.jsx](src/components/DataTable.jsx)의 `column.editable`). 한 함수([cell.mts](netlify/functions/cell.mts))가 `shared/sheet-schema.js` 정의만 보고 모든 표를 처리한다 — 열이 `type:'int'`/`'date'`면 그에 맞게 바꾸고, `ref`가 있으면(사용자·확인자·학번 등) 자연키 텍스트를 찾아 id 로 바꿔 넣는다. 다른 표에서 **조인해서 보여주는 열**(예: 노트북 표의 "부서")은 그 표 자신의 열이 아니라서 편집할 수 없다 — 원본 표(교직원 검색)에서 고쳐야 한다.
- 시트에는 이름·학번·"학년-반" 같은 **자연키**로 적고, 동기화가 `staff.id` / `students.id` / `classrooms.id` 로 바꿔 넣는다. 사람이 id 를 몰라도 되게 하기 위함.
- 관계 허브는 `staff`(교직원) · `students`(학생) · `classrooms`(학급). 노트북은 `staff_id` 가 비면 "보유 노트북", 보관함은 `classroom_id` 가 비면 "보유 보관함"으로 화면이 나뉜다. 상세는 [0001_schema.sql](supabase/migrations/0001_schema.sql) 머리의 관계도 참고.
- goedu 관리자 계정·학교 공용 메일 비밀번호는 시트에 넣지 않고 `admin_notes`(관리자만 RLS 로 읽기)에만 둔다.

## 실제 운영으로 전환

1. **구글 시트**: `demo/정보부_업무관리_데모시트.xlsx` 를 드라이브에 올려 Google Sheets 로 연 뒤 실제 데이터로 채운다. 탭 이름과 1행 머리글은 바꾸지 않는다(열 추가는 자유). 안내 탭에 규칙이 적혀 있다.
2. **Supabase** 프로젝트 생성 → SQL Editor 에서 `0001_schema.sql` 실행 (테스트용이면 `seed.sql` 도).
   - Authentication → Providers 에서 Google 켜기 (goedu 계정 로그인용). 이메일/비밀번호도 켜 두면 예비용으로 쓸 수 있다.
   - 첫 관리자: 한 번 로그인한 뒤 SQL 로 `update profiles set approved=true, role='admin' where email='...';`
3. **서비스 계정**: GCP 콘솔 → 서비스 계정 생성 → JSON 키 발급 → 그 `client_email` 에 시트를 **편집자**로 공유. Sheets API 활성화.
4. **Netlify**: 저장소 연결 후 환경변수 설정 (`.env.example` 참고). 배포되면 스케줄 함수가 돌기 시작한다. 관리자 화면의 "시트 지금 동기화"로 즉시 확인.

## 스택 선택에 대해

Supabase + Netlify 로 만들었다. 이 조합이 맞다고 본 이유와, 다른 선택지:

- **Supabase**: 승인제 로그인(Google OAuth + `profiles.approved`)과 RLS 를 거의 공짜로 얻는다. 시트를 그대로 읽으면 학교 연락망·보관함 비번이 링크만으로 노출되므로, DB 캐시 + 인증 계층이 필요하다.
- **Netlify**: 정적 호스팅 + 스케줄 함수(시트 동기화) 가 한 곳에서 된다. Vercel 도 동일하게 가능.
- **대안 – Google Apps Script 웹앱**: 시트에 딱 붙고 서버 비용이 없지만, "승인한 사람만" 제어가 느슨하고 화면 응답이 느리다. 이전 프로젝트(수행평가 앱)처럼 시트 소유자 한 명이 다 관리하는 경우엔 여전히 유효한 선택.
- **대안 – 동기화 대신 시트 직접 읽기**: 인증된 사용자만 함수가 시트를 읽어 주는 방식도 가능하지만, 매 화면마다 Sheets API 를 부르면 느리고 할당량에 걸린다. 캐시(DB)가 낫다.
- **양방향 동기화(시트 ↔ DB) 는 일부러 안 했다.** 대여 기록만 앱에서 쓰고, 그것도 시트에 먼저 쓴다. 나중에 앱에서 편집할 표가 늘면 그때 그 표만 같은 패턴(시트 먼저 → DB)으로 확장하면 된다.

## 디자인

`.design/` 의 토큰과 스타일 가이드를 그대로 따른다: Pretendard, 보라 포인트 `#7132f5`, 좌측 고정 사이드바(248px, 1280px 이하는 떠 있는 도크, 손잡이로 접기), 4px 간격 배수, 44px 터치 영역, 이모지 대신 SVG 아이콘.
