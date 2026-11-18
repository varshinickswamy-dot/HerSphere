import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Bookmark, BookmarkCheck, Search, SlidersHorizontal, X, Users, RefreshCw } from "lucide-react";
import { getRecruiterCandidates, type CandidateSearch } from "../endpoints/recruiter_candidates_GET.schema";
import { saveRecruiterCandidate } from "../endpoints/recruiter_candidates_POST.schema";
import { getRecruiter } from "../endpoints/recruiter_GET.schema";
import { getRecruiterMatches } from "../endpoints/recruiter_matches_GET.schema";
import styles from "./recruiter-candidates.module.css";

export default function RecruiterCandidates() {
  const [filters, setFilters] = useState<CandidateSearch>({});
  const [draft, setDraft] = useState<CandidateSearch>({});
  const [items, setItems] = useState<any[]>([]);
  const [savedOnly, setSavedOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [summary, setSummary] = useState({ total: 0, savedCount: 0 });
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState("");
  const [matchData, setMatchData] = useState<any>(null);
  const [matching, setMatching] = useState(false);

  const load = async (next: CandidateSearch = filters, onlySaved = savedOnly) => {
    setLoading(true); setError("");
    try {
      const result = await getRecruiterCandidates({ ...next, savedOnly: onlySaved });
      setItems(result.candidates || []);
      setSummary({ total: result.total || 0, savedCount: result.savedCount || 0 });
    } catch (e: any) { setError(e?.message || "Could not load candidates."); }
    finally { setLoading(false); }
  };
  useEffect(() => {
    void load({}, false);
    getRecruiter().then((result) => {
      const availableJobs = result.jobs || [];
      setJobs(availableJobs);
      if (availableJobs[0]) setSelectedJob(String(availableJobs[0].id));
    }).catch(() => undefined);
  }, []);

  const generateMatches = async () => {
    if (!selectedJob) return;
    setMatching(true); setError("");
    try { setMatchData(await getRecruiterMatches(selectedJob)); }
    catch (e: any) { setError(e?.message || "Could not generate candidate matches."); }
    finally { setMatching(false); }
  };
  const applyFilters = (event: React.FormEvent) => {
    event.preventDefault(); setFilters(draft); void load(draft, savedOnly);
  };
  const resetFilters = () => { setDraft({}); setFilters({}); void load({}, savedOnly); };
  const toggleSaved = async (candidate: any) => {
    setSavingId(String(candidate.id)); setError(""); setNotice("");
    try {
      await saveRecruiterCandidate({ action: candidate.isSaved ? "remove" : "save", candidateUserId: String(candidate.id), note: candidate.savedNote || "" });
      setNotice(candidate.isSaved ? "Candidate removed from your saved list." : "Candidate saved for follow-up.");
      await load(filters, savedOnly);
    } catch (e: any) { setError(e?.message || "Could not update saved candidate."); }
    finally { setSavingId(""); }
  };

  return <main className={styles.page}>
    <Link to="/recruiter" className={styles.back}><ArrowLeft size={16}/> Recruiter workspace</Link>
    <header className={styles.header}>
      <span>RECRUITER TALENT DISCOVERY</span>
      <h1>Discover women ready for their next opportunity.</h1>
      <p>Find candidates by skills, location, graduation year and academic criteria. Save profiles to build a follow-up shortlist.</p>
    </header>
    <section className={styles.toolbar}>
      <form className={styles.search} onSubmit={applyFilters}>
        <Search size={17}/><input value={draft.q || ""} onChange={e => setDraft(v => ({ ...v, q: e.target.value }))} placeholder="Search name, skill, college, role or location…"/>
        <button type="submit" disabled={loading}>{loading ? "Searching…" : "Search"}</button>
      </form>
      <div className={styles.actions}>
        <button className={showFilters ? styles.activeToggle : styles.toggle} onClick={() => setShowFilters(v => !v)}><SlidersHorizontal size={15}/> Filters</button>
        <button className={savedOnly ? styles.activeToggle : styles.toggle} onClick={() => { const next = !savedOnly; setSavedOnly(next); void load(filters, next); }}><BookmarkCheck size={15}/> Saved ({summary.savedCount})</button>
      </div>
    </section>
    <section className={styles.matchPanel}>
      <div><span className={styles.eyebrow}>AI-ASSISTED RECRUITMENT INTELLIGENCE</span><h2>Find the strongest job matches</h2><p>Compare candidate skills and profile details against one of your company’s published roles. Scores are explainable profile-based estimates, not automated hiring decisions.</p></div>
      <div className={styles.matchControls}>
        <select aria-label="Select a published role" value={selectedJob} onChange={e => { setSelectedJob(e.target.value); setMatchData(null); }}>
          <option value="">Select a published role</option>
          {jobs.map(job => <option key={job.id} value={String(job.id)}>{job.title}</option>)}
        </select>
        <button onClick={() => void generateMatches()} disabled={!selectedJob || matching}>{matching ? "Matching…" : "Generate matches"}</button>
      </div>
      {jobs.length === 0 && <small>Publish a role in your recruiter workspace to generate candidate matches.</small>}
      {matchData && <div className={styles.matchResults}>
        <strong>{matchData.total} candidate profiles evaluated for {matchData.job?.title}</strong>
        {matchData.matches.slice(0, 8).map((candidate: any) => <article key={candidate.id}>
          <div><b><Link to={"/recruiter-candidate/" + candidate.id}>{candidate.displayName}</Link></b><small>{candidate.matchExplanation}</small>
            <div className={styles.matchSkills}>{(candidate.matchedSkills || []).map((skill: string) => <em key={skill}>{skill}</em>)}{(candidate.missingSkills || []).slice(0, 4).map((skill: string) => <em className={styles.missingSkill} key={skill}>Gap: {skill}</em>)}</div>
          </div><span className={styles.matchScore}>{candidate.matchScore}%<small>{candidate.eligible ? "Eligibility fit" : "Review eligibility"}</small></span>
        </article>)}
        {matchData.total === 0 && <p>No candidate profiles are available to compare yet.</p>}
      </div>}
    </section>
    {showFilters && <form className={styles.filters} onSubmit={applyFilters}>
      <label>Skill<input value={draft.skill || ""} onChange={e => setDraft(v => ({ ...v, skill: e.target.value }))} placeholder="e.g. Python"/></label>
      <label>Location<input value={draft.location || ""} onChange={e => setDraft(v => ({ ...v, location: e.target.value }))} placeholder="e.g. Bengaluru"/></label>
      <label>Graduation year<input value={draft.graduationYear || ""} onChange={e => setDraft(v => ({ ...v, graduationYear: e.target.value }))} placeholder="e.g. 2027"/></label>
      <label>Minimum CGPA<input type="number" min="0" max="10" step="0.1" value={draft.minCgpa || ""} onChange={e => setDraft(v => ({ ...v, minCgpa: e.target.value }))} placeholder="e.g. 7.5"/></label>
      <div className={styles.filterActions}><button type="submit">Apply filters</button><button type="button" className={styles.clear} onClick={resetFilters}><X size={13}/> Clear</button></div>
    </form>}
    {error && <div className={styles.alert} role="alert">{error}<button onClick={() => void load(filters, savedOnly)}>Retry</button></div>}
    {notice && <div className={styles.notice} role="status">{notice}</div>}
    <div className={styles.resultHead}><div><span className={styles.eyebrow}>{savedOnly ? "SAVED TALENT" : "CANDIDATE DIRECTORY"}</span><h2>{summary.total} {summary.total === 1 ? "candidate" : "candidates"} found</h2></div><button className={styles.refresh} onClick={() => void load(filters, savedOnly)} disabled={loading}><RefreshCw size={14}/> Refresh</button></div>
    {loading && <p className={styles.empty}>Loading candidate profiles…</p>}
    {!loading && items.length === 0 && <div className={styles.emptyState}><Users size={28}/><h3>{savedOnly ? "No saved candidates yet" : "No matching candidates"}</h3><p>{savedOnly ? "Save promising profiles from the candidate directory to see them here." : "Try adjusting your search or removing one of the filters."}</p></div>}
    <div className={styles.list}>{items.map(c => <article key={c.id} className={styles.candidate}>
      <div className={styles.identity}>{c.avatarUrl ? <img src={c.avatarUrl} alt="" /> : <span className={styles.avatar}>{(c.displayName || "C").slice(0,1).toUpperCase()}</span>}<div><h3><Link to={"/recruiter-candidate/" + c.id}>{c.displayName}</Link></h3><p>{c.preferredRole || "Career goal not set"}</p><small>{c.preferredLocation || c.location || "Location flexible"} · {c.graduationYear || "Graduation year not added"}</small></div></div>
      <div className={styles.details}><span>{c.degree || "Degree not added"}{c.branch ? " · " + c.branch : ""}</span><span>{c.college || "College not added"}</span>{c.cgpa !== null && c.cgpa !== undefined && <span>CGPA {c.cgpa}</span>}<span>Profile {c.profileCompletion || 0}%</span></div>
      <div className={styles.skills}>{(c.skills || []).slice(0,8).map((s: string) => <em key={s}>{s}</em>)}</div>
      <div className={styles.cardActions}><Link to={"/recruiter-candidate/" + c.id}>View full profile <span>→</span></Link><button onClick={() => void toggleSaved(c)} disabled={savingId === String(c.id)}>{c.isSaved ? <BookmarkCheck size={15}/> : <Bookmark size={15}/>} {savingId === String(c.id) ? "Saving…" : c.isSaved ? "Saved" : "Save candidate"}</button></div>
    </article>)}</div>
  </main>;
}
