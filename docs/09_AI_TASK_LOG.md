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


- 2026-03-17: í™ˆ/í”„ë¡œí•„ ìžë™ ë¦¬ë””ë ‰ì…˜ì„ ì œê±°í•˜ê³  ë²„íŠ¼í˜• ì˜¨ë³´ë”© ì§„ìž…ìœ¼ë¡œ ë³€ê²½. role-onboardingì— ìƒì˜ ì‚¬ì´ì¦ˆ/ë°œ ì‚¬ì´ì¦ˆ ì½¤ë³´ë°•ìŠ¤ ì¶”ê°€ ë° ë¬¸ìžì—´ ë³µêµ¬ ìž‘ì—… ì§„í–‰.
- [2026-03-17] Fixed broken tab/onboarding source files by rewriting [src/app/(tabs)/index.tsx], [src/app/(onboarding)/create-profile.tsx], and [src/services/profile.service.ts] to remove corrupted strings and invalid escaped quotes.

## 2026-03-17 - Vietnam region dataset expansion and validation alignment
- Expanded static Vietnam province/district option coverage in `src/constants/profile-options.ts`.
- Replaced corrupted option labels with stable ASCII/Korean-safe values.
- Aligned Edge Function shared region validation with the same province/district codes.
- Normalized shared validation error messages to stable English output for debugging.
- Note: MVP still remains Vietnam-only per the current approved docs.
- Expanded district coverage substantially for major Vietnam cities/provinces such as HCM, Hanoi, Da Nang, Hue, Hai Phong, Can Tho, Binh Duong, Dong Nai, Ba Ria-Vung Tau, Khanh Hoa, Lam Dong, Dak Lak, Quang Ninh, and Mekong provinces.
- Kept client region options and Edge Function region validation in sync to avoid province/district mismatch errors.

- 2026-03-18 ìž‘ì—…: ë² íŠ¸ë‚¨ ì§€ì—­ ë°ì´í„° ì†ŒìŠ¤ë¥¼ shared/regions/vietnam-regions.ts ê³µìš© seed ëª¨ë“ˆë¡œ í†µí•©. ì•± ì˜µì…˜ê³¼ Edge Function region validationì´ ë™ì¼í•œ province/district ì½”ë“œì…‹ì„ ì°¸ì¡°í•˜ë„ë¡ ì •ë¦¬í•˜ê³ , ì£¼ìš” ë„ì‹œ/ì„± district coverageë¥¼ ì¶”ê°€ í™•ìž¥.

