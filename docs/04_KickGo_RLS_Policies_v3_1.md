# KickGo VN — RLS Policies Specification

문서 버전: 3.1
작성일: 2026-03-20
변경 이력: v3.0 기반. platform_settings, currency_formats, player_team_history, user_consents, reports RLS 추가.

---

# 1. 기본 원칙

모든 테이블 RLS 활성화 필수.
- 인증 사용자만 접근
- 본인 데이터는 본인만 수정
- visibility 컬럼이 있는 테이블은 공개 범위 정책 적용
- Write는 Edge Functions (service_role) 경유
- skill_tier / reputation_score 클라이언트 수정 불가
- 결제 상태 변경 클라이언트 불가
- finalized 경기 결과 수정 불가

---

# 2. profiles

```sql
-- SELECT: visibility 기반
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (
  auth.uid() = id  -- 본인은 항상
  OR visibility = 'public'
  OR (visibility = 'members_only' AND auth.uid() IS NOT NULL)
);
-- INSERT: 본인만
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
-- UPDATE: 본인만 (avatar_url은 Edge Function 경유)
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);
```

---

# 3. account_types / player_profiles / referee_profiles

```sql
-- account_types: 본인만
CREATE POLICY "account_types_select" ON account_types FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "account_types_insert" ON account_types FOR INSERT
  WITH CHECK (auth.uid() = user_id AND type IN ('player','referee','facility_manager'));

-- player_profiles: player 역할 보유 시 생성
CREATE POLICY "player_profiles_select" ON player_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "player_profiles_insert" ON player_profiles FOR INSERT WITH CHECK (
  auth.uid() = user_id AND EXISTS(SELECT 1 FROM account_types WHERE user_id=auth.uid() AND type='player')
);
CREATE POLICY "player_profiles_update" ON player_profiles FOR UPDATE USING (auth.uid() = user_id);
-- skill_tier, reputation_score: service_role에서만 업데이트

-- referee_profiles: referee 역할 보유 시 생성
CREATE POLICY "referee_profiles_select" ON referee_profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);  -- 심판 목록은 공개 (평점 조회용)
CREATE POLICY "referee_profiles_insert" ON referee_profiles FOR INSERT WITH CHECK (
  auth.uid() = user_id AND EXISTS(SELECT 1 FROM account_types WHERE user_id=auth.uid() AND type='referee')
);
```

---

# 4. user_blocks / user_admin_roles

```sql
-- user_blocks: 본인이 차단한 목록
CREATE POLICY "user_blocks_select" ON user_blocks FOR SELECT USING (auth.uid() = blocker_id);
CREATE POLICY "user_blocks_insert" ON user_blocks FOR INSERT
  WITH CHECK (auth.uid() = blocker_id AND auth.uid() != blocked_id);

-- user_admin_roles: super_admin만 부여, 본인 역할 조회
CREATE POLICY "admin_roles_select" ON user_admin_roles FOR SELECT USING (auth.uid() = user_id);
-- INSERT/DELETE: service_role 전용
```

---

# 5. teams / team_members / team_invites / team_announcements

```sql
-- teams: visibility 기반
CREATE POLICY "teams_select" ON teams FOR SELECT USING (
  visibility = 'public'
  OR (visibility = 'members_only' AND auth.uid() IS NOT NULL)
  OR EXISTS(SELECT 1 FROM team_members WHERE team_id=teams.id AND user_id=auth.uid() AND status='active')
);
CREATE POLICY "teams_insert" ON teams FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "teams_update" ON teams FOR UPDATE USING (
  EXISTS(SELECT 1 FROM team_members WHERE team_id=teams.id AND user_id=auth.uid() AND role IN ('owner','manager') AND status='active')
);

-- team_members: 팀 멤버만 조회
CREATE POLICY "team_members_select" ON team_members FOR SELECT USING (
  EXISTS(SELECT 1 FROM team_members tm WHERE tm.team_id=team_members.team_id AND tm.user_id=auth.uid() AND tm.status='active')
);

-- team_announcements: 팀 멤버 조회, 관리자 작성
CREATE POLICY "team_announcements_select" ON team_announcements FOR SELECT USING (
  EXISTS(SELECT 1 FROM team_members WHERE team_id=team_announcements.team_id AND user_id=auth.uid() AND status='active')
);
CREATE POLICY "team_announcements_insert" ON team_announcements FOR INSERT WITH CHECK (
  EXISTS(SELECT 1 FROM team_members WHERE team_id=team_announcements.team_id AND user_id=auth.uid() AND role IN ('owner','manager') AND status='active')
);
```

