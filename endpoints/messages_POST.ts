import superjson from "superjson";
import { schema } from "./messages_POST.schema";
import { db } from "../helpers/db";
import { getServerUserSession } from "../helpers/getServerUserSession";
import { publish } from "@floot/realtime";
import { channels } from "../helpers/realtimeChannels";

export async function handle(request: Request) {
  try {
   10	    const { user } = await getServerUserSession(request);
   11	    const b = schema.parse(superjson.parse(await request.text()));
   12	    if (String(user.id) === b.recipientUserId) {
   13	      return new Response(superjson.stringify({ error: "You cannot send a message to yourself." }), { status: 400, headers: { "Content-Type": "application/json" } });
   14	    }
   15	    const recipient = await db.selectFrom("users").select(["id", "displayName"])
   16	      .where("id", "=", Number(b.recipientUserId)).executeTakeFirstOrThrow();
   17	    if (b.recruiterJobId) {
   18	      const job = await db.selectFrom("recruiterJobs").select(["id", "companyId"]).where("id", "=", b.recruiterJobId).executeTakeFirst();
   19	      if (!job) return new Response(superjson.stringify({ error: "The linked opportunity was not found." }), { status: 404, headers: { "Content-Type": "application/json" } });
   20	      const company = await db.selectFrom("companyProfiles").select("userId").where("id", "=", String(job.companyId)).executeTakeFirst();
   21	      const senderOwnsJob = company && String(company.userId) === String(user.id);
   22	      const recipientOwnsJob = company && String(company.userId) === String(recipient.id);
   23	      const senderApplied = await db.selectFrom("recruiterApplications").select("id").where("recruiterJobId", "=", String(job.id)).where("studentUserId", "=", String(user.id)).executeTakeFirst();
   24	      const recipientApplied = await db.selectFrom("recruiterApplications").select("id").where("recruiterJobId", "=", String(job.id)).where("studentUserId", "=", String(recipient.id)).executeTakeFirst();
   25	      if (!(senderOwnsJob && recipientApplied) && !(recipientOwnsJob && senderApplied)) {
   26	        return new Response(superjson.stringify({ error: "Messages linked to an opportunity are only available to its recruiter and an applicant." }), { status: 403, headers: { "Content-Type": "application/json" } });
   27	      }
   28	    }
   29	
   30	    const message = await db.insertInto("messages").values({
   31	      senderUserId: String(user.id),
   32	      recipientUserId: String(recipient.id),
   33	      subject: b.subject || null,
   34	      body: b.body,
   35	      recruiterJobId: b.recruiterJobId || null,
   36	      createdAt: new Date(),
   37	      readAt: null,
   38	    }).returningAll().executeTakeFirstOrThrow();
   39	
   40	    await db.insertInto("notifications").values({
   41	      userId: String(recipient.id),
   42	      title: "New HerSphere message",
   43	      message: "You received a new message.",
   44	      type: "message",
   45	      link: "/messages",
   46	      isRead: false,
   47	    }).execute();
   48	
   49	    await publish(channels.user(String(recipient.id)), { type: "message.created", message });
   50	    return new Response(superjson.stringify({ message }), { headers: { "Content-Type": "application/json" } });
   51	  } catch (e) {
   52	    // Message payloads can contain personal data; do not log the error object.
   53	    return new Response(superjson.stringify({ error: "Could not send message" }), { status: 400, headers: { "Content-Type": "application/json" } });
   54	  }
   55	}
   56