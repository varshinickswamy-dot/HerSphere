import superjson from "superjson";
import { db } from "../helpers/db";
import { getServerUserSession } from "../helpers/getServerUserSession";
import { NotAuthenticatedError } from "../helpers/getSetServerSession";

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const uid = String(user.id);
    const rawPeer = new URL(request.url).searchParams.get("with");
    let query = db
      .selectFrom("messages as m")
      .leftJoin("users as s", "s.id", "m.senderUserId")
      .leftJoin("users as r", "r.id", "m.recipientUserId")
      .select([
        "m.id", "m.subject", "m.body", "m.createdAt", "m.readAt",
        "m.recruiterJobId", "m.senderUserId", "m.recipientUserId",
        "s.displayName as senderName", "r.displayName as recipientName",
      ])
      .where((eb) => eb.or([
        eb("m.senderUserId", "=", uid),
        eb("m.recipientUserId", "=", uid),
      ]));

    if (rawPeer !== null) {
      if (!/^\d{1,20}$/.test(rawPeer) || rawPeer === uid) {
        return new Response(superjson.stringify({ error: "Invalid conversation." }), {
          status: 400, headers: { "Content-Type": "application/json" },
        });
      }
      const peer = String(Number(rawPeer));
      query = query.where((eb) => eb.or([
        eb.and([eb("m.senderUserId", "=", uid), eb("m.recipientUserId", "=", peer)]),
        eb.and([eb("m.senderUserId", "=", peer), eb("m.recipientUserId", "=", uid)]),
      ]));
      await db.updateTable("messages").set({ readAt: new Date() })
        .where("senderUserId", "=", peer)
        .where("recipientUserId", "=", uid)
        .where("readAt", "is", null)
        .execute();
    }

    const [messages, unread] = await Promise.all([
      query.orderBy("m.createdAt", "desc").limit(100).execute(),
      db.selectFrom("messages")
        .select(db.fn.countAll<number>().as("count"))
        .where("recipientUserId", "=", uid)
        .where("readAt", "is", null)
        .executeTakeFirst(),
    ]);
    return new Response(superjson.stringify({
      messages: messages.reverse(),
      unreadCount: Number(unread?.count || 0),
    }), { headers: { "Content-Type": "application/json" } });
  } catch (error) {
    const unauthorized = error instanceof NotAuthenticatedError;
    return new Response(superjson.stringify({
      error: unauthorized ? "Not authenticated" : "Could not load messages",
    }), {
      status: unauthorized ? 401 : 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}