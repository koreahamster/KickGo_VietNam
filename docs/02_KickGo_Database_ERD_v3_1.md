# KickGo VN — Database ERD

문서 버전: 3.1
작성일: 2026-03-20
변경 이력: v3.0 기반. platform_settings, currency_formats, player_team_history, user_consents, reports 테이블 추가. Zalo 로그인 인증 방식 추가.

---

# 1. 설계 원칙

- 인증은 auth.users 기준
- 공통 프로필: profiles / 역할별: player_profiles, referee_profiles
- 서비스 역할(account_types) ≠ 팀 역할(team_members.role) ≠ 경기 심판(matches.referee_user_id)
- 모든 핵심 테이블: UUID PK, created_at/updated_at
- 상태값: check constraint 고정
- Write: Edge Functions 경유 (service_role)
- 결제 확정: Webhook 경유만
- finalized 경기 결과 수정 불가

---

# 2. 전체 테이블 목록

## 인증 및 사용자
auth.users, profiles, account_types, player_profiles, referee_profiles, user_devices, user_blocks, user_consents

## 관리자
user_admin_roles

## 팀
teams, team_members, team_invites, team_announcements, team_fee_records, team_fee_usages

## 용병/모집
mercenary_posts, mercenary_applications, team_recruitment_posts, team_recruitment_applications

## 리그/티어
leagues, league_tiers, team_league_tiers, league_seasons, league_teams, league_standings, league_season_history, promotion_playoffs

## 대회
tournaments, tournament_team_registrations, tournament_brackets

## 경기
matches, match_rosters, match_results, match_events, match_disputes

## 출석
attendance_polls, attendance_votes

## 심판 비즈니스
referee_availability, referee_assignments, referee_payment_records, referee_ratings

## 운동장
facilities, facility_courts, facility_schedules, facility_bookings, facility_revenues

## 풋살 (구조만)
futsal_match_requests

## MVP / 경기 카드
mvp_votes, match_cards

## 소셜
posts, shorts, post_likes, post_comments, follows

## 통계
player_season_stats

## 결제/지갑
wallet_accounts, wallet_transactions, payment_intents, payment_items, tournament_tickets

## 쇼핑몰
shop_products, shop_orders, shop_order_items

## 알림
notifications

## 감사/운영
audit_logs

---

# 3. 테이블 상세 정의

## 3.1 profiles

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | uuid | PK, FK auth.users.id | |
| display_name | text | not null | |
| avatar_url | text | nullable | Supabase Storage |
| birth_year | integer | nullable | |
| bio | text | nullable | |
| phone | text | nullable | |
| is_phone_verified | boolean | not null, default false | |
| country_code | text | not null | |
| province_code | text | not null | |
| district_code | text | not null | |
| preferred_language | text | not null, check (vi/ko/en) | |
| visibility | text | not null, default 'members_only', check (public/members_only/private) | 공개 범위 |
| created_at | timestamptz | not null | |
| updated_at | timestamptz | not null | |

---

## 3.2 account_types

| 컬럼 | 타입 | 제약 |
|---|---|---|
| user_id | uuid | FK profiles.id |
| type | text | check (player/referee/facility_manager) |
| created_at | timestamptz | not null |

제약: unique(user_id, type)

---

## 3.3 player_profiles

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| user_id | uuid | PK, FK profiles.id | |
| preferred_position | text | not null | |
| preferred_foot | text | nullable | |
| dominant_foot | text | not null | |
| top_size | text | nullable | |
| shoe_size | text | nullable | |
| skill_tier | integer | not null, default 1000 | 시스템 관리 |
| reputation_score | integer | not null, default 100 | 시스템 관리 |
| created_at | timestamptz | not null | |
| updated_at | timestamptz | not null | |

---

## 3.4 referee_profiles

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| user_id | uuid | PK, FK profiles.id | |
| average_rating | numeric(3,2) | nullable | 누적 평균 |
| rating_count | integer | not null, default 0 | |
| created_at | timestamptz | not null | |
| updated_at | timestamptz | not null | |

---

## 3.5 user_devices

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK profiles.id |
| device_platform | text | check (ios/android) |
| push_token | text | FCM 토큰 |
| app_version | text | nullable |
| is_active | boolean | default true |
| last_seen_at | timestamptz | nullable |
| created_at / updated_at | timestamptz | |

