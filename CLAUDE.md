# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Start dev server (choose platform)
npm run start          # Expo dev server (scan QR with Expo Go or dev build)
npm run android        # Android emulator
npm run ios            # iOS simulator

# TypeScript type check (no build output) ??run after any code change
npx tsc --noEmit

# Sync Vietnam region data from external source
npm run regions:sync

# Supabase local dev
npx supabase start     # Start local Supabase stack (Docker required)
npx supabase db push   # Apply pending migrations to local DB
npx supabase functions serve <function-name>  # Run a single edge function locally
```

There are no automated tests. TypeScript (`npx tsc --noEmit`) is the primary correctness check ??always run it after changes.

## Architecture Overview

### Stack
- **Expo SDK 54 / expo-router v6** ??file-based routing with nested Stack + Tabs navigators
- **React Native 0.81** with `react-native-mmkv` (fast sync storage) and `AsyncStorage` (language pref)
- **Supabase** ??Auth, Postgres (RLS), Storage, Edge Functions (Deno)
- **TanStack Query v5** ??all server state; no Redux
- **Zustand v5** ??client-only state (auth session, bootstrap data, active role, drawer open/close)
- **Zod + react-hook-form** ??form validation
- **i18n** ??custom `LanguageProvider` + per-feature `copy` functions (no external i18n library)

### Route Structure

```
src/app/
  index.tsx                  ??redirects to /(auth)/login or /(tabs)/home
  _layout.tsx                ??root Stack; wraps LanguageProvider > AppQueryProvider > SafeAreaProvider > BootstrapInitializer
  (auth)/                    ??login, email-login, email-signup, phone-verify, consent, faq
  (onboarding)/              ??create-profile, player, referee onboarding
  (tabs)/                    ??bottom tab navigator (role-driven, see below)
    home.tsx
    team/                    ??nested Stack; team list + team detail sub-screens
      index.tsx              ??team list
      [teamId]/              ??nested Stack with TeamDetailTopHeader as custom header
        index.tsx            ??team home tab
        members.tsx          ??team members tab
        matches.tsx          ??match calendar tab
        announcements.tsx    ??announcements tab
        fee.tsx              ??fee management tab
        applicants.tsx       ??recruitment applicants (sub-screen, still uses TeamDetailTopHeader)
        ...
    profile/
    search/                  ??mercenary discovery list + mercenary detail route
    social.tsx, schedule.tsx, match-control.tsx, revenue.tsx, ...
```

### Bootstrap & Auth Flow

On app start, `BootstrapInitializer` blocks rendering until:
1. `useAuthStore` resolves the Supabase session
2. `useBootstrap` fetches `get_my_bootstrap` RPC (profile + account_types + role-specific profiles)

`BootstrapData` is cached in `useBootstrapStore` (Zustand) and in `bootstrap-cache.ts` (MMKV). The root `index.tsx` then redirects based on auth state.

### Role-Based Tabs

`src/constants/role-switcher.ts` defines which tabs are visible per `AccountType` (`player` | `referee` | `facility_manager`). `(tabs)/_layout.tsx` uses `getRoleTabs(language, activeRole)` to render only the relevant tabs and hides the rest with `href: null`. The active role is stored in `useRoleSwitchStore`.

### i18n Pattern

Every feature has a dedicated copy file (e.g., `src/features/team-shell.copy.ts`) that re-exports from `src/core/i18n/ko.ts` | `vi.ts` | `en.ts`. The pattern is:

```ts
// In a screen/component:
const { language } = useI18n();
const copy = getTeamShellCopy(language);
// use copy.someKey
```

`useI18n()` also exposes `t(key)` for the global translation table. **Never hardcode UI strings; always add to all three locale files.**

### Team Detail Header

`TeamDetailTopHeader` (`src/features/team-shell/components/TeamDetailTopHeader.tsx`) is a custom header component that renders the dark team identity bar + horizontal tab strip. It is registered in `[teamId]/_layout.tsx` via `header: () => <TeamDetailTopHeader activeTab="..." />`.

**Important**: Because the native Stack positions content below custom headers, all screens using `TeamDetailTopHeader` must have `contentStyle: { paddingTop: insets.top + TEAM_HEADER_BODY_HEIGHT }` in their Stack.Screen options (set in `_layout.tsx`, not in the screen itself). The constant `TEAM_HEADER_BODY_HEIGHT = 107` is defined at the top of `[teamId]/_layout.tsx`.

Sub-screens that are not tabs (e.g., `applicants`) use `activeTab="members"` so the correct tab stays highlighted, and render an inline back row at the top of their scroll content.

### Service / Hook Convention

- `src/services/` ??plain async functions that call Supabase (queries, mutations, RPC, Edge Function invocations). No React.
- `src/hooks/` ??React Query wrappers (`useQuery`/`useMutation`) around service functions. Named `useFoo` or `useFooQuery`.
- Screens import from hooks, not directly from services.

### Supabase Edge Functions

Located in `supabase/functions/<function-name>/index.ts` (Deno). Mutations that require server-side authorization or complex logic go here. The client calls them via `supabase.functions.invoke(...)` inside a service function.

### Migrations

Sequential files in `supabase/migrations/` (e.g., `039_create_tournaments.sql`). Always create a new numbered migration; never edit existing ones.

## Key Conventions

- **TypeScript strict mode** ??`any` is prohibited.
- **Path alias** ??`@/*` maps to `src/*`.
- **Font** ??`withAppFont()` wraps all `StyleSheet` text styles; applied globally via `Text.defaultProps` in `_layout.tsx`.
- **SafeArea** ??screens inside the tab navigator use `SafeAreaView edges={["bottom"]}` (top is handled by the navigator header). Auth/onboarding screens handle their own edges.
- **Copy files** ??each feature exports a `get<Feature>Copy(language)` function. New copy keys must be added to all three locale files (`ko.ts`, `vi.ts`, `en.ts`) simultaneously.
- **No test files** ??TypeScript is the only automated check.
## Current Development Status
- Team fee management UI is active under src/app/(tabs)/team/[teamId]/fee.tsx with segmented payment, expense, and transfer-account views.
- Payment status UX includes monthly progress summary, manager confirmation sheet, multi-select bulk confirmation, and optimistic cache updates in useTeamFeeQuery.ts.
- Annual fee history is available at src/app/(tabs)/team/[teamId]/fee-history.tsx with per-member yearly payment status and bulk month confirmation for managers.
- Annual fee history now supports horizontal 12-month scrolling with a fixed member column and manager bulk confirmation for unpaid months even when monthly fee records do not yet exist.
- confirm-fee-payment now accepts missing monthly record context, creates the fee record on demand, and then marks it paid so annual history confirmation works for sparse data.
- Mercenary recruitment is now live end-to-end: post creation, public discovery, application, applicant review, post closing, and profile-side application history are wired through the tabbed team and search stacks.
- Team mercenary management screens live under src/app/(tabs)/team/[teamId]/mercenary*, while public discovery lives under src/app/(tabs)/search/* and keeps the bottom tabs visible.
- The mercenary slice uses additive migrations plus four Edge Functions: create-mercenary-post, apply-mercenary, respond-mercenary-application, and close-mercenary-post, with optimistic React Query updates for applicant response handling.
- Referee assignment Step 1 is live: referee availability registration, manager-side available referee search, and match-level referee assignment requests now flow through referee.service/useRefereeQuery and the tabbed profile/team match screens.
- Referee assignment Step 2 is now wired: referees can accept or reject requests, team managers can submit lineups, assigned referees can review both rosters and start matches, managers can record referee payments, and finalized matches now support referee ratings through the profile/team match flows.
