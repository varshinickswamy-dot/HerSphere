# HerSphere — Floot Source Transfer and Release Status

Last reviewed: 2026-11-18 16:34 UTC

## Current production release

- Floot project ID: `9b5a70ba-5bcc-4e7f-b56a-1e238daea407`
- Published app: https://hersphere.floot.app
- Live release ID: `1795019599683727568d9-157c-4872-bb3d-a9c64c93c02a`
- Published: 2026-11-18 16:33:18 UTC
- Source manifest digest: `4db462d5fb97af6f9b0d594bd32d0341f398bf1e52c36779553b9f5ab2857ef1`
- Published Floot source files: 419
- Visibility: public; no custom domain attached.
- Project owner plan: Free. The app is published, but scheduled jobs do not run on this plan.
- Production background check: no active runs, no scheduled jobs deployed, no recurring tasks and no pending delayed tasks.
- Last published-log check (last hour): no log events returned. This is not a substitute for live user-flow testing.

## Latest verified checks

- Floot TypeScript typecheck: clean.
- Floot Jasmine specs: 4 passed (2 default specs and 2 explicitly selected hook specs).
- GitHub Actions on `main`: successful for commit `bd7d3c5b661612f72c00c4ba1ef925c06ec84a67`.
- The GitHub workflow verifies the separate Node.js reference implementation under `apps/`; it does not execute the Floot production runtime.
- The Floot project has connected backend resources for PostgreSQL, JWT authentication, OpenAI and Brevo. A connected credential does not by itself prove successful end-user delivery or production integration.

## Implemented product areas

- Student, Recruiter, Company and Admin roles, with Admin excluded from public signup and legacy user accounts preserved.
- Student profile, dashboard and career-analysis journey.
- Career roadmap, skill-gap analysis, AI mentor and mock interview flows.
- Resume builder, resume retrieval and ATS-style analysis.
- Jobs, internships, scholarships, saved opportunities and application tracking.
- Recruiter/company workspaces, opportunity posting, application management and job-specific candidate matching with explainable skill fit and eligibility review.
- Community, mentorship, events, messages, notifications, learning resources and settings. The community page now enforces authenticated routing, handles loading/errors, validates post lengths, shows mentorship request state and uses theme tokens.
- Password login, session/logout, registration email OTP, forgot-password and OTP-protected password reset.
- Global light/dark theme tokens and route-level theme normalization, including public, auth, student and employer pages.
- Source, dependencies, endpoints, page components and theme/auth updates are maintained in the repository root. The separate Node.js reference implementation remains under `apps/`.

## Remaining work before calling HerSphere fully production-verified

1. **Real email verification:** test registration OTP and password-reset messages to a real external inbox (including spam), verify sender identity and confirm expiry, resend cooldown, attempt limits and one-time use.
2. **Authentication and role boundaries:** test login/logout, session expiry/revocation, student vs recruiter/company access, company data isolation, direct API authorization and private Admin provisioning using approved test accounts.
3. **Student end-to-end journey:** verify profile create/update, career analysis, skill-gap output, roadmap persistence, resume upload/save/analyze, opportunity recommendations, saved items, applications and status tracking.
4. **Recruiter/company journey:** verify company profile ownership, posting/editing/closing jobs, candidate matching, candidate data visibility, shortlisting, application status changes and company isolation.
5. **Data population and freshness:** establish and test trusted sources or admin workflows for jobs, internships, scholarships, learning resources and mentor profiles. Empty tables should be reported as no data, not as a live feed.
6. **AI provider behavior:** test OpenAI-backed mentor, resume analysis, mock interview and recommendations with real requests, rate limits, provider errors and clearly labelled fallback/demo behavior.
7. **Communication workflows:** test mentorship requests, messages, community posts, events/registrations, notifications and job alerts across roles.
8. **Privacy and file security:** verify resume upload/download access controls, user data isolation, data retention, account export/deletion requirements and privacy disclosures.
9. **Mobile and accessibility:** test every major route at phone/tablet widths, native WebView behavior, keyboard/focus navigation, screen-reader labels, contrast, reduced motion and loading/error/empty states.
10. **Operations:** define database backup/restore and migration procedures, production monitoring, error alerting and incident recovery.
11. **Scheduled job limitation:** `processJobAlerts` is enabled in project configuration but is not deployed in production because scheduled jobs require a paid Floot plan. Upgrade the project owner's plan and publish again if automated job-alert processing is required.

## GitHub and deployment policy

- Repository: https://github.com/varshinickswamy-dot/HerSphere
- Default branch: `main`
- Floot source/recovery branch: `floot-source-recovery`
- The root contains the Floot React/TypeScript app, serverless endpoints, database helpers, tests and configuration; `apps/` contains a separate Node.js reference implementation.
- GitHub Actions success only certifies the `apps/` implementation and its tests, not all hosted Floot workflows.
- Pushing to GitHub does not deploy the Floot app. Publish the Floot project separately after a verified change set.
- Current production URL: https://hersphere.floot.app
- Do not describe HerSphere as fully production-ready until the real-account, real-inbox, data, authorization, privacy and mobile checks above have passed.

## Plan limitations

- The owner is on the Free plan; scheduled jobs are not active in production.
- Downloading/comparing historical published versions is a paid feature. Upgrade page: https://floot.com/dashboard/billing?for=b1.61bca690-9711-4728-b951-7658513d2b47.1795624129.sZn5NA2S1HDSEnvprj6lnnUQcbVliUzJ-2ouS1asAtw