---

## 3.6 user_blocks

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid | PK |
| blocker_id | uuid | FK profiles.id — 차단한 사람 |
| blocked_id | uuid | FK profiles.id — 차단된 사람 |
| created_at | timestamptz | |

제약: unique(blocker_id, blocked_id)

---

## 3.7 user_admin_roles

| 컬럼 | 타입 | 설명 |
|---|---|---|
| user_id | uuid | FK profiles.id |
| role | text | check (super_admin/ops_admin/content_admin/support_admin) |
| granted_by | uuid | FK profiles.id |
| created_at | timestamptz | |

제약: unique(user_id, role)

---

## 3.8 teams

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | uuid | PK | |
| name | text | not null | |
| slug | text | unique | URL 식별값 |
| emblem_url | text | nullable | Supabase Storage |
| country_code | text | not null | |
| province_code | text | not null | |
| district_code | text | not null | |
| description | text | nullable | |
| visibility | text | not null, default 'public', check (public/members_only/private) | |
| is_recruiting | boolean | not null, default false | 팀원 모집 중 여부 |
| created_at / updated_at | timestamptz | | |

---

## 3.9 team_members

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | uuid | PK | |
| team_id | uuid | FK teams.id | |
| user_id | uuid | FK profiles.id | |
| role | text | check (owner/manager/captain/player) | |
| squad_number | integer | nullable | 등번호 |
| status | text | check (pending/active/left/banned) | |
| kicked_by | uuid | FK profiles.id, nullable | 강퇴 시 owner id |
| kicked_at | timestamptz | nullable | |
| joined_at | timestamptz | nullable | |
| created_at / updated_at | timestamptz | | |

제약: unique(team_id, user_id)

---

## 3.10 team_invites

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid | PK |
| team_id | uuid | FK teams.id |
| invited_by | uuid | FK profiles.id |
| invite_code | text | unique |
| invite_type | text | check (link/code) |
| expires_at | timestamptz | nullable |
| used_by | uuid | nullable |
| used_at | timestamptz | nullable |
| created_at | timestamptz | |

---

## 3.11 team_announcements

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid | PK |
| team_id | uuid | FK teams.id |
| author_id | uuid | FK profiles.id |
| title | text | |
| body | text | |
| created_at / updated_at | timestamptz | |

---

## 3.12 team_fee_records

월별 팀 회비 납입 기록.

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid | PK |
| team_id | uuid | FK teams.id |
| user_id | uuid | FK profiles.id — 납입 선수 |
| year_month | text | 예: "2026-03" |
| amount | integer | 납입 금액 (VND) |
| paid_at | timestamptz | |
| note | text | nullable |
| recorded_by | uuid | FK profiles.id — 기록한 관리자 |
| created_at | timestamptz | |

제약: unique(team_id, user_id, year_month)

---

## 3.13 team_fee_usages

팀 회비 사용 내역.

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid | PK |
| team_id | uuid | FK teams.id |
| amount | integer | 사용 금액 |
| description | text | 사용 내역 |
| used_at | date | |
| recorded_by | uuid | FK profiles.id |
| created_at | timestamptz | |

---

## 3.14 mercenary_posts

용병 모집 공고.

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | uuid | PK | |
| team_id | uuid | FK teams.id | |
| match_id | uuid | FK matches.id, nullable | 연결된 경기 |
| posted_by | uuid | FK profiles.id | |
| needed_positions | text[] | nullable | 필요 포지션 |
| needed_count | integer | not null, default 1 | 모집 인원 |
| match_date | date | nullable | |
| province_code | text | not null | |
| district_code | text | not null | |
| description | text | nullable | |
| status | text | not null, check (open/closed/cancelled) | |
| created_at / updated_at | timestamptz | | |

---

## 3.15 mercenary_applications

용병 지원.

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid | PK |
| post_id | uuid | FK mercenary_posts.id |
| applicant_id | uuid | FK profiles.id |
| message | text | nullable |
| status | text | check (pending/accepted/rejected) |
| created_at / updated_at | timestamptz | |

제약: unique(post_id, applicant_id)

---

## 3.16 team_recruitment_posts

