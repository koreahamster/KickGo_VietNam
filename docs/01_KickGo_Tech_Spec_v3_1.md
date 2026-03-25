# KickGo VN — Technical Specification

문서 버전: 3.1
작성일: 2026-03-20
변경 이력: v3.0 기반. Zalo 로그인, 수수료 정책(초기 0%), 금액 지역별 포맷, 개인정보처리방침(PDPD), 선수 이력 시스템, 경기 일정 외부 공유 추가.
변경 이력: v2.1 기반. 기능 정의서 확정 내용 전면 반영. 용병 모집, 팀 모집 공고, 노쇼 패널티, 프로필 공개범위 설정, 팀 회비 관리, 차단 기능, 검색, 온보딩 튜토리얼, 지역 통계 추가.

---

# 1. 프로젝트 개요

KickGo VN은 베트남 아마추어 축구 커뮤니티를 위한 디지털 플랫폼이다.

핵심 가치:
- 선수는 무료
- 심판에게 경기 배정 및 일당 수익 구조 제공
- 운동장 관리자에게 예약/결제 관리 도구 제공
- 기록과 결과의 신뢰성 확보

수익 모델:
- 대회 개최권 판매
- 쇼핑몰 (용품, 유니폼/엠블럼 제작)
- 운동장 예약 수수료
- 심판 배정 수수료

---

# 2. 기술 스택

## 모바일 앱

| 항목 | 선택 |
|---|---|
| 프레임워크 | React Native + Expo SDK 54 |
| 언어 | TypeScript |
| 서버 상태 | React Query |
| 글로벌 상태 | Zustand |
| 내비게이션 | Expo Router |
| 폼 처리 | react-hook-form + zod |
| 백엔드 SDK | Supabase JS SDK |

## 백엔드

| 서비스 | 용도 |
|---|---|
| Supabase Auth | 인증 및 세션 |
| Supabase PostgreSQL | 데이터베이스 (RLS 적용) |
| Supabase Storage | 미디어 파일 (이미지, 영상) |
| Supabase Realtime | 실시간 동기화 |
| Supabase Edge Functions | 서버 사이드 비즈니스 로직 |

## 외부 서비스

| 서비스 | 용도 |
|---|---|
| Firebase Cloud Messaging | 푸시 알림 |
| MoMo | 베트남 결제 |
| ZaloPay | 베트남 결제 |
| Google Maps API | 경기/운동장 위치 지도 |

## 기타

- 시간대: UTC+7 (베트남 기본)
- 오프라인: React Query 캐시 + 낙관적 업데이트
- SNS 공유: React Native Share API

---

# 3. 시스템 아키텍처

```
React Native App (Expo)
        ↓
Supabase Backend
  ├── Auth (소셜 로그인 + OTP)
  ├── PostgreSQL (RLS 전체 적용)
  ├── Storage (이미지, 영상)
  ├── Realtime (경기 상태, 출석, 순위)
  └── Edge Functions (Write 전용)
        ↓
외부 서비스
  ├── FCM
  ├── MoMo / ZaloPay Webhook
  └── Google Maps
```

## Read / Write 원칙

- **Read**: Supabase REST / Query 직접
- **Write**: Edge Functions 경유 필수 (중요 비즈니스 로직)

Write Edge Functions 목록:
`create-profile`, `update-profile`, `upload-avatar`,
`create-player-profile`, `update-player-profile`, `create-referee-profile`, `add-account-type`,
`create-team`, `kick-team-member`,
`submit-match-roster`, `confirm-match-roster`,
`submit-match-result`, `confirm-match-result`, `open-match-dispute`,
`resolve-dispute`, `rate-referee`,
`create-facility`, `create-facility-court`, `set-facility-schedule`, `create-facility-booking`,
`create-futsal-match-request`,
`request-referee-assignment`, `respond-referee-assignment`, `record-referee-payment`,
`create-tournament`, `activate-tournament-ticket`, `generate-tournament-brackets`,
`setup-league-tiers`, `assign-team-tier`, `start-promotion-playoff`,
`create-payment-intent`, `verify-payment-webhook`,
`register-for-match-as-mercenary`, `accept-mercenary`,
`submit-team-recruitment`, `apply-to-team-recruitment`,
`create-mvp-vote`, `record-team-fee-payment`, `record-team-fee-usage`,
`upload-shorts`, `block-user`,
`update-profile-visibility`

