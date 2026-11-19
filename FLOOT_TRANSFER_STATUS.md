# HerSphere — Floot Source Transfer and Release Status

Last reviewed: 2026-11-20 03:05 IST

## Current production release
- Floot project ID: `9b5a70ba-5bcc-4e7f-b56a-1e238daea407`
- Published app: https://hersphere.floot.app
- Live release ID: `17951232475259181d1bf-073f-42f9-92b4-f0291439117a`
- Published: 2026-11-19 21:20:46 UTC
- Source digest: `80249ce4ffa1a9ddaf8d9b849148a4702ea495104f62c4033cd1932fcf1962a2` (421 files)
- Public visibility; no custom domain. Owner plan: Free; scheduled jobs are not active.

## Latest verified checks
- Floot TypeScript typecheck: clean.
- Floot Jasmine specs: 4 passed, 0 failed (security validation, theme mode and selected hook specs).
- OTP hashes require a configured JWT secret of at least 32 bytes; empty-secret fallback removed.
- Career analysis now normalizes common role names (Full Stack Developer, Machine Learning Engineer, Data Analyst) and uses role-specific skill maps.
- Mock interview uses OpenAI evaluation when `OPENAI_API_KEY` is configured, validates feedback, scopes writes to the signed-in user, prevents out-of-order answers and duplicate completion, and labels basic fallback scores.
- Resume analyzer compares a saved resume with a supplied job description using OpenAI-assisted analysis when configured, otherwise a labelled keyword-overlap fallback. This is an estimate, not a certified ATS score.
- Student profile and personal application endpoints now enforce student/legacy-user access. Recruiter accounts are allowed into the shared employer/company dashboard.
- Latest role-boundary and career UX commits on GitHub main:
  - `ce5eac85e97cde309c8c3fedc549bcf6b899e495` company dashboard endpoint added to repository
  - `4b43ab0665d36b5a17bd5eccb47772b92862f05c` student-only personal application mutation
  - `76a289f21ce218b2391795207afb17b0f908eda3` student-only application retrieval
  - `1a8dd5f277cc52fa391d490c4ec26736f392115e` student-only profile mutation
  - `d34850a4353749d44c09944100698c82746d9a68` career-analysis loading/error handling
- Latest resume analyzer commits:
  - `7be155bf075d4c55796ef2fbee80393ab3b43171` endpoint
  - `6b8618489f4ef7cb0060c06db3c8b04e254b548b` client schema
  - `0dd8d094ab4c62e84236150bcdc65c7b11d5c093` UI
  - `6b2e866e9eb2da191f556c6c31d67574e3dba40d` styles
- Mock-interview commits: `f572a1c4796e0ea29c56c3b2ab28f78a2e9f8970`, `3eade44ddd0875651da25f0720dd061b00ec7735`, `ae7999417e530fd0b194905064857490a4658ca3`, `763116bdeb8de0678747ddb66c6ccae182fdca5f`.
- Career-role commits: `f0ed8adc4bd10ee7832193fe25c0f9b302a49218`, `5a90478e579e49068418c046b26953412c12d141`, `410e633e3fd4175312155fff1957e2b41fc70434`.
- GitHub Actions status for newest commits has not been verified. Repository workflow tests the separate Node.js reference implementation under `apps/`, not the hosted Floot runtime.
- Connected PostgreSQL, JWT, OpenAI and Brevo resources do not prove real inbox delivery or successful live AI requests.

## Implemented product areas
- Student, Recruiter, Company and Admin roles; Admin excluded from public signup; legacy `user` accounts supported.
- Student profile, dashboard, career analysis, role-specific skill gaps and roadmap.
- AI Career Mentor endpoint with profile/opportunity context, request throttling and explicit unavailable response when not configured.
- Five-question mock interview with saved answers and AI evaluation or labelled fallback.
- Resume builder, retrieval, section checks and job-description matching with AI-assisted or keyword fallback analysis.
- Jobs, internships, scholarships, saved opportunities and application tracking.
- Recruiter/company workspaces, opportunity posting, application management and candidate matching.
- Community, mentorship, events, messages, notifications, learning resources and settings.
- Password login, session/logout, registration email OTP, forgot-password and OTP-protected reset.
- Global light/dark themes and route-level theme normalization.
- Server-side role checks for student profile/application endpoints, recruiter/company workspace and admin endpoints.

## Remaining before full production verification
1. Test registration and password-reset OTP to a real external inbox (including spam); verify Brevo sender identity, expiry, resend cooldown, attempt limits and one-time use.
2. Test login/logout, session expiry/revocation, student/recruiter/company isolation, direct API authorization and private Admin provisioning using approved test accounts.
3. Test the full student journey: profile, career analysis, roadmap, resume, recommendations, saved items and applications.
4. Test recruiter/company profile ownership, posting/editing/closing jobs, candidate visibility, shortlisting, status updates and company isolation.
5. Configure trusted sources/admin workflows for jobs, internships, scholarships, learning resources and mentor profiles; do not label empty/static tables live.
6. Test OpenAI mentor, mock interview and resume comparison with real requests, rate limits, provider failures and fallback behavior.
7. Test mentorship, messaging, community, events, notifications and job alerts across roles.
8. Verify resume file ACLs, user data isolation, retention, export/deletion and privacy disclosures.
9. Test phone/tablet, WebView, keyboard/focus, screen reader, contrast and reduced motion.
10. Define backups/restore, migrations, monitoring, alerts and incident recovery. `processJobAlerts` is configured every 15 minutes but does not run in production on Free plan; a paid plan and republish are required.

## GitHub and deployment
- Repository: https://github.com/varshinickswamy-dot/HerSphere
- Default branch: `main`; Floot source/recovery branch: `floot-source-recovery`.
- Root contains Floot React/TypeScript app, endpoints, DB helpers, tests and configuration; `apps/` is a separate Node reference implementation.
- GitHub Actions certifies `apps/`, not all hosted Floot workflows. GitHub push does not deploy Floot; publish separately.
- Do not describe HerSphere as fully production-ready until real-account, real-inbox, data, authorization, privacy and mobile checks pass.

## Plan limitations
- Free plan: scheduled jobs do not run in production.
- Historical published-source download/comparison and source diff require a paid owner plan.