팀 모집 공고 (팀이 선수 구하거나 선수가 팀 구하는 공고).

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | uuid | PK | |
| post_type | text | check (team_seeks_player/player_seeks_team) | |
| author_id | uuid | FK profiles.id | |
| team_id | uuid | FK teams.id, nullable | team_seeks_player인 경우 |
| positions | text[] | nullable | |
| tier_min | integer | nullable | 최소 티어 |
| province_code | text | not null | |
| description | text | nullable | |
| status | text | check (open/closed) | |
| created_at / updated_at | timestamptz | | |

---

## 3.17 team_recruitment_applications

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid | PK |
| post_id | uuid | FK team_recruitment_posts.id |
| applicant_id | uuid | FK profiles.id |
| message | text | nullable |
| status | text | check (pending/accepted/rejected) |
| created_at / updated_at | timestamptz | |

---

## 3.18 leagues

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | uuid | PK | |
| creator_user_id | uuid | FK profiles.id | |
| name | text | not null | |
| region_code | text | not null | 지역별 독립 운영 |
| format_type | text | check (league/tournament) | |
| visibility | text | check (public/private) | |
| created_at / updated_at | timestamptz | | |

---

## 3.19 league_tiers

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | uuid | PK | |
| league_id | uuid | FK leagues.id | |
| tier_level | integer | not null | 1=다이아~5=브론즈 |
| tier_name | text | not null | Diamond/Platinum/Gold/Silver/Bronze |
| max_teams | integer | nullable | |
| promotion_slots | integer | nullable | 승급전 진출 수 |
| relegation_slots | integer | nullable | 강등 수 |
| created_at | timestamptz | | |

제약: unique(league_id, tier_level)

---

## 3.20 team_league_tiers

팀의 현재 티어 소속.

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid | PK |
| team_id | uuid | FK teams.id |
| league_id | uuid | FK leagues.id |
| tier_id | uuid | FK league_tiers.id |
| tier_points | integer | not null, default 0 — 현재 포인트 (0~100) |
| assigned_at | timestamptz | |
| created_at / updated_at | timestamptz | |

제약: unique(team_id, league_id)

---

## 3.21 promotion_playoffs

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid | PK |
| season_id | uuid | FK league_seasons.id |
| team_id | uuid | FK teams.id |
| from_tier_id | uuid | FK league_tiers.id |
| to_tier_id | uuid | FK league_tiers.id |
| wins | integer | default 0 |
| losses | integer | default 0 |
| status | text | check (ongoing/promoted/failed) |
| created_at / updated_at | timestamptz | |

---

## 3.22 league_seasons

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | uuid | PK | |
| league_id | uuid | FK leagues.id | |
| season_name | text | not null | |
| start_date | date | nullable | |
| end_date | date | nullable | |
| status | text | check (draft/open/ongoing/playoff/closed) | |
| created_at / updated_at | timestamptz | | |

---

## 3.23 league_standings

실시간 순위 캐시.

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid | PK |
| season_id | uuid | FK league_seasons.id |
| tier_id | uuid | FK league_tiers.id |
| team_id | uuid | FK teams.id |
| played / win / draw / loss | integer | |
| goals_for / goals_against / goal_diff | integer | |
| points | integer | |
| rank | integer | |
| updated_at | timestamptz | |

---

## 3.24 league_season_history

시즌 종료 후 최종 스냅샷.

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid | PK |
| season_id | uuid | FK league_seasons.id |
| tier_id | uuid | FK league_tiers.id |
| team_id | uuid | FK teams.id |
| final_rank | integer | |
| played/win/draw/loss | integer | |
| goals_for/goals_against/goal_diff | integer | |
| points | integer | |
| snapshot_at | timestamptz | |

---

## 3.25 tournaments

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | uuid | PK | |
| creator_user_id | uuid | FK profiles.id | |
| name | text | not null | |
| province_code | text | not null | |
| max_teams | integer | not null, default 4 | |
| status | text | check (draft/open/ongoing/completed/cancelled) | |
| ticket_id | uuid | FK tournament_tickets.id, nullable | |
| has_advanced_features | boolean | not null, default false | |
| created_at / updated_at | timestamptz | | |

---

## 3.26 tournament_team_registrations

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid | PK |
| tournament_id | uuid | FK tournaments.id |
| team_id | uuid | FK teams.id |
| registered_by | uuid | FK profiles.id |
| status | text | check (pending/confirmed/rejected) |
| created_at | timestamptz | |

제약: unique(tournament_id, team_id)

---

