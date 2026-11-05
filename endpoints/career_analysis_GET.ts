import superjson from "superjson";
import {db} from "../helpers/db";
import {getServerUserSession} from "../helpers/getServerUserSession";
import {NotAuthenticatedError} from "../helpers/getSetServerSession";
export async function handle(request:Request){
 try{
  const {user}=await getServerUserSession(request);
  const [assessment,roadmap]=await Promise.all([
   db.selectFrom("skillAssessments").selectAll().where("userId","=",String(user.id)).executeTakeFirst(),
   db.selectFrom("careerRoadmaps").selectAll().where("userId","=",String(user.id)).executeTakeFirst()
  ]);
  return new Response(superjson.stringify({assessment:assessment??null,roadmap:roadmap??null}),{headers:{"Content-Type":"application/json"}});
 }catch(e){const unauthenticated=e instanceof NotAuthenticatedError;return new Response(superjson.stringify({error:unauthenticated?"Not authenticated":"Could not load career analysis"}),{status:unauthenticated?401:500,headers:{"Content-Type":"application/json"}})}
}
