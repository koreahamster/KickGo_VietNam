# AI Collaboration Rules

Version: 1.1 Date: 2026-03-14

Purpose: Ensure multiple AI tools (Claude, Codex, Cursor, etc.) can work
safely on the same repository.

Core rules:

1.  Always follow the documentation hierarchy:

    Tech Spec → ERD → API Spec → Coding Rules

2.  AI must never modify:

    -   database schema
    -   authentication flow
    -   payment verification without updating documentation.

3.  Each AI task must modify only ONE feature.

4.  Every AI change must be recorded in AI_TASK_LOG.md.

5.  Branch structure:

ai-codex/* ai-claude/* ai-cursor/\*

6.  Schema changes require: migration file + ERD update + CHANGELOG
    entry.