- 2026-03-18 ìž‘ì—…: ì™¸ë¶€ ë² íŠ¸ë‚¨ ì§€ì—­ APIë¥¼ runtimeì— ì§ì ‘ ì—°ê²°í•˜ì§€ ì•Šê³ , provider snapshotì„ ë‚´ë¶€ì— ê°€ì ¸ì˜¤ëŠ” scripts/sync-vietnam-regions.mjs ì¶”ê°€. shared/regions/vietnam-regions.provider.json ìƒì„± ê²½ë¡œì™€ 
pm run regions:sync ì‹¤í–‰ ìŠ¤í¬ë¦½íŠ¸ ì¶”ê°€.
- 2026-03-18 ìž‘ì—…: Phase 2 ì˜¨ë³´ë”© ì•ˆì •í™”. `src/lib/onboarding.ts`ë¥¼ ì¶”ê°€í•´ ê³µí†µ í”„ë¡œí•„/ì—­í•  ì˜¨ë³´ë”© ì™„ë£Œ ìƒíƒœë¥¼ í•œ ê³³ì—ì„œ ê³„ì‚°í•˜ë„ë¡ ì •ë¦¬í–ˆê³ , `useProfile`ì´ ê°™ì€ ê¸°ì¤€ìœ¼ë¡œ `pendingRoleOnboarding`, `onboardingStep`, `nextOnboardingRoute`ë¥¼ ì œê³µí•˜ë„ë¡ ìˆ˜ì •í–ˆë‹¤. `phone-verify`, `create-profile`, `settings/*` í™”ë©´ì€ ìžë™ ë¦¬ë””ë ‰ì…˜ ëŒ€ì‹  ë²„íŠ¼ ê¸°ë°˜ ì§„í–‰ íë¦„ìœ¼ë¡œ ë°”ê¿¨ë‹¤.
- 2026-03-19 ìž‘ì—…: settings ë©”ì¸ í™”ë©´ì„ ScrollView êµ¬ì¡°ë¡œ ìž¬êµ¬ì„±í•´ ëª¨ë°”ì¼ì—ì„œ í•˜ë‹¨ ì¹´ë“œì™€ ë²„íŠ¼ê¹Œì§€ ìŠ¤í¬ë¡¤ ê°€ëŠ¥í•˜ë„ë¡ ìˆ˜ì •.
Date: 2026-03-20
AI Tool: Codex
Task: Align backend and profile client structure with FootGo v2.0 docs
Files Changed: supabase/migrations/010_create_user_devices.sql, supabase/migrations/011_apply_user_devices_and_avatar_storage_policies.sql, supabase/functions/_shared/auth.ts, supabase/functions/_shared/types.ts, supabase/functions/create-profile/index.ts, supabase/functions/upload-avatar/index.ts, supabase/config.toml, src/types/profile.types.ts, src/services/profile.service.ts, src/hooks/useProfile.ts, docs/09_AI_TASK_LOG.md, docs/10_CHANGELOG.md, docs/11_DEVELOPMENT_LOG.md
Reason: V2.0 docs added user_devices, avatar upload via Edge Function, avatars Storage bucket/policy requirements, and stricter profile/avatar API structure. The codebase was missing those backend pieces and still had stale/garbled profile state messages.
Date: 2026-03-21
AI Tool: Codex
Task: Re-review KickGo v3.1 docs and align schema/profile/settings implementation with the revised document set
Files Changed: supabase/migrations/010_create_user_devices.sql, supabase/migrations/011_apply_user_devices_and_avatar_storage_policies.sql, supabase/migrations/012_align_kickgo_v3_1_core_schema.sql, supabase/migrations/013_apply_kickgo_v3_1_additional_policies.sql, supabase/functions/_shared/types.ts, supabase/functions/_shared/validation.ts, supabase/functions/create-profile/index.ts, supabase/functions/update-profile/index.ts, supabase/functions/update-profile-visibility/index.ts, supabase/config.toml, src/types/profile.types.ts, src/services/profile.service.ts, src/hooks/useProfile.ts, src/app/(settings)/_layout.tsx, src/app/(settings)/settings.tsx, src/app/(settings)/visibility.tsx, src/app/(settings)/notifications.tsx, src/app/(settings)/account.tsx, src/app/(tabs)/index.tsx, src/app/(auth)/signup.tsx, src/types/global.d.ts, tsconfig.json, app.json, docs/09_AI_TASK_LOG.md, docs/10_CHANGELOG.md, docs/11_DEVELOPMENT_LOG.md
Reason: The revised KickGo v3.1 docs added profiles.visibility, referee aggregate fields, governance/support tables, visibility settings, user_devices/avatar alignment, and a broader settings structure. The previous implementation still reflected older FootGo/V2 assumptions and had a migration gap around currency_formats and player_team_history.
[2026-03-23] user_consents ìš°ì„  êµ¬í˜„ ì‹œìž‘.
- migration 014_add_user_consents_update_policy.sql ì¶”ê°€
- Edge Function record-consent ì¶”ê°€
- create-profile í™”ë©´ì— í•„ìˆ˜ privacy / optional marketing consent ì—°ê²°
- Settings > Account í™”ë©´ì—ì„œ consent ìƒíƒœ ì¡°íšŒ/ë³€ê²½ ì—°ê²°
- phone OTP ëŠ” í›„ì†ìœ¼ë¡œ ìœ ì§€Date: 2026-03-23
AI Tool: Codex
Task: Stabilize Phase 2 language switching, common profile cancel flow, and session timeout behavior
Files Changed: src/core/i18n/translations.ts, src/components/LanguageSwitcher.tsx, src/app/(onboarding)/create-profile.tsx, src/app/(onboarding)/role-onboarding.tsx, src/app/(settings)/language.tsx, docs/09_AI_TASK_LOG.md, docs/10_CHANGELOG.md, docs/11_DEVELOPMENT_LOG.md
Reason: The login-language selection structure already existed partially, but translations were corrupted, onboarding screens were mixing languages, Settings language save did not update the local language provider, and common profile edit mode lacked a cancel action. Session timeout remained enabled globally through SessionTimeoutGate.Date: 2026-03-23
AI Tool: Codex
Task: Convert auth language selection to combo box and stabilize broken Vietnamese strings
Files Changed: src/components/LanguageSwitcher.tsx, src/constants/profile-options.ts, src/core/i18n/translations.ts, docs/09_AI_TASK_LOG.md, docs/10_CHANGELOG.md, docs/11_DEVELOPMENT_LOG.md
Reason: The chip-style language selector was less consistent with the rest of the form UI, and Vietnamese translation text was rendering corrupted on-device. The auth language selector was rebuilt on top of SelectField, and translation text was rewritten using stable ASCII or Unicode-escaped strings.
## 2026-03-23 - Global i18n propagation and 30-minute auto sign-out
- Localized auth/onboarding/settings/tab layout titles through the shared LanguageProvider.
- Added global profile-language sync inside useProfile so stored preferred_language updates the entire app after profile load.
- Added common translation keys for loading/home and switched the login language selector to the shared combo-box pattern.
- Reduced SessionTimeoutGate absolute sign-out window from 12 hours to 30 minutes.

## 2026-03-23 - Vietnamese labels and settings language save behavior
- Rewrote src/constants/profile-options.ts to restore readable Korean labels and accented Vietnamese option labels.
- Updated src/app/(settings)/language.tsx so saving a new language applies the local app language immediately before returning to the previous screen.
- Refreshed visible Vietnamese translation copy for auth, home, and settings screens so the main login/settings flows no longer render tone-less placeholders.

