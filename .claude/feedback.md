# 화면 피드백

앱의 "피드백" 모드에서 보낸 요청이 아래에 쌓인다. 처리하면 `[ ]` 를 `[x]` 로 바꾸고 한 줄로 무엇을 했는지 적는다.
(Claude: 세션 시작 때 이 파일에 `[ ]` 가 있으면 먼저 읽고 처리할 것.)

## 2026. 10. 1. 19시 53분 46초 · /devices/inventory/all
- 종류: 메모
- 요소: span.count  (글자: "총 1,431대")
- 위치: main#main > div.content.fade > div.table-tools:nth-of-type(3) > span.count
- 메모: 삭제
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 총 대수 표시(span.count) 삭제 — src/pages/Devices.jsx InventoryOverview

## 2026. 10. 1. 19시 54분 12초 · /devices/inventory/all
- 종류: 메모
- 요소: select#inv-year
- 위치: main#main > div.content.fade > div.table-tools:nth-of-type(3) > select#inv-year
- 메모: 2026 만 적기
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 기준연도 옵션을 "2026", "2025" 로 표시 — src/pages/Devices.jsx (2025 선택 시 배너는 "2025년 제출본" 유지)

## 2026. 10. 1. 19시 57분 49초 · /devices/inventory/desktop
- 종류: 메모
- 요소: textarea#:r1:
- 위치: main#main > div.content.fade > div.table-tools:nth-of-type(3) > form.search-form.search-form-narrow > div.search > textarea#:r1:
- 메모: 입력창 안에 적혀져 있는 텍스트를 줄여서 텍스트 입력창이 한 줄로 보이도록. 모든 입력창 적용
- 화면: 정보부 업무 관리 · 1707×959
- 상태: [x] 처리됨 — 검색창 placeholder 단축(ClassManage·Devices·Rentals·Admin) — 모든 화면·3개 폭·추가 폼/대여·반납 폼/로그인 포함 23종 한 줄 확인

## 2026. 10. 1. 19시 58분 57초 · /devices/inventory/laptop
- 종류: 메모
- 요소: button.btn.sm:nth-of-type(2)  (글자: "수정")
- 위치: main#main > div.content.fade > section > div.table-tools:nth-of-type(2) > div.crud-bar > button.btn.sm:nth-of-type(2)
- 메모: 추가, 수정, 삭제 텍스트 옆에 쓸 아이콘을 디자인 시안 추천
- 디자인 추천: 요청
- 화면: 정보부 업무 관리 · 1707×959
- 상태: [x] 처리됨 — 4번-1 채택: 버튼마다 아이콘(＋ ✎ 🗑), 글자는 "수정"/"삭제" 그대로이고 켜지면 아이콘만 ✓ — src/components/Icons.jsx(Pencil·Trash), DataTable.jsx

## 2026. 10. 1. 19시 59분 45초 · /devices/inventory/laptop
- 종류: 메모
- 요소: select#unit-sort
- 위치: main#main > div.content.fade > section > div.table-tools:nth-of-type(1) > select#unit-sort
- 메모: default는 ip번호 순으로
- 화면: 정보부 업무 관리 · 1707×959
- 상태: [x] 처리됨 — 개별 장비 카드는 이미 IP주소순이 기본이라 변경 없음 + 교원용/보유 노트북 IP대장 표도 IP 번호 순(빈 IP는 맨 뒤)으로 정렬 — src/pages/Devices.jsx Laptops

## 2026. 10. 1. 20시 0분 36초 · /devices/inventory/laptop
- 종류: 메모
- 요소: button.btn.btn-secondary  (글자: "닫기")
- 위치: main#main > div.content.fade > section > div.table-tools:nth-of-type(1) > button.btn.btn-secondary
- 메모: 삭제하고, 표를 펼쳤다 닫았다 할 수 있도록 하는 디자인 시안 추천
- 디자인 추천: 요청
- 화면: 정보부 업무 관리 · 1707×959
- 상태: [x] 처리됨 — 6번-1 채택: "닫기" 삭제, 제목(▾)을 눌러 표 접기·펼치기, 제목에 대수 표시 없음, 정렬 기본 IP주소순 — src/pages/Devices.jsx UnitsCard, src/styles.css(.collapse/.tg)

## 2026. 10. 1. 20시 1분 42초 · /devices/inventory/cabinet
- 종류: 메모
- 요소: div.chipset
- 위치: main#main > div.content.fade > div.table-tools:nth-of-type(3) > div.tool-extra:nth-of-type(1) > div.chipset
- 메모: 이 요소들을 감쌀 디자인 시안 추천. 모든 함께 볼 정보에 적용할 것.
- 디자인 추천: 요청
- 화면: 정보부 업무 관리 · 1707×959
- 상태: [x] 처리됨 — 7번-1 채택: "함께 볼 정보" 라벨과 칩을 연한 테두리 상자(.chipset-box)로 묶음, 모든 화면에 적용 — src/components/DataTable.jsx ChipToggle, src/styles.css

## 2026. 10. 1. 21시 53분 31초 · /staff
- 종류: 메모
- 요소: p.crud-hint.muted  (글자: "수정 중 — 고칠 칸을 누르세요. 끝나면 위의 '수정'을 다시 누르세요.")
- 위치: main#main > div.content.fade > p.crud-hint.muted
- 메모: 수정, 삭제 버튼 눌렀을 때 보이는 텍스트를 감쌀 레이아웃 디자인 시안 추천
- 디자인 추천: 요청
- 화면: 정보부 업무 관리 · 1707×959
- 상태: [x] 처리됨 — A-1 채택(끝내기 버튼 없이): 수정/삭제를 켜면 표 위에 상태 띠(보라/빨강, 아이콘, "수정 중"/"삭제 중" + 안내 글자), 모든 수정·삭제 버튼 화면에 적용 — src/components/DataTable.jsx, src/styles.css(.mode-banner)

## 2026. 10. 1. 21시 54분 58초 · /rentals/tablet/student
- 종류: 메모
- 요소: div.mc-b:nth-of-type(2)
- 위치: main#main > div.content.fade > div.mc-b:nth-of-type(2)
- 메모: 레이아웃 디자인 시안 추천해줘
- 디자인 추천: 요청
- 화면: 정보부 업무 관리 · 1707×959
- 상태: [x] 처리됨 — A-2 채택: 폴더 탭 카드(큰 탭=폴더 탭, 하위=밑줄 글자 탭, 하위 없으면 얇은 줄), 대여의 "대여" 카드는 합치지 않고 따로 유지 — src/components/PageHeader.jsx FolderTabs, Devices.jsx·Rentals.jsx Section, src/styles.css(.folder/.ftab/.utab). 메뉴얼(카테고리 12개)과 대여·반납 폼의 선택 타일은 범위 밖이라 그대로

## 2026. 10. 1. 22시 21분 29초 · /devices/inventory/all
- 종류: 메모
- 요소: div.mc-b:nth-of-type(2)
- 위치: main#main > div.content.fade > div.mc-b:nth-of-type(2)
- 메모: 카드 영역 안의 카테고리와 하위 카테고리 모양이 이상해. 디자인 시안 추천
- 디자인 추천: 요청
- 화면: 정보부 업무 관리 · 1707×959
- 상태: [x] 처리됨 — A-2 채택: 폴더 탭 카드(큰 탭=폴더 탭, 하위=밑줄 글자 탭, 하위 없으면 얇은 줄), 대여의 "대여" 카드는 합치지 않고 따로 유지 — src/components/PageHeader.jsx FolderTabs, Devices.jsx·Rentals.jsx Section, src/styles.css(.folder/.ftab/.utab). 메뉴얼(카테고리 12개)과 대여·반납 폼의 선택 타일은 범위 밖이라 그대로

## 2026. 10. 1. 22시 21분 51초 · /devices/cabinets/class
- 종류: 메모
- 요소: p.muted.small  (글자: "반별 태블릿 보관함 — 학년 / 반 / 위치 / 비번")
- 위치: main#main > div.content.fade > div.page-head:nth-of-type(3) > p.muted.small
- 메모: 삭제
- 화면: 정보부 업무 관리 · 1707×959
- 상태: [x] 처리됨 — 안내 문구(p.page-head) 삭제 — src/pages/Devices.jsx ClassCabinets

## 2026. 10. 1. 22시 22분 2초 · /devices/cabinets/class
- 종류: 메모
- 요소: span.count  (글자: "30건")
- 위치: main#main > div.content.fade > div.table-tools:nth-of-type(4) > span.count
- 메모: 삭제
- 화면: 정보부 업무 관리 · 1707×959
- 상태: [x] 처리됨 — "N건" 개수 삭제(반별 태블릿 보관함) — ClassTable 에 showCount 옵션 추가, src/pages/ClassManage.jsx · Devices.jsx

## 2026. 10. 1. 22시 22분 17초 · /devices/cabinets/stock
- 종류: 메모
- 요소: p.muted.small  (글자: "보유 태블릿 보관함 — 반에 배정되지 않은 예비 보관함")
- 위치: main#main > div.content.fade > div.page-head:nth-of-type(3) > p.muted.small
- 메모: 삭제
- 화면: 정보부 업무 관리 · 1707×959
- 상태: [x] 처리됨 — 안내 문구 삭제 — src/pages/Devices.jsx StockCabinets

## 2026. 10. 1. 22시 22분 50초 · /devices/tablets/stock
- 종류: 메모
- 요소: div.chipset.chipset-box
- 위치: main#main > div.content.fade > div.table-tools:nth-of-type(3) > div.tool-extra:nth-of-type(1) > div.chipset.chipset-box
- 메모: 이 카드 영역을 이런 체크하는 게 있는 곳에 모두 적용
- 화면: 정보부 업무 관리 · 1707×959
- 상태: [x] 처리됨 — "함께 볼 정보" 칩 상자는 이미 모든 화면에 적용돼 있고, 같은 방식의 선택 묶음인 "학년 필터"(GradePills)에도 같은 카드 상자+라벨 적용 — src/components/DataTable.jsx

## 2026. 10. 1. 22시 24분 30초 · /rentals/tablet/student
- 종류: 메모
- 요소: button.btn.sm  (글자: "수정")
- 위치: main#main > div.content.fade > div.table-tools:nth-of-type(3) > div.crud-bar > button.btn.sm
- 메모: 삭제
- 화면: 정보부 업무 관리 · 1707×959
- 상태: [x] 처리됨 — 대여 표의 수정 버튼 삭제 → 버튼 없는 읽기 전용 표(crud={{}}) — src/pages/Rentals.jsx, DataTable.jsx. 고칠 때는 시트에서

## 2026. 10. 2. 9시 6분 9초 · /devices/inventory/all
- 종류: 메모
- 요소: div.folder:nth-of-type(2)
- 위치: main#main > div.content.fade > div.folder:nth-of-type(2)
- 메모: 카테고리 아래의 내용과 너무 동떨어져 보이는 디자인이 되었는데, 디자인 시안 추천
- 디자인 추천: 요청
- 화면: 정보부 업무 관리 · 1707×959
- 상태: [x] 처리됨 — F-3 채택 + 카드 안에 넣기: 폴더 탭 8px 아래에 카드(TabCard)를 만들어 위치 제목줄("태블릿 › 학생 대여") → 도구줄 → 표(카드 폭 끝까지)를 담음. 전자기기·대여·Goedu·반별 관리 모두 적용 — src/components/PageHeader.jsx TabCard, src/styles.css(.tabcard/.crumb), DataTable.jsx(오른쪽 도구 묶음 .tools-right)

## 2026. 10. 2. 9시 29분 45초 · /manage/class/tv
- 종류: 메모
- 요소: div.fpanel.empty
- 위치: main#main > div.content.fade > div.folder:nth-of-type(2) > div.fpanel.empty
- 메모: 하위 카테고리가 없는 경우, 카드에 도구줄을 여기에 포함하기. 표는 따로.
- 화면: 정보부 업무 관리 · 1707×959
- 상태: [x] 처리됨 — 도구줄 카드와 표 카드를 따로 분리: 탭(또는 하위 탭 상자) 아래 [도구줄 카드: 위치 제목줄+도구줄] → [표 카드]. 하위 카테고리가 없으면 얇은 빈 상자를 없애고 도구줄 카드가 탭에 바로 붙음 — src/components/PageHeader.jsx(TabCard/TabCrumb/FolderTabs nosub), DataTable.jsx(.tools-card), Devices.jsx·Goedu.jsx, src/styles.css

## 2026. 10. 2. 9시 30분 20초 · /rentals/other/student
- 종류: 메모
- 요소: section.tabcard:nth-of-type(2)
- 위치: main#main > div.content.fade > section.tabcard:nth-of-type(2)
- 메모: 도구줄과 표 카드 따로
- 화면: 정보부 업무 관리 · 1707×959
- 상태: [x] 처리됨 — 도구줄 카드와 표 카드를 따로 분리: 탭(또는 하위 탭 상자) 아래 [도구줄 카드: 위치 제목줄+도구줄] → [표 카드]. 하위 카테고리가 없으면 얇은 빈 상자를 없애고 도구줄 카드가 탭에 바로 붙음 — src/components/PageHeader.jsx(TabCard/TabCrumb/FolderTabs nosub), DataTable.jsx(.tools-card), Devices.jsx·Goedu.jsx, src/styles.css

## 2026. 10. 2. 9시 30분 57초 · /devices/inventory/all
- 종류: 메모
- 요소: section.tabcard
- 위치: main#main > div.content.fade > section.tabcard
- 메모: 도구줄 따로 카드, 표 따로
- 화면: 정보부 업무 관리 · 1707×959
- 상태: [x] 처리됨 — 도구줄 카드와 표 카드를 따로 분리: 탭(또는 하위 탭 상자) 아래 [도구줄 카드: 위치 제목줄+도구줄] → [표 카드]. 하위 카테고리가 없으면 얇은 빈 상자를 없애고 도구줄 카드가 탭에 바로 붙음 — src/components/PageHeader.jsx(TabCard/TabCrumb/FolderTabs nosub), DataTable.jsx(.tools-card), Devices.jsx·Goedu.jsx, src/styles.css

## 2026. 10. 2. 9시 47분 3초 · /goedu/teachers
- 종류: 메모
- 요소: span.count  (글자: "15건")
- 위치: main#main > div.content.fade > section.tabcard > div.tools-card:nth-of-type(1) > div.table-tools > span.count
- 메모: 삭제
- 화면: 정보부 업무 관리 · 1707×959
- 상태: [x] 처리됨 — 교사 가입현황 "N건" 삭제 (Goedu.jsx showCount={false})

## 2026. 10. 2. 9시 49분 22초 · /goedu/teachers
- 종류: 메모
- 요소: p  (글자: "교육청 Google Workspace(Goedu) 계정 현황과 관리자용 안내.")
- 위치: main#main > div.content.fade > div.page-head:nth-of-type(1) > div:nth-of-type(1) > p
- 메모: 삭제
- 화면: 정보부 업무 관리 · 1707×959
- 상태: [x] 처리됨 — Goedu 페이지 설명 문구 삭제 (Goedu.jsx PageHeader)

## 2026. 10. 2. 9시 49분 59초 · /goedu/admin
- 종류: 메모
- 요소: p.muted.small  (글자: "메뉴얼의 Goedu 카테고리와 같은 글입니다. 어느 쪽에서 쓰거나 고치거나 지워도 양쪽에 똑같이 반영됩니다.")
- 위치: main#main > div.content.fade > section.tabcard > div.manual-list > p.muted.small
- 메모: 삭제
- 화면: 정보부 업무 관리 · 1707×959
- 상태: [x] 처리됨 — 관리자 메뉴얼 안내 문구(linked-note) 삭제 (Goedu.jsx, styles.css)

