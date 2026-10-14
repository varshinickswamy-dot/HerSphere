import superjson from "superjson";
import {db} from "../helpers/db";
import {getServerUserSession} from "../helpers/getServerUserSession";import {NotAuthenticatedError} from "../helpers/getSetServerSession";
export async function handle(request:Request){
 try{
  const {user}=await getServerUserSession(request); const uid=String(user.id);
  const rows=await db.selectFrom("savedOpportunities as s")
   .leftJoin("jobs as j","j.id","s.jobId")
   .leftJoin("internships as i","i.id","s.internshipId")