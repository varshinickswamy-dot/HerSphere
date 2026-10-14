import { getServerUserSession } from "../helpers/getServerUserSession";
import { db } from "../helpers/db";
import superjson from "superjson";
export async function handle(request: Request) {
  try {
    const { user } = await getServerUserSession(request);
    const profile = await db.selectFrom("studentProfiles").selectAll().where("userId","=",String(user.id)).executeTakeFirst();
    return new Response(superjson.stringify({ profile: profile ?? null }), { headers: {"Content-Type":"application/json"} });
  } catch (error) {