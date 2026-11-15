import { useCallback, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, AlertCircle, FileSearch } from "lucide-react";
import superjson from "superjson";
import { useAuth } from "../helpers/useAuth";
import styles from "./resume-analyzer.module.css";

export default function ResumeAnalyzer() {
  const { authState } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await fetch("/_api/resume-analyzer", { method: "POST", credentials: "include" });
      const payload = superjson.parse<any>(await response.text());
      if (!response.ok) throw new Error(payload?.error || "Resume analysis is temporarily unavailable.");
      setData(payload);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Resume analysis is temporarily unavailable."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { if (authState.type === "authenticated") void load(); }, [authState.type, load]);
  if (authState.type === "loading") return <main className={styles.page}><p role="status">Checking your session…</p></main>;
  if (authState.type !== "authenticated") return <Navigate to="/login" replace state={{ from: "/resume-analyzer" }} />;
  return <main className={styles.page}><header><Link to="/dashboard" className={styles.back}><ArrowLeft size={16}/> Dashboard</Link><span>RESUME ANALYZER</span><h1>Turn your resume into evidence.</h1><p>ATS checks highlight strengths and gaps that can reduce recruiter visibility.</p></header>
    {loading ? <div className={styles.empty} role="status">Analyzing your saved resume…</div> : error ? <div className={styles.empty} role="alert"><FileSearch size={28}/><b>{error}</b><p>Save or update your resume, then run the analysis again.</p><button onClick={() => void load()}>Try again</button><Link to="/resume">Open Resume Builder</Link></div> : data?.checks ? <><div className={styles.score}><span>ATS SCORE</span><strong>{data.resume?.atsScore || 0}%</strong></div><section className={styles.list}>{data.checks.map((check:any)=><article key={check.label}>{check.ok ? <CheckCircle2/> : <AlertCircle/>}<div><b>{check.label}</b><small>{check.ok ? "Good coverage" : "Needs improvement"}</small></div></article>)}</section><Link className={styles.button} to="/resume">Improve resume</Link></> : <div className={styles.empty}><FileSearch size={28}/><b>No saved resume to analyze.</b><p>Build your ATS resume first.</p><Link to="/resume">Open Resume Builder</Link></div>}
  </main>;
}


typecheck of earlier writes (pages/resume-analyzer.tsx): clean
