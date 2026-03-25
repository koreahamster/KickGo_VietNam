# KickGo VN — API Specification

문서 버전: 3.1
작성일: 2026-03-20
변경 이력: v3.0 기반. Zalo 로그인, 수수료 설정 API, 금액 포맷 API, 선수 이력 API, 경기 공유 API, 신고 API, 동의 API 추가.

---

# 1. API 구조 원칙

| 방식 | 용도 |
|---|---|
| Supabase REST | Read (데이터 조회) |
| Edge Functions | Write (비즈니스 로직) |

인증: `Authorization: Bearer {access_token}` (모든 API 필수)

표준 응답:
```json
{ "success": true, "data": {}, "error": null }
{ "success": false, "data": null, "error": { "code": "ERROR_CODE", "message": "..." } }
```

---

# 2. Auth API

Supabase Auth 사용 (별도 Edge Function 없음)
지원: Google / Apple / Facebook / **Zalo** / 휴대폰 OTP / Email(개발용)

---

# 3. Profile API

## create-profile
`POST /functions/v1/create-profile`
```json
{
  "display_name": "Seongho",
  "birth_year": 1993,
  "country_code": "VN", "province_code": "HCM", "district_code": "HCM-D7",
  "preferred_language": "ko",
  "bio": "Weekly football player",
  "initial_account_type": "player",
  "visibility": "members_only"
}
```

## update-profile
`POST /functions/v1/update-profile`
```json
{ "display_name": "...", "bio": "...", "province_code": "...", "visibility": "public" }
```

## upload-avatar
`POST /functions/v1/upload-avatar`
Storage 경로: `avatars/{user_id}/profile.jpg`, 최대 5MB, jpeg/png/webp

## add-account-type
`POST /functions/v1/add-account-type`
```json
{ "type": "referee" }
```

## create-player-profile
`POST /functions/v1/create-player-profile`
```json
{ "preferred_position": "CM", "dominant_foot": "right", "top_size": "L", "shoe_size": "270" }
```
> skill_tier, reputation_score 클라이언트 입력 불가

## create-referee-profile
`POST /functions/v1/create-referee-profile`
```json
{}
```

## update-profile-visibility
`POST /functions/v1/update-profile-visibility`
```json
{ "visibility": "public" }
```

## 조회
`GET /rest/v1/profiles?id=eq.{user_id}`
`GET /rest/v1/player_profiles?user_id=eq.{user_id}`

---

# 4. Team API

## create-team
`POST /functions/v1/create-team`
```json
{ "name": "Hue United", "province_code": "HUE", "district_code": "HUE-TP", "description": "..." }
```

## kick-team-member
`POST /functions/v1/kick-team-member`
```json
{ "team_id": "uuid", "target_user_id": "uuid", "reason": "..." }
```
Rules: owner만 호출 가능, audit_log 기록

## create-team-invite / join-team / generate-zalo-invite
(v2.1과 동일)

## 팀 공지
`POST /functions/v1/create-team-announcement`
```json
{ "team_id": "uuid", "title": "...", "body": "..." }
```
`GET /rest/v1/team_announcements?team_id=eq.{team_id}`

## 팀 공개범위 설정
`POST /functions/v1/update-team-visibility`
```json
{ "team_id": "uuid", "visibility": "public" }
```

## 팀 회비
`POST /functions/v1/record-team-fee-payment`
```json
{ "team_id": "uuid", "user_id": "uuid", "year_month": "2026-03", "amount": 100000 }
```
`POST /functions/v1/record-team-fee-usage`
```json
{ "team_id": "uuid", "amount": 50000, "description": "경기장 대여비", "used_at": "2026-03-15" }
```
`GET /rest/v1/team_fee_records?team_id=eq.{team_id}`
`GET /rest/v1/team_fee_usages?team_id=eq.{team_id}`

---

# 5. 용병 / 팀 모집 API

## 용병 모집 공고
`POST /functions/v1/create-mercenary-post`
```json
{ "team_id": "uuid", "match_id": "uuid", "needed_positions": ["FW"], "needed_count": 2, "province_code": "HUE" }
```

## 용병 지원
`POST /functions/v1/apply-mercenary`
```json
{ "post_id": "uuid", "message": "I can play FW" }
```

## 용병 수락/거부
`POST /functions/v1/respond-mercenary-application`
```json
{ "application_id": "uuid", "decision": "accept" }
```

## 팀 모집 공고
`POST /functions/v1/create-team-recruitment`
```json
{ "post_type": "team_seeks_player", "team_id": "uuid", "positions": ["MF"], "province_code": "HUE" }
```

## 팀 모집 지원
`POST /functions/v1/apply-team-recruitment`
```json
{ "post_id": "uuid", "message": "..." }
```

