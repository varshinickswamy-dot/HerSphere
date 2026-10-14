import {useCallback,useEffect,useState} from "react";
import {Link,Navigate} from "react-router-dom";
import {ArrowLeft,Search,ExternalLink,BookOpen} from "lucide-react";
import superjson from "superjson";
import {useAuth} from "../helpers/useAuth";
import styles from "./learning.module.css";
export default function Learning(){
 const {authState}=useAuth();
 const [items,setItems]=useState<any[]>([]),[query,setQuery]=useState(""),[loading,setLoading]=useState(false),[error,setError]=useState("");
   10	 const load=useCallback(async()=>{setLoading(true);setError("");try{const r=await fetch("/_api/learning",{credentials:"include"});if(!r.ok)throw new Error(r.status===401?"Your session may have expired. Sign in again to view learning resources.":"We couldn't load learning resources. Please try again.");const t=await r.text();setItems(superjson.parse<{resources:any[]}>(t).resources||[])}catch(e){setError(e instanceof Error?e.message:"We couldn't load learning resources. Please try again.")}finally{setLoading(false)}},[]);
   11	 useEffect(()=>{if(authState.type==="authenticated")void load()},[authState.type,load]);
   12	 if(authState.type==="loading")return <main className={styles.page}><div className={styles.empty} role="status">Checking your session…</div></main>;
   13	 if(authState.type!=="authenticated")return <Navigate to="/login" replace state={{from:"/learning"}}/>;
   14	 const filtered=items.filter(x=>JSON.stringify(x).toLowerCase().includes(query.toLowerCase()));
   15	 return <main className={styles.page}><header><Link to="/dashboard" className={styles.back}><ArrowLeft size={16}/> Dashboard</Link><span className={styles.kicker}>LEARNING HUB</span><h1>Build the skills your next role needs.</h1><p>Learning resources available in the HerSphere database.</p></header><div className={styles.search}><Search size={15}/><input aria-label="Search learning resources" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search skills or courses"/></div>{loading?<div className={styles.empty} role="status">Loading resources…</div>:error?<div className={styles.error} role="alert"><b>Learning resources unavailable</b><span>{error}</span><button onClick={()=>void load()}>Try again</button></div>:filtered.length?<section className={styles.grid}>{filtered.map((x:any)=><article className={styles.card} key={x.id}><BookOpen size={18}/><div className={styles.body}><span>{x.provider||x.resourceType||"LEARNING RESOURCE"}</span><h2>{x.title||x.name}</h2><p>{x.description||"Learning resource matched to your career goals."}</p><small>{[x.level,(x.skills||[]).join(" · ")].filter(Boolean).join(" · ")}</small>{x.resourceUrl&&<a href={x.resourceUrl} target="_blank" rel="noreferrer">Open resource <ExternalLink size={13}/></a>}</div></article>)}</section>:<div className={styles.empty}><b>No learning resources available yet.</b><span>Resources will appear here when added to the platform.</span></div>}</main>
   16	}