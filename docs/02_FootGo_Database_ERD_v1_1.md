# FootGo VN -- Database ERD

문서 버전: 1.0\
대상: React Native + Supabase 기반 MVP\
목적: FootGo VN 서비스의 핵심 데이터 구조와 테이블 관계를 정의한다.

------------------------------------------------------------------------

# 1. 문서 목적

이 문서는 FootGo VN의 데이터베이스 구조를 설계하기 위한 기준 문서다.

주요 목적은 다음과 같다.

-   서비스의 핵심 엔티티를 명확히 정의한다.
-   각 테이블의 역할과 관계를 고정한다.
-   React Native 앱, Supabase, Edge Functions 구현 시 공통 기준으로
    사용한다.
-   AI 코딩 도구(Claude, Gemini, Codex, Cursor 등)가 일관된 구조로
    코드를 생성하도록 돕는다.

------------------------------------------------------------------------

# 2. 설계 원칙

## 2.1 기본 원칙

-   인증은 `auth.users`를 기준으로 한다.
-   앱 전용 사용자 정보는 `profiles` 테이블에서 관리한다.
-   모든 핵심 테이블은 UUID를 PK로 사용한다.
-   데이터 정합성이 중요한 로직은 DB 제약조건 또는 서버 로직에서
    보호한다.
-   MVP 단계에서는 과도한 테이블 분리보다 핵심 흐름 중심 구조를
    우선한다.

## 2.2 권한 원칙

-   사용자 본인 정보는 본인만 수정 가능
-   팀 관련 민감 정보는 팀 멤버만 접근 가능
-   경기 결과 입력은 심판만 가능
-   경기 결과 수락/거부는 주장만 가능
-   결제 및 분쟁 데이터는 제한적으로 노출

## 2.3 구현 원칙

-   `created_at`, `updated_at`는 가능한 모든 핵심 테이블에 포함한다.
-   soft delete가 필요한 경우 `deleted_at` 컬럼을 둔다.
-   상태값은 enum 또는 check constraint 수준으로 고정한다.
-   감사 및 운영 추적을 위해 `audit_logs`를 둔다.

------------------------------------------------------------------------

# 3. 핵심 도메인

FootGo VN의 핵심 도메인은 아래와 같다.

-   사용자
-   팀
-   리그
-   경기
-   결과 확정
-   출석
-   결제
-   미디어
-   알림
-   운영 로그

------------------------------------------------------------------------

# 4. 전체 테이블 목록

## 4.1 인증 및 사용자

-   auth.users
-   profiles
-   user_devices

## 4.2 팀

-   teams
-   team_members
-   team_invites

## 4.3 리그

-   leagues
-   league_seasons
-   league_teams
-   league_standings

## 4.4 경기

-   matches
-   match_results
-   match_events
-   match_disputes

## 4.5 출석

-   attendance_polls
-   attendance_votes

## 4.6 결제

-   payments
-   payment_items
-   tournament_tickets

## 4.7 미디어

-   media_assets
-   videos
-   shortform_jobs

## 4.8 알림 및 운영

-   notifications
-   audit_logs

------------------------------------------------------------------------

# 5. 테이블 상세 정의

# 5.1 auth.users

Supabase 기본 인증 테이블이다.

설명

-   Google, Apple, Facebook, Phone OTP 인증의 기본 사용자 식별자 역할
-   앱에서 직접 수정하지 않음
-   앱 상세 정보는 `profiles`에서 관리

주요 연결

-   `profiles.id = auth.users.id`

------------------------------------------------------------------------

# 5.2 profiles

앱 사용자 프로필 테이블이다.

목적

-   사용자 상세 정보 저장
-   앱 화면에서 기본 사용자 정보 조회
-   실력 티어 및 매너 점수 보관

주요 컬럼

-   id
-   phone
-   is_phone_verified
-   display_name
-   avatar_url
-   birth_year
-   preferred_position
-   preferred_foot
-   top_size
-   shoe_size
-   dominant_foot
-   skill_tier
-   reputation_score
-   primary_region_code
-   bio
-   created_at
-   updated_at

컬럼 설명

