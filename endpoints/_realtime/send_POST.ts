import { publish } from "@floot/realtime";
import { schema } from "./send_POST.schema";
import superjson from "superjson";
import { getServerUserSession } from "../../helpers/getServerUserSession";

// The browser POSTs here and you publish server-side after authorizing the user.
//
// Security: this can publish to any of your app's channels, so authenticate the
// user and check they may publish to the channel before enabling. Ships disabled —
   10	// add your check, then set AUTH_IMPLEMENTED to true.
   11	const json = (data: unknown, status = 200) =>
   12	  new Response(superjson.stringify(data), {
   13	    status,
   14	    headers: { "Content-Type": "application/json" },
   15	  });
   16	
   17	export async function handle(request: Request) {
   18	  try {
   19	    const { user } = await getServerUserSession(request);
   20	    const { channel, data } = schema.parse(superjson.parse(await request.text()));
   21	    const userChannel = "user:" + String(user.id);
   22	    if (channel !== userChannel) return json({ error: "Unauthorized channel" }, 403);
   23	    const result = await publish(channel, data);
   24	    if (!result.ok) return json({ error: result.error.message }, 500);
   25	    return json({ ok: true, delivered: result.delivered });
   26	  } catch {
   27	    return json({ error: "Unauthorized" }, 401);
   28	  }
   29	}
   30