import {z} from "zod";
import superjson from "superjson";
export const schema=z.object({rating:z.union([z.literal(-1),z.literal(1)]),topic:z.string().max(80).optional()});
export const postMentorFeedback=async(body:z.infer<typeof schema>,init?:RequestInit)=>{
 const r=await fetch("/_api/mentor_feedback",{method:"POST",body:superjson.stringify(schema.parse(body)),...init,headers:{"Content-Type":"application/json",...(init?.headers??{})},credentials:"include"});
 if(!r.ok)throw new Error(r.status===401?"Please sign in again to send feedback.":"Could not save feedback. Please try again.");
 return superjson.parse<{ok:boolean}>(await r.text());
};