# FootGo VN -- Coding Rules

문서 버전: 1.0\
대상: React Native + Expo + TypeScript + Supabase\
목적: FootGo VN 프로젝트의 코드 작성 규칙과 구조를 통일한다.

------------------------------------------------------------------------

# 1. 문서 목적

이 문서는 FootGo VN 프로젝트에서 사람이 직접 작성하는 코드와 AI가
생성하는 코드의 품질을 통일하기 위한 기준 문서다.

목표

-   코드 구조 일관성 유지
-   기능별 파일 배치 기준 고정
-   상태관리 방식 통일
-   Supabase 접근 방식 통일
-   UI / 비즈니스 로직 / 데이터 접근 분리
-   AI 코드 생성 시 프로젝트 붕괴 방지

------------------------------------------------------------------------

# 2. 기본 기술 규칙

## 2.1 필수 스택

-   React Native
-   Expo
-   TypeScript
-   Supabase
-   React Query
-   Zustand

## 2.2 금지 사항

-   JavaScript 파일 사용 금지
-   any 남용 금지
-   화면 컴포넌트 내부에 긴 비즈니스 로직 작성 금지
-   화면 컴포넌트 내부에 직접 SQL 개념이나 복잡한 쿼리 로직 작성 금지
-   하나의 파일에 UI, 상태, API 호출, 검증 로직을 전부 몰아넣는 방식
    금지

## 2.3 기본 원칙

-   모든 신규 파일은 TypeScript 기준으로 작성
-   기능 단위 구조를 우선 사용
-   재사용 가능한 로직은 훅 또는 서비스로 분리
-   데이터 접근은 service/repository 레이어를 통해 수행
-   서버 상태와 UI 상태를 분리해서 관리

------------------------------------------------------------------------

# 3. 디렉토리 구조 규칙

프로젝트 기본 구조는 아래를 따른다.

``` text
src/
  app/
  core/
    config/
    constants/
    lib/
    theme/
    types/
    utils/
  features/
    auth/
    profile/
    teams/
    matches/
    leagues/
    attendance/
    notifications/
    payments/
    media/
  shared/
    components/
    ui/
    hooks/
  services/
    supabase/
    api/
  store/
```

------------------------------------------------------------------------

# 4. 폴더 역할 정의

## 4.1 app

-   앱 엔트리
-   라우팅 연결
-   전역 provider 등록
-   앱 부팅 시 필요한 초기화

## 4.2 core

앱 전체에서 공통으로 사용하는 요소

예시

-   env 설정
-   상수
-   공용 타입
-   테마
-   날짜 유틸
-   에러 유틸
-   포맷 함수

## 4.3 features

기능 단위 폴더

예시

-   auth
-   teams
-   matches
-   leagues

각 feature 내부에는 다음 구조를 권장한다.

``` text
features/teams/
  api/
  components/
  hooks/
  screens/
  types/
  utils/
```

## 4.4 shared

여러 feature에서 재사용하는 범용 코드

예시

-   공통 버튼
-   공통 카드
-   공통 모달
-   공통 훅

## 4.5 services

외부 시스템 접근 레이어

예시

-   supabase client
-   API wrapper
-   storage helper
-   push notification helper

## 4.6 store

전역 상태 저장

예시

-   auth session 상태
-   onboarding 진행 상태
-   임시 UI 플래그

------------------------------------------------------------------------

# 5. 네이밍 규칙

## 5.1 파일명

-   컴포넌트: PascalCase
-   훅: use + PascalCase
-   유틸: camelCase 또는 kebab-case 금지, camelCase 함수명 사용
-   스토어: xxx.store.ts
-   타입: xxx.types.ts
-   API: xxx.api.ts
-   서비스: xxx.service.ts

예시

-   TeamCard.tsx
-   MatchResultScreen.tsx
-   useTeamMembers.ts
-   teams.api.ts
-   payments.service.ts
-   matches.types.ts
-   auth.store.ts

## 5.2 변수명

-   의미 없는 축약어 금지
-   단수 / 복수 구분 명확히
-   boolean은 is / has / can / should 접두사 사용

예시

-   isLoading
-   hasAccepted
-   canEdit
-   shouldRefetch

## 5.3 상수명

상수는 UPPER_SNAKE_CASE 사용

예시

-   MAX_TEAM_MEMBER_COUNT
-   DEFAULT_MMR
-   RESULT_AUTO_FINALIZE_HOURS

------------------------------------------------------------------------

