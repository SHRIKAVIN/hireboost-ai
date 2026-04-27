# HireBoost AI — Architecture Notes

This document tracks the high-level architecture and the rationale behind the major design choices. It is updated as each phase lands.

---

## 1. System Overview

```
┌────────────────────┐         HTTPS / JSON         ┌────────────────────┐
│   apps/web (PWA)   │  ─────────────────────────▶  │   apps/api (REST)  │
│   React + Vite     │                              │   Express + TS     │
└─────────┬──────────┘                              └─────────┬──────────┘
          │                                                   │
          │ Service Worker                                    │ Mongoose
          │ (offline shell)                                   │
          ▼                                                   ▼
   IndexedDB / Cache                                    MongoDB Atlas
                                                              │
                                                              ▼
                                                  AI Provider (Gemini / OpenAI)
```

- **Frontend** handles all presentation, routing, theming, PWA, and client-side validation.
- **Backend** handles persistence, auth, file parsing, ATS scoring, and AI orchestration.
- **Shared package** (`@hireboost/shared`) holds the contract: TS types, Zod schemas, enums, constants — consumed by both apps.

---

## 2. Monorepo Strategy

We use **npm workspaces** (no Turborepo / Nx) for Phase 1. Rationale:

- Zero new tooling on top of Node + npm.
- The repo has only 3 workspaces, so a heavier orchestrator is overkill at this scale.
- Easy to add Turborepo or Nx later without restructuring.

```
apps/web         →  @hireboost/web         # frontend
apps/api         →  @hireboost/api         # backend
packages/shared  →  @hireboost/shared      # types + zod schemas + constants
```

`tsconfig.base.json` defines path aliases:

- `@hireboost/shared` → `packages/shared/src/index.ts`
- `@hireboost/shared/*` → `packages/shared/src/*`

Both apps extend `tsconfig.base.json` and inherit strict mode.

---

## 3. Layered Backend (Phase 3 ✅, growing through Phase 11)

```
routes/         → URL → controller mapping (thin)
controllers/    → request shape, response shape (thin)
services/       → business logic (rich)
repositories/   → data access (Mongoose)
models/         → Mongoose schemas
validators/     → Zod schemas (often re-exported from @hireboost/shared)
middlewares/    → auth, error, rate limit, upload
providers/      → external services (AI, OAuth, mail)
modules/        → feature-bundled wiring (auth, resumes, ats, ai, …)
```

Why this split: routes and controllers stay testable & boring; business rules live in services; persistence is swappable; external APIs are mocked via providers in tests.

---

## 4. Layered Frontend (planned, Phase 2+)

```
app/            → root providers (theme, query client, router)
routes/         → route definitions + guards
features/<f>/   → feature-scoped pages, components, hooks, services
components/ui/  → shadcn/ui primitives
components/shared/   → cross-feature presentational components
components/layout/   → app shell, sidebar, navbar
hooks/          → cross-cutting hooks
lib/            → axios client, query client, formatters
services/       → typed API clients (consume @hireboost/shared types)
store/          → Zustand stores (auth, ui)
types/          → frontend-only types
utils/          → pure helpers
styles/         → Tailwind base, theme tokens
```

State strategy:

- **Server state** → TanStack Query (cache, invalidation, retries).
- **Client state** → Zustand (auth, theme, transient UI).
- **Form state** → React Hook Form + Zod resolvers reusing schemas from `@hireboost/shared`.

---

## 5. Core User Flow

> **Job Description first**, resume second. This ordering is deliberate — the JD anchors every downstream analysis.

```
1. Job Description Intake     →  parse role, skills, keywords, seniority
2. Resume Upload              →  PDF/DOCX → raw text + parsed sections
3. ATS + Optimization         →  score, match %, gaps, weak bullets
4. Resume Diff / Review       →  side-by-side original vs improved
5. Preview & Edit             →  structured editor + live preview
6. Download                   →  PDF export, save resume version
```

A persistent stepper at the top of the workflow: **Job Description → Upload Resume → Review Changes → Preview & Edit → Download**.

---

## 6. AI Provider Abstraction (planned, Phase 8)

```
apps/api/src/providers/ai/
├── ai.provider.ts      # interface: generate(prompt) → text
├── gemini.provider.ts  # default
├── openai.provider.ts  # swappable
└── index.ts            # factory based on AI_PROVIDER env
```

Prompts live in `apps/api/src/modules/ai/prompts/*.ts` — never inlined in controllers.

Failure policy: provider errors degrade gracefully — the deterministic ATS engine still produces a usable score and structural suggestions even if AI is down.

---

## 7. Security Posture (Phase 3 ✅, hardened through Phase 4+)

- `helmet` with sane defaults.
- `cors` with explicit allowlist from `CORS_ORIGINS` env.
- `express-rate-limit` on auth + AI routes.
- `bcrypt` password hashing.
- Short-lived access JWT + long-lived refresh JWT (rotated).
- Zod-validated request bodies on every mutating route.
- File upload limits via Multer; mime sniffing on parse.

---

## 8. PWA Strategy (planned, Phase 12)

- `vite-plugin-pwa` with `generateSW` strategy.
- Precache app shell + critical routes.
- Runtime cache for `/api/v1/*` GET requests with stale-while-revalidate.
- Offline fallback page for navigations.
- Installable manifest with maskable icons.

---

## 9. Deployment (planned, Phase 12)

| Layer        | Service                              |
| ------------ | ------------------------------------ |
| Frontend CDN | AWS S3 + CloudFront (SPA fallback)   |
| Backend      | AWS EC2 or Elastic Beanstalk         |
| Database     | MongoDB Atlas                        |
| Secrets      | AWS SSM Parameter Store              |
| Logs         | CloudWatch (structured Pino JSON)    |
| TLS          | ACM + CloudFront / ALB               |

---

## 10. Open Questions (revisit later)

- Should we add Turborepo when phases 6+ start touching multiple workspaces per change? (Probably yes.)
- Do we need background job processing (queues) for AI analysis at scale? (Phase 8 decision.)
- Multi-tenant org accounts vs solo accounts? (Out of scope for v1, but data model leaves room.)
