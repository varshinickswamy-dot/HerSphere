# HerSphere — AI-Powered Women's Career Ecosystem

HerSphere is a career-support platform for students and women exploring jobs, internships, scholarships, learning resources, mentorship, resume improvement, interview practice and career planning.

**Published app:** https://hersphere.floot.app  
**Floot implementation:** React + TypeScript, Floot serverless endpoints, PostgreSQL, session authentication and realtime services in the repository root.  
**Separate reference implementation:** the Node.js application under `apps/`. These are two implementations and do not automatically deploy or share runtime data.

## Product areas in the Floot application

- Student authentication, profile and dashboard
- Career analysis, skill-gap view and career roadmap
- Resume builder and ATS-style resume checks
- Jobs, internships, scholarships and saved opportunities
- Recruiter workspace and candidate discovery
- Mentorship, learning resources, community, events and messaging
- Applications, notifications, settings, theme preferences and admin tools
- Global light/dark theme support across public, student and recruiter routes

Some workflows still require end-to-end verification with real accounts and production data. Empty listings mean the relevant database table has no matching records; they are not proof of a live external job or scholarship feed. Registration OTP code is implemented using the connected Brevo API, but delivery to a new external inbox still needs manual confirmation.

## Technology

### Floot-hosted implementation
- React + TypeScript frontend
- Floot serverless endpoints and PostgreSQL database
- Session-based authentication and server-side authorization
- SuperJSON API serialization
- Floot hosting and realtime services

### Separate repository implementation
- Node.js backend and vanilla JavaScript frontend under `apps/`
- PostgreSQL schema/migrations and local JSON demo store
- Built-in Node test runner and verification script
- Docker/deployment configuration

The GitHub Actions workflow verifies the repository's Node.js implementation under `apps/`; it does **not** run the Floot production runtime or prove all Floot workflows work.

## Run the repository implementation locally

Requirements: Node.js 22 or later.

### Windows PowerShell
```powershell
npm.cmd install
npm.cmd run dev
```

### macOS / Linux
```bash
npm install
npm run dev
```

Open the local URLs printed by the dev scripts. For the backend health route and frontend port, check the current `package.json` and `docs/INSTALLATION.md`.

## Verification

```bash
npm test
npm run verify
```

On Windows PowerShell, use `npm.cmd test` and `npm.cmd run verify` if needed.

Floot verification is separate: run the Floot typecheck and specs in the HerSphere project. A passing Node.js workflow does not certify the hosted Floot app.

## Database and configuration

- Review `database/migrations/` and `database/seeds/` before initializing PostgreSQL.
- Copy `.env.example` to `.env` and replace every development secret locally.
- Never commit `.env`, credentials, API keys, session tokens or production database URLs.
- Do not use demo credentials on a public deployment.

## Documentation

See `docs/` for architecture, API, installation, developer, deployment, testing and user guides. See `FLOOT_TRANSFER_STATUS.md` for the current hosted-project release and verification checklist.

## Branch and deployment policy

- `main` contains the Floot app source at the repository root and the separate Node.js reference implementation under `apps/`.
- `floot-source-recovery` remains as a source/recovery branch for the Floot implementation.
- The Floot source and theme/auth updates were merged to `main` through pull requests #1 and #2.
- Pushing to GitHub does not publish the Floot app. Publishing is a separate Floot action.
- The current public app is https://hersphere.floot.app.
- Do not describe the app as fully production-ready until authentication, OTP email delivery, authorization, data workflows, external integrations, mobile behavior and security have passed end-to-end checks.
