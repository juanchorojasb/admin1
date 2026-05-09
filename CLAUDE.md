# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Aves y Naturaleza** — Nature tourism and birdwatching platform for Colombia. Manages tour catalog, reservations, commission-based freelancer resellers, and allied business partners.

- **Domain:** avesynaturaleza.uno / avesynaturaleza.travel
- **Stack:** Next.js 14 (App Router) + Express.js API + PostgreSQL 16 + Redis 7
- **Package manager:** npm workspaces (root manages `apps/api` and `apps/dashboard`)

---

## Development Commands

### Docker (primary workflow)
```bash
# Start dev environment (hot reload, port forwarding)
npm run dev                    # uses docker-compose.dev.yml

# Rebuild after dependency changes
docker compose -f docker-compose.dev.yml up -d --build

# View logs
docker logs avn_dashboard -f
docker logs avn_api -f

# Database
npm run db:migrate             # creates/updates schema
npm run db:seed                # populates tours, admin user
```

### Inside containers / local dev (without Docker)
```bash
# API
cd apps/api
npm run dev        # tsx watch mode
npm run build      # tsc → dist/
npm run lint       # ESLint

# Dashboard
cd apps/dashboard
npm run dev        # Next.js dev server
npm run build      # standalone Next.js build
npm run type-check # TypeScript check without emit
npm run lint
```

### VPS production (docker-compose.vps.yml)
```bash
docker compose -f docker-compose.vps.yml up -d --build
# System Nginx acts as proxy — no Docker nginx container
```

---

## Architecture

### Docker services
| Container | Image | Port | Purpose |
|-----------|-------|------|---------|
| avn_dashboard | Next.js 14 standalone | 3000 | Frontend |
| avn_api | Express TypeScript | 4000 | REST API |
| avn_postgres | postgres:16-alpine | 5432 | Database |
| avn_redis | redis:7-alpine | 6379 | Cache/sessions |

Three compose files: `dev` (hot-reload volumes), `prod` (Docker Nginx + SSL), `vps` (system Nginx, ports bound to 127.0.0.1).

### API (`apps/api/src/`)
Express app with JWT auth + RBAC. All routes under `/api/v1/`.

Module pattern: `*.routes.ts` → `*.controller.ts` → `*.service.ts` + `*.schema.ts` (Zod validation)

Modules: `auth`, `users`, `tours`, `reservas`, `comisiones`, `aliados`, `payments`

Standard response shape:
```json
{ "success": true, "data": {}, "message": "", "pagination": { "total": 0, "page": 1, "limit": 20, "totalPages": 0 } }
```

Auth: `Authorization: Bearer <accessToken>` header. Roles: `admin`, `cliente`, `freelance`, `aliado`.

### Dashboard (`apps/dashboard/src/`)
Next.js 14 App Router. Route groups by role: `(dashboard)/admin`, `(dashboard)/cliente`, `(dashboard)/freelance`, `(dashboard)/aliado`.

State: Zustand (auth store) + TanStack React Query (server data). Forms: React Hook Form + Zod. UI: Radix UI primitives + TailwindCSS.

Path alias `@/*` → `src/*` in both apps.

### Database schema
Key tables and relationships:
- `users` → roles + referral codes; one-to-one with `freelance_profiles` or `aliado_profiles`
- `tours` → JSONB columns for itinerary/includes/excludes; linked to `tour_availability` (date + departure_city slots)
- `reservations` → references user, tour, availability, optional freelance; tracks deposit/balance/commission
- `payments` + `wompi_transactions` → Wompi (Colombian gateway) payment logs
- `refresh_tokens` → JWT rotation
- `badges` + `user_badges` + `user_parks_visited` → gamification

Schema init: `infra/postgres/init.sql`. Migration/seed scripts: `apps/api/src/config/migrate.ts` and `seed.ts`.

Default admin: `admin@avesynaturaleza.travel` / `Admin2024!`

### Nginx (system-level on VPS)
- Config: `/etc/nginx/sites-enabled/avesynaturaleza`
- Proxies port 80/443 → 3000 (dashboard) and 4000 (api)
- SSL: via Cloudflare or Certbot (pending)

---

## Environment Variables

Copy `.env.example` to `.env`. Key groups:
- **DB_PASSWORD** — PostgreSQL password
- **JWT_SECRET / JWT_REFRESH_SECRET** — generate with `openssl rand -hex 32`
- **WOMPI_*** — Colombian payment gateway keys
- **SMTP_*** — Gmail app password (not regular password) for transactional email
- **ALLOWED_ORIGINS** — CORS whitelist

`NEXT_PUBLIC_WOMPI_PUBLIC_KEY` is the only env var exposed to the browser.

---

## RBAC Roles

| Role | Access |
|------|--------|
| `admin` | Full access, manages everything |
| `cliente` | Books tours, views own reservations |
| `freelance` | Resells tours, tracks commissions |
| `aliado` | Partner businesses (ecohotel, transporte, restaurante) |

---

## No Tests

No test framework is configured. There are no test scripts or test files.
