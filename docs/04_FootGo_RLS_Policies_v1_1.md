# FootGo VN -- RLS Policies Specification

문서 버전: 1.0\
대상: Supabase PostgreSQL\
목적: Row Level Security 정책 정의

------------------------------------------------------------------------

# 1. 문서 목적

이 문서는 FootGo VN 서비스의 데이터 접근 권한 정책을 정의한다.

목표

-   사용자 데이터 보호
-   팀 데이터 접근 제한
-   경기 결과 조작 방지
-   결제 데이터 보호

모든 테이블은 기본적으로

RLS (Row Level Security)

가 활성화되어야 한다.

------------------------------------------------------------------------

# 2. 기본 정책

모든 테이블에 적용되는 기본 원칙

1.  인증된 사용자만 접근 가능
2.  사용자 데이터는 본인만 수정 가능
3.  팀 데이터는 팀 멤버만 접근
4.  경기 결과는 심판만 입력
5.  결과 수락은 주장만 가능
6.  결제 데이터는 당사자만 조회 가능

------------------------------------------------------------------------

# 3. Profiles 정책

## 조회

사용자는 모든 공개 프로필을 조회할 수 있다.

Policy

    SELECT
    true

------------------------------------------------------------------------

## 수정

사용자는 자신의 프로필만 수정 가능

Policy

    auth.uid() = id

------------------------------------------------------------------------

## 생성

회원 가입 후 자동 생성

Policy

    auth.uid() = id

------------------------------------------------------------------------

# 4. User Devices 정책

## 조회

본인 디바이스만 조회 가능

    auth.uid() = user_id

------------------------------------------------------------------------

## 생성

로그인 시 등록 가능

    auth.uid() = user_id

------------------------------------------------------------------------

## 수정

본인 디바이스만 수정

    auth.uid() = user_id

------------------------------------------------------------------------

# 5. Teams 정책

## 조회

공개 팀은 모두 조회 가능

비공개 팀은 멤버만 조회

Policy

    is_public = true
    OR
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = teams.id
      AND team_members.user_id = auth.uid()
    )

------------------------------------------------------------------------

## 생성

로그인 사용자만 생성

Policy

    auth.uid() IS NOT NULL

------------------------------------------------------------------------

## 수정

팀 Owner 또는 Manager만 수정 가능

Policy

    EXISTS (
     SELECT 1 FROM team_members
     WHERE team_members.team_id = teams.id
     AND team_members.user_id = auth.uid()
     AND team_members.role IN ('owner','manager')
    )

------------------------------------------------------------------------

# 6. Team Members 정책

## 조회

팀 멤버만 조회 가능

Policy

    EXISTS (
     SELECT 1 FROM team_members tm
     WHERE tm.team_id = team_members.team_id
     AND tm.user_id = auth.uid()
    )

------------------------------------------------------------------------

## 추가

팀 관리자만 가능

Policy

    EXISTS (
     SELECT 1 FROM team_members tm
     WHERE tm.team_id = team_members.team_id
     AND tm.user_id = auth.uid()
     AND tm.role IN ('owner','manager')
    )

------------------------------------------------------------------------

# 7. Matches 정책

## 조회

관련 팀 멤버만 조회 가능

Policy

    EXISTS (
     SELECT 1 FROM team_members
     WHERE team_members.user_id = auth.uid()
     AND (
       team_members.team_id = matches.home_team_id
       OR
       team_members.team_id = matches.away_team_id
     )
    )

------------------------------------------------------------------------

## 생성

팀 관리자만 경기 생성 가능

Policy

    EXISTS (
     SELECT 1 FROM team_members
     WHERE team_members.user_id = auth.uid()
     AND team_members.team_id = matches.home_team_id
     AND role IN ('owner','manager')
    )

------------------------------------------------------------------------

# 8. Match Results 정책

## 조회

관련 팀 멤버만 조회 가능

Policy

    EXISTS (
     SELECT 1 FROM matches
     JOIN team_members
     ON team_members.team_id IN (
       matches.home_team_id,
       matches.away_team_id
     )
     WHERE matches.id = match_results.match_id
     AND team_members.user_id = auth.uid()
    )

------------------------------------------------------------------------

## 입력

심판만 가능

Policy

    auth.uid() = matches.referee_user_id

------------------------------------------------------------------------

# 9. Match Events 정책

## 조회

경기 참가 팀 멤버만 조회

Policy

same as match_results

------------------------------------------------------------------------

## 생성

심판만 가능

Policy

    auth.uid() = matches.referee_user_id

------------------------------------------------------------------------

# 10. Attendance 정책

## Poll 조회

경기 참가 팀 멤버만

Policy

team membership check

------------------------------------------------------------------------

## Vote

본인만 투표 가능

Policy

    auth.uid() = user_id

------------------------------------------------------------------------

# 11. Payments 정책

## 조회

본인 결제만 조회

Policy

    auth.uid() = user_id

