import { z } from "zod";
import superjson from "superjson";
export const schema = z.object({
  phone:z.string().max(30).optional(), location:z.string().max(160).optional(), college:z.string().max(200).optional(),
  degree:z.string().max(100).optional(), branch:z.string().max(120).optional(), graduationYear:z.coerce.number().int().min(2020).max(2100).optional(),
  semester:z.coerce.number().int().min(1).max(12).optional(), languages:z.array(z.string().trim().min(1).max(60)).max(30).default([]),
  cgpa:z.coerce.number().min(0).max(10).optional(), skills:z.array(z.string().max(80)).max(100).default([]),
  interests:z.array(z.string().max(120)).max(100).default([]), careerGoal:z.string().max(1000).optional(), preferredRole:z.string().max(160).optional(),
  preferredLocation:z.string().max(160).optional(), experienceLevel:z.enum(["student","entry","mid","senior"]).default("student"),
   10	  linkedinUrl:z.string().url().or(z.literal("")).optional(), githubUrl:z.string().url().or(z.literal("")).optional(),
   11	  portfolioUrl:z.string().url().or(z.literal("")).optional()
   12	});
   13	export type OutputType = { profile: any };
   14	export const postProfile = async (body:z.infer<typeof schema>, init?:RequestInit):Promise<OutputType> => {
   15	  const validatedInput=schema.parse(body);
   16	  const result=await fetch("/_api/profile",{method:"POST",body:superjson.stringify(validatedInput),...init,headers:{"Content-Type":"application/json",...(init?.headers??{})},credentials:"include"});
   17	  if(!result.ok) throw new Error((await result.text())||"Unable to save profile");
   18	  return superjson.parse<OutputType>(await result.text());
   19	};