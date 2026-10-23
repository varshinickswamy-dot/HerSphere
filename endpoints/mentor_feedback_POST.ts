import superjson from "superjson";
import {schema} from "./mentor_feedback_POST.schema";
import {db} from "../helpers/db";
import {getServerUserSession} from "../helpers/getServerUserSession";
import {NotAuthenticatedError} from "../helpers/getSetServerSession";
import {ZodError} from "zod";
export async function handle(request:Request){
 try{
  const {user}=await getServerUserSession(request);
  const input=schema.parse(superjson.parse(await request.text()));
  await db.insertInto("mentorFeedback").values({userId:String(user.id),rating:input.rating,topic:input.topic||"mentor-response"}).execute();
  return new Response(superjson.stringify({ok:true}),{headers:{"Content-Type":"application/json"}});
 }catch(error){
  const status=error instanceof NotAuthenticatedError?401:error instanceof ZodError?400:500;
  return new Response(superjson.stringify({error:status===401?"Not authenticated":status===400?"Invalid feedback":"Unable to save mentor feedback"}),{status,headers:{"Content-Type":"application/json"}});
 }
}