import { createToken } from "@floot/realtime";
import superjson from "superjson";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { channels } from "../../helpers/realtimeChannels";
import { NotAuthenticatedError } from "../../helpers/getSetServerSession";

const json = (data: unknown, status = 200) =>
  new Response(superjson.stringify(data), { status, headers: { "Content-Type": "application/json" } });

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const userId = String(user.id);
    const grants = [channels.user(userId),channels.marketplace()];
    const result = await createToken({ userId, channels: grants, ttlSeconds: 3600 });
    if (!result.ok) return json({ error: "Realtime connection could not be created" }, 500);
    return json({ token: result.token, wssEndpoint: result.wssEndpoint, userId });
  } catch (error) {
    if (error instanceof NotAuthenticatedError) return json({ error: "Unauthorized" }, 401);
    return json({ error: "Realtime connection could not be created" }, 500);
  }
}
