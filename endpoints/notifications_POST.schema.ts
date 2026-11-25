import superjson from "superjson";
import { z } from "zod";
export const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("read"), id: z.string().trim().min(1).max(30).regex(/^\d+$/) }),
  z.object({ action: z.literal("readAll") }),
]);
export type OutputType = { success: boolean };
export const updateNotifications=async(body:z.infer<typeof schema>,init?:RequestInit):Promise<OutputType>=>{const r=await fetch("/_api/notifications",{method:"POST",body:superjson.stringify(schema.parse(body)),...init,headers:{"Content-Type":"application/json",...(init?.headers??{})},credentials:"include"});if(!r.ok)throw new Error("Could not update notifications");return superjson.parse<OutputType>(await r.text())};