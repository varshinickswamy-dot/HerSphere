import { z } from "zod";
import superjson from "superjson";

export const schema = z.object({
  channel: z.string(),
  userIds: z.array(z.string()),
});

export type InputType = z.infer<typeof schema>;