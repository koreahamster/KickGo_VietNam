# KickGo VN — Coding Rules

문서 버전: 3.0
작성일: 2026-03-20
변경 이력: v2.1 기반. 소셜/쇼핑몰/용병/팀 회비 기능 관련 규칙 추가. 폴더 구조 확장.

---

# 1. 필수 스택

| 항목 | 선택 |
|---|---|
| 프레임워크 | React Native + Expo SDK 54 |
| 언어 | TypeScript (JS 파일 금지) |
| 서버 상태 | React Query |
| 글로벌 상태 | Zustand |
| 내비게이션 | Expo Router |
| 폼 처리 | react-hook-form + zod |
| 백엔드 | Supabase JS SDK |

---

# 2. 절대 금지 사항

- JavaScript 파일 사용
- `any` 남용
- 화면 컴포넌트에 긴 비즈니스 로직
- 화면에서 직접 `.from()` Supabase 체인
- 결제 완료를 클라이언트 콜백으로 확정
- 경기 결과 확정을 클라이언트 로직만으로 처리
- `skill_tier` / `reputation_score` 클라이언트 수정
- `avatar_url` Storage 직접 PUT 후 DB 직접 UPDATE
- 서비스/훅 파일에 한글 문자열 직접 포함 (i18n 파일로 분리)
- Edge Function 에러 메시지에 한글 사용 (ASCII English만)

---

# 3. 디렉토리 구조

```
src/
  app/
    (auth)/
    (onboarding)/
    (tabs)/
    (team)/
    (match)/
    (league)/
    (tournament)/
    (facility)/
    (shop)/
    (social)/
    (referee)/
    (settings)/
  core/
    config/
    constants/
    i18n/       ← 모든 UI 문자열 분리
      ko.ts / vi.ts / en.ts
    lib/
      onboarding.ts
    theme/
    types/
    utils/
  features/
    auth/
    profile/
    team/
    match/
    league/
    tournament/
    facility/
    shop/
    social/
    referee/
    mercenary/
    notifications/
    payments/
  shared/
    components/
    ui/
    hooks/
  services/
    supabase/
      client.ts
      auth.service.ts
      profile.service.ts
      team.service.ts
      match.service.ts
      league.service.ts
      facility.service.ts
      shop.service.ts
      social.service.ts
      referee.service.ts
      mercenary.service.ts
  store/

shared/
  regions/
    vietnam-regions.ts    ← 앱+Edge Function 공용 소스

supabase/
  functions/
    _shared/
      validation.ts / regions.ts
    [각 Edge Function 폴더]
  migrations/
```

---

# 4. 네이밍 규칙

| 항목 | 규칙 |
|---|---|
| 컴포넌트 | PascalCase |
| 훅 | use + PascalCase |
| 서비스 | xxx.service.ts |
| 타입 | xxx.types.ts |
| API | xxx.api.ts |
| 스토어 | xxx.store.ts |
| 상수 | UPPER_SNAKE_CASE |
| boolean | is / has / can / should 접두사 |

---

# 5. TypeScript 규칙

- 모든 함수 파라미터/반환 타입 명시
- `any` 금지 (`unknown` 후 좁히기 허용)
- Supabase generated types 우선
- feature 내부 타입은 `feature/types`
- 공유 타입은 `core/types`

---

# 6. 상태 관리 원칙

## React Query (서버 상태)
대상: 팀/경기/리그 순위/프로필/피드/알림 등
- query key 배열 형태 필수
- mutation 후 관련 query invalidate
- 결제/경기 결과 확정/분쟁은 낙관적 업데이트 금지

## Zustand (클라이언트 상태)
대상: 로그인 세션, 온보딩 상태, UI 필터
- 서버 응답 데이터 중복 저장 금지

---

# 7. React Query 키 패턴

