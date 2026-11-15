import { useCallback, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Target } from "lucide-react";
import superjson from "superjson";
import { useAuth } from "../helpers/useAuth";
import styles from "./roadmap.module.css";

export default function Roadmap() {
  const { authState } = useAuth();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setError("");
    try {
      const response = await fetch("/_api/roadmap", { credentials: "include" });
      if (!response.ok) throw new Error(response.status === 401 ? "Your session may have expired. Sign in again." : "Unable to load your roadmap.");
      setData(superjson.parse(await response.text()));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to load your roadmap."); }
  }, []);
  useEffect(() => { if (authState.type === "authenticated") void load(); }, [authState.type, load]);
  if (authState.type === "loading") return <main className={styles.page}><p role="status">Checking your session…</p></main>;
  if (authState.type !== "authenticated") return <Navigate to="/login" replace state={{ from: "/roadmap" }} />;
  const milestones = Array.isArray(data?.roadmap?.milestones) ? data.roadmap.milestones : [];
  return <main className={styles.page}><header><Link to="/dashboard" className={styles.back}><ArrowLeft size={16}/> Dashboard</Link><span>CAREER ROADMAP</span><h1>Your next moves, in order.</h1><p>{data?.roadmap?.summary || "Your roadmap connects your target role to measurable career milestones."}</p></header>
    {error ? <section className={styles.card}><b>{error}</b><button onClick={() => void load()}>Try again</button></section> : <section className={styles.card}>{milestones.length ? milestones.map((item:any,index:number)=><article key={item.id || index}><CheckCircle2 size={18}/><section><b>{item.title || item.name || ("Milestone " + (index+1))}</b><p>{item.description || item.details || "Complete this milestone to progress toward your target role."}</p></section></article>) : <div className={styles.empty}><Target size={28}/><b>No roadmap generated yet.</b><p>Run Career Analysis to generate personalized milestones.</p><Link to="/career-analysis">Open Career Analysis</Link></div>}</section>}
  </main>;
}
