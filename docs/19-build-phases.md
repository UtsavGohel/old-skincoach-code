# Build Phases

# SkinCoach

Version: 1.0

Purpose

This document is the execution plan for building SkinCoach end-to-end: phase-by-phase, mobile-UI-first with mock data, then real backend integration, then testing/security/performance/offline/accessibility hardening, observability, and launch prep. It supersedes the generic Week 1–12 estimates in `13-development-roadmap.md` with the actual sequencing agreed for this build. Every phase names the exact docs its output must be checked against — see "Phase Completion Protocol" below.

---

# Decisions Locked In

- **Backend framework**: NestJS (not Hono) — matches the module/guard/interceptor architecture the rest of `docs/` is written around.
- **Repos**: two independent git repos, not a monorepo — `skincoach-mobile/` and `skincoach-api/`, as subfolders of the project root. Package manager: Yarn.
- **Deployment**: serverless — **AWS Lambda + API Gateway** (NestJS via a serverless-express adapter), **SST v3** for infrastructure-as-code. No EC2/containers. See `docs/20-serverless-architecture.md` (canonical for all backend infra).
- **Database**: **Neon Postgres** is the *production/serverless* target. **During dev (the backend build, Phases 15+) we are running on Supabase Postgres** — the switch to Neon is production cutover only (Phase 25) and is just a connection-string change, since Prisma treats both identically. The `DATABASE_URL` (pooled) / `DIRECT_URL` (direct, for `prisma migrate`) split applies to Supabase too (Supavisor pooler on 6543, direct on 5432). Pooling is mandatory on Lambda (per-invocation connections otherwise exhaust the limit); for local dev both URLs can point at the direct connection. ⚠️ Supabase's direct `db.<ref>.supabase.co` host is IPv6-only on newer projects — if `prisma migrate` can't connect, use the Session-pooler URL (IPv4) as `DIRECT_URL`.
- **Storage**: **Cloudflare R2** is the *eventual* target. **During dev we use Supabase Storage** (private bucket + signed URLs per docs/12). Both are S3-compatible, so `StorageService` is built against the **S3 API** (`@aws-sdk/client-s3` + presigner) and the R2 switch is a five-env-var change (endpoint/region/keys/bucket), zero code. Implemented in Phase 16.
- **Queue / async**: **Amazon SQS** (+ DLQ) with a worker Lambda for AI processing, and **EventBridge Scheduler → Lambda** for cron jobs. Replaces the earlier BullMQ + Upstash Redis design (BullMQ needs a long-lived worker/Redis connection — an anti-pattern on Lambda).
- **Auth**: Clerk, not in-house JWT. Clerk owns credentials/sessions/OAuth; our DB keeps a thin synced `users` mirror. The Lambda API verifies Clerk JWTs statelessly (a natural fit for serverless). Reaffirmed when the serverless switch was made.
- **Sequencing**: mobile UI with mock data is priority (Phases 2–14). Real backend logic is its own explicit sequence (Phases 15–21), done after the UI pass. Exception: Clerk auth is real starting Phase 2 (no backend round-trip needed to sign in) — everything else in Phases 2–14 stays mock-data-driven.

---

# Prisma Schema — refinements vs. docs/04

Same 19 tables and relationships as `04-database-schema.md`'s ER diagram, with these corrections (gaps found cross-referencing docs/04 against docs/06 and docs/16):

- **`users`**: thin Clerk mirror — `id`, `clerkId` (unique), `email`, `fullName`, `profileImage`, `createdAt`, `updatedAt`, `deletedAt`. No password/provider/email_verified — Clerk owns those.
- **`skin_analysis`**: keep the flat per-metric score columns (fast chart queries) and add `metricsDetail Json` to hold the full nested Gemini response (severity/status per metric, per docs/16) which the flat columns lose. Add `visionModel`, `visionPromptVersion` (docs/06 requires both; docs/04 only had one `analysis_version`).
- **`ai_insights`**: add `insightPromptVersion` (same docs/06 requirement).
- **`routine_logs`**: add `logDate Date` with a unique `(routineItemId, logDate)` constraint — prevents double-logging the same day, which would silently break streak math.
- **Enums** (currently free-text strings in docs/04, tightened for correctness): `ScanStatus`, `SubscriptionPlan`, `SubscriptionStatus`, `DevicePlatform`, `RoutineTimeOfDay`, `MessageRole`, `NotificationType`.
- **`user_achievements`**: unique `(userId, achievementId)` — prevents double-awarding.
- **`feature_usage`**: unique `(userId, feature, month)` so usage counting can safely upsert.
- **1:1 relations**: `skin_analysis.scanId` and `ai_insights.scanId` as unique FKs.
- **UUIDs**: Prisma-level `@default(uuid())` rather than a Postgres extension — portable regardless of what's enabled on Neon.
- **Soft delete (`deletedAt`)**: applied to primary user-owned entities (`users`, `user_profiles`, `skin_scans`, `routines`, `routine_items`, `ai_conversations`) — skipped on append-only logs (`routine_logs`, `analytics_events`, `ai_messages`, `notifications`).
- Everything else (columns, table names, indexes already listed in docs/04) unchanged.

---

# Phase Completion Protocol

Every phase below ends with a **"Verify against"** line naming the specific docs that phase must satisfy. Before marking any phase done and starting the next one:

1. Re-open every doc listed in that phase's "Verify against" line and check the actual implementation against it line by line — not a glance, a real diff between what was built and what the doc says.
2. If the phase touches a screen listed in this file's Known Mockup Deviations appendix, confirm each listed deviation was actually fixed in the build, not just noted here.
3. Run the phase's steps in the Verification section at the bottom of this file.
4. Walk docs/18's Code Review Checklist (reusable? scalable? typed? tested? readable? secure? can it be simplified?).
5. If reality diverged from this plan during the phase (a decision changed, a doc turned out to be wrong, scope shifted), update this file in the same pass — per docs/18, documentation must never go stale.

Only move to the next phase once all five pass.

**Dependency hygiene (applies throughout, not just at phase boundaries):** version mismatches have caused repeated pain on past projects, so don't just `yarn add`/`npm install` latest and move on. In `skincoach-mobile`, install any package with native code via `npx expo install <pkg>` so it resolves the version matching the installed Expo SDK, rather than an arbitrary latest that may not be RN/Expo-compatible. In `skincoach-api`, keep all `@nestjs/*` packages on the same major version and keep the Prisma CLI and `@prisma/client` versions identical. After any dependency change, actually run install + typecheck + build and confirm clean output before continuing — don't assume it worked.

---

# Phase 0 — Repo Setup & Tooling
Verify against: `docs/08` (folder structure), `docs/04` (schema), `docs/18` (dev rules), the Prisma Schema refinements above.

**`skincoach-api/`** (scaffold only — structure, schema, stub routes, no business logic yet):
- NestJS init, folder structure from `docs/08` (`modules/{users,scan,analysis,progress,routine,coach,subscription,notifications,settings,dashboard}` + an `auth` module scoped to Clerk webhook + guard rather than register/login/refresh; `common/`, `config/`, `database/`, `jobs/`, `queue/`, `storage/`, `prompts/`, `guards/`, `interceptors/`, `filters/`).
- `schema.prisma` per the refinements above.
- `.env.example`: `DATABASE_URL` + `DIRECT_URL` (Neon pooled/direct), `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`, `GEMINI_API_KEY`, `CLOUDFLARE_R2_*` — all placeholders, no Docker Compose. SQS/EventBridge are provisioned via SST (`infra/`), not env URLs; deployed secrets live in AWS Secrets Manager.
- Stub controllers matching every route in `docs/05` (auth routes replaced with a `POST /api/v1/webhooks/clerk` receiver stub), each throwing `NotImplementedException`.
- ESLint/Prettier, GitHub Actions CI (install+lint+typecheck), git init + initial commit.