## 2026. 10. 2. 9시 50분 26초 · /goedu/admin
- 종류: 메모
- 요소: h2.section-title  (글자: "메뉴얼 게시글 (Goedu)")
- 위치: div.content.fade > section.tabcard > div.manual-list > div.tools-card > div.linked-head > h2.section-title
- 메모: 삭제
- 화면: 정보부 업무 관리 · 1707×959
- 상태: [x] 처리됨 — "메뉴얼 게시글 (Goedu)" 소제목 삭제 (Goedu.jsx)

## 2026. 10. 2. 9시 50분 58초 · /goedu/admin
- 종류: 메모
- 요소: span  (글자: "관리자 메뉴얼")
- 위치: div.content.fade > section.tabcard > div.manual-list > div.tools-card > h2.crumb > span
- 메모: 관리 콘솔 열기 버튼을 이 텍스트 오른쪽에 위치하도록 변경 후 버튼 좌측 정렬
- 화면: 정보부 업무 관리 · 1707×959
- 상태: [x] 처리됨 — "관리 콘솔 열기"(와 작성하기)를 "관리자 메뉴얼" 제목 오른쪽 같은 줄에 왼쪽 정렬로 이동 (Goedu.jsx .crumb-row, styles.css)

## 2026. 10. 2. 9시 51분 12초 · /goedu/students
- 종류: 메모
- 요소: p.muted.small  (글자: "학번(예: 21011, 30103) 또는 이름으로 검색.")
- 위치: main#main > div.content.fade > section.tabcard > div.tools-card:nth-of-type(1) > p.muted.small
- 메모: 삭제
- 화면: 정보부 업무 관리 · 1707×959
- 상태: [x] 처리됨 — 학생 가입현황 안내 문구 삭제 (Goedu.jsx, 쓰지 않게 된 DataTable note 속성도 제거)

## 2026. 10. 2. 9시 51분 17초 · /goedu/students
- 종류: 메모
- 요소: span.count  (글자: "121건")
- 위치: main#main > div.content.fade > section.tabcard > div.tools-card:nth-of-type(1) > div.table-tools > span.count
- 메모: 삭제
- 화면: 정보부 업무 관리 · 1707×959
- 상태: [x] 처리됨 — 학생 가입현황 "N건" 삭제 (Goedu.jsx showCount={false})

## 2026. 10. 2. 10시 0분 28초 · /manage/class/tv
- 종류: 메모
- 요소: div.chipset.chipset-box
- 위치: div.content.fade > section.tabcard > div.tools-card:nth-of-type(1) > div.table-tools > div.tool-extra:nth-of-type(1) > div.chipset.chipset-box
- 메모: 함께볼정보는 항상 표 바로 위에 위치하도록 만들고 싶은데, 디자인 시안 추천해줘
- 디자인 추천: 요청
- 화면: 정보부 업무 관리 · 1707×959
- 제안: A(표 머리띠) 선택됨
- 상태: [x] 처리됨 — "함께 볼 정보" 칩을 표 카드 맨 위 띠(.table-top)로 이동, 모든 칩 화면(교사 가입현황·반별 관리 3개·노트북 IP대장·보유 현황 노트북 등) 적용. 학년 알약은 도구줄에 그대로 — DataTable.jsx tableTop, ClassManage/Goedu/Devices.jsx, styles.css

## 2026. 10. 2. 10시 37분 5초 · /
- 종류: 메모
- 요소: header.topbar
- 위치: div#root > div.app > header.topbar
- 메모: 검은색 배경의 세로 길이를 지금의 2/3 길이로 변경
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 검은 배경(어두운 띠 42→28px, 카드 아래 여백 10→7px)을 2/3로 줄임, 흰 카드 높이는 그대로. 바 전체 120→103px(폰 108→93px), 로그아웃 버튼 높이 24px — styles.css

## 2026. 10. 2. 10시 37분 40초 · /
- 종류: 메모
- 요소: section.card:nth-of-type(3)
- 위치: main#main > div.content.fade > section.card:nth-of-type(3)
- 메모: 홈 메뉴에서 삭제
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 홈의 "미반납 대여" 카드 삭제 (Home.jsx, 쓰지 않게 된 대여 조회도 제거)

## 2026. 10. 2. 10시 37분 52초 · /
- 종류: 메모
- 요소: section:nth-of-type(2)
- 위치: main#main > div.content.fade > section:nth-of-type(2)
- 메모: 자주 쓰는 화면 삭제
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 홈의 "자주 쓰는 화면" 섹션 삭제 (Home.jsx)

## 2026. 10. 2. 10시 38분 17초 · /
- 종류: 메모
- 요소: p  (글자: "정보부 업무를 한 화면에서. 표는 구글 시트에서 자동으로 읽어 오고, 수정은 시트에서 하면 됩니다.")
- 위치: main#main > div.content.fade > div.page-head > div:nth-of-type(1) > p
- 메모: 삭제
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 홈 설명 문구 삭제 (Home.jsx)

## 2026. 10. 2. 10시 38분 45초 · /
- 종류: 메모
- 요소: span.mode-badge:nth-of-type(1)  (글자: "데모")
- 위치: div#root > div.app > header.topbar > div.topbar-strip:nth-of-type(1) > span.mode-badge:nth-of-type(1)
- 메모: 정보부 업무 관리 텍스트 오른쪽으로 위치 변경, 좌측 정렬
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — "데모" 배지를 흰 카드 안 "정보부 업무 관리" 오른쪽에 붙여 왼쪽 정렬 (Layout.jsx brand-wrap, styles.css)

## 2026. 10. 2. 10시 40분 13초 · /manage/class/tv
- 종류: 메모
- 요소: button.btn-outline-light  (글자: "로그아웃")
- 위치: div#root > div.app > header.topbar > div.topbar-strip:nth-of-type(1) > button.btn-outline-light
- 메모: 버튼 형태와 크기를 추가 버튼과 비슷하게 변경
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 로그아웃을 "추가" 버튼과 같은 .btn.sm.btn-toggle(흰 알약·테두리·아이콘+글자·12.5px 굵게)으로 변경, 높이만 28px(추가는 32px). 앞서 요청한 어두운 띠 2/3와 맞추려 띠를 28→32px, 카드 아래 여백 7→4px 로 조정(어두운 부분 합계 약 69%) — Layout.jsx, styles.css

## 2026. 10. 2. 10시 51분 17초 · /manage/class/tv
- 종류: 메모
- 요소: header.topbar
- 위치: div#root > div.app > header.topbar
- 메모: 검은색 영역 세로 길이가 하얀색 상단 바 세로 길이의 2/3 지점에서 끝나게
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 검은 배경이 흰 카드 높이의 2/3 지점에서 끝나도록 변경(카드 아래 1/3 은 밝은 배경 위로 걸침, 카드에 옅은 그림자). 띠 32px·카드 68px 유지, 바 전체 높이 100px(폰 90px) — styles.css .topbar hard-stop 그라디언트

## 2026. 10. 2. 11시 10분 40초 · /rentals/tablet/student
- 종류: 메모
- 요소: button.btn.btn-secondary  (글자: "검색")
- 위치: section.tabcard:nth-of-type(2) > div.tools-card:nth-of-type(1) > div.table-tools > div.tools-right > form.search-form.search-form-narrow > button.btn.btn-secondary
- 메모: 검색 버튼도 다른 버튼들과 비슷한 형태로 디자인 시안 추천. 지금은 정사각형임
- 디자인 추천: 요청
- 화면: 정보부 업무 관리 · 1280×719
- 제안: 후보 4개 제시 → 사용자가 3(입력칸과 한 몸) 선택(처음 추천안 1을 임시 적용했다가 3으로 교체)
- 상태: [x] 처리됨 — 검색 입력칸과 버튼을 알약 테두리 하나로 묶고, 버튼은 안쪽 오른쪽의 연한 보라 알약(32px, 글자만)으로 변경. 입력칸에 포커스가 가면 알약 테두리가 보라색. 도구줄 표 검색과 메뉴얼 검색에 적용(대여·반납 폼 안의 이름 찾기 버튼은 그대로). 폼이 테두리·여백을 가져 폭을 +8px — DataTable.jsx, Manuals.jsx, styles.css

## 2026. 10. 2. 11시 12분 24초 · /rentals/tablet/student
- 종류: 메모
- 요소: p.sub  (글자: "관리자가 승인한 교직원만 접속할 수 있습니다. 한 번 로그인하면 이 기기에서는 다시 묻지 않습니다.")
- 위치: div#root > div.auth > form.card.fade > div:nth-of-type(1) > p.sub
- 메모: 삭제
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 로그인 화면 안내 문구 삭제 (Login.jsx). 같은 .sub 스타일을 쓰는 승인 대기 화면(Pending.jsx)의 문구는 그대로

## 2026. 10. 2. 11시 53분 51초 · /manage/class/tv
- 종류: 메모
- 요소: a.btn.btn-secondary  (글자: "시트에서 열기")
- 위치: div.content.fade > section.tabcard > div.tools-card:nth-of-type(1) > div.table-tools > div.tools-right > a.btn.btn-secondary
- 메모: 이 시트에서 열기 버튼만 적용, 위치를 함께 볼 정보의 내선 연락망 버튼 오른쪽에 위치하도록 변경, 오른쪽 정렬
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — "시트에서 열기"를 도구줄에서 "함께 볼 정보" 띠로 옮겨 내선 연락망 칩 오른쪽, 띠 오른쪽 끝 정렬(32px 작은 버튼). 반별 관리 3화면만 적용 — DataTable.jsx sheetInTop, ClassManage.jsx, styles.css .table-top-sheet

## 2026. 10. 2. 11시 54분 9초 · /manage/class/cyber
- 종류: 메모
- 요소: a.btn.btn-secondary  (글자: "시트에서 열기")
- 위치: div.content.fade > section.tabcard > div.tools-card:nth-of-type(1) > div.table-tools > div.tools-right > a.btn.btn-secondary
- 메모: 이 시트에서 열기 버튼만 적용, 위치를 함께 볼 정보의 내선 연락망 버튼 오른쪽에 위치하도록 변경, 오른쪽 정렬
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — "시트에서 열기"를 도구줄에서 "함께 볼 정보" 띠로 옮겨 내선 연락망 칩 오른쪽, 띠 오른쪽 끝 정렬(32px 작은 버튼). 반별 관리 3화면만 적용 — DataTable.jsx sheetInTop, ClassManage.jsx, styles.css .table-top-sheet

## 2026. 10. 2. 11시 54분 23초 · /manage/class/cabinets
- 종류: 메모
- 요소: a.btn.btn-secondary  (글자: "시트에서 열기")
- 위치: div.content.fade > section.tabcard > div.tools-card:nth-of-type(1) > div.table-tools > div.tools-right > a.btn.btn-secondary
- 메모: 이 시트에서 열기 버튼만 적용, 위치를 함께 볼 정보의 내선 연락망 버튼 오른쪽에 위치하도록 변경, 오른쪽 정렬
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — "시트에서 열기"를 도구줄에서 "함께 볼 정보" 띠로 옮겨 내선 연락망 칩 오른쪽, 띠 오른쪽 끝 정렬(32px 작은 버튼). 반별 관리 3화면만 적용 — DataTable.jsx sheetInTop, ClassManage.jsx, styles.css .table-top-sheet

## 2026. 10. 2. 11시 54분 49초 · /manage/class/cabinets
- 종류: 메모
- 요소: h1  (글자: "반별 관리")
- 위치: main#main > div.content.fade > div.page-head:nth-of-type(1) > div:nth-of-type(1) > div.title-row > h1
- 메모: 모든 헤더 가운데 정렬
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 모든 페이지 제목(PageHeader)을 가운데 정렬. 제목·설명은 가운데, 오른쪽 시트 버튼은 오른쪽 끝, 폰 폭에선 모두 가운데 — PageHeader.jsx head-center, styles.css

## 2026. 10. 2. 12시 7분 43초 · /edutech
- 종류: 메모
- 요소: p  (글자: "학교에서 쓰는 에듀테크 도구 바로가기. 목록은 시트의 링크 탭(그룹: 에듀테크)에서 관리합니다.")
- 위치: main#main > div.content.fade > div.page-head.head-center:nth-of-type(1) > div:nth-of-type(1) > p
- 메모: 삭제
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 에듀테크 페이지 설명 문구 삭제 (Edutech.jsx)

## 2026. 10. 2. 12시 8분 48초 · /devices/cabinets/class
- 종류: 메모
- 요소: div.chipset.chipset-box
- 위치: div.content.fade > section.tabcard > div.tools-card:nth-of-type(1) > div.table-tools > div.tool-extra:nth-of-type(1) > div.chipset.chipset-box
- 메모: 이 카드에서 나오고, 함께 볼 정보의 위치로 바꾸기
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 학년 알약을 도구줄 카드에서 꺼내 표 위 띠(함께 볼 정보 자리)로 이동 — ClassManage.jsx tableTop

## 2026. 10. 2. 13시 13분 0초 · /devices/inventory/laptop
- 종류: 메모
- 요소: form.search-form.search-form-narrow
- 위치: div#:rf: > div > div.tools-card.plain:nth-of-type(1) > div.table-tools > div.tools-right > form.search-form.search-form-narrow
- 메모: 아래 표와 여백이 있게
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 개별 장비 카드의 도구줄과 표 사이를 12px 띄움 — Devices.jsx/styles.css .units-body

## 2026. 10. 2. 13시 13분 26초 · /devices/inventory/laptop
- 종류: 메모
- 요소: select#unit-sort
- 위치: main#main > div.content.fade > section.tabcard > section > div.table-tools:nth-of-type(1) > select#unit-sort
- 메모: 추가 버튼 왼쪽으로 위치 변경 후 좌측 정렬
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 정렬(라벨+선택)을 제목줄에서 표 도구줄의 왼쪽, 추가 버튼 왼쪽으로 이동 — Devices.jsx toolbar

## 2026. 10. 2. 13시 35분 28초 · /rentals/return
- 종류: 메모
- 요소: h2.section-title  (글자: "반납할 대여 찾기")
- 위치: main#main > div.content.fade > div.card.fade:nth-of-type(2) > h2.section-title
- 메모: 검색하기 로 텍스트 변경
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — "반납할 대여 찾기" → "검색하기" (Rentals.jsx)

## 2026. 10. 2. 13시 38분 58초 · /rentals/return
- 종류: 메모
- 요소: div
- 위치: main#main > div.content.fade > section.card > div
- 메모: 버튼들을 default 상태, hover상태, 클릭되었을 때 상태 나누어서 해줘. 지금은 반납하기 눌러도 대여하기가 보라색이라서 헷갈려
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 대여하기/반납하기를 선택형 버튼(.btn-choice)으로: 지금 보고 있는 쪽만 보라 채움(선택됨), 나머지는 흰 바탕. 기본/올림(회색)/누름(연보라)/선택됨 네 상태 — Rentals.jsx, styles.css. 홈 화면의 대여 카드는 그대로

## 2026. 10. 2. 13시 39분 17초 · /rentals/return
- 종류: 메모
- 요소: div.mc-grid
- 위치: main#main > div.content.fade > div.card.fade:nth-of-type(2) > div.mc-grid
- 메모: 버튼들을 default 상태, hover상태, 클릭되었을 때 상태 나누어서 해줘. 지금은 다른 거 눌러도 헷갈려
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 검색 방법 타일(.mc-tile)에 aria-pressed 와 네 상태 부여: 기본(흰)/올림(회색, 보라 아님)/누름(연보라+1px)/선택됨(보라 채움+모서리 체크). 대여하기 직원/학생 타일도 같은 규칙 — styles.css, Rentals.jsx

