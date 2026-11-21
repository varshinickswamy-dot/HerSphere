import superjson from "superjson";
import { db } from "../helpers/db";
import { getServerUserSession } from "../helpers/getServerUserSession";
import { NotAuthenticatedError } from "../helpers/getSetServerSession";

const json = (body: unknown, status = 200) => new Response(superjson.stringify(body), { status, headers: { "Content-Type": "application/json" } });

export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const rows = await db.selectFrom("messageBlocks as b")
      .innerJoin("users as u", "u.id", "b.blockedUserId")
      .select(["u.id", "u.displayName", "u.role", "b.createdAt"])
      .where("b.blockerUserId", "=", String(user.id))
      .orderBy("b.createdAt", "desc")
      .limit(100)
      .execute();
    return json({ contacts: rows.map(row => ({ id: String(row.id), displayName: row.displayName, role: row.role, createdAt: row.createdAt })) });
  } catch (error) {
    if (error instanceof NotAuthenticatedError) return json({ error: "Not authenticated" }, 401);
    return json({ error: "Could not load blocked contacts." }, 500);
  }
}