---

# 4. 인증 시스템

## 지원 로그인 방식

| 방식 | 상태 |
|---|---|
| Google 로그인 | 구현 목표 |
| Apple 로그인 | 구현 목표 |
| Facebook 로그인 | 구현 목표 |
| 휴대폰 OTP | 필수 (1인 1계정) |
| Zalo 로그인 | 베트남 현지화 |
| Email/Password | 개발 임시 fallback |

## 온보딩 흐름

```
소셜 로그인
    ↓
휴대폰 OTP 인증 (본인 확인 필수)
    ↓
공통 프로필 생성 (닉네임, 생년, 지역, 언어, 초기 역할)
    ↓
역할별 상세 온보딩
  - player: 포지션, 주발, 사이즈
  - referee: 최소 구조
  - facility_manager: 운동장 등록 안내
    ↓
온보딩 튜토리얼 (스킵 가능)
    ↓
홈 화면
```

---

# 5. 사용자 프로필 시스템

## 5.1 공통 프로필 (profiles)

| 필드 | 설명 |
|---|---|
| display_name | 닉네임 |
| avatar_url | 프로필 사진 (Supabase Storage) |
| birth_year | 생년 |
| bio | 자기소개 |
| phone / is_phone_verified | 휴대폰 인증 |
| country_code / province_code / district_code | 지역 3단계 코드 |
| preferred_language | vi / ko / en |
| **visibility** | **public / members_only / private** |

> `visibility` 필드: 사용자가 직접 설정하며, 앱 설정 화면에서 변경 가능.
> - public: 누구나 조회 가능
> - members_only: 로그인 사용자만
> - private: 본인만

> `avatar_url`: `upload-avatar` Edge Function 경유 필수. 직접 Storage PUT 불가.

## 5.2 다중 역할 (account_types)

- `player` / `referee` / `facility_manager`
- 한 사용자가 복수 역할 보유 가능
- 팀 내 역할(team_members.role)과 완전히 분리

## 5.3 선수 프로필 (player_profiles)

- 포지션, 주발, 상의/신발 사이즈
- `skill_tier`, `reputation_score`: 시스템 관리 (클라이언트 수정 불가)

## 5.4 심판 프로필 (referee_profiles)

- `average_rating` (referee_ratings 누적 평균)
- `rating_count`

## 5.5 팀 공개 범위

팀도 공개 범위를 설정할 수 있다 (teams.visibility):
- public: 누구나 조회
- members_only: 로그인 사용자만
- private: 팀원만

---

# 6. 팀 관리 시스템

## 팀 역할

| 역할 | 권한 |
|---|---|
| owner | manager와 동일 + 팀원 강퇴 |
| manager | 경기 생성, 결과 수락/거부, 초대 생성, 명단 제출, 회비 관리 |
| captain | 출전 명단 제출 보조 |
| player | 일반 선수 |

## 팀 기능

- 팀 생성/수정/삭제
- 초대 코드 / Zalo 딥링크 초대
- 팀원 강퇴 (owner만, audit_log 기록)
- 팀 공지사항 작성/조회
- **팀 회비 관리**: 월별 납입 현황, 사용 내역 입력 (앱은 기록만)
- 팀 공개 범위 설정

---

# 7. 용병 모집 시스템

경기 인원이 부족할 때 1회성으로 외부 선수를 모집하는 기능.

## 흐름

```
팀 관리자가 경기에 용병 모집 공고 등록
    ↓
선수가 공고 조회 후 지원
    ↓
팀 관리자 수락/거부
    ↓ (수락 시)
해당 선수가 그 경기 출전 명단에 포함 가능
```

