import { z } from "zod";
import superjson from "superjson";

export const schema = z.object({
  channel: z.string(),
  data: z.unknown(),
});

export type InputType = z.infer<typeof schema>;