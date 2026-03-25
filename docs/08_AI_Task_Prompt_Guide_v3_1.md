# AI Task Instruction Guide

버전: 3.1
작성일: 2026-03-20

---

# 첨부 문서 순서

1. 01_KickGo_Tech_Spec_v3_1.md
2. 02_KickGo_Database_ERD_v3_1.md
3. 03_KickGo_API_Spec_v3_1.md
4. 04_KickGo_RLS_Policies_v3_1.md
5. 05_KickGo_Coding_Rules_v3_0.md
6. 06_KickGo_Feature_Task_Order_v3_1.md

---

# 프롬프트 예시

**Zalo 로그인:**
```
Tech Spec + API Spec 기준으로 Zalo 소셜 로그인 Supabase Auth 연동을 구현해줘.
```

**수수료율 설정:**
```
update-platform-setting Edge Function을 구현해줘.
super_admin만 호출 가능, audit_log 기록 필수.
```

**선수 이력 화면:**
```
선수 공개 프로필 화면에서 player_team_history와 player_season_stats를
연도별로 보여주는 컴포넌트를 구현해줘.
```

**신고 기능:**
```
submit-report Edge Function과 신고 모달 컴포넌트를 구현해줘.
report_type: noshow/abuse/violence/false_report/spam/inappropriate
```

---

# 절대 하면 안 되는 요청

- "KickGo 전체 앱을 한 번에 만들어줘"
- "한글로 에러 메시지 작성해줘" (Edge Function)
- "skill_tier를 클라이언트에서 수정할 수 있게 해줘"
- "수수료율을 클라이언트에서 바꿀 수 있게 해줘"

---

# End of Document — v3.1
