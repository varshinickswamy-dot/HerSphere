import { z } from "zod";
import superjson from "superjson";
import { db } from "../helpers/db";
import { getServerUserSession } from "../helpers/getServerUserSession";
import { NotAuthenticatedError } from "../helpers/getSetServerSession";
import { schema } from "./profile_POST.schema";
export async function handle(request:Request){
  try{
    const {user}=await getServerUserSession(request);
   10	    const input=schema.parse(superjson.parse(await request.text()));
   11	    // Completion is based on actual profile values, not the number of keys sent by the form.
   12	    const completionFields = [
   13	      Boolean(input.location?.trim()), Boolean(input.college?.trim()), Boolean(input.degree?.trim()),
   14	      Boolean(input.branch?.trim()), Boolean(input.semester), Boolean(input.graduationYear),
   15	      input.skills.length > 0, input.interests.length > 0, Boolean(input.careerGoal?.trim()),
   16	      Boolean(input.preferredRole?.trim()), Boolean(input.preferredLocation?.trim()),
   17	      Boolean(input.experienceLevel), input.languages.length > 0,
   18	    ];
   19	    const completion=Math.round((completionFields.filter(Boolean).length/completionFields.length)*100);
   20	    const profile=await db.insertInto("studentProfiles").values({
   21	      userId:user.id, role:"student", phone:input.phone??null, location:input.location??null, college:input.college??null,
   22	      degree:input.degree??null, branch:input.branch??null, semester:input.semester??null, languages:input.languages, graduationYear:input.graduationYear??null, cgpa:input.cgpa??null,
   23	      skills:input.skills, interests:input.interests, careerGoal:input.careerGoal??null, preferredRole:input.preferredRole??null,
   24	      preferredLocation:input.preferredLocation??null, experienceLevel:input.experienceLevel, linkedinUrl:input.linkedinUrl||null,
   25	      githubUrl:input.githubUrl||null, portfolioUrl:input.portfolioUrl||null, profileCompletion:completion
   26	    }).onConflict(oc=>oc.column("userId").doUpdateSet({
   27	      phone:input.phone??null,location:input.location??null,college:input.college??null,degree:input.degree??null,branch:input.branch??null,
   28	      semester:input.semester??null,languages:input.languages,graduationYear:input.graduationYear??null,cgpa:input.cgpa??null,skills:input.skills,interests:input.interests,careerGoal:input.careerGoal??null,
   29	      preferredRole:input.preferredRole??null,preferredLocation:input.preferredLocation??null,experienceLevel:input.experienceLevel,
   30	      linkedinUrl:input.linkedinUrl||null,githubUrl:input.githubUrl||null,portfolioUrl:input.portfolioUrl||null,profileCompletion:completion,updatedAt:new Date()
   31	    })).returningAll().executeTakeFirstOrThrow();
   32	    return new Response(superjson.stringify({profile}),{headers:{"Content-Type":"application/json"}});
   33	  }catch(error){
   34	    // Do not log profile payloads or user-linked data.
   35	    const status = error instanceof NotAuthenticatedError ? 401 : error instanceof z.ZodError ? 400 : 500;
   36	    const message = status === 401 ? "Not authenticated" : status === 400 ? "Please check the profile fields and try again" : "Unable to save profile";
   37	    return new Response(superjson.stringify({error:message}),{status,headers:{"Content-Type":"application/json"}});
   38	  }
   39	}