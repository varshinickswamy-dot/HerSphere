import { lastSeen } from "@floot/realtime";
import { schema } from "./lastseen_POST.schema";
import superjson from "superjson";
import { getServerUserSession } from "../../helpers/getServerUserSession";

// The browser POSTs { channel, userIds } and gets back { lastSeen: { userId: ts } }
// for the offline users it's rendering. Fetch on demand for a bounded set and cache
// it (last-seen changes slowly). An absent userId means online now, or last seen
// beyond the retention window.
   10	//
   11	// Security: last-seen reveals who was active when, so only return it to a user who
   12	// may see this channel's roster. Ships disabled — add your check, then set
   13	// AUTH_IMPLEMENTED to true.
   14	const json = (data: unknown, status = 200) =>
   15	  new Response(superjson.stringify(data), {
   16	    status,
   17	    headers: { "Content-Type": "application/json" },
   18	  });
   19	
   20	export async function handle(request: Request) {
   21	  try {
   22	    await getServerUserSession(request);
   23	    const { channel, userIds } = schema.parse(superjson.parse(await request.text()));
   24	    if (!channel.startsWith("__presence:") && !channel.startsWith("__presence_of:") && !channel.startsWith("__presence_batch_of:")) {
   25	      return json({ error: "Unauthorized channel" }, 403);
   26	    }
   27	    if (userIds.length > 100) return json({ error: "Too many userIds" }, 400);
   28	    const result = await lastSeen(channel, userIds);
   29	    if (!result.ok) return json({ error: result.error.message }, 500);
   30	    return json({ lastSeen: result.lastSeen });
   31	  } catch {
   32	    return json({ error: "Unauthorized" }, 401);
   33	  }
   34	}
   35