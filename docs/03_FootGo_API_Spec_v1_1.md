# FootGo VN -- API Specification

문서 버전: 1.0\
대상: React Native + Supabase Backend\
목적: 모바일 앱과 백엔드 간 API 통신 규격 정의

------------------------------------------------------------------------

# 1. 문서 목적

이 문서는 FootGo VN 서비스의 API 구조를 정의한다.

목표

-   모바일 앱과 백엔드 간 통신 규격 통일
-   Edge Function / RPC 구현 기준 제공
-   AI 코드 생성 시 API 구조 혼란 방지

------------------------------------------------------------------------

# 2. API 구조 개요

FootGo는 다음 두 가지 API 구조를 사용한다.

### 1. Supabase REST

데이터 조회

예

GET /rest/v1/matches\
GET /rest/v1/teams

------------------------------------------------------------------------

### 2. Edge Functions

비즈니스 로직 처리

예

POST /functions/v1/create-team\
POST /functions/v1/create-match

------------------------------------------------------------------------

# 3. 인증 방식

모든 API는 Supabase JWT 기반 인증을 사용한다.

헤더

    Authorization: Bearer {access_token}

인증 흐름

로그인\
↓\
JWT 발급\
↓\
API 요청 시 JWT 포함

------------------------------------------------------------------------

# 4. 응답 구조 표준

모든 API 응답은 동일한 구조를 따른다.

    {
      "success": true,
      "data": {},
      "error": null
    }

에러 예시

    {
      "success": false,
      "data": null,
      "error": {
        "code": "MATCH_NOT_FOUND",
        "message": "Match does not exist"
      }
    }

------------------------------------------------------------------------

# 5. Auth API

## 로그인

Supabase Auth 사용

지원 방식

Google\
Apple\
Facebook\
Phone OTP

------------------------------------------------------------------------

## 프로필 생성

POST /functions/v1/create-profile

request

    {
      "display_name": "player01",
      "preferred_position": "FW",
      "dominant_foot": "right",
      "primary_region_code": "HUE"
    }

response

    {
      "success": true,
      "data": {
        "profile_id": "uuid"
      }
    }

------------------------------------------------------------------------

# 6. Team API

## 팀 생성

POST /functions/v1/create-team

request

    {
      "name": "Hue United",
      "region_code": "HUE",
      "description": "Amateur football team"
    }

response

    {
      "success": true,
      "data": {
        "team_id": "uuid"
      }
    }

------------------------------------------------------------------------

## 팀 조회

GET /rest/v1/teams?id=eq.{team_id}

------------------------------------------------------------------------

## 팀 멤버 조회

GET /rest/v1/team_members?team_id=eq.{team_id}

------------------------------------------------------------------------

## 팀 초대 생성

POST /functions/v1/create-team-invite

request

    {
      "team_id": "uuid"
    }

response

``` json
{
  "success": true,
  "data": {
    "invite_code": "ABC123"
  },
  "error": null
}
```

------------------------------------------------------------------------

## 팀 참가

POST /functions/v1/join-team

request

    {
      "invite_code": "ABC123"
    }

------------------------------------------------------------------------

# 7. Match API

## 경기 생성

POST /functions/v1/create-match

request

    {
      "home_team_id": "uuid",
      "away_team_id": "uuid",
      "scheduled_at": "2026-03-15T19:00:00Z",
      "venue_name": "Hue Football Center",
      "match_type": "friendly"
    }

response

``` json
{
  "success": true,
  "data": {
    "match_id": "uuid"
  },
  "error": null
}
```

------------------------------------------------------------------------

## 경기 목록 조회

GET /rest/v1/matches

필터 예

    ?home_team_id=eq.{team_id}

------------------------------------------------------------------------

## 경기 상세 조회

GET /rest/v1/matches?id=eq.{match_id}

------------------------------------------------------------------------

# 8. Attendance API

## 출석 투표 조회

GET /rest/v1/attendance_polls?match_id=eq.{match_id}

------------------------------------------------------------------------

## 출석 응답

POST /functions/v1/vote-attendance

