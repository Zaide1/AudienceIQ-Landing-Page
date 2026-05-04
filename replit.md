# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Versions

### v4 — Mobile-responsive layout (May 2026)

All pages now work properly on phone screens (< 768px):

- **Landing Navbar**: CTA shrinks to "Start →" on mobile; brand text + logo
  scale down; no more overflow.
- **Hero**: title clamp lowered from 56px min to 36px; CTA button uses
  `min(340px, 100%)`; removed `whiteSpace: "nowrap"` on heading.
- **Hero grid CSS**: tighter mobile padding (20px sides, 36px top/bottom).
- **Dashboard**: uses `useIsMobile()` hook (768px breakpoint). On mobile:
  - Tab bar replaces the desktop icon rail (Chat | Map tabs + logo + settings).
  - Only the active tab's panel is shown (full-width, full-height).
  - Divider and split-drag are hidden.
  - Desktop layout is completely unchanged.
- **Onboarding / Help / Privacy / Terms**: already responsive — no changes needed.

Verified via Playwright e2e at 390×844 viewport: full onboarding → generate →
dashboard Chat/Map tab switching → /help all pass.

### v3.2 — Live search competitor preservation fix (May 2026)

After clicking "Run live search", the Competitors & Alternatives section
disappeared because the live research response replaced the full competitor
object with a sparse HN-only version (only `direct` items, empty
`adjacent`/`substitutes`).

Root cause: `runLiveResearch` in `Dashboard.tsx` line 1301 did
`...(data.competitors ? { competitors: data.competitors } : {})` which
overwrote the existing rich competitors with the partial HN-derived object.

Fix: Live search now **merges** HN-derived competitors into the existing data
instead of replacing it. New HN competitor signals are appended to `direct`
(deduplicated by name), while `adjacent`, `substitutes`, and `notes` are
always preserved from the original map. The zero-signals path also explicitly
preserves `competitors` when updating `evidenceSummary`.

Files changed: `artifacts/audense/src/pages/Dashboard.tsx` (runLiveResearch
handler only).

### v3.1 — Competitor relevance fix (May 2026)

The Competitors & Alternatives section returned irrelevant apps (Duolingo,
Headspace, Zapier) for unrelated products because fallback competitors were
hardcoded per category, ignoring the actual product idea entirely.

Root cause: `COMPETITOR_FALLBACKS` in `audienceAI.ts` was a static map keyed
only by category ID (e.g. "consumer-apps" always returned the same 7 apps).

Fixes applied (API server only — no UI changes):

1. **Replaced static fallback** with `buildContextAwareFallbackCompetitors()`
   that derives competitors from `productIdea`, `targetUsers`, `problem`, and
   `category`. Uses keyword matching to select domain-appropriate substitutes
   (sports, finance, content, learning, etc.) instead of a universal list.

2. **Improved AI competitor prompt** with explicit domain-relevance rules:
   competitors must be something the target user would realistically compare,
   grounded in the specific product domain.

3. **Added relevance guard** (`applyRelevanceGuard`) that filters known
   famous apps (Duolingo, Headspace, Zapier, Notion, etc.) unless the product
   context actually matches their domain.

4. **Added competitor diagnostics logging**: `competitorSource` (ai/fallback),
   `competitorNames`, `rejectedCompetitors` logged per request.

Files changed: `artifacts/api-server/src/lib/audienceAI.ts`,
`artifacts/api-server/src/routes/audience.ts`.

AudienceMapResult shape: unchanged. Dashboard UI: unchanged.

### v3 — Audience-segment quality fix (May 2026)

`/api/audience/generate` previously returned identical generic segment names
(Gen Z Adopters, Millennial Professionals, Remote Workers, Parents, Lifelong
Learners) on every run because the AI call always fell back. Fixed by:

- Switching the main model from the unsupported `gpt-5.4` to `gpt-5-nano` with
  `reasoning_effort: "minimal"` — gpt-5-* default reasoning was burning the
  whole budget before producing tokens.
- Running main + competitor calls in `Promise.all` (was sequential).
- Aligning timeouts: backend main 18s / competitor 7s, frontend Onboarding 20s.
- Returning `{map, meta}` from `generateAudienceMapWithAI` with classified
  `fallbackReason` (`timeout` / `model_error` / `validation_failed` /
  `missing_credentials` / `ai_error`) and logging it from the route.
- Tightening the system prompt with strict naming rules + a banned-generic
  list, and adding a concrete good-names example block.
- New `deriveSegmentNames` helper (duplicated in backend + frontend mock) that
  produces 5 product-aware names from extracted noun-phrase tokens whenever
  the AI path is unavailable.

Verified live: 4 unrelated product ideas (calorie tracker, file organiser,
commercial real estate, perfume TikTok) all return `aiUsed:true` in 10–13s
with distinct, product-specific names.

### v2 — Landing & docs polish (May 2026)

Working build saved at this checkpoint. Verified by:

