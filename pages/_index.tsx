import { Link } from "react-router-dom";
import { ArrowRight, BrainCircuit, BriefcaseBusiness, GraduationCap, LineChart, MessageCircle, ShieldCheck, Sparkles, Target, Users, BookOpen, FileCheck2 } from "lucide-react";
import styles from "./_index.module.css";

const features = [
  ["AI Career Mentor", "Get practical guidance shaped around your goals, skills and next steps.", BrainCircuit],
  ["Career Roadmap", "Break your target role into achievable skills, projects and milestones.", Target],
  ["Skill Gap Analyzer", "Understand what you know and prioritize what to learn next.", LineChart],
  ["Resume Builder & Analyzer", "Create a clear resume and review it for role relevance and ATS basics.", FileCheck2],
  ["Mock Interview Practice", "Prepare with role-focused technical, HR and behavioral questions.", MessageCircle],
  ["Jobs, Internships & Scholarships", "Explore opportunities and keep applications in one workspace.", BriefcaseBusiness],
  ["Learning Hub", "Find focused learning resources to strengthen in-demand skills.", BookOpen],
  ["Mentorship & Community", "Learn from mentors and connect with a supportive career community.", Users],
  ["Career Progress Dashboard", "Keep your profile, roadmap and application activity together.", GraduationCap],
] as const;

export default function HomePage() {
  return <main className={styles.page}>
    <nav className={styles.nav}>
      <Link to="/" className={styles.logo}><span>H</span><b>HerSphere</b></Link>
      <div className={styles.links}><a href="#features">Explore</a><a href="#how">How it works</a><a href="#opportunities">Opportunities</a><Link to="/mentorship">Mentorship</Link></div>
      <div className={styles.actions}><Link to="/login" className={styles.login}>Log in</Link><Link to="/register" className={styles.navCta}>Create account <ArrowRight size={15}/></Link></div>
    </nav>

    <section className={styles.hero}>
      <div className={styles.heroCopy}>
        <div className={styles.eyebrow}><Sparkles size={14}/> YOUR AI-POWERED CAREER ECOSYSTEM</div>
        <h1>Your ambition.<br/><em>Your next chapter.</em></h1>
        <p className={styles.lead}>A space for women to discover their strengths, build career-ready skills, find opportunities and move forward with confidence.</p>
        <div className={styles.heroActions}><Link to="/register" className={styles.primary}>Start your journey <ArrowRight size={17}/></Link><a href="#features" className={styles.secondary}>Explore the platform</a></div>
        <div className={styles.promise}><ShieldCheck size={16}/> Personalized tools. Clear next steps. Your career, in your hands.</div>
      </div>
      <div className={styles.heroVisual}>
        <img src="/_cdn/static/01e901bf-d552-4166-9e4e-7261d3b5fc23-hersphere-career-hero.jpg" alt="Women learning, collaborating and building careers with AI technology"/>
        <div className={styles.imageShade}/>
        <div className={styles.visualTag}><span><Sparkles size={15}/></span><div><b>Grow with purpose</b><small>Skills · Opportunities · Mentorship</small></div></div>
        <div className={styles.visualCaption}>A stronger career starts with one clear next step.</div>
      </div>
    </section>

    <section className={styles.valueStrip} aria-label="HerSphere benefits">
      <div><BrainCircuit/><span><b>AI-guided direction</b><small>Insights based on your goals</small></span></div>
      <div><BriefcaseBusiness/><span><b>Opportunities in one place</b><small>Discover and track your next move</small></span></div>
      <div><Users/><span><b>Support that grows with you</b><small>Learning and mentorship</small></span></div>
    </section>

    <section id="features" className={styles.section}>
      <header><span className={styles.kicker}>ONE CONNECTED WORKSPACE</span><h2>Tools for every step of <em>your journey.</em></h2><p>Move from career exploration to preparation and applications without losing sight of your goals.</p></header>
      <div className={styles.grid}>{features.map(([title,desc,Icon])=><article key={title}><span className={styles.featureIcon}><Icon size={20}/></span><h3>{title}</h3><p>{desc}</p></article>)}</div>
    </section>

    <section id="how" className={styles.steps}>
      <div className={styles.stepsInner}><header><span className={styles.kicker}>A CLEARER WAY FORWARD</span><h2>Small steps. <em>Real momentum.</em></h2><p>Start where you are. HerSphere helps you turn your next career goal into an actionable plan.</p></header>
      <div className={styles.stepGrid}>{["Create your profile","Understand your strengths","Choose a career direction","Build skills and your resume","Discover and track opportunities"].map((x,i)=><div key={x}><span>0{i+1}</span><b>{x}</b><p>{["Share your education, interests and career preferences.","Review your skills and identify areas to improve.","Explore roles that connect with your interests.","Follow a roadmap and prepare for interviews.","Save relevant openings and track your applications."][i]}</p></div>)}</div></div>
    </section>

    <section id="opportunities" className={styles.callout}><div><span className={styles.kicker}>YOUR CAREER, YOUR SPHERE</span><h2>Make your next move <em>count.</em></h2><p>Build a profile that reflects your potential and bring your learning, preparation and opportunities together.</p></div><Link to="/register" className={styles.primary}>Join HerSphere <ArrowRight size={17}/></Link></section>

    <footer className={styles.footer}><div className={styles.logo}><span>H</span><b>HerSphere</b></div><p>Your Career. Your Future. Your Sphere.</p><small>© 2026 HerSphere</small><div><Link to="/login">Log in</Link><Link to="/register">Create account</Link></div></footer>
  </main>;
}