# AI Collaboration Rules

버전: 3.1
작성일: 2026-03-20

---

# 핵심 규칙

1. **문서 계층 준수**: Tech Spec → ERD → API Spec → RLS → Coding Rules
2. **스키마/인증/결제 수정 시 문서 업데이트 필수**
3. **각 AI 태스크는 하나의 feature만 수정**
4. **모든 변경은 AI_TASK_LOG.md에 기록**
5. **브랜치**: `ai-codex/*` / `ai-claude/*` / `ai-cursor/*`
6. **스키마 변경 시**: migration + ERD 업데이트 + CHANGELOG
7. **Edge Function 수정 후**: 실서버 배포 + 응답 검증 필수
8. **한글 문자열**: service/hook 파일에 직접 포함 금지
9. **avatar_url / shorts**: 클라이언트 직접 업로드 금지
10. **skill_tier / reputation_score**: 클라이언트 수정 절대 금지
11. **platform_settings**: super_admin만 수정 가능, audit_log 필수
12. **수수료율**: 초기값 0%, 변경 시 반드시 audit_log 기록

---

# 확정 문서 버전

| 문서 | 버전 |
|---|---|
| 00_KickGo_Feature_Definition | v1.1 FINAL |
| 01_KickGo_Tech_Spec | v3.1 |
| 02_KickGo_Database_ERD | v3.1 |
| 03_KickGo_API_Spec | v3.1 |
| 04_KickGo_RLS_Policies | v3.1 |
| 05_KickGo_Coding_Rules | v3.0 (변경 없음) |
| 06_KickGo_Feature_Task_Order | v3.1 |

> v3.0 이전 문서는 폐기. AI는 v3.1 문서만 참조.

---

# End of Document — v3.1