## 규칙

- 용병은 해당 경기에만 유효 (팀 정식 멤버 아님)
- 경기 기록은 개인 통계에 반영
- 티어 포인트에는 미반영
- 용병 경기 이력 별도 조회 가능

---

# 8. 팀 모집 공고 시스템

- 선수가 팀을 찾는 글 등록
- 팀이 선수를 찾는 공고 등록
- 지역, 포지션, 티어로 필터 검색
- 지원 및 연락 기능

---

# 9. 종목 구분

## sport_type

| 종목 | 인원 | 심판 | 결과 확정 | 티어 |
|---|---|---|---|---|
| soccer | 11인 | 필수 | 심판→주장 수락 | 반영 |
| futsal | 5인 | 없음 | 캡틴 직접 입력 | 반영 (향후) |

## 경기 유형 (match_type)

- `friendly`: 친선 (티어 미반영)
- `league`: 티어전/리그전 (티어 반영)
- `tournament`: 대회 (티어 미반영)

## 풋살 매칭 유형 (futsal_match_type, MVP 제외)

- `ranked`: 랜덤 티어 매칭
- `friendly`: 검색/초대

---

# 10. 경기 관리 시스템

## 10.1 경기 상태

```
scheduled → ongoing → awaiting_confirmation → finalized
                                             → disputed (이의 제기)
                                             → auto_finalized (24h 무응답)
```

풋살(MVP 제외): `scheduled → ongoing → awaiting_result → finalized`

## 10.2 경기 시작 전

1. 팀 관리자/captain이 출전 명단 제출 (match_rosters)
2. 심판이 양 팀 명단 확인 (등번호/이름)
3. 심판이 경기 시작 승인 → `ongoing`

## 10.3 경기 중

심판이 이벤트 실시간 기록: goal / assist / own_goal / yellow_card / red_card

## 10.4 경기 후

- 심판이 최종 스코어 + 이벤트 업로드
- 양 팀 관리자(manager/owner)에게 수락 요청 알림
- 수락 → `finalized`
- 이의 제기 → `disputed` → 24시간 협의 → 미합의 시 심판 결정 자동 반영
- 24시간 무응답 → `auto_finalized`

## 10.5 경기 취소 및 노쇼 정책

운동장 예약 연결 경기는 선결제 필수.

| 상황 | 환불 | 패널티 |
|---|---|---|
| 24시간 전 취소 | 전액 환불 | reputation -5 |
| 당일 취소 | 50% 환불 | reputation -20 |
| 노쇼 (취소 없이 불참) | 없음 | reputation -40 |

- 노쇼 판정: 경기 시작 후 30분 내 최소 인원(7명) 미달
- 노쇼 팀에 자동 부전승 처리
- reputation 하한선 미달 팀 → 티어전 자동 매칭 일시 제한

## 10.6 경기 목록 UI

- 캘린더형 인터페이스
- 경기 카드 표기: 날짜 / 상대팀명 / 참석 인원수 / 경기 유형
- 예: "3월 22일 | Hue United vs Da Nang FC | 출석 14/22명"
- 경기 장소 지도 (Google Maps)

---

# 11. 심판 비즈니스 구조

축구 경기 전용.

## 흐름

```
심판이 referee_availability에 가용 날짜/시간 등록
    ↓
팀 관리자가 가용 심판 목록 조회 후 배정 요청
    ↓
심판 수락 → matches.referee_user_id 반영
    ↓
경기 완료 후 referee_payment_records 생성
    ↓
실제 지급: 외부 계좌 이체 (앱은 기록만)
```

## 심판 평점 (referee_ratings)

- 경기 finalized/auto_finalized 후 양 팀 관리자가 등록
- 항목: 공정성/정확성/태도/종합 (1~5점)
- 팀당 1회, referee_profiles.average_rating에 누적
- 심판 목록에 공개 표시

---

# 12. 티어 시스템 (롤 방식)

