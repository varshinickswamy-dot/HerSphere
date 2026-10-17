import { z } from "zod";
import superjson from "superjson";

export const schema = z.object({
  channel: z.string(),
  data: z.unknown(),
});

export type InputType = z.infer<typeof schema>;
   10	
   11	export type OutputType = { ok: true; delivered: number } | { error: string };
   12	
   13	export const postRealtimeSend = async (
   14	  body: InputType,
   15	  init?: RequestInit,
   16	): Promise<OutputType> => {
   17	  const validatedInput = schema.parse(body);
   18	  const result = await fetch(`/_api/_realtime/send`, {
   19	    method: "POST",
   20	    body: superjson.stringify(validatedInput),
   21	    ...init,
   22	    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
   23	  });
   24	  return superjson.parse<OutputType>(await result.text());
   25	};
   26