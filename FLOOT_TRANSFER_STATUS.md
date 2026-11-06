# HerSphere — Floot Source Transfer Status

This is a recovery branch for the HERSPHERE Floot project. Keep it separate from `main` until reviewed.

## Current status (2026-11-06)

- Floot project ID: `9b5a70ba-5bcc-4e7f-b56a-1e238daea407`
- Floot source version: `1793965428555`
- GitHub recovery branch: `floot-source-recovery`
- Recovery branch URL: https://github.com/varshinickswamy-dot/HerSphere/tree/floot-source-recovery
- Removed all tracked `.npm-cache/` artifacts; the latest earlier audit reported zero tracked cache artifacts.
- Login and registration pages, auth forms/styles, authentication endpoints and validation coverage are present.
- Authentication polling was removed from `helpers/useAuth.tsx`; refresh relies on focus/reconnect and query freshness. Confirm this remains appropriate for session revocation.
- Registration now returns 400 for validation/malformed input, 409 for duplicate email, and a generic 500 for unexpected failures.
- Learning, mentorship and scholarship endpoints distinguish unauthenticated access from unexpected server failures.
- Company/company-list, job-alert, application, notification and saved-opportunity GET handlers now return 500 for unexpected server/database failures rather than 400.
- Company lookup distinguishes missing ID (400), missing company (404), unauthenticated (401), and server failure (500); recruiter-only candidate listing returns 403 when the signed-in account has no company profile.
- Realtime send/token/last-seen endpoints now return generic provider errors rather than exposing provider internals; malformed realtime requests are separated from unauthenticated requests.
- Profile GET now returns 401 only for unauthenticated requests and 500 for unexpected database/server failures.
- No production publish or merge into `main` has been performed.

## Latest verification

- Floot typecheck: clean (2026-11-06), including the latest API status changes.
- Floot tests: 4 spec files passed, 0 failed: theme mode, security validation, media query, and debounce (re-run after latest API status changes).
- Latest GitHub Actions run for the recovery branch: run `42212417892`, completed successfully: https://github.com/varshinickswamy-dot/HerSphere/actions/runs/42212417892
- GitHub Actions validates the repository's separate `apps/` implementation; it does not typecheck the Floot React source against the Floot runtime.
- Floot runtime E2E and production behavior have not yet been verified.

## Remaining work before release

1. Complete content-level parity audit between Floot and GitHub; earlier size mismatches need confirmation before repair.
2. Add endpoint-level tests for login, registration, logout, session expiry, duplicate email, rate limiting, company registration, and authorization boundaries.
3. Run isolated-database or safe test-account E2E flows for student and company registration/login/logout, profile CRUD, and recruiter workspace.
4. Review realtime authorization carefully: last-seen currently checks authentication and a presence-channel prefix, but the correct per-room roster permission needs to be enforced before enabling presence usage.
5. Verify admin/student/recruiter/company role boundaries, especially admin provisioning and company-only actions.
6. Validate database schema/migrations, indexes, constraints, and required environment variables without committing secrets.
7. Validate AI features and opportunity/scholarship feeds against real providers; clearly label demo/fallback data.
8. Validate resume upload/storage, ATS analysis, mock interviews, learning, mentorship, messages, notifications, events, and application workflows end-to-end.
9. Validate responsive/mobile UI, accessibility, loading/error/empty states, privacy and account deletion/export expectations.
10. Recheck hosting usage and session refresh/revocation behavior.
11. After the above, prepare a review PR; do not merge to `main` or publish production without explicit approval.

## Important deployment note

The published app runs the code from its last production publish, not automatically from these Floot edits or the recovery branch. Any publish should happen only after E2E and security review, with explicit approval.

## Branch

`floot-source-recovery`