---

# 6. team_fee_records / team_fee_usages

```sql
-- 팀 멤버만 조회, 관리자만 기록
CREATE POLICY "team_fee_records_select" ON team_fee_records FOR SELECT USING (
  EXISTS(SELECT 1 FROM team_members WHERE team_id=team_fee_records.team_id AND user_id=auth.uid() AND status='active')
);
CREATE POLICY "team_fee_records_insert" ON team_fee_records FOR INSERT WITH CHECK (
  EXISTS(SELECT 1 FROM team_members WHERE team_id=team_fee_records.team_id AND user_id=auth.uid() AND role IN ('owner','manager') AND status='active')
);
-- team_fee_usages: 동일
```

---

# 7. mercenary_posts / team_recruitment_posts

```sql
-- 공개 조회 (지역 기반 검색)
CREATE POLICY "mercenary_posts_select" ON mercenary_posts FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "mercenary_posts_insert" ON mercenary_posts FOR INSERT WITH CHECK (
  EXISTS(SELECT 1 FROM team_members WHERE team_id=mercenary_posts.team_id AND user_id=auth.uid() AND role IN ('owner','manager') AND status='active')
);

CREATE POLICY "team_recruitment_posts_select" ON team_recruitment_posts FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "team_recruitment_posts_insert" ON team_recruitment_posts FOR INSERT WITH CHECK (auth.uid() = author_id);

-- applications: 본인 또는 모집자만
CREATE POLICY "mercenary_applications_select" ON mercenary_applications FOR SELECT USING (
  auth.uid() = applicant_id
  OR EXISTS(SELECT 1 FROM mercenary_posts p JOIN team_members tm ON tm.team_id=p.team_id WHERE p.id=mercenary_applications.post_id AND tm.user_id=auth.uid() AND tm.role IN ('owner','manager'))
);
CREATE POLICY "mercenary_applications_insert" ON mercenary_applications FOR INSERT WITH CHECK (auth.uid() = applicant_id);
```

---

# 8. matches / match_results / match_events / match_disputes / match_rosters

```sql
-- matches: 관련 팀 멤버 조회
CREATE POLICY "matches_select" ON matches FOR SELECT USING (
  EXISTS(SELECT 1 FROM team_members WHERE user_id=auth.uid() AND status='active'
    AND (team_id=matches.home_team_id OR team_id=matches.away_team_id))
  OR (matches.sport_type='soccer' AND matches.referee_user_id=auth.uid())
);
CREATE POLICY "matches_insert" ON matches FOR INSERT WITH CHECK (
  EXISTS(SELECT 1 FROM team_members WHERE team_id=matches.home_team_id AND user_id=auth.uid() AND role IN ('owner','manager') AND status='active')
);

-- match_results: 조회 허용, UPDATE는 service_role만
CREATE POLICY "match_results_select" ON match_results FOR SELECT USING (
  EXISTS(SELECT 1 FROM matches m JOIN team_members tm ON tm.team_id IN (m.home_team_id,m.away_team_id)
    WHERE m.id=match_results.match_id AND tm.user_id=auth.uid() AND tm.status='active')
);
CREATE POLICY "match_results_insert" ON match_results FOR INSERT WITH CHECK (
  EXISTS(SELECT 1 FROM matches WHERE id=match_results.match_id AND referee_user_id=auth.uid())
  AND EXISTS(SELECT 1 FROM referee_profiles WHERE user_id=auth.uid())
);
CREATE POLICY "match_results_update" ON match_results FOR UPDATE USING (false);

-- match_rosters: 팀 멤버 또는 심판 조회, 관리자 제출
CREATE POLICY "match_rosters_select" ON match_rosters FOR SELECT USING (
  EXISTS(SELECT 1 FROM matches m JOIN team_members tm ON tm.team_id IN (m.home_team_id,m.away_team_id)
    WHERE m.id=match_rosters.match_id AND tm.user_id=auth.uid())
  OR EXISTS(SELECT 1 FROM matches WHERE id=match_rosters.match_id AND referee_user_id=auth.uid())
);
CREATE POLICY "match_rosters_insert" ON match_rosters FOR INSERT WITH CHECK (
  EXISTS(SELECT 1 FROM matches m JOIN team_members tm ON tm.team_id=match_rosters.team_id
    WHERE m.id=match_rosters.match_id AND tm.user_id=auth.uid() AND tm.role IN ('owner','manager','captain') AND tm.status='active')
);

-- match_disputes: 경기 팀 주장/관리자만 생성
CREATE POLICY "match_disputes_insert" ON match_disputes FOR INSERT WITH CHECK (
  EXISTS(SELECT 1 FROM team_members tm JOIN matches m ON m.id=match_disputes.match_id
    WHERE tm.user_id=auth.uid() AND tm.role IN ('owner','manager') AND tm.team_id IN (m.home_team_id,m.away_team_id) AND tm.status='active')
);
```

