import superjson from "superjson";
import {db} from "../helpers/db";
import {getServerUserSession} from "../helpers/getServerUserSession";import {NotAuthenticatedError} from "../helpers/getSetServerSession";
export async function handle(request:Request){
 try{
  const {user}=await getServerUserSession(request); const uid=String(user.id);
  const rows=await db.selectFrom("savedOpportunities as s")
   .leftJoin("jobs as j","j.id","s.jobId")
   .leftJoin("internships as i","i.id","s.internshipId")
   .leftJoin("recruiterJobs as rj","rj.id","s.recruiterJobId")
   .leftJoin("companyProfiles as c","c.id","rj.companyId")
   .select([
    "s.id","s.createdAt","s.jobId","s.internshipId","s.recruiterJobId",
    "j.title as jobTitle","j.description as jobDescription","j.location as jobLocation","j.companyName as jobCompany",
    "i.role as internshipRole","i.location as internshipLocation","i.companyName as internshipCompany",
    "rj.title as recruiterTitle","rj.description as recruiterDescription","rj.location as recruiterLocation",
    "rj.applicationUrl","c.companyName as profileCompany"
   ]).where("s.userId","=",uid).orderBy("s.createdAt","desc").execute();
  const opportunities=rows.map(x=>({...x,type:x.jobId?"job":x.internshipId?"internship":"recruiterJob",title:x.jobTitle||x.internshipRole||x.recruiterTitle,description:x.jobDescription||x.recruiterDescription||null,location:x.jobLocation||x.internshipLocation||x.recruiterLocation,companyName:x.jobCompany||x.internshipCompany||x.profileCompany}));
  return new Response(superjson.stringify({opportunities}),{headers:{"Content-Type":"application/json"}});
 }catch(e){const unauthorized=e instanceof NotAuthenticatedError;return new Response(superjson.stringify({error:unauthorized?"Not authenticated":"Could not load saved opportunities"}),{status:unauthorized?401:400,headers:{"Content-Type":"application/json"}})}
}