## 2026. 10. 2. 13시 40분 10초 · /rentals/return
- 종류: 메모
- 요소: td:nth-of-type(10)
- 위치: div.card.tight:nth-of-type(3) > div.table-wrap > table.data > tbody > tr > td:nth-of-type(10)
- 메모: 저장 버튼을 표 오른쪽 바깥에 생기도록 만들어주고, default, hover, active, loaing 상태 나누어서 만들어
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 저장 버튼을 표 카드 오른쪽 바깥 칸에 행마다 세로 가운데로 이동(900px 이하는 예전처럼 표 마지막 칸). 상태: 기본(보라)/올림(진한 보라)/누름(더 진하게+안쪽 그림자+1px)/로딩(스피너+저장 중…)/사용 불가(확인자 고르기 전) — Rentals.jsx .ret-save, styles.css

## 2026. 10. 2. 13시 40분 40초 · /admin
- 종류: 메모
- 요소: span.count  (글자: "3건")
- 위치: main#main > div.content.fade > section > div.tools-card:nth-of-type(1) > div.table-tools > span.count
- 메모: 삭제
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 관리자 접속 계정 표 "N건" 삭제 (Admin.jsx showCount={false})

## 2026. 10. 2. 13시 41분 48초 · /goedu/teachers
- 종류: 메모
- 요소: a.btn.btn-secondary  (글자: "시트에서 열기")
- 위치: div.content.fade > section.tabcard > div.tools-card:nth-of-type(1) > div.table-tools > div.tools-right > a.btn.btn-secondary
- 메모: 내선연락망 버튼 오른쪽에 위치하도록 변경 후 오른쪽 정렬
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 교사 가입현황의 "시트에서 열기"를 내선 연락망 칩 오른쪽, 띠 오른쪽 끝으로 이동 — Goedu.jsx sheetInTop

## 2026. 10. 2. 13시 42분 38초 · /goedu/students
- 종류: 메모
- 요소: a.btn.btn-secondary  (글자: "시트에서 열기")
- 위치: div.content.fade > section.tabcard > div.tools-card:nth-of-type(1) > div.table-tools > div.tools-right > a.btn.btn-secondary
- 메모: 현재의 카드 영역에서 나오고, 표 바로 위에 위치하도록 변경, 오른쪽 정렬
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 학생 가입현황의 "시트에서 열기"를 도구줄 카드에서 꺼내 표 바로 위 띠(이 버튼만 있는 띠) 오른쪽에 둠 — DataTable.jsx sheetInTop, Goedu.jsx

## 2026. 10. 2. 13시 43분 13초 · /goedu/admin
- 종류: 메모
- 요소: div.linked-actions
- 위치: div.content.fade > section.tabcard > div.manual-list > div.tools-card > div.crumb-row > div.linked-actions
- 메모: 두 버튼의 위치 서로 swap 후 두 버튼 오른쪽 정렬
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 관리자 메뉴얼의 두 버튼 순서를 바꿔(작성하기 → 관리 콘솔 열기) 제목줄 오른쪽 끝 정렬 — Goedu.jsx, styles.css

## 2026. 10. 2. 13시 50분 52초 · /staff
- 종류: 메모
- 요소: span.count  (글자: "22건")
- 위치: main#main > div.content.fade > div.tools-card:nth-of-type(2) > div.table-tools > span.count
- 메모: 삭제
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 교직원 검색 "N건" 삭제 (Staff.jsx showCount={false})

## 2026. 10. 2. 13시 52분 47초 · /staff
- 종류: 메모
- 요소: div.crud-bar
- 위치: main#main > div.content.fade > div.tools-card:nth-of-type(2) > div.table-tools > div.tools-right:nth-of-type(2) > div.crud-bar
- 메모: goedu-함께볼정보처럼, 교직원검색 - 표 위에 표와 붙은 카드 만들고, 추가, 수정, 삭제, 시트에서 열기 버튼을 카드 안에 순서대로 위치하도록. 추가, 수정, 삭제 버튼은 좌측 정렬, 시트에서 열기는 우측정렬
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 교직원 검색: 표와 붙은 띠 안에 추가·수정·삭제(왼쪽) → 시트에서 열기(오른쪽 끝)를 순서대로 배치. 도구줄에는 검색만 남김. 같이 고침: 검색 폼만 있을 때 입력칸이 줄어 안내 글자가 줄바꿈되던 것(폼 폭 명시), 폰 폭에서 검색 폼이 오른쪽으로 밀리던 것 — DataTable.jsx editInTop, Staff.jsx, styles.css

## 2026. 10. 2. 14시 19분 45초 · /manuals
- 종류: 메모
- 요소: div.mc-b:nth-of-type(3)
- 위치: main#main > div.content.fade > div.mc-b:nth-of-type(3)
- 메모: 이 카드 위에 함께볼정보 있는 카드처럼 붙은 카드 만들고, 그 카드 안으로 작성하기 버튼, 시트에서 열기 버튼 위치 변경한 후 작성하기는 좌측 정렬, 시트에서 열기는 오른쪽 정렬. 그 이후 작성하기 -> 추가 로 텍스트 변경하고, 다른 메뉴의 추가 버튼과 같은 디자인으로 변경
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 메뉴얼 카테고리 카드 맨 위에 붙은 띠를 만들어 추가(왼쪽)·시트에서 열기(오른쪽 끝)를 옮김. "작성하기"를 "추가"로 바꾸고 다른 메뉴의 추가 버튼과 같은 알약(눌림 표시, 다시 누르면 폼 닫힘)으로 변경 — Manuals.jsx, styles.css .mc-attached

## 2026. 10. 2. 14시 21분 36초 · /staff
- 종류: 메모
- 요소: a.nav-item.active:nth-of-type(2)  (글자: "교직원 검색")
- 위치: div#root > div.app > header.topbar > div.topbar-card:nth-of-type(2) > nav#main-nav > a.nav-item.active:nth-of-type(2)
- 메모: 학교 정보 로 텍스트 변경
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 상단 메뉴 "교직원 검색" → "학교 정보"(경로 /staff 는 그대로), 페이지 제목도 "학교 정보" — Layout.jsx, Staff.jsx

