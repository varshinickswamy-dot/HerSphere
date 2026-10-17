import { z } from "zod";
import superjson from "superjson";

export const schema = z.object({});

export type InputType = z.infer<typeof schema>;

export type OutputType =
  | { token: string; wssEndpoint: string; userId: string }
   10	  | { error: string };
   11	
   12	export const postRealtimeToken = async (
   13	  body: InputType = {},
   14	  init?: RequestInit,
   15	): Promise<OutputType> => {
   16	  const validatedInput = schema.parse(body);
   17	  const result = await fetch(`/_api/_realtime/token`, {
   18	    method: "POST",
   19	    body: superjson.stringify(validatedInput),
   20	    ...init,
   21	    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
   22	  });
   23	  return superjson.parse<OutputType>(await result.text());
   24	};
   25