import superjson from "superjson";
import { db } from "../helpers/db";
import { getServerUserSession } from "../helpers/getServerUserSession";
import { NotAuthenticatedError } from "../helpers/getSetServerSession";
export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const row = await db.selectFrom("studentProfileVisibility").select("isPublic").where("userId", "=", String(user.id)).executeTakeFirst();
    return new Response(superjson.stringify({ isPublic: row?.isPublic ?? false }), { headers: { "Content-Type": "application/json" } });
  } catch (error) {
    const unauthorized = error instanceof NotAuthenticatedError;
    return new Response(superjson.stringify({ error: unauthorized ? "Not authenticated" : "Could not load privacy setting" }), { status: unauthorized ? 401 : 500, headers: { "Content-Type": "application/json" } });
  }
}