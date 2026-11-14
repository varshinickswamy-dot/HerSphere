# HerSphere — AI-Powered Women's Career Ecosystem

HerSphere is a career-support platform for students and women exploring jobs, internships, scholarships, learning resources, mentorship, resume improvement, interview practice and career planning.

**Published app:** https://hersphere.floot.app  
**Floot source backup:** this repository's `floot-source-recovery` branch  
**Important:** the published Floot application and the separate Node.js project under `apps/` are two implementations. They do not automatically deploy or share runtime data.

## Product areas in the Floot application

- Student authentication, profile and dashboard
- Career analysis, skill-gap view and career roadmap
- Resume builder and ATS-style resume checks
- Jobs, internships, scholarships and saved opportunities
- Recruiter workspace and candidate discovery
- Mentorship, learning resources, community, events and messaging
- Applications, notifications, settings, theme preferences and admin tools

Some workflows still require end-to-end verification with real accounts and production data. Empty listings mean the relevant database table has no matching records; they are not proof of a live external job or scholarship feed.

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

The GitHub Actions workflow currently verifies the repository's Node.js implementation under `apps/`; it does **not** run the Floot production runtime or prove all Floot workflows work.

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

## Database and configuration

- Review `database/migrations/` and `database/seeds/` before initializing PostgreSQL.
- Copy `.env.example` to `.env` and replace every development secret locally.
- Never commit `.env`, credentials, API keys, session tokens or production database URLs.
- Do not use demo credentials on a public deployment.

## Documentation

See `docs/` for architecture, API, installation, developer, deployment, testing and user guides.

## Branch and deployment policy

- `floot-source-recovery` is a source backup/recovery branch.
- `main` is intentionally left untouched pending review.
- Pushing to GitHub does not publish the Floot app. Publishing is a separate Floot action.
- The current public app is https://hersphere.floot.app.
- Do not describe the app as production-ready until authentication, authorization, data workflows, external integrations, mobile behavior and security have passed end-to-end checks.
