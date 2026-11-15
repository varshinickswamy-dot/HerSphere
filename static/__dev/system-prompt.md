Build a complete full-stack web application called HerSphere — AI-Powered Women's Career Ecosystem.

HerSphere is a modern career ecosystem that helps students and women discover career opportunities, understand their skills, build resumes, prepare for interviews, find jobs/internships/scholarships, connect with mentors, learn new skills, network with other users, and receive personalized AI-powered career guidance.

This must be a REAL working application, not a static landing page or visual prototype. Use Floot's built-in database, authentication, storage, backend/serverless endpoints, and hosting capabilities.

Project name must always remain HERSPHERE.

Phase 1 must be fully functional and visually polished before continuing: project foundation, database schema, authentication, landing page, global light/dark design system, student registration, login, student profile, student dashboard, responsive navigation. At the end verify authentication, database operations, navigation and obvious errors.

Use four roles: Student, Recruiter, Company, Admin. Main student journey: profile → career analysis → skill gaps → roadmap → resume → opportunities → mentorship/learning → dashboard.

Brand: HerSphere. Tagline: "Your Career. Your Future. Your Sphere."
Design: premium modern SaaS, serious technology startup, not overly pink/childish. Both light and dark themes must be readable and consistent across every page and user role. Default first-time visitors to light mode; remember explicit user preference. Light palette: background #FAFAF7, surface #FFFFFF, primary #003B70, gold accent #B8860B, text #17212B, muted text #536171. Dark palette: background #121212, surface #1A1A1A, primary #7B2C2C, gold accent #FFD700, text #F8F4EA. Use subtle gradients, clear surface separation, rounded cards, professional typography, soft shadows, restrained animations and accessible contrast. Never hardcode low-contrast text colors when theme tokens are available.

Landing page: navbar with logo, Home, Features, How It Works, Opportunities, Mentorship, About, Login, Get Started. Hero "Shape Your Career. Own Your Future." with explanatory subtitle, Get Started and Explore Features, polished dashboard visual, features: AI Career Mentor, Career Roadmap, Skill Gap Analyzer, ATS Resume Builder, Resume Analyzer, AI Mock Interview, Job Matching, Internship Finder, Scholarship Finder, Mentorship. How It Works: Create profile, Analyze skills, Get personalized recommendations, Build roadmap, Apply and grow. Demo statistics must be clearly labeled.

Authentication routes: /login, /register, /forgot-password, /reset-password. Student registration fields: full name, email, password, phone, location, college, degree, branch, graduation year, CGPA, skills, interests, career goal, preferred role, preferred location, experience level, LinkedIn, GitHub, Portfolio. Recruiter and Company registration should exist in the data model and auth role handling, but Phase 1 prioritizes Student.

Student dashboard navigation: Dashboard, My Profile, AI Career Mentor, Career Roadmap, Skill Gap, Resume Builder, Resume Analyzer, Mock Interview, Jobs, Internships, Scholarships, Learning, Mentorship, Community, Events, Applications, Notifications, Settings. Dashboard: welcome message, profile completion, career readiness indicators, skill progress, recommended jobs/internships/scholarships, learning progress, upcoming events, recent applications. Use charts where useful.

Use secure role-based auth. Validate inputs. Never expose secrets in frontend.

Use relational Postgres tables eventually for users, student_profiles, recruiters, companies, jobs, internships, scholarships, resumes, resume_analysis, career_roadmaps, skill_assessments, learning_resources, mentors, mentorship_requests, community_posts, community_comments, events, event_registrations, applications, interviews, notifications, ai_conversations; proper FKs/timestamps/indexes and Postgres ENUMs for fixed statuses/roles.

All important actions need loading/success/error/empty states, toasts, modals, confirmations, skeletons, tooltips, search, filters, pagination, responsive tables/charts. Fully responsive.

Implementation rule for future phases: frontend → serverless endpoint → database/AI → response → state update. Do not fake advanced AI: when provider is unconfigured, use clearly labeled demo/fallback mode.

Future features from the full specification include AI Career Mentor, Roadmap, Skill Gap Analyzer, Resume Builder/Analyzer, Mock Interview, Jobs, Internships, Scholarships, Learning Hub, Mentorship, Community, Events, Recruiter dashboard, Company dashboard, Admin dashboard, recommendations, notifications. Maintain same design and architecture.