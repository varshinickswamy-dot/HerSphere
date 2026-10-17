import { createToken } from "@floot/realtime";
import superjson from "superjson";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { channels } from "../../helpers/realtimeChannels";

const json = (data: unknown, status = 200) =>
  new Response(superjson.stringify(data), { status, headers: { "Content-Type": "application/json" } });

export async function handle(request: Request) {
   10	  try {
   11	    const { user } = await getServerUserSession(request);
   12	    const userId = String(user.id);
   13	    const grants = [channels.user(userId),channels.marketplace()];
   14	    const result = await createToken({ userId, channels: grants, ttlSeconds: 3600 });
   15	    if (!result.ok) return json({ error: result.error.message }, 500);
   16	    return json({ token: result.token, wssEndpoint: result.wssEndpoint, userId });
   17	  } catch {
   18	    return json({ error: "Unauthorized" }, 401);
   19	  }
   20	}
   21