request

    {
      "poll_id": "uuid",
      "response": "yes"
    }

response

    {
      "success": true
    }

------------------------------------------------------------------------

# 9. Match Result API

## 심판 결과 입력

POST /functions/v1/submit-match-result

request

    {
      "match_id": "uuid",
      "home_score": 3,
      "away_score": 1,
      "events": [
        {
          "player_id": "uuid",
          "event_type": "goal",
          "minute": 15
        }
      ]
    }

response

    {
      "success": true
    }

------------------------------------------------------------------------

## 주장 결과 응답

POST /functions/v1/respond-match-result

request

    {
      "match_id": "uuid",
      "decision": "accept"
    }

decision 값

accept\
reject

------------------------------------------------------------------------

# 10. League API

## 리그 생성

POST /functions/v1/create-league

request

    {
      "name": "Hue Amateur League",
      "region_code": "HUE"
    }

------------------------------------------------------------------------

## 시즌 생성

POST /functions/v1/create-league-season

request

    {
      "league_id": "uuid",
      "season_name": "2026 Season"
    }

------------------------------------------------------------------------

## 리그 순위 조회

GET /rest/v1/league_standings?season_id=eq.{season_id}

------------------------------------------------------------------------

# 10.5 Result Verification API

## 주장 결과 수락/거부

POST /functions/v1/verify-match-result

주장이 경기 결과를 수락하거나 거부한다.

request

``` json
{
  "match_id": "uuid",
  "decision": "accept"
}
```

`decision` 값: `accept` \| `reject`

response

``` json
{
  "success": true,
  "data": {
    "status": "verified"
  },
  "error": null
}
```

------------------------------------------------------------------------

## 팀원 주문 사이즈 조회

GET /functions/v1/get-team-order-sizes?team_id={team_id}

팀 쇼핑몰 발주를 위해 팀원 전체의 상의 및 신발 사이즈를 취합한다.

response

``` json
{
  "success": true,
  "data": [
    {
      "user_id": "uuid",
      "display_name": "Player 1",
      "top_size": "L",
      "shoe_size": "270"
    }
  ],
  "error": null
}
```

------------------------------------------------------------------------

## Zalo 팀 초대 링크 생성

POST /functions/v1/generate-zalo-invite

Zalo 앱으로 공유할 수 있는 팀 초대 딥링크를 생성한다.

request

``` json
{
  "team_id": "uuid"
}
```

response

``` json
{
  "success": true,
  "data": {
    "deep_link": "zalo://footgo/invite?code=XYZ789"
  },
  "error": null
}
```

------------------------------------------------------------------------

# 11. Payment API

## 결제 주문 생성

POST /functions/v1/create-payment

request

    {
      "amount": 100000,
      "provider": "momo",
      "source_type": "ticket"
    }

------------------------------------------------------------------------

## 결제 상태 조회

GET /rest/v1/payments?id=eq.{payment_id}

------------------------------------------------------------------------

## 결제 Webhook

POST /webhook/payment

payload

provider response payload

------------------------------------------------------------------------

# 12. Media API

## 영상 업로드

POST /functions/v1/upload-video

request

    {
      "match_id": "uuid"
    }

response

``` json
{
  "success": true,
  "data": {
    "upload_url": "signed_url"
  },
  "error": null
}
```

------------------------------------------------------------------------

## 영상 조회

GET /rest/v1/videos?match_id=eq.{match_id}

------------------------------------------------------------------------

# 13. Notification API

## 알림 조회

GET /rest/v1/notifications?user_id=eq.{user_id}

------------------------------------------------------------------------

## 알림 읽음 처리

POST /functions/v1/read-notification

request

    {
      "notification_id": "uuid"
    }

------------------------------------------------------------------------

# 14. Admin API

## 분쟁 조회

GET /rest/v1/match_disputes

------------------------------------------------------------------------

## 분쟁 해결

POST /functions/v1/resolve-dispute

request

    {
      "dispute_id": "uuid",
      "resolution": "accepted"
    }

------------------------------------------------------------------------