## 3.27 tournament_brackets

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid | PK |
| tournament_id | uuid | FK tournaments.id |
| round_number | integer | |
| position | integer | |
| home_team_id | uuid | nullable |
| away_team_id | uuid | nullable |
| match_id | uuid | FK matches.id, nullable |
| winner_team_id | uuid | nullable |
| created_at / updated_at | timestamptz | |

제약: unique(tournament_id, round_number, position)

---

## 3.28 matches

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | uuid | PK | |
| home_team_id | uuid | FK teams.id | |
| away_team_id | uuid | FK teams.id | |
| season_id | uuid | FK league_seasons.id, nullable | |
| tier_id | uuid | FK league_tiers.id, nullable | 티어전인 경우 |
| tournament_id | uuid | FK tournaments.id, nullable | |
| referee_user_id | uuid | FK profiles.id, nullable | soccer만 |
| facility_booking_id | uuid | FK facility_bookings.id, nullable | |
| scheduled_at | timestamptz | not null | |
| venue_name | text | nullable | |
| sport_type | text | not null, check (soccer/futsal) | |
| match_type | text | not null, check (friendly/league/tournament) | |
| futsal_match_type | text | nullable, check (ranked/friendly) | |
| status | text | not null, check (scheduled/ongoing/awaiting_confirmation/awaiting_result/finalized/disputed/auto_finalized/cancelled) | |
| created_at / updated_at | timestamptz | | |

---

## 3.29 match_rosters

경기 출전 명단.

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid | PK |
| match_id | uuid | FK matches.id |
| team_id | uuid | FK teams.id |
| user_id | uuid | FK profiles.id |
| is_mercenary | boolean | not null, default false — 용병 여부 |
| squad_number | integer | |
| position | text | nullable |
| confirmed_by | uuid | FK profiles.id, nullable — 심판 |
| confirmed_at | timestamptz | nullable |
| created_at | timestamptz | |

제약: unique(match_id, team_id, squad_number)

---

## 3.30 match_results

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | uuid | PK | |
| match_id | uuid | FK matches.id, unique | |
| home_score | integer | nullable | |
| away_score | integer | nullable | |
| status | text | check (draft/submitted/awaiting_confirmation/finalized/disputed/auto_finalized) | |
| submitted_by | uuid | FK profiles.id, nullable | |
| submitted_at | timestamptz | nullable | |
| home_captain_accepted | boolean | nullable | |
| away_captain_accepted | boolean | nullable | |
| auto_finalize_at | timestamptz | nullable | |
| created_at / updated_at | timestamptz | | |

---

## 3.31 match_events

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | uuid | PK | |
| match_id | uuid | FK matches.id | |
| player_id | uuid | FK profiles.id, nullable | |
| team_id | uuid | FK teams.id | |
| event_type | text | check (goal/assist/own_goal/yellow_card/red_card) | |
| minute | integer | nullable | |
| created_at | timestamptz | | |

---

## 3.32 match_disputes

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid | PK |
| match_id | uuid | FK matches.id |
| disputed_by | uuid | FK profiles.id |
| reason | text | nullable |
| status | text | check (open/resolved/dismissed) |
| resolved_by | uuid | nullable |
| resolved_at | timestamptz | nullable |
| created_at / updated_at | timestamptz | |

---

## 3.33 attendance_polls

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid | PK |
| match_id | uuid | FK matches.id |
| team_id | uuid | FK teams.id |
| deadline_at | timestamptz | |
| created_at | timestamptz | |

---

## 3.34 attendance_votes

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | uuid | PK | |
| poll_id | uuid | FK attendance_polls.id | |
| user_id | uuid | FK profiles.id | |
| response | text | check (yes/no/late/unknown) | |
| responded_at | timestamptz | nullable | |
| created_at | timestamptz | | |

제약: unique(poll_id, user_id)

---

## 3.35 referee_availability

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid | PK |
| referee_user_id | uuid | FK profiles.id |
| available_date | date | |
| start_time | time | |
| end_time | time | |
| status | text | check (available/booked/cancelled) |
| created_at / updated_at | timestamptz | |

---

