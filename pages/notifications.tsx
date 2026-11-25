import { useCallback, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ArrowLeft, Bell, CheckCheck, ChevronRight, Sparkles } from "lucide-react";
import { getNotifications } from "../endpoints/notifications_GET.schema";
import { updateNotifications } from "../endpoints/notifications_POST.schema";
import styles from "./notifications.module.css";
import { useAuth } from "../helpers/useAuth";
import { useRealtimeChannel, useRealtimeReconnect } from "../components/FlootRealtimeProvider";
import { channels } from "../helpers/realtimeChannels";
type NotificationItem = { id: string | number; title: string; message: string; createdAt: string | Date; isRead: boolean; link?: string | null };
export default function NotificationsPage() {
  const { authState } = useAuth();
  const uid = authState.type === "authenticated" ? authState.user.id : null;
  const [data, setData] = useState<{ notifications: NotificationItem[]; unread: number }>({ notifications: [], unread: 0 });
  const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [updating, setUpdating] = useState(false);
  const load = useCallback(async () => { if (!uid) return; setLoading(true); setError(""); try { setData(await getNotifications()); } catch (e) { setError(e instanceof Error ? e.message : "Could not load notifications."); } finally { setLoading(false); } }, [uid]);
  useEffect(() => { if (authState.type === "authenticated") void load(); else if (authState.type === "unauthenticated") setLoading(false); }, [authState.type, load]);
  useRealtimeChannel(uid ? channels.user(String(uid)) : null, () => void load()); useRealtimeReconnect(() => void load());
  const update = async (action: "read" | "readAll", id?: string) => { if (updating) return; setUpdating(true); setError(""); try { await updateNotifications(action === "read" && id ? { action, id } : { action: "readAll" }); await load(); } catch (e) { setError(e instanceof Error ? e.message : "Could not update notifications."); } finally { setUpdating(false); } };
  if (authState.type === "loading") return <main className={styles.page}><div className={styles.empty} role="status">Checking your session…</div></main>;
  if (authState.type !== "authenticated") return <Navigate to="/login" replace state={{ from: "/notifications" }} />;
  return <main className={styles.page}><header><Link to="/dashboard" className={styles.back}><ArrowLeft size={16}/> Dashboard</Link><span className={styles.kicker}><Sparkles size={12}/> SMART ALERTS</span><h1>Stay on top of your <em>career.</em></h1><p>Application updates, opportunity alerts, deadlines and mentorship activity appear here.</p></header>
    <section className={styles.panel}><div className={styles.toolbar}><div><Bell size={18}/><b>{data.unread} unread</b></div>{data.unread > 0 && <button disabled={updating} onClick={() => void update("readAll")}><CheckCheck size={14}/> {updating ? "Updating…" : "Mark all read"}</button>}</div>
      {error && <p role="alert" className={styles.empty}>{error} <button onClick={() => void load()}>Try again</button></p>}
      {loading ? <div className={styles.empty} role="status">Loading notifications…</div> : data.notifications.length === 0 ? <div className={styles.empty}><Bell size={28}/><p>No notifications yet.</p><small>HerSphere will surface important career updates here.</small></div> : data.notifications.map(n => <article className={n.isRead ? styles.item : styles.unread} key={n.id}><div className={styles.icon}><Bell size={15}/></div><div className={styles.body}><b>{n.title}</b><p>{n.message}</p><small>{new Date(n.createdAt).toLocaleString()}</small></div>{!n.isRead && <button className={styles.open} disabled={updating} aria-label="Mark notification as read" onClick={() => void update("read", String(n.id))}><ChevronRight size={15}/></button>}{n.link && <Link to={n.link} className={styles.link}>Open</Link>}</article>)}
    </section></main>;
}