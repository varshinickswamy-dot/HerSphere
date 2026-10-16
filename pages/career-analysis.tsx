import { useEffect,useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, Loader2, Sparkles, Target, TrendingUp } from "lucide-react";
import { getCareerAnalysis } from "../endpoints/career_analysis_GET.schema";
import { postCareerAnalysis } from "../endpoints/career_analysis_POST.schema";
import styles from "./career-analysis.module.css";
export default function CareerAnalysisPage(){
 const [role,setRole]=useState(""); const [data,setData]=useState<any>(null); const [loading,setLoading]=useState(false); const [error,setError]=useState("");
 useEffect(()=>{getCareerAnalysis().then(setData).catch(()=>{});},[]);
   10	 const run=async()=>{if(!role.trim())return;setLoading(true);setError("");try{setData(await postCareerAnalysis({targetRole:role}))}catch(e){setError("Complete your profile and try again.")}finally{setLoading(false)}};
   11	 const a=data?.assessment,r=data?.roadmap;
   12	 return <main className={styles.page}><header><Link to="/dashboard" className={styles.back}><ArrowLeft size={16}/> Dashboard</Link><span className={styles.kicker}>AI CAREER INTELLIGENCE</span><h1>Understand your <em>next move.</em></h1><p>Choose a target role. HerSphere compares your profile skills with a role-specific capability map and saves your assessment.</p></header>
   13	 <section className={styles.inputCard}><label>Target career role<input value={role||a?.targetRole||""} onChange={e=>setRole(e.target.value)} placeholder="e.g. Full Stack Developer"/></label><button onClick={run} disabled={loading}>{loading?<Loader2 className={styles.spin} size={17}/>:<Sparkles size={17}/>} {loading?"Analyzing...":"Analyze my career"}</button>{error&&<small className={styles.error}>{error}</small>}</section>
   14	 {a&&<><section className={styles.metrics}><article><span><TrendingUp size={18}/></span><small>Readiness</small><strong>{a.readinessScore}%</strong></article><article><span><CheckCircle2 size={18}/></span><small>Strengths</small><strong>{a.strengths?.length??0}</strong></article><article><span><Target size={18}/></span><small>Priority gaps</small><strong>{a.skillGaps?.length??0}</strong></article></section>
   15	 <section className={styles.content}><div className={styles.panel}><span className={styles.kicker}>ASSESSMENT</span><h2>{a.targetRole}</h2><p>{a.summary}</p><div className={styles.skillTitle}>Current strengths</div><div className={styles.tags}>{(a.strengths??[]).map((x:string)=><span className={styles.good} key={x}><CheckCircle2 size={13}/>{x}</span>)}</div><div className={styles.skillTitle}>Priority skills</div><div className={styles.tags}>{(a.skillGaps??[]).map((x:string)=><span key={x}><Circle size={13}/>{x}</span>)}</div></div><div className={styles.panel}><span className={styles.kicker}>ROADMAP</span><h2>Your next milestones</h2>{(r?.milestones??[]).map((m:any)=><div className={styles.milestone} key={m.step}><b>{String(m.step).padStart(2,"0")}</b><div><strong>{m.title}</strong><small>{m.description}</small></div><ArrowRight size={15}/></div>)}</div></section></>}
   16	 </main>
   17	}