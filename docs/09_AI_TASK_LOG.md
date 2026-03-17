# AI_TASK_LOG

Record all AI generated work.

Template:

Date: AI Tool: Task: Files Changed: Reason:

Date: 2026-03-14
AI Tool: Codex
Task: Phase 1 initial Expo app scaffold, landing screen UI, login screen UI, and router navigation
Files Changed: package.json, app.json, tsconfig.json, expo-env.d.ts, .gitignore, src/app/_layout.tsx, src/app/index.tsx, src/app/login.tsx, src/components/AppLogo.tsx, src/components/PrimaryButton.tsx, src/constants/colors.ts, src/constants/spacing.ts, src/types/auth.types.ts, src/hooks/index.ts, src/lib/index.ts, src/services/index.ts, docs/09_AI_TASK_LOG.md
Reason: Implement the documented initial setup scope without adding auth logic or database changes.

Date: 2026-03-14
AI Tool: Codex
Task: Adjust Expo SDK target for Expo Go compatibility
Files Changed: package.json, docs/09_AI_TASK_LOG.md
Reason: Lower the project from Expo SDK 55 to SDK 53 to avoid Expo Go version incompatibility during Phase 1 UI validation.

Date: 2026-03-14
AI Tool: Codex
Task: Align project packages to Expo SDK 54
Files Changed: package.json, docs/09_AI_TASK_LOG.md
Reason: The installed Expo Go client supports SDK 54, so the project dependencies were updated from mismatched SDK 53/55 assumptions to an SDK 54-compatible set.

Date: 2026-03-14
AI Tool: Codex
Task: Fix npm peer dependency resolution for SDK 54 install
Files Changed: package.json, docs/09_AI_TASK_LOG.md
Reason: Update @types/react and TypeScript dev dependency versions to match the React Native 0.81 / Expo SDK 54 peer dependency requirements.

Date: 2026-03-14
AI Tool: Codex
Task: Implement Google authentication base flow with Supabase for Expo
Files Changed: package.json, src/lib/supabase.ts, src/services/auth.service.ts, src/hooks/useAuth.ts, src/app/index.tsx, src/app/login.tsx, src/components/PrimaryButton.tsx, src/types/auth.types.ts, docs/09_AI_TASK_LOG.md
Reason: Add the Phase 2 Google sign-in client, auth service, auth hook, login button wiring, home screen auth-state branching, and post-login return to home without modifying schema or adding non-Google auth.

