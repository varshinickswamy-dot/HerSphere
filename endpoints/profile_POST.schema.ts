import { z } from "zod";
import superjson from "superjson";
const optionalText = (max: number) => z.preprocess((value) => value == null ? "" : value, z.string().trim().max(max)).optional();
const optionalNumber = (inner: z.ZodTypeAny) => z.preprocess((value) => value == null || value === "" ? undefined : value, inner.optional());
// Social links are optional. Older clients and existing rows may send null;
// normalize those values before validation so profile saves remain backward compatible.
const optionalUrl = z.preprocess((value) => value == null ? "" : value, z.string().trim().url().or(z.literal("")));
export const schema = z.object({
  phone:optionalText(30), location:optionalText(160), college:optionalText(200),
  degree:optionalText(100), branch:optionalText(120), graduationYear:optionalNumber(z.coerce.number().int().min(2020).max(2100)),
  semester:optionalNumber(z.coerce.number().int().min(1).max(12)), languages:z.array(z.string().trim().min(1).max(60)).max(30).default([]),
  cgpa:optionalNumber(z.coerce.number().min(0).max(10)), skills:z.array(z.string().max(80)).max(100).default([]),
  interests:z.array(z.string().max(120)).max(100).default([]), careerGoal:optionalText(1000), preferredRole:optionalText(160),
  preferredLocation:optionalText(160), experienceLevel:z.enum(["student","entry","mid","senior"]).default("student"),
  linkedinUrl:optionalUrl, githubUrl:optionalUrl, portfolioUrl:optionalUrl
});
export type OutputType = { profile: any };
export const postProfile = async (body:z.infer<typeof schema>, init?:RequestInit):Promise<OutputType> => {
  const validatedInput=schema.parse(body);
  const result=await fetch("/_api/profile",{method:"POST",body:superjson.stringify(validatedInput),...init,headers:{"Content-Type":"application/json",...(init?.headers??{})},credentials:"include"});
  if(!result.ok) {
    const raw=await result.text();
    let message="Unable to save your profile. Please check the fields and try again.";
    try {
      const payload=superjson.parse<{error?:string;message?:string}>(raw);
      if(payload?.error||payload?.message) message=payload.error||payload.message||message;
    } catch {
      // Never render raw server validation or stack output in the profile UI.
    }
    throw new Error(message);
  }
  return superjson.parse<OutputType>(await result.text());
};