-   `id`: auth.users.id와 동일한 값
-   `phone`: 인증된 전화번호
-   `is_phone_verified`: 전화번호 인증 완료 여부
-   `display_name`: 사용자 표시명
-   `preferred_position`: 선호 포지션
-   `preferred_foot`: 선호하는 발 (UI 표시용)
-   `top_size`: 상의 사이즈
-   `shoe_size`: 신발 사이즈
-   `dominant_foot`: 주 사용 발
-   `skill_tier`: 실력 점수
-   `reputation_score`: 매너/신뢰 점수
-   `primary_region_code`: 주 활동 지역

관계

-   auth.users 와 1:1
-   user_devices 와 1:N
-   team_members 와 1:N
-   payments 와 1:N
-   notifications 와 1:N
-   audit_logs 와 1:N

------------------------------------------------------------------------

# 5.3 user_devices

푸시 알림 수신용 디바이스 정보 테이블이다.

목적

-   로그인한 디바이스 저장
-   FCM 토큰 저장
-   디바이스별 활성 상태 관리

주요 컬럼

-   id
-   user_id
-   device_platform
-   push_token
-   app_version
-   is_active
-   last_seen_at
-   created_at
-   updated_at

컬럼 설명

-   `device_platform`: ios / android
-   `push_token`: FCM 토큰
-   `is_active`: 현재 활성 기기 여부

관계

-   profiles 와 N:1

------------------------------------------------------------------------

# 5.4 teams

팀 기본 정보 테이블이다.

목적

-   팀 생성 및 관리
-   지역 정보 및 공개 여부 저장

주요 컬럼

-   id
-   owner_user_id
-   name
-   slug
-   emblem_url
-   region_code
-   home_ground_name
-   description
-   is_public
-   created_at
-   updated_at

컬럼 설명

-   `slug`: URL 또는 공유용 식별값
-   `region_code`: 팀 활동 지역
-   `is_public`: 공개 팀 여부

관계

-   `owner`는 `team_members` 테이블의 `role`로 관리합니다.
    (`teams.owner_user_id`는 데이터 정합성을 위해 제거하는 것을
    권장합니다. 각 팀은 `team_members`에 `owner` 역할을 가진 멤버를
    1명만 갖도록 제약조건을 설정할 수 있습니다.)
-   team_members 와 1:N
-   team_invites 와 1:N
-   matches 와 1:N
-   league_teams 와 1:N
-   league_standings 와 1:N
-   payments 와 1:N

------------------------------------------------------------------------

# 5.5 team_members

팀 멤버 소속 정보 테이블이다.

목적

-   특정 사용자가 어떤 팀에 속해 있는지 관리
-   팀 내 역할 관리

주요 컬럼

-   id
-   team_id
-   user_id
-   role
-   squad_number
-   status
-   joined_at
-   created_at
-   updated_at

role 값

-   owner
-   manager
-   captain
-   player

status 값

-   pending
-   active
-   left
-   banned

설명

-   한 사용자는 여러 팀에 속할 수 있다.
-   한 팀은 여러 멤버를 가진다.
-   역할에 따라 접근 권한이 달라진다.

관계

-   teams 와 N:1
-   profiles 와 N:1

권장 제약

-   `(team_id, user_id)` unique

------------------------------------------------------------------------

# 5.6 team_invites

팀 초대 관리 테이블이다.

목적

-   초대 링크 또는 코드 기반 팀 참가 처리
-   초대 만료 및 사용 여부 추적

주요 컬럼

-   id
-   team_id
-   invited_by
-   invite_code
-   invite_type
-   expires_at
-   used_by
-   used_at
-   created_at

invite_type 값 예시

-   link
-   code

설명

-   팀 관리자가 초대 링크를 생성한다.
-   사용자가 링크 또는 코드를 통해 참가한다.

관계

-   teams 와 N:1
-   profiles 와 N:1

------------------------------------------------------------------------

# 5.7 leagues

리그 또는 대회 기본 정보 테이블이다.

목적

-   리그 자체 정의
-   공개 여부, 지역, 형식 관리

주요 컬럼

-   id
-   creator_user_id
-   name
-   region_code
-   format_type
-   visibility
-   max_teams
-   requires_ticket
-   created_at
-   updated_at

format_type 값

-   league
-   tournament

visibility 값 예시

-   public
-   private

설명

-   일반 리그와 토너먼트를 같은 상위 개념으로 관리할 수 있다.

관계

-   profiles 와 N:1
-   league_seasons 와 1:N
-   tournament_tickets 와 1:N

------------------------------------------------------------------------

