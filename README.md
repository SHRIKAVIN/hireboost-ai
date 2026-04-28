# HireBoost AI

> ATS Resume Review · AI Resume Enhancer · Resume Builder · Job Matcher
> A premium, production-grade SaaS Progressive Web App that helps candidates tailor resumes to specific job descriptions using AI.

---

## Highlights

- **Job-description-first** workflow: paste a JD → upload resume → ATS analysis → AI-enhanced diff → editor → PDF export.
- **Premium SaaS UX**: enterprise-grade design system, dark/light mode, mobile-first responsive, PWA installable.
- **Strict TypeScript** end-to-end with shared types between web and API.
- **Production architecture**: clean modular monorepo (apps + shared package), repository/service/controller separation, provider abstraction for AI vendors.
- **AWS deployment ready**: frontend → S3 + CloudFront, backend → EC2 / Elastic Beanstalk.

---

## Monorepo Layout

```
hireboost-ai/
├── apps/
│   ├── web/                 # React + Vite + Tailwind + shadcn/ui (PWA frontend)
│   └── api/                 # Express + TypeScript + MongoDB (REST API)
├── packages/
│   └── shared/              # Shared types, DTOs, Zod schemas, constants
├── docs/
│   └── ARCHITECTURE.md      # Architecture & roadmap notes
├── .env.example             # Shared/example environment variables
├── tsconfig.base.json       # Base TS config extended by every workspace
├── package.json             # npm workspaces root
└── README.md
```

### Why this structure

- **`apps/web`** owns all UI, routing, theming, PWA, and presentation logic.
- **`apps/api`** owns persistence, auth, AI provider abstraction, ATS engine, file parsing.
- **`packages/shared`** holds the contract between them: TypeScript types, Zod schemas, enums, and constants. No frontend or backend specifics — pure types and validation. This keeps the boundary explicit and review-friendly.

---

## Tech Stack

**Frontend (`apps/web`)** — added in Phase 2

- React 18 · Vite · TypeScript (strict)
- Tailwind CSS · shadcn/ui · Lucide icons
- React Router · TanStack Query · Zustand · React Hook Form + Zod
- Framer Motion · `vite-plugin-pwa`

**Backend (`apps/api`)** — added in Phase 3

- Node.js 20 · Express · TypeScript (strict)
- MongoDB Atlas · Mongoose
- JWT auth · Google OAuth scaffold
- Multer · PDF/DOCX parsers
- Helmet · CORS allowlist · `express-rate-limit`
- Pino logger · Zod validation
- Provider abstraction (Gemini-first, OpenAI swappable)

**Shared (`packages/shared`)**

- Zero runtime dependencies beyond Zod
- Shared DTOs, enums, and validation schemas

---

## Prerequisites

- **Node.js** `>= 20.10` (see `.nvmrc`)
- **npm** `>= 10`
- **MongoDB** Atlas cluster or local MongoDB (added in Phase 3)

```bash
nvm use   # picks up .nvmrc
node -v   # v20.x
npm -v    # 10.x
```

---

## Quick Start

```bash
# 1. Clone and enter
git clone <your-repo-url> hireboost-ai
cd hireboost-ai

# 2. Install all workspaces
npm install

# 3. Copy env files
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env  # if it exists

# 4. (Optional) start a local MongoDB
#    e.g. docker run -d --name hireboost-mongo -p 27017:27017 mongo:7

# 5. Run web + api in parallel
npm run dev          # web on :5173, api on :4000

# 6. Sanity checks
curl http://localhost:4000/api/v1/health
open  http://localhost:5173

# Type-check / build everything (shared → api → web)
npm run typecheck
npm run build
```

---

## Workspace Scripts

All commands run from the repo root.

| Script              | What it does                                                |
| ------------------- | ----------------------------------------------------------- |
| `npm run dev`       | Run web + api in parallel (web :5173, api :4000)            |
| `npm run dev:web`   | Run only the frontend                                       |
| `npm run dev:api`   | Run only the backend (`tsx watch`)                          |
| `npm run build`     | Build shared → api → web in order                           |
| `npm run start:api` | Run the compiled API from `apps/api/dist/server.js`         |
| `npm run typecheck` | Strict TS type-check across all workspaces                  |
| `npm run lint`      | Lint all workspaces                                         |
| `npm run format`    | Prettier-format the whole repo                              |
| `npm run clean`     | Remove `dist/` outputs and per-package build caches         |

---

## Environment Variables

The repo uses **three layers** of env files:

1. **`/.env`** — repo-wide shared defaults (rare; mostly for `NODE_ENV` and tool config).
2. **`apps/web/.env`** — Vite-prefixed (`VITE_*`) browser-safe values.
3. **`apps/api/.env`** — server secrets (Mongo URI, JWT, AI keys, OAuth).

See `/.env.example` for the canonical list. Per-app `.env.example` files appear in Phases 2 and 3.

> **Never commit `.env` files.** They are gitignored.

---

## Phased Build Roadmap

| Phase | Scope                                           | Status      |
| ----- | ----------------------------------------------- | ----------- |
| 1     | Monorepo setup (workspaces, tsconfig, scripts)  | ✅ Done      |
| 2     | Frontend foundation (Vite + Tailwind + shadcn)  | ✅ Done      |
| 3     | Backend foundation (Express + Mongo + logger)   | ✅ Done      |
| 4     | Authentication (JWT + Google OAuth, refresh)    | ✅ Done      |
| 5     | Job Description Intake                          | ✅ Done      |
| 6     | Resume Upload + Parsing                         | ✅ Done      |
| 7     | ATS Analyzer engine                             | ✅ Done      |
| 8     | AI Resume Enhancer (Gemini/OpenAI provider)     | ✅ Done      |
| 9     | Resume Diff + Review                            | ⏳ Next      |
| 10    | Resume Editor + PDF export                      | ⏳ Pending   |
| 11    | Notifications + Profile + Settings              | ⏳ Pending   |
| 12    | PWA + AWS deployment + final polish             | ⏳ Pending   |

See `docs/ARCHITECTURE.md` for the longer-form architectural notes.

---

## Deployment (preview — full guide arrives in Phase 12)

- **Frontend** → Vite static build deployed to **AWS S3** behind **CloudFront** with SPA fallback to `index.html`.
- **Backend** → Containerized Express server on **AWS EC2** or **Elastic Beanstalk**, fronted by ALB, talking to **MongoDB Atlas**.
- **Secrets** → AWS SSM Parameter Store / Secrets Manager (mapped to env vars at runtime).
- **Health check** → `GET /api/v1/health` (added in Phase 3).

---

## License

Proprietary — All rights reserved.
