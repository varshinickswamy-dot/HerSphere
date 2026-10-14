import { Link } from "react-router-dom";
import type { ElementType } from "react";
import { ArrowRight, Award, Bell, BookOpen, BriefcaseBusiness, Bookmark, CalendarDays, CheckCircle2, ChevronRight, CircleUserRound, FileText, GraduationCap, LayoutDashboard, LogOut, MessageCircle, Sparkles, Target, TrendingUp, Users, Menu, X } from "lucide-react";
import { useAuth } from "../helpers/useAuth";
import { ThemeModeSwitch } from "../components/ThemeModeSwitch";
import { useEffect, useState } from "react";
import { getDashboard } from "../endpoints/dashboard_GET.schema";
import styles from "./dashboard.module.css";

   10	const nav: Array<[string,string,ElementType]>=[
   11	  ["Dashboard","/dashboard",LayoutDashboard],["My Profile","/profile",CircleUserRound],
   12	  ["AI Career Mentor","/mentor",MessageCircle],["Career Roadmap","/roadmap",Target],
   13	  ["Skill Gap","/skill-gap",TrendingUp],["Resume Builder","/resume",FileText],
   14	  ["Mock Interview","/mock-interview",Target],["Jobs","/opportunities",BriefcaseBusiness],
   15	  ["Internships","/internships",GraduationCap],["Scholarships","/scholarships",Award],
   16	  ["Applications","/applications",FileText],["Recommendations","/recommendations",Sparkles],
   17	  ["Notifications","/notifications",Bell],["Messages","/messages",MessageCircle],["Saved Jobs","/saved-jobs",Bookmark],["Job Alerts","/job-alerts",Bell],["Learning","/learning",BookOpen],["Mentorship","/mentorship",Users],["Community","/community",Users],["Events","/events",CalendarDays],
   18	  ["Recruiter Portal","/recruiter",BriefcaseBusiness]
   19	];
   20	
   21	const toolkit=[
   22	  ["AI Career Mentor","Get contextual answers, career strategy, resume feedback and interview coaching.",MessageCircle,"/mentor"],
   23	  ["Career Roadmap","Turn your target role into milestones, priorities and measurable next steps.",Target,"/roadmap"],
   24	  ["Skill Gap","See priority skills, strengths and gaps against your chosen career direction.",TrendingUp,"/career-analysis"],
   25	  ["ATS Resume Builder","Create, analyze and improve a role-focused resume with ATS feedback.",FileText,"/resume"],
   26	  ["AI Mock Interview","Practice realistic role-specific questions and receive structured feedback.",Target,"/mock-interview"],
   27	  ["Smart Recommendations","Discover personalized learning resources, scholarships and opportunities.",Sparkles,"/recommendations"],
   28	  ["Live Opportunities","Search jobs and internships with employer expectations and profile matching.",BriefcaseBusiness,"/opportunities"],
   29	  ["Application Tracker","Track saved, applied, interview, rejected and selected opportunities.",CheckCircle2,"/applications"]
   30	];
   31	
   32	export default function DashboardPage(){
   33	  const {authState,logout}=useAuth();
   34	  const [data,setData]=useState<any>(null);
   35	  const [mobileNavOpen,setMobileNavOpen]=useState(false);
   36	  useEffect(()=>{if(authState.type==="authenticated")getDashboard().then(setData).catch(()=>setData(null))},[authState.type]);
   37	  if(authState.type==="loading") return <div role="status" aria-live="polite" style={{minHeight:"100vh",display:"grid",placeItems:"center",background:"var(--background)",color:"var(--foreground)"}}>Checking your secure session…</div>;
   38	  if(authState.type==="unauthenticated"){window.location.replace("/login");return null;}
   39	  const name=data?.user?.displayName||authState.user?.displayName||"there";
   40	  const stats=data?.stats||{};
   41	  const profile=data?.profile;
   42	  const role=profile?.preferredRole||profile?.careerGoal||"your target role";
   43	  const readiness=Number(stats.readiness||0);
   44	  const profileCompletion=Number(stats.profileCompletion||0);
   45	
   46	  return <main className={styles.shell}>
   47	    <button type="button" aria-label={mobileNavOpen?"Close navigation menu":"Open navigation menu"} aria-expanded={mobileNavOpen} className={styles.mobileMenu} onClick={()=>setMobileNavOpen(v=>!v)}>{mobileNavOpen?<X size={20}/>:<Menu size={20}/>}</button>
   48	    {mobileNavOpen&&<button type="button" aria-label="Close navigation overlay" className={styles.mobileOverlay} onClick={()=>setMobileNavOpen(false)}/>}
   49	    <aside className={mobileNavOpen?styles.mobileSidebar:styles.sidebar}>
   50	      <Link to="/" className={styles.logo}><span>H</span> HerSphere</Link>
   51	      <div className={styles.navLabel}>WORKSPACE</div>
   52	      {nav.map(([label,to,Icon])=><Link key={label} to={to} onClick={()=>setMobileNavOpen(false)} className={label==="Dashboard"?styles.active:styles.nav}><Icon size={16}/>{label}</Link>)}
   53	      <div className={styles.sideBottom}>
   54	        <div className={styles.themeRow}><span>Theme</span><ThemeModeSwitch/></div>
   55	        <Link to="/settings" onClick={()=>setMobileNavOpen(false)} className={styles.nav}><CircleUserRound size={16}/> Settings</Link>
   56	        <button onClick={async()=>{await logout();window.location.assign("/login")}} className={styles.nav}><LogOut size={16}/> Sign out</button>
   57	      </div>
   58	    </aside>
   59	
   60	    <section className={styles.main}>
   61	      <header className={styles.top}>
   62	        <div><span className={styles.kicker}>CAREER COMMAND CENTER · PERSONAL WORKSPACE</span><h1>Welcome, {name}. <span>✦</span></h1><p>Your personalized career workspace for {role}. Track skills, opportunities, applications, learning and interview readiness in one place.</p></div>
   63	        <Link to="/notifications" className={styles.bell}><Bell size={18}/><i/></Link>
   64	      </header>
   65	
   66	      <div className={styles.heroCard}>
   67	        <div><span className={styles.kicker}>PERSONALIZED CAREER SNAPSHOT</span><h2>{role} career journey</h2><p>Complete your profile, strengthen priority skills, improve your resume and use matched opportunities to move from exploration to application.</p><Link to="/career-analysis" className={styles.primary}>Explore career analysis <ArrowRight size={16}/></Link></div>
   68	        <div className={styles.ring}><strong>{profileCompletion}%</strong><small>profile</small></div>
   69	      </div>
   70	
   71	      <div className={styles.stats}>
   72	        <article><span><TrendingUp size={17}/></span><small>Career readiness</small><b>{readiness}%</b><em>Based on your latest assessment</em></article>
   73	        <article><span><Target size={17}/></span><small>Profile & skills</small><b>{stats.skills||0}</b><em>{profileCompletion}% profile complete</em></article>
   74	        <article><span><BriefcaseBusiness size={17}/></span><small>Applications</small><b>{stats.applications||0}</b><em>{stats.interviews||0} interview stage</em></article>
   75	        <article><span><BookOpen size={17}/></span><small>Career activity</small><b>{stats.offers||0}</b><em>{stats.saved||0} saved opportunities</em></article>
   76	      </div>
   77	
   78	      <div className={styles.columns}>
   79	        <section className={styles.panel}>
   80	          <div className={styles.panelHead}><div><span className={styles.kicker}>CAREER ECOSYSTEM</span><h3>Your career toolkit</h3></div></div>
   81	          {toolkit.map(([title,description,Icon,to])=>{const ToolIcon=Icon as ElementType;return <Link to={String(to)} className={styles.tool} key={String(title)}><span><ToolIcon size={17}/></span><div><b>{String(title)}</b><small>{String(description)}</small></div><ChevronRight size={16}/></Link>})}
   82	        </section>
   83	
   84	        <section className={styles.panel}>
   85	          <div className={styles.panelHead}><div><span className={styles.kicker}>PROFILE INTELLIGENCE</span><h3>Your profile snapshot</h3></div><Link to="/profile" className={styles.primary}>Improve profile <ArrowRight size={14}/></Link></div>
   86	          <div className={styles.status}>
   87	            {[["Education",profile?.degree||"Add your degree"],["Skills",(profile?.skills||[]).slice(0,5).join(" · ")||"Add your skills"],["Career goal",profile?.careerGoal||"Set a career goal"],["Preferred role",profile?.preferredRole||"Choose a target role"]].map(([x,value])=><div key={x}><span><CheckCircle2 size={16}/></span><b>{x}</b><small>{value}</small></div>)}
   88	          </div>
   89	          <div className={styles.demoNote}><Sparkles size={14}/><span>HerSphere combines your profile, career analysis, resume, interview, opportunity and application activity to personalize your workspace. Matches and readiness indicators are guidance, not guarantees.</span></div>
   90	        </section>
   91	      </div>
   92	    </section>
   93	  </main>;
   94	}
   95