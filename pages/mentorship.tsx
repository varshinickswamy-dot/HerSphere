import {useCallback,useEffect,useState} from "react";
import {Link,Navigate} from "react-router-dom";
import {ArrowLeft,Search,Users} from "lucide-react";
import superjson from "superjson";
import {useAuth} from "../helpers/useAuth";
import styles from "./mentorship.module.css";
export default function Mentorship(){
 const {authState}=useAuth();
 const [items,setItems]=useState<any[]>([]),[query,setQuery]=useState(""),[loading,setLoading]=useState(false),[error,setError]=useState("");
   10	 const load=useCallback(async()=>{setLoading(true);setError("");try{const r=await fetch("/_api/mentorship",{credentials:"include"});if(!r.ok)throw new Error(r.status===401?"Your session may have expired. Sign in again to view mentors.":"We couldn't load mentor profiles. Please try again.");const t=await r.text();setItems(superjson.parse<{mentors:any[]}>(t).mentors||[])}catch(e){setError(e instanceof Error?e.message:"We couldn't load mentor profiles. Please try again.")}finally{setLoading(false)}},[]);
   11	 useEffect(()=>{if(authState.type==="authenticated")void load()},[authState.type,load]);
   12	 if(authState.type==="loading")return <main className={styles.page}><div className={styles.empty} role="status">Checking your session…</div></main>;
   13	 if(authState.type!=="authenticated")return <Navigate to="/login" replace state={{from:"/mentorship"}}/>;
   14	 const filtered=items.filter(x=>JSON.stringify(x).toLowerCase().includes(query.toLowerCase()));
   15	 return <main className={styles.page}><header><Link to="/dashboard" className={styles.back}><ArrowLeft size={16}/> Dashboard</Link><span className={styles.kicker}>MENTORSHIP</span><h1>Find a mentor for the next chapter.</h1><p>Discover available mentors and their areas of expertise.</p></header><div className={styles.search}><Search size={15}/><input aria-label="Search mentors" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search expertise, role or company"/></div>{loading?<div className={styles.empty} role="status">Loading mentors…</div>:error?<div className={styles.error} role="alert"><b>Mentor profiles unavailable</b><span>{error}</span><button onClick={()=>void load()}>Try again</button></div>:filtered.length?<section className={styles.grid}>{filtered.map((x:any)=><article className={styles.card} key={x.id}><Users size={18}/><div className={styles.body}><span>{x.roleTitle||"MENTOR"}</span><h2>{x.name||x.displayName||"HerSphere mentor"}</h2><p>{x.bio||"Available to support your career growth."}</p><small>{[x.company,x.location,(x.expertise||[]).join(" · ")].filter(Boolean).join(" · ")}</small></div></article>)}</section>:<div className={styles.empty}><b>No available mentors yet.</b><span>Mentor profiles will appear here when added to HerSphere.</span></div>}</main>
   16	}