import { useCallback, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, AlertTriangle, Target } from "lucide-react";
import superjson from "superjson";
import { useAuth } from "../helpers/useAuth";
import styles from "./skill-gap.module.css";

export default function SkillGap() {
  const { authState } = useAuth();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setError("");
    try {
      const response = await fetch("/_api/roadmap", { credentials: "include" });
      if (!response.ok) throw new Error(response.status === 401 ? "Your session may have expired. Sign in again." : "Unable to load your skill assessment.");
      setData(superjson.parse(await response.text()));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to load your skill assessment."); }
  }, []);
  useEffect(() => { if (authState.type === "authenticated") void load(); }, [authState.type, load]);
  if (authState.type === "loading") return <main className={styles.page}><p role="status">Checking your session…</p></main>;
  if (authState.type !== "authenticated") return <Navigate to="/login" replace state={{ from: "/skill-gap" }} />;
  const gaps = data?.gaps;
  return <main className={styles.page}><header><Link to="/dashboard" className={styles.back}><ArrowLeft size={16}/> Dashboard</Link><span>SKILL GAP ANALYZER</span><h1>Know what to learn next.</h1><p>{gaps?.summary || "Compare your current strengths with the skills needed for your target role."}</p></header>
    {error ? <div className={styles.empty}><b>{error}</b><button onClick={() => void load()}>Try again</button></div> : <div className={styles.columns}><section><h2><AlertTriangle size={17}/> Skill gaps</h2>{(gaps?.skillGaps || []).map((skill:string)=><div className={styles.item} key={skill}>{skill}</div>)}</section><section><h2><CheckCircle2 size={17}/> Strengths</h2>{(gaps?.strengths || []).map((skill:string)=><div className={styles.item} key={skill}>{skill}</div>)}</section></div>}
    {!error && !gaps && <div className={styles.empty}><Target size={28}/><b>No assessment yet.</b><p>Run Career Analysis to generate your personalized skill assessment.</p><Link to="/career-analysis">Analyze my career</Link></div>}
  </main>;
}
