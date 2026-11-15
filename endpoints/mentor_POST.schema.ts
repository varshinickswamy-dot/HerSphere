import {z} from "zod";
import superjson from "superjson";
export const schema=z.object({
 message:z.string().min(1).max(4000),
 history:z.array(z.object({role:z.enum(["user","assistant"]),text:z.string().max(6000)})).max(20).optional().default([])
});
export type OutputType={reply:string;mode:"ai"|"demo"|"unavailable"};
export const postMentor=async(body:z.infer<typeof schema>,init?:RequestInit):Promise<OutputType>=>{
 const r=await fetch("/_api/mentor",{method:"POST",body:superjson.stringify(schema.parse(body)),...init,headers:{"Content-Type":"application/json",...(init?.headers??{})},credentials:"include"});