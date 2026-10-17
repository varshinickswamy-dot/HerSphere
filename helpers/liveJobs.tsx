type LiveJob={
 id:string;title:string;companyName:string|null;description:string;location:string|null;workMode:string;
 employmentType:string;salaryRange:string|null;skills:string[];createdAt:string|null;expiresAt:string|null;
 applicationUrl:string;website:string|null;source:"Adzuna"|"Jooble"|"JSearch"|"Himalayas"|"RemoteJobs.org"|"Arbeitnow";
 sourceUrl:string;lastUpdatedAt:string;
};
const cache:{at:number;jobs:LiveJob[]}={at:0,jobs:[]};
const clean=(v:unknown)=>String(v??"").replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim();
const dateValue=(v:unknown):string|null=>{
   10	 if(v===null||v===undefined||v==="")return null;
   11	 let d:Date;
   12	 if(typeof v==="number"||/^\d{10,13}$/.test(String(v))){const n=Number(v);d=new Date(n<1e12?n*1000:n)}
   13	 else d=new Date(String(v));
   14	 return Number.isNaN(d.getTime())?null:d.toISOString();
   15	};
   16	const salary=(min:unknown,max:unknown,currency:string|null|undefined)=>min==null&&max==null?null:[min,max].filter(x=>x!=null).join(" - ")+(currency?" "+currency:"");
   17	const skillsFrom=(text:string)=>["Java","Python","JavaScript","TypeScript","React","Node.js","SQL","PostgreSQL","AWS","Azure","Docker","Kubernetes","Git","REST API","HTML","CSS","Excel","Power BI","Machine Learning","TensorFlow","Communication","Project Management"].filter(s=>new RegExp("\\b"+s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"\\b","i").test(text)).slice(0,12);
   18	function isStale(posted:string|null,expires:string|null,now:number){
   19	 if(expires&&new Date(expires).getTime()<now)return true;
   20	 // Old listings are hidden conservatively; missing dates are never replaced with today's date.
   21	 if(posted&&new Date(posted).getTime()<now-90*24*60*60*1000)return true;
   22	 return false;
   23	}
   24	function normalizeJob(j:Omit<LiveJob,"lastUpdatedAt">,now:number):LiveJob|null{
   25	 if(!j.title?.trim()||!j.applicationUrl||!/^https?:\/\//i.test(j.applicationUrl))return null;
   26	 if(isStale(j.createdAt,j.expiresAt,now))return null;
   27	 return {...j,title:clean(j.title),companyName:j.companyName?clean(j.companyName):null,description:clean(j.description),location:j.location?clean(j.location):null,lastUpdatedAt:new Date(now).toISOString()};
   28	}
   29	export async function getLiveJobs():Promise<LiveJob[]>{
   30	 const now=Date.now();
   31	 if(cache.at&&now-cache.at<300000)return cache.jobs;
   32	 const jobs:LiveJob[]=[];
   33	 const role=(process.env as Record<string,string|undefined>).DEFAULT_JOB_SEARCH_QUERY||"software developer";
   34	 const location="India";
   35	 const add=(j:Omit<LiveJob,"lastUpdatedAt">)=>{const item=normalizeJob(j,now);if(item)jobs.push(item)};
   36	 const tasks:Promise<void>[]=[];
   37	 const adzunaId=(process.env as Record<string,string|undefined>).ADZUNA_APP_ID;
   38	 const adzunaKey=(process.env as Record<string,string|undefined>).ADZUNA_APP_KEY;
   39	 if(adzunaId&&adzunaKey)tasks.push((async()=>{try{
   40	  const u=new URL("https://api.adzuna.com/v1/api/jobs/in/search/1");u.searchParams.set("app_id",adzunaId);u.searchParams.set("app_key",adzunaKey);u.searchParams.set("results_per_page","30");u.searchParams.set("what",role);u.searchParams.set("where",location);u.searchParams.set("content-type","application/json");
   41	  const r=await fetch(u.toString(),{signal:AbortSignal.timeout(8000)});if(!r.ok)return;const d:any=await r.json();
   42	  for(const x of d.results??[]){const description=clean(x.description);add({id:"adzuna-"+String(x.id),title:x.title,companyName:x.company?.display_name??null,description,location:x.location?.display_name??null,workMode:/remote/i.test(description)?"remote":"onsite",employmentType:x.contract_time??"Not specified",salaryRange:salary(x.salary_min,x.salary_max,x.salary_is_predicted?"estimated INR":"INR"),skills:skillsFrom(description),createdAt:dateValue(x.created),expiresAt:dateValue(x.expiration_date),applicationUrl:x.redirect_url,website:null,source:"Adzuna",sourceUrl:x.redirect_url});}
   43	 }catch{}})());
   44	 const joobleKey=(process.env as Record<string,string|undefined>).JOOBLE_API_KEY;
   45	 if(joobleKey)tasks.push((async()=>{try{
   46	  const r=await fetch("https://jooble.org/api/"+encodeURIComponent(joobleKey),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({keywords:role,location,page:1,ResultOnPage:25}),signal:AbortSignal.timeout(8000)});if(!r.ok)return;const d:any=await r.json();
   47	  for(const x of d.jobs??[]){const description=clean(x.snippet??x.description);add({id:"jooble-"+String(x.id??x.link),title:x.title,companyName:x.company??null,description,location:x.location??null,workMode:/remote/i.test((x.location??"")+" "+description)?"remote":"onsite",employmentType:x.type??"Not specified",salaryRange:x.salary??null,skills:skillsFrom(description),createdAt:dateValue(x.updated??x.created),expiresAt:dateValue(x.expirationDate),applicationUrl:x.link,website:null,source:"Jooble",sourceUrl:x.link});}
   48	 }catch{}})());
   49	 const rapidKey=(process.env as Record<string,string|undefined>).RAPIDAPI_KEY;
   50	 if(rapidKey)tasks.push((async()=>{try{
   51	  const u=new URL("https://jsearch.p.rapidapi.com/search");u.searchParams.set("query",role+" in India");u.searchParams.set("page","1");u.searchParams.set("num_pages","1");u.searchParams.set("country","in");u.searchParams.set("date_posted","month");
   52	  const r=await fetch(u.toString(),{headers:{"X-RapidAPI-Key":rapidKey,"X-RapidAPI-Host":"jsearch.p.rapidapi.com"},signal:AbortSignal.timeout(8000)});if(!r.ok)return;const d:any=await r.json();
   53	  for(const x of d.data??[]){const description=clean(x.job_description);add({id:"jsearch-"+String(x.job_id),title:x.job_title,companyName:x.employer_name??null,description,location:[x.job_city,x.job_state,x.job_country].filter(Boolean).join(", ")||null,workMode:x.job_is_remote?"remote":"onsite",employmentType:x.job_employment_type??"Not specified",salaryRange:salary(x.job_min_salary,x.job_max_salary,x.job_salary_currency),skills:Array.isArray(x.job_required_skills)?x.job_required_skills:skillsFrom(description),createdAt:dateValue(x.job_posted_at_datetime_utc),expiresAt:dateValue(x.job_expiration_timestamp),applicationUrl:x.job_apply_link,website:x.employer_website??null,source:"JSearch",sourceUrl:x.job_apply_link});}
   54	 }catch{}})());
   55	 // Keep the existing public feeds as optional discovery sources; only display verifiable jobs with real apply links.
   56	 tasks.push((async()=>{try{const r=await fetch("https://himalayas.app/jobs/api?limit=20&offset=0",{signal:AbortSignal.timeout(8000)});if(!r.ok)return;const d:any=await r.json();for(const x of d.jobs??[]){const link=x.applicationLink??x.guid;if(!link)continue;const description=clean(x.excerpt??x.description);add({id:"himalayas-"+String(x.id??x.guid??link),title:x.title,companyName:x.companyName??null,description,location:(x.locationRestrictions??[]).join(", ")||"Remote",workMode:"remote",employmentType:x.employmentType??"Not specified",salaryRange:salary(x.minSalary,x.maxSalary,x.currency),skills:skillsFrom(description),createdAt:dateValue(x.pubDate),expiresAt:null,applicationUrl:link,website:x.companyWebsite??null,source:"Himalayas",sourceUrl:link})}}catch{}})());
   57	 tasks.push((async()=>{try{const r=await fetch("https://remotejobs.org/api/v1/jobs?limit=20&offset=0",{signal:AbortSignal.timeout(8000)});if(!r.ok)return;const d:any=await r.json();for(const x of d.data??[]){const link=x.apply_url??x.url;if(!link)continue;const description=clean(x.description);add({id:"remotejobs-"+String(x.id),title:x.title,companyName:x.company?.name??null,description,location:x.location??"Remote",workMode:"remote",employmentType:x.type??"Not specified",salaryRange:x.salary_text??null,skills:skillsFrom(description),createdAt:dateValue(x.posted_at),expiresAt:null,applicationUrl:link,website:x.company?.website??null,source:"RemoteJobs.org",sourceUrl:x.url??link})}}catch{}})());
   58	 tasks.push((async()=>{try{const r=await fetch("https://www.arbeitnow.com/api/job-board-api",{signal:AbortSignal.timeout(8000)});if(!r.ok)return;const d:any=await r.json();for(const x of (d.data??[]).slice(0,30)){const link=x.url;if(!link)continue;const description=clean(x.description);add({id:"arbeitnow-"+String(x.slug??link),title:x.title,companyName:x.company_name??null,description,location:x.location??null,workMode:x.remote?"remote":"onsite",employmentType:x.job_types?.join(", ")??"Not specified",salaryRange:null,skills:(x.tags??[]).slice(0,12),createdAt:dateValue(x.created_at),expiresAt:null,applicationUrl:link,website:null,source:"Arbeitnow",sourceUrl:link})}}catch{}})());
   59	 await Promise.all(tasks);
   60	 cache.jobs=Array.from(new Map(jobs.map(j=>[j.applicationUrl,j])).values()).sort((a,b)=>(b.createdAt?new Date(b.createdAt).getTime():0)-(a.createdAt?new Date(a.createdAt).getTime():0));
   61	 cache.at=now;
   62	 return cache.jobs;
   63	}
   64	export function getLiveJobsLastUpdated():string|null{return cache.at?new Date(cache.at).toISOString():null}