# 5.8 league_seasons

리그의 시즌 단위 테이블이다.

목적

-   한 리그 안에서 시즌별 운영
-   일정 기간 단위 기록 관리

주요 컬럼

-   id
-   league_id
-   season_name
-   start_date
-   end_date
-   status
-   created_at
-   updated_at

status 값

-   draft
-   open
-   ongoing
-   closed

설명

-   한 리그는 여러 시즌을 가질 수 있다.

관계

-   leagues 와 N:1
-   league_teams 와 1:N
-   league_standings 와 1:N
-   matches 와 1:N

------------------------------------------------------------------------

# 5.9 league_teams

특정 시즌에 참가하는 팀 목록이다.

목적

-   시즌 참가 팀 관리
-   참가 승인 상태 관리

주요 컬럼

-   id
-   season_id
-   team_id
-   entry_status
-   created_at
-   updated_at

entry_status 값

-   pending
-   confirmed
-   rejected

관계

-   league_seasons 와 N:1
-   teams 와 N:1

권장 제약

-   `(season_id, team_id)` unique

------------------------------------------------------------------------

# 5.10 league_standings

리그 순위 캐시 테이블이다.

목적

-   경기 확정 후 리그 순위를 빠르게 조회
-   매번 실시간 계산하지 않고 결과를 저장

주요 컬럼

-   id
-   season_id
-   team_id
-   played
-   win
-   draw
-   loss
-   goals_for
-   goals_against
-   goal_diff
-   points
-   rank
-   updated_at

설명

-   경기 확정 시 standings를 재계산한다.
-   정렬 기준은 points \> goal_diff \> goals_for \> head_to_head 순으로
    처리한다.

관계

-   league_seasons 와 N:1
-   teams 와 N:1

권장 제약

-   `(season_id, team_id)` unique

------------------------------------------------------------------------

# 5.11 matches

경기 기본 정보 테이블이다.

목적

-   경기 생성 및 상태 관리
-   팀, 장소, 일정, 리그 연결

주요 컬럼

-   id
-   season_id
-   home_team_id
-   away_team_id
-   referee_user_id
-   venue_name
-   venue_lat
-   venue_lng
-   scheduled_at
-   match_type
-   status
-   home_acceptance_status
-   away_acceptance_status
-   auto_finalize_at
-   created_by
-   created_at
-   updated_at

match_type 값

-   friendly
-   league
-   tournament

status 값

-   scheduled
-   ongoing
-   awaiting_confirmation
-   disputed
-   finalized
-   cancelled

acceptance_status 값 예시

-   pending
-   accepted
-   rejected

설명

-   홈팀과 원정팀은 서로 달라야 한다.
-   시즌에 속하지 않는 친선전도 허용 가능하다.
-   자동 확정 시간을 기준으로 배치 작업이 실행된다.

관계

-   league_seasons 와 N:1
-   teams 와 N:1 (home_team_id)
-   teams 와 N:1 (away_team_id)
-   profiles 와 N:1 (referee_user_id)
-   match_results 와 1:1
-   match_events 와 1:N
-   match_disputes 와 1:0..1
-   attendance_polls 와 1:N
-   videos 와 1:N

권장 제약

-   `home_team_id != away_team_id`

------------------------------------------------------------------------

# 5.12 match_results

경기 스코어 결과 테이블이다.

목적

-   경기 최종 또는 초안 점수 저장
-   확정 여부 관리

주요 컬럼

-   id
-   match_id
-   home_score
-   away_score
-   home_captain_accepted
-   away_captain_accepted
-   submitted_by
-   submitted_role
-   submitted_at
-   finalized_at
-   is_final
-   status
-   dispute_reason
-   created_at
-   updated_at

submitted_role 값

-   referee
-   admin

status 값

-   pending
-   verified
-   disputed
-   auto_finalized

설명

-   결과는 기본적으로 심판이 제출한다.
-   최종 확정 전까지는 검토 상태가 될 수 있다.
-   `home_captain_accepted`, `away_captain_accepted`는 각 팀 주장의 수락
    여부를 boolean으로 저장한다.
-   `status`는 결과의 현재 상태를 나타낸다.
-   `dispute_reason`은 거부 시 사유를 저장한다.
-   `is_final = true`가 되면 결과는 확정된 상태다.

관계

-   matches 와 1:1
-   profiles 와 N:1

권장 제약

