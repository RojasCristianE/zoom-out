# Zoom-Out — Architecture Decision Record

## 1. System Overview

**Zoom-Out** is a private, secure, self-hosted video conferencing system built as a Bun monorepo. It provides encrypted video rooms with recording and transcription capabilities, managed by an administrator through a closed authentication model.

**Runtime:** Bun | **API:** ElysiaJS | **Frontend:** React 19 + Vite 6 | **DB:** PostgreSQL + Drizzle ORM | **Media:** LiveKit SFU | **Storage:** MinIO (S3-compatible) | **AI:** Faster-Whisper

---

## 2. Architecture Decisions

### ADR-001: Closed Authentication Model (Admin-Only User Creation)
- **Status:** Accepted
- **Context:** The system must be private and secure; open registration is not allowed.
- **Decision:** There is no public `/signup` endpoint. Users are created exclusively through the admin-protected `POST /users/` endpoint in the `usersModule`. The system is bootstrapped via `bun run db:seed` which creates the initial Super Admin account (`admin@zoomout.local`).
- **Consequences:** Every new user must be manually added by an admin. The login flow (`POST /login`) is the only public auth endpoint.

### ADR-002: Zero-Codegen Type Sharing via Eden Treaty
- **Status:** Accepted
- **Context:** Frontend and backend need shared types without a code generation step.
- **Decision:** The API (`apps/api`) exports the `App` type from `src/index.ts`. The frontend (`apps/web`) consumes it in `src/api/client.ts` via `@elysiajs/eden`. Validation schemas are defined in `@zoom-out/validators` using TypeBox.
- **Consequences:** Type safety is achieved at compile-time without codegen. Changes to API routes are instantly reflected in frontend type-checking.

### ADR-003: Path Aliases for Clean Imports
- **Status:** Accepted
- **Context:** Deep relative imports (`../../../`) are fragile and hard to read.
- **Decision:** Both apps use TypeScript path aliases configured in `tsconfig.json`:
  - `@/` → `src/` (both `apps/api` and `apps/web`)
  - `@db/` → `drizzle/` (only `apps/api`)
- **Consequences:** All imports use `@/` or `@db/` prefixes. Bun resolves these at runtime from tsconfig paths. No relative imports deeper than `./` are permitted.

### ADR-004: Bun as Unified Runtime
- **Status:** Accepted
- **Context:** The project needed a fast JS runtime with native TypeScript support and built-in tooling.
- **Decision:** Bun is used as the package manager, script runner, and runtime for the API. Environment variables are loaded via `bun --env-file .env` in dev scripts.
- **Consequences:** No need for `ts-node`, `dotenv`, or separate build steps for the API. Scripts in `apps/api/scripts/` run directly via Bun.

### ADR-005: Role-Based Access Control via JWT Middleware
- **Status:** Accepted
- **Context:** Different endpoints require different permission levels.
- **Decision:** The `requireRole()` middleware validates JWT tokens and enforces role checks. Roles are: `admin`, `host`, `viewer`. The middleware is applied per-module.
- **Consequences:** Route protection is declarative and composable. Each module specifies its required roles at the top level.

---

## 3. Module Architecture

### Backend (`apps/api`)

#### Core Libraries (`src/lib/`)
| Module | Functions | Purpose |
|--------|-----------|---------|
| `auth.ts` | `hashPassword`, `verifyPassword`, `signJwt`, `verifyJwt` | Authentication primitives |
| `db.ts` | `db` (Drizzle instance) | PostgreSQL connection via Drizzle ORM |
| `env.ts` | `getEnv`, `env` | Environment variable access |
| `livekit.ts` | `createLivekitToken` | LiveKit JWT token generation |
| `minio.ts` | `getPresignedUrl`, `ensureBucket` | MinIO/S3 storage operations |

#### Middleware (`src/middleware/`)
| Module | Function | Purpose |
|--------|----------|---------|
| `requireRole.ts` | `requireRole(roles...)` | JWT validation + role-based guard |

#### API Modules (`src/modules/`)
| Module | Routes | Required Roles | Key Operations |
|--------|--------|----------------|----------------|
| `auth` | `POST /login` | Public | Password verification → JWT issuance |
| `users` | `POST /`, `GET /`, `PATCH /:id/role` | `admin` | CRUD user management |
| `rooms` | `GET /`, `POST /`, `POST /:id/join` | `admin`, `host`, `viewer` | Room CRUD + LiveKit token generation |
| `recordings` | `GET /`, `GET /:id` | `admin`, `host` | Recording listing + presigned download URLs |

#### Call Graph (Key Flows)
```
Login Flow:    POST /login → verifyPassword() → signJwt() → JWT token
Room Join:     POST /rooms/:id/join → requireRole() → createLivekitToken() → LiveKit JWT
User Create:   POST /users/ → requireRole('admin') → hashPassword() → DB insert
Recording DL:  GET /recordings/:id → requireRole() → getPresignedUrl() → MinIO URL
Seed Script:   seed() → hashPassword() → DB insert (admin user)
```

### Frontend (`apps/web`)

#### Entry Point
`main.tsx` → `App.tsx` → React Router

#### Pages
| Component | Route | Purpose |
|-----------|-------|---------|
| `Login` | `/login` | Email/password authentication |
| `Dashboard` | `/` | Room list and creation (placeholder) |
| `Room` | `/room/:id` | Video conference view (LiveKit integration pending) |
| `Recordings` | `/recordings` | Recording browser (MinIO integration pending) |

#### State Management
- `store/auth.ts` — Zustand store for auth state (`AuthState` interface)
- `api/client.ts` — Eden Treaty client with JWT injection from auth store

#### Routing
`App.tsx` defines a `ProtectedRoute` wrapper that checks auth state and redirects unauthenticated users to `/login`.

---

## 4. Shared Packages

### `@zoom-out/shared-types`
Type definitions shared between API and frontend:
- **User:** `UserProfile`, `AuthTokenPayload`
- **Room:** `RoomConfig`, `RoomParticipant`, `RoomWithParticipants`
- **Recording:** `RecordingMeta`, `TranscriptSegment`, `Transcription`
- **API:** `ApiError`, `PaginatedResponse`

### `@zoom-out/validators`
TypeBox schemas for runtime validation (used by Elysia) and compile-time typing (used by Eden).

### `@zoom-out/ui`
Shared React component library (currently minimal).

---

## 5. Infrastructure

### Docker Compose Services
- **PostgreSQL** — Primary database
- **MinIO** — S3-compatible object storage for recordings
- **MinIO Init** — Bucket initialization via `infra/minio/init-buckets.sh`
- **LiveKit** — SFU media server for video/audio

### Database
- ORM: Drizzle with PostgreSQL driver
- Schema: `drizzle/schema.ts` (tables: `users`, `rooms`, `recordings`)
- Migrations: `bun run db:generate` → `bun run db:migrate`
- Seed: `bun run db:seed` (creates initial admin)

---

## 6. Technical Debt

- **Elysia `any` casts:** Some handlers use `({ body, user }: any)` due to complex context injection. Should be revisited as Elysia's type inference matures.
- **Dashboard placeholder:** Currently renders a static placeholder; needs room list + creation UI.
- **LiveKit integration:** Token generation exists but the Room page doesn't yet connect to LiveKit SDK.
- **Recording pipeline:** MinIO storage is configured but the actual recording upload/download flow is not wired end-to-end.
