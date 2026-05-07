# Plan: Fix Eden Treaty Type Errors

## Objective
Fix the pre-existing TypeScript errors in `apps/web/src/api/client.ts` preventing the pre-commit hook from passing.

## Steps
1. Add `elysia` as a `devDependency` to `apps/web/package.json`.
2. Update `@elysiajs/eden` to `^1.4.2` in `apps/web/package.json` to match the backend version.
3. Run `bun install` to sync the lockfile.
4. Run `bun run typecheck` to verify the fix.
5. Proceed with the pending git commit.