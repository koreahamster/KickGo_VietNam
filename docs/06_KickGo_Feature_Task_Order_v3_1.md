# KickGo VN — Feature Development Task Order

문서 버전: 3.1
작성일: 2026-03-20
변경 이력: v3.0 기반. 선수 이력, 수수료 설정, 금액 포맷, 동의 관리, 신고, Zalo 로그인, 경기 일정 공유 추가.

---

# 1. 전체 개발 단계

| Phase | 내용 | 예상 기간 |
|---|---|---|
| 0 | 문서 확정 | 완료 |
| 1 | 프로젝트 초기 세팅 | 완료 |
| 2 | 인증 및 사용자 시스템 | 진행 중 (~70%) |
| 3 | 팀 시스템 + 용병/모집 | 미착수 |
| 4 | 경기 생성 / 출석 / 명단 / 심판 배정 | 미착수 |
| 5 | 경기 결과 확정 / MVP / 카드 | 미착수 |
| 6 | 리그 티어제 / 승급전 / 지역 통계 | 미착수 |
| 7 | 대회 시스템 | 미착수 |
| 8 | 알림 / 자동화 | 미착수 |
| 9 | 운동장 예약 / 결제 | 미착수 |
| 10 | 소셜 / 쇼츠 / 피드 | 미착수 |
| 11 | 쇼핑몰 | 미착수 |
| 12 | QA 및 배포 | 미착수 |

---

# 2. Phase 2 — 인증 및 사용자 🔄 진행 중

완료:
- 이메일/구글 로그인 (임시)
- 온보딩 화면 구조
- create-profile Edge Function (일부)
- 베트남 지역 데이터

미완료:
- [ ] create-profile 실서버 최종 검증
- [ ] **Zalo 소셜 로그인 연동**
- [ ] **회원가입 시 개인정보처리방침 동의 (user_consents)**
- [ ] 프로필 사진 업로드 (upload-avatar)
- [ ] 프로필 수정 화면
- [ ] **프로필 공개범위 설정 (visibility)**
- [ ] 전화번호 OTP 인증
- [ ] 온보딩 루프 안정화 실기기 검증

완료 조건:
- login → phone-verify → create-profile → role-onboarding → home → settings 전체 흐름

---

# 3. Phase 3 — 팀 시스템

예상 기간: 6~9일

기능:
- 팀 생성/수정 + 공개범위 설정
- 초대 코드 / Zalo 딥링크
- 팀 멤버 조회
- **팀원 강퇴 (kick) — owner만, audit_log 기록**
- 팀 공지사항 작성/조회
- **팀 회비 관리 (납입 기록 / 사용 내역)**
- **용병 모집 공고 등록/조회/수락**
- **팀 모집 공고 (팀 구하기 / 선수 구하기)**

테이블: teams, team_members, team_invites, team_announcements, team_fee_records, team_fee_usages, mercenary_posts, mercenary_applications, team_recruitment_posts, team_recruitment_applications

완료 조건:
- [ ] 팀 생성 및 공개범위 설정
- [ ] 강퇴 기능 동작 및 audit_log 기록
- [ ] 팀 공지사항 작성/조회
- [ ] 회비 납입/사용 기록 등록
- [ ] 용병 모집 공고 등록 및 지원/수락 흐름

---

# 4. Phase 4 — 경기 생성 / 출석 / 명단 / 심판

예상 기간: 7~10일

기능:
- **경기 생성 (sport_type=soccer, match_type 포함)**
- **캘린더형 경기 목록 (날짜/상대팀/참석인원 표기)**
- 경기 장소 Google Maps 연동
- **경기 일정 외부 공유** (Zalo/카카오/링크)
- 출석 투표 생성/응답
- **심판 가용시간 등록 및 배정 요청/수락**
- **경기 시작 전 명단 제출 (match_rosters)**
- **심판의 명단 확인 및 경기 시작 승인**

테이블: matches, attendance_polls, attendance_votes, match_rosters, referee_availability, referee_assignments

완료 조건:
- [ ] 경기 생성 (sport_type 포함)
- [ ] 캘린더 UI + 참석 인원 표기
- [ ] 가용 심판 조회 → 배정 요청 → 수락
- [ ] 명단 제출 → 심판 확인 → ongoing

---

# 5. Phase 5 — 경기 결과 확정 / MVP / 카드

예상 기간: 8~12일 (MVP 핵심)

기능:
- 심판 이벤트 기록 (골/어시/경고/퇴장)
- 심판 결과 업로드
- 팀 관리자 수락/거부
- 이의 제기 24시간 협의
- **24시간 후 심판 결정 자동 반영**
- **노쇼 판정 및 패널티 자동 처리**
- 자동 결과 확정 배치
- skill_tier 포인트 반영
- reputation_score 반영
- **심판 일당 기록 생성**
- **심판 평점 등록**
- **MVP 투표 (출전 선수 + 심판 1표)**
- **경기 기록 카드 자동 생성**
- **SNS 공유**

테이블: match_results, match_events, match_disputes, referee_payment_records, referee_ratings, mvp_votes, match_cards, player_season_stats, player_team_history

완료 조건:
- [ ] 심판 결과 업로드
- [ ] 수락/거부/24시간 자동확정
- [ ] 노쇼 패널티 자동 처리
- [ ] MVP 투표창 동작
- [ ] 경기 기록 카드 생성 및 공유

---

# 6. Phase 6 — 리그 티어제 / 승급전 / 지역 통계

예상 기간: 7~10일

