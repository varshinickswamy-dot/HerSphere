import superjson from "superjson";
import { z, ZodError } from "zod";
import { db } from "../helpers/db";
import { getServerUserSession } from "../helpers/getServerUserSession";
import { NotAuthenticatedError } from "../helpers/getSetServerSession";

const schema = z.object({
  action: z.enum(["block", "unblock", "report"]),
  userId: z.string().regex(/^\d{1,20}$/),
  messageId: z.string().regex(/^\d{1,20}$/).optional(),
  reason: z.enum(["Harassment", "Spam", "Scam or fraud", "Inappropriate content", "Other"]).optional(),
  details: z.string().trim().max(1000).optional(),
});
const json = (body: unknown, status = 200) => new Response(superjson.stringify(body), { status, headers: { "Content-Type": "application/json" } });

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const body = schema.parse(superjson.parse(await request.text()));
    const actorId = String(user.id);
    const targetId = String(Number(body.userId));
    if (actorId === targetId) return json({ error: "You cannot apply this action to your own account." }, 400);
    const target = await db.selectFrom("users").select("id").where("id", "=", Number(targetId)).executeTakeFirst();
    if (!target) return json({ error: "User not found." }, 404);

    if (body.action === "block") {
      await db.insertInto("messageBlocks").values({ blockerUserId: actorId, blockedUserId: targetId }).onConflict((oc) => oc.columns(["blockerUserId", "blockedUserId"]).doNothing()).execute();
      return json({ ok: true, action: "blocked" });
    }
    if (body.action === "unblock") {
      await db.deleteFrom("messageBlocks").where("blockerUserId", "=", actorId).where("blockedUserId", "=", targetId).execute();
      return json({ ok: true, action: "unblocked" });
    }
    if (!body.messageId || !body.reason) return json({ error: "Choose a message and report reason." }, 400);
    const message = await db.selectFrom("messages").select(["id", "senderUserId", "recipientUserId"])
      .where("id", "=", String(Number(body.messageId)))
      .where((eb) => eb.or([
        eb.and([eb("senderUserId", "=", actorId), eb("recipientUserId", "=", targetId)]),
        eb.and([eb("senderUserId", "=", targetId), eb("recipientUserId", "=", actorId)]),
      ])).executeTakeFirst();
    if (!message || String(message.senderUserId) !== targetId) return json({ error: "That message cannot be reported." }, 404);
    const existing = await db.selectFrom("messageReports").select("id").where("reporterUserId", "=", actorId).where("messageId", "=", String(message.id)).executeTakeFirst();
    if (existing) return json({ ok: true, alreadyReported: true });
    await db.insertInto("messageReports").values({ reporterUserId: actorId, reportedUserId: targetId, messageId: String(message.id), reason: body.reason, details: body.details || null, status: "open" }).execute();
    return json({ ok: true });
  } catch (error) {
    if (error instanceof NotAuthenticatedError) return json({ error: "Not authenticated" }, 401);
    if (error instanceof ZodError || error instanceof SyntaxError || error instanceof TypeError) return json({ error: "Please check the safety action details." }, 400);
    return json({ error: "Could not complete the safety action." }, 500);
  }
}