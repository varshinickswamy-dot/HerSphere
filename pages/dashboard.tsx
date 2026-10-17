import { Link } from "react-router-dom";
import type { ElementType } from "react";
import { ArrowRight, Award, Bell, BookOpen, BriefcaseBusiness, Bookmark, CalendarDays, CheckCircle2, ChevronRight, CircleUserRound, FileText, GraduationCap, LayoutDashboard, LogOut, MessageCircle, Sparkles, Target, TrendingUp, Users, Menu, X } from "lucide-react";
import { useAuth } from "../helpers/useAuth";
import { ThemeModeSwitch } from "../components/ThemeModeSwitch";
import { useEffect, useState } from "react";
import { getDashboard } from "../endpoints/dashboard_GET.schema";
import styles from "./dashboard.module.css";

const nav: Array<[string,string,ElementType]>=[
  ["Dashboard","/dashboard",LayoutDashboard],["My Profile","/profile",CircleUserRound],
  ["AI Career Mentor","/mentor",MessageCircle],["Career Roadmap","/roadmap",Target],
  ["Skill Gap","/skill-gap",TrendingUp],["Resume Builder","/resume",FileText],
  ["Mock Interview","/mock-interview",Target],["Jobs","/opportunities",BriefcaseBusiness],
  ["Internships","/internships",GraduationCap],["Scholarships","/scholarships",Award],
  ["Applications","/applications",FileText],["Recommendations","/recommendations",Sparkles],
  ["Notifications","/notifications",Bell],["Messages","/messages",MessageCircle],["Saved Jobs","/saved-jobs",Bookmark],["Job Alerts","/job-alerts",Bell],["Learning","/learning",BookOpen],["Mentorship","/mentorship",Users],["Community","/community",Users],["Events","/events",CalendarDays],
  ["Recruiter Portal","/recruiter",BriefcaseBusiness]
];

const toolkit=[
  ["AI Career Mentor","Get contextual answers, career strategy, resume feedback and interview coaching.",MessageCircle,"/mentor"],
  ["Career Roadmap","Turn your target role into milestones, priorities and measurable next steps.",Target,"/roadmap"],
  ["Skill Gap","See priority skills, strengths and gaps against your chosen career direction.",TrendingUp,"/career-analysis"],
  ["ATS Resume Builder","Create, analyze and improve a role-focused resume with ATS feedback.",FileText,"/resume"],
  ["AI Mock Interview","Practice realistic role-specific questions and receive structured feedback.",Target,"/mock-interview"],
  ["Smart Recommendations","Discover personalized learning resources, scholarships and opportunities.",Sparkles,"/recommendations"],
  ["Live Opportunities","Search jobs and internships with employer expectations and profile matching.",BriefcaseBusiness,"/opportunities"],
  ["Application Tracker","Track saved, applied, interview, rejected and selected opportunities.",CheckCircle2,"/applications"]
];