## 티어 구조

브론즈 → 실버 → 골드 → 플래티넘 → 다이아

- 신규 팀: 브론즈 자동 시작 (참가 신청 없음)
- 각 티어 포인트 범위: 0~100점

## 경기별 반영

| 경기 종류 | 티어 포인트 | 매칭 방식 |
|---|---|---|
| 티어전 | 반영 | 같은 티어 + 같은 지역 자동 매칭 |
| 승급전 | 반영 | 자동 매칭 |
| 친선 | 미반영 | 수동 (검색/초대) |
| 대회 | 미반영 | 대진표 |

## 포인트 변화

- 승리: +20~25점 / 패배: -15~20점 / 무승부: ±5점

## 승급전

- 100점 달성 → 승급전 자동 진입
- 5판 3승제 (같은 지역 동일 티어 팀과 자동 매칭)
- 3승: 승급 (포인트 0 초기화)
- 3승 미달: 유지 (포인트 75 초기화)

## 매칭 우선순위

1. 같은 티어 + 같은 지역 (최우선)
2. 같은 티어 + 인접 지역 (대기 30분 초과)
3. 인접 티어 + 같은 지역 (대기 60분 초과)

---

# 13. 리그 시스템

- 지역별 독립 운영
- 시즌: 10개월
- 승점: 3/1/0
- 동점: 골득실 → 다득점 → 승자승
- 경기 확정 시 league_standings 자동 재계산
- 시즌 종료 후 league_season_history 스냅샷 보관

---

# 14. 대회 (토너먼트) 시스템

| 구분 | 기본 (무료) | 개최권 구매 후 |
|---|---|---|
| 팀 수 | 4팀 고정 | 4/8/16팀 이상 선택 |
| 대진표 | 수동 설정 | 자동 생성 |
| 운영 알림 | 없음 | 자동 발송 |

- tournament_brackets가 라운드별 대진 관리
- 경기 확정 후 다음 라운드 자동 생성 (개최권 보유 시)

---

# 15. 지역 통계

기존 "리그 통계"에서 "지역 통계"로 명칭 변경.

- 지역 선택 후 티어별 팀 순위표
- 지역별 팀 기록 리스트 (승/무/패, 골득실)
- 지역별 선수 기록 리스트 (득점/어시스트/MVP 횟수)
- 티어 필터 (전체/브론즈/실버/골드/플래티넘/다이아)

---

# 16. MVP 투표 및 경기 기록 카드

## MVP 투표

- 경기 finalized 후 24시간 투표창 활성화
- 포지션별: 공격(FW) / 미드필더(MF) / 수비(DF) 각 1명
- 투표 자격: 출전 선수 (1인 1표, 본인 제외) + 심판 추가 1표
- 최다 득표자 → 포지션별 MVP 선정

## FIFA 카드형 경기 기록 카드

- 경기 finalized 후 자동 생성
- 구성: 스코어/날짜/팀명/엠블럼 + 포지션별 MVP 3인 + 이벤트 요약
- 개인 선수 카드: FIFA Ultimate Team 스타일, 시즌 누적 통계
- 공유: 이미지 저장 → Instagram/Facebook/Zalo/TikTok

---

# 17. 소셜 / 콘텐츠 시스템

## 쇼츠

- 최대 60초, 최대 1GB
- Supabase Storage → 처리 Worker → 서빙
- 좋아요/댓글/공유/해시태그/신고

## 피드

- 팔로우 기반 + 인기 콘텐츠 탐색 탭
- 게시글 (텍스트 + 이미지/영상)
- 경기 기록 카드 자동 노출

## 팔로우 / 차단

- 선수/팀 팔로우
- 특정 사용자 차단 (block) → 피드/메시지 차단

---

# 18. 운동장 운영 시스템

## 구조

```
facility_manager
    └── facilities (운동장 복수 등록)
            └── facility_courts (구장 복수)
                    └── facility_schedules (운영 시간)
                            └── facility_bookings (예약, 선결제)
                                    └── facility_revenues (수익 기록)
```