---

# 9. attendance_polls / attendance_votes

```sql
CREATE POLICY "attendance_polls_select" ON attendance_polls FOR SELECT USING (
  EXISTS(SELECT 1 FROM matches m JOIN team_members tm ON tm.team_id IN (m.home_team_id,m.away_team_id)
    WHERE m.id=attendance_polls.match_id AND tm.user_id=auth.uid() AND tm.status='active')
);
CREATE POLICY "attendance_votes_select" ON attendance_votes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "attendance_votes_insert" ON attendance_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "attendance_votes_update" ON attendance_votes FOR UPDATE USING (auth.uid() = user_id);
```

---

# 10. 심판 비즈니스

```sql
-- referee_availability: 본인만
CREATE POLICY "referee_availability_select" ON referee_availability FOR SELECT USING (auth.uid() = referee_user_id);
CREATE POLICY "referee_availability_insert" ON referee_availability FOR INSERT WITH CHECK (
  auth.uid() = referee_user_id AND EXISTS(SELECT 1 FROM referee_profiles WHERE user_id=auth.uid())
);

-- referee_assignments: 심판 또는 요청자
CREATE POLICY "referee_assignments_select" ON referee_assignments FOR SELECT USING (
  auth.uid() = referee_user_id OR auth.uid() = requested_by
);
CREATE POLICY "referee_assignments_insert" ON referee_assignments FOR INSERT WITH CHECK (
  auth.uid() = requested_by
  AND EXISTS(SELECT 1 FROM matches WHERE id=referee_assignments.match_id AND sport_type='soccer')
);

-- referee_payment_records: 심판 본인
CREATE POLICY "referee_payment_records_select" ON referee_payment_records FOR SELECT USING (auth.uid() = referee_user_id);

-- referee_ratings: 공개 조회, 팀 관리자 등록
CREATE POLICY "referee_ratings_select" ON referee_ratings FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "referee_ratings_insert" ON referee_ratings FOR INSERT WITH CHECK (
  auth.uid() = rated_by
  AND EXISTS(SELECT 1 FROM team_members tm JOIN matches m ON m.id=referee_ratings.match_id
    WHERE tm.user_id=auth.uid() AND tm.team_id=referee_ratings.team_id AND tm.role IN ('owner','manager') AND tm.status='active'
    AND m.status IN ('finalized','auto_finalized') AND m.sport_type='soccer')
);
```

---

# 11. MVP / Match Cards

```sql
-- mvp_votes: 출전 선수 또는 심판
CREATE POLICY "mvp_votes_select" ON mvp_votes FOR SELECT USING (auth.uid() = voter_id);
CREATE POLICY "mvp_votes_insert" ON mvp_votes FOR INSERT WITH CHECK (
  auth.uid() = voter_id
  AND (
    EXISTS(SELECT 1 FROM match_rosters WHERE match_id=mvp_votes.match_id AND user_id=auth.uid())
    OR EXISTS(SELECT 1 FROM matches WHERE id=mvp_votes.match_id AND referee_user_id=auth.uid())
  )
);

-- match_cards: 인증 사용자 조회
CREATE POLICY "match_cards_select" ON match_cards FOR SELECT USING (auth.uid() IS NOT NULL);
```

