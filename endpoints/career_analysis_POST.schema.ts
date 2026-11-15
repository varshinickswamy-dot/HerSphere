import {z} from "zod";
import superjson from "superjson";
export const schema=z.object({targetRole:z.string().min(2)});
export type OutputType={assessment:any;roadmap:any};
export const postCareerAnalysis=async(body:z.infer<typeof schema>,init?:RequestInit):Promise<OutputType>=>{
 const r=await fetch("/_api/career_analysis",{method:"POST",body:superjson.stringify(schema.parse(body)),...init,headers:{"Content-Type":"application/json",...(init?.headers??{})},credentials:"include"});
 if(!r.ok) throw new Error((await r.text())||"Unable to analyze career");
 return superjson.parse<OutputType>(await r.text());
};