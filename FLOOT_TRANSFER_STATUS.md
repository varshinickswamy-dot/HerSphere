# HerSphere — Floot Source Transfer Status

This branch is a recovery copy of the HERSPHERE Floot project. It remains separate from `main`.

## Current status

- Floot project ID: `9b5a70ba-5bcc-4e7f-b56a-1e238daea407`
- Floot source version checked: `1793285621690` (2026-10-29)
- Floot tree lists 397 project source/configuration paths.
- The recovery branch contains the Floot page/component/endpoint source and the separate `apps/` implementation. These are distinct implementations; successful checks of one do not prove the other is production-ready.
- Login and registration pages plus their shared forms/styles are committed on this branch.
- `.env` was removed; `.env.example` remains. Do not commit real secrets.
- `.gitignore` excludes environment files, dependencies, caches, build output and local app data, but historical `.npm-cache/` files remain tracked and should be removed.
- `static/__dev/system-prompt.md` and generated/read-only `static/__dev/history.md` are intentionally not transferred.
- `main` has not been modified or merged. No production publish was performed.

## Verification (2026-10-29)

- Floot TypeScript check: clean.
- Default Floot test run: 2 spec files passed, 0 failed (`helpers/themeMode.spec.tsx`, `helpers/securityValidation.spec.tsx`). Two hook specs are excluded by default; they should be run explicitly before release.
- The GitHub Actions workflow `.github/workflows/hersphere-verify.yml` runs `npm run verify` for the repository's `apps/` implementation. It does not typecheck the Floot React pages/components against the Floot runtime.
- Auth polling cost warning was addressed in Floot `helpers/useAuth.tsx`: periodic five-minute polling was removed; session revalidation now relies on window focus/reconnect and the existing query freshness policy. The same change is committed to this recovery branch.
- Recovery branch currently compares as 200 commits ahead of `main`, 0 behind. This is a recovery branch, not a reviewed release.

## Remaining work before release

1. Complete a content-level parity audit of the 397 Floot paths and repair any confirmed missing/truncated files. Size differences alone are not proof of corruption.
2. Remove previously committed `.npm-cache/` logs/artifacts from Git history's current tree (keep them ignored going forward).
3. Run the excluded hook tests explicitly and add focused tests for login, registration, logout, session expiry, company registration, and authorization/role boundaries.
4. Test auth and every major feature end-to-end with a configured database and safe test accounts; confirm migrations/schema and required environment variables.
5. Validate AI, job/opportunity data, email, realtime, resume upload, and other integrations with real configuration; document any mocked or unavailable services.
6. Run the GitHub app's build/tests and separately validate the Floot app in its own runtime. The existing GitHub workflow does not cover all Floot source.
7. Verify accessibility, responsive layouts, error/loading/empty states, rate limiting, session-cookie settings, privacy and security behavior.
8. Recheck hosting usage and confirm that focus-based auth refresh is sufficient for session revocation requirements.
9. Only after the above, review a pull request and explicitly approve any merge or production publish.

## Branch

`floot-source-recovery`
