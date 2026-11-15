import { useCallback, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import superjson from "superjson";
import { useAuth } from "../helpers/useAuth";
import styles from "./scholarships.module.css";

export default function Scholarships() {
  const { authState } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/_api/scholarships", { credentials: "include" });
      if (!response.ok) throw new Error(response.status === 401 ? "Your session may have expired. Sign in again." : "We couldn't load scholarships. Please try again.");
      const payload = superjson.parse<{ scholarships?: any[] }>(await response.text());
      setItems(payload.scholarships ?? []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We couldn't load scholarships. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (authState.type === "authenticated") void load(); }, [authState.type, load]);
  if (authState.type === "loading") return <main className={styles.page}><div className={styles.empty} role="status">Checking your session…</div></main>;
  if (authState.type !== "authenticated") return <Navigate to="/login" replace state={{ from: "/scholarships" }} />;

  const filtered = items.filter(item => JSON.stringify(item).toLowerCase().includes(query.trim().toLowerCase()));
  return <main className={styles.page}>
    <header><Link to="/dashboard" className={styles.back}><ArrowLeft size={16}/> Dashboard</Link><span className={styles.kicker}>SCHOLARSHIPS</span><h1>Find funding for your future.</h1><p>Explore scholarship records available in HerSphere.</p></header>
    <div className={styles.search}><Search size={15}/><input aria-label="Search scholarships" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search scholarships"/></div>
    {loading ? <div className={styles.empty} role="status">Loading scholarships…</div> : error ? <div className={styles.empty} role="alert"><b>Scholarships unavailable</b><span>{error}</span><button onClick={() => void load()}>Try again</button></div> : filtered.length ? <section className={styles.grid}>{filtered.map((item:any) => <article className={styles.card} key={item.id}><b>{item.provider || "SCHOLARSHIP"}</b><h2>{item.scholarshipName || item.name || "Scholarship opportunity"}</h2><p>{item.eligibility || "Review eligibility requirements before applying."}</p><small>{[item.amount,item.educationLevel,item.deadline].filter(Boolean).join(" · ")}</small>{item.applicationUrl && <p><a href={item.applicationUrl} target="_blank" rel="noreferrer">View application</a></p>}</article>)}</section> : <div className={styles.empty}><b>{query ? "No matching scholarships" : "No scholarship records available yet."}</b><span>{query ? "Try another search term." : "Verified records will appear here when added to the platform."}</span></div>}
  </main>;
}