# 6. TypeScript 규칙

## 6.1 필수 규칙

-   모든 함수 파라미터 타입 명시
-   반환 타입 추론이 불명확하면 반환 타입 명시
-   any 사용 금지
-   unknown 사용 후 좁히기 허용
-   null / undefined 처리 명확히

## 6.2 타입 선언 위치

-   feature 내부에서만 쓰는 타입은 해당 feature/types에 선언
-   여러 feature가 공유하는 타입은 core/types에 선언

## 6.3 타입 우선순위

1.  Supabase generated types
2.  feature 전용 도메인 타입
3.  UI 전용 view model 타입

------------------------------------------------------------------------

# 7. 컴포넌트 작성 규칙

## 7.1 컴포넌트 분류

### 화면 컴포넌트

-   screens/
-   라우팅 단위
-   데이터 조합
-   큰 흐름 제어

### 프레젠테이셔널 컴포넌트

-   components/
-   props 기반 렌더링
-   비즈니스 로직 최소화

## 7.2 규칙

-   한 화면 컴포넌트 파일이 너무 길어지면 하위 컴포넌트로 분리
-   300줄 이상 화면 파일은 분리 검토
-   렌더링만 담당하는 UI 컴포넌트에는 API 호출 넣지 않음
-   props 타입은 명시적으로 선언

## 7.3 금지 사항

-   컴포넌트 내부에서 직접 Supabase 호출 반복
-   컴포넌트 내부에서 복잡한 권한 검사 반복
-   인라인 함수 과도 사용
-   지나치게 깊은 props drilling

------------------------------------------------------------------------

# 8. 훅 작성 규칙

## 8.1 용도

커스텀 훅은 다음 용도로 작성한다.

-   데이터 조회
-   mutation 래핑
-   화면 상태 조합
-   재사용 로직 분리

## 8.2 규칙

-   React Query 기반 조회 훅은 `useXxxQuery` 형태 권장
-   mutation 훅은 `useXxxMutation` 형태 권장
-   UI 전용 훅과 서버 상태 훅을 섞지 않음

예시

-   useTeamDetailQuery
-   useCreateMatchMutation
-   useAttendanceVoteMutation

## 8.3 금지 사항

-   하나의 훅에서 너무 많은 unrelated 상태를 다루지 않음
-   훅 내부에서 네비게이션 직접 제어 최소화
-   훅 내부에서 alert 남발 금지

------------------------------------------------------------------------

# 9. 상태관리 규칙

## 9.1 React Query

서버 상태는 React Query로 관리한다.

대상

-   팀 목록
-   경기 목록
-   경기 상세
-   리그 순위
-   알림 목록

규칙

-   query key를 일관되게 사용
-   mutation 후 관련 query invalidate
-   낙관적 업데이트는 신중하게 사용
-   결제 / 결과 확정 / 분쟁은 낙관적 업데이트 금지

## 9.2 Zustand

클라이언트 전역 상태는 Zustand로 관리한다.

대상 예시

-   로그인 세션 캐시
-   임시 온보딩 상태
-   앱 전역 필터
-   비휘발성 UI 상태

## 9.3 금지 사항

-   서버 응답 데이터를 Zustand에 중복 저장 금지
-   React Query로 충분한 데이터를 또 별도 store에 저장 금지

------------------------------------------------------------------------

# 10. Supabase 접근 규칙

## 10.1 공통 원칙

-   Supabase client는 단일 인스턴스를 사용
-   직접 접근은 services/supabase 아래에서 관리
-   화면 컴포넌트에서 직접 `.from()` 체인을 길게 작성하지 않음

## 10.2 권장 구조

``` text
services/
  supabase/
    client.ts
    auth.service.ts
    teams.service.ts
    matches.service.ts
    payments.service.ts
```

## 10.3 규칙

-   단순 조회는 service 함수로 래핑
-   복잡한 비즈니스 로직은 Edge Function 우선
-   DB write는 가능하면 service 또는 mutation layer에서만 수행

## 10.4 금지 사항

-   여러 화면에서 동일한 Supabase 쿼리 복붙 금지
-   권한이 중요한 로직을 클라이언트에서 확정 금지
-   결제 성공 여부를 클라이언트에서 최종 판단 금지
-   경기 결과 확정을 클라이언트 로직만으로 처리 금지

------------------------------------------------------------------------

# 11. API / Service 작성 규칙

## 11.1 함수 구조

모든 service 함수는 다음 원칙을 따른다.

