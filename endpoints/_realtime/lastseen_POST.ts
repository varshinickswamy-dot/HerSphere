import { lastSeen } from "@floot/realtime";
import { schema } from "./lastseen_POST.schema";
import superjson from "superjson";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { NotAuthenticatedError } from "../../helpers/getSetServerSession";
import { ZodError } from "zod";

// The browser POSTs { channel, userIds } and gets back { lastSeen: { userId: ts } }
// for the offline users it's rendering. Fetch on demand for a bounded set and cache
// it (last-seen changes slowly). An absent userId means online now, or last seen
// beyond the retention window.
//
// Security: last-seen reveals who was active when, so only return it to a user who
// may see this channel's roster. Ships disabled — add your check, then set
// AUTH_IMPLEMENTED to true.
const json = (data: unknown, status = 200) =>
  new Response(superjson.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export async function handle(request: Request) {
  try {
    await getServerUserSession(request);
    const { channel, userIds } = schema.parse(superjson.parse(await request.text()));
    if (!channel.startsWith("__presence:") && !channel.startsWith("__presence_of:") && !channel.startsWith("__presence_batch_of:")) {
      return json({ error: "Unauthorized channel" }, 403);
    }
    if (userIds.length > 100) return json({ error: "Too many userIds" }, 400);
    const result = await lastSeen(channel, userIds);
    if (!result.ok) return json({ error: "Presence information could not be retrieved" }, 500);
    return json({ lastSeen: result.lastSeen });
  } catch (error) {
    if (error instanceof NotAuthenticatedError) return json({ error: "Unauthorized" }, 401);
    if (error instanceof ZodError || error instanceof SyntaxError || error instanceof TypeError) {
      return json({ error: "Invalid presence request" }, 400);
    }
    return json({ error: "Presence information could not be retrieved" }, 500);
  }
}