---

# 12. 운동장

```sql
-- facilities: 활성 운동장 공개, 관리자는 본인 것
CREATE POLICY "facilities_select" ON facilities FOR SELECT USING (
  is_active = true OR manager_user_id = auth.uid()
);
CREATE POLICY "facilities_insert" ON facilities FOR INSERT WITH CHECK (
  auth.uid() = manager_user_id
  AND EXISTS(SELECT 1 FROM account_types WHERE user_id=auth.uid() AND type='facility_manager')
);

-- facility_courts: 활성 운동장 공개
CREATE POLICY "facility_courts_select" ON facility_courts FOR SELECT USING (
  EXISTS(SELECT 1 FROM facilities WHERE id=facility_courts.facility_id AND (is_active=true OR manager_user_id=auth.uid()))
);
CREATE POLICY "facility_courts_insert" ON facility_courts FOR INSERT WITH CHECK (
  EXISTS(SELECT 1 FROM facilities WHERE id=facility_courts.facility_id AND manager_user_id=auth.uid())
);

-- facility_bookings: 예약자 또는 관리자
CREATE POLICY "facility_bookings_select" ON facility_bookings FOR SELECT USING (
  auth.uid() = user_id
  OR EXISTS(SELECT 1 FROM facility_courts fc JOIN facilities f ON f.id=fc.facility_id
    WHERE fc.id=facility_bookings.court_id AND f.manager_user_id=auth.uid())
);
CREATE POLICY "facility_bookings_insert" ON facility_bookings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- facility_revenues: 관리자만
CREATE POLICY "facility_revenues_select" ON facility_revenues FOR SELECT USING (
  EXISTS(SELECT 1 FROM facilities WHERE id=facility_revenues.facility_id AND manager_user_id=auth.uid())
);
```

---

# 13. 소셜

```sql
-- posts: visibility 기반
CREATE POLICY "posts_select" ON posts FOR SELECT USING (
  auth.uid() = author_id
  OR visibility = 'public'
  OR (visibility = 'members_only' AND auth.uid() IS NOT NULL)
);
CREATE POLICY "posts_insert" ON posts FOR INSERT WITH CHECK (auth.uid() = author_id);

-- shorts: 같은 방식
CREATE POLICY "shorts_select" ON shorts FOR SELECT USING (
  status = 'ready' OR auth.uid() = author_id
);
CREATE POLICY "shorts_insert" ON shorts FOR INSERT WITH CHECK (auth.uid() = author_id);

-- follows: 본인 팔로우 관계
CREATE POLICY "follows_select" ON follows FOR SELECT USING (
  auth.uid() = follower_id OR auth.uid()::text = followee_id::text
);
CREATE POLICY "follows_insert" ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "follows_delete" ON follows FOR DELETE USING (auth.uid() = follower_id);

-- post_likes / post_comments: 인증 사용자
CREATE POLICY "post_likes_insert" ON post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "post_comments_select" ON post_comments FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "post_comments_insert" ON post_comments FOR INSERT WITH CHECK (auth.uid() = author_id);
```

---

# 14. 결제

```sql
-- wallet_accounts: 본인만, UPDATE 불가
CREATE POLICY "wallet_accounts_select" ON wallet_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "wallet_accounts_update" ON wallet_accounts FOR UPDATE USING (false);

-- payment_intents: 본인 조회/생성, UPDATE 불가
CREATE POLICY "payment_intents_select" ON payment_intents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "payment_intents_insert" ON payment_intents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "payment_intents_update" ON payment_intents FOR UPDATE USING (false);
```

---

# 15. 쇼핑몰

```sql
-- shop_products: 활성 상품 공개
CREATE POLICY "shop_products_select" ON shop_products FOR SELECT USING (
  is_active = true OR auth.uid() IS NOT NULL
);

-- shop_orders: 본인만
CREATE POLICY "shop_orders_select" ON shop_orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "shop_orders_insert" ON shop_orders FOR INSERT WITH CHECK (auth.uid() = user_id);
```