-   입력 타입 명시
-   출력 타입 명시
-   실패 시 throw 또는 표준 에러 반환
-   side effect 최소화

예시

``` ts
export async function getTeamById(teamId: string): Promise<TeamDetail> {
  // ...
}
```

## 11.2 에러 처리

-   서비스 레이어에서 원시 에러를 그대로 UI로 던지지 않음
-   가능한 경우 도메인 에러로 변환
-   UI에서는 사용자 메시지와 개발자 로그를 분리

## 11.3 반환 구조

가능하면 다음 둘 중 하나로 통일

1.  성공 시 타입 반환, 실패 시 throw
2.  Result 패턴 반환

프로젝트 초기에는 1번 방식 권장

------------------------------------------------------------------------

# 12. React Query 키 규칙

쿼리 키는 배열 형태를 사용한다.

예시

``` ts
["profile", userId]
["team", teamId]
["team-members", teamId]
["matches", teamId]
["match", matchId]
["league-standings", seasonId]
["notifications", userId]
```

규칙

-   문자열 단일 키 사용 금지
-   식별자를 항상 포함
-   feature prefix 유지

------------------------------------------------------------------------

# 13. 화면 개발 규칙

## 13.1 화면 책임

화면은 아래 책임만 가진다.

-   라우트 파라미터 수신
-   필요한 query 호출
-   mutation 트리거
-   화면 조립
-   로딩 / 에러 / 빈 상태 표시

## 13.2 화면이 하면 안 되는 것

-   직접 SQL 구조 결정
-   복잡한 데이터 정규화
-   여러 단계의 권한 계산 반복
-   결제 검증 로직 처리
-   경기 결과 최종 확정 처리

------------------------------------------------------------------------

# 14. 폼 처리 규칙

-   폼은 화면과 분리 가능하면 분리
-   검증은 schema 기반 권장
-   입력값 검증 실패 시 사용자 메시지 명확히 표시

권장 라이브러리

-   react-hook-form
-   zod

예시

-   팀 생성 폼
-   경기 생성 폼
-   프로필 수정 폼

------------------------------------------------------------------------

# 15. 에러 처리 규칙

## 15.1 분류

에러는 아래 3종류로 구분한다.

-   사용자 입력 에러
-   네트워크 / 서버 에러
-   권한 에러

## 15.2 UI 규칙

-   사용자 입력 에러: 필드 단위 안내
-   네트워크 에러: 재시도 가능 메시지
-   권한 에러: 접근 불가 안내

## 15.3 로그 규칙

-   콘솔 로그 남발 금지
-   개발 환경에서만 debug log 허용
-   운영 환경 에러는 Sentry 등으로 수집

------------------------------------------------------------------------

# 16. 로딩 / 빈 상태 / 오류 상태 규칙

모든 주요 화면은 아래 3가지를 반드시 가진다.

-   loading state
-   empty state
-   error state

예시

-   팀 목록이 없을 때
-   경기 데이터가 로딩 중일 때
-   네트워크 실패 시

이 상태들을 누락하지 않는다.

------------------------------------------------------------------------

# 17. 권한 처리 규칙

권한은 아래 순서로 처리한다.

1.  서버에서 1차 보호
2.  클라이언트에서 UI 가드
3.  사용자 메시지 표시

예시

-   주장만 결과 수락 버튼 노출
-   심판만 결과 입력 버튼 노출
-   관리자만 분쟁 해결 화면 접근

중요

UI에서 숨긴다고 보안이 되는 것이 아니다.\
반드시 RLS와 Edge Function 권한 검사를 함께 둔다.

------------------------------------------------------------------------

# 18. 날짜 / 시간 처리 규칙

-   서버 저장은 UTC 기준
-   클라이언트 표시만 로컬 시간대로 변환
-   날짜 포맷 함수는 공통 util 사용
-   문자열 직접 파싱 남발 금지

예시

-   scheduled_at
-   auto_finalize_at
-   paid_at

------------------------------------------------------------------------

# 19. 스타일링 규칙

## 19.1 원칙

-   스타일 방식은 프로젝트 전체에서 통일
-   인라인 스타일 남용 금지
-   색상, 간격, 폰트 크기는 토큰화

## 19.2 권장 방식

둘 중 하나를 프로젝트 초기에 고정

1.  StyleSheet 기반
2.  NativeWind 기반

MVP에서는 하나만 선택하고 혼용하지 않는다.

## 19.3 공통 테마

