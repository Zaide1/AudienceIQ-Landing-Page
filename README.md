# AudienceIQ — AI Market Research Tool

AudienceIQ is an AI-powered market research platform. Give it a product or idea and it maps your audience, surfaces competitors, and generates content strategy insights — all in one dashboard.

## Stack

- **Frontend** — React + TypeScript + Tailwind CSS
- **Backend** — Express 5 + PostgreSQL + Drizzle ORM
- **AI** — OpenAI (research synthesis, competitor analysis, content scoring)
- **Monorepo** — pnpm workspaces

## Features

- AI-generated audience research reports
- Competitor & alternatives mapping
- Content strategy board
- Live search integration
- Mobile-responsive dashboard
- Onboarding flow

## Structure

```
lib/
├── api-client-react     # React query hooks (generated from OpenAPI spec)
├── api-spec             # OpenAPI spec + codegen
├── api-zod              # Zod validation schemas
├── db                   # PostgreSQL schema (Drizzle ORM)
└── integrations-openai-ai-server  # AI research server
artifacts/
├── api-server           # Express API server
└── internal-board       # Dashboard frontend
```

## Getting Started

```bash
pnpm install
pnpm run dev
```

Requires a `.env` with `DATABASE_URL`, `OPENAI_API_KEY`, and optionally `DEERFLOW_BASE_URL` for deep research runs.
