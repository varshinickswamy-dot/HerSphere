import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Mail, MapPin, Bookmark, BookmarkCheck, GraduationCap, BriefcaseBusiness, ExternalLink, Github, Linkedin, Globe, Save } from "lucide-react";
import { getRecruiterCandidate } from "../endpoints/recruiter_candidate_GET.schema";
import { postRecruiter } from "../endpoints/recruiter_POST.schema";
import { saveRecruiterCandidate } from "../endpoints/recruiter_candidates_POST.schema";
import styles from "./recruiter-candidate.$candidateId.module.css";

const asList = (value: any): any[] => Array.isArray(value) ? value : value && typeof value === "object" ? Object.values(value) : [];
const textValue = (value: any) => typeof value === "string" || typeof value === "number" ? String(value) : "";
const statusOptions = ["received", "reviewing", "shortlisted", "interview", "offer", "selected", "hired", "rejected"];

export default function CandidateDetail() {
  const { candidateId } = useParams();
  const [data, setData] = useState<any>(null);
  const [selectedApplication, setSelectedApplication] = useState("");
  const [status, setStatus] = useState("shortlisted");
  const [notes, setNotes] = useState("");
  const [savedNote, setSavedNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = async () => {
    if (!candidateId) return;
    setLoading(true); setError("");
    try {
      const result = await getRecruiterCandidate(candidateId);
      setData(result);
      setSavedNote(result.savedCandidate?.note || "");
      const first = result.applications?.[0];
      setSelectedApplication(first ? String(first.id) : "");
      setStatus(first?.status || "shortlisted");
      setNotes(first?.notes || "");
    } catch (e: any) { setError(e?.message || "Could not load candidate profile."); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, [candidateId]);

  const applications = data?.applications || [];
  const currentApplication = applications.find((a: any) => String(a.id) === selectedApplication);
  const selectApplication = (id: string) => {
    setSelectedApplication(id);
    const application = applications.find((a: any) => String(a.id) === id);
    setStatus(application?.status || "shortlisted");
    setNotes(application?.notes || "");
  };
  const updatePipeline = async () => {
    if (!currentApplication) return;
    setSaving(true); setError(""); setNotice("");
    try {
      await postRecruiter({ action: "status", applicationId: String(currentApplication.id), status, notes });
      setNotice("Application pipeline and private recruiter notes updated.");
      await load();
    } catch (e: any) { setError(e?.message || "Could not save pipeline update."); }
    finally { setSaving(false); }
  };
  const toggleSaved = async () => {
    if (!data?.candidate) return;
    setSaving(true); setError(""); setNotice("");
    try {
      await saveRecruiterCandidate({ action: data.savedCandidate ? "remove" : "save", candidateUserId: String(data.candidate.id), note: savedNote });
      setNotice(data.savedCandidate ? "Candidate removed from saved list." : "Candidate added to your saved list.");
      await load();
    } catch (e: any) { setError(e?.message || "Could not update saved candidate."); }
    finally { setSaving(false); }
  };
  const saveNoteOnly = async () => {
    if (!data?.savedCandidate) return;
    setSaving(true);
    try {
      await saveRecruiterCandidate({ action: "save", candidateUserId: String(data.candidate.id), note: savedNote });
      setNotice("Saved candidate note updated."); await load();
    } catch (e: any) { setError(e?.message || "Could not update note."); }
    finally { setSaving(false); }
  };

  if (loading) return <main className={styles.page}><p className={styles.state}>Loading candidate profile…</p></main>;
  if (error && !data) return <main className={styles.page}><Link to="/recruiter-candidates" className={styles.back}><ArrowLeft size={15}/> Candidate search</Link><div className={styles.state}><h2>Unable to load profile</h2><p>{error}</p><button onClick={() => void load()}>Try again</button></div></main>;
  if (!data) return null;

  const { candidate, profile, resume } = data;
  const links = resume?.links && typeof resume.links === "object" ? resume.links : {};
  const experience = asList(resume?.experience);
  const projects = asList(resume?.projects);
  const education = asList(resume?.education);
  const certifications = asList(resume?.certifications);

  return <main className={styles.page}>
    <Link to="/recruiter-candidates" className={styles.back}><ArrowLeft size={15}/> Back to candidate search</Link>
    <header className={styles.hero}>
      <div className={styles.person}>{candidate.avatarUrl ? <img src={candidate.avatarUrl} alt=""/> : <span>{(candidate.displayName || "C").slice(0,1).toUpperCase()}</span>}
        <div><span className={styles.kicker}>CANDIDATE PROFILE</span><h1>{candidate.displayName}</h1><p>{profile.preferredRole || profile.careerGoal || "Career goal not set"}</p>{candidate.email && <small><Mail size={13}/>{candidate.email}</small>}</div>
      </div>
      <div className={styles.heroActions}><button className={styles.saveButton} onClick={() => void toggleSaved()} disabled={saving}>{data.savedCandidate ? <BookmarkCheck size={15}/> : <Bookmark size={15}/>} {data.savedCandidate ? "Saved candidate" : "Save candidate"}</button>{candidate.email && <a className={styles.contact} href={"mailto:" + candidate.email}><Mail size={14}/> Contact candidate</a>}</div>
    </header>
    {error && <div className={styles.alert}>{error}</div>}{notice && <div className={styles.notice}>{notice}</div>}
    <div className={styles.grid}>
      <section className={styles.mainColumn}>
        <article className={styles.card}><div className={styles.sectionTitle}><h2>Career profile</h2><span className={styles.completion}>{profile.profileCompletion || 0}% complete</span></div>
          <div className={styles.meta}><span><MapPin size={14}/>{profile.location || profile.preferredLocation || "Location not specified"}</span><span><GraduationCap size={14}/>{profile.degree || "Degree not specified"}{profile.branch ? " · " + profile.branch : ""}</span><span>{profile.college || "College not specified"}</span><span>Graduation {profile.graduationYear || "year not added"}</span>{profile.cgpa !== null && profile.cgpa !== undefined && <span>CGPA {profile.cgpa}</span>}</div>
          <h3>Career objective</h3><p>{profile.careerGoal || "The candidate has not added a career objective yet."}</p>
          <h3>Preferred role & location</h3><p>{profile.preferredRole || "Not specified"} · {profile.preferredLocation || "Flexible"}</p>
          <h3>Skills</h3><div className={styles.chips}>{(profile.skills || []).map((s: string)=><em key={s}>{s}</em>)}</div>
          {profile.interests?.length > 0 && <><h3>Interests</h3><div className={styles.chips}>{profile.interests.map((s: string)=><em key={s}>{s}</em>)}</div></>}
          {profile.languages?.length > 0 && <><h3>Languages</h3><p>{profile.languages.join(", ")}</p></>}
        </article>
        <article className={styles.card}><h2>Resume & experience</h2>{!resume ? <p className={styles.muted}>{data.hasAppliedToCompany ? "No resume has been added by this candidate yet." : "Resume and contact details are shared with your company after the candidate applies to one of your opportunities."}</p> : <>
          <h3>{resume.headline || resume.title || "Professional summary"}</h3><p>{resume.summary || "No professional summary provided."}</p>
          <h3>Work experience</h3>{experience.length ? experience.map((item: any, index: number)=><div className={styles.timeline} key={index}><b>{item.role || item.title || item.position || "Experience"}</b><small>{item.company || item.organization || ""} {item.duration || item.period ? "· " + (item.duration || item.period) : ""}</small><p>{item.description || item.summary || ""}</p></div>) : <p className={styles.muted}>No experience details added.</p>}
          <h3>Projects</h3>{projects.length ? projects.map((item: any,index: number)=><div className={styles.timeline} key={index}><b>{item.name || item.title || "Project"}</b><p>{item.description || item.summary || ""}</p>{item.technologies && <small>Technologies: {Array.isArray(item.technologies) ? item.technologies.join(", ") : item.technologies}</small>}</div>) : <p className={styles.muted}>No projects added.</p>}
          <h3>Education</h3>{education.length ? education.map((item: any,index: number)=><div className={styles.timeline} key={index}><b>{item.degree || item.qualification || "Education"}</b><small>{item.institution || item.college || ""} {item.year ? "· " + item.year : ""}</small></div>) : <p className={styles.muted}>Education details are available in the career profile above.</p>}
          {certifications.length > 0 && <><h3>Certifications</h3><div className={styles.chips}>{certifications.map((item: any,index: number)=><em key={index}>{textValue(item) || item.name || item.title || "Certification"}</em>)}</div></>}
          <div className={styles.links}>{links.linkedin && <a href={links.linkedin} target="_blank" rel="noreferrer"><Linkedin size={14}/> LinkedIn <ExternalLink size={12}/></a>}{links.github && <a href={links.github} target="_blank" rel="noreferrer"><Github size={14}/> GitHub <ExternalLink size={12}/></a>}{links.portfolio && <a href={links.portfolio} target="_blank" rel="noreferrer"><Globe size={14}/> Portfolio <ExternalLink size={12}/></a>}</div>
        </>}</article>
      </section>
      <aside className={styles.sideColumn}>
        <article className={styles.card}><h2>Saved candidate notes</h2>{data.savedCandidate ? <><p className={styles.muted}>Private notes visible only to your recruiter account.</p><textarea value={savedNote} onChange={e => setSavedNote(e.target.value)} placeholder="Add follow-up context, strengths or reminders…"/><button className={styles.primary} onClick={() => void saveNoteOnly()} disabled={saving}><Save size={14}/> Save note</button></> : <><p className={styles.muted}>Save this candidate to keep private follow-up notes.</p><button className={styles.primary} onClick={() => void toggleSaved()} disabled={saving}><Bookmark size={14}/> Save candidate</button></>}</article>
        <article className={styles.card}><h2>Application pipeline</h2>{applications.length === 0 ? <p className={styles.muted}>This candidate has not applied to any of your company's opportunities.</p> : <>
          <label className={styles.fieldLabel}>Application<select value={selectedApplication} onChange={e => selectApplication(e.target.value)}>{applications.map((a: any)=><option key={a.id} value={String(a.id)}>{a.title}</option>)}</select></label>
          <p className={styles.applied}>Applied {currentApplication?.createdAt ? new Date(currentApplication.createdAt).toLocaleDateString() : ""}</p>
          <label className={styles.fieldLabel}>Hiring status<select value={status} onChange={e => setStatus(e.target.value)}>{statusOptions.map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}</select></label>
          <label className={styles.fieldLabel}>Private application notes<textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Interview feedback and next steps…"/></label>
          <button className={styles.primary} onClick={() => void updatePipeline()} disabled={saving}><Save size={14}/> Save pipeline update</button>
        </>}</article>
      </aside>
    </div>
  </main>;
}