- 2026-03-23: iPhone Vietnamese glyph rendering issue ëŒ€ì‘ì„ ìœ„í•´ Times New Roman ê¸°ë°˜ ì „ì—­ í°íŠ¸ ì ìš©. root layout, auth/onboarding/settings/tabs headers, tab labels, PrimaryButton, SelectFieldì— ê³µí†µ typography helper ì—°ê²°.

- 2026-03-23: VI translations block re-written in UTF-8 to recover broken Vietnamese strings from login/onboarding/settings screens after font change.

- 2026-03-23: Removed per-screen preferred_language back-sync from useProfile to stop Settings language changes from being overwritten by stale profile state. Login screen converted to KeyboardAvoidingView + ScrollView so first auth screen can scroll on mobile.
Date: 2026-03-23
AI Tool: Codex
Task: Fix settings language propagation and make the first login screen scrollable
Files Changed: src/hooks/useProfile.ts, src/app/(auth)/login.tsx, docs/09_AI_TASK_LOG.md, docs/10_CHANGELOG.md, docs/11_DEVELOPMENT_LOG.md
Reason: Settings language changes were being overwritten by stale profile-driven language sync from individual useProfile instances, and the first auth screen did not scroll correctly on mobile when the keyboard was open.
Date: 2026-03-23
AI Tool: Codex
Task: Implement avatar upload UI on the profile tab
Files Changed: package.json, package-lock.json, src/types/profile.types.ts, src/services/profile.service.ts, src/hooks/useProfile.ts, src/app/(tabs)/profile.tsx, docs/09_AI_TASK_LOG.md, docs/10_CHANGELOG.md, docs/11_DEVELOPMENT_LOG.md
Reason: KickGo v3.1 already had upload-avatar backend support, but users still could not select and upload a profile avatar from the app. Added expo-image-picker, a client upload path, and a profile-tab avatar preview/upload UI.
Date: 2026-03-24
AI Tool: Codex
Task: Hide avatar path text from the profile tab avatar card
Files Changed: src/app/(tabs)/profile.tsx, docs/09_AI_TASK_LOG.md, docs/10_CHANGELOG.md, docs/11_DEVELOPMENT_LOG.md
Reason: The avatar upload UI should not expose the raw stored avatar URL/path beside the preview. The avatar card now keeps the helper text and only shows a fallback message when no avatar exists.
Date: 2026-03-24
AI Tool: Codex
Task: Start Phase 3 team core with teams/team_members schema, create-team Edge Function, and a minimal teams tab flow
Files Changed: supabase/migrations/015_create_team_core_tables.sql, supabase/migrations/016_apply_team_core_policies.sql, supabase/functions/create-team/index.ts, supabase/config.toml, src/types/team.types.ts, src/constants/team-ui.ts, src/services/team.service.ts, src/hooks/useTeams.ts, src/app/_layout.tsx, src/app/(tabs)/_layout.tsx, src/app/(tabs)/teams.tsx, src/app/(team)/_layout.tsx, src/app/(team)/create.tsx, docs/09_AI_TASK_LOG.md, docs/10_CHANGELOG.md, docs/11_DEVELOPMENT_LOG.md
Reason: Phase 2 profile/settings work was stable enough to start the first Phase 3 slice. Added the minimum team core needed to create a team, store an owner membership, and show the current user's active teams inside the app without opening invites, announcements, or fee management yet.
Date: 2026-03-24
AI Tool: Codex
Task: Fix recursive team_members RLS policy after the first on-device team creation test
Files Changed: supabase/migrations/017_fix_team_member_policy_recursion.sql, src/app/(tabs)/teams.tsx, docs/09_AI_TASK_LOG.md, docs/10_CHANGELOG.md, docs/11_DEVELOPMENT_LOG.md
Reason: The initial team_members SELECT policy referenced public.team_members from inside its own USING clause, causing PostgreSQL to raise "infinite recursion detected in policy for relation team_members" when the Teams tab tried to load the current user's memberships. The fix narrows team_members reads to self rows only for this phase.

Date: 2026-03-24
AI Tool: Codex
Task: Add Phase 3 team invite code generation and invite-based team join flow
Files Changed: supabase/migrations/018_create_team_invites.sql, supabase/migrations/019_enable_team_invites_rls.sql, supabase/functions/create-team-invite/index.ts, supabase/functions/join-team/index.ts, supabase/config.toml, src/constants/team-ui.ts, src/services/team.service.ts, src/hooks/useTeams.ts, src/app/(team)/_layout.tsx, src/app/(team)/join.tsx, src/app/(tabs)/teams.tsx, docs/09_AI_TASK_LOG.md, docs/10_CHANGELOG.md, docs/11_DEVELOPMENT_LOG.md
Reason: Open the next Phase 3 slice after team creation by adding owner/manager invite code generation, invite-code team joining, and the minimum mobile UI to create codes and join teams without introducing recruitment, announcements, or fee flows yet.

