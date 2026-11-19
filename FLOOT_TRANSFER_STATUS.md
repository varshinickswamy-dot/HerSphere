# HerSphere — Floot Source Transfer and Release Status

Last reviewed: 2026-11-20 02:46 IST

## Current production release

- Floot project ID: `9b5a70ba-5bcc-4e7f-b56a-1e238daea407`
- Published app: https://hersphere.floot.app
- Live release ID: `1795122907396b02dc19d-cc73-4e1e-bee5-550d307509fb`
- Published: 2026-11-19 21:15:06 UTC
- Source manifest digest: `98cf9bda542ae7c23650d9cecea128349f3b7aecafbdc26cfc633b2b1163babd`
- Published Floot source files: 421
- Visibility: public; no custom domain attached.
- Project owner plan: Free. Scheduled jobs are not active on this plan.
- The most recent release includes the career-role skill mapping fix and the previously verified OTP-secret hardening. The AI-enabled mock-interview enhancement is now in the current source workspace and GitHub `main`; it was added after this release and still needs its next publish after verification.
- A successful publish confirms deployment, not full end-user workflow verification.

## Latest verified checks

- Floot TypeScript typecheck: clean after the latest mock-interview source changes.
- Floot Jasmine specs: 4 passed, 0 failed (security validation, theme mode and selected hook specs).
- OTP code hashes require a configured JWT secret of at least 32 bytes; no empty-secret fallback remains in registration and password-reset OTP hashing.
- Career analysis now normalizes common role names consistently (including Full Stack Developer, Machine Learning Engineer and Data Analyst) and uses the intended role-specific skill maps.
- The mock-interview endpoint now attempts OpenAI evaluation when `OPENAI_API_KEY` is configured, validates the returned feedback shape, scopes interview updates to the signed-in user, prevents out-of-order answers and duplicate completion, and clearly labels the basic heuristic fallback when AI evaluation is unavailable.
- The live app has previously returned HTTP 200 after publish. A 200 response is only an HTTP smoke check, not proof that registration, email, database or role workflows work end to end.
- Latest mock-interview source changes are synced to GitHub `main`; commits:
  - `f572a1c4796e0ea29c56c3b2ab28f78a2e9f8970` — mock-interview endpoint
  - `3eade44ddd0875651da25f0720dd061b00ec7735` — endpoint client schema
  - `ae7999417e530fd0b194905064857490a4658ca3` — mock-interview page
  - `763116bdeb8de0678747ddb66c6ccae182fdca5f` — mock-interview styles
- Earlier career-role fix is synced to `main`:
  - `f0ed8adc4bd10ee7832193fe25c0f9b302a49218` — `helpers/careerSkills.tsx`
  - `5a90478e579e49068418c046b26953412c12d141` — career-analysis endpoint
  - `410e633e3fd4175312155fff1957e2b41fc70434` — regression tests
- GitHub Actions status for the newest commits has not yet been verified. The repository workflow tests the separate Node.js reference implementation under `apps/`; it does not execute the hosted Floot runtime.
- The Floot project has connected backend resources for PostgreSQL, JWT authentication, OpenAI and Brevo. A configured/connected resource does not by itself prove successful end-user delivery or a successful real AI request.

## Implemented product areas

- Student, Recruiter, Company and Admin roles, with Admin excluded from public signup and legacy user accounts preserved.
- Student profile, dashboard and career-analysis journey.
- Role-based career skill gaps and career roadmap generation.
- AI Career Mentor endpoint with profile context, opportunity context, request throttling and an explicit unavailable response when the AI service is not configured.
- Mock interview with five questions, persisted answers, OpenAI-based evaluation when configured, and clearly labelled basic fallback scoring.
- Resume builder, resume retrieval and resume analyzer. Important: the current ATS score is a keyword/section heuristic, not a certified ATS parser or a guarantee of recruiter-system compatibility.
- Jobs, internships, scholarships, saved opportunities and application tracking.
- Recruiter/company workspaces, opportunity posting, application management and job-specific candidate matching with explainable skill fit and eligibility review.
- Community, mentorship, events, messages, notifications, learning resources and settings. The community page enforces authenticated routing, handles loading/errors, validates post lengths, shows mentorship request state and uses theme tokens.
- Password login, session/logout, registration email OTP, forgot-password and OTP-protected password reset.
- Global light/dark theme tokens and route-level theme normalization, including public, auth, student and employer pages.
- Source, dependencies, endpoints, page components and theme/auth updates are maintained in the repository root. The separate Node.js reference implementation remains under `apps/`.

## Remaining work before calling HerSphere fully production-verified

1. **Publish the latest mock-interview enhancement:** typecheck and specs passed; the current live release is one source edit behind this mock-interview improvement. Publish after syncing and final validation.
2. **Real email verification:** test registration OTP and password-reset messages to a real external inbox (including spam), verify sender identity and confirm expiry, resend cooldown, attempt limits and one-time use.
3. **Authentication and role boundaries:** test login/logout, session expiry/revocation, student vs recruiter/company access, company data isolation, direct API authorization and private Admin provisioning using approved test accounts.
4. **Student end-to-end journey:** verify profile create/update, career analysis, skill-gap output, roadmap persistence, resume save/analyze, opportunity recommendations, saved items, applications and status tracking.
5. **Recruiter/company journey:** verify company profile ownership, posting/editing/closing jobs, candidate matching, candidate data visibility, shortlisting, application status changes and company isolation.
6. **Data population and freshness:** establish and test trusted sources or admin workflows for jobs, internships, scholarships, learning resources and mentor profiles. Empty tables should be reported as no data, not as a live feed.
7. **AI provider behavior:** test OpenAI-backed mentor and mock interview with real requests, rate limits, provider errors and fallback behavior. Resume analysis is currently heuristic and needs a genuine document/job-description comparison workflow before being described as AI ATS analysis.
8. **Communication workflows:** test mentorship requests, messages, community posts, events/registrations, notifications and job alerts across roles.
9. **Privacy and file security:** verify resume upload/download access controls, user data isolation, data retention, account export/deletion requirements and privacy disclosures.
10. **Mobile and accessibility:** test every major route at phone/tablet widths, native WebView behavior, keyboard/focus navigation, screen-reader labels, contrast, reduced motion and loading/error/empty states.
11. **Operations and scheduled alerts:** define database backup/restore, migrations, monitoring, error alerting and incident recovery. `processJobAlerts` is configured every 15 minutes in project settings but production scheduled jobs do not run on the Free plan; upgrading the project owner's plan and publishing is required.

## GitHub and deployment policy

- Repository: https://github.com/varshinickswamy-dot/HerSphere
- Default branch: `main`
- Floot source/recovery branch: `floot-source-recovery`
- The root contains the Floot React/TypeScript app, serverless endpoints, database helpers, tests and configuration; `apps/` contains a separate Node.js reference implementation.
- GitHub Actions success only certifies the `apps/` implementation and its tests, not all hosted Floot workflows.
- Pushing to GitHub does not deploy the Floot app. Publish the Floot project separately after a verified change set.
- Current production URL: https://hersphere.floot.app
- Do not describe HerSphere as fully production-ready until real-account, real-inbox, data, authorization, privacy and mobile checks above have passed.

## Plan limitations

- The owner is on the Free plan; scheduled jobs are not active in production.
- Historical published-source download/comparison and source diff are paid features.