## 3.36 referee_assignments

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | uuid | PK | |
| match_id | uuid | FK matches.id, unique | 경기당 1명 |
| referee_user_id | uuid | FK profiles.id | |
| requested_by | uuid | FK profiles.id | |
| status | text | check (requested/accepted/completed/cancelled) | |
| fee_amount | integer | nullable | 합의 일당 (VND) |
| requested_at | timestamptz | | |
| responded_at | timestamptz | nullable | |
| created_at / updated_at | timestamptz | | |

---

## 3.37 referee_payment_records

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid | PK |
| assignment_id | uuid | FK referee_assignments.id |
| referee_user_id | uuid | FK profiles.id |
| match_id | uuid | FK matches.id |
| fee_amount | integer | |
| status | text | check (pending/paid/cancelled) |
| paid_at | timestamptz | nullable |
| note | text | nullable |
| created_at | timestamptz | |

---

## 3.38 referee_ratings

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | uuid | PK | |
| match_id | uuid | FK matches.id | |
| referee_user_id | uuid | FK profiles.id | |
| rated_by | uuid | FK profiles.id | 팀 관리자 |
| team_id | uuid | FK teams.id | |
| score_fairness | integer | check (1~5) | |
| score_accuracy | integer | check (1~5) | |
| score_attitude | integer | check (1~5) | |
| overall_score | integer | check (1~5) | |
| comment | text | nullable | |
| created_at | timestamptz | | |

제약: unique(match_id, team_id)

---

## 3.39 facilities

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | uuid | PK | |
| manager_user_id | uuid | FK profiles.id | |
| name | text | not null | |
| sport_types | text[] | not null | soccer/futsal/both |
| country_code | text | not null | |
| province_code | text | not null | |
| district_code | text | not null | |
| address | text | nullable | |
| description | text | nullable | |
| photo_urls | text[] | nullable | 복수 사진 |
| is_active | boolean | not null, default false | 승인 후 true |
| created_at / updated_at | timestamptz | | |

---

## 3.40 facility_courts

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | uuid | PK | |
| facility_id | uuid | FK facilities.id | |
| name | text | not null | 예: A구장 |
| sport_type | text | check (soccer/futsal) | |
| price_per_hour | integer | not null | VND |
| capacity | integer | nullable | |
| is_active | boolean | not null, default true | |
| created_at / updated_at | timestamptz | | |

---

## 3.41 facility_schedules

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid | PK |
| court_id | uuid | FK facility_courts.id |
| day_of_week | integer | nullable (0~6) |
| specific_date | date | nullable |
| open_time | time | |
| close_time | time | |
| slot_duration_minutes | integer | default 60 |
| is_active | boolean | default true |
| created_at | timestamptz | |

---

## 3.42 facility_bookings

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | uuid | PK | |
| court_id | uuid | FK facility_courts.id | |
| user_id | uuid | FK profiles.id | 예약자 |
| match_id | uuid | FK matches.id, nullable | |
| start_time | timestamptz | not null | |
| end_time | timestamptz | not null | |
| total_price | integer | not null | |
| status | text | check (pending/confirmed/cancelled/completed) | |
| payment_intent_id | uuid | FK payment_intents.id, nullable | |
| cancellation_reason | text | nullable | |
| cancelled_at | timestamptz | nullable | |
| created_at / updated_at | timestamptz | | |

---

## 3.43 facility_revenues

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid | PK |
| facility_id | uuid | FK facilities.id |
| booking_id | uuid | FK facility_bookings.id |
| gross_amount | integer | |
| platform_fee | integer | |
| net_amount | integer | |
| status | text | check (pending/settled/cancelled) |
| settled_at | timestamptz | nullable |
| created_at | timestamptz | |

---

## 3.44 futsal_match_requests (구조만, MVP 제외)

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid | PK |
| requester_team_id | uuid | FK teams.id |
| target_team_id | uuid | nullable (friendly만) |
| match_request_type | text | check (ranked/friendly) |
| preferred_date | date | nullable |
| preferred_time | time | nullable |
| facility_id | uuid | nullable |
| status | text | check (waiting/matched/accepted/declined/cancelled) |
| matched_match_id | uuid | nullable |
| created_at / updated_at | timestamptz | |

---

## 3.45 mvp_votes

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | uuid | PK | |
| match_id | uuid | FK matches.id | |
| voter_id | uuid | FK profiles.id | 투표자 |
| voted_fw_id | uuid | FK profiles.id | 공격 MVP 투표 |
| voted_mf_id | uuid | FK profiles.id | 미드필더 MVP 투표 |
| voted_df_id | uuid | FK profiles.id | 수비 MVP 투표 |
| is_referee_vote | boolean | not null, default false | |
| created_at | timestamptz | | |