-   `match_id` unique

------------------------------------------------------------------------

# 5.13 match_events

경기 이벤트 기록 테이블이다.

목적

-   골, 도움, 카드 등 경기 기록 저장
-   개인 기록 및 통계 생성 기반 제공

주요 컬럼

-   id
-   match_id
-   team_id
-   player_user_id
-   event_type
-   minute
-   created_by
-   created_at

event_type 값

-   goal
-   assist
-   own_goal
-   yellow_card
-   red_card
-   mvp

설명

-   한 경기에는 여러 이벤트가 존재할 수 있다.
-   player_user_id가 없는 이벤트도 일부 허용 가능하다.

관계

-   matches 와 N:1
-   teams 와 N:1
-   profiles 와 N:1

------------------------------------------------------------------------

# 5.14 match_disputes

경기 분쟁 테이블이다.

목적

-   경기 결과 거부 시 분쟁 상태 저장
-   운영자 검토 및 해결 기록 관리

주요 컬럼

-   id
-   match_id
-   raised_by
-   reason
-   status
-   resolution_note
-   resolved_by
-   resolved_at
-   created_at
-   updated_at

status 값

-   open
-   reviewing
-   resolved
-   rejected

설명

-   한 경기당 하나의 활성 분쟁만 허용하는 것이 좋습니다. (구현 예:
    `CREATE UNIQUE INDEX one_active_dispute_per_match_idx ON match_disputes (match_id) WHERE status IN ('open', 'reviewing');`)
-   증거 파일은 별도 media_assets 또는 storage path로 연결 가능하다.

관계

-   matches 와 1:0..1
-   profiles 와 N:1

권장 제약

-   `match_id` unique

------------------------------------------------------------------------

# 5.15 attendance_polls

출석 투표 단위 테이블이다.

목적

-   경기 생성 시 팀별 출석 투표 생성
-   각 팀의 참석 인원 관리

주요 컬럼

-   id
-   match_id
-   team_id
-   deadline_at
-   created_at
-   updated_at

설명

-   한 경기에서 홈팀/원정팀 각각 poll이 생성될 수 있다.
-   투표 마감 시간 이후 응답 정책은 앱 정책에 따라 결정한다.

관계

-   matches 와 N:1
-   teams 와 N:1
-   attendance_votes 와 1:N

------------------------------------------------------------------------

# 5.16 attendance_votes

출석 투표 응답 테이블이다.

목적

-   개인별 참석 여부 저장
-   리마인드 대상 계산

주요 컬럼

-   id
-   poll_id
-   user_id
-   response
-   note
-   responded_at
-   created_at
-   updated_at

response 값

-   yes
-   no
-   late
-   unknown

설명

-   unknown은 기본 미응답 상태
-   responded_at으로 마지막 응답 시간 추적

관계

-   attendance_polls 와 N:1
-   profiles 와 N:1

권장 제약

-   `(poll_id, user_id)` unique

------------------------------------------------------------------------

# 5.17 payments

결제 마스터 테이블이다.

목적

-   결제 상태 추적
-   결제 대상 및 결제 수단 관리
-   서버 검증 기준 원장 역할

주요 컬럼

-   id
-   user_id
-   team_id
-   source_type
-   source_id
-   provider
-   provider_order_id
-   amount
-   currency
-   status
-   paid_at
-   raw_payload
-   created_at
-   updated_at

source_type 값 예시

-   membership_fee
-   ticket
-   shop_order

provider 값 예시

-   momo
-   zalopay

status 값

-   created
-   pending
-   paid
-   failed
-   cancelled
-   refunded

설명

-   결제 성공 판단은 반드시 서버 웹훅 검증 기준이다.
-   클라이언트 콜백만으로는 paid 처리하지 않는다.

관계

-   profiles 와 N:1
-   teams 와 N:1
-   payment_items 와 1:N
-   tournament_tickets 와 1:0..1

------------------------------------------------------------------------

# 5.18 payment_items

결제 상세 항목 테이블이다.

목적

-   하나의 결제에 포함된 세부 항목 관리
-   추후 영수증 및 주문 상세 표시

주요 컬럼

-   id
-   payment_id
-   item_type
-   item_name
-   quantity
-   unit_price
-   total_price
-   created_at
-   updated_at

관계

-   payments 와 N:1

------------------------------------------------------------------------

# 5.19 tournament_tickets