## 예약 흐름

```
선수가 지역/종목/날짜로 운동장 검색
    ↓
가용 구장 + 1시간 슬롯 조회
    ↓
구장 + 시간 선택 → 예약 생성 + 선결제
    ↓
예약 confirmed
    ↓
운동장 관리자 예약 확인/관리
```

## 운동장 등록

- 관리자가 직접 등록
- ops_admin 승인 후 활성화 (is_active = true)
- 운동장 사진 복수 업로드 가능

---

# 19. 쇼핑몰

## 앱 (React Native 네이티브)

- 상품 조회, 주문, 결제, 주문 내역

## 웹 CMS (content_admin)

- 상품 등록/수정/삭제
- 유니폼/엠블럼 제작 주문 관리
- 배송 상태 업데이트

## 결제

- MoMo / ZaloPay
- Webhook 기반 확정 (클라이언트 불가)

---

# 20. 보안 정책

- 모든 테이블 RLS 적용
- Write는 Edge Functions 경유 (service_role 사용)
- skill_tier / reputation_score 클라이언트 수정 불가
- avatar_url 직접 UPDATE 불가 (upload-avatar 경유)
- 결제 확정 클라이언트 불가 (Webhook만)
- match_results finalized 이후 수정 불가
- 모든 관리자 조치 audit_logs 기록

---

# 21. 앱 관리자 (CMS)

역할 구조:
- super_admin: 전체 권한, 하위 역할 부여/회수
- ops_admin: 운영 (운동장 승인, 경기 강제 수정, 리그 관리, 분쟁 처리)
- content_admin: 콘텐츠/쇼핑몰 (상품 관리, 주문 처리, 신고 처리, 배너)
- support_admin: 고객지원 (사용자 정지/해제, 신고 처리, 환불 지원)

CMS 형태: 웹 기반 별도 구현 (도메인 미정)
모든 관리자 조치: audit_logs 기록 필수

---

# 22. 알림 시스템

FCM 기반. 종류별 on/off 설정 가능.

주요 트리거:
경기 생성, 출석 리마인드(72h/24h/6h), 심판 배정 요청, 결과 수락 요청, 이의 제기, 24시간 만료, MVP 투표, 경기 기록 카드 생성, 예약 확인/취소, 노쇼 패널티, 쇼핑 주문 상태, 승급전 진입, 용병 지원/수락, 팀 모집 매칭

---

# 23. 앱 라우팅 구조

```
(auth)         login, signup, phone-verify
(onboarding)   create-profile, role-onboarding, tutorial
(tabs)         home, search, social, profile
(team)         team-detail, team-edit, team-stats, team-fee
(match)        match-calendar, match-detail, match-roster, match-result
(league)       tier-standings, region-stats, promotion
(tournament)   tournament-detail, bracket
(facility)     facility-search, facility-detail, booking
(shop)         shop-home, product-detail, order, cart
(social)       feed, shorts-upload, post-detail, profile-public
(referee)      referee-home, availability, assignment, payment-history
(settings)     settings, language, region, roles, notifications, visibility, account
(admin)        향후 웹 CMS 별도
```

---

# 24. MVP 포함 / 제외

## 포함

인증(소셜+OTP), 프로필(공통+역할별+사진+공개범위), 팀(생성/참가/강퇴/공지/회비), 용병 모집, 팀 모집 공고, 축구 경기(생성/캘린더/출석/명단/결과/노쇼), 경기 지도, 심판(배정/진행/평점), 이의제기/자동확정, 티어제 리그(승급전), 지역 통계, 대회(4팀+개최권), 운동장 예약(선결제), MVP 투표+경기 카드+SNS 공유, 소셜(쇼츠/피드/팔로우/차단), 쇼핑몰(개최권+유니폼 주문+용품), 검색, 앱 설정, 온보딩 튜토리얼, 푸시 알림, 앱 관리자 권한 구조

