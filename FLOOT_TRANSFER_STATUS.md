# HerSphere — Floot Source Transfer Status

This branch is a recovery copy of the HERSPHERE Floot project.

## Transfer status

- Floot project ID: `9b5a70ba-5bcc-4e7f-b56a-1e238daea407`
- Source version inspected: `1791889650009`
- Source files listed by Floot: 397
- Verified matching source paths on this branch: all 397 listed paths except the generated history file and the project instruction prompt.
- `static/__dev/system-prompt.md` is intentionally not copied because it is project-instruction content rather than application source.
- `static/__dev/history.md` is generated/read-only and is not included.
- Original `main` branch has been left unchanged.

## Verification in Floot

- Project typecheck: clean.
- Tests: `helpers/themeMode.spec.tsx`, `helpers/securityValidation.spec.tsx`, `helpers/useMediaQuery.spec.tsx`, and `helpers/useDebounce.spec.tsx` passed.

## Notes before running outside Floot

This repository branch is a source recovery branch, not a claim that the project is already independently deployable outside Floot. Review package scripts, environment variables, database/auth provisioning, realtime configuration, and platform-specific integrations before running or deploying it elsewhere. Never commit real credentials; use local environment variables and rotate any credential that was ever exposed in repository history.

## Branch

`floot-source-recovery`