Date: 2026-03-24
AI Tool: Codex
Task: Remove BOM from team invite migrations after Supabase db push parser failure
Files Changed: supabase/migrations/018_create_team_invites.sql, supabase/migrations/019_enable_team_invites_rls.sql, docs/09_AI_TASK_LOG.md
Reason: Supabase db push failed at the first byte of 018_create_team_invites.sql because the file had a UTF-8 BOM, so the new team invite migrations were re-encoded without BOM for Postgres compatibility.


Date: 2026-03-24
AI Tool: Codex
Task: Rebuild corrupted team i18n copy with safe Unicode escapes
Files Changed: src/constants/team-ui.ts, docs/09_AI_TASK_LOG.md
Reason: Team screens started rendering question marks because the shared team UI copy file had already been saved with corrupted KO/VI strings, so the team translation source was rewritten using Unicode escapes to make the strings stable across Windows encoding boundaries.


Date: 2026-03-24
AI Tool: Codex
Task: Add Phase 3 team detail screen and team member roster view
Files Changed: supabase/migrations/020_expand_team_member_reads.sql, src/types/team.types.ts, src/services/team.service.ts, src/hooks/useTeamDetail.ts, src/constants/team-ui.ts, src/app/(team)/_layout.tsx, src/app/(team)/[teamId].tsx, src/app/(tabs)/teams.tsx, docs/09_AI_TASK_LOG.md, docs/10_CHANGELOG.md, docs/11_DEVELOPMENT_LOG.md
Reason: Team creation and invite/join flows were already working, but users still could not inspect a team after joining. This change adds a dedicated team-detail route, a basic active-member roster, and a safe RLS expansion so active team members can read their own team roster without recursive policy evaluation.Date: 2026-03-24
AI Tool: Codex
Task: Reshape the team detail flow into a club dashboard skeleton and fix the team_members->profiles embed ambiguity
Files Changed: src/services/team.service.ts, src/constants/team-hub.ts, src/app/(team)/_layout.tsx, src/app/(team)/[teamId].tsx, src/app/(team)/match-create.tsx, src/app/(team)/match-detail.tsx, src/app/(team)/match-vote.tsx, src/app/(team)/match-lineup.tsx, docs/09_AI_TASK_LOG.md, docs/10_CHANGELOG.md, docs/11_DEVELOPMENT_LOG.md
Reason: The requested next structure moved beyond a plain team detail page into a club dashboard with match registration, voting, and lineup entry points. This update also fixes the PostgREST embed ambiguity between team_members and profiles by forcing the roster join through team_members_user_id_fkey, then adds UI skeleton routes for match create/detail/vote/lineup so the app structure can match the provided reference screens before the match backend exists.
Date: 2026-03-24
AI Tool: Codex
Task: Localize the new club/match skeleton screens consistently and make quarter-based screens depend on the selected quarter count
Files Changed: src/constants/team-hub.ts, src/app/(team)/[teamId].tsx, src/app/(team)/match-create.tsx, src/app/(team)/match-detail.tsx, src/app/(team)/match-vote.tsx, src/app/(team)/match-lineup.tsx, docs/09_AI_TASK_LOG.md, docs/10_CHANGELOG.md, docs/11_DEVELOPMENT_LOG.md
Reason: The first pass left the new club/match screens mixed between Korean and English and hardcoded quarter navigation to only Q1/Q2. This pass moved the visible labels into the shared team-hub copy and propagated quarterCount/quarterMinutes from match creation into match detail, vote, and lineup so the structure can handle 2/3/4-quarter amateur match formats.Date: 2026-03-24
AI Tool: Codex
Task: Add the first persisted match slice with match schema, create-match Edge Function, match service/hooks, and saved match detail reads
Files Changed: supabase/migrations/021_create_match_core_tables.sql, supabase/migrations/022_apply_match_core_policies.sql, supabase/functions/create-match/index.ts, supabase/config.toml, src/types/match.types.ts, src/services/match.service.ts, src/hooks/useTeamMatches.ts, src/hooks/useMatchDetail.ts, src/app/(team)/_layout.tsx, src/app/(team)/[teamId].tsx, src/app/(team)/match-create.tsx, src/app/(team)/match-detail.tsx, src/constants/team-hub.ts, docs/09_AI_TASK_LOG.md, docs/10_CHANGELOG.md, docs/11_DEVELOPMENT_LOG.md
Reason: The club dashboard and match screens were already in place as UI skeletons, but nothing was persisted yet. This step adds the first saved match path, creates an attendance poll with each match, and lets the team detail screen read back the latest saved match and attendance summary.Date: 2026-03-24
AI Tool: Codex
Task: Rebuild the login screen using local main/logo assets and a hero-style action layout
Files Changed: src/app/(auth)/login.tsx, docs/09_AI_TASK_LOG.md, docs/10_CHANGELOG.md, docs/11_DEVELOPMENT_LOG.md
Reason: The user wanted the first attached soccer image concept applied to the login screen. The implementation now uses src/assets/images/main.png as the full-screen hero background, src/assets/images/logo.png in the upper sky area, and a large stacked CTA layout inspired by the provided reference while preserving existing email and Google login flows.
Date: 2026-03-24
AI Tool: Codex
Task: Refine login hero screen by removing the logo, splitting email sign-in into its own view, replacing footer links with customer center, and adding Facebook/Zalo CTA buttons with richer icons
Files Changed: src/app/(auth)/login.tsx, docs/09_AI_TASK_LOG.md, docs/10_CHANGELOG.md, docs/11_DEVELOPMENT_LOG.md
Reason: The first hero redesign still kept the logo and mixed the email form directly into the main CTA stack. This pass removes the logo, turns email sign-in into a dedicated in-screen view, swaps the footer utility links to a customer-center entry, and adds richer Facebook/Zalo/Google/email CTA buttons using Expo-provided vector icons.

