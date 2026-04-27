# @hireboost/api

Backend workspace for HireBoost AI.

## Status

- **Phase 1**: scaffold only. No Express yet. `npm run typecheck` and `npm run build` succeed.
- **Phase 3**: Express + TypeScript + MongoDB + helmet + CORS + rate-limit + Pino + health route.

## Local dev (Phase 3 onward)

```bash
cp .env.example .env
npm install
npm run dev
```

Currently `npm run dev` is a stub that prints a notice. The real Express server lands in Phase 3.

## Layout (planned)

```
src/
├── config/         # env loader, constants
├── controllers/    # HTTP boundary (thin)
├── services/       # business logic (rich)
├── repositories/   # Mongoose data access
├── models/         # Mongoose schemas
├── routes/         # versioned route registration
├── middlewares/    # auth, error, rate-limit, upload
├── validators/     # request validation (Zod)
├── providers/      # AI, OAuth, mail
├── utils/          # pure helpers
├── modules/        # feature wiring (auth, resumes, ats, ai, …)
├── app.ts          # Express app factory
└── server.ts       # process bootstrap
```
