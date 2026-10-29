# HerSphere — Floot Source Transfer Status

This is a recovery branch for the HERSPHERE Floot project. Keep it separate from `main` until reviewed.

## Current status (2026-10-29)

- Floot project ID: `9b5a70ba-5bcc-4e7f-b56a-1e238daea407`
- Floot source version: `1793286642874`
- Floot file inventory: 397 paths.
- Latest source-presence audit: all 397 listed Floot paths are present in the GitHub recovery branch (excluding intentionally omitted generated/read-only developer metadata where applicable). This checks paths, not byte-for-byte equivalence.
- Login and registration pages, auth forms/styles, and related endpoint/schema files are present in the branch.
- Removed all tracked `.npm-cache/` artifacts from the branch tree; `.gitignore` continues to exclude caches and local secrets.
- Auth session polling was removed in `helpers/useAuth.tsx`; refresh now relies on window focus/reconnect and React Query freshness. This reduces idle database polling but should be verified against session-revocation expectations.
- Added validation coverage for login inputs and personal/company account-type selection in `helpers/securityValidation.spec.tsx`.
- No production publish or merge into `main` has been performed.

## Latest verification

- Floot typecheck: clean.
- Floot tests: 4 spec files passed, 0 failed: theme mode, security validation, media query, and debounce.
- GitHub Actions runs for earlier commits completed successfully. The latest run for the current validation-test commit was still in progress at the last check: https://github.com/varshinickswamy-dot/HerSphere/actions/runs/40898928267
- GitHub Actions verifies the repository's `apps/` implementation; it does not typecheck the separate Floot React source against the Floot runtime.
- Recovery branch is ahead of `main`; keep `main` untouched pending review.

## Remaining work before release

1. Content-level parity audit: compare source content, not only paths; review file-size/content mismatches and repair only confirmed issues.
2. Add endpoint-level tests for login, registration, logout, session expiry, duplicate email, rate limiting, and company registration using mocked database dependencies or an isolated test database.
3. Perform real end-to-end authentication tests with safe test accounts and a configured database. Confirm company registration creates the expected company profile and recruiter workspace.
4. Verify authorization boundaries for admin, student, recruiter/company, and unauthenticated requests. Ensure company-only operations cannot be accessed by personal accounts.
5. Validate database schema/migrations and required environment variables without committing real credentials.
6. Validate AI, opportunity feeds, scholarships, email, realtime, resume upload, and any external integrations; distinguish live integrations from placeholders/mocks.
7. Validate the Floot runtime independently from the GitHub `apps/` implementation, including mobile/responsive UI, loading/error/empty states, accessibility and privacy.
8. Recheck hosting use and confirm focus-based session refresh is appropriate for session revocation and shared-device scenarios.
9. Review the latest GitHub Actions run, then prepare a pull request only after the checks above. Do not merge or publish without explicit approval.

## Branch

`floot-source-recovery`