Date: 2026-03-24
AI Tool: Codex
Task: Rebuild Expo Router route structure to match the updated v3.1/v1.3 documents with placeholder screens only
Files Changed: legacy/app_20260324_router_rebuild (backup), src/app/**/*, src/shared/components/RoutePlaceholder.tsx, docs/09_AI_TASK_LOG.md, docs/10_CHANGELOG.md, docs/11_DEVELOPMENT_LOG.md
Reason: The updated Tech Spec, Coding Rules, and Screen Spec changed the Expo Router group structure significantly. The existing app routes were backed up outside src and a new placeholder-only router tree was created first so future implementation can proceed on the correct folder/file structure.


Date: 2026-03-24
AI Tool: Codex
Task: Implement the role switcher system with Zustand, a side drawer, and role-based bottom tab composition
Files Changed: package.json, package-lock.json, src/store/role-switch.store.ts, src/constants/role-switcher.ts, src/shared/components/RoleSwitcherDrawer.tsx, src/app/(tabs)/_layout.tsx, src/app/(tabs)/schedule.tsx, src/app/(tabs)/match-control.tsx, src/app/(tabs)/revenue.tsx, src/app/(tabs)/booking-management.tsx, src/app/(tabs)/facility-management.tsx, docs/09_AI_TASK_LOG.md, docs/10_CHANGELOG.md, docs/11_DEVELOPMENT_LOG.md
Reason: The updated Screen Spec requires a left-side role switch drawer and different bottom-tab sets for player, referee, and facility manager modes. This change adds a persisted activeRole store, a slide-in drawer component, and dynamic Tabs rendering that swaps the five-tab composition immediately when the active role changes.


Date: 2026-03-24
AI Tool: Codex
Task: Finalize the role switcher system with cleaned multilingual labels, a left-side drawer menu, and a privacy-policy placeholder route
Files Changed: src/constants/role-switcher.ts, src/shared/components/RoleSwitcherDrawer.tsx, src/app/(settings)/_layout.tsx, src/app/(settings)/privacy-policy.tsx, docs/09_AI_TASK_LOG.md, docs/10_CHANGELOG.md, docs/11_DEVELOPMENT_LOG.md
Reason: The route skeleton already had a first pass of role switching, but the role/tab copy and drawer menu needed to be aligned to the updated Screen Spec. This pass stabilizes the Zustand-based activeRole flow, cleans the tab labels, and adds the missing privacy policy destination used by the side drawer menu.
Date: 2026-03-24
AI Tool: Codex
Task: Implement Screen Spec 5-3-A team chat with Supabase Realtime, React Query, and upward infinite scroll
Files Changed: supabase/migrations/023_create_team_chat_core.sql, supabase/migrations/024_apply_team_chat_policies.sql, src/core/query/QueryProvider.tsx, src/core/i18n/team-chat-copy.ts, src/types/team-chat.types.ts, src/services/team-chat.service.ts, src/hooks/useTeamChat.ts, src/app/_layout.tsx, src/app/(team)/[teamId]/chat.tsx, docs/09_AI_TASK_LOG.md, docs/10_CHANGELOG.md, docs/11_DEVELOPMENT_LOG.md
Reason: The updated Screen Spec requires a realtime team chat tab that uses service-layer Supabase access, React Query server state, and upward infinite scroll for older messages. This change adds the persisted chat table and storage bucket, wraps the app in a QueryClient provider, implements a service + hook pair using React Query and Supabase Realtime, and replaces the team chat placeholder route with a working chat screen.

Date: 2026-03-24
AI Tool: Codex
Task: Remove the root splash placeholder and restore actual start/login/home routing
Files Changed: src/app/index.tsx, src/app/(auth)/login.tsx, src/app/(tabs)/home.tsx, docs/09_AI_TASK_LOG.md, docs/10_CHANGELOG.md, docs/11_DEVELOPMENT_LOG.md
Reason: The rebuilt Expo Router tree still left `/`, `/(auth)/login`, and `/(tabs)/home` as placeholders, so the app opened to a dummy splash card instead of a real start flow. The root route now redirects into the tabs home entry, and both login/home routes were restored as functional screens.

