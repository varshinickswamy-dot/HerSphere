import {useEffect,useState} from "react";
import {Link,Navigate} from "react-router-dom";
import {ArrowLeft,CalendarDays,MapPin,Video} from "lucide-react";
import {getEvents} from "../endpoints/events_GET.schema";
import {registerEvent} from "../endpoints/events_POST.schema";import {useAuth} from "../helpers/useAuth";import {useRealtimeChannel,useRealtimeReconnect} from "../components/FlootRealtimeProvider";import {channels} from "../helpers/realtimeChannels";
import styles from "./events.module.css";

export default function Events(){const {authState}=useAuth();const uid=authState.type==="authenticated"?authState.user.id:null;
 const [d,setD]=useState<any>({events:[],registeredIds:[]}),[loading,setLoading]=useState(true),[error,setError]=useState(""),[actionError,setActionError]=useState("");
   10	 const load=async()=>{setLoading(true);setError("");try{setD(await getEvents())}catch(e){setError(e instanceof Error?e.message:"Could not load events. Please try again.")}finally{setLoading(false)}};
   11	 useEffect(()=>{if(authState.type==="authenticated")void load();else if(authState.type==="unauthenticated")setLoading(false)},[authState.type]);useRealtimeChannel(uid?channels.user(String(uid)):null,()=>void load());useRealtimeReconnect(()=>void load());
   12	 const toggle=async(id:string)=>{setActionError("");try{await registerEvent({eventId:id});await load()}catch(e){setActionError(e instanceof Error?e.message:"Could not update event registration. Please try again.")}};
   13	 if(authState.type==="loading")return <main className={styles.page}><p role="status">Checking your session…</p></main>;
   14	 if(authState.type!=="authenticated")return <Navigate to="/login" replace state={{from:"/events"}}/>;
   15	 return <main className={styles.page}>
   16	  <Link to="/dashboard" className={styles.back}><ArrowLeft size={16}/> Dashboard</Link>
   17	  <header><span><CalendarDays size={15}/> HERSPHERE EVENTS</span><h1>Learn, connect, move forward.</h1><p>Career webinars, networking sessions, mentorship events and practical workshops.</p></header>
   18	  {loading?<div className={styles.empty} role="status">Loading upcoming events…</div>:error?<div className={styles.empty} role="alert"><b>Events unavailable</b><p>{error}</p><button onClick={()=>void load()}>Try again</button></div>:d.events.length===0?<div className={styles.empty}>No upcoming events yet. New HerSphere events will appear here.</div>:
   19	   <div className={styles.list}>{d.events.map((e:any)=><article key={e.id}>
   20	    <div className={styles.date}>{new Date(e.startsAt).toLocaleDateString(undefined,{day:"2-digit",month:"short"})}</div>
   21	    <div className={styles.info}><small>{e.eventType.toUpperCase()}</small><h2>{e.title}</h2><p>{e.description}</p>
   22	     <div className={styles.meta}>{e.hostName&&<span>Hosted by {e.hostName}</span>}{e.location&&<span><MapPin size={13}/>{e.location}</span>}{e.meetingUrl&&<span><Video size={13}/>Online</span>}<span>{new Date(e.startsAt).toLocaleString()}</span></div>
   23	    </div>
   24	    <button onClick={()=>toggle(String(e.id))}>{d.registeredIds.includes(String(e.id))?"Registered · Cancel":"Register"}</button>
   25	   </article>)}</div>}
   26	  {actionError&&<p role="alert" className={styles.actionError}>{actionError}</p>}
   27	 </main>
   28	}