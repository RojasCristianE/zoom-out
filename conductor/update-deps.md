# Plan: Comprehensive Dependency Update

## Objective
Update all identified outdated packages to their latest compatible versions while ensuring monorepo stability through incremental verification.

## Target Updates

### Stage 1: Core Framework (React)
- **`apps/web/package.json`**: Update `react` and `react-dom` to `^19.2.6`.
- **`packages/ui/package.json`**: Update peer dependencies `react` and `react-dom` to `^19.2.6`.

### Stage 2: Development & Build Tools (Vite & TypeScript)
- **`apps/api/package.json`**: Update `typescript` to `^6.0.3`.
- **`apps/web/package.json`**: Update `vite` to `^8.0.10`, `@vitejs/plugin-react` to `^6.0.1`, and `typescript` to `^6.0.3`.

### Stage 3: Database Layer (Drizzle)
- **`apps/api/package.json`**: Update `drizzle-orm` to `^0.45.2` and `drizzle-kit` to `^0.31.10`.

## Implementation Steps
1. Modify the respective `package.json` files using the `replace` tool according to the stages defined above.
2. Execute `bun install` at the monorepo root to resolve and link all updated dependencies.
3. Verification:
   - Run `bun run typecheck` across all workspaces to ensure the TypeScript 6 update and Drizzle type changes do not break the codebase.
   - Run `bun run lint:fix` to ensure formatting and linting rules remain consistent.
4. Commit the changes if all checks pass successfully. If any check fails, revert the problematic stage and stabilize.