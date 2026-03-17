# FootGo VN -- Feature Development Task Order

문서 버전: 1.0\
목적: FootGo MVP 개발 순서 및 단계별 작업 정의

------------------------------------------------------------------------

# 1. 문서 목적

이 문서는 FootGo VN 서비스의 기능 개발 순서를 정의한다.

목표

-   기능 의존성 문제 방지
-   개발 단계별 완료 기준 정의
-   AI 코드 생성 작업 단위 분리
-   MVP 범위 관리

------------------------------------------------------------------------

# 2. 개발 기본 원칙

FootGo 개발은 다음 순서를 따른다.

설계 → 인증 → 핵심 기능 → 보조 기능 → 수익화 → 미디어 → 운영

이 순서를 유지하면 다음 문제를 줄일 수 있다.

-   데이터 구조 변경으로 인한 코드 재작성
-   권한 정책 오류
-   결제 시스템 보안 문제
-   기능 간 충돌

------------------------------------------------------------------------

# 3. 전체 개발 단계

전체 개발은 다음 단계로 진행한다.

Phase 0 -- 문서 및 설계 확정\
Phase 1 -- 프로젝트 초기 세팅\
Phase 2 -- 인증 및 사용자 시스템\
Phase 3 -- 팀 시스템\
Phase 4 -- 경기 생성 및 출석 시스템\
Phase 5 -- 경기 결과 확정 시스템\
Phase 6 -- 리그 시스템\
Phase 7 -- 알림 및 자동화\
Phase 8 -- 결제 시스템\
Phase 9 -- 미디어 시스템\
Phase 10 -- QA 및 배포

------------------------------------------------------------------------

# 4. Phase 0 -- 설계 확정

예상 기간

3 \~ 5일

완료해야 할 문서

Product Scope\
Database ERD\
API Specification\
RLS Policies\
Coding Rules\
Feature Task Order

완료 조건

-   DB 구조 변경이 거의 발생하지 않는다
-   핵심 API 구조 확정
-   인증 방식 확정

------------------------------------------------------------------------

# 5. Phase 1 -- 프로젝트 초기 세팅

예상 기간

2 \~ 4일

작업 내용

React Native + Expo 프로젝트 생성\
TypeScript 설정\
ESLint 설정\
Prettier 설정

Supabase 프로젝트 생성

환경 변수 설정

프로젝트 폴더 구조 생성

추천 폴더 구조

src/

core\
features\
services\
components\
hooks\
types

Supabase Client 연결

완료 조건

-   앱 실행 가능
-   Supabase 연결 성공
-   기본 화면 렌더링 가능

------------------------------------------------------------------------

# 6. Phase 2 -- 인증 및 사용자 시스템

예상 기간

4 \~ 7일

구현 기능

소셜 로그인

Google Login\
Apple Login\
Facebook Login

전화번호 OTP 인증

프로필 생성

프로필 수정

세션 유지

로그아웃

관련 테이블

profiles\
user_devices

완료 조건

-   로그인 성공
-   세션 유지
-   프로필 생성
-   프로필 수정

------------------------------------------------------------------------

# 7. Phase 3 -- 팀 시스템

예상 기간

5 \~ 8일

구현 기능

팀 생성

팀 목록 조회

팀 상세 조회

팀 초대 코드 생성

팀 참가

팀 멤버 역할 관리

관련 테이블

teams\
team_members\
team_invites

완료 조건

-   사용자 팀 생성 가능
-   초대 코드로 팀 참가 가능
-   역할 관리 가능

------------------------------------------------------------------------

# 8. Phase 4 -- 경기 생성 및 출석 시스템

예상 기간

5 \~ 8일

구현 기능

경기 생성

경기 목록 조회

경기 상세 조회

출석 투표 생성

출석 응답

참석 인원 확인

관련 테이블

matches\
attendance_polls\
attendance_votes

완료 조건

