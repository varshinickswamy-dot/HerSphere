import superjson from "superjson";
import { ZodError } from "zod";
import { schema } from "./events_POST.schema";
import { db } from "../helpers/db";
import { getServerUserSession } from "../helpers/getServerUserSession";
import { NotAuthenticatedError } from "../helpers/getSetServerSession";
import { publishUserEvent } from "../helpers/realtimePublish";

const jsonResponse = (body: unknown, status = 200) => new Response(
  superjson.stringify(body),
  { status, headers: { "Content-Type": "application/json" } },
);

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const body = schema.parse(superjson.parse(await request.text()));
    const event = await db.selectFrom("events").select(["id", "capacity"])
      .where("id", "=", body.eventId).executeTakeFirst();

    if (!event) return jsonResponse({ error: "Event not found" }, 404);

    const existing = await db.selectFrom("eventRegistrations").select("id")
      .where("eventId", "=", body.eventId)
      .where("userId", "=", String(user.id)).executeTakeFirst();

    if (existing) {
      await db.deleteFrom("eventRegistrations").where("id", "=", existing.id).execute();
      await publishUserEvent(user.id, "event.registration_changed", {
        eventId: body.eventId, registered: false,
      });
      return jsonResponse({ ok: true, registered: false });
    }

    if (event.capacity) {
      const count = await db.selectFrom("eventRegistrations")
        .select(({ fn }) => fn.countAll<number>().as("count"))
        .where("eventId", "=", body.eventId).executeTakeFirst();
      if (Number(count?.count || 0) >= event.capacity) {
        return jsonResponse({ error: "This event is full" }, 409);
      }
    }

    await db.insertInto("eventRegistrations").values({
      eventId: body.eventId,
      userId: String(user.id),
      createdAt: new Date(),
    }).execute();
    await publishUserEvent(user.id, "event.registration_changed", {
      eventId: body.eventId, registered: true,
    });
    return jsonResponse({ ok: true, registered: true });
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