Date: 2026-03-24
AI Tool: Codex
Task: Restore the hero login screen and replace placeholder main tabs with actual screens or real empty states
Files Changed: src/app/(auth)/login.tsx, src/app/(tabs)/team.tsx, src/app/(tabs)/profile.tsx, src/app/(tabs)/social.tsx, src/app/(tabs)/search.tsx, src/app/(tabs)/schedule.tsx, src/app/(tabs)/match-control.tsx, src/app/(tabs)/revenue.tsx, src/app/(tabs)/booking-management.tsx, src/app/(tabs)/facility-management.tsx, src/shared/components/FeatureEmptyStateScreen.tsx, src/constants/role-switcher.ts, docs/09_AI_TASK_LOG.md, docs/10_CHANGELOG.md, docs/11_DEVELOPMENT_LOG.md
Reason: The rebuilt router tree had left most non-home tabs on the RoutePlaceholder card, and a later restore pass had overwritten the previously designed hero-style login screen. This change restores the hero login flow with the `main.png` background and email sub-view, revives the actual team/profile tabs from the legacy app backup, and replaces the remaining role-based tab placeholders with real empty-state dashboards.

Date: 2026-03-24
AI Tool: Codex
Task: Restore the settings stack from placeholders to working screens
Files Changed: src/app/(settings)/_layout.tsx, src/app/(settings)/settings.tsx, src/app/(settings)/language.tsx, src/app/(settings)/region.tsx, src/app/(settings)/roles.tsx, src/app/(settings)/notifications.tsx, src/app/(settings)/visibility.tsx, src/app/(settings)/privacy-policy.tsx, docs/09_AI_TASK_LOG.md, docs/10_CHANGELOG.md, docs/11_DEVELOPMENT_LOG.md
Reason: After the router skeleton rebuild, the settings main screen and several destinations still rendered the generic RoutePlaceholder card. This pass restores the working settings screens from the legacy backup and replaces the privacy-policy route with a real static policy info screen so settings navigation no longer falls back to placeholders.

Date: 2026-03-24
AI Tool: Codex
Task: Route logout and unauthenticated redirects through the app start route
Files Changed: src/app/index.tsx, src/shared/components/RoleSwitcherDrawer.tsx, src/components/SessionTimeoutGate.tsx, src/app/(settings)/settings.tsx, src/app/(settings)/language.tsx, src/app/(settings)/region.tsx, src/app/(settings)/roles.tsx, src/app/(settings)/visibility.tsx, src/app/(tabs)/team.tsx, src/app/(tabs)/profile.tsx, docs/09_AI_TASK_LOG.md, docs/10_CHANGELOG.md, docs/11_DEVELOPMENT_LOG.md
Reason: Logout and auth guards were sending the user directly to `/(auth)/login`, which bypassed the root start flow and surfaced the wrong screen. The root route now chooses the correct start destination based on auth state, and logout/session-timeout/auth-guard redirects now consistently return to `/` first.
Date: 2026-03-24
AI Tool: Codex
Task: Replace the team-detail placeholder and rebuild the player profile screen with a real dashboard layout
Files Changed: src/app/(tabs)/profile/index.tsx, src/app/(tabs)/profile.tsx, src/app/(team)/[teamId]/home.tsx, src/app/(team)/[teamId]/index.tsx, src/app/(team)/[teamId]/_layout.tsx, src/hooks/usePlayerProfileDashboard.ts, src/hooks/useTeamDetailQuery.ts, src/shared/components/ProfileRadarChart.tsx, src/constants/profile-dashboard.ts, src/constants/role-switcher.ts, docs/09_AI_TASK_LOG.md, docs/10_CHANGELOG.md, docs/11_DEVELOPMENT_LOG.md
Reason: The team detail route was still surfacing a placeholder and the player profile tab needed to be rebuilt to match the updated Screen Spec with a dark hero header, stats card, team CTA card, and a radar-style skill card. This pass restores the team detail route as a real screen, adds query hooks for the team/profile dashboard, and replaces the old profile tab with a design-driven player profile layout.

