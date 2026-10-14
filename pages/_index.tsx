import { Link } from "react-router-dom";
import { ArrowRight, BrainCircuit, BriefcaseBusiness, GraduationCap, LineChart, MessageCircle, ShieldCheck, Sparkles, Target } from "lucide-react";
import styles from "./_index.module.css";

const features = [
  ["AI Career Mentor","Career guidance grounded in your profile, goals and skills.",BrainCircuit],
  ["Career Roadmap","Turn a target role into a practical sequence of skills and projects.",Target],
  ["Skill Gap Analyzer","See your strengths and the priority skills to learn next.",LineChart],
  ["ATS Resume Builder","Create structured, professional resumes with a live preview.",BriefcaseBusiness],
   10	  ["AI Mock Interview","Practice role-specific technical, HR and behavioral questions.",MessageCircle],
   11	  ["Opportunity Matching","Explore jobs, internships and scholarships with transparent factors.",GraduationCap],
   12	] as const;
   13	
   14	export default function HomePage() {
   15	  return <main className={styles.page}>
   16	    <nav className={styles.nav}>
   17	      <Link to="/" className={styles.logo}><span>H</span> HerSphere</Link>
   18	      <div className={styles.links}><a href="#features">Features</a><a href="#how">How It Works</a><a href="#opportunities">Opportunities</a><Link to="/mentorship">Mentorship</Link><a href="#about">About</a></div>
   19	      <div className={styles.actions}><Link to="/login" className={styles.login}>Login</Link><Link to="/register" className={styles.primary}>Get Started <ArrowRight size={16}/></Link></div>
   20	    </nav>
   21	    <section className={styles.hero}>
   22	      <div>
   23	        <div className={styles.eyebrow}><Sparkles size={15}/> AI-powered career ecosystem</div>
   24	        <h1>Shape Your Career.<br/><em>Own Your Future.</em></h1>
   25	        <p>HerSphere brings career guidance, skills, opportunities, resumes, learning and mentorship into one intelligent workspace built around you.</p>
   26	        <div className={styles.heroActions}><Link to="/register" className={styles.primaryLarge}>Create your career profile <ArrowRight size={18}/></Link><a href="#features" className={styles.secondary}>Explore Features</a></div>
   27	        <div className={styles.trust}><ShieldCheck size={16}/> Transparent recommendations. No guaranteed outcomes.</div>
   28	      </div>
   29	      <div className={styles.preview}>
   30	        <div className={styles.window}>
   31	          <div className={styles.windowTop}><i/><i/><i/><b>Career Command Center</b></div>
   32	          <div className={styles.windowBody}>
   33	            <b>Good morning, future builder <span>✦</span></b><small>Your next step is already clearer.</small>
   34	            <div className={styles.stats}><div><small>Career readiness</small><strong>Profile-based</strong><i/></div><div><small>Profile completion</small><strong>Calculated live</strong><i/></div></div>
   35	            <div className={styles.insight}><span><BrainCircuit size={17}/></span><div><b>AI Career Insight</b><small>Full Stack Development is aligned with your current profile.</small></div><label>Personalized match</label></div>
   36	            <div className={styles.rows}><div><small>Recommended</small><b>Relevant opportunities</b><span>Matched to your skills and preferences</span></div><div><small>Roadmap</small><b>Role-specific milestones</b><span>Progress based on completed steps</span></div></div>
   37	          </div>
   38	        </div>
   39	      </div>
   40	    </section>
   41	    <section id="features" className={styles.section}>
   42	      <header><span className={styles.kicker}>ONE ECOSYSTEM</span><h2>Everything you need to move <em>forward.</em></h2><p>From your first career question to your next opportunity, keep the whole journey connected.</p></header>
   43	      <div className={styles.grid}>{features.map(([title,desc,Icon])=><article key={title}><span className={styles.featureIcon}><Icon size={20}/></span><h3>{title}</h3><p>{desc}</p><ArrowRight size={16}/></article>)}</div>
   44	    </section>
   45	    <section id="how" className={styles.steps}><header><span className={styles.kicker}>HOW IT WORKS</span><h2>Your career, <em>connected.</em></h2></header><div className={styles.stepGrid}>{["Create your profile","Analyze your skills","Get personalized recommendations","Build your roadmap","Apply and grow"].map((x,i)=><div key={x}><span>0{i+1}</span><b>{x}</b><p>{["Tell HerSphere where you are and where you want to go.","Understand your strengths and priority gaps.","Discover relevant paths, resources and opportunities.","Follow a practical plan built around your target role.","Track progress and keep building momentum."][i]}</p></div>)}</div></section>
   46	    <section id="opportunities" className={styles.callout}><div><span className={styles.kicker}>BUILT AROUND YOU</span><h2>Stop searching in ten places.</h2><p>Jobs, internships, scholarships, learning and mentors belong in the same career workspace.</p></div><Link to="/register" className={styles.primaryLarge}>Start with HerSphere <ArrowRight size={18}/></Link></section>
   47	    <footer id="about"><div className={styles.logo}><span>H</span> HerSphere</div><p>Your Career. Your Future. Your Sphere.</p><small>© 2026 HerSphere · Phase 1</small></footer>
   48	  </main>;
   49	}