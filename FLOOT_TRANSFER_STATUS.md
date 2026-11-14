# HerSphere — Floot Source Transfer Status

This is the recovery branch for the HERSPHERE Floot project. Keep it separate from `main` until reviewed.

## Current production snapshot (checked 2026-11-14)

- Floot project ID: `9b5a70ba-5bcc-4e7f-b56a-1e238daea407`
- Current Floot source version: `1794582570684`
- Published app: https://hersphere.floot.app
- Live release ID: `179458262703161adf8d7-7cd9-4690-9c0c-ceab446e4bc5`
- Published: 2026-11-13 15:10:26 UTC
- Published source manifest digest: `3358859ea1fa285c03b3c573ed1eed11dd5db23d13a267c1ab7cd0b4156065b9`
- Published source file count: 391
- Floot typecheck: clean.
- Floot specs: 4 passed, 0 failed (theme mode, security validation, media query and debounce; hook specs explicitly included).
- Published backend logs: no events in the default last-hour window at the time checked.
- Published background work: no running, delayed, recurring or scheduled jobs deployed. Production reported 102 requests/background runs over the last 7 days, with no runs over 60 seconds or cut off.
- The schedule config enables `processJobAlerts` every 15 minutes (Asia/Kolkata), but Floot reports it is **not deployed in production**. Floot reports scheduled jobs deploy only on a paid plan. Job-alert notifications therefore need a supported production execution mechanism before this feature can be called automated.
- Project owner is on the Free plan. Published-version download/comparison is not available on this plan.

## Latest verification and remaining work

1. **Authentication/security:** Registration distinguishes invalid/malformed requests (400), duplicate email (409), and unexpected failures (500) with generic server messages. Login rate limiting and server-side session handling exist. Session revocation, expiry and company-account role boundaries still need end-to-end verification.
2. **Endpoint usage:** The server-side project summary flags six endpoints as not called by a page/component: internships, learning, mentorship, resume analyzer, roadmap and scholarships. Direct page inspection shows some of these pages issue matching API requests, so the static summary is not conclusive. Recheck actual runtime requests and route mapping before deleting or rewriting anything.
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
- Branch comparison checked 2026-11-14: 286 commits ahead of `main`, 0 behind.
- `main` has not been changed.
- The GitHub Actions workflow verifies the separate Node.js implementation under `apps/`; it does not validate the Floot runtime.
- Current recovery branch README now distinguishes the two implementations and documents this limitation.

## Deployment policy

The published Floot app and GitHub recovery branch are separate. GitHub pushes do not deploy the Floot app. Production code changes require a separate Floot publish. Do not merge to `main` or claim production readiness until the remaining end-to-end checks are complete.
