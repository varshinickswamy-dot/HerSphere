# HerSphere — Floot Source Transfer Status

This branch is a recovery copy of the HERSPHERE Floot project. It remains separate from `main`.

## Transfer status

- Floot project ID: `9b5a70ba-5bcc-4e7f-b56a-1e238daea407`
- Source version checked: `1792237192610` (2026-10-17)
- Floot file tree: 397 listed source/config/asset paths.
- Recovery work has restored/re-restored multiple Floot source files, including pages, shared components, CSS modules, auth and application endpoints, and example files. A complete path-by-path parity audit is still needed before claiming a fully faithful transfer.
- `static/__dev/system-prompt.md` is intentionally not transferred because it contains project instruction content rather than application source.
- `static/__dev/history.md` is generated/read-only and is not included.
- `.env` was removed from this branch because local environment files should not be committed; `.env.example` remains.
- `.gitignore` now excludes local environment files, dependencies, build output, caches, and local app data. Previously committed cache artifacts still need review.
- The original `main` branch has not been modified or merged.

## Verification

- Latest Floot typecheck: clean. Floot also reported one hosting-cost warning: `helpers/useAuth.tsx` polls the auth session every five minutes. This is a cost/architecture warning, not a type error; decide whether periodic session revalidation is required before changing behavior.
- Latest Floot test run: 4 spec files passed, 0 failed:
  - `helpers/themeMode.spec.tsx`
  - `helpers/securityValidation.spec.tsx`
  - `helpers/useMediaQuery.spec.tsx`
  - `helpers/useDebounce.spec.tsx`
- These checks ran in Floot, not against the GitHub recovery branch.
- Added `.github/workflows/hersphere-verify.yml` to run `npm run verify` on pushes to this branch and on relevant pull requests. Its GitHub Actions result must be checked before considering the separate `apps/` implementation verified.
- A complete file-by-file comparison and independent GitHub build/test remain outstanding. Do not treat the branch as fully validated or production-ready yet.

## Remaining work

1. Compare all 397 Floot paths against the recovery branch and repair any confirmed truncation or missing files.
2. Audit size/content mismatches rather than blindly replacing files; distinguish real truncation from line endings and legitimate differences.
3. Review and remove committed cache artifacts where safe.
4. Check the new GitHub Actions run and fix any verified failures in the implementation it actually tests.
5. Audit environment variables, auth/database provisioning, realtime integrations, and any Floot-specific dependencies before any migration or deployment.
6. Review the hosting-cost warning for auth polling.
7. After validation, review a pull request before merging anything into `main`. No production publish has been performed by this recovery workflow.

## Branch

`floot-source-recovery`