Date: 2026-03-14
AI Tool: Codex
Task: Pin react-dom for Expo SDK 54 dependency resolution
Files Changed: package.json, docs/09_AI_TASK_LOG.md
Reason: Prevent npm from resolving an incompatible react-dom version during Expo Router installation by matching Expo SDK 54's React 19.1.0 stack.
Date: 2026-03-14
AI Tool: Codex
Task: Fix invalid react-native-url-polyfill package version
Files Changed: package.json, docs/09_AI_TASK_LOG.md
Reason: Replace non-existent npm version ^2.1.0 with installable version ^2.0.0 so the Google auth dependency set can install successfully.
Date: 2026-03-14
AI Tool: Codex
Task: Add Expo public Supabase environment file
Files Changed: .env, .gitignore, docs/09_AI_TASK_LOG.md
Reason: Expo could not load EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY because no .env file existed in the project root.
Date: 2026-03-14
AI Tool: Codex
Task: Add auth debug logs for OAuth callback verification
Files Changed: src/services/auth.service.ts, docs/09_AI_TASK_LOG.md
Reason: Capture the actual redirect URL, OAuth URL, auth session result, and session restoration state to verify whether Google login completes end-to-end in Expo Go.
Date: 2026-03-14
AI Tool: Codex
Task: Stabilize OAuth redirect strategy for mobile authentication
Files Changed: src/services/auth.service.ts, src/app/login.tsx, docs/09_AI_TASK_LOG.md
Reason: Replace Expo Go IP-based OAuth redirect behavior with a stable custom scheme target (footgo://login) and surface an explicit unsupported-environment message for Expo Go, which does not provide stable OAuth redirect testing.
Date: 2026-03-14
AI Tool: Codex
Task: Update project logs with verified OAuth status
Files Changed: docs/10_CHANGELOG.md, docs/11_DEVELOPMENT_LOG.md, docs/09_AI_TASK_LOG.md
Reason: Record that Google OAuth screen flow and Supabase user creation were confirmed, while the remaining incomplete step is app redirect return and session restoration on mobile.Date: 2026-03-16
AI Tool: Codex
Task: Prepare development build settings for stable Google OAuth callback verification
Files Changed: app.json, package.json, eas.json, src/services/auth.service.ts, src/hooks/useAuth.ts, docs/09_AI_TASK_LOG.md
Reason: Add expo-dev-client and EAS build configuration, define stable native app identifiers, and restrict callback session recovery to the footgo://login deep link so the final Google OAuth return flow can be verified outside Expo Go.
Date: 2026-03-16
AI Tool: Codex
Task: Add temporary email/password authentication fallback for home-return validation
Files Changed: docs/01_FootGo_Tech_Spec_v1_1.md, docs/03_FootGo_API_Spec_v1_1.md, docs/06_FootGo_Feature_Task_Order_v1_1.md, src/types/auth.types.ts, src/services/auth.service.ts, src/hooks/useAuth.ts, src/app/login.tsx, src/app/index.tsx, docs/09_AI_TASK_LOG.md
Reason: Keep Google OAuth in place while adding a document-aligned email/password fallback that allows session creation and navigation back to the home screen on iPhone without relying on native Google OAuth callback verification.
Date: 2026-03-16
AI Tool: Codex
Task: Split auth entry flow into dedicated login and signup screens
Files Changed: src/app/_layout.tsx, src/app/index.tsx, src/app/login.tsx, src/app/signup.tsx, docs/09_AI_TASK_LOG.md
Reason: Remove the generic get-started action, provide separate login and signup navigation from the home screen, and align the auth UX with the verified email login flow.
Date: 2026-03-16
AI Tool: Codex
Task: Refine auth and home screen copy to a more service-oriented tone
Files Changed: src/app/index.tsx, src/app/login.tsx, src/app/signup.tsx, docs/09_AI_TASK_LOG.md
Reason: Replace placeholder-style wording with clearer product-facing copy while keeping the existing auth structure and navigation unchanged.
Date: 2026-03-16
AI Tool: Codex
Task: Refresh changelog with current verified auth and UI status
Files Changed: docs/10_CHANGELOG.md, docs/09_AI_TASK_LOG.md
Reason: Keep a readable project change history that clearly separates completed implementation, verified behavior, and deferred items.
Date: 2026-03-16
AI Tool: Codex
Task: Implement Phase 2 profile setup flow after authentication
Files Changed: src/types/profile.types.ts, src/services/profile.service.ts, src/hooks/useProfile.ts, src/app/profile-setup.tsx, src/app/index.tsx, src/app/_layout.tsx, docs/09_AI_TASK_LOG.md
Reason: Route authenticated users without a profiles row to a dedicated profile setup screen, collect the four documented profile fields, create the profile through POST /functions/v1/create-profile via an Edge Function call, and send the user back to home on success.
Date: 2026-03-16
AI Tool: Codex
Task: Replace free-text profile fields with standardized selection inputs
Files Changed: src/constants/profile-options.ts, src/components/SelectField.tsx, src/app/profile-setup.tsx, docs/09_AI_TASK_LOG.md
Reason: Prevent inconsistent profile aggregation by replacing free-text position, dominant foot, and region inputs with controlled option-based selection while still storing a single primary_region_code value required by the current schema.
Date: 2026-03-16
AI Tool: Codex
Task: Finalize and apply documentation revision for common profiles, multi-role accounts, facility relations, language, region, settings, wallet, and payment structure
Files Changed: docs/01_FootGo_Tech_Spec_v1_1.md, docs/02_FootGo_Database_ERD_v1_1.md, docs/03_FootGo_API_Spec_v1_1.md, docs/04_FootGo_RLS_Policies_v1_1.md, docs/06_FootGo_Feature_Task_Order_v1_1.md, docs/09_AI_TASK_LOG.md, docs/10_CHANGELOG.md, docs/11_DEVELOPMENT_LOG.md
Reason: Append the approved v1.4 documentation upgrade that converts player-centered profiles into common profiles plus multi-role and role-specific structures, adds facility/facility-manager relations, expands region and language handling, defines wallet/payment principles, and documents routing and settings boundaries for MVP and later phases.
Date: 2026-03-16
AI Tool: Codex
Task: Create staged Supabase migration drafts for the revised profile, role, facility, wallet, and payment schema
Files Changed: supabase/migrations/001_add_profile_common_fields.sql, supabase/migrations/002_create_account_types.sql, supabase/migrations/003_create_player_and_referee_profiles.sql, supabase/migrations/004_create_facilities_and_facility_managers.sql, supabase/migrations/005_create_wallet_and_payment_tables.sql, supabase/migrations/006_backfill_profiles_and_player_profiles.sql, supabase/migrations/007_add_constraints_and_indexes.sql, supabase/migrations/008_prepare_rls_tables.sql, docs/09_AI_TASK_LOG.md, docs/10_CHANGELOG.md, docs/11_DEVELOPMENT_LOG.md
Reason: Move from document review into implementation preparation by creating gradual Supabase/Postgres migration files that preserve legacy fields, add the revised common-profile and multi-role schema, prepare facility and wallet/payment tables, and include backfill steps before future RLS work.
Date: 2026-03-16
AI Tool: Codex
Task: Create Supabase RLS migration for revised profile, role, facility, wallet, and payment tables
Files Changed: supabase/migrations/009_apply_rls_policies.sql, docs/09_AI_TASK_LOG.md, docs/10_CHANGELOG.md, docs/11_DEVELOPMENT_LOG.md
Reason: Move the staged schema work forward by enabling RLS and adding ownership-based policies for the newly introduced tables while keeping privileged facility, wallet, and payment confirmation writes restricted to server-side workflows.
Date: 2026-03-16
AI Tool: Codex
Task: Implement Phase 2 MVP onboarding routes, profile functions, settings screens, and schema-aligned profile services
Files Changed: src/types/profile.types.ts, src/constants/profile-options.ts, src/lib/device-language.ts, src/services/profile.service.ts, src/hooks/useProfile.ts, src/app/_layout.tsx, src/app/(auth)/_layout.tsx, src/app/(auth)/login.tsx, src/app/(auth)/signup.tsx, src/app/(auth)/phone-verify.tsx, src/app/(onboarding)/_layout.tsx, src/app/(onboarding)/create-profile.tsx, src/app/(onboarding)/role-onboarding.tsx, src/app/(tabs)/_layout.tsx, src/app/(tabs)/index.tsx, src/app/(tabs)/profile.tsx, src/app/(settings)/_layout.tsx, src/app/(settings)/settings.tsx, src/app/(settings)/language.tsx, src/app/(settings)/region.tsx, src/app/(settings)/roles.tsx, supabase/functions/_shared/types.ts, supabase/functions/_shared/cors.ts, supabase/functions/_shared/http.ts, supabase/functions/_shared/auth.ts, supabase/functions/_shared/validation.ts, supabase/functions/create-profile/index.ts, supabase/functions/add-account-type/index.ts, supabase/functions/create-player-profile/index.ts, supabase/functions/update-player-profile/index.ts, supabase/functions/create-referee-profile/index.ts, supabase/functions/update-profile/index.ts, docs/09_AI_TASK_LOG.md
Reason: Move from document-complete state into Phase 2 MVP implementation by wiring auth to phone verification, common profile creation, role-specific onboarding, profile/settings MVP screens, and schema-aligned Supabase Edge Functions without touching team, match, facility operations, or payment execution.
Date: 2026-03-16
AI Tool: Codex
Task: Improve create-profile mobile keyboard handling and scroll behavior
Files Changed: src/app/(onboarding)/create-profile.tsx, docs/09_AI_TASK_LOG.md
Reason: Prevent the iPhone numeric keyboard from blocking the next onboarding fields by adding keyboard dismissal, scroll/avoidance behavior, and submit handling on the common profile screen.
Date: 2026-03-16
AI Tool: Codex
Task: Handle onboarding/settings promise failures in-screen and clarify initial landing behavior
Files Changed: src/app/(onboarding)/create-profile.tsx, src/app/(onboarding)/role-onboarding.tsx, src/app/(settings)/language.tsx, src/app/(settings)/region.tsx, src/app/(settings)/roles.tsx, docs/09_AI_TASK_LOG.md
Reason: Prevent Edge Function failures from surfacing as uncaught promise errors in Expo logs by catching rethrown profile hook errors at screen level while preserving the initial unauthenticated home landing route behavior.
Date: 2026-03-17
AI Tool: Codex
Task: Surface Edge Function error payloads on profile mutation failures
Files Changed: src/services/profile.service.ts, docs/09_AI_TASK_LOG.md
Reason: Replace the generic "Edge Function returned a non-2xx status code" client error with the actual server response message so create-profile and other onboarding failures can be diagnosed precisely.
Date: 2026-03-17
AI Tool: Codex
Task: Add Supabase project config for remote migration/function deployment readiness
Files Changed: supabase/config.toml, docs/09_AI_TASK_LOG.md
Reason: Prepare the project for actual Supabase CLI use by defining the linked project ref, redirect settings, and JWT verification flags for implemented Edge Functions in an environment where the CLI itself is not available.
Date: 2026-03-17
AI Tool: Codex
Task: Fix BOM in Supabase config.toml for CLI parsing
Files Changed: supabase/config.toml, docs/09_AI_TASK_LOG.md
Reason: Supabase CLI could not parse config.toml because the file was saved with a BOM, causing TOML parsing to fail before function deployment.
Date: 2026-03-17
AI Tool: Codex
Task: Remove BOM from Supabase migration SQL files for db push compatibility
Files Changed: supabase/migrations/001_add_profile_common_fields.sql, supabase/migrations/002_create_account_types.sql, supabase/migrations/003_create_player_and_referee_profiles.sql, supabase/migrations/004_create_facilities_and_facility_managers.sql, supabase/migrations/005_create_wallet_and_payment_tables.sql, supabase/migrations/006_backfill_profiles_and_player_profiles.sql, supabase/migrations/007_add_constraints_and_indexes.sql, supabase/migrations/008_prepare_rls_tables.sql, supabase/migrations/009_apply_rls_policies.sql, docs/09_AI_TASK_LOG.md
Reason: Supabase db push failed because the migration SQL files were saved with a BOM, which Postgres treated as an invalid character before the first SQL statement.
Date: 2026-03-17
AI Tool: Codex
Task: Add bootstrap migration for fresh Supabase projects before gradual profile/payment migration stack
Files Changed: supabase/migrations/000_bootstrap_legacy_profiles_and_payment_items.sql, docs/09_AI_TASK_LOG.md
Reason: The remote project did not yet contain the legacy profiles table expected by the gradual migration plan, so a bootstrap migration was added to create the minimum base tables required for 001-009 to apply cleanly on a fresh database.
Date: 2026-03-17
AI Tool: Codex
Task: Re-encode bootstrap migration and migration stack without BOM after fresh file creation
Files Changed: supabase/migrations/000_bootstrap_legacy_profiles_and_payment_items.sql, supabase/migrations/001_add_profile_common_fields.sql, supabase/migrations/002_create_account_types.sql, supabase/migrations/003_create_player_and_referee_profiles.sql, supabase/migrations/004_create_facilities_and_facility_managers.sql, supabase/migrations/005_create_wallet_and_payment_tables.sql, supabase/migrations/006_backfill_profiles_and_player_profiles.sql, supabase/migrations/007_add_constraints_and_indexes.sql, supabase/migrations/008_prepare_rls_tables.sql, supabase/migrations/009_apply_rls_policies.sql, docs/09_AI_TASK_LOG.md
Reason: The newly added bootstrap SQL file was saved with a BOM and caused the same PostgreSQL parser failure as before, so the full migration stack was re-encoded without BOM again.

Date: 2026-03-17
AI Tool: Codex
Task: Add logout escape path to onboarding screens and confirm create-profile 401 auth failure state
Files Changed: src/app/(auth)/phone-verify.tsx, src/app/(onboarding)/create-profile.tsx, src/app/(onboarding)/role-onboarding.tsx, docs/09_AI_TASK_LOG.md, docs/10_CHANGELOG.md, docs/11_DEVELOPMENT_LOG.md
Reason: Users could get stuck in phone verification or onboarding screens without a logout action, and recent create-profile failures were narrowed down to authenticated Edge Function access returning 401 rather than missing tables.

Date: 2026-03-17
AI Tool: Codex
Task: Attach explicit bearer token headers to profile-related Edge Function calls
Files Changed: src/services/profile.service.ts, docs/09_AI_TASK_LOG.md, docs/10_CHANGELOG.md, docs/11_DEVELOPMENT_LOG.md
Reason: `create-profile` invocation reached the function gateway with a 401 before execution, so profile-related function calls were updated to pass the current session access token explicitly in the Authorization header.

Date: 2026-03-17
AI Tool: Codex
Task: Optimistically update profile state after successful onboarding/profile mutations
Files Changed: src/hooks/useProfile.ts, docs/09_AI_TASK_LOG.md, docs/10_CHANGELOG.md, docs/11_DEVELOPMENT_LOG.md
Reason: `create-profile` started succeeding after explicit bearer token headers were added, but navigation could still stall while waiting for a follow-up profile refetch, so the hook now updates local profile state immediately after successful mutations.

Date: 2026-03-17
AI Tool: Codex
Task: Treat duplicate create-profile responses as recoverable and reload existing profile
Files Changed: src/hooks/useProfile.ts, docs/09_AI_TASK_LOG.md, docs/10_CHANGELOG.md, docs/11_DEVELOPMENT_LOG.md
Reason: After the first successful profile creation, repeated submissions could still raise a `profile_exists` function error and strand the user on the same screen, so duplicate-profile responses are now handled as a recoverable state by reloading the existing profile bundle.

Date: 2026-03-17
AI Tool: Codex
Task: Switch onboarding/auth/settings navigation to explicit Expo Router group paths
Files Changed: src/app/(auth)/login.tsx, src/app/(auth)/phone-verify.tsx, src/app/(auth)/signup.tsx, src/app/(onboarding)/create-profile.tsx, src/app/(onboarding)/role-onboarding.tsx, src/app/(settings)/language.tsx, src/app/(settings)/region.tsx, src/app/(settings)/roles.tsx, src/app/(settings)/settings.tsx, src/app/(tabs)/index.tsx, src/app/(tabs)/profile.tsx, docs/09_AI_TASK_LOG.md, docs/10_CHANGELOG.md, docs/11_DEVELOPMENT_LOG.md
Reason: Navigation after onboarding mutations could still stall, so auth/onboarding/tab/settings transitions were updated from hidden path aliases to explicit Expo Router group paths to avoid route resolution issues in nested stacks.

Date: 2026-03-17
AI Tool: Codex
Task: Remove duplicate direct navigation after create-profile success and rely on state-driven redirect
Files Changed: src/app/(onboarding)/create-profile.tsx, docs/09_AI_TASK_LOG.md, docs/10_CHANGELOG.md, docs/11_DEVELOPMENT_LOG.md
Reason: The common profile screen could trigger repeated transitions by navigating directly on submit success and then navigating again when `hasProfile` changed, so post-submit routing now relies on a single state-based redirect path.

Date: 2026-03-17
AI Tool: Codex
Task: Add onboarding transition lock and explicit post-create navigation to role onboarding
Files Changed: src/app/(onboarding)/create-profile.tsx, docs/09_AI_TASK_LOG.md, docs/10_CHANGELOG.md, docs/11_DEVELOPMENT_LOG.md
Reason: The create-profile screen could remain visible or re-enter due to state-based redirects and refetch timing, so successful profile creation now triggers an explicit route transition while a local lock prevents duplicate navigation.

Date: 2026-03-17
AI Tool: Codex
Task: Block common profile form from rendering again when a profile already exists
Files Changed: src/app/(auth)/phone-verify.tsx, src/app/(onboarding)/create-profile.tsx, docs/09_AI_TASK_LOG.md, docs/10_CHANGELOG.md, docs/11_DEVELOPMENT_LOG.md
Reason: Existing users could still be sent into the common profile form path, so the phone verification and common profile screens were tightened to treat an existing profile as a completed step and move directly to role onboarding or home instead of reopening the form.

Date: 2026-03-17
AI Tool: Codex
Task: Remove language selection from common profile onboarding and align country selection with Vietnam-only MVP region policy
Files Changed: src/app/(onboarding)/create-profile.tsx, src/app/(settings)/region.tsx, docs/09_AI_TASK_LOG.md, docs/10_CHANGELOG.md, docs/11_DEVELOPMENT_LOG.md
Reason: The revised docs define preferred language as device-detected then user-adjustable in Settings, and Phase 2 MVP region input uses internal Vietnam seed/static data rather than direct external province API calls or multi-country selection.

Date: 2026-03-17
AI Tool: Codex
Task: Restore broken Korean UI copy after onboarding/settings text encoding corruption
Files Changed: src/app/(onboarding)/create-profile.tsx, src/app/(settings)/region.tsx, docs/09_AI_TASK_LOG.md, docs/10_CHANGELOG.md, docs/11_DEVELOPMENT_LOG.md
Reason: A previous rewrite corrupted Korean strings into question marks, so the affected onboarding and settings screens were restored with proper UTF-8 copy.

Date: 2026-03-17
AI Tool: Codex
Task: Rewrite corrupted onboarding and region screens from scratch to restore Korean copy and fix mislabeled placeholders
Files Changed: src/app/(onboarding)/create-profile.tsx, src/app/(settings)/region.tsx, docs/09_AI_TASK_LOG.md, docs/10_CHANGELOG.md, docs/11_DEVELOPMENT_LOG.md
Reason: Partial string replacement left the common profile and region screens syntactically valid but text-corrupted, including wrong placeholders like display name showing self-introduction.

Date: 2026-03-17
AI Tool: Codex
Task: Guard create-profile submission with a fresh profile reload before calling the Edge Function
Files Changed: src/hooks/useProfile.ts, src/app/(onboarding)/create-profile.tsx, docs/09_AI_TASK_LOG.md, docs/10_CHANGELOG.md, docs/11_DEVELOPMENT_LOG.md
Reason: Existing accounts could still hit create-profile even when a common profile row already existed, so the onboarding submit path now reloads the current profile bundle first and skips duplicate profile creation when possible.

Date: 2026-03-17
AI Tool: Codex
Task: Add step-specific create-profile function diagnostics and client-side error logging
Files Changed: supabase/functions/create-profile/index.ts, src/services/profile.service.ts, docs/09_AI_TASK_LOG.md, docs/10_CHANGELOG.md, docs/11_DEVELOPMENT_LOG.md
Reason: The create-profile call was still failing without leaving saved rows, so the function now distinguishes existing profile query, profile insert, and account type insert failures and the client logs the parsed server message.

Date: 2026-03-17
AI Tool: Codex
Task: Improve profile function error logging with HTTP status and raw response fallback
Files Changed: src/services/profile.service.ts, docs/09_AI_TASK_LOG.md, docs/10_CHANGELOG.md, docs/11_DEVELOPMENT_LOG.md
Reason: The client still received a generic non-2xx function error message, so function error parsing now uses cloned responses and logs the error class plus HTTP status/raw body when JSON parsing is unavailable.

Date: 2026-03-17
AI Tool: Codex
Task: Switch profile function error parsing from FunctionsHttpError instanceof checks to response-context inspection
Files Changed: src/services/profile.service.ts, docs/09_AI_TASK_LOG.md, docs/10_CHANGELOG.md, docs/11_DEVELOPMENT_LOG.md
Reason: The client still logged a generic FunctionsHttpError message, indicating class-based detection was not reliably matching at runtime, so error parsing now inspects the response context directly and logs available error object keys.
Date: 2026-03-17
AI Tool: Codex
Task: Replace create-profile function client error parsing with response-context based parsing
Files Changed: src/services/profile.service.ts, docs/09_AI_TASK_LOG.md, docs/10_CHANGELOG.md, docs/11_DEVELOPMENT_LOG.md
Reason: The client was still logging only a generic FunctionsHttpError message, so the parser now reads HTTP status and JSON/text bodies directly from the Supabase function error context without relying on runtime class matching.

Date: 2026-03-17
AI Tool: Codex
Task: Rewrite profile service again to remove stale type references and restore readable error strings
Files Changed: src/services/profile.service.ts, docs/09_AI_TASK_LOG.md, docs/10_CHANGELOG.md, docs/11_DEVELOPMENT_LOG.md
Reason: The editor still reported a stale FunctionsHttpError-related type issue, so the profile service was rewritten cleanly without that symbol and with restored human-readable error messages.

Date: 2026-03-17
AI Tool: Codex
Task: Disable Supabase Edge gateway verify_jwt for authenticated profile functions
Files Changed: supabase/config.toml, docs/09_AI_TASK_LOG.md, docs/10_CHANGELOG.md, docs/11_DEVELOPMENT_LOG.md
Reason: The create-profile invocation reached the gateway with a bearer token but still failed with HTTP 401 invalid JWT before function execution, so JWT verification was moved fully into the function body via requireUser().

Date: 2026-03-17
AI Tool: Codex
Task: Allow blank optional strings in Edge Function validation
Files Changed: supabase/functions/_shared/validation.ts, docs/09_AI_TASK_LOG.md, docs/10_CHANGELOG.md, docs/11_DEVELOPMENT_LOG.md
Reason: create-profile was failing with `??? ??? ???? ????.` because optional string fields like `bio` were sent as empty strings and incorrectly rejected by shared validation.

Date: 2026-03-17
AI Tool: Codex
Task: Remove create-profile and role-onboarding redirect loop by replacing automatic bounce logic with explicit continuation screens
Files Changed: src/app/(onboarding)/create-profile.tsx, src/app/(onboarding)/role-onboarding.tsx, docs/09_AI_TASK_LOG.md, docs/10_CHANGELOG.md, docs/11_DEVELOPMENT_LOG.md
Reason: The onboarding screens were repeatedly redirecting each other when profile state was out of sync between mounts, so automatic back-and-forth redirects were replaced with explicit continuation buttons based on the current profile state.

Date: 2026-03-17
AI Tool: Codex
Task: Stop onboarding loop and rewrite create-profile screen with safe Unicode text literals
Files Changed: src/app/(onboarding)/create-profile.tsx, src/app/(onboarding)/role-onboarding.tsx, docs/09_AI_TASK_LOG.md, docs/10_CHANGELOG.md, docs/11_DEVELOPMENT_LOG.md
Reason: The common profile and role onboarding screens were bouncing each other through automatic redirects, and the common profile confirmation block had corrupted Korean strings, so both screens were stabilized with explicit continuation screens and safe escaped copy.

Date: 2026-03-17
AI Tool: Codex
Task: Make role onboarding screen scrollable on mobile
Files Changed: src/app/(onboarding)/role-onboarding.tsx, docs/09_AI_TASK_LOG.md, docs/10_CHANGELOG.md, docs/11_DEVELOPMENT_LOG.md
Reason: The role-specific onboarding screen used a fixed View layout, so users could not scroll down to lower fields or buttons on mobile devices.

Date: 2026-03-17
AI Tool: Codex
Task: Rewrite role-onboarding screen with escaped Korean copy to eliminate question-mark text corruption
Files Changed: src/app/(onboarding)/role-onboarding.tsx, docs/09_AI_TASK_LOG.md, docs/10_CHANGELOG.md, docs/11_DEVELOPMENT_LOG.md
Reason: The role onboarding screen had actual `???` strings saved into the source file, so it was rewritten with unicode-escaped copy to prevent repeated encoding corruption.


- 2026-03-17: 홈/프로필 자동 리디렉션을 제거하고 버튼형 온보딩 진입으로 변경. role-onboarding에 상의 사이즈/발 사이즈 콤보박스 추가 및 문자열 복구 작업 진행.
- [2026-03-17] Fixed broken tab/onboarding source files by rewriting [src/app/(tabs)/index.tsx], [src/app/(onboarding)/create-profile.tsx], and [src/services/profile.service.ts] to remove corrupted strings and invalid escaped quotes.

## 2026-03-17 - Vietnam region dataset expansion and validation alignment
- Expanded static Vietnam province/district option coverage in `src/constants/profile-options.ts`.
- Replaced corrupted option labels with stable ASCII/Korean-safe values.
- Aligned Edge Function shared region validation with the same province/district codes.
- Normalized shared validation error messages to stable English output for debugging.
- Note: MVP still remains Vietnam-only per the current approved docs.