```ts
["profile", userId]
["player-profile", userId]
["team", teamId]
["team-members", teamId]
["team-announcements", teamId]
["team-fee-records", teamId]
["matches", { teamId, year, month }]
["match", matchId]
["match-result", matchId]
["match-rosters", matchId]
["league-standings", { seasonId, tierId }]
["tier-standings", { leagueId, provinceCode, tierId }]
["mercenary-posts", { provinceCode }]
["recruitment-posts", { provinceCode }]
["feed", { cursor }]
["shorts", authorId]
["notifications", userId]
["facility-slots", { facilityId, date }]
["shop-products", category]
["shop-orders", userId]
["referee-assignments", userId]
```

---

# 8. 프로필 사진 업로드 규칙

```
upload-avatar Edge Function → upload_url 수신
    ↓
이미지 PUT (클라이언트 fetch)
    ↓
profiles.avatar_url 서버 업데이트 (Edge Function 내)
```

최대 5MB, jpeg/png/webp, 경로: `avatars/{user_id}/profile.jpg`

---

# 9. 쇼츠 업로드 규칙

```
upload-shorts Edge Function → upload_url 수신
    ↓
영상 PUT
    ↓
shorts.status = processing → ready (처리 완료 후)
```

최대 1GB, 최대 60초, 경로: `shorts/{user_id}/{shorts_id}`

---

# 10. 공개범위(visibility) 처리 규칙

- `profiles.visibility`, `teams.visibility`, `posts.visibility` 모두 동일 값: `public / members_only / private`
- 클라이언트에서 조회 시 RLS가 자동 필터링
- 설정 화면에서 `update-profile-visibility` / `update-team-visibility` Edge Function 호출

---

# 11. 다국어 / 인코딩 규칙

- 모든 UI 문자열: `src/core/i18n/ko.ts` 등으로 분리
- 서비스/훅/Edge Function 파일에 한글 직접 포함 금지
- Edge Function 에러 메시지: ASCII English만

---

# 12. 지역 데이터 규칙

- 단일 공용 소스: `shared/regions/vietnam-regions.ts`
- 앱 UI와 Edge Function validation이 동일 소스 참조
- 자유 입력 불가, 코드값만, country→province→district 순서

---

# 13. 화면 책임 원칙

화면이 할 일:
- 라우트 파라미터 수신
- query 호출
- mutation 트리거
- 로딩/에러/빈 상태 표시

화면이 하면 안 되는 일:
- 직접 SQL 구조 결정
- 복잡한 권한 계산 반복
- 결제 검증
- 경기 결과 최종 확정

---

# 14. 권한 처리 원칙

1. 서버 1차 보호 (RLS + Edge Function)
2. 클라이언트 UI 가드
3. 사용자 메시지

> UI에서 숨겨도 서버 보호 없으면 의미 없음

---

# 15. 에러 처리

| 종류 | UI 처리 |
|---|---|
| 사용자 입력 에러 | 필드 단위 안내 |
| 네트워크/서버 | 재시도 메시지 |
| 권한 에러 | 접근 불가 안내 |

운영 환경: Sentry 수집

---

# 16. AI 코딩 규칙

좋은 방식:
- "팀 생성 화면만 구현해줘"
- "mercenary_posts service만 구현해줘"
- "upload-shorts Edge Function만 작성해줘"

나쁜 방식:
- "전체 앱 한 번에 만들어줘"

추가:
- 항상 Tech Spec + ERD + API Spec + RLS 함께 제공
- Edge Function 수정 후 배포 + 실서버 응답 검증 필수

---

# 17. 금지 패턴

- `any` 남용
- 거대한 단일 컴포넌트 (300줄 초과)
- 화면 내 직접 Supabase 접근
- React Query + Zustand 중복 저장
- 권한 검사 UI에만 의존
- 결제 클라이언트 확정
- 경기 결과 프론트 확정
- 한글 service/hook 파일에 직접 포함
- avatar/shorts Storage 직접 업로드

---

# 18. 최종 원칙

- 읽기 쉬워야 한다
- 수정하기 쉬워야 한다
- 역할이 분리되어 있어야 한다
- 타입이 명확해야 한다
- 권한과 보안이 서버 기준으로 보호되어야 한다
- AI가 이어서 작업해도 구조가 무너지지 않아야 한다
- 인코딩 안전성이 보장되어야 한다

---

# End of Document — v3.0
