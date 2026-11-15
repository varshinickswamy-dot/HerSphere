import { z } from "zod";
import superjson from "superjson";
import { db } from "../helpers/db";
import { getServerUserSession } from "../helpers/getServerUserSession";
import { NotAuthenticatedError } from "../helpers/getSetServerSession";
import { schema } from "./profile_POST.schema";
export async function handle(request:Request){
  try{
    const {user}=await getServerUserSession(request);
    const input=schema.parse(superjson.parse(await request.text()));
    // Completion is based on actual profile values, not the number of keys sent by the form.
    const completionFields = [
      Boolean(input.location?.trim()), Boolean(input.college?.trim()), Boolean(input.degree?.trim()),
      Boolean(input.branch?.trim()), Boolean(input.semester), Boolean(input.graduationYear),
      input.skills.length > 0, input.interests.length > 0, Boolean(input.careerGoal?.trim()),
      Boolean(input.preferredRole?.trim()), Boolean(input.preferredLocation?.trim()),
      Boolean(input.experienceLevel), input.languages.length > 0,
    ];
    const completion=Math.round((completionFields.filter(Boolean).length/completionFields.length)*100);
    const profile=await db.insertInto("studentProfiles").values({
      userId:user.id, role:"student", phone:input.phone??null, location:input.location??null, college:input.college??null,
      degree:input.degree??null, branch:input.branch??null, semester:input.semester??null, languages:input.languages, graduationYear:input.graduationYear??null, cgpa:input.cgpa??null,
      skills:input.skills, interests:input.interests, careerGoal:input.careerGoal??null, preferredRole:input.preferredRole??null,
      preferredLocation:input.preferredLocation??null, experienceLevel:input.experienceLevel, linkedinUrl:input.linkedinUrl||null,
      githubUrl:input.githubUrl||null, portfolioUrl:input.portfolioUrl||null, profileCompletion:completion
    }).onConflict(oc=>oc.column("userId").doUpdateSet({
      phone:input.phone??null,location:input.location??null,college:input.college??null,degree:input.degree??null,branch:input.branch??null,
      semester:input.semester??null,languages:input.languages,graduationYear:input.graduationYear??null,cgpa:input.cgpa??null,skills:input.skills,interests:input.interests,careerGoal:input.careerGoal??null,
      preferredRole:input.preferredRole??null,preferredLocation:input.preferredLocation??null,experienceLevel:input.experienceLevel,
      linkedinUrl:input.linkedinUrl||null,githubUrl:input.githubUrl||null,portfolioUrl:input.portfolioUrl||null,profileCompletion:completion,updatedAt:new Date()
    })).returningAll().executeTakeFirstOrThrow();
    return new Response(superjson.stringify({profile}),{headers:{"Content-Type":"application/json"}});
  }catch(error){
    // Do not log profile payloads or user-linked data.
    const status = error instanceof NotAuthenticatedError ? 401 : error instanceof z.ZodError ? 400 : 500;
    const message = status === 401 ? "Not authenticated" : status === 400 ? "Please check the profile fields and try again" : "Unable to save profile";
    return new Response(superjson.stringify({error:message}),{status,headers:{"Content-Type":"application/json"}});
  }
}