유료 개최권 관리 테이블이다.

목적

-   대회/리그 개최권 구매 및 사용 상태 추적

주요 컬럼

-   id
-   owner_user_id
-   team_id
-   league_id
-   payment_id
-   ticket_type
-   status
-   used_at
-   expires_at
-   created_at
-   updated_at

status 값 예시

-   active
-   used
-   expired
-   cancelled

관계

-   profiles 와 N:1
-   teams 와 N:1
-   leagues 와 N:1
-   payments 와 N:1

------------------------------------------------------------------------

# 5.20 media_assets

공통 미디어 메타데이터 테이블이다.

목적

-   업로드된 파일의 메타데이터 관리
-   이미지, 영상, 오디오를 공통 구조로 저장

주요 컬럼

-   id
-   owner_user_id
-   bucket_name
-   object_path
-   mime_type
-   file_size
-   width
-   height
-   duration_ms
-   created_at
-   updated_at

설명

-   실제 파일은 Supabase Storage에 저장
-   DB에는 파일 메타데이터와 위치만 저장

관계

-   profiles 와 N:1
-   videos 와 1:N
-   shortform_jobs 와 1:N

------------------------------------------------------------------------

# 5.21 videos

경기 영상 단위 테이블이다.

목적

-   경기 원본 영상 또는 처리된 영상 관리
-   경기와 영상 연결

주요 컬럼

-   id
-   uploader_user_id
-   match_id
-   source_asset_id
-   processed_asset_id
-   status
-   created_at
-   updated_at

status 값

-   uploaded
-   queued
-   processing
-   done
-   failed

관계

-   profiles 와 N:1
-   matches 와 N:1
-   media_assets 와 N:1
-   shortform_jobs 와 1:N

------------------------------------------------------------------------

# 5.22 shortform_jobs

숏폼 생성 작업 테이블이다.

목적

-   영상 편집 요청 상태 관리
-   BGM 적용 및 오디오 덕킹 여부 관리

주요 컬럼

-   id
-   video_id
-   start_ms
-   end_ms
-   bgm_asset_id
-   ducking_enabled
-   status
-   output_asset_id
-   created_at
-   updated_at

status 값

-   queued
-   processing
-   done
-   failed

관계

-   videos 와 N:1
-   media_assets 와 N:1

------------------------------------------------------------------------

# 5.23 notifications

인앱 알림 저장 테이블이다.

목적

-   사용자 알림 내역 저장
-   읽음 여부 추적

주요 컬럼

-   id
-   user_id
-   type
-   title
-   body
-   data
-   sent_at
-   read_at
-   created_at

설명

-   푸시 알림과 인앱 알림을 함께 관리할 수 있다.
-   data에는 이동 경로, 관련 match_id 등의 추가 정보 저장 가능

관계

-   profiles 와 N:1

------------------------------------------------------------------------

# 5.24 audit_logs

감사 로그 테이블이다.

목적

-   운영 추적
-   분쟁, 강제 수정, 관리자 조치 기록
-   중요한 상태 변경 이력 보존

주요 컬럼

-   id
-   actor_user_id
-   entity_type
-   entity_id
-   action
-   before_data (jsonb)
-   after_data (jsonb)
-   created_at

설명

-   중요한 변경은 모두 로그로 남긴다.
-   보안 및 운영 이슈 발생 시 추적 근거가 된다.

관계

-   profiles 와 N:1

------------------------------------------------------------------------

# 6. 관계 요약

## 6.1 사용자 중심 관계

-   auth.users 1 : 1 profiles
-   profiles 1 : N user_devices
-   profiles 1 : N team_members
-   profiles 1 : N payments
-   profiles 1 : N notifications
-   profiles 1 : N audit_logs

## 6.2 팀 중심 관계

-   teams 1 : N team_members
-   teams 1 : N team_invites
-   teams 1 : N league_teams
-   teams 1 : N league_standings
-   teams 1 : N matches (home/away 기준 분리)
-   teams 1 : N payments

## 6.3 리그 중심 관계

-   leagues 1 : N league_seasons
-   league_seasons 1 : N league_teams
-   league_seasons 1 : N league_standings
-   league_seasons 1 : N matches

## 6.4 경기 중심 관계

