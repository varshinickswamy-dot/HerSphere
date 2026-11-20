import superjson from "superjson";
import { ZodError } from "zod";
import { schema } from "./events_POST.schema";
import { db } from "../helpers/db";
import { getServerUserSession } from "../helpers/getServerUserSession";
import { NotAuthenticatedError } from "../helpers/getSetServerSession";
import { publishUserEvent } from "../helpers/realtimePublish";
import { sql } from "kysely";

const jsonResponse = (body: unknown, status = 200) => new Response(
  superjson.stringify(body),
  { status, headers: { "Content-Type": "application/json" } },
);

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const body = schema.parse(superjson.parse(await request.text()));

    const outcome = await db.transaction().execute(async (trx) => {
      // Serialize registrations per event so concurrent requests cannot exceed capacity.
      await sql`SELECT pg_advisory_xact_lock(hashtextextended(${"event-registration:" + body.eventId}, 0))`.execute(trx);
      const event = await trx.selectFrom("events").select(["id", "capacity", "startsAt"])
        .where("id", "=", body.eventId).executeTakeFirst();
      if (!event) return { error: "Event not found", status: 404 as const };
      if (new Date(event.startsAt).getTime() <= Date.now()) return { error: "Registration for this event has closed", status: 409 as const };

      const existing = await trx.selectFrom("eventRegistrations").select("id")
        .where("eventId", "=", body.eventId).where("userId", "=", String(user.id)).executeTakeFirst();
      if (existing) {
        await trx.deleteFrom("eventRegistrations").where("id", "=", existing.id).execute();
        return { registered: false as const };
      }

      if (event.capacity !== null && event.capacity !== undefined) {
        const count = await trx.selectFrom("eventRegistrations")
          .select(({ fn }) => fn.countAll<number>().as("count"))
          .where("eventId", "=", body.eventId).executeTakeFirst();
        if (Number(count?.count || 0) >= event.capacity) return { error: "This event is full", status: 409 as const };
      }

      await trx.insertInto("eventRegistrations").values({
        eventId: body.eventId, userId: String(user.id), createdAt: new Date(),
      }).execute();
      return { registered: true as const };
    });

    if ("error" in outcome) return jsonResponse({ error: outcome.error }, outcome.status);
    await publishUserEvent(user.id, "event.registration_changed", {
      eventId: body.eventId, registered: outcome.registered,
    });
    return jsonResponse({ ok: true, registered: outcome.registered });
  } catch (error) {
    const unauthorized = error instanceof NotAuthenticatedError;
    const invalidInput = error instanceof ZodError || error instanceof SyntaxError;
    return jsonResponse({
      error: unauthorized ? "Not authenticated"
        : invalidInput ? "Please check the event details and try again"
        : "Could not update event registration",
    }, unauthorized ? 401 : invalidInput ? 400 : 500);
  }
}
