import superjson from "superjson";
import { db } from "../helpers/db";
import { getServerUserSession } from "../helpers/getServerUserSession";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const uid = String(user.id);
    const profile = await db.selectFrom("studentProfiles").selectAll().where("userId","=",uid).executeTakeFirst();
   10	    const applications = await db.selectFrom("applications").selectAll().where("userId","=",uid).execute();
   11	    const recruiterApplications = await db.selectFrom("recruiterApplications").selectAll().where("studentUserId","=",uid).execute();
   12	    const resumes = await db.selectFrom("resumes").select(["id","title","atsScore","updatedAt"]).where("userId","=",uid).orderBy("updatedAt","desc").limit(3).execute();
   13	    const interviews = await db.selectFrom("mockInterviews").select(["id","targetRole","overallScore","status","updatedAt"]).where("userId","=",uid).orderBy("updatedAt","desc").limit(3).execute();
   14	    const assessment = await db.selectFrom("skillAssessments").selectAll().where("userId","=",uid).orderBy("updatedAt","desc").executeTakeFirst();
   15	    const unread = await db.selectFrom("notifications").select("id").where("userId","=",uid).where("isRead","=",false).execute();
   16	    const saved = applications.filter(a=>a.status==="saved").length;
   17	    const applied = applications.filter(a=>a.status==="applied").length + recruiterApplications.filter(a=>a.status!=="received").length;
   18	    const interviewsCount = applications.filter(a=>a.status==="interview").length + recruiterApplications.filter(a=>a.status==="interview").length;
   19	    const offers = applications.filter(a=>a.status==="offer").length + recruiterApplications.filter(a=>a.status==="selected").length;
   20	    const readiness = assessment?.readinessScore ?? Math.min(100, Math.round((Number(profile?.profileCompletion||0)*0.45)+(resumes[0]?.atsScore||0)*0.25+(interviews[0]?.overallScore||0)*0.3));
   21	    return new Response(superjson.stringify({
   22	      user:{displayName:user.displayName,email:user.email},
   23	      profile,
   24	      stats:{profileCompletion:Number(profile?.profileCompletion||0),readiness:Number(readiness||0),applications:applications.length+recruiterApplications.length,applied,interviews:interviewsCount,offers,saved,unread:Number(unread.length),skills:(profile?.skills||[]).length},
   25	      resumes,interviews,assessment,
   26	      recentApplications: applications.slice(-5).reverse()
   27	    }),{headers:{"Content-Type":"application/json"}});
   28	  } catch(e) {
   29	    // Do not log user-linked dashboard data.
   30	    return new Response(superjson.stringify({error:"Unable to load dashboard"}),{status:401,headers:{"Content-Type":"application/json"}});
   31	  }
   32	}
   33