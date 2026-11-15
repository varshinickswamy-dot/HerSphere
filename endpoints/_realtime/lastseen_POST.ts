import superjson from "superjson";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { NotAuthenticatedError } from "../../helpers/getSetServerSession";

const json = (data: unknown, status = 200) =>
  new Response(superjson.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export async function handle(request: Request) {
  try {
    await getServerUserSession(request);
    // Fail closed until channel-level roster authorization is implemented.
    // A prefix check alone is insufficient: it would let any signed-in user
    // query activity timestamps for another group's presence channel.
    return json({ error: "Presence lookup is not enabled" }, 403);
  } catch (error) {
    if (error instanceof NotAuthenticatedError) return json({ error: "Unauthorized" }, 401);
    return json({ error: "Presence information could not be retrieved" }, 500);
  }
}
