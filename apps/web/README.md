# @hireboost/web

Frontend workspace for HireBoost AI — Vite + React 18 + TypeScript + Tailwind + shadcn-style UI.

## Status

- **Phase 1**: scaffold ✅
- **Phase 2**: foundation — routing, theme, marketing pages, auth pages, dashboard shell ✅
- **Phase 3**: backend foundation now live at `http://localhost:4000/api/v1` (the axios client points here; first real query is `/api/v1/health`)
- **Phase 4**: real auth flow (JWT) replaces the dev bypass
- **Phase 5+**: feature pages get fully wired (currently render a polished placeholder)

## Local dev

```bash
cp .env.example .env
npm install      # from repo root, installs all workspaces
npm run dev      # from repo root → starts Vite on http://localhost:5173
# or
npm run dev:web  # from repo root, same thing
```

> The dev shell auto-bypasses the auth guard (`PHASE_2_DEV_BYPASS`) so every screen is browsable. Phase 4 flips this to a strict guard once `/api/v1/auth/login` lands.

## Project layout

```
src/
├── app/                  # Root providers (theme, query client)
├── components/
│   ├── ui/               # shadcn-style primitives (button, card, input, sheet, …)
│   ├── shared/           # Logo, ThemeToggle, UserMenu, WorkflowStepper, PageLoader
│   └── layout/           # MarketingShell, AuthShell, AppShell, Sidebar, Topbar, Footer
├── features/
│   ├── marketing/        # Landing, Pricing, Testimonials, Contact
│   ├── auth/             # Login, Register
│   ├── dashboard/        # Dashboard
│   ├── job-intake/       # Step 1 (Phase 5)
│   ├── resume-upload/    # Step 2 (Phase 6)
│   ├── ats-review/       # Step 3 (Phase 7)
│   ├── resume-diff/      # Step 4 (Phase 9)
│   ├── resume-editor/    # Step 5 (Phase 10)
│   ├── profile/          # Phase 11
│   └── settings/         # Phase 11
├── hooks/                # use-theme, use-media-query
├── lib/                  # cn, env (zod-validated), api-client (axios), query-client
├── routes/               # Path constants, router, NotFound
├── store/                # Zustand: auth, theme
└── styles/               # globals.css with HSL design tokens
```

## Design system

- Tailwind CSS with CSS-variable design tokens (`hsl(var(--primary))` etc.).
- Light/dark/system theme via `useThemeStore`, applied as `class="dark"` on `<html>`.
- shadcn-style components manually authored (no CLI runtime), wired to the same tokens.
- Premium SaaS feel: indigo→violet gradient accents, soft shadows, glass surfaces, grid hero.

## Pages already shipping

| Route                     | Layout    | Notes                                                |
| ------------------------- | --------- | ---------------------------------------------------- |
| `/`                       | Marketing | Hero, features, how-it-works, CTA                    |
| `/pricing`                | Marketing | 3-tier card layout with highlight                    |
| `/testimonials`           | Marketing | Quote cards                                          |
| `/contact`                | Marketing | RHF + Zod form, sonner toast                         |
| `/login`                  | Auth      | RHF + Zod, Google scaffold                           |
| `/register`               | Auth      | RHF + Zod with confirm-password refinement           |
| `/app/dashboard`          | App       | Stats, workflow stepper, quick actions, empty states |
| `/app/job-description`    | App       | Stepper + Phase-5 placeholder card                   |
| `/app/resume-upload`      | App       | Stepper + Phase-6 placeholder card                   |
| `/app/ats-review`         | App       | Stepper + Phase-7 placeholder card                   |
| `/app/resume-diff`        | App       | Stepper + Phase-9 placeholder card                   |
| `/app/resume-editor`      | App       | Stepper + Phase-10 placeholder card                  |
| `/app/profile`            | App       | Phase-11 placeholder card                            |
| `/app/settings`           | App       | Phase-11 placeholder card                            |