제약: unique(match_id, voter_id)

---

## 3.46 match_cards

경기 기록 카드 (FIFA 스타일).

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid | PK |
| match_id | uuid | FK matches.id, unique |
| mvp_fw_user_id | uuid | nullable |
| mvp_mf_user_id | uuid | nullable |
| mvp_df_user_id | uuid | nullable |
| card_image_url | text | nullable — 생성된 카드 이미지 |
| generated_at | timestamptz | nullable |
| created_at | timestamptz | |

---

## 3.47 posts

소셜 게시글.

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid | PK |
| author_id | uuid | FK profiles.id |
| content | text | |
| media_urls | text[] | nullable |
| hashtags | text[] | nullable |
| visibility | text | check (public/members_only/private) |
| created_at / updated_at | timestamptz | |

---

## 3.48 shorts

축구 기술 쇼츠 영상.

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid | PK |
| author_id | uuid | FK profiles.id |
| storage_path | text | Supabase Storage |
| thumbnail_url | text | nullable |
| duration_seconds | integer | nullable |
| hashtags | text[] | nullable |
| status | text | check (processing/ready/failed) |
| like_count | integer | default 0 |
| view_count | integer | default 0 |
| created_at / updated_at | timestamptz | |

---

## 3.49 post_likes

| 컬럼 | 타입 | 설명 |
|---|---|---|
| post_id | uuid | FK posts.id 또는 shorts.id |
| post_type | text | check (post/shorts) |
| user_id | uuid | FK profiles.id |
| created_at | timestamptz | |

제약: unique(post_id, post_type, user_id)

---

## 3.50 post_comments

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid | PK |
| post_id | uuid | |
| post_type | text | check (post/shorts) |
| author_id | uuid | FK profiles.id |
| content | text | |
| parent_comment_id | uuid | nullable — 대댓글 |
| created_at / updated_at | timestamptz | |

---

## 3.51 follows

| 컬럼 | 타입 | 설명 |
|---|---|---|
| follower_id | uuid | FK profiles.id |
| followee_id | uuid | FK profiles.id 또는 teams.id |
| followee_type | text | check (user/team) |
| created_at | timestamptz | |

제약: unique(follower_id, followee_id, followee_type)

---

## 3.52 player_season_stats

선수 시즌 누적 통계.

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK profiles.id |
| season_id | uuid | FK league_seasons.id, nullable |
| matches_played | integer | default 0 |
| goals | integer | default 0 |
| assists | integer | default 0 |
| yellow_cards | integer | default 0 |
| red_cards | integer | default 0 |
| mvp_fw_count | integer | default 0 |
| mvp_mf_count | integer | default 0 |
| mvp_df_count | integer | default 0 |
| updated_at | timestamptz | |

---

## 3.53 wallet_accounts

| 컬럼 | 타입 | 설명 |
|---|---|---|
| user_id | uuid | PK, FK profiles.id |
| balance | integer | not null, default 0 — 표시 잔액 |
| created_at / updated_at | timestamptz | |

---

## 3.54 wallet_transactions

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK profiles.id |
| type | text | check (deposit/match_fee/refund/facility_payment/shop_payment) |
| amount | integer | |
| status | text | check (pending/confirmed/failed) |
| provider | text | nullable |
| provider_tx_id | text | nullable |
| created_at | timestamptz | |

---

## 3.55 payment_intents

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | uuid | PK | |
| user_id | uuid | FK profiles.id | |
| amount | integer | not null | |
| currency | text | not null, default 'VND' | |
| status | text | check (created/pending/paid/expired/failed) | |
| provider | text | nullable | |
| provider_payment_id | text | nullable | |
| created_at / updated_at | timestamptz | | |

상태 전이: created→pending→paid/failed, created/pending→expired

---

## 3.56 payment_items

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid | PK |
| payment_intent_id | uuid | FK payment_intents.id |
| item_type | text | check (match_fee/facility_booking/league_fee/shop_order/tournament_ticket) |
| item_id | uuid | |
| amount | integer | |

---