export default function DashboardPage(){
  const {authState,logout}=useAuth();
  const [data,setData]=useState<any>(null);
  const [mobileNavOpen,setMobileNavOpen]=useState(false);
  useEffect(()=>{if(authState.type==="authenticated")getDashboard().then(setData).catch(()=>setData(null))},[authState.type]);
  if(authState.type==="loading") return <div role="status" aria-live="polite" style={{minHeight:"100vh",display:"grid",placeItems:"center",background:"var(--background)",color:"var(--foreground)"}}>Checking your secure session…</div>;
  if(authState.type==="unauthenticated"){window.location.replace("/login");return null;}
  const name=data?.user?.displayName||authState.user?.displayName||"there";
  const stats=data?.stats||{};
  const profile=data?.profile;
  const role=profile?.preferredRole||profile?.careerGoal||"your target role";
  const readiness=Number(stats.readiness||0);
  const profileCompletion=Number(stats.profileCompletion||0);

  return <main className={styles.shell}>
    <button type="button" aria-label={mobileNavOpen?"Close navigation menu":"Open navigation menu"} aria-expanded={mobileNavOpen} className={styles.mobileMenu} onClick={()=>setMobileNavOpen(v=>!v)}>{mobileNavOpen?<X size={20}/>:<Menu size={20}/>}</button>
    {mobileNavOpen&&<button type="button" aria-label="Close navigation overlay" className={styles.mobileOverlay} onClick={()=>setMobileNavOpen(false)}/>}
    <aside className={mobileNavOpen?styles.mobileSidebar:styles.sidebar}>
      <Link to="/" className={styles.logo}><span>H</span> HerSphere</Link>
      <div className={styles.navLabel}>WORKSPACE</div>
      {nav.map(([label,to,Icon])=><Link key={label} to={to} onClick={()=>setMobileNavOpen(false)} className={label==="Dashboard"?styles.active:styles.nav}><Icon size={16}/>{label}</Link>)}
      <div className={styles.sideBottom}>
        <div className={styles.themeRow}><span>Theme</span><ThemeModeSwitch/></div>
        <Link to="/settings" onClick={()=>setMobileNavOpen(false)} className={styles.nav}><CircleUserRound size={16}/> Settings</Link>
        <button onClick={async()=>{await logout();window.location.assign("/login")}} className={styles.nav}><LogOut size={16}/> Sign out</button>
      </div>
    </aside>

    <section className={styles.main}>
      <header className={styles.top}>
        <div><span className={styles.kicker}>CAREER COMMAND CENTER · PERSONAL WORKSPACE</span><h1>Welcome, {name}. <span>✦</span></h1><p>Your personalized career workspace for {role}. Track skills, opportunities, applications, learning and interview readiness in one place.</p></div>
        <Link to="/notifications" className={styles.bell}><Bell size={18}/><i/></Link>
      </header>

      <div className={styles.heroCard}>
        <div><span className={styles.kicker}>PERSONALIZED CAREER SNAPSHOT</span><h2>{role} career journey</h2><p>Complete your profile, strengthen priority skills, improve your resume and use matched opportunities to move from exploration to application.</p><Link to="/career-analysis" className={styles.primary}>Explore career analysis <ArrowRight size={16}/></Link></div>
        <div className={styles.ring}><strong>{profileCompletion}%</strong><small>profile</small></div>
      </div>

      <div className={styles.stats}>
        <article><span><TrendingUp size={17}/></span><small>Career readiness</small><b>{readiness}%</b><em>Based on your latest assessment</em></article>
        <article><span><Target size={17}/></span><small>Profile & skills</small><b>{stats.skills||0}</b><em>{profileCompletion}% profile complete</em></article>
        <article><span><BriefcaseBusiness size={17}/></span><small>Applications</small><b>{stats.applications||0}</b><em>{stats.interviews||0} interview stage</em></article>
        <article><span><BookOpen size={17}/></span><small>Career activity</small><b>{stats.offers||0}</b><em>{stats.saved||0} saved opportunities</em></article>
      </div>

      <div className={styles.columns}>
        <section className={styles.panel}>
          <div className={styles.panelHead}><div><span className={styles.kicker}>CAREER ECOSYSTEM</span><h3>Your career toolkit</h3></div></div>
          {toolkit.map(([title,description,Icon,to])=>{const ToolIcon=Icon as ElementType;return <Link to={String(to)} className={styles.tool} key={String(title)}><span><ToolIcon size={17}/></span><div><b>{String(title)}</b><small>{String(description)}</small></div><ChevronRight size={16}/></Link>})}
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHead}><div><span className={styles.kicker}>PROFILE INTELLIGENCE</span><h3>Your profile snapshot</h3></div><Link to="/profile" className={styles.primary}>Improve profile <ArrowRight size={14}/></Link></div>
          <div className={styles.status}>
            {[["Education",profile?.degree||"Add your degree"],["Skills",(profile?.skills||[]).slice(0,5).join(" · ")||"Add your skills"],["Career goal",profile?.careerGoal||"Set a career goal"],["Preferred role",profile?.preferredRole||"Choose a target role"]].map(([x,value])=><div key={x}><span><CheckCircle2 size={16}/></span><b>{x}</b><small>{value}</small></div>)}
          </div>
          <div className={styles.demoNote}><Sparkles size={14}/><span>HerSphere combines your profile, career analysis, resume, interview, opportunity and application activity to personalize your workspace. Matches and readiness indicators are guidance, not guarantees.</span></div>
        </section>
      </div>
    </section>
  </main>;
}
