import { Link } from "react-router-dom";
import { ArrowRight, BrainCircuit, BriefcaseBusiness, GraduationCap, LineChart, MessageCircle, ShieldCheck, Sparkles, Target } from "lucide-react";
import styles from "./_index.module.css";

const features = [
  ["AI Career Mentor","Career guidance grounded in your profile, goals and skills.",BrainCircuit],
  ["Career Roadmap","Turn a target role into a practical sequence of skills and projects.",Target],
  ["Skill Gap Analyzer","See your strengths and the priority skills to learn next.",LineChart],
  ["ATS Resume Builder","Create structured, professional resumes with a live preview.",BriefcaseBusiness],
  ["AI Mock Interview","Practice role-specific technical, HR and behavioral questions.",MessageCircle],
  ["Opportunity Matching","Explore jobs, internships and scholarships with transparent factors.",GraduationCap],
] as const;

export default function HomePage() {
  return <main className={styles.page}>
    <nav className={styles.nav}>
      <Link to="/" className={styles.logo}><span>H</span> HerSphere</Link>
      <div className={styles.links}><a href="#features">Features</a><a href="#how">How It Works</a><a href="#opportunities">Opportunities</a><Link to="/mentorship">Mentorship</Link><a href="#about">About</a></div>
      <div className={styles.actions}><Link to="/login" className={styles.login}>Login</Link><Link to="/register" className={styles.primary}>Get Started <ArrowRight size={16}/></Link></div>
    </nav>
    <section className={styles.hero}>
      <div>
        <div className={styles.eyebrow}><Sparkles size={15}/> AI-powered career ecosystem</div>
        <h1>Shape Your Career.<br/><em>Own Your Future.</em></h1>
        <p>HerSphere brings career guidance, skills, opportunities, resumes, learning and mentorship into one intelligent workspace built around you.</p>
        <div className={styles.heroActions}><Link to="/register" className={styles.primaryLarge}>Create your career profile <ArrowRight size={18}/></Link><a href="#features" className={styles.secondary}>Explore Features</a></div>
        <div className={styles.trust}><ShieldCheck size={16}/> Transparent recommendations. No guaranteed outcomes.</div>
      </div>
      <div className={styles.preview}>
        <div className={styles.window}>
          <div className={styles.windowTop}><i/><i/><i/><b>Career Command Center</b></div>
          <div className={styles.windowBody}>
            <b>Good morning, future builder <span>✦</span></b><small>Your next step is already clearer.</small>
            <div className={styles.stats}><div><small>Career readiness</small><strong>Profile-based</strong><i/></div><div><small>Profile completion</small><strong>Calculated live</strong><i/></div></div>
            <div className={styles.insight}><span><BrainCircuit size={17}/></span><div><b>AI Career Insight</b><small>Full Stack Development is aligned with your current profile.</small></div><label>Personalized match</label></div>
            <div className={styles.rows}><div><small>Recommended</small><b>Relevant opportunities</b><span>Matched to your skills and preferences</span></div><div><small>Roadmap</small><b>Role-specific milestones</b><span>Progress based on completed steps</span></div></div>
          </div>
        </div>
      </div>
    </section>
    <section id="features" className={styles.section}>
      <header><span className={styles.kicker}>ONE ECOSYSTEM</span><h2>Everything you need to move <em>forward.</em></h2><p>From your first career question to your next opportunity, keep the whole journey connected.</p></header>
      <div className={styles.grid}>{features.map(([title,desc,Icon])=><article key={title}><span className={styles.featureIcon}><Icon size={20}/></span><h3>{title}</h3><p>{desc}</p><ArrowRight size={16}/></article>)}</div>
    </section>
    <section id="how" className={styles.steps}><header><span className={styles.kicker}>HOW IT WORKS</span><h2>Your career, <em>connected.</em></h2></header><div className={styles.stepGrid}>{["Create your profile","Analyze your skills","Get personalized recommendations","Build your roadmap","Apply and grow"].map((x,i)=><div key={x}><span>0{i+1}</span><b>{x}</b><p>{["Tell HerSphere where you are and where you want to go.","Understand your strengths and priority gaps.","Discover relevant paths, resources and opportunities.","Follow a practical plan built around your target role.","Track progress and keep building momentum."][i]}</p></div>)}</div></section>
    <section id="opportunities" className={styles.callout}><div><span className={styles.kicker}>BUILT AROUND YOU</span><h2>Stop searching in ten places.</h2><p>Jobs, internships, scholarships, learning and mentors belong in the same career workspace.</p></div><Link to="/register" className={styles.primaryLarge}>Start with HerSphere <ArrowRight size={18}/></Link></section>
    <footer id="about"><div className={styles.logo}><span>H</span> HerSphere</div><p>Your Career. Your Future. Your Sphere.</p><small>© 2026 HerSphere · Phase 1</small></footer>
  </main>;
}
