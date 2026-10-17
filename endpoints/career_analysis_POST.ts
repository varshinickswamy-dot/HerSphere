import superjson from "superjson";
import {schema} from "./career_analysis_POST.schema";
import {db} from "../helpers/db";
import {getServerUserSession} from "../helpers/getServerUserSession";
const normalize=(x:string)=>x.toLowerCase().replace(/[^a-z0-9+#.]/g,"");
const roleMap:Record<string,string[]>={
 "full stack developer":["java","javascript","react","node.js","sql","git","html","css"],
 "software developer":["java","python","javascript","sql","git","data structures","algorithms"],
 "data analyst":["python","sql","excel","statistics","power bi","tableau"],
   10	 "machine learning engineer":["python","machine learning","statistics","numpy","pandas","scikit-learn","tensorflow"],
   11	 "frontend developer":["javascript","react","html","css","git","typescript"],
   12	 "backend developer":["java","python","node.js","sql","apis","git","databases"]
   13	};
   14	export async function handle(request:Request){
   15	 try{
   16	  const {user}=await getServerUserSession(request); const input=schema.parse(superjson.parse(await request.text()));
   17	  const p=await db.selectFrom("studentProfiles").selectAll().where("userId","=",String(user.id)).executeTakeFirst();
   18	  const role=input.targetRole.trim(); const target=roleMap[normalize(role)]??["communication","problem solving","domain fundamentals","sql","git"];
   19	  const skills=(p?.skills??[]).map(normalize); const strengths=(p?.skills??[]).filter(s=>target.some(t=>normalize(t)===normalize(s)));
   20	  const gaps=target.filter(s=>!skills.includes(normalize(s))); const score=Math.min(100,Math.max(0,Math.round((strengths.length/Math.max(target.length,1))*100)));
   21	  const summary="Your "+role+" profile currently matches "+strengths.length+" of "+target.length+" core skills. Focus next on "+(gaps.slice(0,3).join(", ")||"building projects and interview readiness")+".";
   22	  const milestones=gaps.slice(0,5).map((skill,i)=>({step:i+1,title:"Build "+skill+" capability",skill,status:i===0?"current":"upcoming",description:"Learn "+skill+", complete a small practical project, and add evidence to your portfolio."}));
   23	  const assessment=await db.insertInto("skillAssessments").values({userId:String(user.id),targetRole:role,strengths,recommendedSkills:gaps,skillGaps:gaps,readinessScore:score,summary}).onConflict(oc=>oc.column("userId").doUpdateSet({targetRole:role,strengths,recommendedSkills:gaps,skillGaps:gaps,readinessScore:score,summary,updatedAt:new Date()})).returningAll().executeTakeFirstOrThrow();
   24	  const roadmap=await db.insertInto("careerRoadmaps").values({userId:String(user.id),targetRole:role,summary:"A practical roadmap for "+role+" based on your current profile.",milestones}).onConflict(oc=>oc.column("userId").doUpdateSet({targetRole:role,summary:"A practical roadmap for "+role+" based on your current profile.",milestones,updatedAt:new Date()})).returningAll().executeTakeFirstOrThrow();
   25	  return new Response(superjson.stringify({assessment,roadmap}),{headers:{"Content-Type":"application/json"}});
   26	 }catch{ return new Response(superjson.stringify({error:"Career analysis failed"}),{status:400,headers:{"Content-Type":"application/json"}})}
   27	}