## 조회
`GET /rest/v1/mercenary_posts?province_code=eq.{code}&status=eq.open`
`GET /rest/v1/team_recruitment_posts?province_code=eq.{code}&status=eq.open`

---

# 6. Match API

## create-match
`POST /functions/v1/create-match`
```json
{
  "home_team_id": "uuid", "away_team_id": "uuid",
  "scheduled_at": "2026-03-22T19:00:00Z",
  "venue_name": "Hue Football Center",
  "sport_type": "soccer",
  "match_type": "league",
  "tier_id": "uuid"
}
```

## submit-match-roster (팀 관리자)
`POST /functions/v1/submit-match-roster`
```json
{
  "match_id": "uuid", "team_id": "uuid",
  "players": [
    { "user_id": "uuid", "squad_number": 7, "position": "FW", "is_mercenary": false }
  ]
}
```

## confirm-match-roster (심판)
`POST /functions/v1/confirm-match-roster`
```json
{ "match_id": "uuid" }
```
> matches.status = ongoing으로 전환

## 경기 목록 (캘린더 데이터)
`GET /rest/v1/matches?home_team_id=eq.{id}&scheduled_at=gte.{start}&scheduled_at=lte.{end}`
> 참석 인원은 attendance_votes 집계로 별도 조회

## 경기 상세
`GET /rest/v1/matches?id=eq.{match_id}`

---

# 7. Attendance API

`GET /rest/v1/attendance_polls?match_id=eq.{match_id}`
`POST /functions/v1/vote-attendance`
```json
{ "poll_id": "uuid", "response": "yes" }
```

---

# 8. Match Result API

## submit-match-result (심판)
`POST /functions/v1/submit-match-result`
```json
{
  "match_id": "uuid",
  "home_score": 3, "away_score": 1,
  "events": [
    { "player_id": "uuid", "event_type": "goal", "minute": 15 },
    { "player_id": "uuid", "event_type": "yellow_card", "minute": 34 }
  ]
}
```

## confirm-match-result (팀 manager/owner)
`POST /functions/v1/confirm-match-result`
```json
{ "match_id": "uuid", "decision": "accept" }
```
decision: `accept` | `reject`

## open-match-dispute
`POST /functions/v1/open-match-dispute`
```json
{ "match_id": "uuid", "reason": "Incorrect scoreline" }
```

## resolve-dispute (ops_admin)
`POST /functions/v1/resolve-dispute`
```json
{ "dispute_id": "uuid", "resolution": "accepted" }
```

---

# 9. Referee Business API

## register-referee-availability
`POST /functions/v1/register-referee-availability`
```json
{ "available_date": "2026-04-01", "start_time": "18:00", "end_time": "22:00" }
```

## 가용 심판 목록 조회
`GET /functions/v1/available-referees?date={date}&start_time={time}&province_code={code}`

## request-referee-assignment
`POST /functions/v1/request-referee-assignment`
```json
{ "match_id": "uuid", "referee_user_id": "uuid", "fee_amount": 200000 }
```

## respond-referee-assignment
`POST /functions/v1/respond-referee-assignment`
```json
{ "assignment_id": "uuid", "decision": "accept" }
```

## record-referee-payment
`POST /functions/v1/record-referee-payment`
```json
{ "assignment_id": "uuid", "fee_amount": 200000, "note": "Paid via bank transfer" }
```

## rate-referee
`POST /functions/v1/rate-referee`
```json
{
  "match_id": "uuid",
  "score_fairness": 4, "score_accuracy": 5, "score_attitude": 4, "overall_score": 4,
  "comment": "Fair decisions"
}
```
Rules: finalized/auto_finalized 후 team 관리자만, 팀당 1회

---

# 10. MVP & Match Card API

## create-mvp-vote (출전 선수 또는 심판)
`POST /functions/v1/create-mvp-vote`
```json
{
  "match_id": "uuid",
  "voted_fw_id": "uuid",
  "voted_mf_id": "uuid",
  "voted_df_id": "uuid"
}
```
Rules: 출전 선수 1인 1표 (본인 제외), 심판 추가 1표

## 경기 카드 조회
`GET /rest/v1/match_cards?match_id=eq.{match_id}`

---

# 11. League / Tier API

## setup-league-tiers (ops_admin)
`POST /functions/v1/setup-league-tiers`
```json
{
  "league_id": "uuid",
  "tiers": [
    { "tier_level": 5, "tier_name": "Bronze", "promotion_slots": 2 },
    { "tier_level": 4, "tier_name": "Silver", "promotion_slots": 2 },
    { "tier_level": 3, "tier_name": "Gold", "promotion_slots": 2 },
    { "tier_level": 2, "tier_name": "Platinum", "promotion_slots": 2 },
    { "tier_level": 1, "tier_name": "Diamond" }
  ]
}
```