## 2026. 10. 2. 14시 25분 53초 · /goedu/teachers
- 종류: 메모
- 요소: nav.ftabs
- 위치: main#main > div.content.fade > div.folder.nosub:nth-of-type(2) > nav.ftabs
- 메모: 교직원 검색 메뉴에 디자인 가지고 와서 카테고리로 교직원 연락망, 학교 배치도 만들기
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 학교 정보에 Goedu 와 같은 폴더 탭 카테고리를 만듦: 교직원 연락망(기존 표) · 학교 배치도(새로). 교직원 위치와 학급 위치에서 모은 층별 목록(높은 층이 위, 층 선택 알약). 도면 그림이 아니라 목록 — Staff.jsx, App.jsx(staff/*), styles.css .sm-*

## 2026. 10. 2. 14시 26분 44초 · /goedu/teachers
- 종류: 메모
- 요소: div.tools-card:nth-of-type(1)
- 위치: main#main > div.content.fade > section.tabcard > div.tools-card:nth-of-type(1)
- 메모: 교직원 검색 메뉴로 가지고 와서, 새로 만들어진 카테고리에 각각 이 카드 넣기
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 두 카테고리 모두 탭에 붙은 도구줄 카드(위치 제목줄 + 도구줄)를 맨 위에 둠. 학교 배치도 카드에는 층 선택 알약 — Staff.jsx

## 2026. 10. 2. 14시 28분 9초 · /rentals/return
- 종류: 메모
- 요소: div.ret-wrap.out:nth-of-type(3)
- 위치: main#main > div.content.fade > div.ret-wrap.out:nth-of-type(3)
- 메모: 표 크기가 줄어들지 말고, 저장버튼이 본문 사이드에 위치하게 할 수 없어?
- 디자인 추천: 요청
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 디자인 적용: 반납 결과 표는 본문 폭(980px) 그대로 두고 저장 버튼을 본문 오른쪽 바깥 여백에 행마다 세로 가운데로 배치(≥1240px). 그보다 좁으면 여백이 모자라 표 마지막 칸으로 — Rentals.jsx, styles.css .ret-save

## 2026. 10. 2. 15시 8분 18초 · /rentals/return
- 종류: 메모
- 요소: td:nth-of-type(9)
- 위치: div.card.tight:nth-of-type(1) > div.table-wrap > table.data > tbody > tr > td:nth-of-type(9)
- 메모: 저장 버튼 디자인 시안 추천
- 디자인 추천: 요청
- 화면: 정보부 업무 관리 · 1280×719
- 제안: 후보 4개 제시 → 사용자가 "현재 디자인 유지, 가로만 1/2" 선택
- 상태: [x] 처리됨 — 저장 버튼 모양(보라 채움·모서리·글자·상태)은 그대로 두고 가로만 96→48px(표 안 칸 모드도 48px). 폭이 좁아 저장 중에는 글자 없이 돌아가는 원만 보임. 같이 고침: 표 카드 밖 기준이던 sr-only 요소 때문에 폰 폭에서 가로 스크롤이 생기던 것(.ret-wrap .card.tight 를 기준으로) — Rentals.jsx, styles.css

## 2026. 10. 2. 15시 11분 40초 · /goedu/students
- 종류: 메모
- 요소: button.th-btn
- 위치: div.table-wrap:nth-of-type(2) > table.data > thead > tr > th:nth-of-type(1) > button.th-btn
- 메모: -전자기기 - 보유현황의 기준연도 드롭다운처럼, goedu - 학생 현황도 학년도 드롭다운 되도록 만들기. 표에서는 삭제.
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 학생 가입현황에 도구줄 "학년도" 드롭다운(기본 최근 학년도, 보유 현황의 기준연도와 같은 모양)을 만들고 표의 학년도 열은 삭제 — Goedu.jsx

## 2026. 10. 2. 15시 14분 4초 · /goedu/teachers
- 종류: 메모
- 요소: div.table-top:nth-of-type(1)
- 위치: main#main > div.content.fade > section.tabcard > div.card.tight:nth-of-type(2) > div.table-top:nth-of-type(1)
- 메모: 이 디자인대로 전자기기 - 보유 현황 표 위에 놓기. 함께 볼 정보는 가져오지 않고, 시트에서 열기와 카드만.
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 전자기기 보유 현황(전체) 집계표 바로 위에 붙은 띠를 만들어 시트에서 열기만 오른쪽 정렬(함께 볼 정보는 안 가져옴) — Devices.jsx. 데모 링크에 "전자기기"·"전자기기_개별" 시트가 없어 버튼이 안 보이던 것도 추가(demo.js, supabase/seed.sql 재생성)

## 2026. 10. 2. 15시 14분 30초 · /devices/laptops/staff
- 종류: 메모
- 요소: button.chip:nth-of-type(5)  (글자: "관리번호")
- 위치: div.content.fade > section.tabcard > div.card.tight:nth-of-type(2) > div.table-top:nth-of-type(1) > div.chipset.chipset-box > button.chip:nth-of-type(5)
- 메모: 오른쪽에 시트에서 열기 버튼 추가 후 오른쪽 정렬 시키기
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 노트북 칩 띠 오른쪽 끝에 시트에서 열기 추가(보유 노트북은 이 버튼만 있는 띠) — Devices.jsx sheetInTop

## 2026. 10. 2. 15시 14분 43초 · /devices/tablets/stock
- 종류: 메모
- 요소: button.chip:nth-of-type(2)  (글자: "처분일")
- 위치: div.content.fade > section.tabcard > div.card.tight:nth-of-type(2) > div.table-top:nth-of-type(1) > div.chipset.chipset-box > button.chip:nth-of-type(2)
- 메모: 오른쪽에 시트에서 열기 버튼 추가 후 오른쪽 정렬 시키기
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 보유 현황(태블릿·노트북·데스크톱·충전함) 칩 띠 오른쪽 끝에 시트에서 열기 추가 — Devices.jsx sheetInTop

## 2026. 10. 2. 15시 14분 51초 · /devices/cabinets/class
- 종류: 메모
- 요소: button.pill-tab:nth-of-type(4)  (글자: "3학년")
- 위치: section.tabcard > div.card.tight:nth-of-type(2) > div.table-top:nth-of-type(1) > div.chipset.chipset-box > div.pills.sub > button.pill-tab:nth-of-type(4)
- 메모: 오른쪽에 시트에서 열기 버튼 추가 후 오른쪽 정렬 시키기
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 반별 태블릿 보관함 학년 알약 띠 오른쪽 끝에 시트에서 열기 추가 — ClassManage.jsx

## 2026. 10. 2. 16시 14분 39초 · /manuals
- 종류: 메모
- 요소: div.table-top:nth-of-type(1)
- 위치: main#main > div.content.fade > div.mc-b.mc-attached:nth-of-type(3) > div.table-top:nth-of-type(1)
- 메모: 이 카드를 카테고리 카드 아래로 위치 변경
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 메뉴얼의 추가·시트에서 열기 띠를 카테고리 카드 맨 아래(위쪽 경계선 1px)로 옮김 — Manuals.jsx, styles.css .mc-attached

## 2026. 10. 2. 16시 20분 19초 · /
- 종류: 메모
- 요소: h2.section-title  (글자: "구글 시트 바로가기")
- 위치: main#main > div.content.fade > section:nth-of-type(2) > h2.section-title
- 메모: 이 위에 업무 관리 사이트 바로 가기 만들고, Google 관리자 콘솔, mdm 관리 시스템, gsms 이렇게 3개 만들어
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 홈의 "구글 시트 바로가기" 위에 "업무 관리 사이트 바로가기"(Google 관리자 콘솔·MDM 관리 시스템·GSMS) 추가. 링크 탭의 그룹 "업무 관리"에서 읽음. 데모의 MDM·GSMS 주소는 가짜(example.com)라 시트의 링크 탭에서 실제 주소로 바꿔야 함 — Home.jsx, demo.js, sheet-schema.js

## 2026. 10. 2. 16시 26분 55초 · /manage/class/tv
- 종류: 메모
- 요소: div.content.fade
- 위치: main#main > div.content.fade
- 메모: 에듀테크 메뉴에 현재의 이것과 같게 디자인 할 것. 카테고리는 구독 에듀테크, 기타 에듀테크가 있음. 구독 에듀테크 클릭 시 보이는 표에는 (에듀테크 이름, 공용 아이디, 비밀번호, 안내사항)이 적혀있고, 에듀테크 이름을 클릭하면 해당 에듀테크 사이트로 이동함. 함께 볼 정보로 사용 기한, 가격, 기타 가 있음.
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 에듀테크 메뉴를 반별 관리와 같은 구조로 새로 만듦: 폴더 탭(구독·기타 에듀테크) → 도구줄 카드(검색·추가/수정/삭제) → 함께 볼 정보 띠(사용 기한·가격·기타 + 고치기용 사이트 주소, 시트에서 열기) → 표(에듀테크 이름·공용 아이디·비밀번호·안내사항). 이름을 누르면 해당 사이트로 이동. 새 표 edutech_items(시트 "에듀테크" 탭, 마이그레이션 0008, 데모 데이터 6건) — Edutech.jsx, sheet-schema.js, demo.js, data.js, supabase/migrations/0008_edutech_items.sql

## 2026. 10. 2. 16시 30분 25초 · /devices/inventory/laptop
- 종류: 메모
- 요소: th:nth-of-type(6)  (글자: "개별 장비")
- 위치: div.card.tight:nth-of-type(2) > div.table-wrap:nth-of-type(2) > table.data > thead > tr > th:nth-of-type(6)
- 메모: 개별장비 탭 없애고, 수량의 해당 데이터 클릭하면 개별 n대 보기가 되도록
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 노트북 묶음 표에서 "개별 장비" 열을 없애고 수량(n대)을 눌러 그 묶음의 개별 n대 보기를 열도록 함(링크 모양, 수정 모드에서도 유지) — Devices.jsx, styles.css .qty-link

## 2026. 10. 2. 17시 50분 31초 · /rentals/return
- 종류: 메모
- 요소: button.btn.btn-primary  (글자: "저장")
- 위치: main#main > div.content.fade > div.ret-wrap.out:nth-of-type(3) > div.ret-save:nth-of-type(2) > div.ret-save-row > button.btn.btn-primary
- 메모: 모든 표의 수정/삭제 시 이것과 같은 저장 버튼이 생기도록. 만약 저장 누르지 않고 화면을 전환하거나 닫으면 저장할 것인지 물어보도록
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 모든 표(DataTable crud)의 수정·삭제를 "모아서 저장"으로 바꿈: 셀을 고치거나 삭제를 눌러도 바로 저장되지 않고(바뀐 칸 연보라, 삭제할 행 흐림+취소선) 수정·삭제 안내 띠의 저장 버튼(변경 N건, 되돌리기 포함)으로 한꺼번에 저장. 삭제는 저장 때 앱 안 확인 창. 저장하지 않은 채 수정을 끝내거나 메뉴·탭·뒤로 가기로 화면을 옮기면 저장 / 저장하지 않고 이동 / 계속 편집을 묻고, 창을 닫으면 브라우저 경고. 드롭다운 열(TV 브랜드·용도·분류·설치 장소·상태)도 같은 방식. 안내 띠는 스크롤해도 위에 붙음. 데이터 라우터(createBrowserRouter)로 바꿔 useBlocker 사용 — DataTable.jsx, unsaved.js, ConfirmDialog.jsx, UnsavedGuard.jsx, App.jsx, Layout.jsx

## 2026. 10. 2. 17시 53분 39초 · /devices/inventory/desktop
- 종류: 메모
- 요소: div.card.tight:nth-of-type(2)
- 위치: main#main > div.content.fade > section.tabcard > div.card.tight:nth-of-type(2)
- 메모: 드롭다운으로 접고 펼칠 수 있게 만들기. default는 펼쳐져 있는 상태. 드롭다운을 표 상단과 하단에 둘다 만들어서 스크롤바로 아래를 보고 있어도 드롭다운 가능하도록. 디자인 시안 추천
- 디자인 추천: 요청
- 제안: 후보 4개(A 위·아래 접기 띠 추천 / B 모서리 둥근 버튼 / C 아코디언 머리글 / D 서랍 손잡이) 제시 → 사용자가 A 선택("표 펼치기/표 접기" 글자)
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 시안 A(위·아래 접기 띠) 선택, 글자는 "표 접기 / 표 펼치기". 모든 표 카드(DataTable)에 적용(처음엔 펼침): 위 띠 오른쪽 끝(시트에서 열기 옆)에 버튼, 표 아래에는 화면 아래에 붙어 따라오는 "표 접기" 띠. 접으면 위 띠만 남음. 개별 장비(중첩) 표는 자기 제목 줄로 접으므로 제외 — DataTable.jsx foldable, styles.css .fold-*

## 2026. 10. 2. 18시 46분 0초 · /devices/inventory/desktop
- 종류: 메모
- 요소: button.btn.sm  (글자: "표 접기")
- 위치: div.content.fade > section.tabcard > div.card.tight:nth-of-type(2) > div.table-top:nth-of-type(1) > div.table-top-right:nth-of-type(2) > button.btn.sm
- 메모: 이것만 시안 b로
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 위 띠의 "표 접기" 버튼만 시안 B(글자 없는 32px 둥근 아이콘 버튼, 이름은 aria-label/title "표 접기·표 펼치기", 접히면 화살표가 뒤집힘)로 변경. 아래 띠는 시안 A 그대로. 카드 모서리에 걸치는 대신 띠 오른쪽 끝에 둠(카드가 내용을 잘라내고 위 도구줄 카드와 겹치기 때문) — DataTable.jsx, styles.css .fold-round

## 2026. 10. 2. 18시 46분 23초 · /devices/inventory/desktop
- 종류: 메모
- 요소: div.fold-foot:nth-of-type(3)
- 위치: main#main > div.content.fade > section.tabcard > div.card.tight:nth-of-type(2) > div.fold-foot:nth-of-type(3)
- 메모: 이 영역 클릭하면 표 접히도록
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 아래 접기 띠 전체를 하나의 버튼으로 바꿔 띠의 어디를 눌러도(키보드 Enter 포함) 표가 접힘 — DataTable.jsx, styles.css .fold-foot

## 2026. 10. 2. 18시 47분 21초 · /devices/inventory/desktop
- 종류: 메모
- 요소: div.table-tools
- 위치: section.tabcard > section > div#:rn: > div.units-body > div.tools-card.plain:nth-of-type(1) > div.table-tools
- 메모: 함께볼정보 카드와 같은 것을 생성, ip주소순 드롭다운과, 시트에서 열기 버튼만 카드 안에 넣기
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 개별 장비 표 카드에 함께 볼 정보 띠와 같은 띠를 붙여 정렬 드롭다운(왼쪽)과 시트에서 열기(오른쪽)만 넣음. 도구줄에서는 빠짐 — Devices.jsx UnitsCard

## 2026. 10. 2. 18시 48분 47초 · /devices/inventory/desktop
- 종류: 메모
- 요소: button.tg  (글자: "개별 장비 ·")
- 위치: div.content.fade > section.tabcard > section > div.table-tools:nth-of-type(1) > h2.section-title > button.tg
- 메모: 같은 페이지 위의 보유현황 카드 영역과 같은 것 생성, 이 요소와 추가/수정/삭제/검색 버튼을 카드 안에 넣기
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 개별 장비에도 위 보유 현황과 같은 흰 도구줄 카드를 만들어 제목 토글("개별 장비 · …", 전체 보기)과 추가/수정/삭제/검색을 그 안에 넣음. 제목 토글은 표 접기와 같은 접힘을 함께 씀 — DataTable.jsx heading/folded, Devices.jsx, styles.css
## 2026. 10. 2. 19시 4분 13초 · /rentals/tablet/student
- 종류: 메모
- 요소: button.fold-round
- 위치: div.content.fade > section.tabcard:nth-of-type(2) > div.card.tight:nth-of-type(2) > div.table-top:nth-of-type(1) > div.table-top-right > button.fold-round
- 메모: 수정/삭제할 때 표 오른쪽 사이드에 생기는 저장버튼처럼, 표 오른쪽 사이드로 위치 변경
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 표 접기 버튼(위 둥근 버튼)을 표 카드 밖 오른쪽 사이드 여백(.side-rail)으로 옮김(띠 세로 가운데). 1240px 미만(좁은 화면)에서는 예전처럼 띠 안 — DataTable.jsx, styles.css .side-rail

## 2026. 10. 2. 19시 7분 58초 · /devices/inventory/desktop
- 종류: 메모
- 요소: div.mode-banner:nth-of-type(2)
- 위치: main#main > div.content.fade > section.tabcard > div.mode-banner:nth-of-type(2)
- 메모: 저장 버튼은 고칠 칸 누르면 표 사이드에 그 행의 오른쪽 끝에 생기도록. 표 크기가 변하면 안되고, 본문이 아니라 사이드에 생기게. 수정/삭제 공통.
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 수정·삭제 저장 버튼을 표 오른쪽 사이드(.side-rail)로: 칸을 누르면(또는 삭제를 표시하면) 그 행 높이에 저장 버튼이 생김. 표 크기는 안 변함. 안내 띠에는 되돌리기만(1240px 미만에선 띠에 저장) — DataTable.jsx

## 2026. 10. 2. 19시 8분 54초 · /devices/inventory/desktop
- 종류: 메모
- 요소: div.card.tight:nth-of-type(3)
- 위치: main#main > div.content.fade > section.tabcard > div.card.tight:nth-of-type(3)
- 메모: 용도/물품분류명 평소에는 읽기만 되도록. 수정/삭제 버튼 눌러야 편집 가능
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 수정 중에도 용도·물품 분류명·설치 장소·상태·TV브랜드는 글자로만 보이고, 칸을 눌러야 드롭다운이 열림(EditSelectCell) — DataTable.jsx, Devices.jsx, ClassManage.jsx

## 2026. 10. 2. 19시 12분 40초 · /devices/laptops/staff
- 종류: 메모
- 요소: button.btn.sm:nth-of-type(1)  (글자: "추가")
- 위치: section.tabcard > div.tools-card:nth-of-type(1) > div.table-tools > div.tools-right > div.crud-bar > button.btn.sm:nth-of-type(1)
- 메모: 학교정보/goedu/전자기기/에듀테크/반별관리 메뉴에서는 추가 버튼 누르면, 새로운 카드 생성하지 말고 해당 표의 스키마 바로 아래에 새로운 행 생기고, 새로운 행에 데이터 입력하도록 만들기. 새로운 행 오른쪽 끝에 저장하기 버튼 만들기. 저장하기 버튼은 표 안에 있는 게 아니라, 사이드에 생김.
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 추가를 누르면 새 카드 대신 표 머리글 바로 아래에 새 행이 생겨 칸마다 입력(Enter 저장·Esc 취소), 저장 버튼은 표 사이드. 학교정보·Goedu·전자기기·에듀테크·반별 관리 모든 표 공통. 학년-반 칸은 학년·반 열을 합친 폭(crud.fieldAt) — DataTable.jsx, ClassManage.jsx, Devices.jsx, Goedu.jsx

## 2026. 10. 2. 20시 10분 45초 · /devices/inventory/all
- 종류: 메모
- 요소: select#inv-year
- 위치: main#main > div.content.fade > section.tabcard > div.tools-card:nth-of-type(1) > div.table-tools > select#inv-year
- 메모: 아랫줄의 시트에서 열기 왼쪽으로 위치 변경 후 좌측 정렬
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 기준연도 드롭다운을 위 도구줄에서 표 위 띠(시트에서 열기 왼쪽)로 옮기고 왼쪽 정렬 — Devices.jsx InventoryOverview

## 2026. 10. 2. 20시 11분 7초 · /devices/inventory/all
- 종류: 메모
- 요소: div.table-tools
- 위치: main#main > div.content.fade > section.tabcard > div.tools-card:nth-of-type(1) > div.table-tools
- 메모: 추가, 수정, 삭제 버튼 만들고 오른쪽 정렬
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 집계표를 장비 목록과 따로 시트(보유현황_제출본)에서 관리: 띠 오른쪽에 추가(새 연도 7줄)·수정(숫자 칸)·삭제(그 연도), 자동 집계 연도는 읽기 전용 — Devices.jsx InventoryOverview, sheet-schema CRUD_TABLES, data.js overlay

## 2026. 10. 2. 20시 33분 16초 · /devices/inventory/all
- 종류: 메모
- 요소: div.table-top-right
- 위치: main#main > div.content.fade > section.tabcard > div.card.tight:nth-of-type(3) > div.table-top:nth-of-type(1) > div.table-top-right
- 메모: 보유 현황 > 전체 가 있는 카드 안으로 위치 변경. 보유현황 > 데스크톱 처럼 하면 됨. 검색 창은 만들지 마
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 추가/수정/삭제를 보유 현황 > 전체 카드(도구줄) 오른쪽으로 옮김(데스크톱 화면과 같은 모양, 검색 없음). 띠에는 기준연도(왼쪽)·시트에서 열기(오른쪽). 자동 집계는 없앰(장비 목록과 연동 안 함) — Devices.jsx InventoryOverview, inventory.js

## 2026. 10. 2. 20시 36분 2초 · /devices/inventory/desktop
- 종류: 메모
- 요소: td.add-cell:nth-of-type(10)
- 위치: div > div.table-wrap > table.data > tbody > tr.add-row:nth-of-type(1) > td.add-cell:nth-of-type(10)
- 메모: 추가 버튼 클릭 시 생성되는 새로운 행의 배경 색을 바꿔줘. 디자인 시안 추천.
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 새 행 배경을 시안 A(연한 초록 --green-tint + 왼쪽 초록 막대)로 변경 — styles.css tr.add-row

## 2026. 10. 2. 20시 37분 21초 · /devices/inventory/desktop
- 종류: 메모
- 요소: textarea.auto-grow.cell-input
- 위치: table.data > tbody > tr.add-row:nth-of-type(1) > td.add-cell:nth-of-type(8) > div.add-stack > textarea.auto-grow.cell-input
- 메모: 추가 버튼 클릭 시 생성 되는 입력 칸의 세로 길이를 default로 이 길이로 맞출 것. 사용자의 입력이 입력 창의 가로 길이를 넘었을 때 다음 줄로 넘어가면서 세로 길이 커짐
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 새 행 입력칸(글자·드롭다운·날짜)이 모두 한 줄 기본 높이(41px)로 시작하고, 입력이 칸 너비를 넘으면 다음 줄로 넘어가며 세로로 커짐(긴 안내 글자는 높이에 영향 없음) — AutoGrowText placeholderOneLine, styles.css tr.add-row

## 2026. 10. 2. 20시 57분 28초 · /devices/inventory/laptop
- 종류: 메모
- 요소: div.units-body
- 위치: main#main > div.content.fade > section.tabcard > section > div.units-body
- 메모: 전자기기 - 노트북 카테고리 누르면 이 디자인으로 이 표가 똑같이 보이도록 만들기
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 전자기기 > 노트북(교원용 IP대장·보유 노트북) 표를 개별 장비 표와 같은 모양으로: 같은 열(관리번호·일련번호·사용자·IP·위치·모델명·취득일자·OS·상태·비고), 띠 왼쪽에 정렬 드롭다운. 교원용은 직위·부서만 함께 볼 정보 칩으로 남김 — Devices.jsx unitColumns/UnitSortSelect

## 2026. 10. 2. 20시 58분 31초 · /devices/inventory/laptop
- 종류: 메모
- 요소: button.btn.btn-secondary  (글자: "전체")
- 위치: main#main > div.content.fade > section.tabcard > div.table-tools:nth-of-type(4) > button.btn.btn-secondary
- 메모: 가운데 정렬
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — "전체 ○○ 개별 장비 보기" 버튼을 가운데 정렬(노트북·데스크톱 공통) — Devices.jsx UnitsCard, styles.css .units-open

## 2026. 10. 2. 20시 58분 43초 · /devices/inventory/desktop
- 종류: 메모
- 요소: button.btn.btn-secondary  (글자: "전체")
- 위치: main#main > div.content.fade > section.tabcard > div.table-tools:nth-of-type(4) > button.btn.btn-secondary
- 메모: 가운데 정렬
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — "전체 ○○ 개별 장비 보기" 버튼을 가운데 정렬(노트북·데스크톱 공통) — Devices.jsx UnitsCard, styles.css .units-open

## 2026. 10. 2. 21시 10분 41초 · /devices/inventory/laptop
- 종류: 메모
- 요소: div.units-body
- 위치: main#main > div.content.fade > section.tabcard > section > div.units-body
- 메모: 보유 현황 > 태블릿, 보유 현황 > 태블릿 충전함 클릭 시, 이와 같은 개별 장비 보기 되도록 똑같이 만들기
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 보유 현황 > 태블릿·태블릿 충전함(그리고 전자기기 > 태블릿)에도 데스크톱·노트북과 같은 "전체 ○○ 개별 장비 보기" 개별 장비 카드를 붙임. 충전함은 화면 이름을 "태블릿 충전함"으로 표시 — Devices.jsx UNITS_FOR, CAT_LABEL

## 2026. 10. 2. 21시 15분 52초 · /devices/inventory/tablet
- 종류: 메모
- 요소: select#unit-sort
- 위치: section.tabcard > section > div.units-body > div.card.tight:nth-of-type(2) > div.table-top:nth-of-type(1) > select#unit-sort
- 메모: 태블릿은 제조사/모델명/취득일자 로 정렬되게
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 태블릿 개별 장비 정렬을 제조사순/모델명순/취득일자순으로(제조사 열 추가) — Devices.jsx UNIT_SORTS_FOR

## 2026. 10. 2. 21시 16분 38초 · /devices/inventory/tablet
- 종류: 메모
- 요소: div.units-body
- 위치: main#main > div.content.fade > section.tabcard > section > div.units-body
- 메모: 전자기기 - 태블릿 카테코리 열면 이 디자인으로 이 표가 나오게, 이 표와 같은 데이터, 같은 시트 보여주기
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 전자기기 > 태블릿(/devices/tablets/stock)을 개별 장비 표(같은 데이터·같은 전자기기_개별 시트)가 펼쳐진 채 바로 나오게 — Devices.jsx UnitsPage

## 2026. 10. 2. 21시 17분 21초 · /devices/inventory/cabinet
- 종류: 메모
- 요소: select#unit-sort
- 위치: section.tabcard > section > div.units-body > div.card.tight:nth-of-type(2) > div.table-top:nth-of-type(1) > select#unit-sort
- 메모: 태블릿 충전함은 제조사, 모델명, 보관 가능 대수로 정렬 되도록
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 태블릿 충전함 개별 장비 정렬을 제조사순/모델명순/보관 가능 대수순으로(제조사·보관 가능 대수 열 추가, units 에 capacity 연결) — Devices.jsx, data.js joinUnits

## 2026. 10. 2. 21시 17분 35초 · /devices/inventory/cabinet
- 종류: 메모
- 요소: div.units-body
- 위치: main#main > div.content.fade > section.tabcard > section > div.units-body
- 메모: 전자기기 - 태블릿 충전함 카테코리 열면 이 디자인으로 이 표가 나오게, 이 표와 같은 데이터, 같은 시트 보여주기
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 전자기기 > 태블릿 보관함 첫 화면을 개별 장비 표(/devices/cabinets/units)로. 반별·보유 태블릿 보관함 탭은 그대로 남김 — Devices.jsx UnitsPage, SUB.cabinets

## 2026. 10. 2. 22시 0분 42초 · /staff/contacts
- 종류: 메모
- 요소: nav.ftabs
- 위치: main#main > div.content.fade > div.folder.nosub:nth-of-type(2) > nav.ftabs
- 메모: 카테고리 삭제, 학교배치도 데이터 완전히 삭제
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 학교 정보의 "학교 배치도" 카테고리 삭제(/staff/map 은 교직원 연락망으로). 배치도 데이터·시트 탭 정의·마이그레이션(0009)·데모 데이터·시드·데모 시트 탭까지 모두 지움 — Staff.jsx, sheet-schema.js, demo.js, data.js
## 2026. 10. 2. 22시 5분 40초 · /staff/contacts
- 종류: 글자 수정
- 요소: span  (글자: "교직원 연락망")
- 위치: main#main > div.content.fade > div.folder.nosub:nth-of-type(2) > nav.ftabs > a.ftab.active > span
- 수정: "교직원 연락망" → "교직원"
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 탭 이름 "교직원 연락망" → "교직원" — Staff.jsx TABS

## 2026. 10. 2. 22시 5분 47초 · /staff/contacts
- 종류: 글자 수정
- 요소: span  (글자: "교직원 연락망")
- 위치: main#main > div.content.fade > section.tabcard > div.tools-card:nth-of-type(1) > h2.crumb > span
- 수정: "교직원 연락망" → "교직원"
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 제목줄도 "교직원"(탭 이름을 그대로 씀) — Staff.jsx TABS

## 2026. 10. 2. 22시 6분 6초 · /staff/contacts
- 종류: 메모
- 요소: nav.ftabs
- 위치: main#main > div.content.fade > div.folder.nosub:nth-of-type(2) > nav.ftabs
- 메모: 오른쪽에 학생 카테고리 추가
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 학교 정보에 "학생" 카테고리를 교직원 오른쪽에 추가(/staff/students) — Staff.jsx

## 2026. 10. 2. 22시 6분 39초 · /staff/contacts
- 종류: 메모
- 요소: section.tabcard
- 위치: main#main > div.content.fade > section.tabcard
- 메모: 학생 카테고리 추가 후 이 디자인과 같게 생성. 표에는 학년/반/번호/이름
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 학생 화면을 교직원과 같은 모양으로(제목줄 카드·검색, 표 띠에 추가/수정/삭제·시트에서 열기). 표 = 학년/반/번호/이름(학생 탭, 최근 학년도). 학생 추가·수정·삭제 가능, 삭제 시 Goedu 학생 계정·사이버 지킴이 지정도 함께 삭제 — Staff.jsx, sheet-schema CRUD_TABLES.students, data.js, row.mts

## 2026. 10. 2. 22시 7분 41초 · /goedu/admin
- 종류: 메모
- 요소: a.ftab.active:nth-of-type(3)
- 위치: main#main > div.content.fade > div.folder.nosub:nth-of-type(2) > nav.ftabs > a.ftab.active:nth-of-type(3)
- 메모: 관리자 메뉴얼 카테고리 삭제
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — Goedu 의 "관리자 메뉴얼" 카테고리 삭제(/goedu/admin 은 교사 가입현황으로). 메뉴얼 → Goedu 글 자체는 그대로 — Goedu.jsx

## 2026. 10. 2. 22시 9분 7초 · /edutech/subscribed
- 종류: 메모
- 요소: button.btn.sm:nth-of-type(1)  (글자: "추가")
- 위치: section.tabcard > div.tools-card:nth-of-type(1) > div.table-tools > div.tools-right > div.crud-bar > button.btn.sm:nth-of-type(1)
- 메모: 추가 버튼 누르면 카드 생기게, 다시 예전처럼 돌리기. 새로 행 생기는 모든 추가버튼 적용
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 추가 버튼을 예전처럼 카드 폼으로 되돌림(도구줄 카드와 표 카드 사이). 표 안 새 행 방식은 모든 표에서 없앰 — DataTable.jsx AddRowForm

## 2026. 10. 2. 22시 25분 9초 · /edutech/other
- 종류: 메모
- 요소: button.btn.btn-primary:nth-of-type(1)  (글자: "저장")
- 위치: main#main > div.content.fade > section.tabcard > form.card.fade > div:nth-of-type(2) > button.btn.btn-primary:nth-of-type(1)
- 메모: 저장 버튼 누르지 않고 다른 메뉴/카테고리/하위카테고리를 누를 경우, 저장할 것인지 물어보고 그 화면으로 넘어가기. 아무 것도 입력되지 않았다면 카드 사라지고 그냥 넘어감
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 추가 폼에 뭔가 적은 채 다른 메뉴·카테고리·하위 카테고리로 가면 "저장/저장하지 않고 이동/계속 편집"을 묻고, 저장하면 추가 후 그 화면으로 이동(필수 칸이 비면 머무르며 안내). 아무것도 안 적었으면 묻지 않고 폼이 사라짐 — DataTable.jsx AddRowForm(UnsavedGuard 연결), 화면 이동 시 모드 닫기

## 2026. 10. 2. 22시 26분 35초 · /staff/students
- 종류: 메모
- 요소: button.btn.sm  (글자: "삭제")
- 위치: div.table-wrap > table.data > tbody > tr:nth-of-type(1) > td.row-act:nth-of-type(5) > button.btn.sm
- 메모: 버튼이 표 바깥의 사이드에 있도록. 모든 삭제 버튼 공통
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 삭제 모드에서 삭제 버튼을 표 바깥 사이드(행 높이)로 옮김. 누르면 [취소][저장]. 모든 표 공통, 1240px 미만만 표 안 맨 끝 열 — DataTable.jsx, styles.css .rail-del

## 2026. 10. 2. 22시 27분 33초 · /goedu/students
- 종류: 메모
- 요소: div.tool-extra:nth-of-type(1)
- 위치: main#main > div.content.fade > section.tabcard > div.tools-card:nth-of-type(1) > div.table-tools > div.tool-extra:nth-of-type(1)
- 메모: 시트에서 열기 왼쪽으로 위치 변경 후 좌측 정렬
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — Goedu 학생 가입현황의 학년도 드롭다운을 표 위 띠 왼쪽(시트에서 열기 왼쪽)으로 옮김 — Goedu.jsx tableTop

## 2026. 10. 2. 22시 36분 12초 · /manage/class/tv
- 종류: 메모
- 요소: button.th-btn
- 위치: div.table-wrap > table.data > thead > tr > th:nth-of-type(5) > button.th-btn
- 메모: 비고에 해당하는 셀 편집될 경우, 편집 내용 맨 왼쪽에 해당 날짜 (2026.10.02) 이렇게 태그로 생기게 만들기. 날짜가 다르면 자동 줄바꿈 되어서 보이도록. 디자인 시안 추천.
- 디자인 추천: 요청
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 시안 A(보라 알약 날짜 태그). 반별 TV 비고를 고쳐 저장하면 오늘 날짜(YYYY.MM.DD) 줄이 붙고, 같은 날은 그 줄만 바뀌고 다른 날은 아래에 새 줄. 시트에는 "날짜 내용" 줄 글자로 저장 — DatedMemo.jsx, ClassManage.jsx, DataTable.jsx editValue/saveValue

## 2026. 10. 2. 23시 1분 48초 · /manage/class/cabinets
- 종류: 글자 수정
- 요소: span.th-btn-label  (글자: "메모")
- 위치: table.data > thead > tr > th:nth-of-type(6) > button.th-btn > span.th-btn-label
- 수정: "메모" → "비고"
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 반별 태블릿 & 태블릿 충전함 표의 "메모" 열 이름을 "비고"로(추가 폼 칸도) — ClassManage.jsx

## 2026. 10. 2. 23시 2분 9초 · /manage/class/cabinets
- 종류: 메모
- 요소: button.th-btn
- 위치: div.table-wrap > table.data > thead > tr > th:nth-of-type(6) > button.th-btn
- 메모: -비고에 해당하는 셀 편집될 경우, 편집 내용 맨 왼쪽에 해당 날짜 (2026.10.02) 이렇게 태그로 생기게 만들기. 날짜가 다르면 자동 줄바꿈 되어서 보이도록.
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 그 비고 칸도 날짜 태그(시안 A): 고치면 오늘 날짜 줄, 날짜가 다르면 줄바꿈 — ClassManage.jsx dated()

## 2026. 10. 2. 23시 5분 28초 · /manage/class/cabinets
- 종류: 메모
- 요소: nav.ftabs
- 위치: main#main > div.content.fade > div.folder.nosub:nth-of-type(2) > nav.ftabs
- 메모: 맨 오른쪽에 반별 A/S 카테고리 추가. 표에는 학년/반/위치/HDMI/LAN/비고. -HDMI, LAN, 비고에 해당하는 셀 편집될 경우, 편집 내용 맨 왼쪽에 해당 날짜 (2026.10.02) 이렇게 태그로 생기게 만들기. 날짜가 다르면 자동 줄바꿈 되어서 보이도록.
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 반별 관리 맨 오른쪽에 "반별 A/S" 카테고리 추가(/manage/class/as, 새 시트 탭 "반별AS"). 표 = 학년/반/위치/HDMI/LAN/비고, HDMI·LAN·비고는 날짜 태그 칸. 추가·수정·삭제 가능 — ClassManage.jsx, sheet-schema classroom_as, data.js, demo.js, 마이그레이션 0009

## 2026. 10. 2. 23시 6분 58초 · /manage/class/cabinets
- 종류: 메모
- 요소: button.th-btn
- 위치: div.table-wrap > table.data > thead > tr > th:nth-of-type(3) > button.th-btn
- 메모: 위치가 맨 왼쪽에 오도록
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 반별 태블릿 & 태블릿 충전함 표에서 위치를 맨 왼쪽 열로 — ClassManage.jsx

## 2026. 10. 2. 23시 7분 21초 · /manage/class/tv
- 종류: 메모
- 요소: a.ftab:nth-of-type(2)
- 위치: main#main > div.content.fade > div.folder.nosub:nth-of-type(2) > nav.ftabs > a.ftab:nth-of-type(2)
- 메모: 반별 tv 브랜드 카테고리와 위치 swap
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 반별 TV 브랜드 ↔ 반별 담임 & 사이버지킴이 탭 자리 바꿈(반별 관리 첫 화면도 담임 & 사이버지킴이) — ClassManage.jsx TABS

## 2026. 10. 2. 23시 7분 37초 · /manage/class/tv
- 종류: 메모
- 요소: button.th-btn
- 위치: div.table-wrap > table.data > thead > tr > th:nth-of-type(3) > button.th-btn
- 메모: 위치가 맨 왼쪽 열에 위치하도록
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 반별 TV 표에서 위치를 맨 왼쪽 열로 — ClassManage.jsx

## 2026. 10. 2. 23시 10분 24초 · /devices/cabinets/class
- 종류: 메모
- 요소: a.utab.active:nth-of-type(2)  (글자: "반별 태블릿 보관함")
- 위치: main#main > div.content.fade > div.folder:nth-of-type(2) > div.fpanel > nav.utabs > a.utab.active:nth-of-type(2)
- 메모: 카테고리 삭제
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 전자기기 > 태블릿 보관함의 "반별 태블릿 보관함" 하위 카테고리 삭제(/devices/cabinets/class 는 태블릿 충전함으로). 반별 보관함 데이터는 반별 관리에 그대로 — Devices.jsx

## 2026. 10. 2. 23시 10분 37초 · /devices/cabinets/units
- 종류: 글자 수정
- 요소: a.utab:nth-of-type(3)  (글자: "보유 태블릿 보관함")
- 위치: main#main > div.content.fade > div.folder:nth-of-type(2) > div.fpanel > nav.utabs > a.utab:nth-of-type(3)
- 수정: "보유 태블릿 보관함" → "여유 태블릿 보관함"
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — "보유 태블릿 보관함" → "여유 태블릿 보관함"(탭·추가 폼 제목) — Devices.jsx

## 2026. 10. 2. 23시 11분 6초 · /devices/cabinets/units
- 종류: 글자 수정
- 요소: button.tg  (글자: "개별 장비 ·")
- 위치: section > div.units-body > div.tools-card:nth-of-type(1) > div.units-head:nth-of-type(1) > h2.section-title > button.tg
- 수정: "개별 장비 ·" → "전체 태블릿 충전함"
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 태블릿 충전함 개별 장비 제목을 "전체 태블릿 충전함"으로(앞의 "개별 장비 · " 뺌) — Devices.jsx UnitsCard titlePrefix

## 2026. 10. 2. 23시 12분 46초 · /devices/cabinets/units
- 종류: 메모
- 요소: button.th-btn
- 위치: div.table-wrap > table.data > thead > tr > th:nth-of-type(4) > button.th-btn
- 메모: 삭제
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 태블릿 충전함 개별 장비 표에서 IP주소 열 삭제(추가 폼에서도) — Devices.jsx withCabinetCols

## 2026. 10. 2. 23시 13분 6초 · /devices/cabinets/units
- 종류: 메모
- 요소: span.th-btn-label  (글자: "운영체제")
- 위치: table.data > thead > tr > th:nth-of-type(10) > button.th-btn > span.th-btn-label
- 메모: 삭제
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 운영체제 열 삭제(추가 폼에서도) — Devices.jsx withCabinetCols

## 2026. 10. 2. 23시 13분 14초 · /devices/cabinets/units
- 종류: 메모
- 요소: button.th-btn
- 위치: div.table-wrap > table.data > thead > tr > th:nth-of-type(11) > button.th-btn
- 메모: 삭제
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 상태 열 삭제(추가 폼에서도) — Devices.jsx withCabinetCols

## 2026. 10. 2. 23시 14분 20초 · /devices/cabinets/units
- 종류: 메모
- 요소: button.th-btn
- 위치: div.table-wrap > table.data > thead > tr > th:nth-of-type(1) > button.th-btn
- 메모: 크롬북 가능 여부, 초기화 방법, USB줄 타입 스키마 생성
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 태블릿 충전함 개별 장비에 "크롬북 가능 여부"(가능/불가 드롭다운)·"초기화 방법"(글자)·"USB줄 타입"(USB-C/Micro USB/Lightning+기타) 열 생성. 시트 전자기기_개별 탭 끝에 열 추가, 마이그레이션 0009 — sheet-schema, Devices.jsx

## 2026. 10. 2. 23시 31분 0초 · /manage/class/as
- 종류: 메모
- 요소: nav#main-nav
- 위치: div#root > div.app > header.topbar > div.topbar-card:nth-of-type(2) > nav#main-nav
- 메모: A/S 라는 새로운 메뉴를 반별관리 메뉴 왼쪽에 생성. 카테고리는 노트북 A/S, 태블릿 A/S, 태블릿 충전함 A/S, 반별 A/S
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 반별 관리 왼쪽에 "A/S" 메뉴(/as) 추가. 카테고리: 노트북 A/S·태블릿 A/S·태블릿 충전함 A/S(그 종류의 개별 장비마다 날짜 태그 "A/S 기록" 칸, 시트 전자기기_개별 탭 끝 열, 수정만)·반별 A/S(반별 관리에서 옮겨 옴, /manage/class/as → /as/class). 메뉴가 9개라 상단 메뉴 접힘 폭을 960→1000px 로 — As.jsx, ClassManage.jsx, Layout.jsx, App.jsx, sheet-schema as_log, 마이그레이션 0010

## 2026. 10. 2. 23시 43분 37초 · /as/laptop
- 종류: 메모
- 요소: form.search-form.search-form-narrow
- 위치: div.content.fade > section.tabcard > div.tools-card:nth-of-type(1) > div.table-tools > div.tools-right > form.search-form.search-form-narrow
- 메모: A/S 메뉴의 검색 버튼 세로 길이 다른 메뉴의 검색 버튼과 같게
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — A/S 검색칸이 안내 글자 때문에 두 줄로 커지던 것을 다른 메뉴처럼 넓은 검색칸으로 바꿔 높이를 맞춤(42px) — As.jsx wideSearch

## 2026. 10. 2. 23시 44분 46초 · /as/laptop
- 종류: 메모
- 요소: div.table-tools
- 위치: main#main > div.content.fade > section.tabcard > div.tools-card:nth-of-type(1) > div.table-tools
- 메모: 다른 메뉴처럼 추가, 삭제 버튼도 만들기. 기능과 디자인, 위치 같음.
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — A/S 장비 화면에 추가·삭제 버튼(다른 메뉴와 같은 자리·모양·기능: 카드 폼 추가, 사이드 삭제 → 확인) — As.jsx

## 2026. 10. 2. 23시 45분 59초 · /as/laptop
- 종류: 글자 수정
- 요소: span.th-btn-label  (글자: "일련번호")
- 위치: table.data > thead > tr > th:nth-of-type(2) > button.th-btn > span.th-btn-label
- 수정: "일련번호" → "분류번호"
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — "일련번호" → "분류번호"(모든 개별 장비 표·추가 폼·시트 머리글) — sheet-schema, Devices.jsx, As.jsx

## 2026. 10. 2. 23시 46분 15초 · /as/laptop
- 종류: 메모
- 요소: button.th-btn
- 위치: div.table-wrap > table.data > thead > tr > th:nth-of-type(3) > button.th-btn
- 메모: 제조사 스키마 왼쪽에 추가
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — A/S 장비 표에 모델명 왼쪽 제조사 열 추가 — As.jsx

## 2026. 10. 2. 23시 47분 1초 · /devices/laptops/staff
- 종류: 글자 수정
- 요소: span.th-btn-label  (글자: "일련번호")
- 위치: table.data > thead > tr > th:nth-of-type(2) > button.th-btn > span.th-btn-label
- 수정: "일련번호" → "분류번호"
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 노트북 표도 "분류번호" — 위와 같음

## 2026. 10. 2. 23시 47분 27초 · /devices/laptops/staff
- 종류: 메모
- 요소: button.th-btn
- 위치: div.table-wrap > table.data > thead > tr > th:nth-of-type(3) > button.th-btn
- 메모: 왼쪽에 시리얼번호 스키마 추가
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 노트북 표 사용자 왼쪽에 "시리얼번호" 열 새로 만듦(시트 전자기기_개별 끝 열, 추가 폼에도) — sheet-schema serial_number, 마이그레이션 0011

## 2026. 10. 2. 23시 47분 42초 · /devices/laptops/staff
- 종류: 메모
- 요소: button.th-btn
- 위치: div.table-wrap > table.data > thead > tr > th:nth-of-type(4) > button.th-btn
- 메모: 이 스키마가 맨 왼쪽에 위치하도록
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 노트북 표에서 IP주소가 맨 왼쪽 열 — Devices.jsx unitColumns(노트북)

## 2026. 10. 2. 23시 48분 1초 · /devices/laptops/staff
- 종류: 메모
- 요소: button.th-btn
- 위치: div.table-wrap > table.data > thead > tr > th:nth-of-type(10) > button.th-btn
- 메모: -비고에 해당하는 셀 편집될 경우, 편집 내용 맨 왼쪽에 해당 날짜 (2026.10.02) 이렇게 태그로 생기게 만들기. 날짜가 다르면 자동 줄바꿈 되어서 보이도록.
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 노트북 비고를 날짜 태그 칸으로 — Devices.jsx datedColumn

## 2026. 10. 2. 23시 49분 48초 · /devices/tablets/stock
- 종류: 글자 수정
- 요소: span.th-btn-label  (글자: "일련번호")
- 위치: table.data > thead > tr > th:nth-of-type(2) > button.th-btn > span.th-btn-label
- 수정: "일련번호" → "분류번호"
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 태블릿 표도 "분류번호"

## 2026. 10. 2. 23시 49분 58초 · /devices/tablets/stock
- 종류: 글자 수정
- 요소: span.th-btn-label  (글자: "IP주소")
- 위치: table.data > thead > tr > th:nth-of-type(4) > button.th-btn > span.th-btn-label
- 수정: "IP주소" → "시리얼번호"
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 태블릿 표의 IP주소 자리에 시리얼번호 — Devices.jsx unitColumns(태블릿)

## 2026. 10. 2. 23시 50분 25초 · /devices/tablets/stock
- 종류: 메모
- 요소: button.th-btn
- 위치: div.table-wrap > table.data > thead > tr > th:nth-of-type(5) > button.th-btn
- 메모: 삭제
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 태블릿 표 위치 열 삭제

## 2026. 10. 2. 23시 50분 31초 · /devices/tablets/stock
- 종류: 메모
- 요소: button.th-btn
- 위치: div.table-wrap > table.data > thead > tr > th:nth-of-type(9) > button.th-btn
- 메모: 삭제
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 태블릿 표 운영체제 열 삭제

## 2026. 10. 2. 23시 50분 42초 · /devices/tablets/stock
- 종류: 메모
- 요소: button.th-btn
- 위치: div.table-wrap > table.data > thead > tr > th:nth-of-type(10) > button.th-btn
- 메모: 삭제
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 태블릿 표 상태 열 삭제

## 2026. 10. 2. 23시 50분 46초 · /devices/tablets/stock
- 종류: 메모
- 요소: button.th-btn
- 위치: div.table-wrap > table.data > thead > tr > th:nth-of-type(3) > button.th-btn
- 메모: 삭제
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 태블릿 표 사용자 열 삭제

## 2026. 10. 2. 23시 51분 4초 · /devices/tablets/stock
- 종류: 메모
- 요소: button.th-btn
- 위치: div.table-wrap > table.data > thead > tr > th:nth-of-type(8) > button.th-btn
- 메모: 삭제
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 태블릿 표 취득일자 열 삭제(추가 폼도 같은 칸만)

## 2026. 10. 2. 23시 51분 20초 · /devices/cabinets/units
- 종류: 글자 수정
- 요소: span.th-btn-label  (글자: "일련번호")
- 위치: table.data > thead > tr > th:nth-of-type(2) > button.th-btn > span.th-btn-label
- 수정: "일련번호" → "분류번호"
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 태블릿 충전함 표도 "분류번호"

## 2026. 10. 2. 23시 51분 27초 · /devices/cabinets/units
- 종류: 글자 수정
- 요소: span.th-btn-label  (글자: "사용자")
- 위치: table.data > thead > tr > th:nth-of-type(3) > button.th-btn > span.th-btn-label
- 수정: "사용자" → "시리얼번호"
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 태블릿 충전함 표의 사용자 자리에 시리얼번호

## 2026. 10. 2. 23시 51분 34초 · /devices/cabinets/units
- 종류: 메모
- 요소: span.th-btn-label  (글자: "위치")
- 위치: table.data > thead > tr > th:nth-of-type(4) > button.th-btn > span.th-btn-label
- 메모: 삭제
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 태블릿 충전함 표 위치 열 삭제

## 2026. 10. 2. 23시 52분 16초 · /devices/cabinets/units
- 종류: 메모
- 요소: button.th-btn
- 위치: div.table-wrap > table.data > thead > tr > th:nth-of-type(11) > button.th-btn
- 메모: 삭제
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 태블릿 충전함 표 취득일자 열 삭제

## 2026. 10. 2. 23시 53분 4초 · /devices/cabinets/units
- 종류: 메모
- 요소: select#unit-sort
- 위치: section.tabcard > section > div.units-body > div.card.tight:nth-of-type(2) > div.table-top:nth-of-type(1) > select#unit-sort
- 메모: 오른쪽에 함께 볼 정보로 USB줄 타입, 초기화 방법, 크롬북 가능 여부 만들고, 디자인은 다른 메뉴의 함께 볼 정보 참고.
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 태블릿 충전함 표 띠의 정렬 오른쪽에 "함께 볼 정보" 칩(USB줄 타입·초기화 방법·크롬북 가능 여부) — 켜면 그 열이 보임. 다른 메뉴의 함께 볼 정보와 같은 칩 — Devices.jsx UnitsCard

## 2026. 10. 3. 0시 6분 13초 · /devices/cabinets/units
- 종류: 메모
- 요소: button.th-btn
- 위치: div.table-wrap > table.data > thead > tr > th:nth-of-type(2) > button.th-btn
- 메모: 함께볼정보에 추가
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 태블릿 충전함 표의 분류번호를 함께 볼 정보 칩으로(켜면 관리번호 옆에 보임) — Devices.jsx UNIT_CHIPS

## 2026. 10. 3. 0시 6분 46초 · /devices/tablets/stock
- 종류: 메모
- 요소: button.th-btn
- 위치: div.table-wrap > table.data > thead > tr > th:nth-of-type(2) > button.th-btn
- 메모: 함께 볼 정보에 추가. 함께 볼 정보 디자인가 위치는 다른 메뉴 참고
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 태블릿 표에 함께 볼 정보 띠 생성(정렬 오른쪽, 다른 메뉴와 같은 칩), 분류번호를 칩으로 — Devices.jsx UNIT_CHIPS

## 2026. 10. 3. 0시 7분 38초 · /devices/laptops/staff
- 종류: 메모
- 요소: button.th-btn
- 위치: div.table-wrap > table.data > thead > tr > th:nth-of-type(10) > button.th-btn
- 메모: 삭제
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 노트북 표에서 상태 열 삭제(추가 폼에서도) — Devices.jsx unitColumns(노트북)

## 2026. 10. 3. 0시 7분 51초 · /devices/laptops/staff
- 종류: 메모
- 요소: button.th-btn
- 위치: div.table-wrap > table.data > thead > tr > th:nth-of-type(2) > button.th-btn
- 메모: 관리번호, 분류번호는 함께 볼 정보에 추가
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 노트북 표의 관리번호·분류번호를 함께 볼 정보 칩으로(교원용은 직위·부서와 함께) — Devices.jsx Laptops

## 2026. 10. 3. 0시 8분 28초 · /devices/laptops/stock
- 종류: 글자 수정
- 요소: span.th-btn-label  (글자: "사용자")
- 위치: table.data > thead > tr > th:nth-of-type(5) > button.th-btn > span.th-btn-label
- 수정: "사용자" → "제조사"
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 보유 노트북 표의 사용자 자리에 제조사 — Devices.jsx unitColumns stock

## 2026. 10. 3. 0시 9분 31초 · /devices/laptops/stock
- 종류: 메모
- 요소: span.th-btn-label  (글자: "위치")
- 위치: table.data > thead > tr > th:nth-of-type(6) > button.th-btn > span.th-btn-label
- 메모: 운영체제의 오른쪽에 위치하도록 변경
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 보유 노트북 표의 위치를 운영체제 오른쪽으로 — Devices.jsx unitColumns stock

## 2026. 10. 3. 0시 10분 12초 · /devices/cabinets/units
- 종류: 메모
- 요소: button.th-btn
- 위치: div.table-wrap > table.data > thead > tr > th:nth-of-type(3) > button.th-btn
- 메모: 삭제
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 태블릿 충전함 표 시리얼번호 열 삭제(추가 폼에서도) — Devices.jsx

## 2026. 10. 3. 0시 10분 30초 · /devices/cabinets/units
- 종류: 메모
- 요소: button.th-btn
- 위치: div.table-wrap > table.data > thead > tr > th:nth-of-type(2) > button.th-btn
- 메모: 함께볼정보에 추가
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — (0시 6분 13초와 같음) 분류번호 → 함께 볼 정보

## 2026. 10. 3. 0시 10분 58초 · /devices/tablets/stock
- 종류: 메모
- 요소: select#unit-sort
- 위치: section.tabcard > section > div.units-body > div.card.tight:nth-of-type(2) > div.table-top:nth-of-type(1) > select#unit-sort
- 메모: 취득일자순 삭제
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 태블릿 정렬에서 취득일자순 삭제 — Devices.jsx UNIT_SORTS_FOR

## 2026. 10. 3. 0시 11분 15초 · /devices/tablets/stock
- 종류: 메모
- 요소: button.th-btn
- 위치: div.table-wrap > table.data > thead > tr > th:nth-of-type(2) > button.th-btn
- 메모: 함께볼정보 생성하고 분류번호 추가. 디자인가 위치는 다른 메뉴 참고
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — (0시 6분 46초와 같음) 태블릿 함께 볼 정보 + 분류번호

## 2026. 10. 3. 0시 12분 56초 · /as/laptop
- 종류: 글자 수정
- 요소: span.th-btn-label  (글자: "분류번호")
- 위치: table.data > thead > tr > th:nth-of-type(2) > button.th-btn > span.th-btn-label
- 수정: "분류번호" → "시리얼번호"
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — A/S 장비 표의 분류번호 자리를 시리얼번호로(노트북·태블릿·충전함 A/S 공통) — As.jsx

## 2026. 10. 3. 0시 14분 8초 · /rentals/tablet/staff
- 종류: 글자 수정
- 요소: span.th-btn-label  (글자: "확인자")
- 위치: table.data > thead > tr > th:nth-of-type(4) > button.th-btn > span.th-btn-label
- 수정: "확인자" → "반납 확인자"
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 대여 표 "확인자" → "반납 확인자"(모든 대여 표) — Rentals.jsx

## 2026. 10. 3. 0시 14분 35초 · /rentals/other/student
- 종류: 글자 수정
- 요소: span.th-btn-label  (글자: "확인자")
- 위치: table.data > thead > tr > th:nth-of-type(8) > button.th-btn > span.th-btn-label
- 수정: "확인자" → "반납 확인자"
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 위와 같음

## 2026. 10. 3. 14시 15분 57초 · /
- 종류: 메모
- 요소: h2.section-title  (글자: "대여")
- 위치: main#main > div.content.fade > section.card:nth-of-type(1) > h2.section-title
- 메모: 가운데 정렬
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 홈 "대여" 카드 제목 가운데 정렬(Home.jsx 의 section-title-center, styles.css)

## 2026. 10. 3. 14시 16분 1초 · /
- 종류: 메모
- 요소: h2.section-title  (글자: "업무 관리 사이트 바로가기")
- 위치: main#main > div.content.fade > section.card:nth-of-type(2) > h2.section-title
- 메모: 가운데 정렬
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 홈 "업무 관리 사이트 바로가기" 제목 가운데 정렬(같은 클래스)

## 2026. 10. 3. 14시 16분 5초 · /
- 종류: 메모
- 요소: h2.section-title  (글자: "구글 시트 바로가기")
- 위치: main#main > div.content.fade > section.card:nth-of-type(3) > h2.section-title
- 메모: 가운데 정렬
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 홈 "구글 시트 바로가기" 제목 가운데 정렬(같은 클래스)

## 2026. 10. 3. 14시 18분 1초 · /rentals/tablet/student
- 종류: 메모
- 요소: div.table-top:nth-of-type(1)
- 위치: main#main > div.content.fade > section.tabcard:nth-of-type(2) > div.card.tight:nth-of-type(3) > div.table-top:nth-of-type(1)
- 메모: 삭제
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 대여 목록 표 위의 빈 띠 삭제(DataTable bandless, Rentals.jsx — 대여 목록 표 하나라 모든 대여 구분에 같이 적용). 위 접기 버튼도 같이 없어지고 표 아래 "표 접기" 띠로 접음

## 2026. 10. 3. 14시 18분 35초 · /admin
- 종류: 메모
- 요소: div.table-top:nth-of-type(1)
- 위치: main#main > div.content.fade > section > div.card.tight:nth-of-type(3) > div.table-top:nth-of-type(1)
- 메모: 삭제, 현재의 절반 정도 세로 길이의 여백만 주기
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 접속 계정 표 위의 빈 띠 삭제 + 띠 높이(21px)의 절반 정도인 10px 여백만 둠(DataTable bandless·bandGap=10, Admin.jsx)

## 2026. 10. 3. 14시 20분 31초 · /admin
- 종류: 메모
- 요소: a.nav-item:nth-of-type(8)  (글자: "대여")
- 위치: div#root > div.app > header.topbar > div.topbar-card:nth-of-type(2) > nav#main-nav > a.nav-item:nth-of-type(8)
- 메모: 메뉴 순서를 대여, 반별 관리, A/S, 전자기기, 에듀테크, 학교정보, 메뉴얼, 관리자 로 바꿈. 홈 메뉴에서 구글 시트 바로가기도 이 순서로 바꿈
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 상단 메뉴를 대여·반별 관리·A/S·전자기기·Goedu·에듀테크·학교 정보·메뉴얼·관리자 순으로 변경(Layout.jsx MENU; Goedu 는 사용자 확인으로 전자기기 다음). 홈 시트 바로가기 영역 줄도 운영·반별 관리·전자기기·Goedu·학교 정보 순(Home.jsx AREA_ORDER)

## 2026. 10. 3. 23시 52분 41초 · /admin
- 종류: 메모
- 요소: div:nth-of-type(1)
- 위치: main#main > div.content.fade > section > div.card.tight:nth-of-type(3) > div:nth-of-type(1)
- 메모: 삭제
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 관리자 접속 계정 표 위에 남겨 둔 10px 여백 삭제(Admin.jsx 의 bandGap 제거 — 이제 머리글이 카드 맨 위에 붙음)

## 2026. 10. 3. 23시 58분 54초 · /
- 종류: 메모
- 요소: div
- 위치: main#main > div.content.fade > section.card:nth-of-type(1) > div
- 메모: 가운데 정렬
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 홈 "대여" 카드의 대여하기·반납하기 버튼 묶음 가운데 정렬(Home.jsx)

## 2026. 10. 3. 23시 58분 58초 · /
- 종류: 메모
- 요소: div.link-chips
- 위치: main#main > div.content.fade > section.card:nth-of-type(2) > div.link-chips
- 메모: 가운데 정렬
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 홈 "업무 관리 사이트 바로가기" 알약 묶음 가운데 정렬(styles.css .link-chips justify-content:center)

## 2026. 10. 3. 23시 59분 4초 · /
- 종류: 메모
- 요소: section.card:nth-of-type(3)
- 위치: main#main > div.content.fade > section.card:nth-of-type(3)
- 메모: 가운데 정렬, 그러나 6*2 행렬 지켜서
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 홈 "구글 시트 바로가기" 가운데 정렬 — 6줄×2열 격자는 유지(영역 이름은 자기 열 가운데, 알약은 알약 열 가운데, 열 위치·폭은 줄마다 같음)

## 2026. 10. 4. 0시 2분 16초 · /rentals/tablet/student
- 종류: 메모
- 요소: form.search-form.search-form-narrow
- 위치: div.content.fade > section.tabcard:nth-of-type(2) > div.tools-card:nth-of-type(1) > div.table-tools > div.tools-right > form.search-form.search-form-narrow
- 메모: 검색 시 1학년2반, 1학년2반3번, 1학년 2반, 1학년 2반 3번, 1-2, 10203 모두 가능하도록. 이름도 가능
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 대여 목록의 학생 대여 검색이 "1학년2반", "1학년2반3번", "1학년 2반", "1학년 2반 3번", "1-2", "10203" 모두 그 학생·반만 찾음(src/lib/classQuery.js, DataTable classSearch). 이름은 원래대로 검색됨

## 2026. 10. 4. 0시 3분 26초 · /rentals/other/student
- 종류: 메모
- 요소: form.search-form.search-form-narrow
- 위치: div.content.fade > section.tabcard:nth-of-type(2) > div.tools-card:nth-of-type(1) > div.table-tools > div.tools-right > form.search-form.search-form-narrow
- 메모: 예: 최나무, 삼성 -> 예: 장원영 텍스트 변경 모두 적용
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 대여 목록 검색 예시 "예: 최나무, 삼성" → "예: 장원영"(대여 목록 전부 같은 표라 노트북·태블릿·기타 × 학생·교직원 모두), 반납 찾기 이름 칸 예시 "예: 최나무"도 "예: 장원영"(Rentals.jsx)

## 2026. 10. 4. 0시 4분 7초 · /manage/class/cabinets
- 종류: 메모
- 요소: form.search-form.search-form-narrow
- 위치: div.content.fade > section.tabcard > div.tools-card:nth-of-type(1) > div.table-tools > div.tools-right > form.search-form.search-form-narrow
- 메모: 반별 관리 검색 시 1학년2반, 1학년2반3번, 1학년 2반, 1학년 2반 3번, 1-2, 10203 모두 가능하도록. 이름도 가능
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 반별 관리 4개 표(TV·보관함·사이버지킴이·A/S) 검색도 같은 학년·반·번호 검색 + 담임 이름 검색 추가(ClassManage.jsx — classSearch, searchKeys 에 homeroom). 번호가 없는 표는 번호를 따지지 않고 그 반을 찾음. "1-1" 이 "1-10" 을 잡던 문제도 같이 해결

## 2026. 10. 4. 0시 6분 33초 · /edutech/subscribed
- 종류: 메모
- 요소: button.fold-foot
- 위치: main#main > div.content.fade > section.tabcard > div.card.tight:nth-of-type(3) > button.fold-foot
- 메모: 모든 표 접기는 스크롤 절반 이상 내렸을 경우에 처음 생기도록
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 모든 표의 아래 "표 접기" 띠가 표 가운데가 화면 아래 끝 위로 올라온 뒤(표를 절반쯤 내려 본 뒤)에야 나타남(DataTable footShown, styles.css .fold-foot.away — visibility 로 숨겨 자리는 그대로)

## 2026. 10. 4. 0시 7분 6초 · /admin
- 종류: 메모
- 요소: section
- 위치: main#main > div.content.fade > section
- 메모: 검색창과 표 사이에 여백 생기도록. 메뉴얼 메뉴에 있는 검색창 참고
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 관리자 검색창과 표 사이 16px 여백(메뉴얼 검색창-카드 간격과 같게, styles.css .content > section > .tools-card > .table-tools)

## 2026. 10. 4. 0시 26분 34초 · /admin
- 종류: 메모
- 요소: button.fold-foot
- 위치: main#main > div.content.fade > section > div.card.tight:nth-of-type(3) > button.fold-foot
- 메모: 모든 표 접기는 그 페이지의 스크롤 절반 이상 내렸을 경우에 처음 생기도록
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 모든 표의 아래 "표 접기" 띠가 그 페이지를 절반 이상 스크롤해 내린 뒤에야 나타남(DataTable footShown: scrollY ≥ (페이지 길이 − 화면 높이)/2 — 앞서 "표 가운데 기준"으로 해석했던 것을 페이지 스크롤 기준으로 바로잡음). 스크롤할 수 없는 짧은 페이지에선 나타나지 않음

## 2026. 10. 4. 0시 26분 56초 · /edutech/subscribed
- 종류: 메모
- 요소: button.fold-foot
- 위치: main#main > div.content.fade > section.tabcard > div.card.tight:nth-of-type(3) > button.fold-foot
- 메모: 모든 표 접기는 그 페이지의 스크롤 절반 이상 내렸을 경우에 처음 생기도록
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 위와 같음(같은 요청이 화면마다 반복 — DataTable 공용이라 모든 표에 한 번에 적용)

## 2026. 10. 4. 0시 27분 11초 · /goedu/teachers
- 종류: 메모
- 요소: button.fold-foot
- 위치: main#main > div.content.fade > section.tabcard > div.card.tight:nth-of-type(3) > button.fold-foot
- 메모: 모든 표 접기는 그 페이지의 스크롤 절반 이상 내렸을 경우에 처음 생기도록
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 위와 같음(같은 요청이 화면마다 반복 — DataTable 공용이라 모든 표에 한 번에 적용)

## 2026. 10. 4. 0시 27분 21초 · /devices/cabinets/units
- 종류: 메모
- 요소: button.fold-foot
- 위치: div.content.fade > section.tabcard > section > div.units-body > div.card.tight:nth-of-type(3) > button.fold-foot
- 메모: 모든 표 접기는 그 페이지의 스크롤 절반 이상 내렸을 경우에 처음 생기도록
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 위와 같음(같은 요청이 화면마다 반복 — DataTable 공용이라 모든 표에 한 번에 적용)

## 2026. 10. 4. 0시 27분 27초 · /devices/tablets/stock
- 종류: 메모
- 요소: button.fold-foot
- 위치: div.content.fade > section.tabcard > section > div.units-body > div.card.tight:nth-of-type(3) > button.fold-foot
- 메모: 모든 표 접기는 그 페이지의 스크롤 절반 이상 내렸을 경우에 처음 생기도록
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 위와 같음(같은 요청이 화면마다 반복 — DataTable 공용이라 모든 표에 한 번에 적용)

## 2026. 10. 4. 0시 27분 33초 · /devices/laptops/staff
- 종류: 메모
- 요소: button.fold-foot
- 위치: main#main > div.content.fade > section.tabcard > div.card.tight:nth-of-type(3) > button.fold-foot
- 메모: 모든 표 접기는 그 페이지의 스크롤 절반 이상 내렸을 경우에 처음 생기도록
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 위와 같음(같은 요청이 화면마다 반복 — DataTable 공용이라 모든 표에 한 번에 적용)

## 2026. 10. 4. 0시 27분 42초 · /as/laptop
- 종류: 메모
- 요소: button.fold-foot
- 위치: main#main > div.content.fade > section.tabcard > div.card.tight:nth-of-type(3) > button.fold-foot
- 메모: 모든 표 접기는 그 페이지의 스크롤 절반 이상 내렸을 경우에 처음 생기도록
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 위와 같음(같은 요청이 화면마다 반복 — DataTable 공용이라 모든 표에 한 번에 적용)

## 2026. 10. 4. 0시 27분 51초 · /manage/class/cyber
- 종류: 메모
- 요소: button.fold-foot
- 위치: main#main > div.content.fade > section.tabcard > div.card.tight:nth-of-type(3) > button.fold-foot
- 메모: 모든 표 접기는 그 페이지의 스크롤 절반 이상 내렸을 경우에 처음 생기도록
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 위와 같음(같은 요청이 화면마다 반복 — DataTable 공용이라 모든 표에 한 번에 적용)

## 2026. 10. 4. 0시 27분 58초 · /rentals/tablet/student
- 종류: 메모
- 요소: button.fold-foot
- 위치: main#main > div.content.fade > section.tabcard:nth-of-type(2) > div.card.tight:nth-of-type(3) > button.fold-foot
- 메모: 모든 표 접기는 그 페이지의 스크롤 절반 이상 내렸을 경우에 처음 생기도록
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 위와 같음(같은 요청이 화면마다 반복 — DataTable 공용이라 모든 표에 한 번에 적용)

## 2026. 10. 4. 0시 39분 1초 · /edutech/subscribed
- 종류: 메모
- 요소: div.card.tight:nth-of-type(3)
- 위치: main#main > div.content.fade > section.tabcard > div.card.tight:nth-of-type(3)
- 메모: 표가 아래에 끝나면 여백없이 맞춰서 디자인
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 아래 "표 접기" 띠를 자리를 차지하지 않는 화면 아래 떠 있는 띠로 바꿈 — 표가 끝나는 곳(마지막 줄 바로 아래)에서 카드가 여백 없이 끝나고, 띠는 페이지 절반 이상 내렸고 표 끝이 아직 멀 때만 나타남(표 끝이 가까워지면 사라짐). 띠가 나타나도 아래 내용이 밀리지 않음(styles.css .fold-foot 높이 0 + .fold-foot-bar, DataTable footShown)

## 2026. 10. 4. 0시 39분 24초 · /admin
- 종류: 메모
- 요소: div.card.tight:nth-of-type(3)
- 위치: main#main > div.content.fade > section > div.card.tight:nth-of-type(3)
- 메모: 표가 끝나면 여백없게 맞춰서 디자인
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 위와 같음(관리자 표도 같은 공용 부품이라 함께 적용)

## 2026. 10. 6. 12시 4분 56초 · /
- 종류: 메모
- 요소: a.btn.sm
- 위치: div#root > div.app > header.topbar > div.topbar-strip:nth-of-type(1) > a.btn.sm
- 메모: 누르면 https://docs.google.com/spreadsheets/d/1kAap725TFUSdJYkPYBRV3bddZXdn7I-UxHF2NjzJ3ac/edit?gid=1967437725#gid=1967437725 로 연결
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 데이터(시트 링크 탭)라 코드 수정 안 함, 키별 URL 표로 정리해 전달

## 2026. 10. 6. 12시 5분 24초 · /
- 종류: 메모
- 요소: a.link-chip:nth-of-type(1)  (글자: "대여")
- 위치: div.content.fade > section.card:nth-of-type(3) > ul.sheet-rows > li.sheet-row:nth-of-type(1) > div.link-chips > a.link-chip:nth-of-type(1)
- 메모: 누르면 연결 https://docs.google.com/spreadsheets/d/1kAap725TFUSdJYkPYBRV3bddZXdn7I-UxHF2NjzJ3ac/edit?gid=1123971576#gid=1123971576
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 데이터(시트 링크 탭)라 코드 수정 안 함, 키별 URL 표로 정리해 전달

## 2026. 10. 6. 12시 5분 39초 · /
- 종류: 메모
- 요소: a.link-chip:nth-of-type(2)  (글자: "메뉴얼")
- 위치: div.content.fade > section.card:nth-of-type(3) > ul.sheet-rows > li.sheet-row:nth-of-type(1) > div.link-chips > a.link-chip:nth-of-type(2)
- 메모: 누르면 연결 https://docs.google.com/spreadsheets/d/1kAap725TFUSdJYkPYBRV3bddZXdn7I-UxHF2NjzJ3ac/edit?gid=2045118370#gid=2045118370
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 데이터(시트 링크 탭)라 코드 수정 안 함, 키별 URL 표로 정리해 전달

## 2026. 10. 6. 12시 5분 51초 · /
- 종류: 메모
- 요소: a.link-chip:nth-of-type(3)  (글자: "에듀테크")
- 위치: div.content.fade > section.card:nth-of-type(3) > ul.sheet-rows > li.sheet-row:nth-of-type(1) > div.link-chips > a.link-chip:nth-of-type(3)
- 메모: 누르면 연결 https://docs.google.com/spreadsheets/d/1kAap725TFUSdJYkPYBRV3bddZXdn7I-UxHF2NjzJ3ac/edit?gid=582994925#gid=582994925
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 데이터(시트 링크 탭)라 코드 수정 안 함, 키별 URL 표로 정리해 전달

## 2026. 10. 6. 12시 6분 6초 · /
- 종류: 메모
- 요소: a.link-chip:nth-of-type(4)  (글자: "링크")
- 위치: div.content.fade > section.card:nth-of-type(3) > ul.sheet-rows > li.sheet-row:nth-of-type(1) > div.link-chips > a.link-chip:nth-of-type(4)
- 메모: 누르면 연결 https://docs.google.com/spreadsheets/d/1kAap725TFUSdJYkPYBRV3bddZXdn7I-UxHF2NjzJ3ac/edit?gid=906667530#gid=906667530
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 데이터(시트 링크 탭)라 코드 수정 안 함, 키별 URL 표로 정리해 전달

## 2026. 10. 6. 12시 6분 20초 · /
- 종류: 메모
- 요소: a.link-chip:nth-of-type(1)  (글자: "반별TV")
- 위치: div.content.fade > section.card:nth-of-type(3) > ul.sheet-rows > li.sheet-row:nth-of-type(2) > div.link-chips > a.link-chip:nth-of-type(1)
- 메모: 누르면 연결 https://docs.google.com/spreadsheets/d/1kAap725TFUSdJYkPYBRV3bddZXdn7I-UxHF2NjzJ3ac/edit?gid=460638722#gid=460638722
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 데이터(시트 링크 탭)라 코드 수정 안 함, 키별 URL 표로 정리해 전달

## 2026. 10. 6. 12시 6분 31초 · /
- 종류: 메모
- 요소: a.link-chip:nth-of-type(2)  (글자: "반별AS")
- 위치: div.content.fade > section.card:nth-of-type(3) > ul.sheet-rows > li.sheet-row:nth-of-type(2) > div.link-chips > a.link-chip:nth-of-type(2)
- 메모: 누르면 연결 https://docs.google.com/spreadsheets/d/1kAap725TFUSdJYkPYBRV3bddZXdn7I-UxHF2NjzJ3ac/edit?gid=756994223#gid=756994223
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 데이터(시트 링크 탭)라 코드 수정 안 함, 키별 URL 표로 정리해 전달

## 2026. 10. 6. 12시 6분 41초 · /
- 종류: 메모
- 요소: a.link-chip:nth-of-type(3)  (글자: "태블릿보관함")
- 위치: div.content.fade > section.card:nth-of-type(3) > ul.sheet-rows > li.sheet-row:nth-of-type(2) > div.link-chips > a.link-chip:nth-of-type(3)
- 메모: 누르면 연결 https://docs.google.com/spreadsheets/d/1kAap725TFUSdJYkPYBRV3bddZXdn7I-UxHF2NjzJ3ac/edit?gid=1352424297#gid=1352424297
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 데이터(시트 링크 탭)라 코드 수정 안 함, 키별 URL 표로 정리해 전달

## 2026. 10. 6. 12시 6분 53초 · /
- 종류: 메모
- 요소: a.link-chip:nth-of-type(4)  (글자: "AS기록")
- 위치: div.content.fade > section.card:nth-of-type(3) > ul.sheet-rows > li.sheet-row:nth-of-type(2) > div.link-chips > a.link-chip:nth-of-type(4)
- 메모: 누르면 연결 https://docs.google.com/spreadsheets/d/1kAap725TFUSdJYkPYBRV3bddZXdn7I-UxHF2NjzJ3ac/edit?gid=657834925#gid=657834925
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 데이터(시트 링크 탭)라 코드 수정 안 함, 키별 URL 표로 정리해 전달

## 2026. 10. 6. 12시 7분 5초 · /
- 종류: 메모
- 요소: a.link-chip:nth-of-type(1)  (글자: "전자기기")
- 위치: div.content.fade > section.card:nth-of-type(3) > ul.sheet-rows > li.sheet-row:nth-of-type(3) > div.link-chips > a.link-chip:nth-of-type(1)
- 메모: 누르면 연결 https://docs.google.com/spreadsheets/d/1kAap725TFUSdJYkPYBRV3bddZXdn7I-UxHF2NjzJ3ac/edit?gid=1171978699#gid=1171978699
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 데이터(시트 링크 탭)라 코드 수정 안 함, 키별 URL 표로 정리해 전달

## 2026. 10. 6. 12시 7분 20초 · /
- 종류: 메모
- 요소: a.link-chip:nth-of-type(2)  (글자: "전자기기_개별")
- 위치: div.content.fade > section.card:nth-of-type(3) > ul.sheet-rows > li.sheet-row:nth-of-type(3) > div.link-chips > a.link-chip:nth-of-type(2)
- 메모: 누르면 연결 https://docs.google.com/spreadsheets/d/1kAap725TFUSdJYkPYBRV3bddZXdn7I-UxHF2NjzJ3ac/edit?gid=1628181846#gid=1628181846
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 데이터(시트 링크 탭)라 코드 수정 안 함, 키별 URL 표로 정리해 전달

## 2026. 10. 6. 12시 7분 29초 · /
- 종류: 메모
- 요소: a.link-chip:nth-of-type(3)  (글자: "보유현황_제출본")
- 위치: div.content.fade > section.card:nth-of-type(3) > ul.sheet-rows > li.sheet-row:nth-of-type(3) > div.link-chips > a.link-chip:nth-of-type(3)
- 메모: 누르면 연결 https://docs.google.com/spreadsheets/d/1kAap725TFUSdJYkPYBRV3bddZXdn7I-UxHF2NjzJ3ac/edit?gid=666261095#gid=666261095
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 데이터(시트 링크 탭)라 코드 수정 안 함, 키별 URL 표로 정리해 전달

## 2026. 10. 6. 12시 7분 42초 · /
- 종류: 메모
- 요소: a.link-chip:nth-of-type(1)  (글자: "교사goedu")
- 위치: div.content.fade > section.card:nth-of-type(3) > ul.sheet-rows > li.sheet-row:nth-of-type(4) > div.link-chips > a.link-chip:nth-of-type(1)
- 메모: 누르면 연결 https://docs.google.com/spreadsheets/d/1kAap725TFUSdJYkPYBRV3bddZXdn7I-UxHF2NjzJ3ac/edit?gid=354379754#gid=354379754
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 데이터(시트 링크 탭)라 코드 수정 안 함, 키별 URL 표로 정리해 전달

## 2026. 10. 6. 12시 7분 54초 · /
- 종류: 메모
- 요소: a.link-chip:nth-of-type(2)  (글자: "학생goedu")
- 위치: div.content.fade > section.card:nth-of-type(3) > ul.sheet-rows > li.sheet-row:nth-of-type(4) > div.link-chips > a.link-chip:nth-of-type(2)
- 메모: 누르면 연결 https://docs.google.com/spreadsheets/d/1kAap725TFUSdJYkPYBRV3bddZXdn7I-UxHF2NjzJ3ac/edit?gid=544101048#gid=544101048
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 데이터(시트 링크 탭)라 코드 수정 안 함, 키별 URL 표로 정리해 전달

## 2026. 10. 6. 12시 8분 9초 · /
- 종류: 메모
- 요소: a.link-chip:nth-of-type(1)  (글자: "교직원")
- 위치: div.content.fade > section.card:nth-of-type(3) > ul.sheet-rows > li.sheet-row:nth-of-type(5) > div.link-chips > a.link-chip:nth-of-type(1)
- 메모: 누르면 연결 https://docs.google.com/spreadsheets/d/1kAap725TFUSdJYkPYBRV3bddZXdn7I-UxHF2NjzJ3ac/edit?gid=142560455#gid=142560455
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 데이터(시트 링크 탭)라 코드 수정 안 함, 키별 URL 표로 정리해 전달

## 2026. 10. 6. 12시 8분 20초 · /
- 종류: 메모
- 요소: a.link-chip:nth-of-type(2)  (글자: "학생")
- 위치: div.content.fade > section.card:nth-of-type(3) > ul.sheet-rows > li.sheet-row:nth-of-type(5) > div.link-chips > a.link-chip:nth-of-type(2)
- 메모: 누르면 연결 https://docs.google.com/spreadsheets/d/1kAap725TFUSdJYkPYBRV3bddZXdn7I-UxHF2NjzJ3ac/edit?gid=142560455#gid=142560455
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 데이터(시트 링크 탭)라 코드 수정 안 함, 키별 URL 표로 정리해 전달

## 2026. 10. 6. 12시 8분 29초 · /
- 종류: 메모
- 요소: a.link-chip:nth-of-type(3)  (글자: "학급")
- 위치: div.content.fade > section.card:nth-of-type(3) > ul.sheet-rows > li.sheet-row:nth-of-type(5) > div.link-chips > a.link-chip:nth-of-type(3)
- 메모: 누르면 연결 https://docs.google.com/spreadsheets/d/1kAap725TFUSdJYkPYBRV3bddZXdn7I-UxHF2NjzJ3ac/edit?gid=1065398665#gid=1065398665
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 데이터(시트 링크 탭)라 코드 수정 안 함, 키별 URL 표로 정리해 전달

## 2026. 10. 6. 12시 8분 41초 · /
- 종류: 메모
- 요소: a.link-chip:nth-of-type(4)  (글자: "사이버지킴이")
- 위치: div.content.fade > section.card:nth-of-type(3) > ul.sheet-rows > li.sheet-row:nth-of-type(5) > div.link-chips > a.link-chip:nth-of-type(4)
- 메모: 누르면 연결 https://docs.google.com/spreadsheets/d/1kAap725TFUSdJYkPYBRV3bddZXdn7I-UxHF2NjzJ3ac/edit?gid=498576785#gid=498576785
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 데이터(시트 링크 탭)라 코드 수정 안 함, 키별 URL 표로 정리해 전달

## 2026. 10. 6. 12시 9분 14초 · /
- 종류: 메모
- 요소: a.link-chip:nth-of-type(1)  (글자: "노트북")
- 위치: div.content.fade > section.card:nth-of-type(3) > ul.sheet-rows > li.sheet-row:nth-of-type(6) > div.link-chips > a.link-chip:nth-of-type(1)
- 메모: 누르면 연결 https://docs.google.com/spreadsheets/d/1kAap725TFUSdJYkPYBRV3bddZXdn7I-UxHF2NjzJ3ac/edit?gid=1628181846#gid=1628181846
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 데이터(시트 링크 탭)라 코드 수정 안 함, 키별 URL 표로 정리해 전달

## 2026. 10. 6. 12시 10분 1초 · /
- 종류: 메모
- 요소: a.link-chip:nth-of-type(2)  (글자: "보유태블릿")
- 위치: div.content.fade > section.card:nth-of-type(3) > ul.sheet-rows > li.sheet-row:nth-of-type(6) > div.link-chips > a.link-chip:nth-of-type(2)
- 메모: 누르면 연결 https://docs.google.com/spreadsheets/d/1kAap725TFUSdJYkPYBRV3bddZXdn7I-UxHF2NjzJ3ac/edit?gid=1628181846#gid=1628181846
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 데이터(시트 링크 탭)라 코드 수정 안 함, 키별 URL 표로 정리해 전달

## 2026. 10. 6. 12시 10분 32초 · /
- 종류: 메모
- 요소: a.link-chip:nth-of-type(3)  (글자: "MDM 관리 시스템")
- 위치: main#main > div.content.fade > section.card:nth-of-type(2) > div.link-chips > a.link-chip:nth-of-type(3)
- 메모: 누르면 연결 https://mdm.goe.go.kr/onm/mas/login/loginExt.html#first
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 데이터(시트 링크 탭)라 코드 수정 안 함, 키별 URL 표로 정리해 전달

## 2026. 10. 6. 12시 10분 54초 · /
- 종류: 메모
- 요소: a.link-chip:nth-of-type(2)  (글자: "GSMS")
- 위치: main#main > div.content.fade > section.card:nth-of-type(2) > div.link-chips > a.link-chip:nth-of-type(2)
- 메모: 누르면 연결 https://gsms.goe.go.kr/
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 데이터(시트 링크 탭)라 코드 수정 안 함, 키별 URL 표로 정리해 전달

## 2026. 10. 6. 13시 35분 13초 · /
- 종류: 메모
- 요소: a.link-chip:nth-of-type(9)  (글자: "전자기기_개별_데스크톱")
- 위치: div.content.fade > section.card:nth-of-type(3) > ul.sheet-rows > li.sheet-row:nth-of-type(3) > div.link-chips > a.link-chip:nth-of-type(9)
- 메모: 전자기기_개별_노트북 버튼의 왼쪽으로 위치 변경
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 개별 장비 탭 순서를 데스크톱 → 노트북 → 태블릿 → 태블릿보관함으로(보유_* 탭과 같은 순서) — shared/sheet-schema.js UNIT_TABS

## 2026. 10. 6. 13시 35분 22초 · /
- 종류: 메모
- 요소: li.sheet-row:nth-of-type(6)
- 위치: main#main > div.content.fade > section.card:nth-of-type(3) > ul.sheet-rows > li.sheet-row:nth-of-type(6)
- 메모: 삭제
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 시트 링크 탭의 옛 링크 2줄(sheet:노트북, sheet:보유태블릿)을 삭제해 "기타" 줄이 없어짐(동기화 후 반영), 코드 수정 없음

## 2026. 10. 6. 13시 36분 5초 · /
- 종류: 메모
- 요소: div.link-chips
- 위치: main#main > div.content.fade > section.card:nth-of-type(2) > div.link-chips
- 메모: 같은 디자인으로 mdm관리 시스템 옆에 나래 A/S 만들고, https://dynarae/net/ 으로 연결되도록
- 화면: 정보부 업무 관리 · 1280×719
- 상태: [x] 처리됨 — 시트 링크 탭에 work:dynarae "나래 A/S" 줄 추가(주소는 https://dynarae.net/ 로 보정), 코드 수정 없음