core/theme 아래에 정의

예시

-   colors
-   spacing
-   typography
-   radius

------------------------------------------------------------------------

# 20. 테스트 규칙

## 20.1 우선순위

1.  핵심 비즈니스 로직
2.  service 함수
3.  주요 훅
4.  핵심 화면 흐름

## 20.2 우선 테스트 대상

-   로그인 후 프로필 생성
-   팀 생성
-   경기 생성
-   출석 투표
-   결과 입력
-   결과 수락
-   리그 순위 반영

## 20.3 원칙

-   작은 단위부터 테스트
-   핵심 흐름은 통합 테스트 우선
-   UI 스냅샷 테스트 남발 금지

------------------------------------------------------------------------

# 21. Git / 브랜치 규칙

## 21.1 브랜치 이름

형식

``` text
feature/auth-login
feature/team-create
fix/match-result-bug
refactor/team-service
```

## 21.2 커밋 메시지

형식

``` text
feat: add team creation flow
fix: handle invalid invite code
refactor: split match service logic
docs: update api spec
```

------------------------------------------------------------------------

# 22. AI 코드 생성 규칙

AI에게 코드를 요청할 때는 반드시 아래 단위로 요청한다.

좋은 방식

-   팀 생성 화면만 구현해줘
-   matches service만 구현해줘
-   attendance vote mutation 훅만 작성해줘
-   match result 제출용 Edge Function만 작성해줘

나쁜 방식

-   FootGo 전체 앱 한 번에 만들어줘

추가 규칙

-   항상 관련 문서를 함께 제공
-   ERD, API Spec, RLS, Coding Rules 기준으로 작성 요구
-   한 번에 여러 feature를 동시에 수정하도록 요청하지 않음

------------------------------------------------------------------------

# 23. 금지 패턴 모음

다음 패턴은 금지한다.

-   any 남용
-   거대한 단일 컴포넌트
-   화면 내부 직접 데이터 접근 남발
-   비즈니스 로직과 UI 강결합
-   React Query와 Zustand 중복 저장
-   권한 검사를 UI에만 의존
-   결제 완료를 클라이언트 콜백만으로 확정
-   경기 결과 확정을 프론트 로직만으로 처리
-   반복 쿼리 복붙
-   타입 없는 API 응답 처리

------------------------------------------------------------------------

# 24. 권장 구현 순서

코드는 아래 순서로 구현한다.

1.  타입 정의
2.  service 함수 정의
3.  query / mutation 훅 작성
4.  화면 컴포넌트 작성
5.  하위 UI 컴포넌트 분리
6.  에러 / 로딩 / 빈 상태 보완

------------------------------------------------------------------------

# 25. 문서 우선순위

개발 시 아래 문서를 항상 함께 참고한다.

-   FootGo_Tech_Spec.md
-   FootGo_Database_ERD.md
-   FootGo_API_Spec.md
-   FootGo_RLS_Policies.md
-   FootGo_Feature_Task_Order.md
-   FootGo_Coding_Rules.md

------------------------------------------------------------------------

# 26. 최종 원칙

FootGo 프로젝트의 모든 코드는 다음 기준을 만족해야 한다.

-   읽기 쉬워야 한다
-   수정하기 쉬워야 한다
-   역할이 분리되어 있어야 한다
-   타입이 명확해야 한다
-   권한과 보안이 서버 기준으로 보호되어야 한다
-   AI가 이어서 작업해도 구조가 무너지지 않아야 한다

------------------------------------------------------------------------

# End of Document

# --- Documentation Upgrade Additions (v1.2) ---

## Match Result State Machine

States: draft → submitted → awaiting_confirmation → finalized\
awaiting_confirmation → disputed\
awaiting_confirmation → auto_finalized

Rules: - Only referee can submit results. - Both captains must confirm
to finalize. - Reject creates dispute. - 24h timeout triggers
auto_finalized. - Finalized results cannot be modified.

## Read / Write Architecture Principle

Read: Supabase REST / Query

Write: Edge Functions only.

Critical server functions: - submit-match-result -
confirm-match-result - open-match-dispute - resolve-dispute -
verify-payment-webhook

## Payment Security Principle

Client callback cannot finalize payment.

Payment status update flow:

Client → Payment Provider → Webhook → Edge Function → payments.status
update

## Admin Role Expansion (Future)

Suggested table: user_admin_roles

Possible roles: super_admin ops_admin support_admin shop_admin

All administrative actions must be recorded in audit_logs.