## assign-team-tier
`POST /functions/v1/assign-team-tier`
```json
{ "team_id": "uuid", "league_id": "uuid", "tier_level": 5 }
```
신규 팀은 브론즈(5) 자동 배정

## 지역 통계 (티어별 순위)
`GET /rest/v1/league_standings?season_id=eq.{id}&tier_id=eq.{id}&order=rank.asc`

## start-promotion-playoff
`POST /functions/v1/start-promotion-playoff`
```json
{ "season_id": "uuid" }
```

---

# 12. Tournament API

## create-tournament
`POST /functions/v1/create-tournament`
```json
{ "name": "Hue Summer Cup 2026", "province_code": "HUE", "max_teams": 4 }
```
Rules: max_teams > 4는 개최권 필요

## activate-tournament-ticket
`POST /functions/v1/activate-tournament-ticket`
```json
{ "tournament_id": "uuid", "ticket_id": "uuid" }
```

## register-tournament-team
`POST /functions/v1/register-tournament-team`
```json
{ "tournament_id": "uuid", "team_id": "uuid" }
```

## generate-tournament-brackets
`POST /functions/v1/generate-tournament-brackets`
```json
{ "tournament_id": "uuid" }
```

---

# 13. Facility API

## create-facility
`POST /functions/v1/create-facility`
```json
{
  "name": "Hue Football Center", "sport_types": ["soccer", "futsal"],
  "province_code": "HUE", "district_code": "HUE-TP", "address": "123 Le Loi"
}
```

## create-facility-court
`POST /functions/v1/create-facility-court`
```json
{ "facility_id": "uuid", "name": "A구장", "sport_type": "soccer", "price_per_hour": 300000 }
```

## set-facility-schedule
`POST /functions/v1/set-facility-schedule`
```json
{ "court_id": "uuid", "day_of_week": 1, "open_time": "07:00", "close_time": "22:00" }
```

## 가용 슬롯 조회
`GET /functions/v1/available-slots?facility_id={id}&date={date}&sport_type={type}`

## create-facility-booking (선결제 포함)
`POST /functions/v1/create-facility-booking`
```json
{ "court_id": "uuid", "start_time": "2026-04-01T18:00:00Z", "end_time": "2026-04-01T19:00:00Z" }
```
Response: `{ "booking_id": "...", "total_price": 300000, "payment_intent_id": "..." }`

---

# 14. Social API

## 쇼츠 업로드
`POST /functions/v1/upload-shorts`
```json
{ "duration_seconds": 45, "hashtags": ["dribling", "skills"] }
```
Response: `{ "upload_url": "...", "shorts_id": "..." }`

## 게시글 작성
`POST /functions/v1/create-post`
```json
{ "content": "...", "media_urls": [], "hashtags": [], "visibility": "public" }
```

## 좋아요
`POST /functions/v1/toggle-like`
```json
{ "post_id": "uuid", "post_type": "shorts" }
```

## 팔로우
`POST /functions/v1/toggle-follow`
```json
{ "followee_id": "uuid", "followee_type": "user" }
```

## 차단
`POST /functions/v1/block-user`
```json
{ "blocked_id": "uuid" }
```

## 피드
`GET /functions/v1/feed?cursor={cursor}&limit=20`

---

# 15. Payment API

## create-payment-intent
`POST /functions/v1/create-payment-intent`
```json
{
  "amount": 300000, "currency": "VND", "provider": "momo",
  "items": [{ "item_type": "facility_booking", "item_id": "uuid", "amount": 300000 }]
}
```

## Webhook (서버 전용)
`POST /webhook/payment`

---

# 16. Shop API

`GET /rest/v1/shop_products?is_active=eq.true`
`GET /rest/v1/shop_products?id=eq.{id}`

## create-shop-order
`POST /functions/v1/create-shop-order`
```json
{
  "items": [{ "product_id": "uuid", "quantity": 1, "custom_options": { "size": "L", "number": 7, "name": "Seongho" } }],
  "shipping_address": "..."
}
```

`GET /rest/v1/shop_orders?user_id=eq.{user_id}`

---

# 17. Search API

`GET /functions/v1/search?q={query}&type={team|player|facility}&province_code={code}`

---

# 18. Notification API

`GET /rest/v1/notifications?user_id=eq.{user_id}&order=created_at.desc`
`POST /functions/v1/read-notification`
```json
{ "notification_id": "uuid" }
```


---

# 18-A. Platform Settings API (super_admin 전용)

## 수수료율 조회
`GET /rest/v1/platform_settings`

