# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Psicoreinventar is a mental health platform connecting patients with psychologists/therapists. Patients discover and book specialists; doctors manage their practice, schedule, patients, payments, and messaging. Single Next.js application (not a monorepo).

## Tech Stack

- **Framework**: Next.js 16 (App Router) with TypeScript (strict) and Cache Components enabled
- **Auth**: better-auth with Drizzle adapter, email/password + Google OAuth
- **Database**: PostgreSQL via Drizzle ORM, Redis via Upstash
- **UI**: shadcn/ui + Radix UI + Tailwind CSS v4
- **State/Data**: TanStack Query v5, TanStack Form v1, TanStack Table v8
- **Validation**: Zod v4
- **Real-time**: Pusher (WebSockets)
- **Email**: Resend + react-email templates
- **Package manager**: pnpm

> **Important**: The `.cursorrules` and `.cursor/rules/backend-guide.mdc` files reference an **outdated** stack (Prisma, Auth.js, Zustand, React Hook Form). The actual stack is listed above.

## Common Commands

**Always use `pnpm`, not `npm`**

```bash
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm lint             # Run ESLint

# Database (PostgreSQL + Redis via Docker)
pnpm docker:start     # Start PostgreSQL + Redis containers
pnpm docker:stop      # Stop containers
pnpm db:generate      # Generate migration SQL from schema changes
pnpm db:migrate       # Apply migrations
pnpm db:push          # Push schema directly (dev only)
pnpm db:studio        # Open Drizzle Studio UI
pnpm db:seed          # Seed database
pnpm db:reset         # Full reset: drop + delete + generate + push + seed

# Email
pnpm email            # Preview email templates in dev
```

No test framework is configured.

## Architecture

### Directory Structure

- `app/` — Next.js App Router pages and API routes
  - `(auth)/` — Login, register, verify-email, reset-password
  - `(dashboard)/dashboard/` — Protected dashboard (appointments, messages, patients, payments, profile, progress)
  - `(doctor)/` — Doctor registration flow
  - `(marketing)/` — Public marketing pages
  - `api/` — REST API routes
- `src/db/` — Drizzle schema (`schema.ts`), migrations, seed, connection
- `src/dal/` — Data Access Layer: typed query functions per entity, keeps DB logic out of routes
- `src/types/` — Shared TypeScript types and enums (Role, Conditions, Service, AppointmentStatus)
- `lib/auth/` — better-auth config, client, session helpers
- `lib/queries/` — API client, TanStack Query key factory (`queryKeys`), stale times
- `lib/schema/` — Zod validation schemas
- `actions/` — Next.js Server Actions
- `components/ui/` — shadcn/ui components
- `components/emails/` — react-email templates
- `config/` — App config (routes, dashboard nav, marketing)
- `hooks/` — React hooks
- `utils/` — Utilities (env, bcrypt, tryCatch, format-price, API auth middleware)

### Key Patterns

- **Route Groups**: `(auth)`, `(dashboard)`, `(doctor)`, `(marketing)` for layout isolation
- **RSC first**: `"use client"` only where necessary (forms, interactive UI)
- **DAL pattern**: `src/dal/` wraps all Drizzle queries — API routes and server actions call DAL functions, never query DB directly
- **API response shape**: `{ success: true, data }` or `{ success: false, error: { code, message } }`
- **Query key factory**: Centralized in `lib/queries/query-keys.ts` — hierarchical keys for all entities and sub-resources
- **tryCatch utility** (`utils/tryCatch.ts`): Wraps promises returning `{ data?, error? }` — use instead of try/catch blocks
- **Role-based access**: `Role` enum (`patient`, `doctor`, `admin`); no root middleware.ts — route protection via session checks in layouts/pages
- **Auth context**: `AsyncLocalStorage`-based `authContext` in `lib/auth/auth-context.ts` injects role during sign-up
- **Dev auth bypass**: In development, API routes accept `Authorization: Bearer <DEV_AUTH_TOKEN>` header
- **Soft delete**: Appointments use a `deletedAt` timestamp

### Path Alias

`@/` maps to the project root (not `./src/`).

### Adding shadcn Components

```bash
pnpm dlx shadcn@latest add <component>
```

## Code Conventions

- **Files/directories**: `kebab-case`
- **Components**: Named exports, PascalCase
- **Variables**: `camelCase`; booleans use auxiliary verbs (`isLoading`, `hasError`)
- **Functions**: `function` keyword for pure functions; verb-prefixed names
- **No classes** — functional, declarative style throughout
- **Prefer interfaces** over type aliases
- **Early returns** for readability
- **Functional programming**: prefer `map`/`filter`/`reduce`

## Design System (Marketing Pages)

Detailed guidelines in `.md/design_system_guidelines.md`. Key points:

- **Light theme only** — cream (`#FAFAFA`) and white backgrounds, no dark mode
- **Font**: Inter; headings use `font-normal` (not bold), large sizes
- **Patient accent**: Indigo/purple (`indigo-600`); **Therapist accent**: Teal (`teal-700`)
- **Cards**: Subtle shadows (`shadow-sm`), rounded corners, generous padding
- **Spacing**: Mobile-first responsive; generous whitespace (`py-16 sm:py-24`)
- **Avoid**: Heavy shadows, gradient text, bold headings, saturated colors, dark mode