## 3.57 tournament_tickets

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK profiles.id |
| payment_intent_id | uuid | FK payment_intents.id |
| status | text | check (pending/active/used/cancelled) |
| created_at | timestamptz | |

---

## 3.58 shop_products

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid | PK |
| category | text | check (uniform_custom/emblem_custom/equipment/ticket) |
| name | text | |
| description | text | nullable |
| price | integer | VND |
| images | text[] | nullable |
| is_active | boolean | default true |
| requires_custom_form | boolean | default false — 제작 의뢰 상품 여부 |
| created_at / updated_at | timestamptz | |

---

## 3.59 shop_orders

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK profiles.id |
| team_id | uuid | nullable — 팀 단위 주문 |
| total_amount | integer | |
| status | text | check (pending/paid/processing/shipped/delivered/cancelled) |
| payment_intent_id | uuid | FK payment_intents.id, nullable |
| custom_data | jsonb | nullable — 유니폼/엠블럼 제작 옵션 |
| shipping_address | text | nullable |
| tracking_number | text | nullable |
| created_at / updated_at | timestamptz | |

---

## 3.60 shop_order_items

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid | PK |
| order_id | uuid | FK shop_orders.id |
| product_id | uuid | FK shop_products.id |
| quantity | integer | |
| unit_price | integer | |
| custom_options | jsonb | nullable — 사이즈/색상/번호 등 |

---


## 3.63 platform_settings

플랫폼 운영 파라미터. super_admin만 수정 가능.

| 컬럼 | 타입 | 설명 |
|---|---|---|
| key | text | PK — 설정 키 |
| value | text | not null — 설정값 |
| description | text | nullable — 설명 |
| updated_by | uuid | FK profiles.id |
| updated_at | timestamptz | |

초기 데이터:
```
referee_commission_rate    = '0'
facility_commission_rate   = '0'
shop_commission_rate       = '0'
```

---

## 3.64 currency_formats

지역별 통화 표기 설정.

| 컬럼 | 타입 | 설명 |
|---|---|---|
| country_code | text | PK |
| currency_code | text | 예: VND, KRW |
| symbol | text | 예: ₫, 원 |
| decimal_separator | text | 소수점 구분자 |
| thousands_separator | text | 천단위 구분자 |
| symbol_position | text | check (before/after) |
| updated_at | timestamptz | |

초기 데이터:
```
VN: VND, ₫, '.', '.', after  → 100.000 ₫
KR: KRW, 원, ',', ',', after → 100,000 원
```

---

## 3.65 player_team_history

선수 연도별 소속팀 이력.

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | uuid | PK | |
| user_id | uuid | FK profiles.id, not null | |
| team_id | uuid | FK teams.id, not null | |
| season_year | integer | not null | 연도 (예: 2026) |
| role | text | nullable | 당시 팀 내 역할 |
| start_date | date | not null | |
| end_date | date | nullable | null = 현재 소속 |
| created_at | timestamptz | not null | |

---

## 3.66 user_consents

개인정보처리방침 및 마케팅 동의 기록.

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK profiles.id |
| consent_type | text | check (privacy_policy/marketing) |
| is_agreed | boolean | |
| policy_version | text | 동의한 방침 버전 |
| agreed_at | timestamptz | |
| ip_address | text | nullable |
| created_at | timestamptz | |

제약: unique(user_id, consent_type)

---

## 3.67 reports

신고 유형별 상세 구분.

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | uuid | PK | |
| reporter_id | uuid | FK profiles.id | 신고자 |
| target_type | text | check (user/post/shorts/comment/team) | 신고 대상 종류 |
| target_id | uuid | not null | 신고 대상 ID |
| report_type | text | check (noshow/abuse/violence/false_report/spam/inappropriate) | 신고 유형 |
| description | text | nullable | 상세 내용 |
| status | text | check (pending/reviewed/dismissed/actioned) | |
| reviewed_by | uuid | FK profiles.id, nullable | support_admin |
| reviewed_at | timestamptz | nullable | |
| created_at | timestamptz | not null | |

---

## 3.61 notifications

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK profiles.id |
| type | text | 알림 종류 코드 |
| title | text | |
| body | text | |
| data | jsonb | nullable — 관련 ID 등 |
| sent_at | timestamptz | |
| read_at | timestamptz | nullable |
| created_at | timestamptz | |

---