------------------------------------------------------------------------

## 생성

로그인 사용자

Policy

    auth.uid() IS NOT NULL

------------------------------------------------------------------------

## 수정

결제 상태 변경은 서버만 가능

Policy

    false

Edge Function만 업데이트

------------------------------------------------------------------------

# 12. Notifications 정책

## 조회

본인 알림만 조회

Policy

    auth.uid() = user_id

------------------------------------------------------------------------

## 수정

읽음 처리

Policy

    auth.uid() = user_id

------------------------------------------------------------------------

# 13. Match Disputes 정책

## 생성

팀 주장만 가능

> \[!WARNING\] 중요: 분쟁 생성은 해당 경기에 참여한 팀의 주장만 가능해야
> 합니다.

Policy (USING 절)

``` sql
EXISTS (
    SELECT 1
    FROM team_members tm
    JOIN matches m ON m.id = match_disputes.match_id
    WHERE tm.user_id = auth.uid()
      AND tm.role = 'captain'
      AND tm.team_id IN (m.home_team_id, m.away_team_id)
)
```

------------------------------------------------------------------------

## 조회

경기 관련 팀만

Policy

team membership check

------------------------------------------------------------------------

## Match Results 수정

주장만 본인 팀의 결과 수락 여부(`accepted` 컬럼)를 수정할 수 있다.

Policy (UPDATE)

``` sql
-- home_captain_accepted 또는 away_captain_accepted 컬럼 업데이트 시
-- 해당 경기의 주장인지 확인합니다.
-- RLS는 컬럼 레벨 업데이트를 직접 제어하기 어려우므로,
-- Edge Function에서 최종 로직을 처리하는 것을 권장합니다.
-- 이 정책은 행 전체에 대한 업데이트 권한을 부여합니다.

EXISTS (
    SELECT 1
    FROM matches m
    JOIN team_members tm ON tm.team_id IN (m.home_team_id, m.away_team_id)
    WHERE m.id = match_results.match_id
      AND tm.user_id = auth.uid()
      AND tm.role = 'captain'
)
```

------------------------------------------------------------------------

## League Season History 조회

모든 인증된 사용자는 과거 시즌 기록을 조회할 수 있다.

Policy (SELECT)

``` sql
auth.uid() IS NOT NULL
```

------------------------------------------------------------------------

# 14. Media 정책

## 업로드

로그인 사용자

Policy

    auth.uid() IS NOT NULL

------------------------------------------------------------------------

## 조회

공개 미디어 또는 팀 멤버

Policy

custom logic

------------------------------------------------------------------------

# 15. Audit Logs 정책

## 조회

관리자만

Policy

    false

Edge function only

------------------------------------------------------------------------

# 16. 보안 체크리스트

모든 테이블

    ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

적용 확인

-   profiles
-   teams
-   team_members
-   matches
-   match_results
-   attendance_votes
-   payments

------------------------------------------------------------------------

# 17. 추가 보안 권장 사항

-   service_role 키는 클라이언트에 노출 금지
-   결제 상태는 webhook 기준
-   match_results는 finalized 이후 수정 금지
-   관리자 override는 audit_logs 기록 필수

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

# --- Documentation Upgrade Additions (v1.4) ---

## Common Profile, Multi-Role, Facility, Wallet, and Payment Security Revision

### `profiles`

Rules:
- users may create and update only their own profile
- public read scope remains subject to product policy
- region and preferred_language fields follow the same ownership rule

### `account_types`

Rules:
- users may add only their own roles
- duplicate roles are not allowed
- only allowed type values may be inserted

### `player_profiles`

Rules:
- users may create and update only their own player profile
- player profile creation requires account_types.type = player
- `skill_tier` and `reputation_score` are system-managed and must not be directly writable by the client

### `referee_profiles`

Rules:
- users may create and update only their own referee profile
- referee profile creation requires account_types.type = referee

### `facilities`

MVP rules:
- general users cannot insert facilities
- facility creation is limited to admin/operator workflow or seed data

### `facility_managers`

Rules:
- general users cannot arbitrarily connect themselves to facilities
- connection must be managed through an approved server workflow
- facility manager relation requires account_types.type = facility_manager

### `wallet_accounts`

Rules:
- client must not directly update balance
- balance is treated as the current display value only
- server transaction flow is the source of truth

### `wallet_transactions`

Rules:
- transaction rows are created only through server-side verified flows
- direct client insert/update is not allowed

### `payment_intents` and `payment_items`

Rules:
- clients may create their own payment intent requests if product policy allows
- state transitions must be controlled by server verification logic
- client-side payment success callback is never sufficient to mark a payment as paid

### Referee concept split

Security distinction:
- global user role: account_types.type = referee
- match-scoped authority: matches.referee_user_id

Recommended enforcement:
- server functions should validate that a designated match referee has `referee_profiles`
- final write authority for match result submission remains tied to `matches.referee_user_id`
