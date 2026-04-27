# @hireboost/api

Backend workspace for HireBoost AI — Express + TypeScript + MongoDB.

## Status

- **Phase 1**: scaffold ✅
- **Phase 3**: Express foundation, helmet + CORS allowlist + rate-limit, Pino logger, Mongo connector, central error handler, `GET /api/v1/health` ✅
- **Phase 4**: real auth — bcrypt + JWT (access + refresh), HttpOnly refresh cookie, Google OAuth (code + id_token + state), `requireAuth`/`requireRole`, Zod request validator ✅
- **Phase 5+**: feature modules (job description, resumes, ATS, AI, diff, editor, notifications)

## Local dev

```bash
cp .env.example .env       # then edit MONGODB_URI / JWT_SECRET as needed
npm install                # from repo root, installs all workspaces
npm run dev:api            # from repo root → http://localhost:4000/api/v1
# or run web + api together:
npm run dev:all
```

The dev server uses `tsx watch` for instant TS reload. In dev, if Mongo is unavailable the HTTP server still boots and `/api/v1/health` reports `database: { connected: false }`. In production, a missing DB is a fatal startup error.

## Endpoints

### Health

| Method | Path                  | Behavior                                                                  |
| ------ | --------------------- | ------------------------------------------------------------------------- |
| GET    | `/`                   | Friendly root describing the API and prefix.                              |
| GET    | `/api/v1/health`      | 200 with service info, uptime, DB component status, runtime/memory stats. |

### Auth (Phase 4)

| Method | Path                              | Auth   | Behavior                                                          |
| ------ | --------------------------------- | ------ | ----------------------------------------------------------------- |
| POST   | `/api/v1/auth/register`           | public | Create local account → returns `AuthSession` + sets refresh cookie |
| POST   | `/api/v1/auth/login`              | public | Email + password → returns `AuthSession` + sets refresh cookie     |
| POST   | `/api/v1/auth/refresh`            | cookie | Reads `hb_rt` HttpOnly cookie → new `AuthSession`                  |
| POST   | `/api/v1/auth/logout`             | any    | Clears refresh cookie (204)                                        |
| GET    | `/api/v1/auth/me`                 | bearer | Current authenticated user                                         |
| GET    | `/api/v1/auth/google`             | public | 302 to Google consent (or to `/login?error=…` if not configured)   |
| GET    | `/api/v1/auth/google/callback`    | public | Exchanges code, upserts user, redirects to `WEB_APP_URL` callback  |

Access tokens are returned in the response body and expected as `Authorization: Bearer <token>`. Refresh tokens are stored in an HttpOnly cookie (`hb_rt`) and never touch JS. The frontend's axios instance refreshes silently on a 401 and retries the original request once.

The health response is the canonical `ApiResponse<T>` envelope from `@hireboost/shared`:

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "service": "@hireboost/api",
    "env": "development",
    "version": "0.1.0",
    "uptimeSeconds": 14,
    "components": { "database": { "connected": true, "state": "connected" } },
    "runtime": { "node": "v20.x", "pid": 12345, "memoryMb": { "rss": 96, "heapUsed": 20 } }
  }
}
```

## Layout

```
src/
├── app.ts                      # Express app factory (helmet, cors, parsers, routes)
├── server.ts                   # Process bootstrap + graceful shutdown
├── config/
│   ├── env.ts                  # Zod-validated env loader (fails fast on bad config)
│   ├── logger.ts               # Pino logger + pino-http middleware
│   └── db.ts                   # Mongoose connect / disconnect / status helpers
├── middlewares/
│   ├── async-handler.ts        # Promise-aware route wrapper
│   ├── error-handler.ts        # Central error → ApiError envelope
│   ├── not-found.ts            # 404 catch-all
│   ├── rate-limit.ts           # Default + auth limiters
│   └── request-id.ts           # X-Request-Id propagation
├── modules/
│   ├── auth/                   # Phase 4 — JWT + Google OAuth
│   │   ├── auth.controller.ts
│   │   ├── auth.cookies.ts     # Refresh-token cookie helpers
│   │   ├── auth.routes.ts
│   │   ├── auth.service.ts
│   │   └── google-oauth.service.ts
│   ├── health/
│   │   ├── health.controller.ts
│   │   └── health.routes.ts
│   └── users/
│       ├── user.model.ts       # Mongoose schema + .toPublic()
│       └── user.service.ts
├── routes/
│   └── index.ts                # buildApiRouter() — versioned API surface
└── utils/
    ├── api-error.ts            # `class ApiError` with static factories
    ├── api-response.ts         # `ok()`, `created()`, `noContent()`, `fail()`
    ├── jwt.ts                  # signAccessToken / signRefreshToken / verify*
    └── password.ts             # bcrypt hash + verify
```

Future feature modules (auth, resumes, ats, ai, …) plug in under `src/modules/<feature>/` and register a router in `routes/index.ts`.

## Design notes

- **Envelope-first**: every response — success or error — matches `ApiResponse<T>` from `@hireboost/shared`. Controllers use `ok()` / `fail()`; thrown `ApiError`s are converted by the central handler.
- **Errors as data**: `throw ApiError.notFound(...)` is the idiomatic way to bail out. ZodError, Mongoose ValidationError/CastError, and Mongo duplicate-key errors are auto-mapped.
- **Observability**: `pino-http` logs every request with the same id that's surfaced in `X-Request-Id` so client logs and server logs join cleanly.
- **Security baseline**: `helmet` defaults, CORS allowlist driven by `CORS_ORIGINS`, body size limits, `express-rate-limit` on the entire `/api/v1` surface.
- **Graceful shutdown**: SIGTERM/SIGINT close the HTTP server then disconnect from Mongo with a 10s force-exit safety net.
