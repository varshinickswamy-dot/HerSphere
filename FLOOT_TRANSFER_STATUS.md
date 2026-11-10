# HerSphere — Floot Source Transfer Status

This is a recovery branch for the HERSPHERE Floot project. Keep it separate from `main` until reviewed.

## Current status (2026-11-10)

- Floot project ID: `9b5a70ba-5bcc-4e7f-b56a-1e238daea407`
- Latest Floot source version: `1794295165736`
- GitHub recovery branch: `floot-source-recovery`
- Recovery branch URL: https://github.com/varshinickswamy-dot/HerSphere/tree/floot-source-recovery
- Latest synced change: `endpoints/companies_GET.ts` now retrieves follower and job totals using two grouped aggregate queries rather than two queries per company. Response fields and authentication behavior are preserved.
- Registration distinguishes invalid/malformed requests (400), duplicate email (409), and unexpected failures (500), with generic server error messages.
- Login validation and server failures are separated; login rate limiting remains enabled.
- Learning, mentorship and scholarship endpoints distinguish unauthenticated access from unexpected server failures.
- Company/company-list, job-alert, application, notification and saved-opportunity GET handlers return 500 for unexpected server/database failures rather than misclassifying them as authentication errors.
- Company lookup distinguishes missing ID (400), missing company (404), unauthenticated (401), and server failure (500); recruiter-only candidate listing returns 403 when the signed-in account has no company profile.
- Realtime send/token/last-seen endpoints use generic provider errors; the latest realtime presence change fails closed for unauthorized presence lookups.
- Profile, messaging and auth handlers use generic unexpected-error responses and avoid exposing sensitive provider/database/session details.
- Login and registration pages, auth forms/styles, auth endpoints and validation coverage are present.
- Authentication polling was removed from `helpers/useAuth.tsx`; refresh relies on focus/reconnect and query freshness. Session revocation behavior still needs E2E verification.
- Removed tracked `.npm-cache/` artifacts; the latest earlier audit reported zero tracked cache artifacts.
- No production publish or merge into `main` has been performed.

## Latest verification

- Floot typecheck after the company-directory optimization: clean.
- Floot tests: 4 spec files passed, 0 failed: security validation, theme mode, media query, and debounce.
- Latest GitHub Actions run: run `42774513791`, completed successfully for commit `974d85c27ed914da58b0479e976e521526b0d211`: https://github.com/varshinickswamy-dot/HerSphere/actions/runs/42774513791
- GitHub Actions validates the repository's separate `apps/` implementation; it does not typecheck the Floot React source against the Floot runtime.
- Floot runtime E2E and production behavior have not yet been verified.

## Remaining work before release

1. Complete content-level parity audit between Floot and GitHub; earlier size mismatches need confirmation before repair.
2. Add endpoint-level tests for login, registration, logout, session expiry, duplicate email, rate limiting, company registration, and authorization boundaries.
3. Run isolated-database or safe test-account E2E flows for student and company registration/login/logout, profile CRUD, and recruiter workspace.
4. Verify admin/student/recruiter/company role boundaries, especially admin provisioning and company-only actions.
5. Validate database schema/migrations, indexes, constraints, and required environment variables without committing secrets.
6. Validate AI features and opportunity/scholarship feeds against real providers; clearly label demo/fallback data.
7. Validate resume upload/storage, ATS analysis, mock interviews, learning, mentorship, messages, notifications, events, and application workflows end-to-end.
8. Validate responsive/mobile UI, accessibility, loading/error/empty states, privacy and account deletion/export expectations.
9. Recheck hosting usage and session refresh/revocation behavior.
10. After the above, prepare a review PR; do not merge to `main` or publish production without explicit approval.

## Important deployment note

The published app runs the code from its last production publish, not automatically from these Floot edits or the recovery branch. Any publish should happen only after E2E and security review, with explicit approval.

## Branch

`floot-source-recovery`
