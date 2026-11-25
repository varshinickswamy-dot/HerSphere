import { useCallback, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ArrowLeft, HeartHandshake, MessageCircle, Send, RefreshCw } from "lucide-react";
import { getCommunity } from "../endpoints/community_GET.schema";
import { postCommunity } from "../endpoints/community_POST.schema";
import { useAuth } from "../helpers/useAuth";
import styles from "./community.module.css";

type CommunityData = { posts: any[]; mentors: any[]; requests: any[] };
const EMPTY_DATA: CommunityData = { posts: [], mentors: [], requests: [] };

export default function CommunityPage() {
  const { authState } = useAuth();
  const [data, setData] = useState<CommunityData>(EMPTY_DATA);
  const [post, setPost] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const result = await getCommunity();
      setData({
        posts: Array.isArray(result.posts) ? result.posts : [],
        mentors: Array.isArray(result.mentors) ? result.mentors : [],
        requests: Array.isArray(result.requests) ? result.requests : [],
      });
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "We couldn't load the community. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authState.type === "authenticated") void load();
    else if (authState.type === "unauthenticated") setLoading(false);
  }, [authState.type, load]);

  const publish = async () => {
    const content = post.trim();
    if (!content || posting) return;
    setPosting(true);
    setActionError("");
    setSuccess("");
    try {
      await postCommunity({ action: "post", content });
      setPost("");
      setSuccess("Your post has been shared with the community.");
      await load();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Your post couldn't be published. Please try again.");
    } finally {
      setPosting(false);
    }
  };

  const connect = async (mentorId: string) => {
    if (connectingId) return;
    setConnectingId(mentorId);
    setActionError("");
    setSuccess("");
    try {
      await postCommunity({
        action: "mentor",
        mentorId,
        message: message.trim() || "I would like to connect for career guidance.",
      });
      setMessage("");
      setSuccess("Your mentorship request has been sent.");
      await load();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Your mentorship request couldn't be sent. Please try again.");
    } finally {
      setConnectingId(null);
    }
  };

  const saveEdit = async () => {
    if (!editingPostId || !editingContent.trim()) return;
    try {
      await postCommunity({ action: "editPost", postId: editingPostId, content: editingContent.trim() });
      setEditingPostId(null); setEditingContent(""); setSuccess("Your post has been updated."); await load();
    } catch (error) { setActionError(error instanceof Error ? error.message : "Your post could not be updated."); }
  };

  const cancelMentorship = async (mentorId: string) => {
    setActionError(""); setSuccess("");
    try { await postCommunity({ action: "cancelMentor", mentorId }); setSuccess("Your pending mentorship request was cancelled."); await load(); }
    catch (error) { setActionError(error instanceof Error ? error.message : "The request could not be cancelled."); }
  };

  if (authState.type === "loading") {
    return <main className={styles.page}><div className={styles.empty} role="status">Checking your secure session…</div></main>;
  }
  if (authState.type !== "authenticated") {
    return <Navigate to="/login" replace state={{ from: "/community" }} />;
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link to="/dashboard" className={styles.back}><ArrowLeft size={16} /> Dashboard</Link>
        <span className={styles.kicker}>HERSPHERE COMMUNITY</span>
        <h1>Connect, learn, <em>grow together.</em></h1>
        <p>Share career experiences, discover mentors and build meaningful professional connections.</p>
      </header>

      {actionError && <p className={styles.error} role="alert">{actionError}</p>}
      {success && <p className={styles.success} role="status">{success}</p>}

      {loading ? (
        <div className={styles.empty} role="status"><RefreshCw size={18} /> Loading community posts and mentors…</div>
      ) : loadError ? (
        <div className={styles.empty} role="alert">
          <b>Community unavailable</b>
          <span>{loadError}</span>
          <button type="button" onClick={() => void load()}>Try again</button>
        </div>
      ) : (
        <div className={styles.grid}>
          <section className={styles.feed} aria-label="Community posts">
            <div className={styles.compose}>
              <label htmlFor="community-post">Share with the community</label>
              <textarea id="community-post" value={post} onChange={(event) => setPost(event.target.value)}
                maxLength={3000} placeholder="Share a career thought, learning, opportunity or question…" />
              <div className={styles.composeFooter}>
                <small>{post.length}/3000 characters</small>
                <button type="button" onClick={() => void publish()} disabled={!post.trim() || posting}>
                  <Send size={14} /> {posting ? "Publishing…" : "Post"}
                </button>
              </div>
            </div>

            {data.posts.length === 0 ? (
              <div className={styles.empty}>No community posts yet. Start the conversation.</div>
            ) : data.posts.map((item) => (
              <article className={styles.post} key={item.id}>
                <div className={styles.avatar} aria-hidden="true">{item.displayName?.[0]?.toUpperCase() || "H"}</div>
                <div className={styles.postBody}>
                  <b>{item.displayName || "HerSphere member"}</b>
                  <small>{item.createdAt ? new Date(item.createdAt).toLocaleString() : "Community member"}</small>
                  {editingPostId === String(item.id) ? <div className={styles.compose}><label htmlFor={`edit-post-${item.id}`}>Edit your post</label><textarea id={`edit-post-${item.id}`} maxLength={3000} value={editingContent} onChange={event => setEditingContent(event.target.value)}/><div className={styles.composeFooter}><button type="button" onClick={() => {setEditingPostId(null);setEditingContent("")}}>Cancel</button><button type="button" disabled={!editingContent.trim()} onClick={() => void saveEdit()}>Save changes</button></div></div> : <p>{item.content}</p>}
                  {String(item.userId) === String(authState.user?.id) && editingPostId !== String(item.id) && <button type="button" onClick={() => {setEditingPostId(String(item.id));setEditingContent(item.content)}}>Edit post</button>}
                  <span><MessageCircle size={13} /> Discussion</span>
                </div>
              </article>
            ))}
          </section>

          <aside className={styles.side} aria-label="Mentor connections">
            <h2><HeartHandshake size={18} /> Find a mentor</h2>
            <label htmlFor="mentor-message">Message to include with your request</label>
            <input id="mentor-message" value={message} onChange={(event) => setMessage(event.target.value)}
              maxLength={1000} placeholder="Optional introduction" />
            {data.mentors.length === 0 ? (
              <p className={styles.empty}>Mentors will appear here when profiles are added.</p>
            ) : data.mentors.map((mentor) => {
              const request = data.requests.find((item) => String(item.mentorId) === String(mentor.id));
              const pending = request?.status === "pending";
              return (
                <div className={styles.mentor} key={mentor.id}>
                  <div className={styles.avatar} aria-hidden="true">M</div>
                  <div className={styles.mentorInfo}>
                    <b>{mentor.name || "HerSphere mentor"}</b>
                    <small>{mentor.roleTitle || "Career Mentor"}{mentor.company ? ` · ${mentor.company}` : ""}</small>
                    <small>{(mentor.expertise || []).slice(0, 3).join(" · ")}</small>
                    {request && <small className={styles.requestStatus}>Request: {request.status}</small>}
                  </div>
                  {pending ? <button type="button" onClick={() => void cancelMentorship(String(mentor.id))}>Cancel request</button> :
                    <button type="button" onClick={() => void connect(String(mentor.id))} disabled={connectingId !== null || request?.status === "accepted"}>
                      {connectingId === String(mentor.id) ? "Sending…" : request?.status === "accepted" ? "Accepted" : request ? "Reconnect" : "Connect"}
                    </button>}
                </div>
              );
            })}
          </aside>
        </div>
      )}
    </main>
  );
}
  191