import superjson from "superjson";
import { db } from "../helpers/db";
import { getServerUserSession } from "../helpers/getServerUserSession";
import { NotAuthenticatedError } from "../helpers/getSetServerSession";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const events = await db.selectFrom("events").selectAll()
      .where("startsAt", ">=", new Date()).orderBy("startsAt", "asc").limit(50).execute();
    const registrations = await db.selectFrom("eventRegistrations").select("eventId")
      .where("userId", "=", String(user.id)).execute();
    return new Response(superjson.stringify({ events, registeredIds: registrations.map(x => String(x.eventId)) }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const unauthenticated = error instanceof NotAuthenticatedError;
    return new Response(superjson.stringify({ error: unauthenticated ? "Not authenticated" : "Could not load events" }), {
      status: unauthenticated ? 401 : 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
