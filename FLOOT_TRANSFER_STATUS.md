# HerSphere — Floot Source Transfer and Release Status

This file tracks the Floot-hosted HERSPHERE application and its source synchronization with GitHub.

## Current production snapshot (checked 2026-11-15)

- Floot project ID: `9b5a70ba-5bcc-4e7f-b56a-1e238daea407`
- Published app: https://hersphere.floot.app
- Live release ID: `179473516842071ecf120-3ddf-43ef-9f03-54625b22026d`
- Published: 2026-11-15 09:32:46 UTC
- Published source manifest digest: `32d7eec191e26c3c0c57fcc6694063bd00037e46a9652841cbc96c28d8b9533f`
- Published source file count: 402
- Floot typecheck: clean after the latest code changes.
- Floot specs: 4 passed, 0 failed (theme mode, security validation, media query and debounce; hook specs explicitly included).
- The app is public at the Floot subdomain. No custom domain is attached.
- Project owner is on the Free plan. Published-version download/comparison is not available on this plan.
- Scheduled jobs do not run on the Free plan. The `processJobAlerts` scheduled workflow needs a paid plan and a new publish to run in production.

## Completed changes in the latest release

- Fixed dashboard redirects and sign-out navigation to use React Router `useNavigate()`, not direct `window.location` assignment.
- Added a global theme control on every route, including public, login, registration, student and recruiter pages.
- First-time visitors default to light mode; saved light/dark preference is preserved.
- Added readable light-theme colors, contrast improvements for cards, headings, muted text, forms, navigation, buttons, empty states and homepage sections.
- Kept the dark charcoal/maroon/gold theme and updated the design instructions to support both themes.
- Added typed API schema helpers for learning, mentorship, resume analyzer, roadmap and scholarships.
- Implemented time-limited registration OTP verification for personal and company registration: hashed OTP storage, 5-minute expiry, 60-second resend cooldown, maximum five attempts, timing-safe comparison and one-time consumption during account creation.
- Connected Brevo through the backend secret `BREVO_API_KEY`; the API key is not stored in source code.
- Hardened OTP handling so missing email-provider configuration is checked before storing an OTP, and changing the registrant's email resets the prior verification state.
- Company registration creates a company profile row and recruiter workspace access is gated by that company profile.

## Authentication and OTP verification status

- Student and company registration, login, logout and session endpoints are implemented.
- Registration requires a recent verified email OTP before account creation.
- **Manual production check still required:** send a registration code to a new email address owned by the tester, confirm it arrives (including spam), verify the code, and complete registration. The Brevo sender identity configured in the endpoint must be verified/allowed in Brevo. A connected API key alone does not prove inbox delivery.
- Do not share OTP values or API keys in chat. Do not call the registration email flow production-verified until the real inbox test passes.
- Session expiry/revocation and student/company/admin permission boundaries still need end-to-end testing with approved test accounts.

## Remaining verification and product work

1. **Authentication/security:** complete real-inbox OTP tests; verify session revocation, expiry, password reset, company-account boundaries and admin role boundaries.
2. **Core student journey:** test profile CRUD, career analysis, skill-gap assessment, roadmap generation, resume save/analyze, opportunity matching, applications and status tracking.
3. **Recruiter journey:** test company profile editing, job posting, candidate discovery, resume visibility, shortlisting and application status changes.
4. **Data integrations:** confirm how jobs, internships, scholarships, learning resources and mentor profiles are populated. Empty tables are not evidence of a live external feed.
5. **AI and recommendations:** verify real provider-backed AI behavior, failure handling and fallback labeling. Do not present demo or deterministic output as live AI.
6. **Communication:** test mentorship requests, messages, notifications, events, community and job alerts.
7. **Authorization:** test student, recruiter/company and admin permissions at both UI and API layers, including direct endpoint calls.
8. **Storage and privacy:** verify resume upload/access controls, account deletion/export expectations, data retention and privacy behavior.
9. **Mobile/accessibility:** test narrow screens and actual mobile WebView behavior, keyboard access, focus states, contrast and loading/error/empty states across all routes.
10. **Database:** review schema constraints, indexes, migrations and backup/recovery procedures.
11. **Source parity:** continue content-level comparisons between current Floot files and the GitHub source. A matching filename or file size alone is not proof of parity.

## GitHub status

- Repository: https://github.com/varshinickswamy-dot/HerSphere
- Default branch: `main`
- Floot source/recovery branch: `floot-source-recovery`
- Floot source, OTP registration, theme and dashboard navigation changes were merged to `main` via PR #1 and PR #2.
- The repository keeps the Floot implementation at the root and the separate Node.js reference implementation under `apps/`.
- GitHub Actions verifies the Node.js implementation under `apps/`; it does not validate the Floot runtime.
- GitHub pushes do not deploy the Floot app. Production publishing is a separate Floot action.

## Deployment policy

The latest theme and OTP implementation is published. The application is live, but it is not yet fully production-ready until the remaining real-account, real-inbox, data, authorization, privacy and mobile checks are complete.
