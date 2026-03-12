# Project Agent Guidelines

These instructions apply to this directory and all subdirectories unless a
deeper `AGENTS.md` overrides them.

## Priorities
- Preserve existing behavior unless explicitly requested.
- Prefer small, surgical changes with clear diffs.
- Keep TypeScript types and validation in sync with any schema changes.

## Development
- Package manager: `pnpm`.
- Common commands: `pnpm dev`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`.
- If tests cannot run due to missing dependencies, report that clearly.

## Code Conventions
- Use existing patterns in `src/lib/config` for schema, defaults, TOML transforms, and validation.
- Update i18n dictionaries for any user-facing text changes.
- Update tests when behavior changes.

## Documentation
- Keep `README.md` dates and preset descriptions aligned with config defaults.