## 수수료율 변경 (super_admin만)
`POST /functions/v1/update-platform-setting`
```json
{ "key": "facility_commission_rate", "value": "5" }
```
Rules: user_admin_roles.role = super_admin만 호출 가능, 변경 이력 audit_log 기록

## 통화 포맷 조회
`GET /rest/v1/currency_formats?country_code=eq.VN`

---

# 18-B. 선수 이력 API

## 소속팀 이력 조회
`GET /rest/v1/player_team_history?user_id=eq.{user_id}&order=season_year.desc`

Response:
```json
{
  "data": [
    { "season_year": 2026, "team_id": "uuid", "team_name": "Hue United", "role": "player", "start_date": "2026-01-01", "end_date": null }
  ]
}
```

## 시즌별 기록 조회
`GET /rest/v1/player_season_stats?user_id=eq.{user_id}&order=season_year.desc`

Response:
```json
{
  "data": [
    {
      "season_year": 2026, "matches_played": 12, "goals": 5,
      "assists": 3, "yellow_cards": 1, "red_cards": 0,
      "mvp_fw_count": 2, "mvp_mf_count": 0, "mvp_df_count": 0
    }
  ]
}
```

---

# 18-C. 경기 일정 공유 API

## 경기 공유 링크 생성
`GET /functions/v1/match-share-link?match_id={id}`

Response:
```json
{
  "success": true,
  "data": {
    "share_url": "https://kickgo.vn/match/{match_id}",
    "zalo_share_url": "zalo://share?text=...",
    "kakao_share_url": "kakaolink://...",
    "plain_text": "3월 22일 Hue United vs Da Nang FC | 19:00 | Hue Football Center"
  }
}
```
클라이언트에서 React Native Share API로 처리

---

# 18-D. 신고 API

## 신고 접수
`POST /functions/v1/submit-report`
```json
{
  "target_type": "user",
  "target_id": "uuid",
  "report_type": "abuse",
  "description": "욕설 사용"
}
```
report_type 허용값: `noshow / abuse / violence / false_report / spam / inappropriate`

## 내 신고 내역
`GET /rest/v1/reports?reporter_id=eq.{user_id}`

---

# 18-E. 개인정보 동의 API

## 동의 등록 (회원가입 시)
`POST /functions/v1/record-consent`
```json
{
  "consent_type": "privacy_policy",
  "is_agreed": true,
  "policy_version": "v1.0"
}
```

## 마케팅 동의 변경
`POST /functions/v1/record-consent`
```json
{ "consent_type": "marketing", "is_agreed": false, "policy_version": "v1.0" }
```

## 계정 삭제 요청
`POST /functions/v1/request-account-deletion`
```json
{ "reason": "더 이상 사용하지 않음" }
```
처리: 개인 식별 정보 삭제, 경기 기록은 익명화 보존, support_admin 최종 처리

---

---

# 19. 에러 코드

| 코드 | 설명 |
|---|---|
| PROFILE_NOT_FOUND / PROFILE_ALREADY_EXISTS | 프로필 |
| TEAM_NOT_FOUND / NOT_TEAM_MEMBER / NOT_OWNER / NOT_MANAGER | 팀 |
| MATCH_NOT_FOUND / MATCH_ALREADY_FINALIZED / SPORT_TYPE_MISMATCH | 경기 |
| NOT_REFEREE / REFEREE_PROFILE_REQUIRED / REFEREE_ALREADY_ASSIGNED | 심판 |
| SLOT_NOT_AVAILABLE / FACILITY_NOT_ACTIVE / BOOKING_NOT_FOUND | 운동장 |
| PAYMENT_FAILED / PAYMENT_REQUIRED | 결제 |
| VOTE_ALREADY_SUBMITTED / VOTING_CLOSED | MVP 투표 |
| MERCENARY_POST_CLOSED / ALREADY_APPLIED | 용병 |
| INVALID_REGION_CODE / INVALID_LANGUAGE | 지역/언어 |
| UPLOAD_FAILED / FILE_TOO_LARGE | 업로드 |
| SELF_BLOCK_NOT_ALLOWED | 차단 |
| REPORT_ALREADY_SUBMITTED | 동일 대상 중복 신고 |
| CONSENT_REQUIRED | 필수 동의 누락 |
| SETTING_KEY_NOT_FOUND | 설정 키 없음 |
| UNAUTHORIZED_ADMIN | 관리자 권한 없음 |

---

# 20. Rate Limit

| API | 제한 |
|---|---|
| 로그인 | 10/min |
| 경기 생성 | 20/min |
| 출석 응답 | 100/min |
| 결제 요청 | 5/min |
| 이미지 업로드 | 10/min |
| 영상 업로드 | 3/min |
| 검색 | 60/min |

---

# End of Document — v3.0
