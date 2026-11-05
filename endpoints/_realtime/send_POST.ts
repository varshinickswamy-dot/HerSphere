import { publish } from "@floot/realtime";
import { schema } from "./send_POST.schema";
import superjson from "superjson";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { NotAuthenticatedError } from "../../helpers/getSetServerSession";
import { ZodError } from "zod";

// The browser POSTs here and you publish server-side after authorizing the user.
//
// Security: this can publish to any of your app's channels, so authenticate the
// user and check they may publish to the channel before enabling. Ships disabled —
// add your check, then set AUTH_IMPLEMENTED to true.
const json = (data: unknown, status = 200) =>
  new Response(superjson.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const { channel, data } = schema.parse(superjson.parse(await request.text()));
    const userChannel = "user:" + String(user.id);
    if (channel !== userChannel) return json({ error: "Unauthorized channel" }, 403);
    const result = await publish(channel, data);
    if (!result.ok) return json({ error: "Realtime message could not be sent" }, 500);
    return json({ ok: true, delivered: result.delivered });
  } catch (error) {
    if (error instanceof NotAuthenticatedError) return json({ error: "Unauthorized" }, 401);
    if (error instanceof ZodError || error instanceof SyntaxError || error instanceof TypeError) {
      return json({ error: "Invalid realtime request" }, 400);
    }
    return json({ error: "Realtime message could not be sent" }, 500);
  }
}
