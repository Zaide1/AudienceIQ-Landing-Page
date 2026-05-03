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

The product brand is **AudienceIQ** (renamed from "Audense"). All user-facing strings in `artifacts/audense/src/**`, `artifacts/audense/index.html`, and the artifact title in `.replit-artifact/artifact.toml` were updated. The workspace package name (`@workspace/audense`) and directory (`artifacts/audense`) were intentionally left unchanged so workflows, build scripts, and the artifact registry continue to work — these are internal identifiers, not user-facing.
