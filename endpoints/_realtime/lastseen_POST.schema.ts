import { z } from "zod";
import superjson from "superjson";

export const schema = z.object({
  channel: z.string(),
  userIds: z.array(z.string()),
});

export type InputType = z.infer<typeof schema>;
   10	
   11	export type OutputType =
   12	  | { lastSeen: Record<string, number> }
   13	  | { error: string };
   14	
   15	export const postRealtimeLastseen = async (
   16	  body: InputType,
   17	  init?: RequestInit,
   18	): Promise<OutputType> => {
   19	  const validatedInput = schema.parse(body);
   20	  const result = await fetch(`/_api/_realtime/lastseen`, {
   21	    method: "POST",
   22	    body: superjson.stringify(validatedInput),
   23	    ...init,
   24	    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
   25	  });
   26	  return superjson.parse<OutputType>(await result.text());
   27	};
   28