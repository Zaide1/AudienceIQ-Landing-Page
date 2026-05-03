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