---

# 16. 리그/대회

```sql
-- league_standings / league_tiers: 인증 사용자 공개
CREATE POLICY "league_standings_select" ON league_standings FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "league_tiers_select" ON league_tiers FOR SELECT USING (auth.uid() IS NOT NULL);

-- team_league_tiers: 인증 사용자
CREATE POLICY "team_league_tiers_select" ON team_league_tiers FOR SELECT USING (auth.uid() IS NOT NULL);

-- tournaments: 공개
CREATE POLICY "tournaments_select" ON tournaments FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "tournaments_insert" ON tournaments FOR INSERT WITH CHECK (auth.uid() = creator_user_id);
```

---

# 17. 알림 / 감사 로그

```sql
-- notifications: 본인만
CREATE POLICY "notifications_select" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_update" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- audit_logs: service_role 전용
CREATE POLICY "audit_logs_select" ON audit_logs FOR SELECT USING (false);
CREATE POLICY "audit_logs_insert" ON audit_logs FOR INSERT WITH CHECK (false);
```

---

# 18. 보안 체크리스트

```sql
-- 전체 RLS 활성화 확인
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
```

핵심 확인 항목:
- [ ] profiles visibility 정책 동작
- [ ] player_profiles skill_tier/reputation_score 클라이언트 수정 불가
- [ ] match_results UPDATE = false
- [ ] payment_intents UPDATE = false
- [ ] wallet_accounts UPDATE = false
- [ ] audit_logs 클라이언트 접근 불가
- [ ] referee_ratings unique(match_id, team_id) 제약

추가 권장:
- service_role 키 클라이언트 노출 금지
- Storage avatars/{user_id}/* 경로별 업로드 정책 설정
- Storage shorts/{user_id}/* 경로별 업로드 정책 설정


---

# 19. platform_settings / currency_formats

```sql
-- platform_settings: 인증 사용자 조회, super_admin만 수정
CREATE POLICY "platform_settings_select" ON platform_settings FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "platform_settings_update" ON platform_settings FOR UPDATE USING (
  EXISTS(SELECT 1 FROM user_admin_roles WHERE user_id=auth.uid() AND role='super_admin')
);

-- currency_formats: 인증 사용자 조회, super_admin만 수정
CREATE POLICY "currency_formats_select" ON currency_formats FOR SELECT USING (auth.uid() IS NOT NULL);
```

---

# 20. player_team_history

```sql
-- 공개 조회 (선수 프로필 공개 시)
CREATE POLICY "player_team_history_select" ON player_team_history FOR SELECT USING (
  EXISTS(SELECT 1 FROM profiles WHERE id=player_team_history.user_id
    AND (visibility='public' OR (visibility='members_only' AND auth.uid() IS NOT NULL) OR id=auth.uid()))
);
-- INSERT: service_role 전용 (팀 합류/탈퇴 시 자동 기록)
```

---

# 21. user_consents

```sql
-- 본인만 조회
CREATE POLICY "user_consents_select" ON user_consents FOR SELECT USING (auth.uid() = user_id);
-- INSERT: 본인만 (회원가입/설정 변경 시)
CREATE POLICY "user_consents_insert" ON user_consents FOR INSERT WITH CHECK (auth.uid() = user_id);
-- UPDATE: service_role 전용 (upsert 처리)
```

---

# 22. reports

```sql
-- 신고자 본인 조회, support_admin 전체 조회
CREATE POLICY "reports_select" ON reports FOR SELECT USING (
  auth.uid() = reporter_id
  OR EXISTS(SELECT 1 FROM user_admin_roles WHERE user_id=auth.uid() AND role IN ('support_admin','super_admin'))
);
-- INSERT: 인증 사용자 (본인 신고 불가는 서버에서 검증)
CREATE POLICY "reports_insert" ON reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
-- UPDATE: support_admin만 (처리 상태 변경)
CREATE POLICY "reports_update" ON reports FOR UPDATE USING (
  EXISTS(SELECT 1 FROM user_admin_roles WHERE user_id=auth.uid() AND role IN ('support_admin','super_admin','ops_admin'))
);
```

---

# End of Document — v3.1