## 3.62 audit_logs

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid | PK |
| actor_user_id | uuid | FK profiles.id |
| entity_type | text | |
| entity_id | uuid | |
| action | text | |
| before_data | jsonb | nullable |
| after_data | jsonb | nullable |
| created_at | timestamptz | |

---

# 4. 인덱스 권장

```sql
-- 핵심 조회 성능
CREATE INDEX ON team_members(team_id);
CREATE INDEX ON team_members(user_id);
CREATE INDEX ON matches(home_team_id);
CREATE INDEX ON matches(away_team_id);
CREATE INDEX ON matches(season_id);
CREATE INDEX ON matches(status);
CREATE INDEX ON matches(scheduled_at);
CREATE INDEX ON matches(sport_type);
CREATE INDEX ON attendance_votes(poll_id);
CREATE INDEX ON payment_intents(user_id);
CREATE INDEX ON payment_intents(status);
CREATE INDEX ON notifications(user_id);
CREATE INDEX ON notifications(read_at) WHERE read_at IS NULL;
CREATE INDEX ON league_standings(season_id, tier_id, rank);
CREATE INDEX ON player_season_stats(user_id, season_id);
CREATE INDEX ON mercenary_posts(province_code, status);
CREATE INDEX ON team_recruitment_posts(province_code, status);
CREATE INDEX ON shorts(author_id);
CREATE INDEX ON shorts(status);
CREATE INDEX ON follows(followee_id, followee_type);
CREATE INDEX ON team_fee_records(team_id, year_month);
CREATE INDEX ON shop_orders(user_id);
CREATE INDEX ON referee_availability(referee_user_id, available_date);
CREATE INDEX ON facility_bookings(court_id, start_time);
```

---

# 5. 주요 관계 요약

```
auth.users 1:1 profiles
profiles 1:N account_types
profiles 1:0..1 player_profiles
profiles 1:0..1 referee_profiles
profiles 1:N team_members
profiles 1:1 wallet_accounts

teams 1:N team_members
teams 1:N team_invites
teams 1:N team_announcements
teams 1:N team_fee_records
teams 1:N team_fee_usages
teams 1:N mercenary_posts
teams 1:N team_recruitment_posts

leagues 1:N league_tiers
leagues 1:N league_seasons
league_seasons 1:N league_standings
team_league_tiers: teams M:N leagues (via tier)

matches 1:1 match_results
matches 1:N match_events
matches 1:N match_rosters
matches 1:0..1 match_disputes
matches 1:N attendance_polls
attendance_polls 1:N attendance_votes
matches 1:1 match_cards

referee_assignments 1:1 matches (soccer)
referee_assignments 1:0..1 referee_payment_records
matches 1:N referee_ratings

facilities 1:N facility_courts
facility_courts 1:N facility_schedules
facility_courts 1:N facility_bookings
facility_bookings 1:0..1 facility_revenues

payment_intents 1:N payment_items
payment_intents 1:0..1 tournament_tickets
shop_orders 1:N shop_order_items

profiles 1:N posts
profiles 1:N shorts
profiles 1:N follows
profiles 1:N user_blocks
profiles 1:N player_season_stats
profiles 1:N audit_logs
profiles 1:N notifications
```

---

# 6. MVP 우선 생성 테이블

## 1차 (Phase 1~2)
profiles, account_types, player_profiles, referee_profiles, user_devices

## 2차 (Phase 3~5)
teams, team_members, team_invites, team_announcements,
team_fee_records, team_fee_usages,
mercenary_posts, mercenary_applications,
team_recruitment_posts, team_recruitment_applications,
matches, match_rosters, match_results, match_events, match_disputes,
attendance_polls, attendance_votes,
referee_availability, referee_assignments, referee_payment_records, referee_ratings,
mvp_votes, match_cards,
audit_logs, notifications

## 3차 (Phase 6~7)
leagues, league_tiers, team_league_tiers, league_seasons,
league_standings, league_season_history,
promotion_playoffs, tournaments, tournament_brackets,
tournament_team_registrations, tournament_tickets

## 4차 (Phase 8~9)
facilities, facility_courts, facility_schedules, facility_bookings, facility_revenues,
payment_intents, payment_items, wallet_accounts, wallet_transactions,
shop_products, shop_orders, shop_order_items,
posts, shorts, post_likes, post_comments, follows, user_blocks,
player_season_stats

---

# End of Document — v3.0
