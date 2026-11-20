import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ArrowLeft, BriefcaseBusiness, Building2, Plus, Users, ShieldCheck, Search, RefreshCw, ClipboardCheck, UserCheck, CalendarClock } from "lucide-react";
import { useAuth } from "../helpers/useAuth";
import { useRealtimeChannel, useRealtimeReconnect } from "../components/FlootRealtimeProvider";
import { channels } from "../helpers/realtimeChannels";
import { getRecruiter } from "../endpoints/recruiter_GET.schema";
import { postRecruiter } from "../endpoints/recruiter_POST.schema";
import styles from "./recruiter.module.css";

const STATUSES = ["received", "reviewing", "shortlisted", "interview", "offer", "selected", "hired", "rejected"];
const label = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export default function RecruiterPage() {
  const { authState } = useAuth();
  const [data, setData] = useState<any>({ jobs: [], applications: [] });
  const [mode, setMode] = useState("overview");
  const [company, setCompany] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [companyLocation, setCompanyLocation] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState("");
  const [eligibility, setEligibility] = useState("");
  const [education, setEducation] = useState("");
  const [cgpa, setCgpa] = useState("");
  const [years, setYears] = useState("");
  const [experience, setExperience] = useState("");
  const [workMode, setWorkMode] = useState("Hybrid");
  const [employmentType, setEmploymentType] = useState("Full-time");
  const [salary, setSalary] = useState("");
  const [benefits, setBenefits] = useState("");
  const [deadline, setDeadline] = useState("");
  const [applicationUrl, setApplicationUrl] = useState("");
  const [applicationSearch, setApplicationSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [interviewApplication, setInterviewApplication] = useState<string | null>(null);
  const [interviewAt, setInterviewAt] = useState("");
  const [interviewMode, setInterviewMode] = useState<"online" | "in_person" | "phone">("online");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [interviewNotes, setInterviewNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const result = await getRecruiter();
      setData(result);
      setError("");
    } catch (e: any) {
      setError(e?.message || "Could not load recruiter workspace");
    } finally {
      setLoading(false);
    }
  };
  const uid = authState.type === "authenticated" ? authState.user.id : null;
  useEffect(() => { if (authState.type === "authenticated") void load(); }, [authState.type]);
  useRealtimeChannel(uid ? channels.user(String(uid)) : null, () => { void load(); });
  useRealtimeReconnect(() => { void load(); });

  const applications = data.applications || [];
  const jobs = data.jobs || [];
  const filteredApplications = useMemo(() => applications.filter((a: any) => {
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    const needle = applicationSearch.trim().toLowerCase();
    const matchesText = !needle || [a.displayName, a.email, a.title].some((v: any) => String(v || "").toLowerCase().includes(needle));
    return matchesStatus && matchesText;
  }), [applications, statusFilter, applicationSearch]);
  const counts = {
    total: applications.length,
    review: applications.filter((a: any) => ["received", "reviewing"].includes(a.status)).length,
    shortlisted: applications.filter((a: any) => a.status === "shortlisted").length,
    interviews: applications.filter((a: any) => a.status === "interview").length,
    hired: applications.filter((a: any) => ["selected", "hired"].includes(a.status)).length,
  };

  if (authState.type === "loading") return <main className={styles.page}><p>Checking access…</p></main>;
  if (authState.type !== "authenticated") return <Navigate to="/login" replace />;
  if (error && !data.profile) return <main className={styles.page}><Link to="/dashboard" className={styles.back}><ArrowLeft size={16}/> Dashboard</Link><div className={styles.denied}><ShieldCheck size={34}/><h1>Recruiter access required</h1><p>{error}</p><button onClick={() => void load()}>Try again</button></div></main>;

  const saveProfile = async () => {
    setSaving(true); setNotice("");
    try {
      await postRecruiter({ action: "profile", companyName: company.trim(), industry, description: companyDescription, website, location: companyLocation });
      setNotice("Company profile saved successfully."); await load();
    } catch (e: any) { setError(e?.message || "Could not save profile"); }
    finally { setSaving(false); }
  };
  const addJob = async () => {
    if (!title.trim() || !description.trim()) { setError("Add a role title and description before publishing."); return; }
    setSaving(true); setNotice(""); setError("");
    try {
      await postRecruiter({ action: "job", title: title.trim(), jobDescription: description, location, skills: skills.split(",").map(x => x.trim()).filter(Boolean), eligibility, educationRequirement: education, minimumCgpa: cgpa, graduationYears: years, experience, workMode, employmentType, salaryRange: salary, benefits, deadline, applicationUrl });
      setTitle(""); setDescription(""); setNotice("Opportunity published successfully."); setMode("overview"); await load();
    } catch (e: any) { setError(e?.message || "Could not publish opportunity"); }
    finally { setSaving(false); }
  };
  const updateApplication = async (id: string, status: string, interview?: boolean) => {
    setSaving(true); setError(""); setNotice("");
    try {
      await postRecruiter({ action: "status", applicationId: id, status,
        ...(interview ? { interviewAt: new Date(interviewAt).toISOString(), interviewMode, meetingUrl, notes: interviewNotes } : {}) });
      setNotice(interview ? "Interview invitation sent to the candidate's HerSphere inbox." : "Candidate status updated.");
      setInterviewApplication(null); setInterviewAt(""); setMeetingUrl(""); setInterviewNotes(""); await load();
    }
    catch (e: any) { setError(e?.message || "Could not update application"); }
    finally { setSaving(false); }
  };

  return <main className={styles.page}>
    <header className={styles.header}>
      <Link to="/dashboard" className={styles.back}><ArrowLeft size={16}/> Dashboard</Link>
      <span className={styles.kicker}>RECRUITER WORKSPACE</span>
      <h1>Build your team on <em>HerSphere.</em></h1>
      <p>Manage your employer profile, publish opportunities and move candidates through your hiring pipeline.</p>
      <Link to="/recruiter-candidates" className={styles.candidateLink}><Search size={15}/> Discover candidates</Link>
    </header>
    <section className={styles.grid}>
      <nav className={styles.sidebar} aria-label="Recruiter workspace">
        <button onClick={() => setMode("overview")} className={mode === "overview" ? styles.active : ""}><ActivityIcon/> Overview</button>
        <button onClick={() => setMode("profile")} className={mode === "profile" ? styles.active : ""}><Building2 size={15}/> Company profile</button>
        <button onClick={() => setMode("job")} className={mode === "job" ? styles.active : ""}><Plus size={15}/> Post opportunity</button>
        <button onClick={() => setMode("apps")} className={mode === "apps" ? styles.active : ""}><Users size={15}/> Applications ({applications.length})</button>
      </nav>
      <div className={styles.content}>
        {error && <div className={styles.alert} role="alert">{error}<button onClick={() => setError("")}>Dismiss</button></div>}
        {notice && <div className={styles.notice} role="status">{notice}</div>}
        {mode === "overview" && <>
          <div className={styles.welcome}><div><span className={styles.kicker}>HIRING OVERVIEW</span><h2>{data.profile?.companyName || "Your hiring workspace"}</h2><p>{data.profile?.industry || "Complete your company profile to build trust with candidates."}</p></div><button onClick={() => void load()} disabled={loading}><RefreshCw size={14}/> Refresh</button></div>
          <div className={styles.stats}>
            {[[BriefcaseBusiness,"Published roles",jobs.length],[Users,"Total applications",counts.total],[ClipboardCheck,"Awaiting review",counts.review],[UserCheck,"Shortlisted",counts.shortlisted],[CalendarClock,"Interviews",counts.interviews],[ShieldCheck,"Selected / hired",counts.hired]].map(([Icon, name, value]: any) => <article key={name}><Icon size={18}/><small>{name}</small><b>{value}</b></article>)}
          </div>
          <section className={styles.card}><div className={styles.cardHead}><div><span className={styles.kicker}>YOUR OPENINGS</span><h2>Published opportunities</h2></div><button onClick={() => setMode("job")}><Plus size={14}/> Add role</button></div>
            {jobs.length === 0 ? <p className={styles.empty}>No opportunities published yet. Create your first job or internship to start receiving applications.</p> : jobs.map((j: any) => <article className={styles.job} key={j.id}><BriefcaseBusiness size={17}/><div><b>{j.title}</b><small>{j.location || "Location flexible"} · {j.workMode || "Work mode not set"} · {j.employmentType || "Employment type not set"}</small></div><span className={styles.pill}>{label(j.status || "active")}</span></article>)}
          </section>
          <section className={styles.card}><div className={styles.cardHead}><div><span className={styles.kicker}>LATEST ACTIVITY</span><h2>Recent applications</h2></div><button className={styles.secondary} onClick={() => setMode("apps")}>View all <ArrowLeft size={13}/></button></div>
            {applications.length === 0 ? <p className={styles.empty}>Candidate applications will appear here after students apply to your roles.</p> : applications.slice(0, 5).map((a: any) => <article className={styles.app} key={a.id}><div><b>{a.displayName || "Candidate"}</b><small>{a.title} · {a.email}</small></div><span className={styles.pill}>{label(a.status)}</span></article>)}
          </section>
        </>}
        {mode === "profile" && <section className={styles.card}><span className={styles.kicker}>EMPLOYER BRAND</span><h2>Company profile</h2><p className={styles.helper}>A complete profile helps students understand your organization before applying.</p>
          <label>Company name<input value={company || data.profile?.companyName || ""} onChange={e => setCompany(e.target.value)} placeholder="Company name"/></label>
          <label>Industry<input value={industry || data.profile?.industry || ""} onChange={e => setIndustry(e.target.value)} placeholder="e.g. Information Technology"/></label>
          <label>Website<input type="url" value={website || data.profile?.website || ""} onChange={e => setWebsite(e.target.value)} placeholder="https://company.com"/></label>
          <label>Location<input value={companyLocation || data.profile?.location || ""} onChange={e => setCompanyLocation(e.target.value)} placeholder="City, state"/></label>
          <label>About the company<textarea value={companyDescription || data.profile?.description || ""} onChange={e => setCompanyDescription(e.target.value)} placeholder="Tell candidates about your mission, team and culture."/></label>
          <button className={styles.primary} onClick={saveProfile} disabled={saving}>{saving ? "Saving…" : "Save company profile"}</button>
        </section>}
        {mode === "job" && <section className={styles.card}><span className={styles.kicker}>HIRING</span><h2>Post an opportunity</h2><p className={styles.helper}>Share clear role details so students can assess eligibility before applying.</p>
          <label>Role title *<input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Java Developer Intern"/></label>
          <label>Location<input value={location} onChange={e => setLocation(e.target.value)} placeholder="Bengaluru / Remote"/></label>
          <label>Required skills<input value={skills} onChange={e => setSkills(e.target.value)} placeholder="Java, SQL, React (comma separated)"/></label>
          <label>Role description *<textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Responsibilities, expectations and what the candidate will learn."/></label>
          <div className={styles.formGrid}>
            <label>Work mode<select value={workMode} onChange={e => setWorkMode(e.target.value)}><option>Hybrid</option><option>Remote</option><option>Onsite</option></select></label>
            <label>Employment type<select value={employmentType} onChange={e => setEmploymentType(e.target.value)}><option>Full-time</option><option>Internship</option><option>Part-time</option><option>Contract</option></select></label>
            <label>Education requirement<input value={education} onChange={e => setEducation(e.target.value)} placeholder="B.E / B.Tech"/></label>
            <label>Minimum CGPA<input value={cgpa} onChange={e => setCgpa(e.target.value)} placeholder="Optional"/></label>
            <label>Graduation years<input value={years} onChange={e => setYears(e.target.value)} placeholder="2026, 2027"/></label>
            <label>Experience requirement<input value={experience} onChange={e => setExperience(e.target.value)} placeholder="Fresher / 0–2 years"/></label>
            <label>Salary / stipend<input value={salary} onChange={e => setSalary(e.target.value)} placeholder="e.g. ₹15,000/month"/></label>
            <label>Application deadline<input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} /></label>
          </div>
          <label>Eligibility criteria<input value={eligibility} onChange={e => setEligibility(e.target.value)} placeholder="Branch, semester or other criteria"/></label>
          <label>Benefits<input value={benefits} onChange={e => setBenefits(e.target.value)} placeholder="Mentorship, certificate, flexible hours"/></label>
          <label>External application URL (optional)<input type="url" value={applicationUrl} onChange={e => setApplicationUrl(e.target.value)} placeholder="https://…"/></label>
          <button className={styles.primary} onClick={addJob} disabled={saving}>{saving ? "Publishing…" : "Publish opportunity"}</button>
        </section>}
        {mode === "apps" && <section className={styles.card}><span className={styles.kicker}>CANDIDATE PIPELINE</span><h2>Manage applications</h2><p className={styles.helper}>Review candidates and keep each application status up to date.</p>
          <div className={styles.filters}><div><Search size={15}/><input value={applicationSearch} onChange={e => setApplicationSearch(e.target.value)} placeholder="Search candidate, email or role"/></div><select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option value="all">All statuses</option>{STATUSES.map(s => <option key={s} value={s}>{label(s)}</option>)}</select></div>
          {filteredApplications.length === 0 ? <p className={styles.empty}>{applications.length ? "No applications match these filters." : "Applications will appear here when students apply to your opportunities."}</p> : filteredApplications.map((a: any) => <article className={styles.app} key={a.id}><div><b>{a.displayName || "Candidate"}</b><small>{a.email} · {a.title}</small><small>Received {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : "—"}</small></div><select aria-label={"Update status for " + a.displayName} value={a.status} onChange={e => void updateApplication(String(a.id), e.target.value)}>{STATUSES.map(s => <option key={s} value={s}>{label(s)}</option>)}</select><button className={styles.secondaryAction} onClick={() => { setInterviewApplication(interviewApplication === String(a.id) ? null : String(a.id)); setInterviewAt(""); setMeetingUrl(""); setInterviewNotes(""); }}>Schedule interview</button>{interviewApplication === String(a.id) && <div className={styles.interviewForm}><label>Interview date and time (IST)<input type="datetime-local" value={interviewAt} onChange={e => setInterviewAt(e.target.value)} min={new Date(Date.now() + 60000).toISOString().slice(0,16)}/></label><label>Format<select value={interviewMode} onChange={e => setInterviewMode(e.target.value as "online" | "in_person" | "phone")}><option value="online">Online</option><option value="in_person">In person</option><option value="phone">Phone</option></select></label>{interviewMode === "online" && <label>Meeting link<input type="url" value={meetingUrl} onChange={e => setMeetingUrl(e.target.value)} placeholder="https://…"/></label>}<label>Additional instructions (optional)<textarea value={interviewNotes} onChange={e => setInterviewNotes(e.target.value)} placeholder="Topics to prepare, documents to bring, or venue details"/></label><button className={styles.primary} disabled={saving || !interviewAt || (interviewMode === "online" && !meetingUrl.trim())} onClick={() => void updateApplication(String(a.id), "interview", true)}>Send interview invitation</button></div>}</article>)}
        </section>}
        {loading && <p className={styles.loading}>Refreshing workspace…</p>}
      </div>
    </section>
  </main>;
}

function ActivityIcon() { return <ClipboardCheck size={15}/>; }
  185