- 2026-03-24: Added player weak-foot skill and play-style profile sections, created play-style screen, and extended update-player-profile flow plus migration 025 for new player profile fields.
Date: 2026-03-25
AI Tool: Codex
Task: Implement the 3-step team creation flow, fix the newly added team-create copy corruption, and deploy the backend changes
Files Changed: src/constants/team-create.ts, src/shared/regions/vietnam-regions.ts, src/app/(team)/_layout.tsx, src/app/(team)/create/_layout.tsx, src/app/(team)/create/index.tsx, src/app/(team)/create/schedule.tsx, src/app/(team)/create/tactics.tsx, src/app/(team)/create/complete.tsx, src/services/team.service.ts, legacy/router_backup/team-create.tsx, supabase/migrations/026_expand_team_schema_for_create_flow.sql, supabase/migrations/027_create_team_assets_bucket.sql, supabase/functions/create-team/index.ts, supabase/functions/upload-team-asset/index.ts, docs/09_AI_TASK_LOG.md, docs/10_CHANGELOG.md, docs/11_DEVELOPMENT_LOG.md
Reason: The previous single-step team create screen did not match the updated KickGo documents or screen spec, and the newly added team-create slice had corrupted copy. The flow is now rebuilt into three routed steps plus a complete screen, backed by Zustand draft state, react-hook-form + zod, team emblem/photo upload through an Edge Function, and a final create-team submit on step 3. Remote Supabase migrations were pushed and the create-team/upload-team-asset functions were deployed. A curl smoke test against create-team returned the expected authenticated error response, confirming the live endpoint is responding.

- 2026-03-25: Restored /(team)/join screen from placeholder to working invite-code join flow and fixed team stack join title.
Date: 2026-03-25
AI Tool: Codex
Task: Redesign the team list screen to match the team detail visual language
Files Changed: src/app/(tabs)/team.tsx, docs/09_AI_TASK_LOG.md, docs/10_CHANGELOG.md, docs/11_DEVELOPMENT_LOG.md
Reason: The old team list still used the heavy beige background, top CTA buttons, and text-first cards. The screen now uses a white background, dark hero team cards, a 2x2 action grid, a FAB with a bottom sheet for create/join actions, and a centered empty state while keeping the existing team fetch logic intact.
Date: 2026-03-25
AI Tool: Codex
Task: Replace the team match calendar placeholder with a real match list screen
Files Changed: src/app/(team)/[teamId]/matches.tsx, src/app/(team)/[teamId]/_layout.tsx, docs/09_AI_TASK_LOG.md, docs/10_CHANGELOG.md, docs/11_DEVELOPMENT_LOG.md
Reason: The team match calendar route was still rendering a placeholder. It now uses the existing team detail and match hooks to show grouped match cards, attendance summaries, and empty/error states, while the team detail stack titles were also cleaned up.
Date: 2026-03-25
AI Tool: Codex
Task: Implement the KickGo home screen with section-based React Query cards and replace the old gate-style tab home screen
Files Changed: src/app/(tabs)/home.tsx, src/app/(tabs)/_layout.tsx, src/features/home/home-copy.ts, src/features/home/components/HomeNextMatch.tsx, src/features/home/components/HomePendingActions.tsx, src/features/home/components/HomeRecentResults.tsx, src/features/home/components/HomeRegionRank.tsx, src/features/home/components/HomePopularShorts.tsx, src/features/home/components/HomeMyTeams.tsx, src/constants/role-switcher.ts, docs/09_AI_TASK_LOG.md, docs/10_CHANGELOG.md, docs/11_DEVELOPMENT_LOG.md
Reason: The tabs home route was still a simple auth/profile gate screen and did not follow the updated Screen Spec. The home tab now uses section-level React Query data, a custom top bar, fallback banners, quick actions, next match, team chips, pending actions, recent results, region rank, and popular shorts while keeping failures isolated by section instead of using one global spinner.

Date: 2026-03-25
AI Tool: Codex
Task: Replace the team-find placeholder path and make remaining placeholder screens back-navigable
Files Changed: src/app/(team)/find.tsx, src/app/(team)/_layout.tsx, src/app/(tabs)/profile/index.tsx, src/hooks/useTeamSearchQuery.ts, src/services/team.service.ts, src/shared/components/RoutePlaceholder.tsx, docs/09_AI_TASK_LOG.md, docs/10_CHANGELOG.md, docs/11_DEVELOPMENT_LOG.md
Reason: The profile dashboard still routed "íŒ€ ì°¾ê¸°" into a placeholder path, and many unfinished routes trapped the user without a working back action. Added a real public team search screen, pointed the team-find CTA to it, and rebuilt the shared placeholder component into a neutral coming-soon screen with back/home actions.
Date: 2026-03-25
AI Tool: Codex
Task: Fix placeholder route traps across the app and replace the team-find placeholder with a real search screen
Files Changed: src/app/(team)/find.tsx, src/app/(team)/_layout.tsx, src/hooks/useTeamSearchQuery.ts, src/services/team.service.ts, src/shared/components/RoutePlaceholder.tsx, src/app/(tabs)/profile/index.tsx, docs/09_AI_TASK_LOG.md, docs/10_CHANGELOG.md, docs/11_DEVELOPMENT_LOG.md
Reason: The app still had many placeholder routes and some of them trapped navigation without a usable back path. Rebuilt the shared placeholder screen with back/home actions, repaired the broken team route files, and replaced the team-find placeholder with a real public team search screen.
Date: 2026-03-25
AI Tool: Codex
Task: Fix the role-switch navigation warning when switching to facility_manager
Files Changed: src/shared/components/RoleSwitcherDrawer.tsx, docs/09_AI_TASK_LOG.md, docs/10_CHANGELOG.md, docs/11_DEVELOPMENT_LOG.md
Reason: Role switching was dispatching a direct replace into the tabs home route while the tab tree was being rebuilt for the new role, which caused a REPLACE action warning in development. Changed role switching to return through the root route first so auth/root routing can safely land on the current home screen.
Date: 2026-03-25
AI Tool: Codex
Task: Remove the extra top gap above the profile dark header
Files Changed: src/app/(tabs)/profile/index.tsx, docs/09_AI_TASK_LOG.md, docs/10_CHANGELOG.md, docs/11_DEVELOPMENT_LOG.md
Reason: The profile tab was applying a top SafeArea inset even though the tabs navigator already rendered the top header, which created a large gray gap between the title bar and the dark profile hero. Limited the screen SafeArea to the bottom edge only.

