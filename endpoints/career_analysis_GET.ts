import superjson from "superjson";
import {db} from "../helpers/db";
import {getServerUserSession} from "../helpers/getServerUserSession";
export async function handle(request:Request){
 try{
  const {user}=await getServerUserSession(request);
  const [assessment,roadmap]=await Promise.all([
   db.selectFrom("skillAssessments").selectAll().where("userId","=",String(user.id)).executeTakeFirst(),
   db.selectFrom("careerRoadmaps").selectAll().where("userId","=",String(user.id)).executeTakeFirst()