기능:
- 리그 생성 + 5단계 티어 설정
- 신규 팀 브론즈 자동 배정
- 티어 포인트 계산 (승리/패배/무승부)
- 100점 → 승급전 자동 진입
- **승급전 5판 3승제 자동 매칭**
- league_standings 자동 재계산
- **지역 통계 화면 (지역 선택 + 티어별 순위)**
- 지역별 팀/선수 기록 리스트
- 시즌 종료 후 스냅샷

테이블: leagues, league_tiers, team_league_tiers, league_seasons, league_standings, league_season_history, promotion_playoffs

완료 조건:
- [ ] 5단계 티어 구조 설정
- [ ] 브론즈 자동 시작
- [ ] 티어전 포인트 자동 계산
- [ ] 100점 달성 → 승급전 5판 3승제
- [ ] 지역 통계 화면 동작

---

# 7. Phase 7 — 대회 시스템

예상 기간: 5~7일

기능:
- 대회 개설 (4팀 기본)
- 팀 참가 등록
- 대진표 수동/자동 생성
- **개최권 연결 후 고급 기능 활성화 (8/16팀)**
- 라운드별 경기 생성 및 결과 연결
- 우승/준우승 기록

테이블: tournaments, tournament_team_registrations, tournament_brackets, tournament_tickets

---

# 8. Phase 8 — 알림 / 자동화

예상 기간: 5~7일

기능:
- FCM 푸시 알림 전체 연결
- 출석 리마인드 배치 (72h/24h/6h)
- 자동 결과 확정 배치 (24h)
- 노쇼 자동 감지 배치
- 승급전 자동 진입 감지
- 알림 종류별 on/off 설정

테이블: notifications, user_devices

---

# 9. Phase 9 — 운동장 예약 / 결제

예상 기간: 7~10일

기능:
- 운동장 등록 (관리자) + ops_admin 승인
- 구장 등록 및 운영 시간 설정
- **운동장 검색 (지역/종목/날짜)**
- **1시간 단위 슬롯 조회 및 선결제 예약**
- 예약 취소/환불 정책 적용
- 수익 정산 기록
- MoMo / ZaloPay Webhook 연동

테이블: facilities, facility_courts, facility_schedules, facility_bookings, facility_revenues, payment_intents, payment_items, wallet_accounts, wallet_transactions

---

# 10. Phase 10 — 소셜 / 쇼츠 / 피드

예상 기간: 8~12일

기능:
- **쇼츠 업로드 (최대 60초/1GB)**
- **피드 (팔로우 기반 + 인기 탐색)**
- 게시글 작성 (텍스트+이미지)
- 좋아요/댓글/공유
- 팔로우/팔로워
- **차단(block) 기능**
- 해시태그 검색
- 신고 기능
- 경기 기록 카드 피드 노출

테이블: posts, shorts, post_likes, post_comments, follows, user_blocks

---

# 11. Phase 11 — 쇼핑몰

예상 기간: 6~9일

기능:
- 상품 목록/상세 (앱)
- 장바구니/주문/결제
- **유니폼/엠블럼 제작 주문 (커스텀 폼)**
- 개최권 구매
- 주문 내역 및 상태 조회
- content_admin 주문 처리 (웹 CMS)

테이블: shop_products, shop_orders, shop_order_items

---

# 12. Phase 12 — QA 및 배포

예상 기간: 5~7일

핵심 플로우 검증:
- [ ] login → profile → team → match → result → tier
- [ ] 심판 배정 → 명단 확인 → 결과 → MVP → 카드
- [ ] 운동장 예약 → 결제 → 노쇼 패널티
- [ ] 승급전 5판 3승 흐름
- [ ] SNS 카드 공유
- [ ] 쇼핑몰 주문/결제

---

# 13. MVP 핵심 기능

반드시 포함:
- 인증 (소셜+OTP) + 프로필 (공개범위)
- 팀 (생성/강퇴/공지/회비)
- 용병 모집 / 팀 모집 공고
- 축구 경기 (캘린더/출석/명단/심판배정)
- 결과 확정 (심판→수락→자동) + 노쇼 패널티
- MVP 투표 + 경기 기록 카드 + SNS 공유
- 심판 평점
- 리그 티어제 + 승급전 5판 3승
- 지역 통계
- 대회 (4팀+개최권)
- 운동장 예약 (선결제)
- 소셜 (쇼츠/피드/팔로우/차단)
- 쇼핑몰 (개최권+유니폼 주문)
- 검색 + 앱 설정 + 알림
- Zalo 소셜 로그인
- 개인정보처리방침 동의 (PDPD)
- 신고 기능 (유형 구분)
- 선수 이력 (소속팀 + 시즌 기록)
- 경기 일정 외부 공유
- 수수료율 0% 설정 + super_admin 변경 권한
- 지역별 금액 표기 포맷

---

# 14. MVP 제외 (향후)

- 풋살 매칭 구현
- 심판 자격증 상세
- AI 하이라이트
- 광고/스폰서십
- CMS 웹 UI
- 국가별 확장

---

# 15. AI 코딩 작업 단위

좋음: "팀 강퇴 Edge Function만", "용병 모집 서비스만", "경기 캘린더 화면만"
나쁨: "전체 앱 한 번에"

제공 문서 순서:
1. Tech Spec v3.0
2. ERD v3.0
3. API Spec v3.0
4. RLS v3.0
5. Coding Rules v3.0
6. Feature Task Order v3.0

---

# End of Document — v3.1
