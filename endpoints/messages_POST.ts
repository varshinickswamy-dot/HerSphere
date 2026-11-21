import superjson from "superjson";
import { ZodError } from "zod";
import { NotAuthenticatedError } from "../helpers/getSetServerSession";
import { schema } from "./messages_POST.schema";
import { db } from "../helpers/db";
import { getServerUserSession } from "../helpers/getServerUserSession";
import { publish } from "@floot/realtime";
import { channels } from "../helpers/realtimeChannels";
import { sql } from "kysely";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const b = schema.parse(superjson.parse(await request.text()));
    if (String(user.id) === b.recipientUserId) {
      return new Response(superjson.stringify({ error: "You cannot send a message to yourself." }), { status: 400, headers: { "Content-Type": "application/json" } });
    }
    const recipient = await db.selectFrom("users").select(["id", "displayName"])
      .where("id", "=", Number(b.recipientUserId)).executeTakeFirst();
    if (!recipient) return new Response(superjson.stringify({ error: "Recipient account not found." }), { status: 404, headers: { "Content-Type": "application/json" } });
    const blocked = await db.selectFrom("messageBlocks").select("id").where((eb) => eb.or([
      eb.and([eb("blockerUserId", "=", String(user.id)), eb("blockedUserId", "=", String(recipient.id))]),
      eb.and([eb("blockerUserId", "=", String(recipient.id)), eb("blockedUserId", "=", String(user.id))]),
    ])).executeTakeFirst();
    if (blocked) return new Response(superjson.stringify({ error: "Messaging is unavailable for this conversation." }), { status: 403, headers: { "Content-Type": "application/json" } });
    if (b.recruiterJobId) {
      const job = await db.selectFrom("recruiterJobs").select(["id", "companyId"]).where("id", "=", b.recruiterJobId).executeTakeFirst();
      if (!job) return new Response(superjson.stringify({ error: "The linked opportunity was not found." }), { status: 404, headers: { "Content-Type": "application/json" } });
      const company = await db.selectFrom("companyProfiles").select("userId").where("id", "=", String(job.companyId)).executeTakeFirst();
      const senderOwnsJob = company && String(company.userId) === String(user.id);
      const recipientOwnsJob = company && String(company.userId) === String(recipient.id);
      const senderApplied = await db.selectFrom("recruiterApplications").select("id").where("recruiterJobId", "=", String(job.id)).where("studentUserId", "=", String(user.id)).executeTakeFirst();
      const recipientApplied = await db.selectFrom("recruiterApplications").select("id").where("recruiterJobId", "=", String(job.id)).where("studentUserId", "=", String(recipient.id)).executeTakeFirst();
      if (!(senderOwnsJob && recipientApplied) && !(recipientOwnsJob && senderApplied)) {
        return new Response(superjson.stringify({ error: "Messages linked to an opportunity are only available to its recruiter and an applicant." }), { status: 403, headers: { "Content-Type": "application/json" } });
      }
    }

    const messageResult = await db.transaction().execute(async (trx) => {
      // Limit bursts per sender and serialize concurrent sends from the same account.
      await sql`SELECT pg_advisory_xact_lock(hashtextextended(${"message-send:" + String(user.id)}, 0))`.execute(trx);
      const recent = await trx.selectFrom("messages").select(trx.fn.countAll<number>().as("count"))
        .where("senderUserId", "=", String(user.id))
        .where("createdAt", ">", new Date(Date.now() - 60_000)).executeTakeFirst();
      if (Number(recent?.count || 0) >= 10) return { limited: true as const };
      const message = await trx.insertInto("messages").values({
        senderUserId: String(user.id), recipientUserId: String(recipient.id),
        subject: b.subject || null, body: b.body, recruiterJobId: b.recruiterJobId || null,
        createdAt: new Date(), readAt: null,
      }).returningAll().executeTakeFirstOrThrow();
      return { limited: false as const, message };
    });
    if (messageResult.limited) {
      return new Response(superjson.stringify({ error: "You have sent several messages recently. Please wait a minute before sending another." }), { status: 429, headers: { "Content-Type": "application/json", "Retry-After": "60" } });
    }
    const message = messageResult.message;

    await db.insertInto("notifications").values({
      userId: String(recipient.id),
      title: "New HerSphere message",
      message: "You received a new message.",
      type: "message",
      link: "/messages",
      isRead: false,
    }).execute();

    await publish(channels.user(String(recipient.id)), { type: "message.created", message });
    return new Response(superjson.stringify({ message }), { headers: { "Content-Type": "application/json" } });
  } catch (error) {
    // Message payloads can contain personal data; do not log the error object.
    if (error instanceof NotAuthenticatedError) {
      return new Response(superjson.stringify({ error: "Not authenticated" }), { status: 401, headers: { "Content-Type": "application/json" } });
    }
    if (error instanceof ZodError || error instanceof SyntaxError || error instanceof TypeError) {
      return new Response(superjson.stringify({ error: "Please check the message details and try again." }), { status: 400, headers: { "Content-Type": "application/json" } });
    }
    return new Response(superjson.stringify({ error: "Could not send message" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
   80