## 제외 (향후)

풋살 매칭 구현, 심판 자격증 상세, AI 하이라이트, 광고, 스폰서십, CMS 웹 UI, 국가별 확장

---


---

# 25. 플랫폼 설정 시스템 (platform_settings)

super_admin이 앱 운영 파라미터를 동적으로 변경할 수 있는 설정 테이블이다.

## 수수료 정책

초기값은 모두 0%이며, 운영 초기 사용자 모집 기간에는 수수료를 받지 않는다.
서비스가 성장한 후 super_admin이 CMS에서 수수료율을 변경한다.

| 설정 키 | 초기값 | 설명 |
|---|---|---|
| referee_commission_rate | 0 | 심판 배정 수수료율 (%) |
| facility_commission_rate | 0 | 운동장 예약 수수료율 (%) |
| shop_commission_rate | 0 | 쇼핑몰 수수료율 (%) |

## 금액 표기 (지역별 통화 포맷)

지역(country_code)에 따라 통화 단위와 천단위 표기 방식을 다르게 적용한다.

| 국가 | 통화 | 포맷 예시 |
|---|---|---|
| VN | VND | 100.000 ₫ |
| KR | KRW | 100,000 원 |
| TH | THB | ฿100,000 |
| default | VND | 100.000 ₫ |

규칙:
- 표기 포맷은 `platform_settings.currency_format_{country_code}`로 관리
- 앱은 `profiles.country_code` 기준으로 포맷 자동 선택
- super_admin이 국가별 포맷 추가/수정 가능

---

# 26. 개인정보처리방침 — 베트남 PDPD 기준

베트남 개인정보보호법(Decree 13/2023/ND-CP, PDPD)을 준수한다.

## 수집 항목 및 목적

| 항목 | 수집 목적 |
|---|---|
| 이름, 닉네임 | 서비스 이용 식별 |
| 전화번호 | 본인 인증 (1인 1계정) |
| 생년 | 연령 확인 |
| 위치 정보 (지역 코드) | 지역 기반 매칭/리그 |
| 경기 기록 | 서비스 기록 제공 |
| 결제 정보 | 거래 처리 |

## 기술적 준수 사항

- 개인정보는 Supabase PostgreSQL (싱가포르 리전)에 저장
- 전송 구간 전체 TLS 암호화
- RLS로 데이터 접근 최소화
- 사용자가 직접 계정 삭제 요청 가능 (데이터 삭제권)
- 수집 동의는 최초 회원가입 시 명시적 동의 획득
- 마케팅 수신 동의는 별도 선택

## 앱 구현 요구사항

- 회원가입 시 개인정보처리방침 동의 체크박스 필수 (선택 불가)
- 마케팅 알림 동의는 별도 선택 항목
- 설정 화면에서 개인정보처리방침 전문 조회 가능
- 계정 삭제 요청 기능 (설정 > 계정 > 계정 삭제)
- 계정 삭제 시 개인 식별 정보 삭제, 경기 기록은 익명화 보존



---

# 27. 선수 이력 시스템

선수의 연도별 소속팀 이력과 시즌 기록을 관리한다.

## 소속팀 이력 (player_team_history)

| 필드 | 설명 |
|---|---|
| user_id | 선수 |
| team_id | 소속 팀 |
| season_year | 연도 (예: 2026) |
| start_date | 합류일 |
| end_date | 이탈일 (nullable, 현재 소속이면 null) |
| role | 당시 팀 내 역할 |

- 팀 합류/탈퇴 시 자동 기록
- 선수 프로필 페이지에서 연도별 소속팀 조회 가능

## 시즌 기록 (player_season_stats — 기존 확장)

기존 `player_season_stats`에 MVP 집계 포함:
- 시즌별 출전 경기, 골, 어시스트, 경고, 퇴장
- 포지션별 MVP 선정 횟수 (fw/mf/df)

## 이적 시스템

MVP 제외. 향후 필요 시 구현.


# End of Document — v3.0
