import {z} from "zod";
import superjson from "superjson";
export const schema=z.object({
 message:z.string().min(1).max(4000),
 history:z.array(z.object({role:z.enum(["user","assistant"]),text:z.string().max(6000)})).max(20).optional().default([])
});
export type OutputType={reply:string;mode:"ai"|"demo"|"unavailable";errorCode?:string};
export const postMentor=async(body:z.infer<typeof schema>,init?:RequestInit):Promise<OutputType>=>{
 const r=await fetch("/_api/mentor",{method:"POST",body:superjson.stringify(schema.parse(body)),...init,headers:{"Content-Type":"application/json",...(init?.headers??{})},credentials:"include"});
 const raw=await r.text();
 let payload:OutputType & {error?:string};
 try { payload=superjson.parse<OutputType & {error?:string}>(raw); }
 catch { throw new Error("The Mentor service returned an unreadable response. Please try again."); }
 if(!r.ok && payload.reply) return payload;
 if(!r.ok) throw new Error(payload.error || "The Mentor service is temporarily unavailable. Please try again.");
 return payload;
};