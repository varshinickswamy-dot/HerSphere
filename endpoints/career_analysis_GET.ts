import superjson from "superjson";
import {db} from "../helpers/db";
import {getServerUserSession} from "../helpers/getServerUserSession";
export async function handle(request:Request){
 try{
  const {user}=await getServerUserSession(request);
  const [assessment,roadmap]=await Promise.all([
   db.selectFrom("skillAssessments").selectAll().where("userId","=",String(user.id)).executeTakeFirst(),
   db.selectFrom("careerRoadmaps").selectAll().where("userId","=",String(user.id)).executeTakeFirst()
   10	  ]);
   11	  return new Response(superjson.stringify({assessment:assessment??null,roadmap:roadmap??null}),{headers:{"Content-Type":"application/json"}});
   12	 }catch(e){return new Response(superjson.stringify({error:"Not authenticated"}),{status:401,headers:{"Content-Type":"application/json"}})}
   13	}