**`skincoach-mobile/`**:
- Expo (TypeScript template) restructured into `src/` per `docs/08`.
- Tooling: TS `strict`, ESLint (`eslint-config-expo` + `@typescript-eslint`, `max-lines`/`max-lines-per-function` approximating docs/18's 250/400/40-line limits), Prettier, Husky + lint-staged pre-commit (typecheck + lint), absolute import aliases via `tsconfig.json` paths.
- Core deps: `@clerk/clerk-expo`, `react-navigation` (native-stack + bottom-tabs), `zustand`, `@tanstack/react-query`, `react-hook-form` + `zod`, `react-native-reanimated`, `react-native-mmkv`, `expo-camera`, `expo-notifications`, `react-native-purchases` (unused until Phase 12), `@gorhom/bottom-sheet`, `react-native-svg`.
- Icons: `lucide-react-native` (matches DESIGN.md's "thin-stroke 1.5–2pt rounded outline" spec — see also the Known Mockup Deviations section below on why NOT to copy the mockups' Material Symbols icons). Charts: hand-rolled `react-native-svg` (matches the simple line/area charts in the mockups; docs/03 explicitly says avoid heavy/complex chart libraries).
- Jest + React Native Testing Library scaffolded (empty smoke test).
- Folder structure per `docs/08`, with one deviation: docs/08's `app/` (entry + root provider wiring) is named `src/bootstrap/` instead. Expo CLI auto-detects any directory literally named `app` as a potential Expo Router root by convention, which conflicts with this project's React Navigation setup (confirmed via `expo export`, which logged "Using src/app as the root directory for Expo Router" before the rename, and stopped after).
- Mock API layer: `api/client.ts` reads `EXPO_PUBLIC_USE_MOCK_API` (default true). Each `api/*.api.ts` function returns fixture data from `mocks/` (shaped like docs/05 responses / docs/16 JSON schema) with simulated delay instead of a real `fetch`. Hooks/services/screens are written against the same `api/` functions regardless — flipping the flag later to point at the real NestJS API needs zero UI changes.
- Clerk wired for real: `ClerkProvider` at the app root with a test-mode publishable key placeholder; `auth.store` (Zustand) derives from Clerk's session state rather than mocking its own.
- git init + initial commit.

---

# Phase 1 — Design System Foundation
Verify against: `docs/03` (UI Components Specification), `organic_vitality/DESIGN.md`, `docs/15` (UI implementation rules).

- `theme/colors.ts`: full token set transcribed from `organic_vitality/DESIGN.md` as `{ light, dark }` (dark palette derived from the same tonal relationships; DESIGN.md only specifies light, flagged TODO for a future dedicated dark-mode pass).
- `theme/typography.ts`: Plus Jakarta Sans (display/headline) + Manrope (body/label), exact scale from DESIGN.md, loaded via `@expo-google-fonts`.
- `theme/spacing.ts`, `radius.ts`, `shadow.ts`, `animation.ts` from DESIGN.md + docs/03.
- Component library (`components/`): `Button`, `Input`, `Card` (Hero/Information/Metric/Timeline), `Avatar`, `ProgressRing`, `Chart`, `BottomNavigation` (5 tabs — Home/Scan/Progress/Routine/Profile — with a floating, larger center Scan FAB, built correctly once here rather than copying any single mockup's drifted version), `AIInsightCard`, `AchievementBadge` (3 states: Locked/Unlocked/Completed), `RoutineItem` (checkbox, product icon/name, **reminder time**, completed state with check animation + glow + strike-through), `StatisticCard`, `AIChatBubble`, `BottomSheet`, `Modal`, `EmptyState`, `Loading`/`Skeleton` (shimmer, never a spinner), `Toast` — each typed, light/dark aware.
- Navigation skeleton: real stack (Splash→Welcome→Auth→BasicInfo→SkinGoals→HomeTabs) + bottom-tab navigator inside HomeTabs, typed routes, placeholder screen bodies (real content from Phase 2 onward). The tab navigator only registers 4 real screens (Home/Progress/Routine/Profile) — "Scan" is rendered by `BottomNavigation` as the 5th button but isn't a tab screen; pressing it pushes `ScanGuidelines` onto the parent stack instead of switching tabs (matches docs/02's "Camera opens from the center Scan tab" and the floating-FAB treatment in the mockups, which was never a real persistent tab).

**Confirmed conflicts between docs/03, docs/15, and DESIGN.md** (found during the Phase 1 completion check, resolved with the user rather than silently picked):
- **Typography scale**: docs/03 and docs/15 both independently specify a 6-token scale (Display 32/Heading 28/Title 22/Body 16/Caption 14/Small 12, no letter-spacing given). DESIGN.md specifies a different 8-token scale up to `display-lg` at 40px, with exact letter-spacing — and matches the actual mockup HTML/CSS verified during the docs/19 design audit. **Decision: DESIGN.md's scale is canonical** (already implemented in `theme/typography.ts`) — confirmed with the user rather than assumed.
- **Section Gap spacing**: docs/03 says 40px, docs/15 says 32px, DESIGN.md says 48px — three different values. **Decision: 40px (docs/03) is canonical** (already implemented in `theme/spacing.ts`) — confirmed with the user.

---

# Phase 2 — Splash, Welcome, Sign In (real Clerk auth)
Design refs: `splash_screen/`, `welcome_to_skincoach/`, `sign_in_to_skincoach/`
Verify against: `docs/02` (Welcome/Auth flow, "Welcome shown only once" rule), `organic_vitality/DESIGN.md` (`display-lg` on welcome).
- Splash + Welcome screens per mockups (Welcome headline uses `display-lg` typography per DESIGN.md, not the mockup's smaller `headline-lg`).
- Sign In / Sign Up via `@clerk/clerk-expo` (email + Google/Apple, whichever providers are enabled on the Clerk instance), RHF+Zod for any custom fields, real session → `auth.store` → navigation onward.

# Phase 3 — Onboarding: Basic Info + Skin Goals  ✅ DONE
Design refs: `onboarding_let_s_get_started/`, `onboarding_skin_profile_goals/`
Verify against: `docs/01` (target users, onboarding fields), `docs/04` (`user_profiles` columns), `docs/02` ("Onboarding cannot be skipped").
- Multi-step form (name, age, gender, skin type, primary goal, experience level) into a mock `user.store` profile.

**Built:**
- `store/user.store.ts` — MMKV-persisted (via `persist` middleware) `profileDraft` + `hasCompletedOnboarding` flag. Persistence chosen so a mid-onboarding restart keeps answers and Splash can read the completion flag on cold start; stands in for the eventual `GET/PATCH /users/me` in mock-data mode. First store in the app to actually pull MMKV into the render tree, which surfaced a Jest gap — `react-native-mmkv` (Nitro native module) has no JS fallback and threw in the smoke test; fixed by mocking it with an in-memory Map in `jest-setup.ts`.
- `features/profile/` — `profile.types.ts` (typed unions for Gender/SkinType/PrimaryGoal/ExperienceLevel + `UserProfileDraft`), `onboarding.options.ts` (canonical option sets transcribed from the mockups with lucide icons), and reusable presentational components: `OnboardingHeader` (back + animated Step X/Y progress), `AgeWheelPicker` (Reanimated vertical snap wheel with live scale/opacity/color falloff + masked edges — the mockup's `wheel-picker`), `SelectChip` (gender + goals), `SelectionCard` (skin-type grid), `ExperienceOption` (level rows). Screens stay thin and compose these.
- `Button` gained a reusable `iconPosition: 'leading' | 'trailing'` prop for the onboarding CTAs' trailing arrows (was leading-only).
- Both screens seed local state from the persisted draft (so back-navigation preserves answers) and commit to the store on continue/finish. `SkinGoals` finish → `completeOnboarding()` + `navigation.reset` into `HomeTabs` (docs/02: onboarding gates the app, can't be swiped back into).

**Deviation resolved (see appendix):** primary goal is **single-select**, not the mockup's multi-toggle — the `user_profiles.primary_goal` column is singular and the section heading reads "What's your **primary** goal?" (singular). The mockup's prototype JS toggles multiple chips, but doc + copy win.

**Deferred:** the returning-user fast-path (Splash/Auth reading `hasCompletedOnboarding` to skip Welcome/onboarding) is wired at the store level but not yet consumed in routing — it needs real Clerk auth state to be meaningful, so it lands with the Clerk integration (deferred to the end of the UI pass per the user's sequencing).

**UX restructure (post-build, on user feedback):** the two stacked mockup screens were replaced with a **single one-question-per-screen wizard** (`screens/Onboarding/OnboardingScreen.tsx`, route `Onboarding`). On-device, stacking name + a tall age wheel + gender chips on one screen read as cramped and it wasn't obvious there was more below the fold. The wizard shows one focused question at a time (Name → Age → Gender → Skin Type → Goal → Experience) with a single shared progress bar (6 steps) and a calm fade transition between steps; the reusable question components (AgeWheelPicker, SelectChip, SelectionCard, ExperienceOption, OnboardingHeader) are unchanged and just recomposed. The old `BasicInfo`/`SkinGoals` routes + screen folders were removed; `Authentication` demo-auth and `EmailAuthSheet` now target `Onboarding`. This is a deliberate deviation from the mockups' 2-screen layout, chosen for usability (mockup fidelity yields to clarity here — the individual question controls still match the mockups' visual design).

# Phase 4 — Home Dashboard  ✅ DONE
Design ref: `home_dashboard/`
Verify against: `docs/03` (Hero/Metric Card, Progress Ring), `docs/05` (`GET /dashboard` response shape).
- Skin Score ring, Today's Routine, AI Insight, Daily Streak, Progress Snapshot, Weekly Trend chart — from `mockDashboardResponse`.

**Built:**
- **First real slice of the mock-API stack** (the pattern every future data screen follows): `mocks/dashboard.mock.ts` (fixture, values transcribed from the mockup) → `api/dashboard.api.ts` (`getDashboard()` branches on `isMockApiEnabled`, else `request('/dashboard')`) → `features/dashboard/useDashboard.ts` (React Query hook) → screen. Zero `fetch` in the screen (docs/18). `docs/05`'s response is a minimal stub (`todayScore/streak/todayRoutine/latestInsight/scanAvailable` with `{}` nesteds) — extended to a concrete `DashboardResponse` (`features/dashboard/dashboard.types.ts`) covering what the mockup needs (scoreDelta, radianceLabel, progressSnapshot, weeklyTrend), keeping the doc's named fields.
- `screens/Home/HomeScreen.tsx` handles **loading (SkeletonCards), error (EmptyState + retry via refetch), and success** — satisfies PROJECT_CONTEXT's "every screen supports loading/empty/error/success". Greeting is time-of-day + the name from the mock user store.
- Feature components in `features/dashboard/components/`: `DashboardHeader` (avatar initials + wordmark + bell), `SkinScoreCard` (reuses `ProgressRing` + trend chip + View History), `TodaysRoutineCard` (compact, locally-toggleable checkboxes — the full `RoutineItem` with icons/reminder/glow is reserved for the Phase 8 Routine tab), `DailyStreakCard`, `WeeklyTrendCard` (reuses the hand-rolled SVG `Chart`). Reused `AIInsightCard` (Lightbulb) and `MetricCard` (×3 Progress Snapshot; `upIsGood` handles Acne↓/Redness↓ = good).
- Interactions: bell + View History + streak wired (bell → toast; View History/streak → Progress tab via `BottomTabNavigationProp<HomeTabParamList>`). Routine checkbox toggles use a derived override map, not a data→state sync effect (lint rule: no cascading-render effects).
- BottomNavigation is already the correct 5-tab + floating Scan FAB from Phase 1 (`home_dashboard` is one of the two mockups that got it right).

# Phase 5 — Scan Flow  ✅ DONE
Design refs: `scan_guidelines/`, `ai_skin_scan_1/`, `ai_skin_scan_2/`, `ai_skin_analysis_in_progress/`, `analysis_complete_celebration/`
Verify against: `docs/06` (Steps 1–2 capture/validation requirements), `docs/02` (No Internet / Face Not Detected error flows), `docs/03` (loading — no spinners; animation — no bounce).
- Guidelines screen must include glasses/sunglasses removal guidance (missing from the mockup). Real `expo-camera` capture with face-guide overlay (one consistent guide style, not the two conflicting styles across the `ai_skin_scan_1`/`ai_skin_scan_2` mockups); any reference/example photo used must show a neutral expression, not smiling. Analyzing screen uses shimmer/progress animation, never a spinner. Analysis Complete celebration uses calm easing (no bounce/overshoot), shared-element into Results per docs/02 — backed by a mock scan pipeline returning canned docs/16-shaped JSON after a delay.

**Built:**
- `screens/ScanGuidelines` — hero + a 5-card grid; **added the "Remove Glasses" card** (docs/06 "No sunglasses", missing from the mockup — deviation fixed). "Open Camera" → Camera, "Skip for now" → back. Reuses `Card`/`Button`; new `features/scan/components/GuidelineCard`.
- **Scan-flow entry (UX refinement):** guidelines show only on the **first** scan, then the Scan-tab button goes straight to the Camera (a daily-scan app shouldn't re-show tips every time). Backed by a persisted `store/preferences.store.ts` flag (`hasSeenScanGuidelines`, set when the user taps "Open Camera"); the guidelines stay reachable from the Camera's help button. `CustomTabBar` routes Scan → `Camera` if seen, else `ScanGuidelines`.
- `screens/Camera` — real `expo-camera` `CameraView` (front camera, flip, capture) with `useCameraPermissions` (dedicated permission-request UI when not granted). **One canonical oval face-guide** (`features/scan/components/FaceGuideOverlay`, react-native-svg elliptical mask + calmly pulsing sage ring) rather than the two drifting mockup styles. Quality indicators (Lighting/Position/Distance) are static — real face/lighting validation is a docs/06 Step-2 backend concern. Capture stores the photo in `store/scan.store.ts` and `replace`s to Analyzing. Gallery button toasts (image-picker deferred). `expo-camera` plugin + CAMERA permission already in app.json.
- `screens/Analyzing` — **no spinner**: an animated progress bar (0→100% over ~5s) + a 7-step checklist that fills as it advances, over the captured photo in a gently pulsing ring, with the docs-mandated privacy footer. On 100% → `replace` to AnalysisComplete.
- `screens/AnalysisComplete` — **calm check reveal (Easing.out, NO bounce/overshoot — deviation fixed)** + an ease-out score count-up (0→84) with the "+3 since yesterday" chip. "View My Results" → Results, "Back to Home" → reset to HomeTabs.
- `store/scan.store.ts` — transient (non-persisted) scan session state (photoUri + status), holding the captured photo through the flow into Phase 6 Results.

**Deferred / simplified:** true shared-element transition into Results (docs/02) — plain navigation for now; gallery upload (needs expo-image-picker); real face-detected/lighting validation + the "Face Not Detected / No Internet" error flows (docs/02) — those are Phase 14 supporting-states + backend (docs/06 Step 2). The Analyzing screen currently always succeeds (mock).

**On-device note:** Camera uses the `expo-camera` native module. If the running dev client predates the `expo-camera` install, it must be rebuilt (`npx expo run:android`); Splash/Welcome/onboarding/dashboard are pure-JS and hot-reload, but the Camera screen won't work until the native module is in the build.

# Phase 6 — Results Screen  ✅ DONE
Design ref: `ai_skin_analysis_results/`
Verify against: `docs/06` (Required Analysis list, confidence rules), `docs/16` (all 9 metrics present in the schema), `docs/03` (BottomNavigation spec).
- Renders the mock analysis from Phase 5. Must show all 9 metrics (the mockup only shows 6 — Oiliness, Pores, Wrinkles are missing) and a confidence indicator per docs/06's confidence rules (normal/moderate/retake/reject). Uses the correct 5-tab BottomNavigation with floating Scan FAB (the mockup drops Home/Progress and the FAB entirely).

**Built:**
- Data layer follows the Phase-4 pattern: `features/analysis/analysis.types.ts` (docs/16 Vision Response core + `metricsDetail`-style status/change per docs/19 + folded-in Historical Comparison & Daily Insight) → `mocks/analysis.mock.ts` (docs/06 example values: 84 / 0.96 / the 9 metric scores) → `api/scan.api.ts` `getLatestAnalysis()` → `features/analysis/useAnalysis.ts` (React Query). `metrics.ts` = per-metric lucide icon + label; `confidence.ts` = `getConfidenceTier()` implementing all four docs/06 tiers.
- `screens/Results/ResultsScreen.tsx` renders overall score ring + delta, the **ConfidenceBanner** (docs/06 tiers — the mockup omitted any confidence indicator; deviation fixed), insight, yesterday→today comparison, **all 9 metrics** (mockup showed 6 — Oiliness/Pores/Wrinkles added; deviation fixed), a recommendation card, and Save/Share/View-Full-Progress actions (Share uses the RN Share sheet; View Full Progress deep-links to the Progress tab). Loading (SkeletonCards) / error (EmptyState + retry) / success handled.
- Feature components: `ConfidenceBanner`, `MetricResultCard`, `ScoreComparisonCard`. Reused `ProgressRing`, `AIInsightCard`, `Card`.
- `navigation/types.ts`: `HomeTabs` is now `NavigatorScreenParams<HomeTabParamList>` so pushed screens can deep-link a specific tab.

**BottomNavigation decision (supersedes the line above):** Results is a **task-focused pushed screen** (reached from AnalysisComplete, and later from Progress history) sitting on the root stack outside HomeTabs. Rather than render a non-functional persistent tab bar there, it uses a back header + action CTAs — consistent with the scan screens and the design system's own "task-focused sub-page → suppress global nav" logic (stated verbatim in the scan_guidelines mockup). The 5-tab BottomNavigation remains canonical for the actual tab screens (Home/Progress/Routine/Profile). So the docs/19 "use the 5-tab nav on Results" note is intentionally not applied.

**Deferred:** the captured-photo thumbnail on Results (available in scan.store) and wiring AnalysisComplete's score to this same fixture — both cosmetic; the real values already match.

# Phase 7 — Progress & Trends (+ Scan History)  ✅ DONE
Design ref: `progress_trends/`
Verify against: `docs/02` (Progress Flow), `docs/03` (Line Chart, Timeline Card — no bounce animation).
- Timeline, 7d/30d/90d/1y charts, milestones, mock scan history list (no dedicated mockup — built on the Timeline Card spec). No bounce animation on trend icons (mockup uses `animate-bounce` on the trending icon — avoid).

**Built:**
- Data layer (Phase-4 pattern): `features/progress/progress.types.ts` (trends keyed by `TrendRange` so chart tabs swap the point array; metric trends; milestones; monthly comparison; AI observation) → `mocks/progress.mock.ts` → `api/progress.api.ts` `getProgress()` → `features/progress/useProgress.ts`.
- `screens/Progress/ProgressScreen.tsx` (a **real bottom tab**, so it renders inside the tab bar — header is title + share, no back): journey hero (score + "+N points this month" + verified highlight), `TrendOverviewCard` (7D/30D/90D/1Y selector over the hand-rolled `Chart`), a 2×2 grid of `MetricTrendCard`, monthly `ScoreComparisonCard`, the **milestones `Timeline`** (reused Phase-1 component; icon per milestone), and an `AIInsightCard` (Brain) for AI Observations, plus a "Scan Today" CTA that respects the guidelines-seen flag. Loading/error/success handled.
- New components: `TrendOverviewCard`, `MetricTrendCard`. **No bounce** on the trend arrows (docs/19 deviation — mockup used `animate-bounce`).
- Reuse: `ScoreComparisonCard` gained optional `previousLabel`/`currentLabel` props (so "Last/Curr" here, "Yesterday/Today" on Results); reused `Chart`, `Timeline`, `AIInsightCard`, `Card`, `EmptyState`, `SkeletonCard`.

**Note:** the standalone "Scan History list" is folded into the milestones timeline for now (the latest scan is a milestone entry); a dedicated scrollable history list can be added in Phase 14 polish if wanted. Metric trends reuse `METRIC_META` from the analysis feature.

# Phase 8 — Routine Tracker  ✅ DONE
Design ref: `my_routine_tracker/`
Verify against: `docs/02` (Routine Flow), `docs/03` (Routine Item spec — reminder time, check animation/glow/strike-through).
- Morning/Night sections. Routine Item must show reminder time (missing from mockup) and all three completed-state treatments — check animation, glow, strike-through (mockup only toggles a checkmark) — mock local state.

**Built:**
- Data layer (Phase-4 pattern): `features/routine/routine.types.ts` (icon key string → lucide via `routine.meta.ts`) + `mocks/routine.mock.ts` (Morning 2/4, Night 0/3, 18-day streak, 86% weekly, reminder times added per docs/03) + `api/routine.api.ts getRoutine()` + `useRoutine`.
- `screens/Routine/RoutineScreen.tsx` (real bottom tab): completion ring, streak card (breathing flame, no bounce), weekly-consistency strip, AI tip, Morning/Night sections, sticky "Complete Today's Routine" CTA. Check-off is a **derived override map** over query data (lint-safe, no setState-in-effect).
- **Reused the full Phase-1 `RoutineItem`** (reminder time + check-animation + glow + strike-through — deviation satisfied). New components: `RoutineProgressCard`, `RoutineStreakCard`, `WeeklyConsistencyCard`, `RoutineSection`. Enhanced shared `ProgressRing` with an optional `centerValue` so it shows the "3 / 5" fraction (backward-compatible).

# Phase 9 — AI Coach  ✅ DONE
Design ref: `ai_skin_coach/`
Verify against: `docs/02` (AI Coach Flow), `docs/07` (Prompt 4 tone/word limits, no-diagnosis rule).
- Insights, Recommendations, Chat (canned mock responses), Educational Articles. This mockup was the cleanest against the docs — tone, word limits, and suggested-reply chips already match docs/07 well.

**Built:**
- The mockup is a coaching **hub** (not a bare chat). Data layer: `features/coach/` types+meta + `mocks/coach.mock.ts` + `api/coach.api.ts getCoach()` + `useCoach`. `coachChat.ts` = canned `getCoachReply()` keyword matcher + greeting, written to docs/07 (personalized, friendly, never diagnoses/prescribes, defers to a dermatologist).
- Components: `CoachSummaryCard` (mini stat rings), `RecommendationCard` (impact tags), `ArticleCard` (uses the mockup's own hosted image URLs). Screens: `AICoachScreen` hub (route `AICoach`, reached from Home's insight CTA + a new Home-header ✨ Coach button) with a faux Ask-input; `AICoachChatScreen` (NEW route `AICoachChat`, shared `AIChatBubble`, 700ms typing delay, initial transcript via lazy `useState` initializer — no setState-in-effect).

# Phase 10 — Profile & Achievements  ✅ DONE
Design ref: `profile_achievements/`
Verify against: `docs/03` (Achievement Badge — 3 states, single icon library), `PROJECT_CONTEXT.md` (actual Pro feature list).
- Achievement Badge needs all 3 states rendered distinctly (Locked/Unlocked/Completed — mockup only visually distinguishes 2). Use one icon library throughout (mockup mixes emoji stat icons with Material Symbols badge icons). Pro upsell copy must match the actual Pro feature list in `PROJECT_CONTEXT.md` (Unlimited Scans, Advanced AI, Weekly Reports, Priority Processing) — the mockup invents a feature ("Advanced Ingredient Insights") not in that list.

**Built:**
- Data layer for the mock parts only: `features/profile/profileOverview.types.ts` + `profile.meta.ts` + `mocks/profile.mock.ts` + `api/profile.api.ts getProfileOverview()` + `useProfileOverview`. **Personal Skin Profile binds to REAL onboarding data** (`useUserStore.profileDraft` → labels via the wizard's own option sets); name also from the store.
- Reused shared `AchievementBadge` (already renders all 3 states) + `Avatar` (fixed sizes; used 120). **Deviations honored**: one icon library (lucide, no emoji); Pro upsell uses the real PROJECT_CONTEXT features. New components: `ProfileCard`, `ProfileStatCard`, `AchievementsSection`, `PersonalProfileCard`, `ProUpsellCard`. `ProfileScreen` = real bottom tab; gear → Settings.

# Phase 11 — Settings  ✅ DONE
Design ref: `settings/`
Verify against: `docs/02` (Settings Flow, bottom nav visible on all authenticated screens), `docs/11` (notification types).
- Bottom nav must remain visible (mockup deliberately hides it, contradicting docs/02's "visible on every authenticated screen" rule — Settings is only reachable post-auth). Notification toggles must cover all 5 documented types including "Weekly Summary" (not "Weekly Progress") and "Achievements" (mockup shows only 4, with different wording). Pro pitch copy should be the single consistent version used in Phase 10, not a second, differently-worded pitch. Includes theme toggle (wires up the dark palette from Phase 1).

**Built:**
- `store/settings.store.ts` (MMKV-persisted): `themePreference` + the 5 docs/11 notification toggles (Weekly Summary + Achievement, per the deviation). **Theme toggle wired**: rewrote `ThemeProvider` to resolve mode from the store (falls back to OS); `ThemeModeSelector` (System/Light/Dark) re-themes live via the Phase-1 dark palette. Pro card **reuses the Phase-10 `ProUpsellCard`** (consistent pitch). New components: `SettingsSection`/`SettingsRow`/`SettingsToggleRow`/`ThemeModeSelector`. `SettingsScreen` sections: Pro, Account, Notifications, Privacy & Security, Preferences, Support, Log Out, version.
- **DEVIATION (deliberate):** the bottom tab bar is NOT shown on Settings — it's a pushed root-stack screen with a back header, consistent with the app's realized "task-focused pushed sub-page suppresses global nav" rule (same call made for Results Phase 6 + AICoach Phase 9). Overrides this phase's "nav visible" note; flagged to the user.

# Phase 12 — Subscription  ✅ DONE
No mockup — built per docs/10 + Phase 1 components, using the same Pro feature list as Phases 10–11. RevenueCat SDK present but stubbed.
Verify against: `docs/10` (Subscription Flow), `PROJECT_CONTEXT.md` (Free/Pro feature lists — note docs/01 and PROJECT_CONTEXT.md disagree on Free's scan limit; PROJECT_CONTEXT.md wins as the top-level source).

**Built:**
- `store/subscription.store.ts` (persisted): status FREE/PRO/EXPIRED/CANCELLED/PENDING + plan; `activatePro`/`restore`/`cancel`; `selectIsPro`. `features/subscription/subscription.content.ts` = plans (Yearly $79.99 "Save 33%" highlighted / Monthly $9.99), benefits, comparison rows (**Free scan limit = "1/day", PROJECT_CONTEXT wins**), FAQs. Components: `PricingCard`, `ComparisonTable`, `FaqItem`.
- `SubscriptionScreen` (route `Subscription`): hero/benefits/comparison/pricing/CTA/restore/FAQ/legal/Maybe-Later. Mock "Upgrade" → 1.2s delay → `activatePro` → `replace('SubscriptionSuccess')` (calm checkmark, "Start Today's Scan"). Wired Profile + Settings Pro CTAs → `Subscription` (replaced their toasts). Real IAP + backend receipt verification deferred to Phase 19.

# Phase 13 — Notification Settings  ✅ DONE
No mockup — built per docs/11 (5 notification types, matching Phase 11's settings list).
Verify against: `docs/11` (Notification Flow).

**Built:**
- Extended `settings.store` with `reminderTimes` (dailyScan/morningRoutine/nightRoutine/weeklySummary; docs/11 defaults 9/8AM/9PM/7PM) + quiet hours (10PM–7AM) + setters. `features/notifications/notifications.content.ts` (REMINDER_SCHEDULE + 48 half-hour TIME_PRESETS). `TimePickerModal` (preset list in the shared Modal — no native datetimepicker dep).
- `screens/NotificationSettings` (route `NotificationSettings`): permission banner, 5 type toggles, Schedule time rows (tap → picker), Quiet Hours toggle + times. **Refactored** Settings' inline toggles → a single "Notifications ›" link row.

# Phase 14 — Supporting States & Polish  ✅ DONE
Empty/Error/Loading-Skeleton states across all screens above (copy from docs/02), remaining Bottom Sheets & Dialogs, Before/After Comparison view.
Verify against: `docs/02` (Empty States section, Error Flow section), `docs/03` (Loading Components, Bottom Sheet, Modal specs).

**Built:**
- Loading (SkeletonCard) / error (EmptyState + retry) states were already built into every data screen per-phase, so this phase delivered the two remaining named items:
- **Before/After Comparison** — extended `progress.types`/`progress.mock` with `beforeAfter` (two `ComparisonSnapshot`s + `MetricComparison[]`; private-scan placeholder tiles, no real photos per docs/06). `screens/BeforeAfter` (route `BeforeAfter`, reads shared `useProgress`): snapshot tiles + "+13 points" banner + per-metric before→after deltas. Added a "View Before & After" button on Progress.
- **`components/ConfirmDialog`** (built on shared Modal; destructive tint via `style` since Button has no 'destructive' variant) — wired Settings Log Out + Delete Account to confirm first (docs/03 Modal use case). docs/02 empty-state copy noted but not reachable in mock mode (fixtures always return data).

---

# Phase 15 — Backend: Clerk Sync  ✅ DONE (code; live verification deferred)
Verify against: `docs/12` (Security & Privacy), `docs/04` (`users` table).
- `POST /api/v1/webhooks/clerk` verifying Svix signatures, handling `user.created`/`updated`/`deleted` → upsert/soft-delete `users` row.
- `ClerkAuthGuard` verifying Clerk-issued JWTs on protected routes.
- Real `GET/PATCH /api/v1/users/me`.

**Built** (first real backend phase — the pattern later backend phases follow):
- **`ClerkAuthGuard`** (`guards/clerk-auth.guard.ts`) — now real: extracts the `Bearer` token, verifies it with `@clerk/backend`'s `verifyToken` (networkless when `CLERK_JWT_KEY` PEM is set, else JWKS-over-secret-key), attaches the verified `{ clerkId, sessionId }` to `request.auth`, and maps any failure to a generic 401 (logs the reason server-side, never leaks it — docs/12). Provided in `UsersModule` so `@UseGuards(ClerkAuthGuard)` resolves it with `ConfigService`.
- **`@CurrentUser()`** param decorator (`common/decorators/`) + `AuthContext` type with an Express `Request.auth` augmentation (`common/types/auth.types.ts`) — handlers read the verified identity, never a client-supplied id.
- **Clerk webhook** — `AuthController` (`POST /api/v1/webhooks/clerk`, `@HttpCode(200)`) reads the **raw body** (enabled via `rawBody: true` in `main.ts`, required so the Svix HMAC still matches) and delegates to `AuthService`, which verifies the Svix signature against `CLERK_WEBHOOK_SECRET` and forwards the parsed event to `UsersService`. `AuthModule` imports `UsersModule`.
- **`UsersService`** — `getMe`/`updateMe` (guarded `/users/me`; `updateMe` updates `users.fullName` + upserts `user_profiles` in a `$transaction`, partial via Prisma's undefined-skipping) and `syncFromClerkEvent`: `user.created`/`updated` → `upsert` by `clerkId` (primary-email selection, first/last-name join, re-activates a returning soft-deleted id via `deletedAt: null`); `user.deleted` → **idempotent** soft delete via `updateMany` (no throw on unknown/already-deleted id); unknown events acknowledged and ignored; a Clerk user with no email is skipped (logged) rather than crashing the webhook into an infinite Clerk retry. A thin `UserResponse` mapper omits `clerkId`/soft-delete internals.
- **17 unit tests** (guard: missing/non-Bearer/valid/invalid token; webhook: missing headers/valid-forward/bad-signature→401; service: getMe found+404, updateMe upsert+404, sync created/first-email-fallback/no-email-skip/soft-delete/ignore). Jest config gained a `moduleNameMapper` to strip `.js` from relative imports (so the Prisma 7 generated client — which emits explicit `.js` extensions — resolves under ts-jest; helps all future backend tests), and a `*.spec.ts` eslint override relaxing type-aware `no-unsafe-*` + `max-lines-per-function` (jest matchers are `any`; source stays strict).
- **Env + config**: added optional `CLERK_JWT_KEY`; `.env.example` DB comments describe the **Supabase Postgres (dev) → Neon (prod)** setup (see Decisions Locked In). **Still stale, deferred to their phases:** `@nestjs/bullmq`/`bullmq` deps + `queue/bullmq.module.ts` + `UPSTASH_REDIS_URL` → replaced by **SQS** in Phase 17; no `infra/` (SST) yet.
- **Build/tooling fix**: `nest start:dev` failed with `Cannot find module dist/main` — root cause was a stale root-level `tsconfig.build.tsbuildinfo`: `incremental: true` + nest's `deleteOutDir` wiped `dist/` but not the buildinfo, so tsc thought the build was current and emitted nothing. Fixed by relocating the cache into `dist` (`tsBuildInfoFile: "./dist/tsconfig.tsbuildinfo"`) so `deleteOutDir` always clears it. The app now **boots and connects to Supabase** (`Nest application successfully started` + `Connected to database` on :3000).

**Live-verified end-to-end:** migration applied to Supabase `postgres` (20 tables + 7 enums; the `migrations/` dir now exists). The **Clerk webhook works in production-shape** — a real Clerk instance → ngrok tunnel → `POST /api/v1/webhooks/clerk` → Svix verify → `users` upsert synced 3 real signups (verified rows in the DB). Guard/webhook rejection paths smoke-tested (401 no-token, 400 no-Svix-headers, 401 bad-sig). Code + unit tests green (build + lint + 17 tests).

**Supabase TLS fix (required for any DB write):** Supabase's connection pooler presents a **self-signed cert chain**, and `pg` 8.x treats `sslmode=require` in the URL as strict `verify-full` → every query throws `self-signed certificate in certificate chain` (the lazy pool means `$connect` "succeeds" but the first real query fails). Fixed in `PrismaService.createPool()`: rewrite the URL's `sslmode` → `no-verify` **and** pass `ssl: { rejectUnauthorized: false }` (an explicit `ssl` option alone does NOT override the URL's sslmode — confirmed). TODO(prod): pin Supabase's CA via `ssl: { ca }` instead of disabling verification.

**Still deferred:** real Clerk **JWT** verification through `ClerkAuthGuard` on `/users/me` (needs a live session token — folds into the mobile integration, Phase 21). The API repo still isn't git-initialized.

# Phase 16 — Backend: Scan & Storage Pipeline  ✅ DONE + LIVE-VERIFIED
Verify against: `docs/06` (Steps 1–3), `docs/05` (Scan APIs), `docs/12` (Signed Upload URLs, No Public Images).
- Signed upload URLs, `POST /scans` → create record, image validation (docs/06 Step 2).
- **Storage is S3-compatible** (see Decisions Locked In): build one `StorageService` against `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner`, pointed at **Supabase Storage during dev** (private bucket, presigned PUT for upload + presigned GET for download — never public per docs/12), swappable to **Cloudflare R2** later via env only. Introduce generic `STORAGE_ENDPOINT`/`STORAGE_REGION`/`STORAGE_ACCESS_KEY_ID`/`STORAGE_SECRET_ACCESS_KEY`/`STORAGE_BUCKET` env vars (replacing the Phase-0 `CLOUDFLARE_R2_*` placeholders) at this point.

**Built:**
- **`StorageService`** (`storage/storage.service.ts`, `@Global` module) — S3-compatible via `@aws-sdk/client-s3` + presigner, `forcePathStyle: true` (Supabase S3 + R2). `createUploadUrl(key, contentType)` → presigned PUT (5-min TTL, ContentType bound into the signature so the client can't swap types), `createDownloadUrl(key)` → presigned GET (1-hr TTL, docs/12 "signed URLs only, never public"), `deleteObject(key)`. Replaced the Phase-0 `CloudflareR2Service` stub.
- **Scan pipeline** (`ScanController` guarded by `ClerkAuthGuard`, owner-scoped via `@CurrentUser`): `POST /scans/upload-url` → `{ uploadUrl, imageKey }` (key = `scans/{userId}/{uuid}.jpg`, namespaced by the local user); `POST /scans` → creates `skin_scans` (status `processing`) after re-checking the key sits under the caller's own `scans/{userId}/` prefix (`ForbiddenException` otherwise); `GET /scans/:id/status` → `{ status }` (owner-scoped, 404 else); `DELETE /scans/:id` → soft-delete + best-effort `deleteObject` (storage-cleanup failure is logged, not fatal). Clients upload/download **directly** to storage via the presigned URLs — image bytes never transit the API (Lambda-friendly + keeps the bucket private).
- **`UsersService.getLocalUserId(clerkId)`** — the reusable owner-scoping primitive (clerkId → local `users.id`, 404 if missing) that every feature module keys its rows off of; `ScanModule` imports `UsersModule` for it.
- **Env**: `CLOUDFLARE_R2_*` → generic `STORAGE_*` (endpoint/region/keys/bucket) in `env.schema.ts` + `.env.example`. ⚠️ These are now **required at boot** — the app won't start until the 5 vars are set (real or placeholder).
- **Validation** (docs/06 Step 1): upload-url DTO enforces `contentType: image/jpeg` and optional declared `fileSize ≤ 8 MB`. **Deep Step-2 quality validation** (face detected / single face / brightness / blur / resolution) is the pre-Gemini step and lands in **Phase 17** (needs vision).
- **11 unit tests** (storage: PUT/GET/delete command shape + TTLs; scan: key generation, owned-key create, foreign-key `Forbidden`, status found/404, delete + storage-fail-tolerated + 404). Build + lint + 28 tests total green.

**Live-verified (2026-07-07)** against the real Supabase bucket + DB: (a) StorageService round-trip — presigned PUT 200 → presigned GET 200 byte-for-byte match → delete → 404; (b) full `ScanService` pipeline for a real synced user — `createUploadUrl` → upload → `createScan` (`processing` row) → `getScanStatus` → foreign-key create rejected (`Forbidden`) → `deleteScan` → 404 after. Only the HTTP-level `ClerkAuthGuard` on the routes is still unexercised live (needs a real session JWT → Phase 21); the guard itself was verified in Phase 15.

**Deferred:** `thumbnailUrl` generation (needs server-side image processing) — stored `null` for now; `GET /scans/:id` full result (needs analysis → Phase 17); `GET /scans` history (Phase 18); `POST /users/profile-image` (reuses StorageService but also needs read-signing of `users.profileImage` in getMe → Phase 21).

# Phase 17 — Backend: Gemini AI Analysis Pipeline  ✅ ANALYSIS DONE + LIVE-VERIFIED (async infra = SQS still to come)
Verify against: `docs/06` (full pipeline, retry/confidence rules), `docs/07` (prompt text), `docs/16` (JSON schema validation).
- Vision Analysis + Historical Comparison + Insight Generation prompts (docs/07) run on an **SQS-triggered worker Lambda** so analysis is async, not blocking the request; failures retry via SQS and land in a DLQ. JSON schema validation (docs/16) with one retry on malformed output, confidence-based accept/reject rules (docs/06). See `docs/20`.

**Approach (user decision):** split — build the **synchronous analysis pipeline first** (done, this pass), then move it onto SQS. So the analysis logic is complete and the *trigger* is abstracted; only the prod async transport (SQS) remains.

**Built:**
- **`@google/genai` (Gemini 2.5 Flash)** via a shared `GeminiService` (`src/ai/`, `@Global` `AiModule`): `generateJson()` requests structured output (`responseMimeType: application/json` + `responseSchema`), parses, and re-validates with a caller-supplied validator, **retrying once** on malformed/invalid output then failing (docs/06 Step 6, docs/16). Reused by the coach later.
- **Prompts live in files** (docs/07: never hardcode): `src/prompts/vision-analysis.md` + `daily-insight.md` filled from docs/07; `PromptService` (`@Global` `PromptModule`) reads + caches them; `nest-cli.json` `assets` copies `prompts/*.md` → `dist/prompts` so `__dirname` resolves in dev + build. Prompt-version labels (`v1.0`) stamped onto each stored row.
- **`AnalysisService.processScan(scanId)`** — the docs/06 Steps 4–9 pipeline: load scan+profile (idempotent: only acts on `processing`) → download image (`StorageService.getObjectBuffer`) → **Vision** (Gemini, Zod-validated) → **confidence gate** (`<0.5` → reject → scan `failed`) → **backend historical comparison** (deltas vs the previous completed scan — *not* Gemini, docs/06 Step 7) → **Insight** (Gemini) → store `skin_analysis` (flat scores + `metricsDetail` JSON + confidence + model/prompt versions) + `ai_insights` + scan `completed` in one `$transaction`, with `processingTimeMs`. Any error → `failed`.
- **Queue abstraction replaces BullMQ/Upstash** (deps + `bullmq.module.ts` + `UPSTASH_REDIS_URL` removed): `ScanQueue` port (`src/queue/scan-queue.ts`) with `InProcessScanQueue` (dev: fire-and-forget in-process, so `POST /scans` returns immediately with `processing` and the client polls) bound in `QueueModule`. **Prod = swap `useClass` to an SQS producer + worker** — the analysis code doesn't move. `ScanService.createScan` now `enqueueAnalysis`s; `GET /scans/:id` result endpoint implemented (analysis + insight + signed image URL once `completed`, else just status).
- **8 new unit tests** (Gemini retry-once/succeed/throw; analysis happy-path store, low-confidence reject, error→failed, idempotent skip; prompt load/cache) — **36 total**, build + lint green.

**Live-verified (2026-07-07)** against the real Gemini API + Supabase — **including the full happy path**: a real 1024×1024 face selfie → Gemini vision (confidence 0.95, overall 91, all 9 metrics w/ severity/status) → backend comparison → Gemini insight (warm, first-scan-aware, no diagnosis — matches docs/07) → stored `skin_analysis` + `ai_insights` → scan `completed` → `GET /scans/:id` returned the completed result with a signed image URL. Also confirmed the **reject path**: a non-face image returns confidence 0 → scan `failed`. End-to-end latency ~15s for the two sequential Gemini calls (insight depends on vision, so not parallelizable) — **over the docs/06 <10s target; a perf item for later** (lighter model / streaming).

**Remaining for Phase 17 (the async half):** SQS producer + worker Lambda + DLQ (needs the SST `infra/` which doesn't exist yet — lands with the serverless infra work). Until then analysis runs in-process, which is functionally complete for dev. Also deferred: a separate Gemini *historical-comparison* narrative call (docs/07 Prompt 2) — folded into the backend delta computation + insight prompt per docs/06 Step 7.

# Phase 18 — Backend: Progress, Routine, Coach APIs  ✅ DONE + LIVE-VERIFIED
Verify against: `docs/06` (Step 7 historical comparison), `docs/05` (Progress/Routine/Coach APIs), `docs/09` (cache/invalidation strategy).
- Real trend calculations (docs/06 Step 7), routine CRUD + completion + streaks, AI Coach chat + history.

**Built** (all owner-scoped via `ClerkAuthGuard` + `getLocalUserId`):
- **Progress** (`ProgressService`): `GET /progress` → Overall/Weekly/Monthly summary (latest/avg/best/scoreChange, computed via Prisma `aggregate` over the user's completed `skin_analysis`, backend-side per docs/06 Step 7); `GET /progress/timeline` → scored scan list (newest first); `GET /progress/chart?range=7d|30d|90d|1y` → per-scan points of all 9 metrics (invalid range → 400).
- **Routine** (`RoutineService`): `GET /routines` (morning/night with items + `completedToday` from today's `routine_logs`), `POST /routines` (nested item create, validated DTO incl. `HH:mm` reminder regex), `PATCH /routines/:id`, `DELETE /routines/:id` (soft-delete), `POST /routines/items/:id/complete` (upsert keyed by the unique `(routineItemId, logDate)` so a day can't be double-logged; owner-checked via the item's routine), `GET /routines/stats` (consecutive-day **streak** with a same-day grace + weekly consistency %). Note: streak uses **UTC calendar days** — per-user timezone is a later refinement.
- **Coach** (`CoachService`, reuses `GeminiService` + `PromptService`): `GET /coach/today` (latest completed scan's insight), `POST /coach/chat` (docs/07 Prompt 4 via a new `coach.md` prompt + docs/16 `{answer, followUpQuestions, disclaimer}` schema, Zod-validated; context = latest analysis + profile; **persists both turns** to a per-user `ai_conversations`/`ai_messages`), `GET /coach/history`.
- **15 new unit tests** (progress aggregates + invalid range; routine mapping/complete/404/streak+consistency; coach today/chat-persists-both-turns/creates-conversation/history) — **51 total**, build + lint green.

**Live-verified (2026-07-07)** against the real DB + Gemini: seeded 2 completed scans → Progress summary (latest 86, +6 change), timeline, chart all correct; created a routine → completed an item → `completedToday: true` → stats (streak 1, consistency, 2 active items); Coach `today` returned the insight; **Coach chat returned a personalized, docs/07-compliant reply that referenced the user's real oiliness score (86)** + 3 follow-ups + a medical disclaimer. (One transient Gemini 503 on first attempt — retry succeeded; the retry-once path + the fact that transient overloads are external, not bugs, both confirmed.) All test data cleaned up.

# Phase 19 — Backend: Subscription & Feature Gating
Verify against: `docs/10` (Subscription Flow), `docs/05` (rate limits), `PROJECT_CONTEXT.md` ("Never build a credit system").
- RevenueCat webhook/verify, `feature_usage` tracking, plan-based rate limiting (docs/05 rate limits).

# Phase 20 — Backend: Notifications
Verify against: `docs/11` (Notification Flow, "Respect user preferences. No spam.").
- Device token registration, scheduled reminder jobs (**EventBridge Scheduler → Lambda**), preference-respecting delivery (docs/11).

# Phase 21 — Integration
Verify against: every doc referenced in Phases 2–20 — this phase is the first time they must all hold true simultaneously against the real backend.
- Flip `EXPO_PUBLIC_USE_MOCK_API` off, point at the real API, full end-to-end journey smoke test (login → onboarding → scan → results → routine → coach → logout).

---

# Phase 22 — Testing & Quality
Verify against: `docs/17` (Testing Strategy — pyramid, coverage target, AI test cases).
- Unit tests for services/hooks/stores/validators (80% coverage target).
- Integration tests: Clerk sync, R2 upload, Gemini pipeline (mocked provider), DB writes, routine completion, subscription webhook.
- End-to-end test of the full journey (docs/17's Login→Onboarding→Scan→AI Analysis→Results→Routine→Logout) run against a staging environment, not mocks.
- AI-specific tests: malformed JSON handling, retry logic, confidence-threshold branching, prompt version stamping.

# Phase 23 — Security, Performance, Offline & Accessibility
Verify against: `docs/12` (Security & Privacy), `docs/09` (Offline Strategy), `docs/03`/`docs/15` (Accessibility), `PROJECT_CONTEXT.md` + `docs/13` (Performance Goals).
- Security: rate limiting verified under load, input sanitization audit, no PII/JWT/images in logs, signed URLs only, no public image access, GDPR-style delete-my-data flow works end-to-end.
- Performance: measure against the documented targets — app launch <2s, dashboard <1s, AI analysis <10s, navigation <200ms — and fix regressions.
- Offline: banner shown when offline, Progress/Results/Routine/Profile remain viewable, New Scan/AI Chat/Purchase correctly disabled (docs/09's exact split).
- Accessibility: VoiceOver labels on every interactive element, 44x44 minimum touch targets, WCAG AA contrast in both light and dark themes, Dynamic Font scaling doesn't break layouts.

# Phase 24 — Observability & Analytics
Verify against: `docs/13` (tech stack — Sentry, Firebase Analytics, Mixpanel), `docs/04` (`analytics_events` table), `docs/01` (Success Metrics).
- Sentry wired on both mobile and backend for crash/error reporting.
- Analytics events fired for the specific events docs/01 and docs/04 name (`scan_started`, `scan_completed`, `routine_completed`, `subscription_upgraded`, `ai_chat_used`, etc.) into `analytics_events` + Firebase/Mixpanel.
- Structured backend logging in place (no secrets, per docs/12), with processing-time/model-version/confidence/retry-count tracked per docs/06's Logging section.

# Phase 25 — Launch Prep
Verify against: `docs/13` (Phase 12 App Store Checklist, Launch Strategy staged rollout).
- Privacy Policy, Terms of Service, App Store + Google Play listings/screenshots/assets.
- EAS Build/Submit configured for mobile; CD pipeline for the backend (auto-deploy on merge to main) added on top of Phase 0's lint/typecheck-only CI.
- Production cutover: real Neon project, real Clerk production instance, real Gemini/R2/RevenueCat keys (in AWS Secrets Manager), `sst deploy --stage production`, replacing every `.env.example` placeholder from Phase 0.
- Staged rollout per docs/13: Internal Testing → Friends & Family → Closed Beta (100 users) → Public Launch.

---

# Deferred Backlog (revisit later)

Cross-phase items intentionally deferred during the build, kept here so they aren't lost. Each notes the phase it belongs to.

**Remaining roadmap after Phase 18 (user call, 2026-07-07 — "core is covered, do these later"):** the core loop (auth → scan → AI analysis → results → progress → routine → coach) is done + live-verified. Explicitly deferred:
- **Phase 20 — Notifications** (device-token registration + scheduled daily-scan/routine/weekly reminders). *Core for the "return tomorrow" retention loop.* Scheduled delivery needs EventBridge (SST infra); token registration doesn't.
- **Phase 21 — Mobile ↔ real API integration** (flip `EXPO_PUBLIC_USE_MOCK_API` off, wire real Clerk JWTs, e2e). This is what makes the app actually use the backend — planned as a dedicated "backend + frontend sync" pass later.
- **Phase 19 — Subscription & feature gating** (RevenueCat, `feature_usage`, 1-scan/day free limit) — payment deferred.
- **Phase 24 — Analytics** (`analytics_events`, Firebase/Mixpanel, Sentry) — deferred.
- The 3 small read/CRUD stubs (`GET /scans` history, `GET/PATCH /settings`, `GET /achievements`) were finished 2026-07-07.

**Phase 17 — async transport (the remaining half):**
- **SQS producer + worker Lambda + DLQ.** The analysis pipeline is complete and runs **in-process** (dev) behind the `ScanQueue` port; prod needs the real async transport. Swap `QueueModule`'s `useClass: InProcessScanQueue` → an SQS producer, add a worker Lambda that consumes the queue and calls `AnalysisService.processScan(scanId)`, with a DLQ for failures (docs/06/20). **The analysis code does not change** — only the trigger. Blocked on the SST `infra/` (doesn't exist yet).
- **AI analysis latency ~15s > docs/06 <10s target** (two sequential Gemini calls; insight depends on vision so not parallelizable). Perf item — consider a lighter/faster model, streaming, or trimming the insight prompt. Revisit in Phase 23 (Performance).
- **Separate Gemini historical-comparison narrative call** (docs/07 Prompt 2) — currently folded into the backend delta computation + insight prompt (per docs/06 Step 7, which says the trend math is backend, not Gemini). Only build the standalone narrative call if a dedicated comparison string is wanted.

**Infra (blocks Phase 17 async + deploy):**
- **SST v3 `infra/`** not scaffolded yet — needed for SQS, EventBridge Scheduler (Phase 20), and `sst deploy`. Currently everything runs as a plain `nest start` server against Supabase.
- **`skin-coach-api` git**: repo is initialized (`feat/api`); prod CD pipeline is Phase 25.

**Storage / users (Phase 16 tail):**
- **`thumbnailUrl` generation** — stored `null`; needs server-side image processing (e.g. sharp) at upload/analysis time.
- **`POST /users/profile-image`** — reuses `StorageService` but also needs read-signing of `users.profileImage` in `getMe`; folded into Phase 21.

**Auth (Phase 15 tail):**
- **Live JWT verification through `ClerkAuthGuard`** on protected routes — verified only via unit tests + rejection paths; a real session token exercises it in Phase 21 (mobile integration).

**Prod hardening (later phases):**
- **Postgres SSL** currently `rejectUnauthorized: false` for Supabase's self-signed pooler cert (`PrismaService.createPool`). Prod should pin the CA (`ssl: { ca }`) — Phase 23/25.

---

# Verification (per phase)

- `yarn tsc --noEmit` and `yarn lint` clean.
- `yarn expo start` → manually walk the flow built in that phase, confirm it matches the mockup (adjusted per the Known Mockup Deviations below) and that loading/error/empty variants render via mock fixture toggles.
- Phase 0 additionally: `skincoach-api` connects to Neon and runs a clean `prisma migrate dev`; both repos have one clean initial commit.
- Phases 15–21: integration-test each endpoint against the real Neon/SQS/Clerk/Gemini/R2 services in a dev environment (`sst dev`) before Phase 21's full swap.
- Phase 22: coverage report meets the 80% target from docs/17; e2e suite passes against staging.
- Phase 23: performance numbers captured and compared against the documented targets; offline mode manually tested in airplane mode; VoiceOver walkthrough done on both platforms.
- Phase 24: trigger a test crash/error and confirm it lands in Sentry; fire each named analytics event and confirm it lands in `analytics_events` + Firebase/Mixpanel.
- Phase 25: TestFlight/Internal Testing build installed and walked through on a real device before any public rollout stage begins.

---

# Appendix — Known Mockup Deviations (Design vs. Docs Audit)

The `skincoach_design/` mockups were audited screen-by-screen against `docs/` before build start. Colors, typography scale, radius, and shadow tokens in the mockups accurately match `organic_vitality/DESIGN.md` throughout — the deviations below are in components, copy, and flow, not the visual token system. **Where a mockup conflicts with a doc, the doc wins** — the notes above per-phase already bake in the fix; this appendix is the full record of why.

**Cross-cutting (all screens)**
- Every mockup uses Google Material Symbols icons by name — contradicts PROJECT_CONTEXT.md and docs/03's explicit "avoid Material Design look." Resolved by using `lucide-react-native` throughout instead.
- Bottom navigation is inconsistent screen-to-screen and never fully matches docs/03's spec (5 fixed tabs — Home/Scan/Progress/Routine/Profile — with Scan as a larger floating FAB). Various mockups drop Scan, drop Home/Progress, or render Scan the same size as other icons. Only `home_dashboard` and `profile_achievements` get it right. Build `BottomNavigation` once correctly in Phase 1 per docs/03, not per-mockup.

**Per-screen**
- `scan_guidelines`: omits glasses/sunglasses removal guidance required by docs/02 and docs/06.
- `ai_skin_scan_1`: reference photo shows a smiling expression, contradicting docs/06's "neutral expression" requirement.
- `ai_skin_scan_2`: uses a different capture-guide visual style than `ai_skin_scan_1` with no doc distinguishing them as separate states.
- `ai_skin_analysis_in_progress`: uses a traditional spinning loader; docs/03 says "avoid traditional loading spinners."
- `analysis_complete_celebration`: checkmark animation uses a bounce/overshoot easing curve; docs/03 says "never use bounce animations."
- `ai_skin_analysis_results`: bottom nav missing Home/Progress/FAB; only shows 6 of 9 required metrics (missing Oiliness, Pores, Wrinkles per docs/06 and docs/16); no confidence indicator despite docs/06's confidence rules being a core requirement; inconsistent card radius (32px vs 24px) within the same screen.
- `progress_trends`: a trend icon uses `animate-bounce`, contradicting docs/03.
- `my_routine_tracker`: Routine Item omits Reminder Time (required by docs/03); completed state only shows a checkmark toggle, missing the glow effect and strike-through docs/03 also requires.
- `ai_skin_coach`: no issues found — tone, word limits, and suggested replies match docs/07 closely.
- `profile_achievements`: Achievement Badge only visually distinguishes 2 of the 3 required states (Locked/Unlocked/Completed); mixes emoji icons with Material Symbols icons on the same screen; Pro upsell lists a feature not in PROJECT_CONTEXT.md's actual Pro feature list.
- `settings`: deliberately hides bottom navigation, contradicting docs/02 ("visible on every authenticated screen"); Pro pitch copy differs from `profile_achievements`'s version (internal inconsistency between two mockups); notification toggle list shows 4 of the 5 documented types with one renamed ("Weekly Progress" vs. documented "Weekly Summary").
- `welcome_to_skincoach`: DESIGN.md explicitly requires `display-lg` typography for welcome screens; the mockup uses the smaller `headline-lg` instead.
- `onboarding_let_s_get_started`, `onboarding_skin_profile_goals`: beyond the cross-cutting icon/nav issues above, the Step 2 goal chips render as multi-select in the mockup's prototype JS, but the `user_profiles.primary_goal` column is singular and the heading reads "What's your primary goal?" — resolved to **single-select** in the build (doc + copy win).

Button and input radius are also inconsistent both across mockups and against docs/03's exact values (20px buttons, 16px inputs) — mockups mix pill-shaped, 24px, and other values. Build `Button`/`Input` in Phase 1 using docs/03's precise values.
