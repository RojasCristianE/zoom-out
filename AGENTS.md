# Zoom-Out Agent Ctx

## Agent Rules (MANDATORY)
1. Eng tech terse (Agent + Engram mem).
2. `caveman` skill `ultra` mode → optimize txt.
3. LLM token-opt max.

### Communication Style (Caveman Ultra)
- **Rule**: Respond terse like smart caveman. All technical substance stay. Only fluff die.
- **Drop**: Articles (a/an/the), filler words, pleasantries, hedging.
- **Pattern**: `[thing] [action] [reason]. [next step].`
- **Ultra specifics**: Abbreviate prose (DB/auth/config/req/res/fn/impl). Strip conjunctions. Use arrows for causality (X → Y). One word when one word enough. Code symbols/errors never abbreviate.

## Overview
P2P/SFU video sys. Self-hosted. Bun monorepo.

## Stack
- Run: Bun
- API: ElysiaJS (`apps/api`)
- Web: React+Vite (`apps/web`)
- DB: Postgres+Drizzle
- SFU: LiveKit
- S3: MinIO
- AI: Faster-Whisper
- Infra: Docker Compose

## Arch
Eden Treaty → share types API↔Web. No codegen. See app `AGENTS.md` for specific arch details.

### Code Stds
- Lint/Fmt: Biome → `bun run lint:fix` req pre-commit.
- TS: Strict (`tsconfig.base.json`).
- Env: Auto via `bun --env-file .env`.
- Aliases:
  - `@api/` → `apps/api/src/`
  - `@web/` → `apps/web/src/`
  - `@db/` → `apps/api/drizzle/`
  - `@shared/` → `packages/shared-types/src/`
  - `@validators/` → `packages/validators/src/`
  - `@ui/` → `packages/ui/src/`
  - NO `../../`.
- Commits: SPANISH. Conventional format translated (`inicio`, `arreglo`, `tarea`, etc).
- Lang: Code comments + user docs = SPANISH. Engram/Agents = Eng tech terse (caveman ultra).

## Build/Run
- Setup: `bun run setup` (cp .env → init docker → db migrate).
- Full dev: `bun run dev`.
- App dev (docker up): `bun run dev:apps`.

## QA
- Lint: `bun run lint`.
- Fix: `bun run lint:fix`.
- Type: `bun run typecheck`.
- Test: `bun run test`.

## Git/Hooks (Lefthook)
- `pre-commit`: biome + typecheck (parallel) + `engram sync`.
- `commit-msg`: Verify SPANISH + conv format.
- `post-commit`: `codebase-memory-mcp index_repository` (bg).
- `post-merge`: `engram sync --import` + bg re-index.
- `pre-push`: `bun run test`.

### Commit Types (ES)
- `inicio`: feat.
- `arreglo`: fix.
- `mejoras`: perf/refactor.
- `docs`: docs.
- `estilo`: style.
- `refactor`: refactor.
- `test`: test.
- `tarea`: chore.
- `infra`: ci/docker.

## Struct
- `apps/api`: ElysiaJS.
- `apps/web`: React.
- `packages/shared-types`: Types.
- `packages/validators`: TypeBox.
- `packages/ui`: React ui.
- `infra/`: Docker/LiveKit/MinIO cfg.

## Skills (Global)
- **`caveman`**: Always actv (ultra).
- **`bun`**: Actv → cfg monorepo, deps, test, build.
- **`typescript-advanced-types`**: Actv → complex types (`packages/shared-types`, `packages/validators`).
- **`bash-defensive-patterns`**: Actv → CI/CD, Git hooks, `.sh`.

<!-- skilld -->
Before modifying code, evaluate each installed skill against the current task.
For each skill, determine YES/NO relevance and invoke all YES skills before proceeding.
<!-- /skilld -->