-   matches 1 : 1 match_results
-   matches 1 : N match_events
-   matches 1 : 0..1 match_disputes
-   matches 1 : N attendance_polls
-   attendance_polls 1 : N attendance_votes
-   matches 1 : N videos

## 6.5 결제 및 미디어 관계

-   payments 1 : N payment_items
-   payments 1 : 0..1 tournament_tickets
-   media_assets 1 : N videos
-   videos 1 : N shortform_jobs

------------------------------------------------------------------------

# 7. Mermaid ERD

``` mermaid
erDiagram
  auth_users ||--|| profiles : has
  profiles ||--o{ user_devices : owns
  profiles ||--o{ team_members : joins
  profiles ||--o{ payments : makes
  profiles ||--o{ notifications : receives
  profiles ||--o{ audit_logs : acts

  teams ||--o{ team_members : contains
  teams ||--o{ team_invites : creates
  teams ||--o{ league_teams : participates
  teams ||--o{ league_standings : ranked
  teams ||--o{ matches : plays
  teams ||--o{ payments : belongs_to

  leagues ||--o{ league_seasons : has
  league_seasons ||--o{ league_teams : includes
  league_seasons ||--o{ league_standings : tracks
  league_seasons ||--o{ matches : schedules

  matches ||--|| match_results : has
  matches ||--o{ match_events : records
  matches ||--o| match_disputes : may_have
  matches ||--o{ attendance_polls : creates
  attendance_polls ||--o{ attendance_votes : contains
  matches ||--o{ videos : has

  payments ||--o{ payment_items : includes
  payments ||--o| tournament_tickets : creates

  media_assets ||--o{ videos : source
  videos ||--o{ shortform_jobs : processes
```

------------------------------------------------------------------------

# 8. MVP 우선 생성 테이블

MVP에서는 아래 테이블부터 먼저 만든다.

## 8.1 1차 필수

-   profiles
-   user_devices
-   teams
-   team_members
-   team_invites
-   matches
-   match_results
-   match_events
-   attendance_polls
-   attendance_votes
-   notifications
-   audit_logs

## 8.2 2차 필수

-   leagues
-   league_seasons
-   league_teams
-   league_standings
-   match_disputes

## 8.3 후순위

-   payments
-   payment_items
-   tournament_tickets
-   media_assets
-   videos
-   shortform_jobs

------------------------------------------------------------------------

# 9. 인덱스 권장 사항

성능을 위해 아래 인덱스를 권장한다.

-   team_members(team_id)
-   team_members(user_id)
-   matches(home_team_id)
-   matches(away_team_id)
-   matches(season_id)
-   matches(status)
-   matches(scheduled_at)
-   attendance_votes(poll_id)
-   payments(user_id)
-   payments(status)
-   notifications(user_id)
-   league_standings(season_id, rank)

------------------------------------------------------------------------

# 10. 확장 데이터 구조

## 10.1 league_season_history

시즌 종료 후 최종 순위 스냅샷 테이블이다.

목적

-   시즌 종료 시점의 최종 순위, 승점 등 확정된 데이터를 보관한다.
-   과거 시즌의 기록을 조회할 때 사용한다.

주요 컬럼

-   id
-   season_id
-   team_id
-   final_rank
-   played
-   win
-   draw
-   loss
-   goals_for
-   goals_against
-   goal_diff
-   points
-   snapshot_at

관계

-   league_seasons 와 N:1
-   teams 와 N:1

------------------------------------------------------------------------

# 10. 주의사항

-   `profiles.id`는 반드시 `auth.users.id`와 일치해야 한다.
-   경기 결과 확정 로직은 클라이언트가 아닌 서버에서 처리해야 한다.
-   결제는 클라이언트 성공 화면이 아니라 웹훅 검증 기준으로 확정해야
    한다.
-   `league_standings`는 캐시 테이블이므로 경기 확정 시 재계산 로직이
    필요하다.
-   `match_disputes`는 운영자 검토 절차와 연결되어야 한다.
-   미디어 관련 테이블은 MVP 초반에는 뒤로 미루는 것이 안전하다.

------------------------------------------------------------------------

# 11. 다음 문서 연결

이 ERD 문서 다음에는 아래 문서가 이어져야 한다.

-   FootGo_API_Spec.md
-   FootGo_RLS_Policies.md
-   FootGo_Feature_Task_Order.md

이 문서들이 함께 있어야 실제 개발과 AI 코드 생성 품질이 안정된다.

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
