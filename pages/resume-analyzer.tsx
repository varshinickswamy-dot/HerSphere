import { useCallback, useEffect, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, AlertCircle, FileSearch } from "lucide-react";
import { postResumeAnalyzer } from "../endpoints/resume_analyzer_POST.schema";
import { useAuth } from "../helpers/useAuth";
import styles from "./resume-analyzer.module.css";

export default function ResumeAnalyzer() {
  const { authState } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const jobDescriptionRef = useRef(jobDescription);
  useEffect(() => { jobDescriptionRef.current = jobDescription; }, [jobDescription]);
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const payload = await postResumeAnalyzer({ jobDescription: jobDescriptionRef.current }, { credentials: "include" });
      setData(payload);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Resume analysis is temporarily unavailable."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { if (authState.type === "authenticated") void load(); }, [authState.type, load]);
  if (authState.type === "loading") return <main className={styles.page}><p role="status">Checking your session…</p></main>;
  if (authState.type !== "authenticated") return <Navigate to="/login" replace state={{ from: "/resume-analyzer" }} />;
  return <main className={styles.page}><header><Link to="/dashboard" className={styles.back}><ArrowLeft size={16}/> Dashboard</Link><span>RESUME ANALYZER</span><h1>Turn your resume into evidence.</h1><p>Review your resume structure and compare it with a specific job description.</p></header>
    {data?.checks && <section className={styles.jobMatch}><label htmlFor="job-description">Paste the job description for a targeted comparison</label><textarea id="job-description" value={jobDescription} onChange={e=>setJobDescription(e.target.value)} rows={7} maxLength={12000} placeholder="Paste the responsibilities and requirements here…"/><button onClick={()=>void load()} disabled={loading||!jobDescription.trim()}>{loading?"Comparing…":"Compare resume with job"}</button></section>}
    {loading ? <div className={styles.empty} role="status">Analyzing your saved resume…</div> : error ? <div className={styles.empty} role="alert"><FileSearch size={28}/><b>{error}</b><p>Save or update your resume, then run the analysis again.</p><button onClick={() => void load()}>Try again</button><Link to="/resume">Open Resume Builder</Link></div> : data?.checks ? <><div className={styles.score}><span>RESUME STRUCTURE CHECK</span><strong>{data.checks.filter((x:any)=>x.ok).length}/{data.checks.length}</strong></div><section className={styles.list}>{data.checks.map((check:any)=><article key={check.label}>{check.ok ? <CheckCircle2/> : <AlertCircle/>}<div><b>{check.label}</b><small>{check.ok ? "Good coverage" : "Needs improvement"}</small></div></article>)}</section>{data.jobMatch&&<section className={styles.match}><div className={styles.score}><span>JOB MATCH ESTIMATE · {data.jobMatch.mode==="ai"?"AI ASSISTED":"KEYWORD FALLBACK"}</span><strong>{data.jobMatch.overallScore}%</strong></div><p>{data.jobMatch.disclaimer}</p><h3>Evidence found</h3><div className={styles.tags}>{data.jobMatch.matchedSkills.map((x:string)=><span key={x}>{x}</span>)}</div><h3>Potential gaps to review</h3><div className={styles.tags}>{data.jobMatch.missingSkills.map((x:string)=><span key={x}>{x}</span>)}</div><h3>Suggested improvements</h3><ul>{data.jobMatch.suggestions.map((x:string,i:number)=><li key={i}>{x}</li>)}</ul></section>}<Link className={styles.button} to="/resume">Improve resume</Link></> : <div className={styles.empty}><FileSearch size={28}/><b>No saved resume to analyze.</b><p>Build your ATS resume first.</p><Link to="/resume">Open Resume Builder</Link></div>}
  </main>;
}

