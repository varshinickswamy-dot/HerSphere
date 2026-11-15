import superjson from "superjson";
import { schema } from "./messages_POST.schema";
import { db } from "../helpers/db";
import { getServerUserSession } from "../helpers/getServerUserSession";
import { publish } from "@floot/realtime";
import { channels } from "../helpers/realtimeChannels";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const b = schema.parse(superjson.parse(await request.text()));
    if (String(user.id) === b.recipientUserId) {
      return new Response(superjson.stringify({ error: "You cannot send a message to yourself." }), { status: 400, headers: { "Content-Type": "application/json" } });
    }
    const recipient = await db.selectFrom("users").select(["id", "displayName"])
      .where("id", "=", Number(b.recipientUserId)).executeTakeFirstOrThrow();
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

    const message = await db.insertInto("messages").values({
      senderUserId: String(user.id),
      recipientUserId: String(recipient.id),
      subject: b.subject || null,
      body: b.body,
      recruiterJobId: b.recruiterJobId || null,
      createdAt: new Date(),
      readAt: null,
    }).returningAll().executeTakeFirstOrThrow();

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
  } catch (e) {
    // Message payloads can contain personal data; do not log the error object.
    return new Response(superjson.stringify({ error: "Could not send message" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }
}