# HerSphere — Floot Source Transfer Status

This branch is a recovery copy of the HERSPHERE Floot project. It remains separate from `main`.

## Transfer status

- Floot project ID: `9b5a70ba-5bcc-4e7f-b56a-1e238daea407`
- Source version checked: `1792237192610` (2026-10-17)
- Floot file tree: 397 listed source/config/asset paths.
- A total of 49 source files have been restored or re-restored during recovery to remove accidental line-number prefixes and recover original Floot content.
- `static/__dev/system-prompt.md` is intentionally not transferred because it contains project instruction content rather than application source.
- `static/__dev/history.md` is generated/read-only and is not included.
- The original `main` branch has not been modified or merged.

## Verification

- Floot typecheck: clean at the last recorded check.
- Floot tests: `helpers/themeMode.spec.tsx`, `helpers/securityValidation.spec.tsx`, `helpers/useMediaQuery.spec.tsx`, and `helpers/useDebounce.spec.tsx` passed at the last recorded run.
- These checks were run in Floot, not against this GitHub branch.
- A complete file-by-file comparison and an independent GitHub-branch build/test are still pending. Do not treat the branch as independently validated or production-ready yet.

## Before running or deploying outside Floot

Review package scripts, environment variables, database/auth provisioning, realtime configuration, and platform-specific integrations. Never commit real credentials; use local environment variables and rotate any credential that was ever exposed in repository history. Keep generated caches and local environment files out of source control.

## Branch

`floot-source-recovery`