-   팀 관리자가 경기 생성 가능
-   선수 출석 투표 가능
-   참석 인원 확인 가능

------------------------------------------------------------------------

# 9. Phase 5 -- 경기 결과 확정 시스템

예상 기간

6 \~ 10일

구현 기능

심판 결과 입력

득점 이벤트 기록

주장 결과 수락

결과 거부

분쟁 생성

자동 결과 확정

MMR 점수 반영

매너 점수 반영

관련 테이블

match_results\
match_events\
match_disputes

완료 조건

-   경기 결과 입력 가능
-   주장 결과 수락 가능
-   분쟁 처리 가능
-   결과 확정 후 기록 반영

이 단계가 FootGo MVP 핵심이다.

------------------------------------------------------------------------

# 10. Phase 6 -- 리그 시스템

예상 기간

5 \~ 8일

구현 기능

리그 생성

시즌 생성

참가 팀 등록

리그 경기 연결

리그 순위 계산

순위 화면 표시

관련 테이블

leagues\
league_seasons\
league_teams\
league_standings

완료 조건

-   시즌 생성 가능
-   리그 경기 연결
-   순위 자동 계산

------------------------------------------------------------------------

# 11. Phase 7 -- 알림 및 자동화

예상 기간

4 \~ 6일

구현 기능

FCM 푸시 알림

경기 생성 알림

출석 리마인드

결과 입력 요청

결과 수락 요청

자동 결과 확정 배치 작업

관련 테이블

notifications\
user_devices

완료 조건

-   푸시 알림 정상 수신
-   리마인드 대상 필터링
-   자동 확정 동작

------------------------------------------------------------------------

# 12. Phase 8 -- 결제 시스템

예상 기간

5 \~ 8일

구현 기능

결제 주문 생성

MoMo 결제 연동

ZaloPay 결제 연동

Webhook 검증

결제 상태 업데이트

관련 테이블

payments\
payment_items\
tournament_tickets

완료 조건

-   결제 성공 처리
-   결제 실패 처리
-   Webhook 검증

------------------------------------------------------------------------

# 13. Phase 9 -- 미디어 시스템

예상 기간

7 \~ 12일

구현 기능

영상 업로드

영상 저장

하이라이트 생성

숏폼 생성

관련 테이블

media_assets\
videos\
shortform_jobs

완료 조건

-   영상 업로드 가능
-   영상 조회 가능
-   영상 처리 상태 추적 가능

------------------------------------------------------------------------

# 14. Phase 10 -- QA 및 배포

예상 기간

4 \~ 7일

작업 내용

실제 기기 테스트

버그 수정

성능 테스트

TestFlight 배포

Android Closed Testing

완료 조건

핵심 플로우 정상 동작

로그인\
팀 생성\
경기 생성\
출석 투표\
결과 입력\
결과 확정\
리그 순위 반영

------------------------------------------------------------------------

# 15. MVP 핵심 기능

MVP에서 반드시 포함해야 하는 기능

사용자 로그인\
프로필 생성\
팀 생성\
팀 참가\
경기 생성\
출석 투표\
심판 결과 입력\
주장 결과 수락\
리그 순위\
푸시 알림

------------------------------------------------------------------------

# 16. MVP 제외 기능

초기 MVP에서 제외

AI 하이라이트 분석\
대형 쇼핑몰\
광고 시스템\
고급 매칭 알고리즘

------------------------------------------------------------------------

# 17. AI 코딩 작업 방식

AI 코드 생성 시 작업 단위

예시

1.  팀 생성 기능 구현
2.  경기 생성 API 구현
3.  출석 투표 기능 구현
4.  결과 입력 기능 구현
5.  결과 확정 로직 구현

이 방식이 안정적이다.

다음 방식은 피해야 한다.

"전체 앱을 한 번에 생성"

------------------------------------------------------------------------

# 18. 예상 MVP 개발 기간

1인 개발 기준

약 8 \~ 12주

2인 개발 기준

약 5 \~ 8주

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