- `pnpm --filter @workspace/audense exec tsc --noEmit` — clean
- `pnpm --filter @workspace/api-server exec tsc --noEmit` — clean
- `PORT=5173 BASE_PATH=/ pnpm --filter @workspace/audense run build` — succeeds (~672 KB JS / ~99 KB CSS gzipped 198 KB / 16 KB)

Highlights since v1:

- Landing hero: responsive grid (`.hero-grid`) with stable two-column layout ≥1100px and widened spacing rhythm at ≥1600px (`max-width: 1560px`, `column-gap: clamp(140px, 10vw, 200px)`).
- Landing `ProductValueSection`: white background with mask-feathered radial glow; "Where to test" row uses 36×36 white chips with brand-coloured X / LinkedIn / Reddit icons.
- Landing FAQ: chevron-down SVG (rotates on open), lavender focus-visible state, hover tint.
- Help, Privacy, Terms restyled via shared `src/components/DocPage.tsx` (gradient hero, centered 760px reading column, `DocSection` / `DocParagraph` / `DocBulletList` / `DocDefinition` primitives). Privacy/Terms legal copy preserved verbatim; Help regrouped into the five spec sections.

Untouched: routing, auth, onboarding, dashboard, navbar, hero copy/CTA, and the dashboard preview component.

## Brand

The product brand is **AudienceIQ** (renamed from "Audense").

**v2.1 — Brand sweep**

All user-facing strings, the support email, the CSS keyframe (`audienceiq-dot-bounce`), and the landing CSS class names (`.audienceiq-preview-row`, `.audienceiq-faq-button`) now read AudienceIQ. Also fixed a latent typo: a non-existent `audense-spin` animation reference in `Dashboard.tsx` now correctly references the `spin` keyframe defined in `index.css`.

Support contact: `hello@audienceiq.app`.

**Intentionally NOT renamed (and why):**

- `@workspace/audense` package name, `artifacts/audense/` directory, and the artifact `id` in `.replit-artifact/artifact.toml` — these are workspace/build/registry identifiers; renaming forces workflow + proxy + lockfile rewiring with no user-visible benefit.
- `localStorage` keys (`audense_onboarding`, `audense-research-sessions`, `audense-audience-map`, `audense-chat-messages`, `audense-display-name`, `audense-workspace-name`, `audense-default-region`, `audense-default-category`, `audense-preferred-sources`, `audense-response-style`, `audense-allow-map-updates`, `audense-show-suggested-actions`, `audense-dashboard-split`, `audense-active-session-id`, `audense-guest-chat-count`, `audense-has-created-guest-research`, `audense-guest-migrated`, `audense-soft-prompt-seen`, plus the export filename `audense-export.json`) — renaming wipes every existing user's onboarding answers, sessions, audience maps, chat history, and settings. If you want these renamed later, ship a one-time migration that copies old keys → new keys on app load.

Verification of v2.1: `pnpm --filter @workspace/audense exec tsc --noEmit` clean; `PORT=5173 BASE_PATH=/ pnpm --filter @workspace/audense run build` succeeds (~672 KB JS / ~99 KB CSS, gzipped 198 KB / 16 KB).

### v2.2 — Cross-session audience-map bleed fix (May 2026)

Users reported that starting a new research session for an unrelated product (e.g. a perfume TikTok page) sometimes still rendered Gym Goers / Busy Professionals / Health Conscious segments from a previous calorie-tracker session.

Two concrete root causes:

1. **`getTemplate()` fitness fallback** in `src/lib/audienceMap.ts` — for any unknown or custom ("Other") category, the function silently returned `TEMPLATES["health-fitness"]`. Replaced with a neutral `GENERIC_TEMPLATE` (Early Adopters, Mainstream Buyers, Value Seekers, Niche Power Users, Casual Browsers).
2. **Global compat-key fallback in Dashboard initial state** — when `getActiveSession()` returned `null`, the dashboard read `audense-audience-map` directly, surfacing data from a previous research. Removed; the fresh-session guard already redirects unauthenticated visitors to landing.

Session isolation centralised in `src/lib/researchSessions.ts`:

- `clearCompatKeys()` — wipes `audense-audience-map`, `audense-chat-messages`, `audense_onboarding`.
- `clearActiveSessionId()` — removes the active id key.
- `hydrateSession(id)` — strict per-id load, no global fallback.
- `createFreshResearchSession({ onboardingData, audienceMap })` — clears stale compat keys, allocates a new id, persists the session, sets active id, and re-syncs compat keys to the new session's data.

`Onboarding.handleGenerate()` now calls `createFreshResearchSession()` in both success and fallback paths. `generateMockAudienceMap()` is now a pure function (removed implicit `saveAudienceMap()` side effect) so in-memory fallbacks cannot accidentally persist a mock to the global compat key.

`Dashboard.tsx` now also resets per-session UI state (`selectedSegmentId`, `hoveredSegmentId`, `hasSelectedSegment`, `suggestedChips`) via a `useEffect` keyed on `activeSessionId`, so segment highlights and dynamic chips can never leak across products.

localStorage keys retain the `audense-*` prefix (no migration shipped). Verified: `pnpm --filter @workspace/audense exec tsc --noEmit` clean; preview renders.
