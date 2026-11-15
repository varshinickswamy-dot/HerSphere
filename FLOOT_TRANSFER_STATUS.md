# HerSphere — Floot Source Transfer Status

This is the recovery branch for the HERSPHERE Floot project. Keep it separate from `main` until reviewed.

## Current production snapshot (checked 2026-11-14)

- Floot project ID: `9b5a70ba-5bcc-4e7f-b56a-1e238daea407`
- Current Floot source version: `1794672211382`
- Published app: https://hersphere.floot.app
- Live release ID: `179458262703161adf8d7-7cd9-4690-9c0c-ceab446e4bc5`
- Published: 2026-11-13 15:10:26 UTC
- Published source manifest digest: `3358859ea1fa285c03b3c573ed1eed11dd5db23d13a267c1ab7cd0b4156065b9`
- Published source file count: 391
- Floot typecheck: previously clean; re-run after the next source change.
- Floot specs: 4 passed, 0 failed in the last recorded run (theme mode, security validation, media query and debounce; hook specs explicitly included).
- Project owner is on the Free plan. Published-version download/comparison is not available on this plan.

## Authentication status and OTP prerequisite

- Existing registration and sign-in use email + password, with server-side sessions and login rate limiting.
- Registration distinguishes invalid/malformed requests (400), duplicate email (409), and unexpected failures (500) with generic server messages.
- **Email OTP verification is not implemented yet.** The project has no verified sender domain configured in its Floot Email tab. Floot's built-in email sender falls back to a platform sender that only reaches the workspace owner until a sending domain is verified; this cannot deliver registration codes to arbitrary new users.
- Before enabling production OTP, add and verify a sending domain in the Floot editor's **Email** tab (right sidebar): Add email domain, then publish the required DNS records / use automatic setup. A sending domain is separate from the app's hosting domain.
- After sender verification, implement a time-limited, single-use OTP flow for both personal and company registration, with hashed OTP storage, expiry, resend throttling, attempt limits, and no user session until verification succeeds. Test delivery to a real inbox before publishing.
- Do not ask for SMTP/API secrets in chat; use Floot's built-in `@floot/email` backend integration.

## Remaining verification and release work

1. **Authentication/security:** Add email OTP verification; verify session revocation, expiry and company-account role boundaries end-to-end.
2. **Endpoint usage:** Recheck actual runtime requests and route mapping before deleting or rewriting endpoints.
3. **AI and recommendations:** Verify real provider-backed AI behavior, failure handling and fallback labeling. Do not present demo or deterministic output as live AI.
4. **Data integrations:** Confirm how jobs, internships, scholarships, learning resources and mentor profiles are populated. Empty database tables mean no current records, not a working external feed.
5. **Core workflows:** Test student and company registration/login/logout, profile CRUD, resume save/analyze, applications, recruiter listing/applicant management, mentorship requests, messaging, events, community, notifications and admin moderation with isolated or approved test accounts.
6. **Authorization:** Verify student, recruiter/company and admin permissions at both UI and API layers, including direct endpoint calls.
7. **Storage and privacy:** Verify resume upload/access controls, account deletion/export expectations, data retention and privacy behavior.
8. **Mobile/accessibility:** Test narrow screens and actual mobile WebView behavior, keyboard access, focus states, contrast and loading/error/empty states.
9. **Database:** Review schema constraints, indexes, migrations and backup/recovery procedures.
10. **Source parity:** Continue content-level comparisons between current Floot files and this recovery branch. A matching filename or file size alone is not proof of parity.

## GitHub branch status

- Repository: https://github.com/varshinickswamy-dot/HerSphere
- Recovery branch: `floot-source-recovery`
- `main` has not been changed.
- The GitHub Actions workflow verifies the separate Node.js implementation under `apps/`; it does not validate the Floot runtime.
- GitHub pushes do not deploy the Floot app. Production code changes require a separate Floot publish.

## Deployment policy

Do not merge to `main` or claim production readiness until the remaining end-to-end checks are complete.