Date: 2026-03-25
AI Tool: Codex
Task: Add role-based profile branching for player, referee, and facility manager dashboards
Files Changed: src/app/(tabs)/profile/index.tsx, src/components/profile/PlayerProfile.tsx, src/components/profile/FacilityManagerProfile.tsx, src/components/profile/RefereeProfile.tsx, src/components/profile/ProfileHeroHeader.tsx, src/components/profile/profileShared.ts, src/hooks/useFacilityManagerProfile.ts, src/hooks/useRefereeProfileDashboard.ts, src/store/role-switch.store.ts, src/app/(referee)/availability.tsx, src/app/(facility)/notice-create.tsx, src/app/(facility)/_layout.tsx, src/app/(facility)/[facilityId]/index.tsx, docs/09_AI_TASK_LOG.md
Reason: Split profile UI by active role so facility managers and referees no longer see the player profile screen, and remove placeholder blockers on immediate role-specific routes.


- 2026-03-25: È¨ QuickActions¸¦ activeRole ±â¹ÝÀ¸·Î ºÐ±âÇÏ°í ¿ªÇÒº° ½ÇÁ¦ ¶ó¿ìÆ®¸¦ ¿¬°áÇÔ.

- 2026-03-25: HomeQuickActions ÇÑ±Û ¶óº§À» À¯´ÏÄÚµå ÀÌ½ºÄÉÀÌÇÁ·Î ÀçÀúÀåÇØ ºü¸¥ ½ÇÇà ÅØ½ºÆ® ±úÁüÀ» ¼öÁ¤ÇÔ.

- 2026-03-25: È¨ ¿Âº¸µù Ä«µå ÆÇÁ¤À» activeRole ±â¹Ý useOnboardingStatus ÈÅÀ¸·Î ºÐ¸®ÇÏ°í, facility_manager´Â ¿Âº¸µù Ä«µå ´ë½Å ¿îµ¿Àå µî·Ï CTA¸¸ º¸ÀÌµµ·Ï ¼öÁ¤ÇÔ.
- 2026-03-25: /(onboarding)/player, /(onboarding)/referee ½ÇÈ­¸éÀ» Ãß°¡ÇØ ½ÉÆÇ µî·Ï°ú ¼±¼ö ÇÁ·ÎÇÊ ÁøÀÔ °æ·Î°¡ placeholder·Î ºüÁöÁö ¾Ê°Ô ÇÔ.

- 2026-03-25: È¨ ¿Âº¸µù Ä«µå ÆÇÁ¤À» activeRole ±â¹Ý useOnboardingStatus ÈÅÀ¸·Î ºÐ¸®ÇÏ°í, facility_manager´Â ¿Âº¸µù Ä«µå ´ë½Å ¿îµ¿Àå µî·Ï CTA¸¸ º¸ÀÌµµ·Ï ¼öÁ¤ÇÔ.
- 2026-03-25: /(onboarding)/player, /(onboarding)/referee ½ÇÈ­¸éÀ» Ãß°¡ÇØ ½ÉÆÇ µî·Ï°ú ¼±¼ö ÇÁ·ÎÇÊ ÁøÀÔ °æ·Î°¡ placeholder·Î ºüÁöÁö ¾Ê°Ô ÇÔ.

- 2026-03-25: È¨ ¿Âº¸µù Ä«µå ÆÇÁ¤À» activeRole ±â¹Ý useOnboardingStatus ÈÅÀ¸·Î ºÐ¸®ÇÏ°í, facility_manager´Â ¿Âº¸µù Ä«µå ´ë½Å ¿îµ¿Àå µî·Ï CTA¸¸ º¸ÀÌµµ·Ï ¼öÁ¤ÇÔ.
- 2026-03-25: /(onboarding)/player, /(onboarding)/referee ½ÇÈ­¸éÀ» Ãß°¡ÇØ ½ÉÆÇ µî·Ï°ú ¼±¼ö ÇÁ·ÎÇÊ ÁøÀÔ °æ·Î°¡ placeholder·Î ºüÁöÁö ¾Ê°Ô ÇÔ.
