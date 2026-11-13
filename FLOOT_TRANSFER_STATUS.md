# HerSphere — Floot Source Transfer Status

This is a recovery branch for the HERSPHERE Floot project. Keep it separate from `main` until reviewed.

## Latest update (2026-11-13)

- Floot project ID: `9b5a70ba-5bcc-4e7f-b56a-1e238daea407`
- Floot source version after theme cleanup: `1794582570684`
- Production publish succeeded at https://hersphere.floot.app
- Live release: `179458262703161adf8d7-7cd9-4690-9c0c-ceab446e4bc5` (2026-11-13 15:10:26 UTC; 391 source files).
- Removed the floating global light/dark theme control from the global provider and deleted its unused component and stylesheet. The existing `ThemeModeSwitch` remains in the dashboard sidebar.
- Floot typecheck: clean.
- Floot specs: 4 passed, 0 failed (theme mode, security validation, media query, debounce; hook specs explicitly included).
- Synced the global provider change and removed the unused floating toggle component/styles from `floot-source-recovery`.
- Recovery branch is 285 commits ahead of `main`, 0 behind. `main` has not been changed.
- The last GitHub commit status query returned no status checks for the theme cleanup commit. The previously documented successful Actions run applies to its earlier commit; do not treat it as validation of the latest commit.
- Floot's current server-side project summary flags six endpoints as not called by a page/component: `endpoints/internships_GET`, `endpoints/learning_GET`, `endpoints/mentorship_GET`, `endpoints/resume_analyzer_POST`, `endpoints/roadmap_GET`, and `endpoints/scholarships_GET`. This conflicts with an earlier route-call audit in this document's history; re-audit actual runtime references before removing or wiring any endpoint.
- Production publish is complete, but full runtime E2E/security verification is not. A successful typecheck and four unit/spec files do not prove every workflow works in production.

## Earlier engineering work retained on this branch

- Registration distinguishes invalid/malformed requests (400), duplicate email (409), and unexpected failures (500), with generic server error messages.
- Login validation and server failures are separated; login rate limiting remains enabled.
- Learning, mentorship and scholarship endpoints distinguish unauthenticated access from unexpected server failures.
- Company/company-list, job-alert, application, notification and saved-opportunity GET handlers return 500 for unexpected server/database failures rather than misclassifying them as authentication errors.
- Company lookup distinguishes missing ID (400), missing company (404), unauthenticated (401), and server failure (500); recruiter-only candidate listing returns 403 when the signed-in account has no company profile.
- Realtime send/token/last-seen endpoints use generic provider errors; the latest realtime presence change fails closed for unauthorized presence lookups.
- Profile, messaging and auth handlers use generic unexpected-error responses and avoid exposing sensitive provider/database/session details.
- Login and registration pages, auth forms/styles, auth endpoints and validation coverage are present.
- Authentication polling was removed from `helpers/useAuth.tsx`; refresh relies on focus/reconnect and query freshness. Session revocation behavior still needs E2E verification.
- Removed tracked `.npm-cache/` artifacts; the earlier audit reported zero tracked cache artifacts.

## Remaining work before calling the app fully verified

1. Re-audit the six endpoints flagged above against the current app router and actual runtime network calls; do not delete endpoints until confirmed unused.
2. Add endpoint-level tests for login, registration, logout, session expiry, duplicate email, rate limiting, company registration, and authorization boundaries.
3. Run isolated-database or safe test-account E2E flows for student and company registration/login/logout, profile CRUD, and recruiter workspace.
4. Verify admin/student/recruiter/company role boundaries, especially admin provisioning and company-only actions.
5. Validate database schema/migrations, indexes, constraints, and required environment variables without committing secrets.
6. Validate AI features and opportunity/scholarship feeds against real providers; clearly label demo/fallback data.
7. Validate resume upload/storage, ATS analysis, mock interviews, learning, mentorship, messages, notifications, events, and application workflows end-to-end.
8. Validate responsive/mobile UI, accessibility, loading/error/empty states, privacy and account deletion/export expectations.
9. Recheck hosting usage and session refresh/revocation behavior.
10. Continue content-level parity checks for Floot source versus GitHub recovery branch. Only explicitly listed files have been verified exactly; branch history alone does not prove full source parity.

## Deployment and branch safety

The production app runs the last successful Floot publish. The GitHub recovery branch is a separate backup and does not automatically deploy. Keep `main` untouched until review and explicit approval.

## Branch

`floot-source-recovery`
