# Zoom-Out API Agent Ctx

## App Arch
- FW: ElysiaJS.
- DB: Postgres + Drizzle ORM (`drizzle/`).
- Export `App` type (`src/index.ts`) for Eden Treaty zero-codegen.
- Schemas: `@zoom-out/validators` → req/res val.

## DB Ops
- Gen: `bun run db:generate`.
- Mig: `bun run db:migrate`.
- UI: `bun run db:studio`.

## Skills (API)
- **`typescript-advanced-types`**: Actv → Elysia routes, Drizzle schemas, strict type.
