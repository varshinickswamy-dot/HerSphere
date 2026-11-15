import { useCallback, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ArrowLeft, ExternalLink, Search, Target } from "lucide-react";
import superjson from "superjson";
import { useAuth } from "../helpers/useAuth";
import styles from "./internships.module.css";

type Internship = {
  id?: string;
  role?: string;
  companyName?: string;
  duration?: string;
  stipend?: string;
  location?: string;
  industry?: string;
  skills?: string[];
  applicationUrl?: string;
  description?: string;
};

export default function Internships() {
  const { authState } = useAuth();
  const [items, setItems] = useState<Internship[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/_api/internships", { credentials: "include" });
      if (!response.ok) {
        throw new Error(response.status === 401
          ? "Your session may have expired. Sign in again to view internships."
          : "We couldn't load internships. Please try again.");
      }
      const payload = superjson.parse<{ internships?: Internship[] }>(await response.text());
      setItems(payload.internships ?? []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We couldn't load internships. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authState.type === "authenticated") void load();
  }, [authState.type, load]);

  if (authState.type === "loading") {
    return <main className={styles.page}><div className={styles.empty} role="status">Checking your session…</div></main>;
  }
  if (authState.type !== "authenticated") {
    return <Navigate to="/login" replace state={{ from: "/internships" }} />;
  }

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = items.filter((item) => JSON.stringify(item).toLowerCase().includes(normalizedQuery));

  return (
    <main className={styles.page}>
      <header>
        <Link to="/dashboard" className={styles.back}><ArrowLeft size={16} /> Dashboard</Link>
        <span className={styles.kicker}>INTERNSHIPS</span>
        <h1>Find internships that build experience.</h1>
        <p>Explore internship listings available in the HerSphere database.</p>
      </header>
      <div className={styles.controls}>
        <label className={styles.search}>
          <Search size={15} />
          <input aria-label="Search internships" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search role, company or skill" />
        </label>
      </div>
      {loading ? (
        <div className={styles.empty} role="status">Loading internships…</div>
      ) : error ? (
        <div className={styles.empty} role="alert">
          <b>Internships unavailable</b>
          <small>{error}</small>
          <button className={styles.retry} onClick={() => void load()}>Try again</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          <Target size={28} />
          <b>{normalizedQuery ? "No matching internships" : "No current internships"}</b>
          <small>{normalizedQuery ? "Try another role, company or skill." : "Listings will appear here when internships are added to HerSphere."}</small>
        </div>
      ) : (
        <section className={styles.grid} aria-label="Internship listings">
          {filtered.map((item, index) => (
            <article className={styles.card} key={item.id ?? (item.role ?? "internship") + "-" + index}>
              <div className={styles.icon}><Target size={17} /></div>
              <div className={styles.body}>
                <span>{item.companyName || item.industry || "INTERNSHIP"}</span>
                <h2>{item.role || "Internship opportunity"}</h2>
                {item.description && <p>{item.description}</p>}
                <p>{[item.duration, item.stipend, item.location].filter(Boolean).join(" · ")}</p>
                {item.skills?.length ? <small>{item.skills.join(" · ")}</small> : null}
                {item.applicationUrl && <p><a href={item.applicationUrl} target="_blank" rel="noreferrer">View application <ExternalLink size={13} /></a></p>}
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}