# 15. 에러 코드 예시

USER_NOT_FOUND\
TEAM_NOT_FOUND\
MATCH_NOT_FOUND\
NOT_TEAM_MEMBER\
NOT_CAPTAIN\
MATCH_ALREADY_FINALIZED\
PAYMENT_FAILED

------------------------------------------------------------------------

# 16. API 보안 규칙

모든 API는 다음 규칙을 따른다.

-   JWT 인증 필수
-   팀 데이터는 팀 멤버만 접근
-   주장만 결과 수락 가능
-   심판만 결과 입력 가능
-   결제 상태 변경은 서버 Webhook만 가능

------------------------------------------------------------------------

# 17. Rate Limit 정책

권장 제한

로그인\
10/min

경기 생성\
20/min

출석 응답\
100/min

결제 요청\
5/min

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

# --- Documentation Upgrade Additions (v1.3) ---

## Temporary Email Auth Fallback for Development

During the current authentication validation phase, Supabase Auth may use email/password sign-up and sign-in as a temporary fallback to verify:
- successful authentication
- session creation and persistence
- navigation back to the home screen

Auth methods in this temporary fallback:
- Google OAuth
- Email and password

Notes:
- Email/password fallback is for development verification only.
- Phone verification remains a separate future requirement.
- No database schema change is introduced by this fallback.

# --- Documentation Upgrade Additions (v1.4) ---

## Common Profile, Account Type, Region, Language, Facility, Wallet, and Payment API Revision

### `create-profile`

Purpose:
- create common profile
- register initial account type
- store preferred language

POST `/functions/v1/create-profile`

Request example:
```json
{
  "display_name": "Seongho",
  "birth_year": 1993,
  "country_code": "VN",
  "province_code": "HCM",
  "district_code": "HCM-D7",
  "preferred_language": "ko",
  "bio": "Weekly football player",
  "initial_account_type": "player"
}
```

Response example:
```json
{
  "success": true,
  "data": {
    "profile_id": "uuid",
    "account_type": "player",
    "requires_role_onboarding": true
  },
  "error": null
}
```

### `add-account-type`

Purpose:
- register additional service roles after initial onboarding

POST `/functions/v1/add-account-type`

Request example:
```json
{
  "type": "referee"
}
```

### `create-player-profile`

POST `/functions/v1/create-player-profile`

Request example:
```json
{
  "preferred_position": "CM",
  "preferred_foot": "both",
  "dominant_foot": "right",
  "top_size": "L",
  "shoe_size": "270"
}
```

Rules:
- `skill_tier` and `reputation_score` must not be accepted from the client.
- those fields are initialized and updated by server policy only.

### `update-player-profile`

Rules:
- editable fields may include position, foot, shirt size, and shoe size.
- `skill_tier` and `reputation_score` are not editable request fields.

### `create-referee-profile`

POST `/functions/v1/create-referee-profile`

Request example:
```json
{}
```

### Facility manager related API

MVP rule:
- public `create-facility` is not provided.
- facilities are created only through admin/operator workflow or seed data.

MVP minimum API:
- `assign-facility-manager`

POST `/functions/v1/assign-facility-manager`

Request example:
```json
{
  "facility_id": "uuid"
}
```

### Region input rule

Rules:
- no free-text region input
- use code values only
- selection order: country -> province -> district
- MVP data source should be internal static data or seed data first

### Preferred language rule

Supported values:
- vi
- ko
- en

Priority rule:
1. stored `profiles.preferred_language`
2. detected device language
3. default `vi`

### Wallet and payment APIs (structure first, implementation later)

Recommended APIs:
- `create-payment-intent`
- `confirm-wallet-deposit`
- `list-wallet-transactions`

Payment intent statuses:
- created
- pending
- paid
- expired
- failed

Allowed transitions:
- created -> pending
- pending -> paid
- pending -> failed
- created -> expired
- pending -> expired

Rules:
- payment cannot be finalized by the client.
- final payment confirmation must happen through webhook or server verification.
- wallet transactions are recorded only after server-side confirmation.
